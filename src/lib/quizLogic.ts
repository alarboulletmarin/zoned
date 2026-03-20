import type { WorkoutTemplate, WorkoutCategory } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";

// Quiz answer types
export type Goal = "recover" | "progress" | "perform";
export type TimeAvailable = "short" | "medium" | "long";
export type Environment = "anywhere" | "track" | "hills";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Weakness = "speed" | "endurance" | "both";

export interface QuizAnswers {
  goal: Goal;
  time: TimeAvailable;
  environment: Environment;
  experience: Experience;
  weakness: Weakness;
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
  const { goal, time, environment, experience, weakness } = answers;

  // Recovery goal: recovery and endurance regardless of time/env
  if (goal === "recover") {
    return ["recovery", "endurance"];
  }

  // Progress goal — modulated by experience and weakness
  if (goal === "progress") {
    const categories: WorkoutCategory[] = [];

    if (weakness === "speed") {
      categories.push("tempo", "vma_intervals");
    } else if (weakness === "endurance") {
      categories.push("long_run", "endurance");
    } else {
      // "both"
      if (time === "short" || time === "medium") {
        categories.push("tempo", "threshold");
      } else {
        categories.push("long_run", "fartlek");
      }
    }

    // Beginners get simpler workouts added
    if (experience === "beginner" && !categories.includes("endurance")) {
      categories.push("endurance");
    }
    // Advanced get more intense options
    if (experience === "advanced" && !categories.includes("threshold")) {
      categories.push("threshold");
    }

    return categories;
  }

  // Perform goal
  if (goal === "perform") {
    const categories: WorkoutCategory[] = [];

    if (environment === "track") {
      categories.push("vma_intervals");
    } else if (environment === "hills") {
      categories.push("hills");
    } else {
      categories.push("tempo", "threshold", "fartlek");
    }

    // Advanced: add race_pace and mixed
    if (experience === "advanced") {
      categories.push("race_pace");
    }
    // Beginners: soften with fartlek
    if (experience === "beginner" && !categories.includes("fartlek")) {
      categories.push("fartlek");
    }

    return categories;
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
  if (environment === "track" || environment === "hills") {
    return true;
  }
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
  const minWithBuffer = range.min * 0.8;
  const maxWithBuffer = range.max * 1.2;
  return duration >= minWithBuffer && duration <= maxWithBuffer;
}

/**
 * Filters by difficulty based on experience
 */
function matchesExperience(
  workout: WorkoutTemplate,
  experience: Experience
): boolean {
  if (experience === "beginner") {
    return workout.difficulty === "beginner" || workout.difficulty === "intermediate";
  }
  if (experience === "advanced") {
    return workout.difficulty === "intermediate" || workout.difficulty === "advanced";
  }
  // Intermediate: all difficulties
  return true;
}

export interface QuizResult {
  workouts: WorkoutTemplate[];
  isExactMatch: boolean;
}

/**
 * Returns recommended workouts based on quiz answers
 */
export function getRecommendedWorkouts(
  answers: QuizAnswers,
  allWorkouts: WorkoutTemplate[],
  maxResults: number = 6
): QuizResult {
  const targetCategories = getTargetCategories(answers);

  // Full filter: category + environment + duration + experience
  const matchingWorkouts = allWorkouts.filter((workout) => {
    if (!targetCategories.includes(workout.category)) return false;
    if (!matchesEnvironment(workout, answers.environment)) return false;
    if (!matchesDuration(workout, answers.time)) return false;
    if (!matchesExperience(workout, answers.experience)) return false;
    return true;
  });

  if (matchingWorkouts.length > 0) {
    return { workouts: shuffleAndPick(matchingWorkouts, maxResults), isExactMatch: true };
  }

  // Relax experience constraint
  const relaxedExp = allWorkouts.filter((workout) => {
    if (!targetCategories.includes(workout.category)) return false;
    if (!matchesEnvironment(workout, answers.environment)) return false;
    if (!matchesDuration(workout, answers.time)) return false;
    return true;
  });

  if (relaxedExp.length > 0) {
    return { workouts: shuffleAndPick(relaxedExp, maxResults), isExactMatch: true };
  }

  // Relax duration constraint, sort by closest
  const relaxedDuration = allWorkouts.filter((workout) => {
    if (!targetCategories.includes(workout.category)) return false;
    if (!matchesEnvironment(workout, answers.environment)) return false;
    return true;
  });

  if (relaxedDuration.length > 0) {
    const targetDuration = (TIME_RANGES[answers.time].min + TIME_RANGES[answers.time].max) / 2;
    const sorted = relaxedDuration.sort((a, b) => {
      return Math.abs(getWorkoutDuration(a) - targetDuration) - Math.abs(getWorkoutDuration(b) - targetDuration);
    });
    return { workouts: sorted.slice(0, maxResults), isExactMatch: false };
  }

  // Last resort: category only
  const categoryOnly = allWorkouts.filter((workout) =>
    targetCategories.includes(workout.category)
  );
  const targetDuration = (TIME_RANGES[answers.time].min + TIME_RANGES[answers.time].max) / 2;
  const sorted = categoryOnly.sort((a, b) => {
    return Math.abs(getWorkoutDuration(a) - targetDuration) - Math.abs(getWorkoutDuration(b) - targetDuration);
  });
  return { workouts: sorted.slice(0, maxResults), isExactMatch: false };
}

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
    answers.environment !== undefined &&
    answers.experience !== undefined &&
    answers.weakness !== undefined
  );
}
