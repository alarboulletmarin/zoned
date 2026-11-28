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

/** Where to look when a phase has nothing at the runner's level */
const NEIGHBOUR_PHASES: Partial<Record<TrainingPhase, TrainingPhase[]>> = {
  base: ["build"],
  build: ["base", "peak"],
  peak: ["build", "taper"],
  taper: ["peak"],
};

/** Tags of the jogs written for the days around a race */
const RACE_AROUND_TAGS = new Set(["opener", "shakeout", "pre-race", "race-prep", "race-day", "post-race"]);

const ROAD_DISTANCES = new Set<RaceDistance>(["5K", "10K", "semi", "marathon"]);
const QUALITY_INTENSITIES = new Set(["M", "T", "I", "R"]);

/**
 * A long run is a quality one when its main set asks for anything above easy
 * pace. Read from the blocks, never from the name or the load tag: "Sortie
 * longue vallonnée" is tagged hard and is an easy run on hills, "Sortie longue
 * progressive" ends at marathon pace.
 */
export function isQualityLongRun(w: Pick<WorkoutTemplate, "mainSetTemplate">): boolean {
  return w.mainSetTemplate.some((b) => !!b.intensityType && QUALITY_INTENSITIES.has(b.intensityType));
}

/** The template only makes sense on hills: stated, tagged, or climbing in its blocks */
export function isHillyTemplate(w: Pick<WorkoutTemplate, "environment" | "selectionCriteria" | "mainSetTemplate">): boolean {
  return w.environment.requiresHills
    || w.selectionCriteria.tags.includes("hills")
    || w.mainSetTemplate.some((b) => (b.elevationGainM ?? 0) > 0);
}

/**
 * A long run written for a longer race: three quarters of an hour or more at
 * marathon pace. "Sortie longue simulation course" (100 minutes at marathon
 * pace with aid stations) was the peak long run of half-marathon plans.
 */
export function isOffDistanceLongRun(w: Pick<WorkoutTemplate, "mainSetTemplate">, raceDistance: RaceDistance): boolean {
  if (raceDistance !== "5K" && raceDistance !== "10K" && raceDistance !== "semi") return false;
  return w.mainSetTemplate.some((b) => b.intensityType === "M" && (b.durationMin ?? 0) * (b.repetitions ?? 1) >= 45);
}

/**
 * Catalogue entries a generated plan never prescribes on its own. They stay in
 * the library for whoever looks for them.
 *   - "situational": needs a pool, a bike, heat, bad weather, a fasted morning
 *     or a second run the same day, nothing a plan can assume.
 *   - "expert": a named method or an advanced concept (critical velocity,
 *     DFA alpha1, Canova, NRRs), only for advanced and elite runners.
 *   - "social": relays with a partner, a group run.
 */
export function isPlanEligible(w: Pick<WorkoutTemplate, "selectionCriteria">, difficulty: Difficulty): boolean {
  const tags = w.selectionCriteria.tags;
  if (tags.includes("situational")) return false;
  // Run with a partner or a group: a plan cannot promise one.
  if (tags.includes("social")) return false;
  if (tags.includes("expert") && DIFFICULTY_LEVELS[difficulty] <= DIFFICULTY_LEVELS.intermediate) return false;
  return true;
}

/** Keep the filtered pool only when it leaves something to pick from */
function soft<T>(pool: T[], keep: (item: T) => boolean): T[] {
  const kept = pool.filter(keep);
  return kept.length > 0 ? kept : pool;
}

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

