import type { WorkoutTemplate } from "@/types";
import { getDominantZone } from "@/types";
import type { DurationCategory, IntensityCategory, WorkoutProfile } from "./types";

/**
 * Returns the average duration of a workout in minutes.
 */
export function getAvgDuration(workout: WorkoutTemplate): number {
  return (workout.typicalDuration.min + workout.typicalDuration.max) / 2;
}

/**
 * Classifies a workout's duration into short / medium / long buckets.
 *
 * - short:  avg < 45 min
 * - medium: avg <= 75 min
 * - long:   avg > 75 min
 */
export function classifyDuration(workout: WorkoutTemplate): DurationCategory {
  const avg = getAvgDuration(workout);
  if (avg < 45) return "short";
  if (avg <= 75) return "medium";
  return "long";
}

/**
 * Classifies a workout's intensity based on its dominant zone.
 *
 * - low:      Z1-Z2
 * - moderate: Z3
 * - high:     Z4-Z6
 */
export function classifyIntensity(workout: WorkoutTemplate): IntensityCategory {
  const zone = getDominantZone(workout);
  if (zone <= 2) return "low";
  if (zone === 3) return "moderate";
  return "high";
}

/**
 * Builds a full workout profile used by the recommendation rule functions.
 */
export function getWorkoutProfile(workout: WorkoutTemplate): WorkoutProfile {
  return {
    duration: classifyDuration(workout),
    intensity: classifyIntensity(workout),
    category: workout.category,
  };
}
