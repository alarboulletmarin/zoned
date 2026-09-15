/**
 * Race performance model, the share of VMA a runner can hold over a race.
 *
 * The share of maximal aerobic speed a runner sustains falls with the
 * *duration* of the effort, not with the distance, and it falls faster for
 * runners with less endurance. Péronnet & Thibault (1989) model it as
 *
 *     %VMA(t) = 100 − E × ln(t / 7 min)        for t ≥ 7 min
 *
 * where E is an endurance index: about 5 for elite runners, 6-7 for club
 * runners, 8 and above for beginners. A fixed table per distance (97 % for a
 * 5K, 77 % for a marathon) is only right for one level of runner at one
 * speed: it predicted a 31-minute 5K for a beginner who would in fact run
 * about 34, and it fed the same bias into the training paces.
 *
 * References:
 * - Péronnet F, Thibault G. Mathematical analysis of running performance and
 *   world running records. J Appl Physiol. 1989;67(1):453-65.
 * - Billat VL, Koralsztein JP. Significance of the velocity at VO2max and
 *   time to exhaustion at this velocity. Sports Med. 1996;22(2):90-108.
 * - Nikolaidis PT et al. Physiological and race pace characteristics of medium
 *   and low-level Athens marathon runners. Sports. 2020;8(9):116.
 */

import type { Difficulty } from "@/types";

/** Duration (minutes) a runner can hold 100 % of VMA */
const T_MAX_MIN = 7;

/** Endurance index E per level (Péronnet & Thibault) */
export const ENDURANCE_INDEX: Record<Difficulty, number> = {
  beginner: 8,
  intermediate: 6.5,
  advanced: 5.5,
  elite: 5,
};

/** Road distances in km */
export const ROAD_DISTANCE_KM = {
  "5K": 5,
  "10K": 10,
  semi: 21.1,
  marathon: 42.195,
} as const;

export type RoadDistance = keyof typeof ROAD_DISTANCE_KM;

export function enduranceIndexFor(level?: Difficulty): number {
  return ENDURANCE_INDEX[level ?? "intermediate"];
}

/**
 * Share of VMA (0-1) sustainable for `minutes`, for endurance index `e`.
 * Above 100 % under 7 minutes is clamped: the model is for aerobic efforts.
 */
export function sustainableVmaFraction(minutes: number, e: number): number {
  if (!Number.isFinite(minutes) || minutes <= T_MAX_MIN) return 1;
  const pct = 100 - e * Math.log(minutes / T_MAX_MIN);
  return Math.min(1, Math.max(0.4, pct / 100));
}

/**
 * Predicted race time in minutes for a distance, from VMA and endurance index.
 * The fraction depends on the time, which depends on the fraction, so it is
 * solved by fixed-point iteration (converges in a handful of steps).
 */
export function predictRaceMinutes(vmaKmh: number, distanceKm: number, e: number): number {
  if (!(vmaKmh > 0) || !(distanceKm > 0)) return 0;
  let minutes = (distanceKm / (vmaKmh * 0.9)) * 60;
  for (let i = 0; i < 12; i++) {
    const f = sustainableVmaFraction(minutes, e);
    const next = (distanceKm / (vmaKmh * f)) * 60;
    if (Math.abs(next - minutes) < 0.01) return next;
    minutes = next;
  }
  return minutes;
}

/** Share of VMA (0-1) a runner holds on a given distance, at their predicted time */
export function raceVmaFraction(vmaKmh: number, distanceKm: number, e: number): number {
  const minutes = predictRaceMinutes(vmaKmh, distanceKm, e);
  return minutes > 0 ? sustainableVmaFraction(minutes, e) : 1;
}

/**
 * VMA implied by a race performance. No iteration needed: the time is known,
 * so the sustainable fraction is known.
 */
export function vmaFromRaceTime(distanceKm: number, minutes: number, e: number): number {
  if (!(distanceKm > 0) || !(minutes > 0)) return 0;
  const speedKmh = distanceKm / (minutes / 60);
  return speedKmh / sustainableVmaFraction(minutes, e);
}

/**
 * Format minutes as h:mm:ss or mm:ss.
 */
export function formatRaceMinutes(totalMinutes: number): string {
  const totalSeconds = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
