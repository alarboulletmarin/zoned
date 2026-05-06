import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { generateLoop } from "./loop";
import { DISTANCE_TOLERANCE, MAX_ADJUSTMENT_ATTEMPTS } from "../constants";
import { __clearPoiCacheForTests } from "../poi/overpass";

// Convert routed-distance assertions into the matching Brouter GeoJSON
// payload. The `factor` lets a test pretend that Brouter returned a route
// shorter or longer than what the algorithm asked for, so we can exercise
// the iterative-correction loop.
function makeBrouterPayload(distanceM: number) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          "track-length": String(Math.round(distanceM)),
          "filtered ascend": "0",
          "total-time": "3600",
        },
        geometry: {
          type: "LineString",
          // Two arbitrary points are enough — the algorithm never inspects
          // the actual coordinates, only the trace metadata.
          coordinates: [
            [2.349, 48.8567, 35],
            [2.36, 48.87, 36],
          ],
        },
      },
    ],
  };
}

/**
 * Stub Overpass to return zero POI so the algorithm immediately falls back
 * to the blind triangulation strategy. Tests in this file exercise that
 * path; POI-aware behaviour is covered separately.
 */
function makeEmptyOverpassPayload() {
  return { elements: [] };
}

interface MockArgs {
  /** Distance returned by every Brouter call. Single number = constant; array = sequence. */
  brouterDistanceM: number | number[];
  brouterCalls?: string[];
}

function mockFetch({ brouterDistanceM, brouterCalls }: MockArgs) {
  let brouterCallIndex = 0;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("overpass")) {
      return new Response(JSON.stringify(makeEmptyOverpassPayload()), {
        status: 200,
      });
    }
    brouterCalls?.push(url);
    const dm = Array.isArray(brouterDistanceM)
      ? brouterDistanceM[Math.min(brouterCallIndex, brouterDistanceM.length - 1)]
      : brouterDistanceM;
    brouterCallIndex += 1;
    return new Response(JSON.stringify(makeBrouterPayload(dm)), { status: 200 });
  }) as unknown as typeof fetch;
}

let originalFetch: typeof fetch;
let fetchCalls: string[] = [];

beforeEach(() => {
  originalFetch = globalThis.fetch;
  fetchCalls = [];
  // Clear the POI cache so each test starts from scratch.
  __clearPoiCacheForTests();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("generateLoop", () => {
  test("returns the trace on first attempt when distance is already in tolerance", async () => {
    mockFetch({ brouterDistanceM: 10_000, brouterCalls: fetchCalls });

    const result = await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 42,
    });

    expect(result.attempts).toBe(0);
    expect(result.withinTolerance).toBe(true);
    expect(result.distanceM).toBe(10_000);
    expect(result.strategy).toBe("triangulation");
    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]).toContain("profile=trekking");
  });

  test("converges within MAX_ADJUSTMENT_ATTEMPTS when first attempt is short", async () => {
    // First call short, then exact.
    mockFetch({ brouterDistanceM: [7_000, 10_000] });

    const result = await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 7,
    });

    expect(result.withinTolerance).toBe(true);
    expect(result.attempts).toBeGreaterThan(0);
    expect(result.attempts).toBeLessThanOrEqual(MAX_ADJUSTMENT_ATTEMPTS);
  });

  test("flags out-of-tolerance when Brouter consistently misses the target", async () => {
    mockFetch({ brouterDistanceM: 5_000 });

    const result = await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1,
    });

    expect(result.attempts).toBe(MAX_ADJUSTMENT_ATTEMPTS);
    const ratio = result.distanceM / 10_000;
    expect(Math.abs(ratio - 1) > DISTANCE_TOLERANCE).toBe(true);
    expect(result.withinTolerance).toBe(false);
  });

  test("uses fastbike profile for cycling", async () => {
    mockFetch({ brouterDistanceM: 10_000, brouterCalls: fetchCalls });

    await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "cycling",
      seed: 1,
    });

    expect(fetchCalls[0]).toContain("profile=fastbike");
  });

  test("seed determinism: same seed produces same waypoints", async () => {
    const seenLonlats: string[] = [];
    function recordingMock(input: string | URL | Request) {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("overpass")) {
        return new Response(JSON.stringify({ elements: [] }), { status: 200 });
      }
      seenLonlats.push(new URL(url).searchParams.get("lonlats") ?? "");
      return new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      });
    }
    globalThis.fetch = (async (input) => recordingMock(input)) as unknown as typeof fetch;

    await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1234,
    });
    const callsForSeed1234 = [...seenLonlats];
    seenLonlats.length = 0;

    await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1234,
    });

    expect(seenLonlats[0]).toBe(callsForSeed1234[0]);
  });

  test("falls back to triangulation when Overpass returns too few POI", async () => {
    mockFetch({ brouterDistanceM: 10_000 });

    const result = await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1,
    });

    expect(result.strategy).toBe("triangulation");
    expect(result.pois).toEqual([]);
  });

  test("different seeds produce different POI selections (multi-candidate diversity)", async () => {
    // Eight POI at distinct bearings, all viable. Without seed-aware
    // selection two consecutive generations would pick the same trio.
    const overpassPayload = {
      elements: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        type: "way" as const,
        center: {
          lat: 48.8567 + Math.cos((i * 45 * Math.PI) / 180) * 0.018,
          lon: 2.349 + Math.sin((i * 45 * Math.PI) / 180) * 0.027,
        },
        tags: { leisure: "park", name: `Parc ${i + 1}` },
      })),
    };

    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("overpass")) {
        return new Response(JSON.stringify(overpassPayload), { status: 200 });
      }
      return new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const sets = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 7, 11, 13, 17, 19]) {
      __clearPoiCacheForTests();
      const result = await generateLoop({
        start: [2.349, 48.8567],
        targetDistanceKm: 10,
        discipline: "running",
        seed,
      });
      sets.add(
        result.pois
          .map((p) => p.name ?? "?")
          .sort()
          .join("|"),
      );
    }
    // At least 3 distinct POI sets among 10 seeds is the contract.
    expect(sets.size).toBeGreaterThanOrEqual(3);
  });

  test("uses POI-aware strategy when Overpass returns enough candidates", async () => {
    // Three POIs spread around the start at roughly the right radius.
    const overpassPayload = {
      elements: [
        { id: 1, type: "way", center: { lat: 48.8612, lon: 2.349 }, tags: { leisure: "park", name: "Parc Nord" } },
        { id: 2, type: "way", center: { lat: 48.8567, lon: 2.36 }, tags: { leisure: "park", name: "Parc Est" } },
        { id: 3, type: "way", center: { lat: 48.852, lon: 2.345 }, tags: { highway: "footway", name: "Promenade Sud" } },
      ],
    };

    let brouterCallCount = 0;
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("overpass")) {
        return new Response(JSON.stringify(overpassPayload), { status: 200 });
      }
      brouterCallCount += 1;
      return new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const result = await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1,
    });

    expect(result.strategy).toBe("poi-aware");
    expect(result.pois.length).toBeGreaterThan(0);
    // Each POI should have a name from the Overpass tags.
    expect(result.pois[0].name).toMatch(/Parc|Promenade/);
    expect(brouterCallCount).toBeGreaterThan(0);
  });
});
