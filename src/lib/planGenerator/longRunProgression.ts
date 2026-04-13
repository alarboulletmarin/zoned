/**
 * Long Run Progression — Progressive long run distance calculator
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

const LONG_RUN_CONFIG: Record<RaceDistance, LongRunConfig> = {
  "5K": {
    peakFraction: 2.5,
    absoluteMaxKm: 15,
    startFraction: 0.55,
    incrementKm: { beginner: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 2,
  },
  "10K": {
    peakFraction: 1.8,
    absoluteMaxKm: 20,
    startFraction: 0.55,
    incrementKm: { beginner: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.5 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 2,
  },
  semi: {
    peakFraction: 0.90,
    absoluteMaxKm: 24,
    startFraction: 0.50,
    incrementKm: { beginner: 1.5, intermediate: 2.0, advanced: 2.5, elite: 3.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 3,
  },
  marathon: {
    peakFraction: 0.78,
    absoluteMaxKm: 35,
    startFraction: 0.45,
    incrementKm: { beginner: 1.5, intermediate: 2.0, advanced: 2.5, elite: 3.0 },
    stepBackReduction: 0.85,
    stepBackFrequency: 3,
    peakWeeksBeforeRace: 4,
  },
  trail_short: {
    peakFraction: 0.70,
    absoluteMaxKm: 25,
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

const MAX_COMFORTABLE_START: Record<Difficulty, number> = {
  beginner: 8,
  intermediate: 14,
  advanced: 18,
  elite: 22,
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
): LongRunTarget[] {
  const config = LONG_RUN_CONFIG[raceDistance];
  const raceDistanceKm = getRaceDistanceKm(raceDistance);
  const goalMods = getGoalModifiers(trainingGoal);

  // 1. Peak and start distances
  const peakKm = Math.min(raceDistanceKm * config.peakFraction, config.absoluteMaxKm);
  const comfortCap = currentLongRunKm ?? MAX_COMFORTABLE_START[difficulty];
  const startKm = Math.min(peakKm * config.startFraction, comfortCap);
  const increment = config.incrementKm[difficulty] * goalMods.longRunIncrementMultiplier;

  // 2. Calculate the ideal increment to reach peak exactly on time
  // Available build weeks = total - taper - peakWeeksBeforeRace
  const buildEndWeek = Math.max(1, totalWeeks - taperWeeks - config.peakWeeksBeforeRace);
  // Count how many build weeks we have (excluding step-back weeks)
  const totalBuildWeeks = buildEndWeek;
  const buildWeeksWithStepBacks = totalBuildWeeks;
  const stepBackCount = Math.floor((buildWeeksWithStepBacks - 1) / config.stepBackFrequency);
  const actualBuildWeeks = buildWeeksWithStepBacks - stepBackCount;

  // Calibrate increment so we reach peak on time (not too early)
  const neededIncrement = actualBuildWeeks > 1
    ? (peakKm - startKm) / (actualBuildWeeks - 1)
    : peakKm - startKm;
  // Use the smaller of configured increment and needed increment
  // This prevents hitting peak too early on long plans
  const calibratedIncrement = Math.min(increment, Math.max(neededIncrement, 1.0));

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
    // Race week
    if (week === totalWeeks) {
      targets.push({ weekNumber: week, distanceKm: 0, durationMin: 0, isStepBack: false });
      continue;
    }

    // Taper weeks
    if (week > totalWeeks - taperWeeks) {
      const taperWeekIndex = week - (totalWeeks - taperWeeks);
      const fraction = Math.exp(-0.4 * taperWeekIndex);
      const taperKm = roundKm(currentKm * fraction);
      targets.push({
        weekNumber: week,
        distanceKm: Math.max(taperKm, 8),
        durationMin: estimateDurationForDistance(Math.max(taperKm, 8), "E", paces),
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
      // currentKm is NOT modified — resume from here next build week
      continue;
    }

    // Build week — increment progression
    if (week > 1) {
      currentKm = Math.min(currentKm + calibratedIncrement, peakKm);
    }

    let weekKm = roundKm(currentKm);

    // Cap the jump from previous week at 3km max (smooth resumption after step-back)
    const lastTarget = targets.at(-1);
    if (lastTarget && lastTarget.distanceKm > 0) {
      const maxJump = 3.0;
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
