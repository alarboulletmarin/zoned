import { describe, expect, test } from "bun:test";

import {
  buildElevationProfile,
  computeElevationGainM,
  computeTraceLengthM,
  destinationPoint,
  haversineDistanceM,
} from "./elevation";

describe("haversineDistanceM", () => {
  test("returns 0 for identical points", () => {
    expect(haversineDistanceM([2.349, 48.8567], [2.349, 48.8567])).toBe(0);
  });

  test("Paris ↔ Lyon ≈ 392 km (within ±5 km)", () => {
    const paris: [number, number] = [2.3522, 48.8566];
    const lyon: [number, number] = [4.8357, 45.7640];
    const km = haversineDistanceM(paris, lyon) / 1000;
    expect(km).toBeGreaterThan(387);
    expect(km).toBeLessThan(397);
  });

  test("symmetric (a→b == b→a)", () => {
    const a: [number, number] = [2.349, 48.8567];
    const b: [number, number] = [2.366, 48.871];
    expect(haversineDistanceM(a, b)).toBeCloseTo(haversineDistanceM(b, a), 5);
  });
});

describe("destinationPoint", () => {
  test("0° bearing moves north (latitude increases)", () => {
    const start: [number, number] = [2.349, 48.8567];
    const dest = destinationPoint(start, 1000, 0);
    expect(dest[1]).toBeGreaterThan(start[1]);
    expect(dest[0]).toBeCloseTo(start[0], 3);
  });

  test("90° bearing moves east (longitude increases)", () => {
    const start: [number, number] = [2.349, 48.8567];
    const dest = destinationPoint(start, 1000, 90);
    expect(dest[0]).toBeGreaterThan(start[0]);
    expect(dest[1]).toBeCloseTo(start[1], 2);
  });

  test("returned point is at the requested distance (±10 m on 5 km)", () => {
    const start: [number, number] = [2.349, 48.8567];
    const dest = destinationPoint(start, 5000, 45);
    const measured = haversineDistanceM(start, dest);
    expect(Math.abs(measured - 5000)).toBeLessThanOrEqual(10);
  });
});

describe("buildElevationProfile", () => {
  test("emits cumulative distance and altitude per point", () => {
    const profile = buildElevationProfile([
      [2.349, 48.8567, 35],
      [2.350, 48.8568, 36],
      [2.351, 48.8569, 38],
    ]);
    expect(profile).toHaveLength(3);
    expect(profile[0].distanceM).toBe(0);
    expect(profile[0].altitudeM).toBe(35);
    expect(profile[1].distanceM).toBeGreaterThan(0);
    expect(profile[2].distanceM).toBeGreaterThan(profile[1].distanceM);
  });

  test("skips points without altitude", () => {
    const profile = buildElevationProfile([
      [2.349, 48.8567, 35],
      [2.350, 48.8568],
      [2.351, 48.8569, 38],
    ]);
    expect(profile).toHaveLength(2);
    expect(profile[0].altitudeM).toBe(35);
    expect(profile[1].altitudeM).toBe(38);
  });
});

describe("computeElevationGainM", () => {
  test("sums positive altitude deltas only", () => {
    const gain = computeElevationGainM([
      { distanceM: 0, altitudeM: 100 },
      { distanceM: 100, altitudeM: 110 }, // +10
      { distanceM: 200, altitudeM: 105 }, // -5 (ignored)
      { distanceM: 300, altitudeM: 120 }, // +15
    ]);
    expect(gain).toBe(25);
  });

  test("flat profile returns 0", () => {
    const gain = computeElevationGainM([
      { distanceM: 0, altitudeM: 50 },
      { distanceM: 100, altitudeM: 50 },
      { distanceM: 200, altitudeM: 50 },
    ]);
    expect(gain).toBe(0);
  });
});

describe("computeTraceLengthM", () => {
  test("sums consecutive haversine segments", () => {
    const a: [number, number] = [2.349, 48.8567];
    const b: [number, number] = [2.366, 48.871];
    const direct = haversineDistanceM(a, b);
    const total = computeTraceLengthM([a, b]);
    expect(total).toBeCloseTo(direct, 0);
  });

  test("returns 0 for a single point", () => {
    expect(computeTraceLengthM([[2.349, 48.8567]])).toBe(0);
  });
});
