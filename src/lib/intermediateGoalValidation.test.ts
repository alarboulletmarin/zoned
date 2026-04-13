import { describe, expect, test } from "bun:test";

import {
  validateIntermediateGoals,
  sortIntermediateGoals,
  intermediateGoalToWeekNumber,
} from "./intermediateGoalValidation";
import type { IntermediateGoal } from "@/types/plan";

// ── Helpers ──────────────────────────────────────────────────────

const planStart = "2025-01-06"; // Monday
const mainRaceDate = "2025-06-15"; // ~23 weeks later
const mainRaceDistance = "marathon" as const; // TAPER_WEEKS = 3

function makeGoal(overrides: Partial<IntermediateGoal> = {}): IntermediateGoal {
  return {
    raceDistance: "10K",
    raceDate: "2025-04-06",
    priority: "B",
    ...overrides,
  };
}

// ── sortIntermediateGoals ────────────────────────────────────────

describe("sortIntermediateGoals", () => {
  test("returns empty array for empty input", () => {
    expect(sortIntermediateGoals([])).toEqual([]);
  });

  test("sorts goals by raceDate ascending", () => {
    const goals: IntermediateGoal[] = [
      makeGoal({ raceDate: "2025-05-01" }),
      makeGoal({ raceDate: "2025-03-01" }),
      makeGoal({ raceDate: "2025-04-01" }),
    ];

    const sorted = sortIntermediateGoals(goals);
    expect(sorted[0].raceDate).toBe("2025-03-01");
    expect(sorted[1].raceDate).toBe("2025-04-01");
    expect(sorted[2].raceDate).toBe("2025-05-01");
  });

  test("does not mutate the original array", () => {
    const goals: IntermediateGoal[] = [
      makeGoal({ raceDate: "2025-05-01" }),
      makeGoal({ raceDate: "2025-03-01" }),
    ];
    const originalFirst = goals[0].raceDate;

    sortIntermediateGoals(goals);

    expect(goals[0].raceDate).toBe(originalFirst);
  });
});

// ── intermediateGoalToWeekNumber ─────────────────────────────────

describe("intermediateGoalToWeekNumber", () => {
  test("returns 1 for a date in the first week after start", () => {
    // 2025-01-06 + 3 days = 2025-01-09, still within week 1
    expect(intermediateGoalToWeekNumber("2025-01-09", planStart)).toBe(1);
  });

  test("returns correct week number for dates further out", () => {
    // 2025-01-06 + 14 days = 2025-01-20 (start of week 3)
    expect(intermediateGoalToWeekNumber("2025-01-20", planStart)).toBe(3);
  });

  test("handles dates exactly on week boundaries", () => {
    // Exactly 7 days later = 2025-01-13 → week 2
    expect(intermediateGoalToWeekNumber("2025-01-13", planStart)).toBe(2);
    // Exactly 14 days later = 2025-01-20 → week 3
    expect(intermediateGoalToWeekNumber("2025-01-20", planStart)).toBe(3);
  });
});

// ── validateIntermediateGoals ────────────────────────────────────

describe("validateIntermediateGoals", () => {
  test("valid single goal between start and main race", () => {
    const result = validateIntermediateGoals(
      [makeGoal()],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("empty goals array returns valid", () => {
    const result = validateIntermediateGoals(
      [],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("goal before plan start triggers BEFORE_START", () => {
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "2025-01-01" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain("BEFORE_START");
  });

  test("goal after main race triggers AFTER_MAIN_RACE", () => {
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "2025-07-01" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain("AFTER_MAIN_RACE");
  });

  test("goal too close to main race triggers TOO_CLOSE_TO_MAIN", () => {
    // 7 days before June 15 = June 8
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "2025-06-08" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain("TOO_CLOSE_TO_MAIN");
  });

  test("goal exactly 14 days before main race passes", () => {
    // 14 days before June 15 = June 1
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "2025-06-01" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    // Should not have TOO_CLOSE_TO_MAIN
    const tooClose = result.errors.find((e) => e.code === "TOO_CLOSE_TO_MAIN");
    expect(tooClose).toBeUndefined();
  });

  test("two goals too close to each other triggers TOO_CLOSE_TO_EACH_OTHER", () => {
    // 5 days apart
    const result = validateIntermediateGoals(
      [
        makeGoal({ raceDate: "2025-03-15" }),
        makeGoal({ raceDate: "2025-03-20" }),
      ],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain("TOO_CLOSE_TO_EACH_OTHER");
  });

  test("two goals exactly 14 days apart passes", () => {
    const result = validateIntermediateGoals(
      [
        makeGoal({ raceDate: "2025-03-15" }),
        makeGoal({ raceDate: "2025-03-29" }),
      ],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    const tooClose = result.errors.find(
      (e) => e.code === "TOO_CLOSE_TO_EACH_OTHER",
    );
    expect(tooClose).toBeUndefined();
  });

  test("priority A in taper zone triggers PRIORITY_A_IN_TAPER_ZONE", () => {
    // Marathon: TAPER_WEEKS = 3, minWeeksBeforeMainForA = 3 + 3 = 6 weeks = 42 days
    // June 15 - 26 days = May 20 → too close for priority A
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "2025-05-20", priority: "A" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain("PRIORITY_A_IN_TAPER_ZONE");
  });

  test("priority A far enough from main race passes", () => {
    // April 1 is ~75 days before June 15, well beyond 42-day minimum
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "2025-04-01", priority: "A" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    const taperError = result.errors.find(
      (e) => e.code === "PRIORITY_A_IN_TAPER_ZONE",
    );
    expect(taperError).toBeUndefined();
  });

  test("invalid date format triggers INVALID_DATE", () => {
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "not-a-date" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain("INVALID_DATE");
  });

  test("goal after main race with invalid date still catches errors", () => {
    // "2025-07-01" is after main race — both AFTER_MAIN_RACE and TOO_CLOSE_TO_MAIN fire
    const result = validateIntermediateGoals(
      [makeGoal({ raceDate: "2025-07-01" })],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain("AFTER_MAIN_RACE");
    expect(codes).toContain("TOO_CLOSE_TO_MAIN");
  });

  test("multiple goals all valid", () => {
    const result = validateIntermediateGoals(
      [
        makeGoal({ raceDate: "2025-02-15", priority: "C" }),
        makeGoal({ raceDate: "2025-03-15", priority: "B" }),
        makeGoal({ raceDate: "2025-04-15", priority: "C" }),
      ],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("returns all errors, not just the first", () => {
    // Two goals both before plan start
    const result = validateIntermediateGoals(
      [
        makeGoal({ raceDate: "2024-12-01" }),
        makeGoal({ raceDate: "2024-12-20" }),
      ],
      mainRaceDate,
      planStart,
      mainRaceDistance,
    );
    expect(result.valid).toBe(false);
    const beforeStart = result.errors.filter(
      (e) => e.code === "BEFORE_START",
    );
    expect(beforeStart.length).toBeGreaterThanOrEqual(2);
  });
});
