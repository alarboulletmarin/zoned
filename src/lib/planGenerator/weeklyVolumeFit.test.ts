import { describe, expect, test } from "bun:test";
import type { PlanSession } from "@/types/plan";
import { fitWeeklyVolume } from "./weeklyVolumeFit";

function session(partial: Partial<PlanSession>): PlanSession {
  return {
    dayOfWeek: 0,
    workoutId: "END-023",
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
    targetDistanceKm: 7,
    ...partial,
  };
}

describe("fitWeeklyVolume", () => {
  test("an easy run never outlasts the long run, even when the week asks for more", () => {
    const long = session({ dayOfWeek: 6, workoutId: "LR-017", sessionType: "long_run", estimatedDurationMin: 70, targetDistanceKm: 11 });
    const easy = [session({ dayOfWeek: 1 }), session({ dayOfWeek: 3 }), session({ dayOfWeek: 4 })];
    const week = [...easy, long];
    fitWeeklyVolume(week, 60, 6.3, () => ({ min: 35, max: 90 }), long.estimatedDurationMin);
    for (const s of easy) expect(s.estimatedDurationMin).toBeLessThanOrEqual(70);
  });

  test("without a long-run cap the easy runs absorb the week as before", () => {
    const easy = [session({ dayOfWeek: 1 }), session({ dayOfWeek: 3 })];
    fitWeeklyVolume(easy, 20, 6, () => ({ min: 35, max: 90 }));
    expect(easy.reduce((sum, s) => sum + (s.targetDistanceKm ?? 0), 0)).toBeCloseTo(20, 0);
  });
});
