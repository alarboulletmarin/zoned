import { describe, expect, test } from "bun:test";

import { buildRacePlanDateRange, calculateWeeksBetweenDates } from "./planDates";

describe("calculateWeeksBetweenDates", () => {
  test("calculates available weeks from the chosen start date", () => {
    expect(calculateWeeksBetweenDates("2026-01-01", "2026-01-29")).toBe(4);
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
