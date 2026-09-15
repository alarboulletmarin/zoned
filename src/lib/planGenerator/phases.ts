/**
 * Phase Distribution, Evidence-based training phase calculation
 *
 * Distributes plan weeks across Base/Build/Peak/Taper phases
 * with ratios adapted to race distance and plan duration.
 *
 * References:
 * - Daniels, J. (2014). Phases I-IV model
 * - Pfitzinger, P. (2009). Mesocycle structure
 * - Lydiard, A. (1962). Sequential periodization
 */

import type { RaceDistance, PhaseRange, TrainingGoal } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import {
  PHASE_DISTRIBUTION,
  SHORT_PLAN_BASE_ADJUSTMENT,
  SHORT_PLAN_THRESHOLD,
  TAPER_WEEKS,
  MIN_PHASE_WEEKS,
  MIN_PEAK_WEEKS,
  MAX_BASE_WEEKS,
  getGoalModifiers,
} from "./constants";

/**
 * Calculate phase distribution from total weeks and race distance.
 *
 * - Per-distance ratios, summing to 1
 * - Short plans (< 12 weeks) compress the base in favour of build and peak
 * - Training goal shifts the split (finish = more base, compete = more peak)
 * - The peak block keeps a distance-specific minimum once the plan can afford
 *   it, and is sized before the base: a marathon plan with one week of
 *   race-pace work has no peak phase, whatever the base looks like
 * - The base never exceeds MAX_BASE_WEEKS, the surplus goes to build and peak
 *
 * @returns Array of PhaseRange with 1-indexed week numbers.
 */
