/**
 * Long Run Progression, Progressive long run distance calculator
 *
 * Implements a smooth, gradual progression with gentle step-backs.
 * The long run peaks 3-4 weeks before the race, not earlier.
 *
 * Key principles:
 * - Gradual build: +1.5-2.5km per build week (level-dependent)
 * - Step-back every 3rd week: reduce by ~20% from PREVIOUS week (not from peak)
 * - After step-back, resume from where you left off (not jump back to peak)
 * - Peak is reached late in the plan (3-4 weeks before taper)
 * - Taper: smooth exponential reduction
 *
 * References:
 * - Pfitzinger, P. (2009). Advanced Marathoning. 2nd ed.
 * - Daniels, J. (2014). Daniels' Running Formula. 3rd ed.
 */

import type { Difficulty } from "@/types";
import type { RaceDistance, TrainingGoal } from "@/types/plan";
import type { TrainingPaces } from "./paceEngine";
import { estimateDurationForDistance } from "./paceEngine";
import { getGoalModifiers } from "./constants";

// ── Types ──────────────────────────────────────────────────────

export interface LongRunTarget {
  weekNumber: number;
  distanceKm: number;
  durationMin: number;
  isStepBack: boolean;
}

// ── Config per race distance ───────────────────────────────────

interface LongRunConfig {
  peakFraction: number;
  absoluteMaxKm: number;
  startFraction: number;
  incrementKm: Record<Difficulty, number>;
  stepBackReduction: number;  // e.g. 0.80 = reduce to 80% of previous
  stepBackFrequency: number;  // every N weeks
  peakWeeksBeforeRace: number;
}

