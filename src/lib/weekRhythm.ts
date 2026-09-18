/**
 * The shape of a week, day by day: what the rhythm chart draws, and what the
 * share images draw again at print size. One computation for both, so the
 * bar a friend sees on a shared image is the bar the editor showed.
 */

import { getAnyWorkoutDuration } from "@/lib/workoutFilters";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { AnyWorkoutTemplate } from "@/types";
import type { DayIndex, WeekSlot } from "@/types/week";

export interface RhythmSession {
  /** Minutes. */
  duration: number;
  /** Dominant zone, or null for work that has none (strength, rest). */
  zone: number | null;
}

export interface RhythmDay {
  day: DayIndex;
  sessions: RhythmSession[];
  /** Minutes, summed over the day. */
  total: number;
}

/** Accent zone for a slot, strength/rest have no aerobic zone. */
function slotZone(w: AnyWorkoutTemplate | null): number | null {
  if (!w || isStrengthWorkout(w)) return null;
  return getDominantZone(w);
}

/**
 * Seven days Mon→Sun. Height = total session duration, colour = dominant
 * zone, rest days at zero. Days holding several sessions keep one segment
 * per session. An activity (a bike commute, a swim) is a session like the
 * others: its duration is its height and its planned effort its colour.
 * Left out, three commuting days read as three rest days, the one lie this
 * chart must not tell.
 */
export function weekRhythm(slots: WeekSlot[]): {
  days: RhythmDay[];
  /** The longest day, in minutes, never below 1 so a ratio is always safe. */
  maxDuration: number;
} {
  const days = ([0, 1, 2, 3, 4, 5, 6] as DayIndex[]).map((day) => {
    const sessions = slots
      .filter(
        (s) => s.day === day && (s.workout || (s.activity && s.activity.durationMin > 0)),
      )
      .map((s) =>
        s.activity
          ? { duration: s.activity.durationMin, zone: s.activity.zone }
          : {
              duration: s.durationMin ?? getAnyWorkoutDuration(s.workout!),
              zone: slotZone(s.workout),
            },
      );
    return { day, sessions, total: sessions.reduce((acc, s) => acc + s.duration, 0) };
  });
  return { days, maxDuration: Math.max(1, ...days.map((d) => d.total)) };
}
