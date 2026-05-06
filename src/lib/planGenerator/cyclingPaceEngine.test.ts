import { describe, expect, test } from "bun:test";

import {
  calculateCyclingZones,
  estimateFtpFrom20Min,
  estimateFtpFromRamp,
  cyclingSessionTypeToZone,
  formatPowerRange,
  formatHrRange,
  COGGAN_ZONE_INTENSITY_FACTORS,
} from "./cyclingPaceEngine";

describe("calculateCyclingZones (power)", () => {
  test("derives Coggan power bands from FTP", () => {
    const zones = calculateCyclingZones({ ftpWatts: 200 });
    expect(zones.fromUserData).toBe(true);
    expect(zones.ftpWatts).toBe(200);
    expect(zones.power).toBeDefined();

    const z2 = zones.power!.Z2;
    expect(z2.minWatts).toBe(112); // 56% × 200
    expect(z2.maxWatts).toBe(150); // 75% × 200

    const z4 = zones.power!.Z4;
    expect(z4.minWatts).toBe(182); // 91% × 200
    expect(z4.maxWatts).toBe(210); // 105% × 200
  });

  test("Z7 has no upper bound", () => {
    const zones = calculateCyclingZones({ ftpWatts: 200 });
    expect(zones.power!.Z7.maxWatts).toBeUndefined();
  });
});

describe("calculateCyclingZones (HR)", () => {
  test("derives Friel HR bands from threshold HR", () => {
    const zones = calculateCyclingZones({ thresholdHr: 170 });
    expect(zones.fromUserData).toBe(true);
    expect(zones.thresholdHr).toBe(170);
    expect(zones.hr).toBeDefined();

    const z4 = zones.hr!.Z4;
    expect(z4.minBpm).toBe(160); // 94% × 170
    expect(z4.maxBpm).toBe(170); // 100% × 170
  });

  test("falls back to difficulty FTP when nothing is provided", () => {
    const zones = calculateCyclingZones({ difficulty: "beginner" });
    expect(zones.fromUserData).toBe(false);
    expect(zones.ftpWatts).toBe(140);
  });

  test("returns both power and HR zones when both inputs are provided", () => {
    const zones = calculateCyclingZones({ ftpWatts: 250, thresholdHr: 180 });
    expect(zones.power).toBeDefined();
    expect(zones.hr).toBeDefined();
  });
});

describe("FTP estimators", () => {
  test("20min → FTP applies 0.95 factor", () => {
    expect(estimateFtpFrom20Min(260)).toBe(247);
  });

  test("ramp → FTP applies 0.75 factor", () => {
    expect(estimateFtpFromRamp(320)).toBe(240);
  });

  test("returns 0 for invalid input", () => {
    expect(estimateFtpFrom20Min(-1)).toBe(0);
    expect(estimateFtpFromRamp(NaN)).toBe(0);
  });
});

describe("cyclingSessionTypeToZone", () => {
  test("maps known session types", () => {
    expect(cyclingSessionTypeToZone("recovery")).toBe("Z1");
    expect(cyclingSessionTypeToZone("endurance")).toBe("Z2");
    expect(cyclingSessionTypeToZone("tempo")).toBe("Z3");
    expect(cyclingSessionTypeToZone("threshold")).toBe("Z4");
    expect(cyclingSessionTypeToZone("vo2max")).toBe("Z5");
    expect(cyclingSessionTypeToZone("speed")).toBe("Z6");
    expect(cyclingSessionTypeToZone("sprint")).toBe("Z7");
  });

  test("defaults unknown types to Z2", () => {
    expect(cyclingSessionTypeToZone("something_new")).toBe("Z2");
  });
});

describe("formatPowerRange / formatHrRange", () => {
  test("renders closed ranges", () => {
    expect(formatPowerRange({ minWatts: 100, maxWatts: 150, minPctFtp: 56, maxPctFtp: 75 }))
      .toBe("100–150 W");
    expect(formatHrRange({ minBpm: 140, maxBpm: 160, minPctThrHr: 82, maxPctThrHr: 94 }))
      .toBe("140–160 bpm");
  });

  test("renders open-ended Z7 ranges", () => {
    expect(formatPowerRange({ minWatts: 300, minPctFtp: 151 })).toBe("300+ W");
    expect(formatHrRange({ minBpm: 200, minPctThrHr: 121 })).toBe("200+ bpm");
  });
});

describe("zone intensity factors", () => {
  test("monotonically increase with zone", () => {
    const values = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"].map(
      (z) => COGGAN_ZONE_INTENSITY_FACTORS[z as keyof typeof COGGAN_ZONE_INTENSITY_FACTORS],
    );
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});
