/**
 * Volume Progression — km-based weekly volume with exponential taper
 *
 * Replaces abstract volumePercent (0-100) with actual weekly km targets.
 * Implements load-based recovery weeks and Mujika exponential taper.
 *
 * References:
 * - Pfitzinger, P. (2009). Progressive volume with 3:1 mesocycles.
 * - Mujika, I. & Padilla, S. (2003). Exponential taper model.
 * - Gabbett, T. (2016). Acute:Chronic workload ratio for injury prevention.
 * - Seiler, S. (2010). Polarized training distribution.
 */

import type { Difficulty } from "@/types";
import type { RaceDistance, PhaseRange, TrainingGoal } from "@/types/plan";
import { getPhaseForWeek } from "./phases";
import {
  WEEKLY_KM_TARGETS,
  MAX_WEEKLY_VOLUME_INCREASE,
  RECOVERY_WEEK_VOLUME_PCT,
  MAX_CONSECUTIVE_LOAD_WEEKS,
  TAPER_DECAY_RATE,
  RACE_WEEK_VOLUME_PCT,
  STARTING_VOLUME_PCT,
  getGoalModifiers,
} from "./constants";

// ── Types ──────────────────────────────────────────────────────

export interface WeekVolume {
  weekNumber: number;
  /** Legacy volumePercent (0-100) — kept for backward compat */
  volumePercent: number;
  /** Target weekly km (new) */
  targetKm: number;
  isRecoveryWeek: boolean;
}

// ── Main function ──────────────────────────────────────────────

/**
 * Calculate volume progression for each week of the plan.
 *
 * New algorithm:
 * 1. Compute start and peak km from distance/level tables
 * 2. Progressive increase (max +10%/week) toward peak
 * 3. Recovery week after every 3 consecutive load weeks (not fixed every 4th)
 * 4. Always insert recovery before peak phase transition
 * 5. Exponential taper (Mujika) for final weeks
 * 6. Race week at 35% volume
 *
 * @param totalWeeks - Total plan duration
 * @param phases - Phase ranges
 * @param raceDistance - Target race distance
 * @param difficulty - Runner level (for km targets)
 * @param currentWeeklyKm - Optional: user's current weekly km (overrides start estimate)
 * @param trainingGoal - Optional: training mindset (finish/time/compete)
 */
