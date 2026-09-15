/**
 * Volume Progression, km-based weekly volume with a published taper ladder
 *
 * Plans weekly km targets: a computed ramp to a peak placed a few weeks
 * before the taper, load-based recovery weeks, and a taper whose shares of
 * peak follow the published ladders rather than an exponential that dropped
 * a third of the volume in one step.
 *
 * References:
 * - Pfitzinger, P. (2009). Progressive volume, drop-back weeks at 78-85 %.
 * - Bosquet, L. et al. (2007). Taper meta-analysis: 41-60 % total reduction,
 *   progressive, over about two weeks, intensity and frequency kept.
 * - Smyth, B. & Lawlor, A. (2021). Disciplined 3-week tapers in recreational
 *   marathoners.
 * - Buist, I. et al. (2008), Nielsen, R. et al. (2014): the 10 % rule is a
 *   bound, not a prescription.
 */

import type { Difficulty } from "@/types";
import type { RaceDistance, PhaseRange, TrainingGoal } from "@/types/plan";
import { getPhaseForWeek } from "./phases";
import {
  WEEKLY_KM_TARGETS,
  WEEKLY_VOLUME_FLOOR_KM,
  MAX_WEEKLY_VOLUME_INCREASE,
  MIN_WEEKLY_VOLUME_INCREASE,
  RECOVERY_WEEK_VOLUME_PCT,
  MAX_CONSECUTIVE_LOAD_WEEKS,
  NO_RECOVERY_WEEKS_BEFORE_TAPER,
  PEAK_WEEKS_BEFORE_TAPER,
  TAPER_VOLUME_PCT,
  RACE_WEEK_VOLUME_PCT,
  getGoalModifiers,
} from "./constants";

// ── Types ──────────────────────────────────────────────────────

export interface WeekVolume {
  weekNumber: number;
  /** Legacy volumePercent (0-100), kept for backward compat */
  volumePercent: number;
  /** Target weekly km (new) */
  targetKm: number;
  isRecoveryWeek: boolean;
}

// ── Main function ──────────────────────────────────────────────

