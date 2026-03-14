import type { RaceDistance, PhaseRange } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import {
  BASE_PHASE_PCT, BUILD_PHASE_PCT, PEAK_PHASE_PCT,
  TAPER_WEEKS, MIN_PHASE_WEEKS,
} from "./constants";

/**
 * Calculate phase distribution from total weeks and race distance.
 * Returns array of PhaseRange with 1-indexed week numbers.
 */
export function calculatePhases(totalWeeks: number, raceDistance: RaceDistance): PhaseRange[] {
  const taperWeeks = TAPER_WEEKS[raceDistance];
  const availableWeeks = totalWeeks - taperWeeks;

  const isTrailRace = raceDistance === "trail_short" || raceDistance === "trail" || raceDistance === "ultra";

  // Distribute available weeks across base/build/peak
  let baseWeeks: number;
  let buildWeeks: number;
  let peakWeeks: number;

  if (isTrailRace) {
    // Trail: more base (50%), less peak (10%), build stays same
    baseWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * 0.50));
    buildWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * 0.30));
    peakWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * 0.10));
  } else {
    baseWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * BASE_PHASE_PCT));
    buildWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * BUILD_PHASE_PCT));
    peakWeeks = Math.max(MIN_PHASE_WEEKS, Math.round(availableWeeks * PEAK_PHASE_PCT));
  }

  // Adjust to fit exactly (give/take from base which is the largest)
  const assigned = baseWeeks + buildWeeks + peakWeeks;
  baseWeeks += availableWeeks - assigned;

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
