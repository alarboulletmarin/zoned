import { describe, expect, test } from "bun:test";

import { addWeeksToDate, buildRacePlanDateRange, calculateWeeksBetweenDates } from "./planDates";

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
