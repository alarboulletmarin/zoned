import { describe, expect, test } from "bun:test";

import type { PlanWeek } from "@/types/plan";
import { computeWeekKm } from "./planStats";

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
});