export interface SelectionOptions {
  /** Long run slots: an easy long run, or one with a block above easy pace */
  longRunIntent?: "easy" | "quality";
  /** Take this template when it survives every filter (same session two weeks running) */
  preferWorkoutId?: string;
}

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
  /**
   * Retire les séances de la semaine AVANT de resserrer le pool, et rend le
   * filtre de phase souple. Les filtres suivants ne gardent leur résultat que
   * s'il n'est pas vide : une séance déjà posée ne peut donc plus revenir
   * tant qu'une autre de la même catégorie existe au catalogue.
   */
  excludeEarly = false,
  options: SelectionOptions = {},
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

  // Situational templates never, expert ones only from advanced up.
  candidates = soft(candidates, (w) => isPlanEligible(w, difficulty));

  // A road plan holds its hill work in its hill sessions. Easy runs and long
  // runs on hills turned a half-marathon plan into twelve hilly outings out of
  // fifty-six, two of them actual hill sessions.
  const isEasyOrLong = slotType === "easy" || slotType === "recovery" || slotType === "long_run";
  if (ROAD_DISTANCES.has(raceDistance) && isEasyOrLong) {
    candidates = soft(candidates, (w) => !isHillyTemplate(w));
  }

  // Openers, shakeouts and post-race jogs belong around a race. Drawn into
  // an easy slot they put an "Activation pré-course" in week 1 of a plan.
  if ((slotType === "easy" || slotType === "recovery") && phase !== "taper") {
    candidates = soft(candidates, (w) => !w.selectionCriteria.tags.some((t) => RACE_AROUND_TAGS.has(t)));
  }

  if (slotType === "long_run") {
    candidates = soft(candidates, (w) => !isOffDistanceLongRun(w, raceDistance));
    if (options.longRunIntent) {
      const wantQuality = options.longRunIntent === "quality";
      candidates = soft(candidates, (w) => w.category !== "long_run" || isQualityLongRun(w) === wantQuality);
    }
  }

  if (excludeEarly && excludeWorkoutIds.length > 0) {
    const excluded = new Set(excludeWorkoutIds);
    candidates = candidates.filter((w) => !excluded.has(w.id));
    if (candidates.length === 0) return null;
  }

  const beforePhaseFilter = candidates;

  // Step 2: Filter by phase
  // For easy/recovery slots, relax the phase filter, low-intensity
  // workouts are appropriate regardless of training phase
  if (slotType !== "easy" && slotType !== "recovery") {
    const inPhase = candidates.filter((w) =>
      w.selectionCriteria.phases.includes(phase),
    );
    candidates = excludeEarly && inPhase.length === 0 ? candidates : inPhase;
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
  // Nothing comes from a level above the runner's. The tolerance only goes
  // downward: an intermediate may run a beginner tempo in base, a beginner
  // never runs an intermediate long run. Intermediate long runs drawn into
  // beginner plans, and advanced "simulation" long runs drawn into
  // intermediate ones, were most of what made those plans too hard.
  const MIN_POOL_FOR_VARIETY = 4;
  const exactLevel = candidates.filter((w) => w.difficulty === difficulty);
  const within = (down: number) => candidates.filter((w) => {
    const gap = diffLevel - DIFFICULTY_LEVELS[w.difficulty];
    return gap >= 0 && gap <= down;
  });
  if (exactLevel.length >= MIN_POOL_FOR_VARIETY) {
    candidates = exactLevel;
  } else {
    // An easy run is an easy run: a recovery jog may come from any level
    // below, an easy run from two levels below. Holding advanced runners to
    // their own two recovery templates repeated one of them thirteen times.
    const down = slotType === "recovery" ? 3 : slotType === "easy" ? 2 : slotType === "long_run" ? 2 : 3;
    const band = within(down);
    const atOrBelow = within(3);
    // A catalogue gap at this level and phase (no beginner tempo for the
    // taper, no beginner trail session for the peak) is filled from the
    // neighbouring phase at the runner's level before anything from above.
    const neighbours = NEIGHBOUR_PHASES[phase] ?? [];
    const fromNeighbourPhase = beforePhaseFilter.filter((w) =>
      DIFFICULTY_LEVELS[w.difficulty] <= diffLevel
      && w.selectionCriteria.phases.some((p) => neighbours.includes(p))
      && loadFilter.includes(w.selectionCriteria.relativeLoad),
    );
    // Then from any phase, minus what this week already holds: the beginner
    // taper tempo slot found its only beginner tempo taken by the race-pace
    // slot and fell back on an intermediate template.
    const weekIds = new Set(excludeWorkoutIds);
    const anyPhaseAtOrBelow = beforePhaseFilter.filter((w) =>
      DIFFICULTY_LEVELS[w.difficulty] <= diffLevel
      && loadFilter.includes(w.selectionCriteria.relativeLoad)
      && !weekIds.has(w.id),
    );
    if (band.length > 0) {
      candidates = band;
    } else if (atOrBelow.length > 0) {
      candidates = atOrBelow;
    } else if (fromNeighbourPhase.length > 0) {
      candidates = fromNeighbourPhase;
    } else if (anyPhaseAtOrBelow.length > 0) {
      candidates = anyPhaseAtOrBelow;
    } else if (slotType === "key_quality") {
      // Last resort, a catalogue gap: one level up, and only a template tagged
      // moderate, i.e. softer than what the runner's own level would prescribe.
      const softerAbove = candidates.filter(
        (w) => DIFFICULTY_LEVELS[w.difficulty] === diffLevel + 1
          && w.selectionCriteria.relativeLoad === "moderate",
      );
      if (softerAbove.length > 0) candidates = softerAbove;
    }
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

  // A long run named for the runner's own level when one fits: "Sortie longue
  // débutant" in an intermediate plan reads as a mistake even when the
  // session itself is right.
  if (slotType === "long_run") {
    candidates = soft(candidates, (w) => w.difficulty === difficulty);
  }

  // Step 6: Drop workouts already placed this week. Giving up here lets the
  // caller try the slot's next session type, which usually has a fresh pool,
  // keeping the duplicate instead is what put the same run on three days.
  if (excludeWorkoutIds.length > 0) {
    const excluded = new Set(excludeWorkoutIds);
    candidates = candidates.filter((w) => !excluded.has(w.id));
    if (candidates.length === 0) return null;
  }

  if (options.preferWorkoutId) {
    const preferred = candidates.find((w) => w.id === options.preferWorkoutId);
    if (preferred) {
      return {
        workoutId: preferred.id,
        estimatedDurationMin: Math.max(20, estimateWorkoutDuration(preferred)),
        sessionType,
      };
    }
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
  const options: SelectionOptions = {
    longRunIntent: slot.longRunIntent,
    preferWorkoutId: slot.preferWorkoutId,
  };
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
      false,
      options,
    );
    if (result) return result;
  }

  // Nothing fresh in the narrowed pools: widen them, still without anything
  // already placed this week. Retrying straight without the exclusion put
  // the same tempo on Wednesday and Friday of a taper week while the
  // catalogue held a dozen others.
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
        excludeWorkoutIds,
        targetDurationMin,
        preferTags,
        true,
        options,
      );
      if (result) return result;
    }
  }

  // The catalogue has nothing else for any of the slot's types: repeat a
  // session rather than leave the day empty.
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
        false,
        options,
      );
      if (result) return result;
    }
  }

  return null;
}
