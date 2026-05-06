import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { generateRouteCandidates } from "./index";
import { __clearPoiCacheForTests } from "./poi/overpass";

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

beforeEach(() => {
  originalFetch = globalThis.fetch;
  __clearPoiCacheForTests();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("generateRouteCandidates", () => {
  test("filters out candidates whose distance is far from the target", async () => {
    // Brouter returns a constant 5 km regardless of input — way off a 10 km
    // request. With pre-fix behaviour we'd return 3 hopelessly bad candidates;
    // post-fix we should reject them and end up with a smaller (or empty)
    // list rather than mislead the user with hugely off targets.
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("overpass")) {
        return new Response(JSON.stringify({ elements: [] }), { status: 200 });
      }
      return new Response(JSON.stringify(makeBrouterPayload(5_000)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const candidates = await generateRouteCandidates({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      shape: "loop",
      surface: "mixed",
      seed: 1,
      count: 3,
    });

    // All candidates that survive must be reasonably close to the target —
    // we accept generous slack (±20%) so a one-off bad correction doesn't
    // stop everything, but flagrant misses (50% off) must not pass.
    for (const c of candidates) {
      const ratio = c.distanceM / 10_000;
      expect(Math.abs(ratio - 1)).toBeLessThanOrEqual(0.2);
    }
  });

  test("returns up to count candidates when Brouter converges", async () => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("overpass")) {
        return new Response(JSON.stringify({ elements: [] }), { status: 200 });
      }
      return new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const candidates = await generateRouteCandidates({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      shape: "loop",
      surface: "mixed",
      seed: 1,
      count: 3,
    });

    expect(candidates.length).toBe(3);
    for (const c of candidates) {
      const ratio = c.distanceM / 10_000;
      expect(Math.abs(ratio - 1)).toBeLessThanOrEqual(0.05);
    }
  });
});
