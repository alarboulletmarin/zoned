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
): WeekVolume[] {
  const goalMods = getGoalModifiers(trainingGoal);

  const [defaultStartKm, defaultPeakKm] = WEEKLY_KM_TARGETS[raceDistance]?.[difficulty]
    ?? WEEKLY_KM_TARGETS["10K"].intermediate;

  const startKm = currentWeeklyKm ?? Math.round(defaultStartKm * goalMods.volumeMultiplier);
  const peakKm = Math.round(defaultPeakKm * goalMods.volumeMultiplier);

  const taperPhase = phases.find(p => p.phase === "taper");
  const taperStart = taperPhase?.startWeek ?? totalWeeks;
  const peakPhase = phases.find(p => p.phase === "peak");
  const peakStart = peakPhase?.startWeek ?? taperStart;

  const weeks: WeekVolume[] = [];
  let currentKm = startKm;
  let consecutiveLoadWeeks = 0;

  for (let w = 1; w <= totalWeeks; w++) {
    const phase = getPhaseForWeek(w, phases);

    // ── Race week (last week) ──
    if (w === totalWeeks) {
      const raceKm = Math.round(peakKm * RACE_WEEK_VOLUME_PCT);
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
      const taperKm = Math.round(peakKm * fraction);

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
      weeks.push({
        weekNumber: w,
        volumePercent: Math.round(RECOVERY_WEEK_VOLUME_PCT * 100),
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
      const prevKm = prevNonRecovery?.targetKm ?? startKm;
      const maxIncrease = prevKm * MAX_WEEKLY_VOLUME_INCREASE;
      currentKm = Math.min(peakKm, prevKm + maxIncrease);
    }

    // Micro-undulation at plateau: alternate ±5% to avoid monotony
    // This simulates natural training periodization (harder/easier weeks)
    let weekKm = Math.round(currentKm);
    if (currentKm >= peakKm * 0.95) {
      // At plateau — undulate between 95% and 100%
      const isHighWeek = consecutiveLoadWeeks % 2 === 0;
      weekKm = Math.round(peakKm * (isHighWeek ? 1.0 : 0.93));
    }

    const volumePct = peakKm > 0 ? Math.round((weekKm / peakKm) * 100) : 80;

    weeks.push({
      weekNumber: w,
      volumePercent: Math.min(100, volumePct),
      targetKm: weekKm,
      isRecoveryWeek: false,
    });

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