// absoluteMaxKm is a ceiling for the km target; the duration cap below and
// the weekly share cap bind first for most runners. It is not the peak: the
// peak also follows the weekly volume (Daniels: 25-30 % of the week), so a
// half-marathoner at 100 km a week is not held to a 19 km long run.
const LONG_RUN_CONFIG: Record<RaceDistance, LongRunConfig> = {
  "5K": {
    peakFraction: 2.5,
    absoluteMaxKm: 22,
    startFraction: 0.55,
    incrementKm: { beginner: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 2,
  },
  "10K": {
    peakFraction: 1.8,
    absoluteMaxKm: 26,
    startFraction: 0.55,
    incrementKm: { beginner: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.5 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 2,
  },
  semi: {
    peakFraction: 0.90,
    absoluteMaxKm: 30,
    startFraction: 0.50,
    incrementKm: { beginner: 1.5, intermediate: 2.0, advanced: 2.5, elite: 3.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 3,
  },
  marathon: {
    peakFraction: 0.78,
    absoluteMaxKm: 36,
    startFraction: 0.45,
    incrementKm: { beginner: 1.5, intermediate: 2.0, advanced: 2.5, elite: 3.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 4,
  },
  trail_short: {
    peakFraction: 0.70,
    absoluteMaxKm: 28,
    startFraction: 0.45,
    incrementKm: { beginner: 1.5, intermediate: 2.0, advanced: 2.5, elite: 3.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 3,
  },
  trail: {
    peakFraction: 0.55,
    absoluteMaxKm: 40,
    startFraction: 0.40,
    incrementKm: { beginner: 2.0, intermediate: 2.5, advanced: 3.0, elite: 4.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 4,
  },
  ultra: {
    peakFraction: 0.40,
    absoluteMaxKm: 50,
    startFraction: 0.35,
    incrementKm: { beginner: 2.0, intermediate: 3.0, advanced: 3.5, elite: 4.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 4,
  },
};

/**
 * Share of the peak weekly volume the long run should reach when that is more
 * than the distance-based target (Daniels: 25-30 % of the week; Hansons:
 * 25-30 %). Without it a 141 km/week 5K plan carried a 12.5 km long run.
 */
const LONG_RUN_VOLUME_SHARE = 0.27;

/**
 * Longest sensible long run in minutes. Daniels caps at 150 min, Hansons at
 * 3 h; the km target was blind to pace, so a slow marathoner got a 4-hour
 * outing.
 */
const MAX_LONG_RUN_MINUTES: Record<RaceDistance, number> = {
  "5K": 120,
  "10K": 130,
  semi: 150,
  marathon: 195,
  trail_short: 180,
  trail: 240,
  ultra: 300,
};

const MAX_COMFORTABLE_START: Record<Difficulty, number> = {
  beginner: 8,
  intermediate: 14,
  advanced: 18,
  elite: 22,
};

/**
 * Safety ceiling on how fast the long run may grow, per week.
 * The configured incrementKm is a comfortable pace, not a limit: when the plan
 * needs more to reach its peak on time, we go faster, up to this ceiling.
 */
const MAX_LONG_RUN_INCREMENT: Record<Difficulty, number> = {
  beginner: 2.5,
  intermediate: 3.0,
  advanced: 3.5,
  elite: 4.0,
};

// ── Main function ──────────────────────────────────────────────

export function calculateLongRunProgression(
  totalWeeks: number,
  raceDistance: RaceDistance,
  difficulty: Difficulty,
  taperWeeks: number,
  paces: TrainingPaces,
  currentLongRunKm?: number,
  trainingGoal?: TrainingGoal,
  intermediateRaceWeeks?: number[],
  /** Peak weekly km of the volume model, lifts the long run with the volume */
  peakWeeklyKm?: number,
): LongRunTarget[] {
  const config = LONG_RUN_CONFIG[raceDistance];
  const raceDistanceKm = getRaceDistanceKm(raceDistance);
  const goalMods = getGoalModifiers(trainingGoal);

  // 1. Peak and start distances: the larger of the distance-based target and
  // the volume share, capped in km and in minutes at easy pace.
  const easyPace = (paces.E.min + paces.E.max) / 2;
  const distanceTarget = raceDistanceKm * config.peakFraction;
  const volumeTarget = (peakWeeklyKm ?? 0) * LONG_RUN_VOLUME_SHARE;
  const durationCapKm = easyPace > 0 ? MAX_LONG_RUN_MINUTES[raceDistance] / easyPace : Infinity;
  const peakKm = roundKm(Math.min(
    Math.max(distanceTarget, volumeTarget),
    config.absoluteMaxKm,
    durationCapKm,
  ));
  const comfortCap = currentLongRunKm ?? MAX_COMFORTABLE_START[difficulty];
  const startKm = Math.min(peakKm * config.startFraction, comfortCap);

  // 2. Calculate the ideal increment to reach peak exactly on time.
  // The taper window and the "peak N weeks before race" window overlap, they
  // both count back from race day. Subtracting both cut the build budget by a
  // third and inflated the required increment.
  const buildEndWeek = Math.max(
    1,
    totalWeeks - Math.max(taperWeeks, config.peakWeeksBeforeRace),
  );
  // Count how many build weeks we have (excluding step-back weeks)
  const totalBuildWeeks = buildEndWeek;
  const buildWeeksWithStepBacks = totalBuildWeeks;
  const stepBackCount = Math.floor((buildWeeksWithStepBacks - 1) / config.stepBackFrequency);
  const actualBuildWeeks = buildWeeksWithStepBacks - stepBackCount;

  // Calibrate increment so we reach peak on time, neither too early nor never.
  // Taking min(configured, needed) capped the progression at the comfortable
  // pace, so runners starting from a short long run never reached the peak
  // (a 16-week beginner marathon topped out at 22km instead of ~30km).
  const neededIncrement = actualBuildWeeks > 1
    ? (peakKm - startKm) / (actualBuildWeeks - 1)
    : peakKm - startKm;
  // needed <= cap → reach the peak exactly on time. needed > cap → progress as
  // fast as is safe and fall short, which the plan warnings surface to the user.
  const safetyCap = MAX_LONG_RUN_INCREMENT[difficulty] * goalMods.longRunIncrementMultiplier;
  const calibratedIncrement = Math.min(Math.max(neededIncrement, 1.0), safetyCap);

  // 3. Build the progression
  //
  // Pattern: 2 build weeks + 1 step-back, repeat.
  // After step-back, FIRST week resumes at same level as before step-back.
  // SECOND week adds one increment. Then step-back again.
  //
  // Example with incr=1.5: 14 → 15.5 → 12.5(sb) → 15.5 → 17 → 13.5(sb) → 17 → 18.5 ...
  //                          ^     ^       ↓          ^resume  ^+incr  ↓
  //
  const targets: LongRunTarget[] = [];
  let currentKm = startKm;
  let cycleWeek = 0; // 0-based position within 3-week cycle (0=build, 1=build, 2=stepback)

  for (let week = 1; week <= totalWeeks; week++) {
    // Race week, only race plans have one. Non-race plans (base building,
    // return from injury, beginner start) have no taper, and zeroing their last
    // week left the long run with no target, so it fell back to the raw
    // template duration and blew past the weekly volume.
    if (week === totalWeeks && taperWeeks > 0) {
      targets.push({ weekNumber: week, distanceKm: 0, durationMin: 0, isStepBack: false });
      continue;
    }

    // Taper weeks
    if (week > totalWeeks - taperWeeks) {
      const taperWeekIndex = week - (totalWeeks - taperWeeks);
      const fraction = Math.exp(-0.4 * taperWeekIndex);
      // Keep a real run in the taper, but never longer than the plan's own
      // long runs: a fixed 8 km floor exceeded the peak of short beginner plans.
      const taperKm = Math.max(roundKm(currentKm * fraction), Math.min(8, roundKm(peakKm * 0.6)));
      targets.push({
        weekNumber: week,
        distanceKm: taperKm,
        durationMin: estimateDurationForDistance(taperKm, "E", paces),
        isStepBack: false,
      });
      continue;
    }

    // Intermediate race week: force step-back to avoid peak long run on race week
    if (intermediateRaceWeeks?.includes(week)) {
      const stepBackKm = roundKm(currentKm * config.stepBackReduction);
      targets.push({
        weekNumber: week,
        distanceKm: stepBackKm,
        durationMin: estimateDurationForDistance(stepBackKm, "E", paces),
        isStepBack: true,
      });
      // Reset cycle so next week resumes build
      cycleWeek = 0;
      continue;
    }

    // 3-week cycle: build → build → step-back
    if (cycleWeek === 2 && week > 2) {
      // Step-back: display 80% of current but DON'T modify currentKm
      // Next build week will resume from currentKm (the real progression level)
      const stepBackKm = roundKm(currentKm * config.stepBackReduction);
      targets.push({
        weekNumber: week,
        distanceKm: stepBackKm,
        durationMin: estimateDurationForDistance(stepBackKm, "E", paces),
        isStepBack: true,
      });
      cycleWeek = 0;
      // currentKm is NOT modified, resume from here next build week
      continue;
    }

    // Build week, increment progression
    if (week > 1) {
      currentKm = Math.min(currentKm + calibratedIncrement, peakKm);
    }

    let weekKm = roundKm(currentKm);

    // Cap the jump from the previous week. After a step-back the jump is
    // expected, it resumes the pre-step-back level, so allow the step-back
    // reduction on top of one increment instead of clamping it away.
    const lastTarget = targets.at(-1);
    if (lastTarget && lastTarget.distanceKm > 0) {
      const maxJump = lastTarget.isStepBack
        ? lastTarget.distanceKm * (1 / config.stepBackReduction - 1) + calibratedIncrement
        : Math.max(3.0, calibratedIncrement);
      if (weekKm - lastTarget.distanceKm > maxJump) {
        weekKm = roundKm(lastTarget.distanceKm + maxJump);
      }
    }

    targets.push({
      weekNumber: week,
      distanceKm: weekKm,
      durationMin: estimateDurationForDistance(weekKm, "E", paces),
      isStepBack: false,
    });
    cycleWeek++;
  }

  return targets;
}

// ── Weekly share cap ────────────────────────────────────────────

/**
 * Largest share of the weekly volume the long run may represent.
 * The long run drives adaptation but a session worth 70% of the week is a
 * standalone effort with no support around it. Endurance events tolerate a
 * higher share than short races, where weekly frequency matters more.
 */
// Daniels caps easy long runs near a quarter to a third of weekly volume, and
// Pfitzinger's marathon long runs land around 35-40 % of their week. Allowing
// half the week in one run left a 33km outing inside a 61km week, which
// recovers like a race rather than like training. Trail keeps more headroom:
// its long runs are the specific session, not a share of a road week.
//
// Low-volume weeks get more room: Higdon's first-timers run 32 km inside a
// 64 km week (50 %), and holding a 4-day marathon plan to 40 % capped its
// long run at 17 km. The extra share fades out between LOW_VOLUME_KM and
// FULL_SHARE_KM.
const MAX_LONG_RUN_SHARE: Record<RaceDistance, { base: number; lowVolumeExtra: number }> = {
  "5K": { base: 0.35, lowVolumeExtra: 0.05 },
  "10K": { base: 0.35, lowVolumeExtra: 0.05 },
  semi: { base: 0.38, lowVolumeExtra: 0.08 },
  marathon: { base: 0.40, lowVolumeExtra: 0.10 },
  trail_short: { base: 0.45, lowVolumeExtra: 0.05 },
  trail: { base: 0.50, lowVolumeExtra: 0 },
  ultra: { base: 0.50, lowVolumeExtra: 0 },
};
const LOW_VOLUME_KM = 45;
const FULL_SHARE_KM = 65;

/** Largest share of a week of `weeklyKm` the long run may take */
export function maxLongRunShare(weeklyKm: number, raceDistance: RaceDistance): number {
  const { base, lowVolumeExtra } = MAX_LONG_RUN_SHARE[raceDistance];
  const t = Math.min(1, Math.max(0, (FULL_SHARE_KM - weeklyKm) / (FULL_SHARE_KM - LOW_VOLUME_KM)));
  return base + lowVolumeExtra * t;
}

/**
 * Clamp a long run to its share of the week. Returns the input untouched when
 * the weekly volume is unknown, so callers can pass through freely.
 */
export function capLongRunToWeeklyShare(
  longRunKm: number,
  weeklyKm: number,
  raceDistance: RaceDistance,
): number {
  if (weeklyKm <= 0 || longRunKm <= 0) return longRunKm;
  const cap = weeklyKm * maxLongRunShare(weeklyKm, raceDistance);
  return longRunKm <= cap ? longRunKm : roundKm(cap);
}

// ── Helpers ─────────────────────────────────────────────────────

function getRaceDistanceKm(raceDistance: RaceDistance): number {
  const distances: Record<RaceDistance, number> = {
    "5K": 5, "10K": 10, semi: 21.1, marathon: 42.195,
    trail_short: 30, trail: 60, ultra: 100,
  };
  return distances[raceDistance];
}

function roundKm(km: number): number {
  return Math.round(km * 2) / 2;
}
