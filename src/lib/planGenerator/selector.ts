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
import { DISTANCE_TAGS, DISTANCE_PROFILE, type DistanceProfile } from "./constants";
import { planRandom } from "./rng";

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
  race_specific: ["race_pace"],                  // Distance-tagged first, see RACE_SPECIFIC_FALLBACK
};

// When no race-pace template matches the target distance, fall back to the
// quality that pace corresponds to for that distance. Falling back to any
// tempo put a Hanson marathon strength run in a 5K plan as its race-specific
// session.
const RACE_SPECIFIC_FALLBACK: Record<DistanceProfile, WorkoutCategory[]> = {
  short: ["threshold", "vma_intervals"],
  long: ["tempo", "threshold"],
  trail: ["trail", "hills"],
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
  /** The session type that actually matched, may be a fallback, not slot.sessionTypes[0] */
  sessionType: SessionType;
}

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Get expected relative loads for a slot type, at the runner's level.
 *
 * A key session for a beginner is a moderate session: asking for "hard" or
 * "key" left no beginner template standing (they are almost all tagged
 * moderate) and handed every beginner an intermediate max-effort workout in
 * week 1. Advanced runners get the key-tagged sessions first.
 */
function getLoadFilter(slotType: string, difficulty: Difficulty): RelativeLoad[] {
  switch (slotType) {
    case "key_quality":
      if (difficulty === "beginner") return ["moderate", "hard"];
      if (difficulty === "intermediate") return ["hard", "key", "moderate"];
      return ["key", "hard"];
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
  excludeWorkoutIds: string[] = [],
  targetDurationMin?: number,
  preferTags: string[] = [],
): WorkoutSelection | null {
  const categories = SESSION_TO_CATEGORY[sessionType] ?? [];
  const diffLevel = DIFFICULTY_LEVELS[difficulty];
  const isTrailRace = raceDistance === "trail_short" || raceDistance === "trail" || raceDistance === "ultra";

  let candidates = allWorkouts.filter((w) => categories.includes(w.category));

  // Race-specific work must be for this distance. The tag is a hard filter;
  // when nothing carries it, the fallback is the quality that race pace maps
  // to for this distance, never a race-pace template written for another one.
  if (sessionType === "race_specific") {
    const distTags = DISTANCE_TAGS[raceDistance];
    const tagged = candidates.filter((w) =>
      w.selectionCriteria.tags.some((t) => distTags.includes(t)),
    );
    if (tagged.length > 0) {
      candidates = tagged;
    } else {
      const fallback = RACE_SPECIFIC_FALLBACK[DISTANCE_PROFILE[raceDistance]];
      candidates = allWorkouts.filter((w) => fallback.includes(w.category));
    }
  }

  // Caller preference (e.g. walk-run templates for a return to running):
  // narrow to it whenever it leaves something to pick from.
  if (preferTags.length > 0) {
    const preferred = candidates.filter((w) =>
      w.selectionCriteria.tags.some((t) => preferTags.includes(t)),
    );
    if (preferred.length > 0) candidates = preferred;
  }

  if (isTrailRace) {
    // Trail workouts are volume/elevation sessions. They stand in for aerobic
    // and race-specific work, never for recovery or track-style intervals,
    // injecting them everywhere turned every slot into a 2h mountain outing.
    const TRAIL_FRIENDLY_TYPES = new Set<SessionType>([
      "endurance", "long_run", "hills", "fartlek", "race_specific",
    ]);
    if (TRAIL_FRIENDLY_TYPES.has(sessionType)) {
      const trailCandidates = allWorkouts.filter((w) => w.category === "trail");
      const existingIds = new Set(candidates.map((c) => c.id));
      for (const tw of trailCandidates) {
        if (!existingIds.has(tw.id)) candidates.push(tw);
      }
      if (sessionType === "endurance" || sessionType === "long_run") {
        const hillsCandidates = allWorkouts.filter((w) => w.category === "hills");
        for (const hw of hillsCandidates) {
          if (!existingIds.has(hw.id)) candidates.push(hw);
        }
      }
    } else {
      candidates = candidates.filter((w) => w.category !== "trail");
    }
  } else {
    candidates = candidates.filter(
      (w) => w.category !== "trail" && !w.selectionCriteria.tags.includes("trail"),
    );
  }

  // Step 2: Filter by phase
  // For easy/recovery slots, relax the phase filter, low-intensity
  // workouts are appropriate regardless of training phase
  if (slotType !== "easy" && slotType !== "recovery") {
    candidates = candidates.filter((w) =>
      w.selectionCriteria.phases.includes(phase),
    );
  }
  // Easy and recovery slots keep the full pool: an easy run is an easy run in
  // every phase. Restricting them to phase-tagged templates left only 8 easy
  // sessions in peak, none longer than 50 minutes, so peak weeks physically
  // could not carry their volume and ended up lighter than base weeks. The
  // phase drives the quality session; the volume target drives the easy ones,
  // and targetDurationMin below already steers those toward the right length.

  // Step 3: Filter by relativeLoad matching slot type.
  // Load comes before difficulty: an easy/recovery slot must never be filled
  // with a hard session just because no easy one matches the runner's level.
  const loadFilter = getLoadFilter(slotType, difficulty);
  let filtered = candidates.filter((w) =>
    loadFilter.includes(w.selectionCriteria.relativeLoad),
  );
  if (filtered.length > 0) candidates = filtered;

  // Step 4: Filter by difficulty. Keep the exact match only when it leaves a
  // pool wide enough to fill a week without repeating: an exact-level pool of
  // one or two workouts is why 6-day plans ran the same session five times.
  //
  // A key session never comes from a level above the runner's. The tolerance
  // goes downward (an intermediate may run a beginner tempo in base), and a
  // template from the level above is only acceptable when it is tagged
  // moderate, i.e. softer than what the runner's own level would prescribe.
  const MIN_POOL_FOR_VARIETY = 4;
  const exactLevel = candidates.filter((w) => w.difficulty === difficulty);
  if (exactLevel.length >= MIN_POOL_FOR_VARIETY) {
    candidates = exactLevel;
  } else if (slotType === "key_quality") {
    const atOrBelow = candidates.filter((w) => DIFFICULTY_LEVELS[w.difficulty] <= diffLevel);
    if (atOrBelow.length > 0) {
      candidates = atOrBelow;
    } else {
      const softerAbove = candidates.filter(
        (w) => DIFFICULTY_LEVELS[w.difficulty] === diffLevel + 1
          && w.selectionCriteria.relativeLoad === "moderate",
      );
      if (softerAbove.length > 0) candidates = softerAbove;
    }
  } else {
    // An easy run is an easy run: a recovery jog may come from any level, an
    // easy run from two levels away. Holding advanced runners to their own
    // two recovery templates repeated one of them thirteen times in a plan.
    const tolerance = slotType === "recovery" ? 3 : slotType === "easy" ? 2 : 1;
    const tolerant = candidates.filter(
      (w) => Math.abs(DIFFICULTY_LEVELS[w.difficulty] - diffLevel) <= tolerance,
    );
    if (tolerant.length > 0) candidates = tolerant;
  }

  // Step 4b: Cap duration for easy/recovery slots on low-day plans
  if ((slotType === "easy" || slotType === "recovery") && daysPerWeek <= 4) {
    const maxEasyDuration = daysPerWeek <= 3 ? 50 : 60; // minutes
    filtered = candidates.filter(w => {
      const avgDuration = (w.typicalDuration.min + w.typicalDuration.max) / 2;
      return avgDuration <= maxEasyDuration;
    });
    if (filtered.length > 0) candidates = filtered;
  }

  // Step 5b: Long runs must come from the long_run catalogue when possible.
  // The endurance fallback exists for short targets, but leaving both pools
  // mixed let a 50-minute "Endurance mentale" win the slot and get stretched
  // to a 3-hour marathon long run, showing a structure nobody prescribed.
  if (slotType === "long_run") {
    const realLongRuns = candidates.filter((w) => w.category === "long_run");
    if (realLongRuns.length > 0) candidates = realLongRuns;
  }

  // Prefer templates whose own duration is close to what this slot needs.
  // Applies to easy slots too: a 15km week kept drawing 90-minute templates and
  // leaned on the volume fit to halve them, which both misnamed the session and
  // pinned the week to a floor it could never go under.
  if (slotType === "long_run" || slotType === "easy" || slotType === "recovery") {
    // Keep the templates closest to the target duration. A hard filter empties
    // the pool at both extremes (no template is short enough for a 25-minute
    // return-to-running long run, none is long enough for a 3-hour marathon
    // one), so rank by distance instead and keep the nearest band. The long run
    // duration itself comes from the progression, but the template still has to
    // be plausible: "Sortie longue endurance pure" prescribed for 25 minutes
    // named a session the runner was not doing.
    if (targetDurationMin && targetDurationMin > 0) {
      // A template whose shortest version is far longer than the slot cannot
      // be shrunk into it without becoming a different session: a 25-minute
      // return-to-running jog was drawn as a 75-95 minute "Extended Base
      // Endurance" cut to 53 minutes.
      // The converse holds too: a 10-15 minute recovery jog cannot be
      // stretched into a 60-minute easy run, yet the least-used-first rule
      // kept drawing it for load weeks of 3-day plans, which then fell short.
      const MAX_TEMPLATE_STRETCH = 1.5;
      const MIN_TEMPLATE_REACH = 0.6;
      const fitting = candidates.filter((w) =>
        w.typicalDuration.min <= targetDurationMin * MAX_TEMPLATE_STRETCH
        && w.typicalDuration.max * 1.3 >= targetDurationMin * MIN_TEMPLATE_REACH,
      );
      if (fitting.length >= 2) candidates = fitting;

      const distanceTo = (w: WorkoutTemplate): number => {
        const { min, max } = w.typicalDuration;
        if (targetDurationMin < min) return min - targetDurationMin;
        if (targetDurationMin > max) return targetDurationMin - max;
        return 0;
      };
      // Widen the band until the pool can still fill a plan without repeating:
      // a tight band left low-volume plans with a single eligible template,
      // which then showed up in nine sessions out of thirty.
      const best = Math.min(...candidates.map(distanceTo));
      const MIN_POOL = 3;
      for (const tolerance of [15, 30, 45]) {
        const nearest = candidates.filter((w) => distanceTo(w) <= best + tolerance);
        if (nearest.length >= MIN_POOL) {
          candidates = nearest;
          break;
        }
        if (tolerance === 45 && nearest.length > 0) candidates = nearest;
      }
    }
  }

  // Step 6: Drop workouts already placed this week. Giving up here lets the
  // caller try the slot's next session type, which usually has a fresh pool,
  // keeping the duplicate instead is what put the same run on three days.
  if (excludeWorkoutIds.length > 0) {
    const excluded = new Set(excludeWorkoutIds);
    candidates = candidates.filter((w) => !excluded.has(w.id));
    if (candidates.length === 0) return null;
  }

  const scoreOf = (w: WorkoutTemplate): number => {
    const base = w.selectionCriteria.priorityScore;
    if (isTrailRace && w.category === "trail") return base + 100;
    return base;
  };

  candidates.sort((a, b) => scoreOf(b) - scoreOf(a));

  const usageCounts = new Map<string, number>();
  for (const id of usedWorkoutIds) {
    usageCounts.set(id, (usageCounts.get(id) ?? 0) + 1);
  }

  candidates.sort((a, b) => {
    const usageA = usageCounts.get(a.id) ?? 0;
    const usageB = usageCounts.get(b.id) ?? 0;
    if (usageA !== usageB) return usageA - usageB;
    return scoreOf(b) - scoreOf(a);
  });

  // Step 8: Randomize among the least-used candidates for freshness
  let finalList = candidates;
  if (finalList.length > 1) {
    const minUsage = usageCounts.get(finalList[0].id) ?? 0;
    const leastUsed = finalList.filter(w => (usageCounts.get(w.id) ?? 0) <= minUsage + 1);
    if (leastUsed.length > 1) {
      // Shuffle among least-used
      for (let i = leastUsed.length - 1; i > 0; i--) {
        const j = Math.floor(planRandom() * (i + 1));
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
    sessionType,
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
  usedWorkoutIds: string[], // IDs used in last 6 weeks
  _volumePercent: number,
  elevationGain?: number,
  daysPerWeek: number = 5,
  excludeWorkoutIds: string[] = [], // IDs already placed this week
  targetDurationMin?: number, // Target duration for this slot (long runs)
): WorkoutSelection | null {
  const preferTags = slot.preferTags ?? [];
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
      excludeWorkoutIds,
      targetDurationMin,
      preferTags,
    );
    if (result) return result;
  }

  // Nothing fresh left for any of the slot's types, retry without the
  // same-week exclusion rather than leaving the day empty.
  if (excludeWorkoutIds.length > 0) {
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
        [],
        targetDurationMin,
        preferTags,
      );
      if (result) return result;
    }
  }

  return null;
}
