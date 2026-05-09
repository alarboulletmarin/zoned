import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { generateRouteCandidates, routeFromWaypoints } from "./index";
import { __clearPoiCacheForTests } from "./poi/overpass";
import { __clearBrouterCacheForTests } from "./routing";

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
  __clearBrouterCacheForTests();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("generateRouteCandidates", () => {
  test("falls back to best-effort candidates when none match the strict tolerance", async () => {
    // Brouter returns a constant 5 km regardless of input — way off a 10 km
    // request. We still want to return the closest attempts instead of a blank
    // UI, because the caller can explain that the distance is approximate.
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

    expect(candidates.length).toBe(3);
    expect(candidates[0].distanceM).toBe(5_000);
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

describe("routeFromWaypoints", () => {
  test("routes the supplied waypoints and returns a Route", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(makeBrouterPayload(4_321)), { status: 200 })
    ) as unknown as typeof fetch;

    const route = await routeFromWaypoints({
      waypoints: [
        [2.349, 48.8567],
        [2.36, 48.87],
        [2.349, 48.8567],
      ],
      discipline: "running",
      shape: "loop",
      routeId: "abc",
    });

    expect(route.id).toBe("abc");
    expect(route.distanceM).toBe(4_321);
    expect(route.shape).toBe("loop");
    expect(route.points.length).toBeGreaterThanOrEqual(2);
  });

  test("rejects fewer than two waypoints", async () => {
    await expect(
      routeFromWaypoints({
        waypoints: [[2.349, 48.8567]],
        discipline: "running",
        shape: "loop",
      }),
    ).rejects.toThrow();
  });

  test("surfaces Brouter 400 as a BrouterError with status 400", async () => {
    globalThis.fetch = (async () =>
      new Response("Bad Request", { status: 400, statusText: "Bad Request" })
    ) as unknown as typeof fetch;

    const { BrouterError } = await import("./routing");
    let caught: unknown;
    try {
      await routeFromWaypoints({
        waypoints: [
          [7.285337, 43.711698],
          [7.295436, 43.694066],
          [7.285337, 43.711698],
        ],
        discipline: "running",
        shape: "loop",
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(BrouterError);
    expect((caught as InstanceType<typeof BrouterError>).status).toBe(400);
  });
});
