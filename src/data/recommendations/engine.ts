import type { WorkoutTemplate } from "@/types";
import { getWorkoutProfile } from "./classify";
import { getNutritionRules } from "./rules/nutrition";
import { getHydrationRules } from "./rules/hydration";
import { getRecoveryRules } from "./rules/recovery";
import type {
  RecommendationItem,
  PhaseRecommendations,
  WorkoutRecommendations,
} from "./types";

/**
 * Sorts recommendation items by priority (1 = critical first).
 */
function sortByPriority(items: RecommendationItem[]): RecommendationItem[] {
  return [...items].sort((a, b) => a.priority - b.priority);
}

/**
 * Main entry point: generates all recommendations for a given workout.
 *
 * Returns before/during/after phases with nutrition, hydration, and recovery
 * items sorted by priority.
 */
export function getRecommendations(
  workout: WorkoutTemplate
): WorkoutRecommendations {
  const profile = getWorkoutProfile(workout);

  const nutrition = getNutritionRules(profile);
  const hydration = getHydrationRules(profile);
  const recovery = getRecoveryRules(profile);

  // Assemble "before" phase
  const before: PhaseRecommendations = {
    nutrition: sortByPriority(nutrition.before),
    hydration: sortByPriority(hydration.before),
    recovery: [], // No recovery advice before a workout
  };

  // Assemble "during" phase (may be null if nothing relevant)
  const duringNutrition = sortByPriority(nutrition.during);
  const duringHydration = sortByPriority(hydration.during);
  const hasDuringItems = duringNutrition.length > 0 || duringHydration.length > 0;

  const during: PhaseRecommendations | null = hasDuringItems
    ? {
        nutrition: duringNutrition,
        hydration: duringHydration,
        recovery: [], // No recovery advice during a workout
      }
    : null;

  // Assemble "after" phase
  const after: PhaseRecommendations = {
    nutrition: sortByPriority(nutrition.after),
    hydration: sortByPriority(hydration.after),
    recovery: sortByPriority(recovery.after),
  };

  return {
    before,
    during,
    after,
    showDuringPhase: hasDuringItems,
  };
}
