/**
 * Pace Calculator - Convert VMA to estimated race times
 *
 * Times come from the race performance model (Péronnet-Thibault): the share
 * of VMA held over a race depends on how long the race lasts and on the
 * runner's endurance, so a beginner and an elite do not get the same
 * percentage for the same distance.
 */

import type { Difficulty } from "@/types";
import {
  ROAD_DISTANCE_KM,
  enduranceIndexFor,
  formatRaceMinutes,
  predictRaceMinutes,
  sustainableVmaFraction,
} from "@/lib/racePerformance";

export interface RaceEstimate {
  distance: string; // "5K", "10K", "Semi", "Marathon"
  distanceKm: number; // 5, 10, 21.1, 42.195
  paceMinKm: string; // "4:30" format min:sec/km
  estimatedTime: string; // "22:30" ou "1:45:00" format
  vmaPercentage: number; // share of VMA held, rounded
}

const RACE_CONFIGS = [
  { distance: "5K", distanceKm: ROAD_DISTANCE_KM["5K"] },
  { distance: "10K", distanceKm: ROAD_DISTANCE_KM["10K"] },
  { distance: "Semi", distanceKm: ROAD_DISTANCE_KM.semi },
  { distance: "Marathon", distanceKm: ROAD_DISTANCE_KM.marathon },
] as const;

/**
 * Format pace as mm:ss
 */
function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Calculate race times from VMA
 *
 * @param vma - Maximal Aerobic Speed in km/h
 * @param level - Runner level, sets the endurance index (default intermediate)
 * @returns Array of race estimates for common distances
 */
export function calculateRaceTimes(vma: number, level?: Difficulty): RaceEstimate[] {
  if (!Number.isFinite(vma) || vma <= 0) {
    return [];
  }
  const e = enduranceIndexFor(level);

  return RACE_CONFIGS.map(({ distance, distanceKm }) => {
    const totalTimeMinutes = predictRaceMinutes(vma, distanceKm, e);
    const fraction = sustainableVmaFraction(totalTimeMinutes, e);
    const paceMinPerKm = totalTimeMinutes / distanceKm;

    return {
      distance,
      distanceKm,
      paceMinKm: formatPace(paceMinPerKm),
      estimatedTime: formatRaceMinutes(totalTimeMinutes),
      vmaPercentage: Math.round(fraction * 100),
    };
  });
}
