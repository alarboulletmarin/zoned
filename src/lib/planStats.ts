import type { TrainingPlan, PlanSession, PlanWeek } from "@/types/plan";

export interface PlanStats {
  totalSessions: number;
  totalDurationMin: number;
  avgDurationPerWeekMin: number;
  keySessionCount: number;
  sessionsByType: Record<string, number>;
}

/**
 * Estimated average pace (min/km) by session type.
 * Used to compute rough weekly distance.
 */
const PACE_BY_TYPE: Record<string, number> = {
  recovery: 6.5,
  endurance: 5.75,
  long_run: 5.75,
  tempo: 4.75,
  threshold: 4.5,
  vo2max: 4.0,
  speed: 3.75,
  hills: 5.5,
  fartlek: 5.0,
  race_specific: 4.75,
};

/** Estimate distance in km for a session based on duration and type */
function estimateSessionKm(session: PlanSession): number {
  if (session.workoutId === "__race_day__") return 0;
  const pace = PACE_BY_TYPE[session.sessionType] || 5.5;
  return session.estimatedDurationMin / pace;
}

/** Compute total estimated km for a week */
export function computeWeekKm(week: PlanWeek): number {
  return week.sessions.reduce((sum, s) => sum + estimateSessionKm(s), 0);
}

/** Compute total duration in minutes for a week */
export function computeWeekDuration(week: PlanWeek): number {
  return week.sessions.reduce((sum, s) => s.workoutId === "__race_day__" ? sum : sum + s.estimatedDurationMin, 0);
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
