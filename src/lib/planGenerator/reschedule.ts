import type { TrainingPlan, AutoChange } from "@/types/plan";
import { getPlanMonday, dateToWeekAndDay } from "@/lib/planDates";

// ── Public result type ────────────────────────────────────────────

export interface AutoRescheduleResult {
  updatedPlan: TrainingPlan;
  changes: AutoChange[];
}

// ── Main entry point ──────────────────────────────────────────────

/**
 * Pure, deterministic rescheduler.
 * Marks planned sessions on unavailable days as "skipped" within a window.
 * Does NOT move sessions. The adaptation engine handles rebalancing.
 *
 * @param plan           - The plan to reschedule (not mutated).
 * @param fromWeekNumber - First week to consider (1-based).
 * @param windowWeeks    - How many weeks to scan (default 4).
 */
export function autoReschedule(
  plan: TrainingPlan,
  fromWeekNumber: number,
  windowWeeks = 4,
): AutoRescheduleResult {
  const draft = structuredClone(plan);
  const changes: AutoChange[] = [];

  const blockedSet = buildBlockedSet(draft);
  if (blockedSet.size === 0) return { updatedPlan: draft, changes };

  const lastWeek = fromWeekNumber + windowWeeks - 1;

  for (const week of draft.weeks) {
    if (week.weekNumber < fromWeekNumber || week.weekNumber > lastWeek) continue;

    for (const session of week.sessions) {
      // Never touch race day
      if (session.workoutId === "__race_day__") continue;
      // Never touch already-resolved sessions
      if (session.status === "completed" || session.status === "skipped" || session.status === "modified") continue;
      // Only skip if on a blocked day
      if (!blockedSet.has(`${week.weekNumber}-${session.dayOfWeek}`)) continue;

      session.status = "skipped";
      session.userNote = plan.config.unavailabilities?.find(u => {
        const [y, m, d] = u.date.split("-").map(Number);
        const date = new Date(y, m - 1, d);
        const result = dateToWeekAndDay(getPlanMonday(plan), date);
        return result && result.weekNumber === week.weekNumber && result.dayOfWeek === session.dayOfWeek;
      })?.reason ?? "unavailability";

      changes.push({
        kind: "skipped",
        weekNumber: week.weekNumber,
        fromDay: session.dayOfWeek,
        workoutId: session.workoutId,
        reason: "unavailability",
      });
    }
  }

  return { updatedPlan: draft, changes };
}

// ── Internal helpers ──────────────────────────────────────────────

function buildBlockedSet(plan: TrainingPlan): Set<string> {
  const set = new Set<string>();
  const unavailabilities = plan.config.unavailabilities ?? [];
  if (unavailabilities.length === 0) return set;
  const planMonday = getPlanMonday(plan);
  for (const u of unavailabilities) {
    const [y, m, d] = u.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const result = dateToWeekAndDay(planMonday, date);
    if (result) set.add(`${result.weekNumber}-${result.dayOfWeek}`);
  }
  return set;
}
