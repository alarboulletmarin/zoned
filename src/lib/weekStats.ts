/**
 * Weekly statistics for the "Ma semaine" planner.
 *
 * Polarisation is computed **per session** (not raw time-in-zone): each aerobic
 * session is classified by its characteristic peak zone and its whole duration
 * counts toward Easy (Z1–Z2) / Tempo (Z3) / Intense (Z4+). This matches how the
 * 80/20 rule is understood in practice — a VO₂ session counts as intensity even
 * though most of its minutes are warm-up/recovery — instead of the misleading
 * time-in-zone view where almost every week looks ~95 % easy. Strength has no
 * aerobic zone and is excluded from the split (but still counts as a session).
 */

import {
  getAnyWorkoutDuration,
  getAnyWorkoutTss,
} from "@/lib/workoutFilters";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { WeekSlot } from "@/types/week";

/** Seiler-style three-bucket split, expressed in minutes and shares. */
export interface PolarisedSplit {
  /** Easy (Z1–Z2) session minutes. */
  lowMinutes: number;
  /** Tempo (Z3) session minutes. */
  midMinutes: number;
  /** Intense (Z4+) session minutes. */
  highMinutes: number;
  /** Total aerobic session minutes (low + mid + high). */
  zonedMinutes: number;
  /** Shares of aerobic minutes (0–1). NaN-safe: 0 when no aerobic time. */
  lowShare: number;
  midShare: number;
  highShare: number;
}

export interface WeekStats {
  /** Number of sessions (rest days excluded). */
  sessions: number;
  /** Total duration across every session, in minutes. */
  totalMinutes: number;
  /** Total duration in hours. */
  totalHours: number;
  /** Summed estimated TSS (strength sessions contribute 0). */
  totalTss: number;
  /** Polarised distribution computed per session. */
  polarised: PolarisedSplit;
  /** Number of hard (quality) sessions — peak zone Z4+. */
  hardSessions: number;
}

/** Considered "hard" when the session's characteristic peak zone is Z4+. */
export function isHardWorkout(w: AnyWorkoutTemplate): boolean {
  if (isStrengthWorkout(w)) return false;
  return getDominantZone(w) >= 4;
}

export function computeWeekStats(slots: WeekSlot[]): WeekStats {
  let totalMinutes = 0;
  let totalTss = 0;
  let sessions = 0;
  let hardSessions = 0;
  let lowMinutes = 0;
  let midMinutes = 0;
  let highMinutes = 0;

  for (const slot of slots) {
    const w = slot.workout;
    if (!w) continue;
    sessions++;
    const duration = getAnyWorkoutDuration(w);
    totalMinutes += duration;
    totalTss += getAnyWorkoutTss(w) ?? 0;

    if (!isStrengthWorkout(w)) {
      // Classify the whole session by its characteristic (peak) intensity.
      const z = getDominantZone(w);
      if (z <= 2) lowMinutes += duration;
      else if (z === 3) midMinutes += duration;
      else highMinutes += duration;
    }
    if (isHardWorkout(w)) hardSessions++;
  }

  const zonedMinutes = lowMinutes + midMinutes + highMinutes;
  const polarised: PolarisedSplit = {
    lowMinutes,
    midMinutes,
    highMinutes,
    zonedMinutes,
    lowShare: zonedMinutes > 0 ? lowMinutes / zonedMinutes : 0,
    midShare: zonedMinutes > 0 ? midMinutes / zonedMinutes : 0,
    highShare: zonedMinutes > 0 ? highMinutes / zonedMinutes : 0,
  };

  return {
    sessions,
    totalMinutes,
    totalHours: totalMinutes / 60,
    totalTss: Math.round(totalTss),
    polarised,
    hardSessions,
  };
}
