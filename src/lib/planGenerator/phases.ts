/**
 * Phase Distribution — Evidence-based training phase calculation
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
  LONG_PLAN_THRESHOLD,
  TAPER_WEEKS,
  MIN_PHASE_WEEKS,
  getGoalModifiers,
} from "./constants";

/**
 * Calculate phase distribution from total weeks and race distance.
 *
 * Improvements over previous version:
 * - Per-distance ratios instead of fixed 40/35/15
 * - Duration-aware adjustments (short plans compress base, long plans extend it)
 * - Training goal shifts phase distribution (finish=more base, compete=more peak)
 * - Ensures minimum 1 week per phase
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

    // Clamp total to availableWeeks — give everything to base first
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

  // Adjust for plan duration
  if (totalWeeks < SHORT_PLAN_THRESHOLD) {
    // Short plans: compress base, expand build/peak for more quality work
    basePct = Math.max(0.15, basePct + SHORT_PLAN_BASE_ADJUSTMENT);
    const freed = dist.base + goalMods.basePhaseShift - basePct;
    if (freed > 0) {
      buildPct += freed * 0.5;
      peakPct += freed * 0.5;
    }
  } else if (totalWeeks > LONG_PLAN_THRESHOLD) {
    // Long plans (>18 weeks): cap base at ~12 weeks absolute max
    // Extra weeks go to build and peak (more quality time)
    const maxBaseWeeks = 12;
    const baseWeeksFromPct = Math.round(availableWeeks * basePct);
    if (baseWeeksFromPct > maxBaseWeeks) {
      const excessWeeks = baseWeeksFromPct - maxBaseWeeks;
      const excessPct = excessWeeks / availableWeeks;
      basePct -= excessPct;
      // Distribute excess 60% to build, 40% to peak
      buildPct += excessPct * 0.6;
      peakPct += excessPct * 0.4;
    }
  }

  // Calculate week counts
  let baseWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * basePct));
  let buildWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * buildPct));
  let peakWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * peakPct));

  // Adjust to fit exactly (give/take from base which is the largest)
  const assigned = baseWeeks + buildWeeks + peakWeeks;
  baseWeeks += availableWeeks - assigned;

  // Safety: ensure base is at least 1 after adjustment
  if (baseWeeks < MIN_PHASE_WEEKS) {
    baseWeeks = MIN_PHASE_WEEKS;
    // Steal from build if needed
    const overflow = (baseWeeks + buildWeeks + peakWeeks) - availableWeeks;
    if (overflow > 0) buildWeeks = Math.max(MIN_PHASE_WEEKS, buildWeeks - overflow);
  }

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
