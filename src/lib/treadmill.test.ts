import { describe, expect, test } from "bun:test";
import { flatToTreadmillKmh, treadmillToFlatKmh } from "./treadmill";

describe("treadmill", () => {
  test("12 km/h at 1 % is 12.36 km/h flat", () => {
    expect(treadmillToFlatKmh(12, 1)).toBeCloseTo(12.36, 10);
  });
  test("inverse direction", () => {
    expect(flatToTreadmillKmh(12.36, 1)).toBeCloseTo(12, 10);
  });
  test("round trip is stable", () => {
    for (const s of [4, 9.5, 12, 25]) for (const i of [0, 0.5, 1, 7.5, 15]) {
      expect(flatToTreadmillKmh(treadmillToFlatKmh(s, i), i)).toBeCloseTo(s, 10);
    }
  });
  test("0 % incline is neutral", () => {
    expect(treadmillToFlatKmh(10, 0)).toBe(10);
    expect(flatToTreadmillKmh(10, 0)).toBe(10);
  });
});
