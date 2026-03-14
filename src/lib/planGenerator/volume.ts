import type { RaceDistance, PhaseRange } from "@/types/plan";
import {
  STARTING_VOLUME_PCT, MAX_WEEKLY_VOLUME_INCREASE,
  RECOVERY_WEEK_FREQUENCY, RECOVERY_WEEK_VOLUME_PCT,
  TAPER_VOLUME_REDUCTION, RACE_WEEK_VOLUME_PCT,
} from "./constants";
import { getPhaseForWeek } from "./phases";

export interface WeekVolume {
  weekNumber: number;
  volumePercent: number;
  isRecoveryWeek: boolean;
}

/**
 * Get starting volume percentage based on plan length.
 */
function getStartingVolume(totalWeeks: number): number {
  if (totalWeeks <= 11) return STARTING_VOLUME_PCT.short;
  if (totalWeeks <= 17) return STARTING_VOLUME_PCT.medium;
  return STARTING_VOLUME_PCT.long;
}

/**
 * Calculate volume progression for each week of the plan.
 */
export function calculateVolumeProgression(
  totalWeeks: number,
  phases: PhaseRange[],
  _raceDistance: RaceDistance,
): WeekVolume[] {
  const weeks: WeekVolume[] = [];
  const startVolume = getStartingVolume(totalWeeks);
  const taperPhase = phases.find(p => p.phase === "taper");
  const taperStart = taperPhase?.startWeek ?? totalWeeks;

  let currentVolume = startVolume;

  for (let w = 1; w <= totalWeeks; w++) {
    const phase = getPhaseForWeek(w, phases);

    // Taper weeks
    if (phase === "taper") {
      const taperWeekIndex = w - taperStart;
      const reduction = TAPER_VOLUME_REDUCTION[taperWeekIndex] ?? TAPER_VOLUME_REDUCTION[TAPER_VOLUME_REDUCTION.length - 1];
      // If this is the very last week (race week), use race week volume
      if (w === totalWeeks) {
        weeks.push({ weekNumber: w, volumePercent: Math.round(RACE_WEEK_VOLUME_PCT * 100), isRecoveryWeek: false });
      } else {
        weeks.push({ weekNumber: w, volumePercent: Math.round(reduction * 100), isRecoveryWeek: false });
      }
      continue;
    }

    // Recovery week every 4th week (but not during taper)
    const isRecoveryWeek = w > 1 && w % RECOVERY_WEEK_FREQUENCY === 0;

    if (isRecoveryWeek) {
      const recoveryVolume = currentVolume * RECOVERY_WEEK_VOLUME_PCT;
      weeks.push({ weekNumber: w, volumePercent: Math.round(recoveryVolume * 100), isRecoveryWeek: true });
      // Don't update currentVolume - next week resumes from pre-recovery level
    } else {
      // Progressive increase capped at 10% per week and 100% max
      if (w > 1) {
        const prevNonRecovery = weeks.filter(wk => !wk.isRecoveryWeek).at(-1);
        const prevVolume = prevNonRecovery ? prevNonRecovery.volumePercent / 100 : startVolume;
        currentVolume = Math.min(1.0, prevVolume * (1 + MAX_WEEKLY_VOLUME_INCREASE));
      }
      weeks.push({ weekNumber: w, volumePercent: Math.round(currentVolume * 100), isRecoveryWeek });
    }
  }

  return weeks;
}
