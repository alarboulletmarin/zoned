import { describe, expect, test } from "bun:test";

import { estimateDurationSec } from "./durationEstimate";

describe("estimateDurationSec", () => {
  test("flat 10 km running ≈ 60 minutes (10 km/h baseline)", () => {
    const sec = estimateDurationSec({
      distanceM: 10_000,
      elevationGainM: 0,
      discipline: "running",
    });
    expect(sec).toBe(3_600);
  });

  test("flat 8.4 km running is ≈ 50 minutes, NOT 24", () => {
    // Regression test: Brouter trekking returned ~24 min for 8.4 km, which
    // is 21 km/h. Our estimate must produce a runner-realistic figure.
    const sec = estimateDurationSec({
      distanceM: 8_400,
      elevationGainM: 0,
      discipline: "running",
    });
    expect(sec).toBeGreaterThan(2_700); // > 45 min
    expect(sec).toBeLessThan(3_300); // < 55 min
  });

  test("100 m of elevation adds ~10 minutes for running", () => {
    const flat = estimateDurationSec({
      distanceM: 10_000,
      elevationGainM: 0,
      discipline: "running",
    });
    const hilly = estimateDurationSec({
      distanceM: 10_000,
      elevationGainM: 100,
      discipline: "running",
    });
    expect(hilly - flat).toBe(600); // 100 m × 6 s/m
  });

  test("cycling baseline is 25 km/h", () => {
    const sec = estimateDurationSec({
      distanceM: 25_000,
      elevationGainM: 0,
      discipline: "cycling",
    });
    expect(sec).toBe(3_600);
  });

  test("zero distance returns zero", () => {
    expect(
      estimateDurationSec({ distanceM: 0, elevationGainM: 0, discipline: "running" }),
    ).toBe(0);
  });
});
