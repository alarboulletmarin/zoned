import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { generateOutAndBack } from "./outAndBack";
import { MAX_ADJUSTMENT_ATTEMPTS } from "../constants";
import { __clearPoiCacheForTests } from "../poi/overpass";

function makeBrouterPayload(distanceM: number) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          "track-length": String(Math.round(distanceM)),
          "filtered ascend": "10",
          "total-time": "1800",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [2.349, 48.8567, 35],
            [2.36, 48.87, 36],
          ],
        },
      },
    ],
  };
}

interface MockArgs {
  brouterDistanceM: number | number[];
}

/**
 * Default mock: empty Overpass + sequenced Brouter responses. This forces
 * the algorithm into the blind path so existing tests keep verifying
 * convergence behaviour without coupling to POI selection.
 */
function mockFetch({ brouterDistanceM }: MockArgs) {
  let i = 0;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("overpass")) {
      return new Response(JSON.stringify({ elements: [] }), { status: 200 });
    }
    const dm = Array.isArray(brouterDistanceM)
      ? brouterDistanceM[Math.min(i, brouterDistanceM.length - 1)]
      : brouterDistanceM;
    i += 1;
    return new Response(JSON.stringify(makeBrouterPayload(dm)), { status: 200 });
  }) as unknown as typeof fetch;
}

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  __clearPoiCacheForTests();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("generateOutAndBack", () => {
  test("uses the supplied bearing verbatim", async () => {
    mockFetch({ brouterDistanceM: 10_000 });

    const result = await generateOutAndBack({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1,
      bearingDeg: 90,
    });

    expect(result.bearingDeg).toBe(90);
    expect(result.withinTolerance).toBe(true);
    expect(result.strategy).toBe("blind");
  });

  test("falls back to a deterministic bearing derived from the seed", async () => {
    mockFetch({ brouterDistanceM: 10_000 });

    const a = await generateOutAndBack({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 555,
    });
    const b = await generateOutAndBack({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 555,
    });

    expect(a.bearingDeg).toBe(b.bearingDeg);
    expect(a.bearingDeg).toBeGreaterThanOrEqual(0);
    expect(a.bearingDeg).toBeLessThan(360);
  });

  test("converges within budget when first response is too long", async () => {
    mockFetch({ brouterDistanceM: [14_000, 10_000] });

    const result = await generateOutAndBack({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 9,
      bearingDeg: 0,
    });

    expect(result.withinTolerance).toBe(true);
    expect(result.attempts).toBeLessThanOrEqual(MAX_ADJUSTMENT_ATTEMPTS);
  });

  test("flags out-of-tolerance when Brouter never converges", async () => {
    mockFetch({ brouterDistanceM: 20_000 });

    const result = await generateOutAndBack({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 9,
      bearingDeg: 0,
    });

    expect(result.attempts).toBe(MAX_ADJUSTMENT_ATTEMPTS);
    expect(result.withinTolerance).toBe(false);
  });

  test("uses POI-aware strategy when an aligned POI is available", async () => {
    // POI roughly East of the start at ~5 km — matches a 10 km out-and-back
    // with bearing 90°.
    const overpassPayload = {
      elements: [
        {
          id: 7,
          type: "way",
          center: { lat: 48.8567, lon: 2.418 }, // ~5 km east
          tags: { leisure: "park", name: "Parc de l'Est" },
        },
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

    const result = await generateOutAndBack({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1,
      bearingDeg: 90,
    });

    expect(result.strategy).toBe("poi-aware");
    expect(result.pois).toHaveLength(1);
    expect(result.pois[0].name).toBe("Parc de l'Est");
    expect(brouterCallCount).toBeGreaterThan(0);
  });
});
