/**
 * Shared plan utilities.
 *
 * getCurrentWeek parses the date string as local midnight to avoid
 * UTC/local timezone mismatches that could shift the result by one day
 * (and therefore one week) near week boundaries.
 */

import type { TrainingPlan } from "@/types/plan";

export function getCurrentWeek(dateStr: string): number {
  // Parse as local date components to avoid UTC offset issues
  const dateOnly = dateStr.split("T")[0];
  const [y, m, d] = dateOnly.split("-").map(Number);
  const start = new Date(y, m - 1, d);

  // Normalize to Monday of that week (same as PlanViewPage parsedPlanStart)
  const jsDay = start.getDay();
  const offset = jsDay === 0 ? -6 : 1 - jsDay;
  start.setDate(start.getDate() + offset);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = today.getTime() - start.getTime();
  // Math.round absorbs potential DST transitions (±1 h)
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

/**
 * Derived state, never stored: a plan is "ended" once today is past its
 * explicit endDate/raceDate. The generator can place the race beyond
 * startDate + totalWeeks, so the explicit date wins over the week count;
 * plans without dates fall back to the week arithmetic (createdAt-based),
 * matching the progress bar.
 */
export function isPlanEnded(plan: TrainingPlan): boolean {
  const explicitEnd = plan.config.endDate || plan.config.raceDate;
  if (explicitEnd) {
    // Local-midnight parsing, same reasoning as getCurrentWeek
    const [y, m, d] = explicitEnd.split("T")[0].split("-").map(Number);
    const end = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today.getTime() > end.getTime();
  }
  return (
    getCurrentWeek(plan.config.startDate || plan.config.createdAt) >
    plan.totalWeeks
  );
}
