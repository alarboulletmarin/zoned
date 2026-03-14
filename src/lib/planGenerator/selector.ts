import type {
  WorkoutTemplate,
  Difficulty,
  TrainingPhase,
  SessionType,
  WorkoutCategory,
  RelativeLoad,
} from "@/types";
import type { RaceDistance } from "@/types/plan";
import type { WeekSlot } from "./weekTemplate";
import { DISTANCE_TAGS } from "./constants";

// ── Category mapping ───────────────────────────────────────────────
// Maps SessionType to the WorkoutCategory(ies) that contain matching workouts

const SESSION_TO_CATEGORY: Partial<Record<SessionType, WorkoutCategory[]>> = {
  recovery: ["recovery"],
  endurance: ["endurance"],
  tempo: ["tempo"],
  threshold: ["threshold"],
  vo2max: ["vma_intervals"],
  speed: ["vma_intervals"],
  long_run: ["long_run"],
  hills: ["hills"],
  fartlek: ["fartlek"],
  race_specific: ["race_pace"],
};

const DIFFICULTY_LEVELS: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  elite: 4,
};

// ── Types ──────────────────────────────────────────────────────────

interface WorkoutSelection {
  workoutId: string;
  estimatedDurationMin: number;
}

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Get expected relative loads for a slot type.
 */
function getLoadFilter(slotType: string): RelativeLoad[] {
  switch (slotType) {
    case "key_quality":
      return ["hard", "key"];
    case "long_run":
      return ["hard", "moderate", "key"];
    case "easy":
      return ["light", "moderate"];
    case "recovery":
      return ["light"];
    default:
      return ["moderate"];
  }
}

// ── Internal selector ──────────────────────────────────────────────

function findBestWorkout(
  sessionType: SessionType,
  phase: TrainingPhase,
  difficulty: Difficulty,
  raceDistance: RaceDistance,
  allWorkouts: WorkoutTemplate[],
  usedWorkoutIds: string[],
  volumePercent: number,
  slotType: string,
): WorkoutSelection | null {
  const categories = SESSION_TO_CATEGORY[sessionType] ?? [];
  const diffLevel = DIFFICULTY_LEVELS[difficulty];

  // Step 1: Filter by category
  let candidates = allWorkouts.filter((w) => categories.includes(w.category));

  // Step 2: Filter by phase
  candidates = candidates.filter((w) =>
    w.selectionCriteria.phases.includes(phase),
  );

  // Step 3: Filter by difficulty (exact match first, then +/-1 tolerance)
  let filtered = candidates.filter((w) => w.difficulty === difficulty);
  if (filtered.length === 0) {
    filtered = candidates.filter(
      (w) => Math.abs(DIFFICULTY_LEVELS[w.difficulty] - diffLevel) <= 1,
    );
  }
  candidates = filtered.length > 0 ? filtered : candidates;

  // Step 4: Filter by relativeLoad matching slot type
  const loadFilter = getLoadFilter(slotType);
  filtered = candidates.filter((w) =>
    loadFilter.includes(w.selectionCriteria.relativeLoad),
  );
  if (filtered.length > 0) candidates = filtered;

  // Step 5: For race_specific, filter by distance tags
  if (sessionType === "race_specific") {
    const distTags = DISTANCE_TAGS[raceDistance];
    filtered = candidates.filter((w) =>
      w.selectionCriteria.tags.some((t) => distTags.includes(t)),
    );
    if (filtered.length > 0) candidates = filtered;
  }

  // Step 6: Sort by priority score descending
  candidates.sort(
    (a, b) =>
      b.selectionCriteria.priorityScore - a.selectionCriteria.priorityScore,
  );

  // Step 7: Prefer workouts not used recently (variety)
  const unused = candidates.filter((w) => !usedWorkoutIds.includes(w.id));
  const finalList = unused.length > 0 ? unused : candidates;

  if (finalList.length === 0) return null;

  const workout = finalList[0];

  // Calculate duration based on typical duration and volume
  const baseDuration =
    (workout.typicalDuration.min + workout.typicalDuration.max) / 2;
  const estimatedDurationMin = Math.round(baseDuration * (volumePercent / 100));

  return {
    workoutId: workout.id,
    estimatedDurationMin: Math.max(20, estimatedDurationMin), // Minimum 20min
  };
}

// ── Main selector ──────────────────────────────────────────────────

/**
 * Select a workout for a given slot from the workout library.
 * Returns null if no suitable workout found.
 *
 * Algorithm:
 * 1. For each preferred session type in the slot, try to find a match
 * 2. Filter by category, phase, difficulty, load, and distance tags
 * 3. Sort by priority score, prefer unused workouts for variety
 * 4. Calculate estimated duration adjusted by volume percentage
 */
export function selectWorkout(
  slot: WeekSlot,
  phase: TrainingPhase,
  difficulty: Difficulty,
  raceDistance: RaceDistance,
  allWorkouts: WorkoutTemplate[],
  usedWorkoutIds: string[], // IDs used in last 3 weeks
  volumePercent: number,
): WorkoutSelection | null {
  // Try each preferred session type in order
  for (const sessionType of slot.sessionTypes) {
    const result = findBestWorkout(
      sessionType,
      phase,
      difficulty,
      raceDistance,
      allWorkouts,
      usedWorkoutIds,
      volumePercent,
      slot.slotType,
    );
    if (result) return result;
  }
  return null;
}
