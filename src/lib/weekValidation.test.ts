import { describe, expect, test } from "bun:test";

import type { PlanWeek } from "@/types/plan";
import { applyWeekValidationDecision, getWeekResolutionSummary } from "./weekValidation";

function makeWeek(): PlanWeek {
  return {
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
        estimatedDurationMin: 45,
        status: "completed",
      },
      {
        dayOfWeek: 3,
        workoutId: "B",
        sessionType: "tempo",
        isKeySession: true,
        estimatedDurationMin: 60,
      },
      {
        dayOfWeek: 5,
        workoutId: "C",
        sessionType: "recovery",
        isKeySession: false,
        estimatedDurationMin: 30,
        status: "planned",
      },
    ],
  };
}

describe("getWeekResolutionSummary", () => {
  test("counts unresolved sessions separately from skipped ones", () => {
    const summary = getWeekResolutionSummary(makeWeek());

    expect(summary.completed).toBe(1);
    expect(summary.skipped).toBe(0);
    expect(summary.unresolved).toBe(2);
  });
});

describe("applyWeekValidationDecision", () => {
  test("marks unresolved sessions as skipped only when explicitly asked", () => {
    const result = applyWeekValidationDecision(makeWeek(), "mark_skipped");

    expect(result.updatedSessions[1]?.status).toBe("skipped");
    expect(result.updatedSessions[2]?.status).toBe("skipped");
    expect(result.changedSessionIndexes).toEqual([1, 2]);
  });

  test("leaves unresolved sessions untouched when user wants to revisit later", () => {
    const result = applyWeekValidationDecision(makeWeek(), "keep_unresolved");

    expect(result.updatedSessions[1]?.status).toBeUndefined();
    expect(result.updatedSessions[2]?.status).toBe("planned");
    expect(result.changedSessionIndexes).toEqual([]);
  });
});
