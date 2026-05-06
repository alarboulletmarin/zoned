import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { generateOutAndBack } from "./outAndBack";
import { MAX_ADJUSTMENT_ATTEMPTS } from "../constants";

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

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("generateOutAndBack", () => {
  test("uses the supplied bearing verbatim", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      })) as unknown as typeof fetch;

    const result = await generateOutAndBack({
      start: [2.349, 48.8567],
      targetDistanceKm: 10,
      discipline: "running",
      seed: 1,
      bearingDeg: 90,
    });

    expect(result.bearingDeg).toBe(90);
    expect(result.withinTolerance).toBe(true);
  });

  test("falls back to a deterministic bearing derived from the seed", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(makeBrouterPayload(10_000)), {
        status: 200,
      })) as unknown as typeof fetch;

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
    let call = 0;
    globalThis.fetch = (async () => {
      call += 1;
      const distance = call === 1 ? 14_000 : 10_000;
      return new Response(JSON.stringify(makeBrouterPayload(distance)), {
        status: 200,
      });
    }) as unknown as typeof fetch;

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
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(makeBrouterPayload(20_000)), {
        status: 200,
      })) as unknown as typeof fetch;

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
});
