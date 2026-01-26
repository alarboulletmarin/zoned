/**
 * Pace Calculator - Convert VMA to estimated race times
 */

export interface RaceEstimate {
  distance: string; // "5K", "10K", "Semi", "Marathon"
  distanceKm: number; // 5, 10, 21.1, 42.195
  paceMinKm: string; // "4:30" format min:sec/km
  estimatedTime: string; // "22:30" ou "1:45:00" format
  vmaPercentage: number; // 97, 92, 82, 77
}

// Race distances and their typical VMA percentages
// Based on scientific estimates for trained runners
const RACE_CONFIGS = [
  { distance: "5K", distanceKm: 5, vmaPercentage: 97 },
  { distance: "10K", distanceKm: 10, vmaPercentage: 92 },
  { distance: "Semi", distanceKm: 21.1, vmaPercentage: 82 },
  { distance: "Marathon", distanceKm: 42.195, vmaPercentage: 77 },
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
 * Format time as HH:MM:SS or MM:SS depending on duration
 */
function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Calculate race times from VMA
 *
 * @param vma - Maximal Aerobic Speed in km/h
 * @returns Array of race estimates for common distances
 */
export function calculateRaceTimes(vma: number): RaceEstimate[] {
  if (!vma || vma <= 0) {
    return [];
  }

  return RACE_CONFIGS.map(({ distance, distanceKm, vmaPercentage }) => {
    // Calculate race speed (km/h)
    const raceSpeedKmh = vma * (vmaPercentage / 100);

    // Calculate pace (min/km)
    const paceMinPerKm = 60 / raceSpeedKmh;

    // Calculate total time (minutes)
    const totalTimeMinutes = (distanceKm / raceSpeedKmh) * 60;

    return {
      distance,
      distanceKm,
      paceMinKm: formatPace(paceMinPerKm),
      estimatedTime: formatTime(totalTimeMinutes),
      vmaPercentage,
    };
  });
}
