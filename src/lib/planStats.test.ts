import { describe, expect, test } from "bun:test";

import type { PlanSession, PlanWeek } from "@/types/plan";
import { computeWeekDuration, computeWeekKm, estimateSessionDurationMin } from "./planStats";

describe("computeWeekKm", () => {
  test("prefers actual and target distances over pace-based estimates", () => {
    const week: PlanWeek = {
      weekNumber: 1,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "A",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 60,
          targetDistanceKm: 10,
        },
        {
          dayOfWeek: 3,
          workoutId: "B",
          sessionType: "tempo",
          isKeySession: true,
          estimatedDurationMin: 45,
          actualDistanceKm: 8.2,
        },
      ],
    };

    expect(computeWeekKm(week)).toBeCloseTo(18.2, 5);
  });

  test("falls back to weekly target km when per-session distances are unavailable", () => {
    const week: PlanWeek = {
      weekNumber: 2,
      phase: "build",
      isRecoveryWeek: false,
      volumePercent: 100,
      targetKm: 52,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "A",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 40,
        },
      ],
    };

    expect(computeWeekKm(week)).toBe(52);
  });

  test("ignores skipped sessions so they do not inflate km stats", () => {
    const week: PlanWeek = {
      weekNumber: 3,
      phase: "build",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "A",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 60,
          targetDistanceKm: 10,
          status: "completed",
          actualDistanceKm: 10,
        },
        {
          dayOfWeek: 3,
          workoutId: "B",
          sessionType: "tempo",
          isKeySession: true,
          estimatedDurationMin: 45,
          targetDistanceKm: 8,
          status: "skipped",
        },
      ],
    };

    // Only the completed 10km session contributes; the skipped one is 0.
    expect(computeWeekKm(week)).toBeCloseTo(10, 5);
  });

  test("uses weekly targetKm when sessions have no distance data at all", () => {
    const week: PlanWeek = {
      weekNumber: 4,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 100,
      targetKm: 40,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "A",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 45,
          status: "planned",
        },
        {
          dayOfWeek: 3,
          workoutId: "B",
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 30,
          status: "planned",
        },
      ],
    };

    expect(computeWeekKm(week)).toBe(40);
  });

  test("skipped non-race sessions with distance metadata still return 0", () => {
    const week: PlanWeek = {
      weekNumber: 5,
      phase: "peak",
      isRecoveryWeek: false,
      volumePercent: 90,
      sessions: [
        {
          dayOfWeek: 0,
          workoutId: "skipped-long",
          sessionType: "long_run",
          isKeySession: true,
          estimatedDurationMin: 120,
          targetDistanceKm: 22,
          status: "skipped",
        },
      ],
    };

    expect(computeWeekKm(week)).toBe(0);
  });

  test("modified sessions contribute their actual distance, not the target", () => {
    const week: PlanWeek = {
      weekNumber: 6,
      phase: "build",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        {
          dayOfWeek: 1,
          workoutId: "A",
          sessionType: "endurance",
          isKeySession: false,
          estimatedDurationMin: 60,
          targetDistanceKm: 10,
          status: "modified",
          actualDistanceKm: 6.5,
        },
      ],
    };

    expect(computeWeekKm(week)).toBeCloseTo(6.5, 5);
  });
});

describe("estimateSessionDurationMin", () => {
  const baseSession: PlanSession = {
    dayOfWeek: 1,
    workoutId: "A",
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 60,
  };

  test("uses estimatedDurationMin when no status / no actuals", () => {
    expect(estimateSessionDurationMin(baseSession)).toBe(60);
  });

  test("returns 0 for skipped sessions", () => {
    expect(estimateSessionDurationMin({ ...baseSession, status: "skipped" })).toBe(0);
  });

  test("prefers actualDurationMin when session is modified", () => {
    expect(
      estimateSessionDurationMin({ ...baseSession, status: "modified", actualDurationMin: 45 }),
    ).toBe(45);
  });

  test("prefers actualDurationMin when session is completed and has actual data", () => {
    expect(
      estimateSessionDurationMin({ ...baseSession, status: "completed", actualDurationMin: 52 }),
    ).toBe(52);
  });

  test("falls back to planned duration when completed without actual", () => {
    expect(estimateSessionDurationMin({ ...baseSession, status: "completed" })).toBe(60);
  });

  test("returns 0 for race day marker", () => {
    expect(
      estimateSessionDurationMin({ ...baseSession, workoutId: "__race_day__" }),
    ).toBe(0);
  });
});

describe("computeWeekDuration", () => {
  test("sums planned durations when no actuals are present", () => {
    const week: PlanWeek = {
      weekNumber: 1,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        { dayOfWeek: 1, workoutId: "A", sessionType: "endurance", isKeySession: false, estimatedDurationMin: 45 },
        { dayOfWeek: 3, workoutId: "B", sessionType: "tempo", isKeySession: true, estimatedDurationMin: 50 },
        { dayOfWeek: 5, workoutId: "C", sessionType: "long_run", isKeySession: true, estimatedDurationMin: 90 },
      ],
    };
    expect(computeWeekDuration(week)).toBe(185);
  });

  test("blends actual + planned and excludes skipped sessions", () => {
    const week: PlanWeek = {
      weekNumber: 2,
      phase: "build",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [
        // Completed as planned -> 45
        { dayOfWeek: 1, workoutId: "A", sessionType: "endurance", isKeySession: false, estimatedDurationMin: 45, status: "completed" },
        // Modified -> 30 (actual overrides planned 50)
        { dayOfWeek: 3, workoutId: "B", sessionType: "tempo", isKeySession: true, estimatedDurationMin: 50, status: "modified", actualDurationMin: 30 },
        // Skipped -> 0
        { dayOfWeek: 5, workoutId: "C", sessionType: "long_run", isKeySession: true, estimatedDurationMin: 90, status: "skipped" },
      ],
    };
    expect(computeWeekDuration(week)).toBe(75);
  });
});
