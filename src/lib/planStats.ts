import type { TrainingPlan } from "@/types/plan";

export interface PlanStats {
  totalSessions: number;
  totalDurationMin: number;
  avgDurationPerWeekMin: number;
  keySessionCount: number;
  sessionsByType: Record<string, number>;
}

export function computePlanStats(plan: TrainingPlan): PlanStats {
  let totalSessions = 0;
  let totalDurationMin = 0;
  let keySessionCount = 0;
  const sessionsByType: Record<string, number> = {};

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      if (session.workoutId === "__race_day__") continue;
      totalSessions++;
      totalDurationMin += session.estimatedDurationMin;
      if (session.isKeySession) keySessionCount++;
      sessionsByType[session.sessionType] = (sessionsByType[session.sessionType] || 0) + 1;
    }
  }

  return {
    totalSessions,
    totalDurationMin,
    avgDurationPerWeekMin: plan.totalWeeks > 0 ? Math.round(totalDurationMin / plan.totalWeeks) : 0,
    keySessionCount,
    sessionsByType,
  };
}
