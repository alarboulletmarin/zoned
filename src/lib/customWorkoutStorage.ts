import type { WorkoutTemplate, WorkoutBlock } from "@/types";
import { normalizeWorkoutStructureSource } from "@/lib/workoutStructure";

const STORAGE_KEY = "zoned-custom-workouts";
const MAX_WORKOUTS = 20;
const CUSTOM_ID_PREFIX = "CUSTOM-";

export function getCustomWorkouts(): WorkoutTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const workouts = stored ? JSON.parse(stored) as WorkoutTemplate[] : [];
    return workouts.map((workout) => normalizeWorkoutStructureSource(workout));
  } catch {
    return [];
  }
}

export function getCustomWorkout(id: string): WorkoutTemplate | undefined {
  return getCustomWorkouts().find((w) => w.id === id);
}

export function saveCustomWorkout(workout: WorkoutTemplate): void {
  const workouts = getCustomWorkouts();
  const normalized = normalizeWorkoutStructureSource(workout);
  const index = workouts.findIndex((w) => w.id === workout.id);
  if (index >= 0) {
    workouts[index] = normalized;
  } else {
    if (workouts.length >= MAX_WORKOUTS) {
      throw new Error("Maximum custom workouts reached");
    }
    workouts.push(normalized);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function deleteCustomWorkout(id: string): void {
  const workouts = getCustomWorkouts().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

/**
 * A fresh id in the custom namespace. Every workout stored here must carry one:
 * plans, favourites and share links all resolve by id, so reusing a catalogue
 * id would silently reroute them to the copy.
 */
export function createCustomWorkoutId(): string {
  return `${CUSTOM_ID_PREFIX}${Date.now().toString(36)}`;
}

/**
 * Whether an id belongs to this store rather than to the catalogue.
 *
 * The distinction is not cosmetic: a catalogue id resolves for everyone, a
 * custom one only inside its author's browser. Anything building a link, a QR
 * code or a share text has to know which it is holding.
 */
export function isCustomWorkoutId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}

export function createEmptyWorkout(): WorkoutTemplate {
  const id = createCustomWorkoutId();
  const emptyBlock: WorkoutBlock = {
    description: "",
    durationMin: 10,
    zone: "Z2",
  };
  return normalizeWorkoutStructureSource({
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
  });
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
          const normalized = normalizeWorkoutStructureSource(w);
          // Re-ID to avoid collisions
          const existingIndex = existing.findIndex((ex) => ex.id === normalized.id);
          if (existingIndex >= 0) {
            existing[existingIndex] = normalized; // overwrite
            imported++;
          } else {
            existing.push(normalized);
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
