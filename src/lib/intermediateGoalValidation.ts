import type { IntermediateGoal, RaceDistance } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import { calculateWeeksBetweenDates } from "@/lib/planDates";
import { TAPER_WEEKS } from "@/lib/planGenerator/constants";

// ── Error types ───────────────────────────────────────────────────

export type IntermediateGoalErrorCode =
  | "BEFORE_START"
  | "AFTER_MAIN_RACE"
  | "TOO_CLOSE_TO_MAIN"
  | "TOO_CLOSE_TO_EACH_OTHER"
  | "INVALID_DATE"
  | "PRIORITY_A_IN_TAPER_ZONE"
  | "DISTANCE_TOO_LONG_FOR_PRIORITY"
  | "DISTANCE_LONGER_THAN_MAIN";

export interface IntermediateGoalError {
  goalIndex: number;
  code: IntermediateGoalErrorCode;
  message: string;
  messageEn: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: IntermediateGoalError[];
}

// ── Helpers ───────────────────────────────────────────────────────

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Public API ────────────────────────────────────────────────────

/**
 * Returns a copy of the goals sorted by raceDate ascending.
 */
export function sortIntermediateGoals(goals: IntermediateGoal[]): IntermediateGoal[] {
  return [...goals].sort((a, b) => a.raceDate.localeCompare(b.raceDate));
}

/**
 * Returns the 1-based week number for a goal date within the plan.
 */
export function intermediateGoalToWeekNumber(goalDate: string, planStartDate: string): number {
  return calculateWeeksBetweenDates(planStartDate, goalDate) + 1;
}

/**
 * Validates intermediate goals against plan dates and each other.
 * Returns ALL errors (does not stop at first).
 */
export function validateIntermediateGoals(
  goals: IntermediateGoal[],
  mainRaceDate: string,
  planStartDate: string,
  mainRaceDistance: RaceDistance,
): ValidationResult {
  const errors: IntermediateGoalError[] = [];
  const sorted = sortIntermediateGoals(goals);

  // Build an index map so we can report the original goalIndex
  // Since goals may have been passed unsorted, map sorted → original index
  const originalIndices = sorted.map((sortedGoal) =>
    goals.findIndex(
      (g) => g.raceDate === sortedGoal.raceDate && g.priority === sortedGoal.priority && g.raceDistance === sortedGoal.raceDistance,
    ),
  );

  const taperWeeks = TAPER_WEEKS[mainRaceDistance] ?? 2;
  const minWeeksBeforeMainForA = taperWeeks + 3;
  const minDaysBeforeMainForA = minWeeksBeforeMainForA * 7;

  for (let i = 0; i < sorted.length; i++) {
    const goal = sorted[i];
    const goalIndex = originalIndices[i];

    // 1. Valid ISO date
    if (!ISO_DATE_RE.test(goal.raceDate)) {
      errors.push({
        goalIndex,
        code: "INVALID_DATE",
        message: "Date invalide (format attendu : AAAA-MM-JJ)",
        messageEn: "Invalid date (expected format: YYYY-MM-DD)",
      });
      continue; // Skip further checks for this goal — date is unusable
    }

    // 2. Must be after planStartDate
    if (daysBetween(planStartDate, goal.raceDate) <= 0) {
      errors.push({
        goalIndex,
        code: "BEFORE_START",
        message: "La date doit \u00eatre apr\u00e8s le d\u00e9but du plan",
        messageEn: "Date must be after the plan start",
      });
    }

    // 3. Must be before mainRaceDate
    if (daysBetween(goal.raceDate, mainRaceDate) <= 0) {
      errors.push({
        goalIndex,
        code: "AFTER_MAIN_RACE",
        message: "La date doit \u00eatre avant la course principale",
        messageEn: "Date must be before the main race",
      });
    }

    // 4. At least 14 days before mainRaceDate
    if (daysBetween(goal.raceDate, mainRaceDate) < 14) {
      errors.push({
        goalIndex,
        code: "TOO_CLOSE_TO_MAIN",
        message: "Trop proche de la course principale (min. 2 semaines)",
        messageEn: "Too close to the main race (min. 2 weeks)",
      });
    }

    // 5. No two goals within 14 days of each other
    if (i > 0) {
      const prevGoal = sorted[i - 1];
      if (daysBetween(prevGoal.raceDate, goal.raceDate) < 14) {
        errors.push({
          goalIndex,
          code: "TOO_CLOSE_TO_EACH_OTHER",
          message: "Trop proche d'une autre course interm\u00e9diaire (min. 2 semaines)",
          messageEn: "Too close to another intermediate race (min. 2 weeks)",
        });
      }
    }

    // 6. Priority A must be far enough from main race (outside taper zone + buffer)
    if (goal.priority === "A" && daysBetween(goal.raceDate, mainRaceDate) < minDaysBeforeMainForA) {
      errors.push({
        goalIndex,
        code: "PRIORITY_A_IN_TAPER_ZONE",
        message: "Une course priorit\u00e9 A ne peut pas \u00eatre aussi proche de l'objectif principal",
        messageEn: "A priority-A race cannot be this close to the main goal",
      });
    }

    // 7. Warn: intermediate race distance longer than main race
    const goalDistanceKm = RACE_DISTANCE_META[goal.raceDistance]?.distanceKm ?? 10;
    const mainDistanceKm = RACE_DISTANCE_META[mainRaceDistance]?.distanceKm ?? 42;
    if (goalDistanceKm > mainDistanceKm) {
      errors.push({
        goalIndex,
        code: "DISTANCE_LONGER_THAN_MAIN",
        message: "La distance de cette course dépasse celle de l'objectif principal",
        messageEn: "This race distance exceeds the main goal distance",
      });
    }

    // 8. Warn: long race with low priority (engine will auto-upgrade but user should know)
    if (goalDistanceKm >= 21.1 && goal.priority === "C") {
      errors.push({
        goalIndex,
        code: "DISTANCE_TOO_LONG_FOR_PRIORITY",
        message: "Une course de cette distance sera automatiquement trait\u00e9e comme un objectif important (A)",
        messageEn: "A race of this distance will automatically be treated as an important goal (A)",
      });
    }
  }

  // DISTANCE_TOO_LONG_FOR_PRIORITY is informational (engine auto-upgrades) — not blocking
  const WARNING_CODES: IntermediateGoalErrorCode[] = ["DISTANCE_TOO_LONG_FOR_PRIORITY", "DISTANCE_LONGER_THAN_MAIN"];
  const blockingErrors = errors.filter(e => !WARNING_CODES.includes(e.code));

  return {
    valid: blockingErrors.length === 0,
    errors,
  };
}
