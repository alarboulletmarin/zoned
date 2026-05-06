import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { generateLoop } from "./loop";
import { DISTANCE_TOLERANCE, MAX_ADJUSTMENT_ATTEMPTS } from "../constants";

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

let originalFetch: typeof fetch;
let fetchCalls: string[] = [];

beforeEach(() => {
  originalFetch = globalThis.fetch;
  fetchCalls = [];
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("generateLoop", () => {
  test("returns the trace on first attempt when distance is already in tolerance", async () => {
    // Brouter returns exactly the requested distance → no correction loop.
    globalThis.fetch = (async (url: string) => {
      fetchCalls.push(url);
      return new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const result = await generateLoop({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 42,
    });

    expect(result.attempts).toBe(0);
    expect(result.withinTolerance).toBe(true);
    expect(result.distanceM).toBe(10_000);
    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]).toContain("profile=trekking");
  });

  test("converges within MAX_ADJUSTMENT_ATTEMPTS when first attempt is short", async () => {
    // Pretend Brouter undershoots by 30% on the first call, then returns
    // exactly the target afterwards.
    let call = 0;
    globalThis.fetch = (async () => {
      call += 1;
      const distance = call === 1 ? 7_000 : 10_000;
      return new Response(JSON.stringify(makeBrouterPayload(distance)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

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
    // Always return half the target so the loop hits its budget.
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(makeBrouterPayload(5_000)), {
        status: 200,
      })) as unknown as typeof fetch;

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
    globalThis.fetch = (async (url: string) => {
      fetchCalls.push(url);
      return new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

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
    globalThis.fetch = (async (url: string) => {
      const params = new URL(url).searchParams;
      seenLonlats.push(params.get("lonlats") ?? "");
      return new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

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
});
