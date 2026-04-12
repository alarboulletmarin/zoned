import type { TrainingPlan } from "@/types/plan";

export function calculateWeeksBetweenDates(startDate: string, endDate: string): number {
  const [startYear, startMonth, startDay] = startDate.split("T")[0].split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("T")[0].split("-").map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const diffMs = end.getTime() - start.getTime();

  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function addWeeksToDate(startDate: string, weeks: number): string {
  const [year, month, day] = startDate.split("T")[0].split("-").map(Number);
  const date = new Date(year, month - 1, day + weeks * 7);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function buildRacePlanDateRange(startDate: string | undefined, raceDate: string): {
  startDate?: string;
  endDate?: string;
} {
  if (!startDate) return {};

  return {
    startDate,
    endDate: raceDate,
  };
}

/**
 * Get the Monday that starts week 1 of the plan.
 * Uses config.startDate (preferred) or config.createdAt as fallback.
 */
export function getPlanMonday(plan: TrainingPlan): Date {
  const raw = plan.config.startDate || plan.config.createdAt;
  const dateOnly = raw.split("T")[0];
  const [y, m, d] = dateOnly.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // Normalize to Monday of that week (ISO convention)
  const jsDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const offset = jsDay === 0 ? -6 : 1 - jsDay;
  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Compute the calendar date for a session given plan start, week number, and day of week.
 * @param planMonday - The Monday of week 1 (from getPlanMonday)
 * @param weekNumber - 1-based week number
 * @param dayOfWeek - 0=Mon, 1=Tue, ..., 6=Sun (Zoned convention)
 */
export function getSessionCalendarDate(
  planMonday: Date,
  weekNumber: number,
  dayOfWeek: number,
): Date {
  const d = new Date(planMonday);
  d.setDate(d.getDate() + (weekNumber - 1) * 7 + dayOfWeek);
  return d;
}

/**
 * Convert a calendar date back to (weekNumber, dayOfWeek) relative to the plan.
 * Returns null if the date is before week 1.
 */
export function dateToWeekAndDay(
  planMonday: Date,
  date: Date,
): { weekNumber: number; dayOfWeek: number } | null {
  const diffMs = date.getTime() - planMonday.getTime();
  if (diffMs < 0) return null;
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  const dayOfWeek = diffDays % 7; // 0=Mon ... 6=Sun
  return { weekNumber, dayOfWeek };
}

/**
 * Format a Date as "YYYY-MM-DD" (date-only, no timezone issues).
 */
export function isoDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
