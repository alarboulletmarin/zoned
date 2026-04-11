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
});
