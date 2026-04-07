import type {
  WorkoutTemplate,
  WorkoutBlock,
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
  recovery: ["recovery"],                         // Recovery searches only recovery workouts
  endurance: ["endurance", "recovery"],            // Endurance falls back to recovery (not fartlek)
  tempo: ["tempo"],
  threshold: ["threshold"],
  vo2max: ["vma_intervals"],
  speed: ["vma_intervals"],
  long_run: ["long_run", "endurance"],           // Long run can also use endurance workouts
  hills: ["hills"],
  fartlek: ["fartlek"],
  race_specific: ["race_pace", "tempo"],         // Race specific can fall back to tempo
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

/**
 * Estimate the actual duration of a workout from its blocks.
 * Falls back to typicalDuration if blocks don't have timing info.
 */
/**
 * Estimate block group duration from structured data.
 */
function estimateBlocksDuration(blocks: WorkoutBlock[]): number {
  let total = 0;
  let hasDurations = false;

  for (const block of blocks) {
    if (block.durationMin) {
      total += block.durationMin * (block.repetitions || 1);
      hasDurations = true;
    } else if (block.distanceM) {
      const distanceKm = block.distanceM / 1000;
      const reps = block.repetitions || 1;
      const runTimeMin = distanceKm * 5;
      const hasRecovery = block.recovery || block.rest;
      const recoveryMin = hasRecovery ? runTimeMin * 0.6 : 0;
      total += (runTimeMin + recoveryMin) * reps;
      hasDurations = true;
    } else if (block.repetitions && block.repetitions > 1) {
      const hasRecovery = block.recovery || block.rest;
      const perRepMin = hasRecovery ? 2 : 1;
      total += perRepMin * block.repetitions;
      hasDurations = true;
    }
  }

  return hasDurations ? total : -1; // -1 = no data
}

/**
 * Estimate workout duration from template blocks.
 * Returns the base (unscaled) duration: warmup + main + cooldown.
 */
function estimateWorkoutDuration(workout: WorkoutTemplate): number {
  const warmupMin = estimateBlocksDuration(workout.warmupTemplate || []);
  const mainMin = estimateBlocksDuration(workout.mainSetTemplate || []);
  const cooldownMin = estimateBlocksDuration(workout.cooldownTemplate || []);

  const hasData = warmupMin >= 0 || mainMin >= 0 || cooldownMin >= 0;

  if (hasData) {
    const warmup = Math.max(0, warmupMin);
    const main = Math.max(0, mainMin);
    const cooldown = Math.max(0, cooldownMin);
    return Math.round(warmup + main + cooldown);
  }

  // Fallback to typicalDuration average
  const avg = (workout.typicalDuration.min + workout.typicalDuration.max) / 2;
  return Math.round(avg);
}

// ── Internal selector ──────────────────────────────────────────────

function findBestWorkout(
  sessionType: SessionType,
  phase: TrainingPhase,
  difficulty: Difficulty,
  raceDistance: RaceDistance,
  allWorkouts: WorkoutTemplate[],
  usedWorkoutIds: string[],
  slotType: string,
  _elevationGain?: number,
  daysPerWeek: number = 5,
): WorkoutSelection | null {
  const categories = SESSION_TO_CATEGORY[sessionType] ?? [];
  const diffLevel = DIFFICULTY_LEVELS[difficulty];
  // Step 1: Filter by category
  let candidates = allWorkouts.filter((w) => categories.includes(w.category));

  // Step 1b: Exclude trail workouts for road races, include for trail races
  const isTrailRace = raceDistance === "trail_short" || raceDistance === "trail" || raceDistance === "ultra";
  if (!isTrailRace) {
    candidates = candidates.filter((w) =>
      !w.selectionCriteria.tags.includes("trail"),
    );
  }

  // For trail races, broaden endurance and long_run to include hills
  if (isTrailRace && (sessionType === "endurance" || sessionType === "long_run")) {
    const hillsCandidates = allWorkouts.filter((w) => w.category === "hills");
    const existingIds = new Set(candidates.map(c => c.id));
    for (const hw of hillsCandidates) {
      if (!existingIds.has(hw.id)) {
        candidates.push(hw);
      }
    }
  }

  // Step 2: Filter by phase
  // For easy/recovery slots, relax the phase filter — low-intensity
  // workouts are appropriate regardless of training phase
  if (slotType !== "easy" && slotType !== "recovery") {
    candidates = candidates.filter((w) =>
      w.selectionCriteria.phases.includes(phase),
    );
  } else {
    // Still prefer phase-matching workouts, but keep all as fallback
    const phaseMatched = candidates.filter((w) =>
      w.selectionCriteria.phases.includes(phase),
    );
    if (phaseMatched.length >= 3) {
      candidates = phaseMatched;
    }
    // Otherwise keep full candidate pool for variety
  }

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

  // Step 4b: Cap duration for easy/recovery slots on low-day plans
  if ((slotType === "easy" || slotType === "recovery") && daysPerWeek <= 4) {
    const maxEasyDuration = daysPerWeek <= 3 ? 50 : 60; // minutes
    filtered = candidates.filter(w => {
      const avgDuration = (w.typicalDuration.min + w.typicalDuration.max) / 2;
      return avgDuration <= maxEasyDuration;
    });
    if (filtered.length > 0) candidates = filtered;
  }

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

  // Step 7: Variety — sort by least-used first, then by priority within tier
  // Count how many times each candidate has been used in the plan so far
  const usageCounts = new Map<string, number>();
  for (const id of usedWorkoutIds) {
    usageCounts.set(id, (usageCounts.get(id) ?? 0) + 1);
  }

  // Sort candidates: least-used first, then by priority score
  candidates.sort((a, b) => {
    const usageA = usageCounts.get(a.id) ?? 0;
    const usageB = usageCounts.get(b.id) ?? 0;
    // Primary: least used first
    if (usageA !== usageB) return usageA - usageB;
    // Secondary: higher priority first
    return b.selectionCriteria.priorityScore - a.selectionCriteria.priorityScore;
  });

  // Step 8: Randomize among the least-used candidates for freshness
  let finalList = candidates;
  if (finalList.length > 1) {
    const minUsage = usageCounts.get(finalList[0].id) ?? 0;
    const leastUsed = finalList.filter(w => (usageCounts.get(w.id) ?? 0) <= minUsage + 1);
    if (leastUsed.length > 1) {
      // Shuffle among least-used
      for (let i = leastUsed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [leastUsed[i], leastUsed[j]] = [leastUsed[j], leastUsed[i]];
      }
      finalList = [...leastUsed, ...finalList.filter(w => (usageCounts.get(w.id) ?? 0) > minUsage + 1)];
    }
  }

  if (finalList.length === 0) return null;

  const workout = finalList[0];

  const estimatedDurationMin = estimateWorkoutDuration(workout);

  return {
    workoutId: workout.id,
    estimatedDurationMin: Math.max(20, estimatedDurationMin),
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
 * 4. Calculate estimated duration from template blocks
 */
export function selectWorkout(
  slot: WeekSlot,
  phase: TrainingPhase,
  difficulty: Difficulty,
  raceDistance: RaceDistance,
  allWorkouts: WorkoutTemplate[],
  usedWorkoutIds: string[], // IDs used in last 3 weeks
  _volumePercent: number,
  elevationGain?: number,
  daysPerWeek: number = 5,
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
      slot.slotType,
      elevationGain,
      daysPerWeek,
    );
    if (result) return result;
  }
  return null;
}
