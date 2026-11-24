import { describe, expect, test } from "bun:test";
import {
  ENDURANCE_INDEX,
  equivalentRaceMinutes,
  predictRaceMinutes,
  raceVmaFraction,
  sustainableVmaFraction,
  vmaFromRaceTime,
} from "./racePerformance";

describe("racePerformance (Péronnet-Thibault)", () => {
  test("100 % of VMA up to 7 minutes, then a falling share", () => {
    expect(sustainableVmaFraction(5, 6)).toBe(1);
    expect(sustainableVmaFraction(7, 6)).toBe(1);
    expect(sustainableVmaFraction(30, 6)).toBeLessThan(sustainableVmaFraction(15, 6));
    expect(sustainableVmaFraction(240, 6)).toBeLessThan(sustainableVmaFraction(120, 6));
  });

  test("a beginner holds a smaller share than an elite over the same time", () => {
    expect(sustainableVmaFraction(60, ENDURANCE_INDEX.beginner))
      .toBeLessThan(sustainableVmaFraction(60, ENDURANCE_INDEX.elite));
  });

  test("a 10 km/h beginner runs a 5K in about 34 minutes, not 31", () => {
    const minutes = predictRaceMinutes(10, 5, ENDURANCE_INDEX.beginner);
    expect(minutes).toBeGreaterThan(33);
    expect(minutes).toBeLessThan(35);
  });

  test("marathon share sits near 72-80 % of VMA for club runners", () => {
    const f = raceVmaFraction(15, 42.195, ENDURANCE_INDEX.intermediate);
    expect(f).toBeGreaterThan(0.72);
    expect(f).toBeLessThan(0.80);
  });

  test("VMA from a race time inverts the prediction", () => {
    for (const vma of [10, 13, 16, 20]) {
      for (const km of [5, 10, 21.1, 42.195]) {
        const minutes = predictRaceMinutes(vma, km, ENDURANCE_INDEX.intermediate);
        expect(vmaFromRaceTime(km, minutes, ENDURANCE_INDEX.intermediate)).toBeCloseTo(vma, 1);
      }
    }
  });

  test("invalid inputs return zero", () => {
    expect(predictRaceMinutes(0, 10, 6)).toBe(0);
    expect(vmaFromRaceTime(10, 0, 6)).toBe(0);
  });
});

describe("equivalentRaceMinutes", () => {
  const e = ENDURANCE_INDEX.intermediate;
  test("the distance entered gives back the time entered", () => {
    expect(equivalentRaceMinutes(10, 41.5, 10, e)).toBeCloseTo(41.5, 1);
    expect(equivalentRaceMinutes(42.195, 200, 42.195, e)).toBeCloseTo(200, 1);
  });
  test("VMA -> time -> VMA is stable", () => {
    for (const vma of [10, 14, 16, 20]) {
      const minutes = predictRaceMinutes(vma, 21.1, e);
      expect(vmaFromRaceTime(21.1, minutes, e)).toBeCloseTo(vma, 2);
    }
  });
  test("a 10 km in 41:30 predicts a marathon near 3:17:50", () => {
    const m = equivalentRaceMinutes(10, 41.5, 42.195, e);
    expect(Math.abs(m - (3 * 60 + 17 + 49 / 60))).toBeLessThan(1.5);
  });
});
