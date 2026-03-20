import type { WorkoutTemplate, WorkoutBlock } from "@/types";

const STORAGE_KEY = "zoned-custom-workouts";
const MAX_WORKOUTS = 20;

export function getCustomWorkouts(): WorkoutTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getCustomWorkout(id: string): WorkoutTemplate | undefined {
  return getCustomWorkouts().find((w) => w.id === id);
}

export function saveCustomWorkout(workout: WorkoutTemplate): void {
  const workouts = getCustomWorkouts();
  const index = workouts.findIndex((w) => w.id === workout.id);
  if (index >= 0) {
    workouts[index] = workout;
  } else {
    if (workouts.length >= MAX_WORKOUTS) {
      throw new Error("Maximum custom workouts reached");
    }
    workouts.push(workout);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function deleteCustomWorkout(id: string): void {
  const workouts = getCustomWorkouts().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function createEmptyWorkout(): WorkoutTemplate {
  const id = `CUSTOM-${Date.now().toString(36)}`;
  const emptyBlock: WorkoutBlock = {
    description: "",
    durationMin: 10,
    zone: "Z2",
  };
  return {
    id,
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    category: "endurance",
    sessionType: "endurance",
    targetSystem: "aerobic_base",
    difficulty: "intermediate",
    typicalDuration: { min: 30, max: 60 },
    environment: { requiresHills: false, requiresTrack: false },
    warmupTemplate: [{ description: "", durationMin: 10, zone: "Z1" }],
    mainSetTemplate: [emptyBlock],
    cooldownTemplate: [{ description: "", durationMin: 5, zone: "Z1" }],
    coachingTips: [],
    coachingTipsEn: [],
    commonMistakes: [],
    commonMistakesEn: [],
    variationIds: [],
    selectionCriteria: {
      phases: [],
      weekPositions: [],
      relativeLoad: "moderate",
      tags: ["custom"],
      priorityScore: 0,
    },
  };
}
