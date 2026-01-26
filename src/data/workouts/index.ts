import type {
  WorkoutTemplate,
  WorkoutCategory,
  WorkoutCategoryFile,
} from "@/types";

// Import all workout category files
import recoveryData from "./recovery.json";
import enduranceData from "./endurance.json";
import tempoData from "./tempo.json";
import thresholdData from "./threshold.json";
import vmaData from "./vma.json";
import longRunData from "./long_run.json";
import hillsData from "./hills.json";
import fartlekData from "./fartlek.json";
import racePaceData from "./race_pace.json";
import mixedData from "./mixed.json";
import assessmentData from "./assessment.json";

// Type assertion for JSON imports
const recovery = recoveryData as WorkoutCategoryFile;
const endurance = enduranceData as WorkoutCategoryFile;
const tempo = tempoData as WorkoutCategoryFile;
const threshold = thresholdData as WorkoutCategoryFile;
const vma = vmaData as WorkoutCategoryFile;
const longRun = longRunData as WorkoutCategoryFile;
const hills = hillsData as WorkoutCategoryFile;
const fartlek = fartlekData as WorkoutCategoryFile;
const racePace = racePaceData as WorkoutCategoryFile;
const mixed = mixedData as WorkoutCategoryFile;
const assessment = assessmentData as WorkoutCategoryFile;

// Export workouts grouped by category
export const workoutsByCategory: Record<WorkoutCategory, WorkoutTemplate[]> = {
  recovery: recovery.templates,
  endurance: endurance.templates,
  tempo: tempo.templates,
  threshold: threshold.templates,
  vma_intervals: vma.templates,
  long_run: longRun.templates,
  hills: hills.templates,
  fartlek: fartlek.templates,
  race_pace: racePace.templates,
  mixed: mixed.templates,
  assessment: assessment.templates,
};

// Export all workouts as a flat array
export const allWorkouts: WorkoutTemplate[] = Object.values(
  workoutsByCategory
).flat();

// Get workout by ID
export function getWorkoutById(id: string): WorkoutTemplate | undefined {
  return allWorkouts.find((w) => w.id === id);
}

// Get workouts by category
export function getWorkoutsByCategory(
  category: WorkoutCategory
): WorkoutTemplate[] {
  return workoutsByCategory[category] || [];
}

// Get related workouts (variations)
export function getRelatedWorkouts(workout: WorkoutTemplate): WorkoutTemplate[] {
  return workout.variationIds
    .map((id) => getWorkoutById(id))
    .filter((w): w is WorkoutTemplate => w !== undefined);
}

// Search workouts by name (supports both FR and EN)
export function searchWorkouts(query: string): WorkoutTemplate[] {
  const lowerQuery = query.toLowerCase();
  return allWorkouts.filter(
    (w) =>
      w.name.toLowerCase().includes(lowerQuery) ||
      w.nameEn.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery) ||
      w.descriptionEn.toLowerCase().includes(lowerQuery)
  );
}

// Get category statistics
export function getCategoryStats(): {
  category: WorkoutCategory;
  count: number;
}[] {
  return Object.entries(workoutsByCategory).map(([category, workouts]) => ({
    category: category as WorkoutCategory,
    count: workouts.length,
  }));
}

// Total workout count
export const totalWorkoutCount = allWorkouts.length;

// Get workout of the day (deterministic based on date)
export function getWorkoutOfTheDay(): WorkoutTemplate {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % allWorkouts.length;
  return allWorkouts[index];
}

// Export category list for iteration
export const categories: WorkoutCategory[] = [
  "recovery",
  "endurance",
  "tempo",
  "threshold",
  "vma_intervals",
  "long_run",
  "hills",
  "fartlek",
  "race_pace",
  "mixed",
  "assessment",
];
