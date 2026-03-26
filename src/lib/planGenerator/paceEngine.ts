/**
 * Pace Engine — Evidence-based training pace calculations
 *
 * Implements Daniels' 5 training intensities (E/M/T/I/R) derived from VMA.
 * When VMA is unavailable, falls back to difficulty-based estimates.
 *
 * References:
 * - Daniels, J. (2014). Daniels' Running Formula. 3rd ed.
 * - Billat, V. (2001). Interval training for VO2max. Sports Medicine.
 * - Seiler, S. (2010). What is best practice for training intensity distribution?
 */

import type { Difficulty } from "@/types";
import type { RaceDistance } from "@/types/plan";

// ── Daniels intensity types ─────────────────────────────────────

export type DanielsIntensity = "E" | "M" | "T" | "I" | "R";

export interface TrainingPaces {
  /** Easy pace range (min/km) — Z1-Z2, 65-75% VMA */
  E: { min: number; max: number };
  /** Marathon pace (min/km) — Z3, 78-80% VMA */
  M: { min: number; max: number };
  /** Threshold pace (min/km) — Z4, 85-88% VMA */
  T: { min: number; max: number };
  /** Interval/VO2max pace (min/km) — Z5, 95-100% VMA */
  I: { min: number; max: number };
  /** Repetition pace (min/km) — Z6, 105-110% VMA */
  R: { min: number; max: number };
  /** Source VMA used for calculation */
  vma: number;
}

// ── VMA percentages per Daniels intensity ───────────────────────
// Based on Daniels' VDOT system mapped to VMA equivalents.
// Higher % = faster speed = lower pace number.

const DANIELS_VMA_PERCENTAGES: Record<DanielsIntensity, [number, number]> = {
  E: [65, 75],  // Easy / recovery
  M: [78, 80],  // Marathon pace
  T: [85, 88],  // Threshold (lactate turnpoint)
  I: [95, 100], // Interval (VO2max)
  R: [105, 110], // Repetition (neuromuscular)
};

// ── Fallback VMA by difficulty level ────────────────────────────
// Used when the user hasn't provided their VMA.
// Conservative estimates based on population averages.

const FALLBACK_VMA: Record<Difficulty, number> = {
  beginner: 10.5,
  intermediate: 13.0,
  advanced: 15.5,
  elite: 18.0,
};

// ── Zone intensity factors for load scoring ─────────────────────
// Used to compute TRIMP-like load: duration × factor.
// Based on Banister (1991) and Seiler's 3-zone model.

export const ZONE_INTENSITY_FACTORS: Record<number, number> = {
  1: 0.5,
  2: 0.7,
  3: 1.0,
  4: 1.3,
  5: 1.7,
  6: 2.0,
};

// ── Core functions ──────────────────────────────────────────────

/**
 * Convert VMA (km/h) and intensity percentage to pace (min/km).
 */
function vmaToPace(vma: number, percentage: number): number {
  const speedKmh = vma * (percentage / 100);
  if (speedKmh <= 0) return 15; // Cap at 15 min/km
  return Math.round((60 / speedKmh) * 100) / 100;
}

/**
 * Calculate all 5 Daniels training paces from VMA.
 *
 * @param vma - Maximal Aerobic Speed in km/h (optional)
 * @param difficulty - Runner level, used as fallback if VMA not provided
 * @returns Complete training paces for all Daniels intensities
 */
export function calculateTrainingPaces(
  vma?: number,
  difficulty?: Difficulty,
): TrainingPaces {
  const effectiveVma = (vma && vma > 0)
    ? vma
    : FALLBACK_VMA[difficulty ?? "intermediate"];

  const paces = {} as Record<DanielsIntensity, { min: number; max: number }>;

  for (const [intensity, [lowPct, highPct]] of Object.entries(DANIELS_VMA_PERCENTAGES)) {
    // Higher % = faster = lower pace number
    paces[intensity as DanielsIntensity] = {
      min: vmaToPace(effectiveVma, highPct), // faster pace
      max: vmaToPace(effectiveVma, lowPct),  // slower pace
    };
  }

  return { ...paces, vma: effectiveVma } as TrainingPaces;
}

/**
 * Get the appropriate Daniels intensity for a session type.
 */
