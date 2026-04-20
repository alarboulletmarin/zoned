import { describe, expect, test } from "bun:test";

import {
  tssFromHoursAndIf,
  bikeTssFromPower,
  bikeTssFromZone,
  swimTssFromPace,
  swimTssFromZone,
  runTssFromZone,
  runTssFromPace,
  crossDisciplineTss,
  equivalentDurationMinForTss,
  tssMatchRatio,
} from "./tss";

describe("tssFromHoursAndIf", () => {
  test("1h at threshold (IF=1.0) = 100 TSS", () => {
    expect(tssFromHoursAndIf(1, 1.0)).toBe(100);
  });

  test("scales with duration", () => {
    expect(tssFromHoursAndIf(2, 1.0)).toBe(200);
    expect(tssFromHoursAndIf(0.5, 1.0)).toBe(50);
  });

  test("scales with IF squared", () => {
    expect(tssFromHoursAndIf(1, 0.5)).toBe(25);
    expect(tssFromHoursAndIf(1, 1.2)).toBe(144);
  });

  test("guards against invalid inputs", () => {
    expect(tssFromHoursAndIf(-1, 1.0)).toBe(0);
    expect(tssFromHoursAndIf(1, 0)).toBe(0);
    expect(tssFromHoursAndIf(NaN, 1.0)).toBe(0);
  });
});

describe("bike TSS", () => {
  test("1h at FTP from power gives 100 TSS", () => {
    expect(
      bikeTssFromPower({ durationMin: 60, normalizedPowerWatts: 200, ftpWatts: 200 }),
    ).toBe(100);
  });

  test("1h at 75% FTP from power gives ~56 TSS", () => {
    expect(
      bikeTssFromPower({ durationMin: 60, normalizedPowerWatts: 150, ftpWatts: 200 }),
    ).toBe(56);
  });

  test("zone-based endurance ride (Z2, 2h) lands in the expected band", () => {
    const tss = bikeTssFromZone(120, "Z2");
    expect(tss).toBeGreaterThan(70); // 2h × 0.65² × 100 ≈ 84.5
    expect(tss).toBeLessThan(100);
  });

  test("returns 0 when FTP is missing", () => {
    expect(
      bikeTssFromPower({ durationMin: 60, normalizedPowerWatts: 200, ftpWatts: 0 }),
    ).toBe(0);
  });
});

describe("swim TSS", () => {
  test("1h at CSS pace gives 100 TSS", () => {
    expect(
      swimTssFromPace({ durationMin: 60, avgPaceSecPer100m: 100, cssSecPer100m: 100 }),
    ).toBe(100);
  });

  test("faster pace → more TSS", () => {
    const atCss = swimTssFromPace({ durationMin: 30, avgPaceSecPer100m: 100, cssSecPer100m: 100 });
    const fasterPace = swimTssFromPace({
      durationMin: 30,
      avgPaceSecPer100m: 90,
      cssSecPer100m: 100,
    });
    expect(fasterPace).toBeGreaterThan(atCss);
  });

  test("zone-based endurance swim (Z2, 45min) lands in the expected band", () => {
    const tss = swimTssFromZone(45, "Z2");
    expect(tss).toBeGreaterThan(40); // 0.75h × 0.80² × 100 = 48
    expect(tss).toBeLessThan(55);
  });
});

describe("run TSS", () => {
  test("1h at Z4 ≈ 100 TSS", () => {
    expect(runTssFromZone(60, 4)).toBe(100);
  });

  test("easy Z2 hour < Z4 hour", () => {
    expect(runTssFromZone(60, 2)).toBeLessThan(runTssFromZone(60, 4));
  });

  test("pace-based ≈ zone-based at threshold", () => {
    const fromPace = runTssFromPace({
      durationMin: 60,
      avgPaceMinPerKm: 4.0,
      thresholdPaceMinPerKm: 4.0,
    });
    expect(fromPace).toBe(100);
  });

  test("faster avg pace than threshold yields IF > 1", () => {
    const tss = runTssFromPace({
      durationMin: 30,
      avgPaceMinPerKm: 3.5,
      thresholdPaceMinPerKm: 4.0,
    });
    // IF = 4.0 / 3.5 ≈ 1.143; 0.5h × 1.143² × 100 ≈ 65.3
    expect(tss).toBeGreaterThan(60);
    expect(tss).toBeLessThan(70);
  });
});

describe("crossDisciplineTss dispatcher", () => {
  test("dispatches to the right per-discipline formula", () => {
    expect(
      crossDisciplineTss({ discipline: "running", durationMin: 60, zone: 4 }),
    ).toBe(runTssFromZone(60, 4));

    expect(
      crossDisciplineTss({ discipline: "cycling", durationMin: 60, zone: "Z4" }),
    ).toBe(bikeTssFromZone(60, "Z4"));

    expect(
      crossDisciplineTss({ discipline: "swimming", durationMin: 45, zone: "Z3" }),
    ).toBe(swimTssFromZone(45, "Z3"));
  });
});

describe("equivalentDurationMinForTss", () => {
  test("round-trips: tss → duration → tss", () => {
    const originalTss = runTssFromZone(60, 2);
    const bikeDuration = equivalentDurationMinForTss({
      targetTss: originalTss,
      discipline: "cycling",
      zone: "Z2",
    });
    // Recomputing bike TSS from that duration should match original within ±1 (rounding).
    const reconstituted = bikeTssFromZone(bikeDuration, "Z2");
    expect(Math.abs(reconstituted - originalTss)).toBeLessThanOrEqual(1);
  });

  test("higher zone needs less duration for the same TSS", () => {
    const easyDuration = equivalentDurationMinForTss({
      targetTss: 60,
      discipline: "cycling",
      zone: "Z2",
    });
    const hardDuration = equivalentDurationMinForTss({
      targetTss: 60,
      discipline: "cycling",
      zone: "Z4",
    });
    expect(hardDuration).toBeLessThan(easyDuration);
  });

  test("returns 0 for invalid target", () => {
    expect(equivalentDurationMinForTss({ targetTss: 0, discipline: "cycling", zone: "Z2" })).toBe(0);
  });
});

describe("tssMatchRatio", () => {
  test("returns candidate/target", () => {
    expect(tssMatchRatio(55, 50)).toBeCloseTo(1.1, 5);
    expect(tssMatchRatio(45, 50)).toBeCloseTo(0.9, 5);
  });

  test("returns 0 for invalid target", () => {
    expect(tssMatchRatio(50, 0)).toBe(0);
  });
});
