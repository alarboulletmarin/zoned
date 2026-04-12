import { describe, expect, test } from "bun:test";

import {
  addWeeksToDate,
  buildRacePlanDateRange,
  calculateWeeksBetweenDates,
  dateToWeekAndDay,
  getPlanMonday,
  getSessionCalendarDate,
  isoDateOnly,
} from "./planDates";
import type { TrainingPlan } from "@/types/plan";

describe("calculateWeeksBetweenDates", () => {
  test("calculates available weeks from the chosen start date", () => {
    expect(calculateWeeksBetweenDates("2026-01-01", "2026-01-29")).toBe(4);
  });

  test("is independent of the machine clock (start != today)", () => {
    // 13 weeks exactly, regardless of when this test runs.
    expect(calculateWeeksBetweenDates("2026-05-15", "2026-08-14")).toBe(13);
  });

  test("returns 0 when start and end dates are the same", () => {
    expect(calculateWeeksBetweenDates("2026-01-01", "2026-01-01")).toBe(0);
  });

  test("accepts ISO datetime strings with a T suffix", () => {
    expect(calculateWeeksBetweenDates("2026-01-01T00:00:00Z", "2026-01-29")).toBe(4);
  });
});

describe("buildRacePlanDateRange", () => {
  test("stores an explicit start date and uses race date as end date", () => {
    expect(buildRacePlanDateRange("2026-04-01", "2026-06-15")).toEqual({
      startDate: "2026-04-01",
      endDate: "2026-06-15",
    });
  });

  test("returns no explicit range when start date is missing", () => {
    expect(buildRacePlanDateRange(undefined, "2026-06-15")).toEqual({});
  });
});

describe("addWeeksToDate", () => {
  test("computes the earliest valid race date from the chosen start date", () => {
    expect(addWeeksToDate("2026-03-10", 12)).toBe("2026-06-02");
  });
});

// ── New date helper tests ─────────────────────────────────────────

function makePlan(overrides: { startDate?: string; createdAt?: string }): TrainingPlan {
  return {
    id: "test",
    config: {
      id: "test",
      daysPerWeek: 4,
      createdAt: overrides.createdAt ?? "2026-04-06",
      startDate: overrides.startDate,
    },
    weeks: [],
    totalWeeks: 0,
    phases: [],
    name: "Test",
    nameEn: "Test",
  };
}

describe("getPlanMonday", () => {
  test("returns the Monday when startDate is a Wednesday", () => {
    // 2026-04-08 is a Wednesday → Monday is 2026-04-06
    const plan = makePlan({ startDate: "2026-04-08" });
    const monday = getPlanMonday(plan);
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(3); // April (0-indexed)
    expect(monday.getDate()).toBe(6);
  });

  test("returns the same date when startDate is already a Monday", () => {
    // 2026-04-06 is a Monday
    const plan = makePlan({ startDate: "2026-04-06" });
    const monday = getPlanMonday(plan);
    expect(monday.getDate()).toBe(6);
    expect(monday.getMonth()).toBe(3);
  });

  test("falls back on createdAt when startDate is absent", () => {
    // 2026-04-09 is a Thursday → Monday is 2026-04-06
    const plan = makePlan({ createdAt: "2026-04-09T12:00:00Z" });
    const monday = getPlanMonday(plan);
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(3);
    expect(monday.getDate()).toBe(6);
  });

  test("handles Sunday correctly (goes back to previous Monday)", () => {
    // 2026-04-12 is a Sunday → Monday is 2026-04-06
    const plan = makePlan({ startDate: "2026-04-12" });
    const monday = getPlanMonday(plan);
    expect(monday.getDate()).toBe(6);
  });
});

describe("getSessionCalendarDate", () => {
  test("week 1 day 0 returns planMonday itself", () => {
    const planMonday = new Date(2026, 3, 6); // 2026-04-06
    const result = getSessionCalendarDate(planMonday, 1, 0);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(6);
  });

  test("week 2 day 3 returns planMonday + 10 days", () => {
    const planMonday = new Date(2026, 3, 6); // 2026-04-06
    const result = getSessionCalendarDate(planMonday, 2, 3);
    // (2-1)*7 + 3 = 10 days after April 6 = April 16
    expect(result.getDate()).toBe(16);
    expect(result.getMonth()).toBe(3);
  });
});

describe("dateToWeekAndDay", () => {
  test("roundtrip with getSessionCalendarDate", () => {
    const planMonday = new Date(2026, 3, 6);
    const calDate = getSessionCalendarDate(planMonday, 3, 5);
    const result = dateToWeekAndDay(planMonday, calDate);
    expect(result).toEqual({ weekNumber: 3, dayOfWeek: 5 });
  });

  test("returns null for a date before planMonday", () => {
    const planMonday = new Date(2026, 3, 6);
    const before = new Date(2026, 3, 1);
    expect(dateToWeekAndDay(planMonday, before)).toBeNull();
  });

  test("planMonday itself is week 1 day 0", () => {
    const planMonday = new Date(2026, 3, 6);
    const result = dateToWeekAndDay(planMonday, planMonday);
    expect(result).toEqual({ weekNumber: 1, dayOfWeek: 0 });
  });
});

describe("isoDateOnly", () => {
  test("formats date as YYYY-MM-DD", () => {
    const date = new Date(2026, 3, 6); // April 6, 2026
    expect(isoDateOnly(date)).toBe("2026-04-06");
  });

  test("pads single-digit month and day", () => {
    const date = new Date(2026, 0, 5); // January 5, 2026
    expect(isoDateOnly(date)).toBe("2026-01-05");
  });
});
