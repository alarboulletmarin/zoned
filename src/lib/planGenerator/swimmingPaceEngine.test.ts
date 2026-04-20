import { describe, expect, test } from "bun:test";

import {
  calculateSwimmingZones,
  estimateCssFrom400And200,
  swimmingSessionTypeToZone,
  formatSwimPace,
  formatSwimPaceRange,
  estimateSwimDuration,
  SWIM_ZONE_INTENSITY_FACTORS,
} from "./swimmingPaceEngine";

describe("calculateSwimmingZones", () => {
  test("derives zones from CSS", () => {
    const zones = calculateSwimmingZones({ cssSecPer100m: 100 });
    expect(zones.fromUserData).toBe(true);
    expect(zones.cssSecPer100m).toBe(100);
    // Z4 straddles CSS by ±2s
    expect(zones.zones.Z4.minSecPer100m).toBe(98);
    expect(zones.zones.Z4.maxSecPer100m).toBe(102);
    // Z1 recovery is 10-20s slower than CSS
    expect(zones.zones.Z1.minSecPer100m).toBe(110);
    expect(zones.zones.Z1.maxSecPer100m).toBe(120);
    // Z6 sprint is 5-10s faster than CSS
    expect(zones.zones.Z6.minSecPer100m).toBe(90);
    expect(zones.zones.Z6.maxSecPer100m).toBe(95);
  });

  test("falls back by difficulty when CSS is missing", () => {
    const zones = calculateSwimmingZones({ difficulty: "beginner" });
    expect(zones.fromUserData).toBe(false);
    expect(zones.cssSecPer100m).toBe(145);
  });

  test("faster end of each zone is less than or equal to slower end", () => {
    const zones = calculateSwimmingZones({ cssSecPer100m: 100 });
    for (const z of ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"] as const) {
      const r = zones.zones[z];
      expect(r.minSecPer100m).toBeLessThanOrEqual(r.maxSecPer100m);
    }
  });
});

describe("estimateCssFrom400And200", () => {
  test("computes CSS from a classic 400+200 test", () => {
    // 400m in 6:00 (360s), 200m in 2:50 (170s) → speed 200/(360-170)=1.0526 m/s → 95s/100m
    expect(estimateCssFrom400And200(360, 170)).toBe(95);
  });

  test("returns 0 when 200 ≥ 400 time (invalid)", () => {
    expect(estimateCssFrom400And200(200, 250)).toBe(0);
    expect(estimateCssFrom400And200(200, 200)).toBe(0);
  });

  test("returns 0 on non-finite input", () => {
    expect(estimateCssFrom400And200(NaN, 170)).toBe(0);
  });
});

describe("swimmingSessionTypeToZone", () => {
  test("maps common types", () => {
    expect(swimmingSessionTypeToZone("recovery")).toBe("Z1");
    expect(swimmingSessionTypeToZone("technique")).toBe("Z1");
    expect(swimmingSessionTypeToZone("endurance")).toBe("Z2");
    expect(swimmingSessionTypeToZone("tempo")).toBe("Z3");
    expect(swimmingSessionTypeToZone("threshold")).toBe("Z4");
    expect(swimmingSessionTypeToZone("vo2max")).toBe("Z5");
    expect(swimmingSessionTypeToZone("sprint")).toBe("Z6");
  });
});

describe("pace formatting", () => {
  test("formats single pace as mm:ss", () => {
    expect(formatSwimPace(95)).toBe("1:35");
    expect(formatSwimPace(60)).toBe("1:00");
    expect(formatSwimPace(125)).toBe("2:05");
  });

  test("formats range with dash", () => {
    expect(
      formatSwimPaceRange({ minSecPer100m: 98, maxSecPer100m: 102 }),
    ).toBe("1:38–1:42");
  });
});

describe("estimateSwimDuration", () => {
  test("1500m at Z2 with CSS 100s/100m ≈ 27.5 min", () => {
    const zones = calculateSwimmingZones({ cssSecPer100m: 100 });
    // Z2 average pace = (105 + 110) / 2 = 107.5s/100m → 1500m → 1612.5s → 26.9min
    const duration = estimateSwimDuration(1500, "Z2", zones);
    expect(duration).toBeGreaterThan(25);
    expect(duration).toBeLessThan(30);
  });

  test("returns 0 for zero distance", () => {
    const zones = calculateSwimmingZones({ cssSecPer100m: 100 });
    expect(estimateSwimDuration(0, "Z2", zones)).toBe(0);
  });
});

describe("SWIM_ZONE_INTENSITY_FACTORS", () => {
  test("monotonically increase with zone", () => {
    const values = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"].map(
      (z) => SWIM_ZONE_INTENSITY_FACTORS[z as keyof typeof SWIM_ZONE_INTENSITY_FACTORS],
    );
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});
