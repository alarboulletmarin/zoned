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

/** Export workouts as JSON and trigger browser download */
export function exportWorkoutsToJSON(workouts: WorkoutTemplate[]): void {
  const json = JSON.stringify(workouts, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    workouts.length === 1
      ? `zoned-workout-${workouts[0].id}.json`
      : `zoned-workouts-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Import workouts from a JSON file, returns count of imported workouts. Throws on invalid data or limit reached. */
export function importWorkoutsFromJSON(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const incoming: WorkoutTemplate[] = Array.isArray(raw) ? raw : [raw];

        // Basic validation: each item must have id and mainSetTemplate
        for (const w of incoming) {
          if (!w.id || !Array.isArray(w.mainSetTemplate)) {
            reject(new Error("Invalid workout format"));
            return;
          }
        }

        const existing = getCustomWorkouts();
        let imported = 0;

        for (const w of incoming) {
          if (existing.length + imported >= MAX_WORKOUTS) break;
          // Re-ID to avoid collisions
          const existingIndex = existing.findIndex((ex) => ex.id === w.id);
          if (existingIndex >= 0) {
            existing[existingIndex] = w; // overwrite
            imported++;
          } else {
            existing.push(w);
            imported++;
          }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        resolve(imported);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
