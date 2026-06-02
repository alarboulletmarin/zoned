/**
 * Weekly statistics for the "Ma semaine" planner.
 *
 * Aggregates the real time-in-zone, volume and load across a generated week so
 * the UI can show the summary card and prove the 80/20 polarisation. Reuses the
 * same per-workout aggregation as the rest of the app (getWorkoutZoneMinutes)
 * so the numbers stay consistent with the library and landing page.
 */

import { getWorkoutZoneMinutes } from "@/lib/landing-stats";
import {
  getAnyWorkoutDuration,
  getAnyWorkoutTss,
} from "@/lib/workoutFilters";
import type { AnyWorkoutTemplate, ZoneNumber } from "@/types";
import { isStrengthWorkout } from "@/types";
import type { WeekSlot } from "@/types/week";

/** Seiler-style three-bucket split, expressed in minutes and shares. */
export interface PolarisedSplit {
  /** Z1 + Z2 minutes (easy). */
  lowMinutes: number;
  /** Z3 minutes (tempo). */
  midMinutes: number;
  /** Z4 + Z5 + Z6 minutes (intense). */
  highMinutes: number;
  /** Total minutes spent in a zone (low + mid + high). */
  zonedMinutes: number;
  /** Shares of zoned minutes (0–1). NaN-safe: 0 when no zoned time. */
  lowShare: number;
  midShare: number;
  highShare: number;
}

export interface WeekStats {
  /** Number of non-rest sessions. */
  sessions: number;
  /** Total duration across every session, in minutes. */
  totalMinutes: number;
  /** Total duration in hours. */
  totalHours: number;
  /** Summed estimated TSS (strength sessions contribute 0). */
  totalTss: number;
  /** Per-zone minutes across the week (aerobic sessions only). */
  zoneMinutes: Record<ZoneNumber, number>;
  /** Polarised distribution computed on real time-in-zone. */
  polarised: PolarisedSplit;
  /** Number of hard (quality) sessions — Z4+ is the dominant intensity. */
  hardSessions: number;
}

/** Considered "hard" when the most intense zone reached is Z4 or above. */
export function isHardWorkout(w: AnyWorkoutTemplate): boolean {
  if (isStrengthWorkout(w)) return false;
  const minutes = getWorkoutZoneMinutes(w);
  return minutes[4] + minutes[5] + minutes[6] > 0;
}

export function computeWeekStats(slots: WeekSlot[]): WeekStats {
  const zoneMinutes: Record<ZoneNumber, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  let totalMinutes = 0;
  let totalTss = 0;
  let sessions = 0;
  let hardSessions = 0;

  for (const slot of slots) {
    const w = slot.workout;
    if (!w) continue;
    sessions++;
    totalMinutes += getAnyWorkoutDuration(w);
    totalTss += getAnyWorkoutTss(w) ?? 0;
    if (!isStrengthWorkout(w)) {
      const m = getWorkoutZoneMinutes(w);
      for (const z of [1, 2, 3, 4, 5, 6] as const) zoneMinutes[z] += m[z];
    }
    if (isHardWorkout(w)) hardSessions++;
  }

  const lowMinutes = zoneMinutes[1] + zoneMinutes[2];
  const midMinutes = zoneMinutes[3];
  const highMinutes = zoneMinutes[4] + zoneMinutes[5] + zoneMinutes[6];
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
    zoneMinutes,
    polarised,
    hardSessions,
  };
}
