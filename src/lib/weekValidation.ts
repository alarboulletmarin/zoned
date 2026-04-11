import type { PlanSession, PlanWeek } from "@/types/plan";

export type WeekValidationDecision = "mark_skipped" | "keep_unresolved";

export interface WeekResolutionSummary {
  completed: number;
  skipped: number;
  unresolved: number;
}

function isResolved(status: PlanSession["status"]): boolean {
  return status === "completed" || status === "skipped";
}

export function getWeekResolutionSummary(week: PlanWeek): WeekResolutionSummary {
  return week.sessions.reduce<WeekResolutionSummary>((summary, session) => {
    if (session.status === "completed") {
      summary.completed += 1;
    } else if (session.status === "skipped") {
      summary.skipped += 1;
    } else {
      summary.unresolved += 1;
    }
    return summary;
  }, { completed: 0, skipped: 0, unresolved: 0 });
}

export function applyWeekValidationDecision(
  week: PlanWeek,
  decision: WeekValidationDecision,
): { updatedSessions: PlanSession[]; changedSessionIndexes: number[] } {
  if (decision === "keep_unresolved") {
    return {
      updatedSessions: week.sessions.map((session) => ({ ...session })),
      changedSessionIndexes: [],
    };
  }

  const changedSessionIndexes: number[] = [];
  const updatedSessions = week.sessions.map((session, index) => {
    if (isResolved(session.status)) {
      return { ...session };
    }

    changedSessionIndexes.push(index);
    return {
      ...session,
      status: "skipped" as const,
      completedAt: undefined,
    };
  });

  return { updatedSessions, changedSessionIndexes };
}
