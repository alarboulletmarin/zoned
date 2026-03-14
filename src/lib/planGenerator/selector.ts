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

/**
 * Estimate the actual duration of a workout from its blocks.
 * Falls back to typicalDuration if blocks don't have timing info.
 */
function estimateWorkoutDuration(workout: WorkoutTemplate): number {
  let total = 0;
  let hasBlockDurations = false;

  const blocks: WorkoutBlock[] = [
    ...(workout.warmupTemplate || []),
    ...(workout.mainSetTemplate || []),
    ...(workout.cooldownTemplate || []),
  ];

  for (const block of blocks) {
    if (block.durationMin) {
      total += block.durationMin * (block.repetitions || 1);
      hasBlockDurations = true;
    } else if (block.distanceM) {
      // Estimate duration from distance: ~5min/km average (including recovery)
      const distanceKm = block.distanceM / 1000;
      const reps = block.repetitions || 1;
      const runTimeMin = distanceKm * 5;
      const hasRecovery = block.recovery || block.rest;
      const recoveryMin = hasRecovery ? runTimeMin * 0.6 : 0;
      total += (runTimeMin + recoveryMin) * reps;
      hasBlockDurations = true;
    } else if (block.repetitions && block.repetitions > 1) {
      // Interval block with reps but no explicit duration/distance
      // Estimate ~2min per rep (work + recovery) for short intervals
      const hasRecovery = block.recovery || block.rest;
      const perRepMin = hasRecovery ? 2 : 1;
      total += perRepMin * block.repetitions;
      hasBlockDurations = true;
    }
  }

  if (hasBlockDurations && total > 0) {
    return Math.round(total);
  }

  // Fallback to typicalDuration
  return Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
}

// ── Internal selector ──────────────────────────────────────────────

function findBestWorkout(
  sessionType: SessionType,
  phase: TrainingPhase,
  difficulty: Difficulty,
  raceDistance: RaceDistance,
  allWorkouts: WorkoutTemplate[],
  usedWorkoutIds: string[],
  _volumePercent: number,
  slotType: string,
  _elevationGain?: number,
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
  let finalList = unused.length > 0 ? unused : candidates;

  // Step 8: Add randomization within priority tiers for variety
  // Group by similar priority (within 10 points) and pick randomly within top tier
  if (finalList.length > 1) {
    const topPriority = finalList[0].selectionCriteria.priorityScore;
    const topTier = finalList.filter(
      (w) => topPriority - w.selectionCriteria.priorityScore <= 15,
    );
    if (topTier.length > 1) {
      // Shuffle top tier using Fisher-Yates
      for (let i = topTier.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topTier[i], topTier[j]] = [topTier[j], topTier[i]];
      }
      finalList = [...topTier, ...finalList.filter(
        (w) => topPriority - w.selectionCriteria.priorityScore > 15,
      )];
    }
  }

  if (finalList.length === 0) return null;

  const workout = finalList[0];

  // Use actual workout duration from blocks — don't scale by volume %
  // Volume reduction comes from selecting lighter workouts, not shrinking durations
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
  elevationGain?: number,
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
      elevationGain,
    );
    if (result) return result;
  }
  return null;
}