export function calculateVolumeProgression(
  totalWeeks: number,
  phases: PhaseRange[],
  raceDistance: RaceDistance,
  difficulty: Difficulty = "intermediate",
  currentWeeklyKm?: number,
  trainingGoal?: TrainingGoal,
  daysPerWeek: number = 5,
  purposeVolumeMultiplier: number = 1,
  goalDemandFactor: number = 1,
  /** Purpose multiplier for the starting point; defaults to the peak one */
  purposeStartMultiplier?: number,
): WeekVolume[] {
  const goalMods = getGoalModifiers(trainingGoal);

  const [defaultStartKm, defaultPeakKm] = WEEKLY_KM_TARGETS[raceDistance]?.[difficulty]
    ?? WEEKLY_KM_TARGETS["10K"].intermediate;

  // The purpose multiplier (base building, return from injury, beginner start)
  // scales the reference table, never the volume the runner reports doing.
  // goalDemandFactor raises the ceiling when the target time asks for more than
  // current fitness delivers. It never touches the starting point: you begin
  // where you are, ambition only changes where you are heading.
  // A single purpose multiplier applied to both ends left return-to-running
  // plans with no amplitude at all: start and peak moved together, so an 8-week
  // plan went from 15km to 15km. The starting point is what a purpose lowers
  // most; the peak is where the plan is allowed to arrive.
  const startScale = goalMods.volumeMultiplier * (purposeStartMultiplier ?? purposeVolumeMultiplier);
  const peakScale = goalMods.volumeMultiplier * purposeVolumeMultiplier;
  const startKm = currentWeeklyKm ?? Math.round(defaultStartKm * startScale);
  const peakKm = Math.round(defaultPeakKm * peakScale * goalDemandFactor);

  // Scale peak km for fewer training days. The reference tables assume the 5-6
  // day weeks the source plans are built on, so weekly volume tracks the number
  // of sessions far more closely than the old 0.7 + days*0.06 curve suggested
  // (it granted 4-day weeks 94% of a 6-day volume). Asking for a peak the week
  // cannot physically hold made the generator saturate every week at its
  // ceiling, which flattened the progression and broke its monotonicity.
  const DAYS_VOLUME_SHARE: Record<number, number> = {
    3: 0.70,
    4: 0.78,
    5: 0.90,
    6: 1.00,
    7: 1.05,
  };
  const daysAdjustment = DAYS_VOLUME_SHARE[daysPerWeek] ?? 0.90;
  const tablePeakKm = Math.round(peakKm * daysAdjustment);

  // A plan must ask for more than the runner already does. Anchoring the peak
  // on the table alone meant someone reporting 60km/week for a 5K got a plan
  // capped at 30, and someone reporting exactly the table peak got a flat line.
  const growthFactor = startKm >= tablePeakKm
    ? 1.10                              // already at or above target: hold and nudge
    : (totalWeeks >= 8 ? 1.30 : 1.15);  // room to build

  // Every scheduled day has to be worth running. Spreading 15km over 5 days
  // yields 3km sessions, which the plan then cannot honour.
  const MIN_KM_PER_SESSION = 3.5;
  const volumeFloor = Math.round(daysPerWeek * MIN_KM_PER_SESSION);

  const adjustedPeakKm = Math.max(
    tablePeakKm,
    Math.round(startKm * growthFactor),
    volumeFloor,
  );

  const taperPhase = phases.find(p => p.phase === "taper");
  const taperStart = taperPhase?.startWeek ?? totalWeeks;
  const peakPhase = phases.find(p => p.phase === "peak");
  const peakStart = peakPhase?.startWeek ?? taperStart;

  const weeks: WeekVolume[] = [];
  let currentKm = Math.max(startKm, volumeFloor);
  let actualPeakKm = currentKm; // Track actual highest volume achieved
  let consecutiveLoadWeeks = 0;

  for (let w = 1; w <= totalWeeks; w++) {
    const phase = getPhaseForWeek(w, phases);

    // ── Race week (last week, only for race plans with taper) ──
    if (w === totalWeeks && taperPhase) {
      const raceKm = Math.round(actualPeakKm * RACE_WEEK_VOLUME_PCT);
      weeks.push({
        weekNumber: w,
        volumePercent: Math.round(RACE_WEEK_VOLUME_PCT * 100),
        targetKm: raceKm,
        isRecoveryWeek: false,
      });
      continue;
    }

    // ── Taper weeks (exponential decay, Mujika) ──
    if (phase === "taper") {
      const taperWeekIndex = w - taperStart + 1; // 1-based
      const fraction = Math.exp(-TAPER_DECAY_RATE * taperWeekIndex);
      const taperKm = Math.round(actualPeakKm * fraction);

      weeks.push({
        weekNumber: w,
        volumePercent: Math.round(fraction * 100),
        targetKm: taperKm,
        isRecoveryWeek: false,
      });
      continue;
    }

    // ── Recovery week decision ──
    // Insert recovery after N consecutive load weeks (default 3, or goal-based)
    // Also insert recovery before peak phase starts (transition recovery)
    const maxLoadWeeks = goalMods.recoveryFrequency > 0
      ? goalMods.recoveryFrequency
      : MAX_CONSECUTIVE_LOAD_WEEKS;
    const isTransitionRecovery = (w + 1 === peakStart) && consecutiveLoadWeeks >= 2;
    const isLoadRecovery = consecutiveLoadWeeks >= maxLoadWeeks;
    const isRecoveryWeek = w > 1 && (isLoadRecovery || isTransitionRecovery);

    if (isRecoveryWeek) {
      const recoveryKm = Math.round(currentKm * RECOVERY_WEEK_VOLUME_PCT);
      // volumePercent = actual ratio to peak (not a fixed 65%)
      // This prevents early recovery weeks from showing higher % than surrounding build weeks
      const recoveryVolPct = adjustedPeakKm > 0
        ? Math.round((recoveryKm / adjustedPeakKm) * 100)
        : Math.round(RECOVERY_WEEK_VOLUME_PCT * 100);
      weeks.push({
        weekNumber: w,
        volumePercent: recoveryVolPct,
        targetKm: recoveryKm,
        isRecoveryWeek: true,
      });
      consecutiveLoadWeeks = 0;
      // Don't update currentKm — resume from pre-recovery level next week
      continue;
    }

    // ── Normal build week ──
    if (w > 1) {
      const prevNonRecovery = weeks.filter(wk => !wk.isRecoveryWeek).at(-1);
      const prevKm = prevNonRecovery?.targetKm ?? Math.max(startKm, volumeFloor);
      // For longer plans, use gentler progression to avoid peaking too early
      const maxIncreaseRate = totalWeeks > 20 ? 0.07 : MAX_WEEKLY_VOLUME_INCREASE;
      const maxIncrease = prevKm * maxIncreaseRate;
      currentKm = Math.min(adjustedPeakKm, prevKm + maxIncrease);
    }

    // Micro-undulation at plateau: alternate ±5% to avoid monotony
    // This simulates natural training periodization (harder/easier weeks)
    let weekKm = Math.round(currentKm);
    if (currentKm >= adjustedPeakKm * 0.95) {
      // At plateau — undulate between 95% and 100%
      const isHighWeek = consecutiveLoadWeeks % 2 === 0;
      weekKm = Math.round(adjustedPeakKm * (isHighWeek ? 1.0 : 0.93));
    }

    const volumePct = adjustedPeakKm > 0 ? Math.round((weekKm / adjustedPeakKm) * 100) : 80;

    weeks.push({
      weekNumber: w,
      volumePercent: Math.min(100, volumePct),
      targetKm: weekKm,
      isRecoveryWeek: false,
    });

    actualPeakKm = Math.max(actualPeakKm, weekKm);
    consecutiveLoadWeeks++;
  }

  return weeks;
}

/**
 * Legacy: get starting volume percentage based on plan length.
 * Kept for backward compatibility with old plans.
 */
export function getStartingVolume(totalWeeks: number): number {
  if (totalWeeks <= 11) return STARTING_VOLUME_PCT.short;
  if (totalWeeks <= 17) return STARTING_VOLUME_PCT.medium;
  return STARTING_VOLUME_PCT.long;
}
