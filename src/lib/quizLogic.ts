import type { WorkoutTemplate, WorkoutCategory } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";

// Quiz answer types
export type Goal = "recover" | "progress" | "perform";
export type TimeAvailable = "short" | "medium" | "long";
export type Environment = "anywhere" | "track" | "hills";

export interface QuizAnswers {
  goal: Goal;
  time: TimeAvailable;
  environment: Environment;
}

// Time ranges in minutes
const TIME_RANGES: Record<TimeAvailable, { min: number; max: number }> = {
  short: { min: 0, max: 30 },
  medium: { min: 30, max: 60 },
  long: { min: 60, max: 999 },
};

/**
 * Maps quiz answers to recommended workout categories
 */
function getTargetCategories(answers: QuizAnswers): WorkoutCategory[] {
  const { goal, time, environment } = answers;

  // Recovery goal: recovery and endurance regardless of time/env
  if (goal === "recover") {
    return ["recovery", "endurance"];
  }

  // Progress goal
  if (goal === "progress") {
    if (time === "short" || time === "medium") {
      return ["tempo", "threshold"];
    }
    // Long time
    return ["long_run", "fartlek"];
  }

  // Perform goal
  if (goal === "perform") {
    if (environment === "track") {
      return ["vma_intervals"];
    }
    if (environment === "hills") {
      return ["hills"];
    }
    // Anywhere
    return ["tempo", "threshold", "fartlek"];
  }

  return ["endurance"];
}

/**
 * Filters workouts by environment requirements
 */
function matchesEnvironment(
  workout: WorkoutTemplate,
  environment: Environment
): boolean {
  if (environment === "track") {
    // When track is available, prefer track workouts but allow others
    return true;
  }
  if (environment === "hills") {
    // When hills are available, prefer hills workouts but allow others
    return true;
  }
  // Anywhere: exclude workouts that require specific terrain
  return !workout.environment.requiresTrack && !workout.environment.requiresHills;
}

/**
 * Filters workouts by duration
 */
function matchesDuration(
  workout: WorkoutTemplate,
  time: TimeAvailable
): boolean {
  const duration = getWorkoutDuration(workout);
  const range = TIME_RANGES[time];

  // Allow some flexibility on boundaries
  const minWithBuffer = range.min * 0.8;
  const maxWithBuffer = range.max * 1.2;

  return duration >= minWithBuffer && duration <= maxWithBuffer;
}

export interface QuizResult {
  workouts: WorkoutTemplate[];
  isExactMatch: boolean;
}

/**
 * Returns recommended workouts based on quiz answers
 * @param answers - The user's quiz answers
 * @param allWorkouts - All available workouts
 * @param maxResults - Maximum number of results to return (default: 3)
 */
export function getRecommendedWorkouts(
  answers: QuizAnswers,
  allWorkouts: WorkoutTemplate[],
  maxResults: number = 3
): QuizResult {
  const targetCategories = getTargetCategories(answers);

  // Filter workouts by category, environment, and duration
  const matchingWorkouts = allWorkouts.filter((workout) => {
    // Must be in target categories
    if (!targetCategories.includes(workout.category)) {
      return false;
    }

    // Must match environment constraints
    if (!matchesEnvironment(workout, answers.environment)) {
      return false;
    }

    // Must match duration
    if (!matchesDuration(workout, answers.time)) {
      return false;
    }

    return true;
  });

  // If no exact matches, relax duration constraint but sort by closest duration
  if (matchingWorkouts.length === 0) {
    const relaxedWorkouts = allWorkouts.filter((workout) => {
      if (!targetCategories.includes(workout.category)) {
        return false;
      }
      if (!matchesEnvironment(workout, answers.environment)) {
        return false;
      }
      return true;
    });

    if (relaxedWorkouts.length > 0) {
      // Sort by duration to show closest matches first
      const targetDuration = (TIME_RANGES[answers.time].min + TIME_RANGES[answers.time].max) / 2;
      const sorted = relaxedWorkouts.sort((a, b) => {
        const durationA = getWorkoutDuration(a);
        const durationB = getWorkoutDuration(b);
        return Math.abs(durationA - targetDuration) - Math.abs(durationB - targetDuration);
      });
      return { workouts: sorted.slice(0, maxResults), isExactMatch: false };
    }
  }

  // If still no matches, just filter by category and sort by duration
  if (matchingWorkouts.length === 0) {
    const categoryOnly = allWorkouts.filter((workout) =>
      targetCategories.includes(workout.category)
    );
    const targetDuration = (TIME_RANGES[answers.time].min + TIME_RANGES[answers.time].max) / 2;
    const sorted = categoryOnly.sort((a, b) => {
      const durationA = getWorkoutDuration(a);
      const durationB = getWorkoutDuration(b);
      return Math.abs(durationA - targetDuration) - Math.abs(durationB - targetDuration);
    });
    return { workouts: sorted.slice(0, maxResults), isExactMatch: false };
  }

  return { workouts: shuffleAndPick(matchingWorkouts, maxResults), isExactMatch: true };
}

/**
 * Shuffles array and picks first n elements
 */
function shuffleAndPick<T>(array: T[], n: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Validates if all quiz answers are provided
 */
export function isQuizComplete(
  answers: Partial<QuizAnswers>
): answers is QuizAnswers {
  return (
    answers.goal !== undefined &&
    answers.time !== undefined &&
    answers.environment !== undefined
  );
}
