/**
 * Pace Engine, Evidence-based training pace calculations
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
import {
  ROAD_DISTANCE_KM,
  enduranceIndexFor,
  formatRaceMinutes,
  predictRaceMinutes,
  raceVmaFraction,
  type RoadDistance,
} from "@/lib/racePerformance";

// ── Daniels intensity types ─────────────────────────────────────

export type DanielsIntensity = "E" | "M" | "T" | "I" | "R";

export interface TrainingPaces {
  /** Easy pace range (min/km), Z1-Z2, 65-75% VMA */
  E: { min: number; max: number };
  /** Marathon pace (min/km), Z3, derived from the predicted marathon time */
  M: { min: number; max: number };
  /** Threshold pace (min/km), Z4, 85-88% VMA */
  T: { min: number; max: number };
  /** Interval/VO2max pace (min/km), Z5, 95-100% VMA */
  I: { min: number; max: number };
  /** Repetition pace (min/km), Z6, 105-110% VMA */
  R: { min: number; max: number };
  /** Source VMA used for calculation */
  vma: number;
}

// ── VMA percentages per Daniels intensity ───────────────────────
// Based on Daniels' VDOT system mapped to VMA equivalents.
// Higher % = faster speed = lower pace number.

// Daniels (3rd ed.) gives E 59-74 %, M 75-84 %, T 83-88 %, I 95-100 % of
// VO2max; through his economy curve that is E 65-78 %, T 86-90 %, I 96-100 %
// of vVO2max. R is mile pace, ~102-108 % for club runners.
//
// M is not a fixed share: a 3-hour marathoner holds ~80 % of VMA, a 4h30
// runner ~72 % (Péronnet-Thibault, Nikolaidis 2020). A fixed 78-80 % gave
// slow runners "marathon pace" sessions 7-10 % too fast, so M is derived from
// the predicted marathon time instead (see calculateTrainingPaces).
const DANIELS_VMA_PERCENTAGES: Record<Exclude<DanielsIntensity, "M">, [number, number]> = {
  E: [65, 76],  // Easy / recovery
  T: [86, 90],  // Threshold (lactate turnpoint)
  I: [95, 100], // Interval (VO2max)
  R: [104, 108], // Repetition (neuromuscular)
};

/** Half-width of the marathon pace band around the predicted race share, in % VMA */
const M_BAND_HALF_WIDTH = 1.5;

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

  // Marathon pace: the share of VMA this runner would hold over 42.195 km,
  // bounded so it never overlaps the easy or threshold bands.
  const e = enduranceIndexFor(difficulty);
  const marathonPct = Math.min(
    DANIELS_VMA_PERCENTAGES.T[0] - 1,
    Math.max(DANIELS_VMA_PERCENTAGES.E[1] + 1, raceVmaFraction(effectiveVma, ROAD_DISTANCE_KM.marathon, e) * 100),
  );
  paces.M = {
    min: vmaToPace(effectiveVma, marathonPct + M_BAND_HALF_WIDTH),
    max: vmaToPace(effectiveVma, marathonPct - M_BAND_HALF_WIDTH),
  };

  return { ...paces, vma: effectiveVma } as TrainingPaces;
}

/** Intensity of a race-pace session, by distance: a 5K is run at I pace, a marathon at M */
const RACE_SPECIFIC_INTENSITY: Record<RaceDistance, DanielsIntensity> = {
  "5K": "I",
  "10K": "T",
  semi: "T",
  marathon: "M",
  trail_short: "M",
  trail: "M",
  ultra: "E",
};

/**
 * Get the appropriate Daniels intensity for a session type.
 * Race-specific work depends on the target distance; without one it is read
 * as marathon pace, the historical default.
 */
export function sessionTypeToIntensity(sessionType: string, raceDistance?: RaceDistance): DanielsIntensity {
  switch (sessionType) {
    case "recovery":
      return "E";
    case "endurance":
    case "long_run":
      return "E";
    case "race_specific":
      return raceDistance ? RACE_SPECIFIC_INTENSITY[raceDistance] : "M";
    case "tempo":
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

/**
 * Predict race time from VMA for a road distance, at the runner's level.
 * Trail distances return undefined: terrain makes a km-based prediction
 * meaningless.
 */
export function predictRaceTime(
  vma: number,
  raceDistance: RaceDistance,
  difficulty?: Difficulty,
): string | undefined {
  if (!vma || vma <= 0) return undefined;
  const distanceKm = ROAD_DISTANCE_KM[raceDistance as RoadDistance];
  if (!distanceKm) return undefined;
  return formatRaceMinutes(predictRaceMinutes(vma, distanceKm, enduranceIndexFor(difficulty)));
}
