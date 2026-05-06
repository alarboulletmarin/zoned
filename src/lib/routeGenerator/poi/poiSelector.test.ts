import { describe, expect, test } from "bun:test";

import {
  angularDistance,
  computeBearing,
  pickFurthestPoiInBearing,
  selectDiverseWaypoints,
} from "./poiSelector";
import type { PoiCandidate } from "./poiTypes";

const START: [number, number] = [2.349, 48.8567];

/** Convert (bearingDeg, distanceM) into a candidate placed at that polar offset. */
function placePoi(
  id: number,
  bearingDeg: number,
  distanceM: number,
  weight = 1,
): PoiCandidate {
  // Quick projection: 1 deg latitude ≈ 111 km, 1 deg longitude depends on lat.
  const latRad = (START[1] * Math.PI) / 180;
  const dLat = (distanceM * Math.cos((bearingDeg * Math.PI) / 180)) / 111_000;
  const dLon =
    (distanceM * Math.sin((bearingDeg * Math.PI) / 180)) /
    (111_000 * Math.cos(latRad));
  return {
    id,
    type: "park",
    point: [START[0] + dLon, START[1] + dLat],
    weight,
  };
}

describe("computeBearing", () => {
  test("0° for due-north destination", () => {
    const bearing = computeBearing([0, 0], [0, 1]);
    expect(bearing).toBeCloseTo(0, 0);
  });

  test("90° for due-east destination", () => {
    const bearing = computeBearing([0, 0], [1, 0]);
    expect(bearing).toBeCloseTo(90, 0);
  });

  test("180° for due-south destination", () => {
    const bearing = computeBearing([0, 0], [0, -1]);
    expect(bearing).toBeCloseTo(180, 0);
  });
});

describe("angularDistance", () => {
  test("returns the smaller of the two arcs", () => {
    expect(angularDistance(10, 350)).toBe(20);
    expect(angularDistance(0, 180)).toBe(180);
    expect(angularDistance(45, 45)).toBe(0);
  });
});

describe("selectDiverseWaypoints", () => {
  test("picks angularly spread waypoints when available", () => {
    const candidates = [
      placePoi(1, 0, 2_000), // north
      placePoi(2, 5, 2_000), // also north — should NOT be picked alongside #1
      placePoi(3, 120, 2_000), // SE
      placePoi(4, 240, 2_000), // SW
    ];

    const picked = selectDiverseWaypoints(START, candidates, 2_000, 3);

    expect(picked).toHaveLength(3);
    const ids = picked.map((p) => p.id).sort();
    // The angular diversity rule should pick one of {1,2}, then 3, then 4.
    expect(ids.includes(3)).toBe(true);
    expect(ids.includes(4)).toBe(true);
    // Both #1 and #2 cannot be picked together — they're <60° apart.
    expect(ids.includes(1) && ids.includes(2)).toBe(false);
  });

  test("falls back to top-scoring entries when diversity is impossible", () => {
    // All candidates clustered north → diversity is unreachable, should
    // still return up to `count` items.
    const candidates = [
      placePoi(1, 0, 2_000, 1),
      placePoi(2, 10, 2_000, 0.9),
      placePoi(3, 20, 2_000, 0.85),
    ];

    const picked = selectDiverseWaypoints(START, candidates, 2_000, 3);

    expect(picked).toHaveLength(3);
  });

  test("returns empty when all candidates score zero (way off target)", () => {
    // Distances are 2x the target → fitness drops to 0.
    const candidates = [
      placePoi(1, 0, 5_000),
      placePoi(2, 120, 5_000),
      placePoi(3, 240, 5_000),
    ];

    const picked = selectDiverseWaypoints(START, candidates, 1_000, 3);
    expect(picked).toHaveLength(0);
  });

  test("prefers higher-weight candidates among equal-distance options", () => {
    const candidates = [
      placePoi(1, 0, 2_000, 0.5),
      placePoi(2, 0, 2_000, 1.0),
    ];

    const picked = selectDiverseWaypoints(START, candidates, 2_000, 1);
    expect(picked[0].id).toBe(2);
  });

  test("different seeds produce different selections when several candidates exist", () => {
    // Eight POI of identical weight, spread around the start. Without a
    // seed-driven jitter the greedy algorithm always picks the same 3 by
    // bearing — that's the bug we're fixing. We test across many seeds and
    // require at least 3 distinct sets to come out, which is statistically
    // robust against unlucky jitter collisions.
    const candidates = Array.from({ length: 8 }, (_, i) =>
      placePoi(i + 1, i * 45, 2_000, 1),
    );

    const seeds = [1, 2, 3, 4, 5, 7, 11, 13, 17, 19];
    const sets = new Set(
      seeds.map((s) =>
        selectDiverseWaypoints(START, candidates, 2_000, 3, s)
          .map((p) => p.id)
          .sort()
          .join(","),
      ),
    );

    expect(sets.size).toBeGreaterThanOrEqual(3);
  });

  test("same seed yields a deterministic selection", () => {
    const candidates = Array.from({ length: 8 }, (_, i) =>
      placePoi(i + 1, i * 45, 2_000, 1),
    );

    const a = selectDiverseWaypoints(START, candidates, 2_000, 3, 42);
    const b = selectDiverseWaypoints(START, candidates, 2_000, 3, 42);

    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });
});

describe("pickFurthestPoiInBearing", () => {
  test("returns the POI inside the bearing slice", () => {
    const candidates = [
      placePoi(1, 90, 5_000), // east — in slice
      placePoi(2, 0, 5_000), // north — out of slice
      placePoi(3, 180, 5_000), // south — out of slice
    ];

    const picked = pickFurthestPoiInBearing(
      START,
      candidates,
      90,
      45,
      3_000,
      7_000,
    );

    expect(picked?.id).toBe(1);
  });

  test("returns null when no POI matches both bearing and distance window", () => {
    const candidates = [
      placePoi(1, 90, 1_000), // too close
      placePoi(2, 90, 9_000), // too far
      placePoi(3, 0, 5_000), // wrong bearing
    ];

    const picked = pickFurthestPoiInBearing(
      START,
      candidates,
      90,
      30,
      3_000,
      7_000,
    );

    expect(picked).toBeNull();
  });

  test("prefers the higher-scoring POI when several match", () => {
    const candidates = [
      placePoi(1, 95, 5_000, 0.5),
      placePoi(2, 90, 5_000, 1.0),
    ];

    const picked = pickFurthestPoiInBearing(
      START,
      candidates,
      90,
      45,
      3_000,
      7_000,
    );

    expect(picked?.id).toBe(2);
  });
});