export function sessionTypeToIntensity(sessionType: string): DanielsIntensity {
  switch (sessionType) {
    case "recovery":
      return "E";
    case "endurance":
    case "long_run":
      return "E";
    case "tempo":
    case "race_specific":
      return "M";
    case "threshold":
      return "T";
    case "vo2max":
    case "intervals":
      return "I";
    case "speed":
    case "fartlek":
      return "I"; // fartlek varies but categorize as I for quality sessions
    case "hills":
      return "T"; // hills are threshold-equivalent effort
    default:
      return "E";
  }
}

/**
 * Get pace range for a specific zone (1-6).
 * Maps zones to Daniels intensities.
 */
export function getPaceForZone(
  zone: number,
  paces: TrainingPaces,
): { min: number; max: number } {
  switch (zone) {
    case 1: return paces.E;
    case 2: return { min: paces.E.min, max: paces.E.max }; // upper easy
    case 3: return paces.M;
    case 4: return paces.T;
    case 5: return paces.I;
    case 6: return paces.R;
    default: return paces.E;
  }
}

/**
 * Estimate duration for a distance at a given Daniels intensity.
 *
 * @param distanceKm - Distance in kilometers
 * @param intensity - Daniels intensity type
 * @param paces - User's training paces
 * @returns Estimated duration in minutes
 */
export function estimateDurationForDistance(
  distanceKm: number,
  intensity: DanielsIntensity,
  paces: TrainingPaces,
): number {
  const paceRange = paces[intensity];
  // Use midpoint of pace range
  const avgPace = (paceRange.min + paceRange.max) / 2;
  return Math.round(distanceKm * avgPace);
}

/**
 * Estimate distance for a given duration at a Daniels intensity.
 *
 * @param durationMin - Duration in minutes
 * @param intensity - Daniels intensity type
 * @param paces - User's training paces
 * @returns Estimated distance in km
 */
export function estimateDistanceForDuration(
  durationMin: number,
  intensity: DanielsIntensity,
  paces: TrainingPaces,
): number {
  const paceRange = paces[intensity];
  const avgPace = (paceRange.min + paceRange.max) / 2;
  return Math.round((durationMin / avgPace) * 10) / 10;
}

/**
 * Format a pace value as mm:ss string.
 */
export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format a pace range as "mm:ss - mm:ss" string.
 */
export function formatPaceRange(range: { min: number; max: number }): string {
  return `${formatPace(range.min)} - ${formatPace(range.max)}`;
}

/**
 * Compute load score for a session block.
 * Based on TRIMP (Banister, 1991): duration × zone intensity factor.
 *
 * @param durationMin - Block duration in minutes
 * @param zone - Training zone (1-6)
 * @returns Load score (arbitrary units)
 */
export function computeBlockLoad(durationMin: number, zone: number): number {
  const factor = ZONE_INTENSITY_FACTORS[zone] ?? 1.0;
  return Math.round(durationMin * factor * 10) / 10;
}

// ── Race time prediction ────────────────────────────────────────

/** VMA percentage sustained for each race distance (road races only) */
const VMA_RACE_PERCENTAGES: Record<string, number> = {
  "5K": 97,
  "10K": 92,
  semi: 82,
  marathon: 77,
};

/** Race distances in km */
const RACE_DISTANCES_KM: Record<string, number> = {
  "5K": 5,
  "10K": 10,
  semi: 21.1,
  marathon: 42.195,
};

/**
 * Predict race time from VMA for a given distance.
 *
 * @param vma - VMA in km/h
 * @param raceDistance - Target race distance
 * @returns Predicted time as formatted string, or undefined for trail races
 */
export function predictRaceTime(
  vma: number,
  raceDistance: RaceDistance,
): string | undefined {
  if (!vma || vma <= 0) return undefined;

  const vmaPercent = VMA_RACE_PERCENTAGES[raceDistance];
  const distanceKm = RACE_DISTANCES_KM[raceDistance];

  if (!vmaPercent || !distanceKm) return undefined; // trail races

  const raceSpeedKmh = vma * (vmaPercent / 100);
  const totalMinutes = (distanceKm / raceSpeedKmh) * 60;

  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  const secs = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