export function calculatePhases(
  totalWeeks: number,
  raceDistance: RaceDistance,
  trainingGoal?: TrainingGoal,
): PhaseRange[] {
  const taperWeeks = TAPER_WEEKS[raceDistance];
  const availableWeeks = totalWeeks - taperWeeks;

  // Guard: if fewer than 3 available weeks, force 1 week per phase
  // and give any remaining room to the first phase that can use it
  if (availableWeeks < 3) {
    const phases: PhaseRange[] = [];
    let baseWeeks = 1;
    let buildWeeks = 1;
    let peakWeeks = 1;

    // Clamp total to availableWeeks, give everything to base first
    const total = baseWeeks + buildWeeks + peakWeeks;
    if (total > availableWeeks) {
      // Remove phases from the end until it fits
      peakWeeks = Math.max(0, availableWeeks - 2);
      buildWeeks = Math.max(0, availableWeeks - 1 - (peakWeeks > 0 ? peakWeeks : 0));
      // Recalculate: base gets whatever is left
      baseWeeks = availableWeeks - buildWeeks - peakWeeks;
      if (baseWeeks < 1) baseWeeks = 1;
      // Final clamp
      const finalTotal = baseWeeks + buildWeeks + peakWeeks;
      if (finalTotal > availableWeeks) {
        buildWeeks = Math.max(0, availableWeeks - baseWeeks);
        peakWeeks = 0;
      }
    }

    let currentWeek = 1;
    if (baseWeeks > 0) {
      phases.push({ phase: "base", startWeek: currentWeek, endWeek: currentWeek + baseWeeks - 1 });
      currentWeek += baseWeeks;
    }
    if (buildWeeks > 0) {
      phases.push({ phase: "build", startWeek: currentWeek, endWeek: currentWeek + buildWeeks - 1 });
      currentWeek += buildWeeks;
    }
    if (peakWeeks > 0) {
      phases.push({ phase: "peak", startWeek: currentWeek, endWeek: currentWeek + peakWeeks - 1 });
      currentWeek += peakWeeks;
    }
    phases.push({ phase: "taper", startWeek: currentWeek, endWeek: currentWeek + taperWeeks - 1 });
    return phases;
  }

  // Get base distribution for this race distance
  const dist = PHASE_DISTRIBUTION[raceDistance];
  const goalMods = getGoalModifiers(trainingGoal);

  let basePct = dist.base + goalMods.basePhaseShift;
  let buildPct = dist.build;
  let peakPct = dist.peak;

  // Rebalance after goal shift (take/give from peak)
  if (goalMods.basePhaseShift !== 0) {
    peakPct = Math.max(0.10, peakPct - goalMods.basePhaseShift);
  }

  // Short plans: compress base, expand build/peak for more quality work
  if (totalWeeks < SHORT_PLAN_THRESHOLD) {
    const compressed = Math.max(0.15, basePct + SHORT_PLAN_BASE_ADJUSTMENT);
    const freed = basePct - compressed;
    basePct = compressed;
    buildPct += freed * 0.5;
    peakPct += freed * 0.5;
  }

  // Peak first: it has a floor once the plan can afford one (a plan of 6
  // available weeks cannot spend half of them in peak).
  const peakFloor = availableWeeks >= 8 ? MIN_PEAK_WEEKS[raceDistance] : MIN_PHASE_WEEKS;
  let peakWeeks = Math.max(peakFloor, Math.round(availableWeeks * peakPct));
  let buildWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * buildPct));
  let baseWeeks = availableWeeks - peakWeeks - buildWeeks;

  // Base below its minimum: shrink build, then peak, down to their minimums
  if (baseWeeks < MIN_PHASE_WEEKS) {
    const deficit = MIN_PHASE_WEEKS - baseWeeks;
    const fromBuild = Math.min(deficit, buildWeeks - MIN_PHASE_WEEKS);
    buildWeeks -= fromBuild;
    peakWeeks -= deficit - fromBuild;
    baseWeeks = MIN_PHASE_WEEKS;
  }

  // Long plans: the base is capped in absolute weeks, the surplus goes 60 %
  // to build and 40 % to peak. Applied on the rounded weeks, applying it to
  // the percentages let the rounding remainder refill the base past the cap.
  if (baseWeeks > MAX_BASE_WEEKS) {
    const excess = baseWeeks - MAX_BASE_WEEKS;
    const toBuild = Math.round(excess * 0.6);
    buildWeeks += toBuild;
    peakWeeks += excess - toBuild;
    baseWeeks = MAX_BASE_WEEKS;
  }

  void basePct;

  // Build ranges (1-indexed)
  const phases: PhaseRange[] = [];
  let currentWeek = 1;

  phases.push({ phase: "base", startWeek: currentWeek, endWeek: currentWeek + baseWeeks - 1 });
  currentWeek += baseWeeks;

  phases.push({ phase: "build", startWeek: currentWeek, endWeek: currentWeek + buildWeeks - 1 });
  currentWeek += buildWeeks;

  phases.push({ phase: "peak", startWeek: currentWeek, endWeek: currentWeek + peakWeeks - 1 });
  currentWeek += peakWeeks;

  phases.push({ phase: "taper", startWeek: currentWeek, endWeek: currentWeek + taperWeeks - 1 });

  return phases;
}

/**
 * Get the phase for a given week number.
 */
export function getPhaseForWeek(weekNumber: number, phases: PhaseRange[]): TrainingPhase {
  for (const range of phases) {
    if (weekNumber >= range.startWeek && weekNumber <= range.endWeek) {
      return range.phase;
    }
  }
  return "base"; // fallback
}

/**
 * Get the week index within the current phase (0-based).
 * Useful for intra-phase progression.
 */
export function getWeekInPhase(weekNumber: number, phases: PhaseRange[]): { weekInPhase: number; totalPhaseWeeks: number } {
  for (const range of phases) {
    if (weekNumber >= range.startWeek && weekNumber <= range.endWeek) {
      return {
        weekInPhase: weekNumber - range.startWeek,
        totalPhaseWeeks: range.endWeek - range.startWeek + 1,
      };
    }
  }
  return { weekInPhase: 0, totalPhaseWeeks: 1 };
}