/**
 * Calculate volume progression for each week of the plan.
 *
 * 1. Start and peak km from the distance/level tables, the runner's declared
 *    volume, and the distance floor
 * 2. A weekly increase computed so the peak lands PEAK_WEEKS_BEFORE_TAPER
 *    weeks before the taper, capped at MAX_WEEKLY_VOLUME_INCREASE
 * 3. Recovery week after N consecutive load weeks, and before the peak
 *    phase, never within NO_RECOVERY_WEEKS_BEFORE_TAPER of the taper
 * 4. Taper weeks at the published shares of peak, race week at its own share
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
  const startScale = goalMods.volumeMultiplier * (purposeStartMultiplier ?? purposeVolumeMultiplier);
  const peakScale = goalMods.volumeMultiplier * purposeVolumeMultiplier;
  // Scale the table for fewer training days. The reference tables assume the
  // 5-6 day weeks the source plans are built on; the start is scaled too, a
  // 4-day half-marathon plan opened at 50 km, 12.5 km per session.
  const DAYS_VOLUME_SHARE: Record<number, number> = {
    3: 0.70,
    4: 0.78,
    5: 0.90,
    6: 1.00,
    7: 1.05,
  };
  const daysAdjustment = DAYS_VOLUME_SHARE[daysPerWeek] ?? 0.90;
  const startKm = currentWeeklyKm ?? Math.round(defaultStartKm * startScale * daysAdjustment);
  const peakKm = Math.round(defaultPeakKm * peakScale * goalDemandFactor);
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

  // The distance itself sets a floor: fewer training days and a "finish" goal
  // lower the ceiling, but not below what the race needs (a 4-day marathon
  // plan otherwise peaked at 43 km, which its own audit rejects). Non-race
  // purposes scale the floor with their own multiplier.
  const distanceFloor = Math.round(WEEKLY_VOLUME_FLOOR_KM[raceDistance] * purposeVolumeMultiplier);

  const adjustedPeakKm = Math.max(
    tablePeakKm,
    Math.round(startKm * growthFactor),
    volumeFloor,
    distanceFloor,
  );

  const taperPhase = phases.find(p => p.phase === "taper");
  const taperStart = taperPhase?.startWeek ?? totalWeeks + 1;
  const peakPhase = phases.find(p => p.phase === "peak");
  const peakStart = peakPhase?.startWeek ?? taperStart;

  const maxLoadWeeks = goalMods.recoveryFrequency > 0
    ? goalMods.recoveryFrequency
    : MAX_CONSECUTIVE_LOAD_WEEKS;
  const recoveryPct = goalMods.recoveryVolumePct > 0
    ? goalMods.recoveryVolumePct
    : RECOVERY_WEEK_VOLUME_PCT;

  // ── Ramp rate: reach the peak a few weeks before the taper ──
  // Applying the 10 % ceiling as the slope put every plan at its peak by
  // mid-plan, then flat. The slope is what gets from start to peak in the
  // load weeks available; the ceiling only binds when that is too steep.
  const peakTargetWeek = taperPhase
    ? Math.max(2, taperStart - PEAK_WEEKS_BEFORE_TAPER[raceDistance])
    : Math.max(2, totalWeeks - 1);
  const weeksToPeak = peakTargetWeek - 1;
  const recoveryWeeksBeforePeak = Math.floor(weeksToPeak / (maxLoadWeeks + 1));
  const loadWeeksToPeak = Math.max(1, weeksToPeak - recoveryWeeksBeforePeak);
  const firstKm = Math.max(startKm, volumeFloor);
  const neededRate = adjustedPeakKm > firstKm
    ? Math.pow(adjustedPeakKm / firstKm, 1 / loadWeeksToPeak) - 1
    : 0;
  const increaseRate = Math.min(
    MAX_WEEKLY_VOLUME_INCREASE,
    Math.max(MIN_WEEKLY_VOLUME_INCREASE, neededRate),
  );

  const weeks: WeekVolume[] = [];
  let currentKm = firstKm;
  let actualPeakKm = currentKm; // Track actual highest volume achieved
  let consecutiveLoadWeeks = 0;

  for (let w = 1; w <= totalWeeks; w++) {
    const phase = getPhaseForWeek(w, phases);

    // ── Race week (last week, only for race plans with taper) ──
    if (w === totalWeeks && taperPhase) {
      const share = RACE_WEEK_VOLUME_PCT[raceDistance];
      weeks.push({
        weekNumber: w,
        volumePercent: Math.round(share * 100),
        targetKm: Math.round(actualPeakKm * share),
        isRecoveryWeek: false,
      });
      continue;
    }

    // ── Taper weeks: published ladder, share of the actual peak ──
    if (phase === "taper") {
      const ladder = TAPER_VOLUME_PCT[raceDistance];
      const index = w - taperStart;
      const fraction = ladder[index] ?? ladder[ladder.length - 1] ?? RACE_WEEK_VOLUME_PCT[raceDistance];
      weeks.push({
        weekNumber: w,
        volumePercent: Math.round(fraction * 100),
        targetKm: Math.round(actualPeakKm * fraction),
        isRecoveryWeek: false,
      });
      continue;
    }

    // ── Recovery week decision ──
    // After N consecutive load weeks, or as a transition before the peak
    // phase. Never right before the taper, which is itself the recovery.
    const closeToTaper = taperPhase ? (taperStart - w) <= NO_RECOVERY_WEEKS_BEFORE_TAPER : false;
    const isTransitionRecovery = (w + 1 === peakStart) && consecutiveLoadWeeks >= 2;
    const isLoadRecovery = consecutiveLoadWeeks >= maxLoadWeeks;
    const isRecoveryWeek = w > 1 && !closeToTaper && (isLoadRecovery || isTransitionRecovery);

    if (isRecoveryWeek) {
      const recoveryKm = Math.round(currentKm * recoveryPct);
      const recoveryVolPct = adjustedPeakKm > 0
        ? Math.round((recoveryKm / adjustedPeakKm) * 100)
        : Math.round(recoveryPct * 100);
      weeks.push({
        weekNumber: w,
        volumePercent: recoveryVolPct,
        targetKm: recoveryKm,
        isRecoveryWeek: true,
      });
      consecutiveLoadWeeks = 0;
      // Don't update currentKm, resume from pre-recovery level next week
      continue;
    }

    // ── Normal build week ──
    if (w > 1) {
      const prevNonRecovery = weeks.filter(wk => !wk.isRecoveryWeek).at(-1);
      const prevKm = prevNonRecovery?.targetKm ?? firstKm;
      currentKm = Math.min(adjustedPeakKm, prevKm * (1 + increaseRate));
    }

    // Micro-undulation at plateau: alternate 100 % / 93 % to avoid monotony
    let weekKm = Math.round(currentKm);
    if (currentKm >= adjustedPeakKm * 0.95) {
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
