/**
 * Cross-discipline Training Stress Score (TSS).
 *
 * Provides a single number expressing the internal load of a session, whatever
 * the discipline. This makes substitution decisions ("replace this endurance
 * run with a ride of equivalent stress") and multi-sport audits possible.
 *
 * TSS is defined as:
 *     TSS = hours × IF² × 100
 * with IF (Intensity Factor) = effort / threshold. 100 TSS ≈ 1 hour at threshold.
 *
 * References:
 * - Coggan, A. (2003). Training Stress Score explained.
 * - Skiba, P. (2008). Analysis of a Running TSS model (GOVSS → rTSS).
 */

import type { Discipline } from "@/types";
import { COGGAN_ZONE_INTENSITY_FACTORS, type CogganZone } from "./cyclingPaceEngine";
import { SWIM_ZONE_INTENSITY_FACTORS, type SwimZone } from "./swimmingPaceEngine";

// ── Running zone-based IF midpoints ────────────────────────────────
// Running does not have a universal NP/FTP-style IF, so we approximate
// zone midpoints relative to threshold (Z4 = IF 1.0 by definition).
// Values are aligned with COGGAN_ZONE_INTENSITY_FACTORS and
// SWIM_ZONE_INTENSITY_FACTORS at the same zone labels so cross-discipline
// substitution produces meaningful TSS matches at aerobic zones.

const RUNNING_IF_BY_ZONE: Record<number, number> = {
  1: 0.50,
  2: 0.70,
  3: 0.85,
  4: 1.00,
  5: 1.13,
  6: 1.30,
};

/** Core TSS formula. */
export function tssFromHoursAndIf(durationHours: number, intensityFactor: number): number {
  if (!Number.isFinite(durationHours) || durationHours <= 0) return 0;
  if (!Number.isFinite(intensityFactor) || intensityFactor <= 0) return 0;
  return Math.round(durationHours * intensityFactor * intensityFactor * 100);
}

// ── Cycling ────────────────────────────────────────────────────────

/**
 * Cycling TSS from normalised power and FTP (most precise when available).
 * TSS = (duration_hours × NP × IF) / FTP × 100, which reduces to the core
 * formula with IF = NP/FTP.
 */
export function bikeTssFromPower(args: {
  durationMin: number;
  normalizedPowerWatts: number;
  ftpWatts: number;
}): number {
  const { durationMin, normalizedPowerWatts, ftpWatts } = args;
  if (!Number.isFinite(ftpWatts) || ftpWatts <= 0) return 0;
  const intensityFactor = normalizedPowerWatts / ftpWatts;
  return tssFromHoursAndIf(durationMin / 60, intensityFactor);
}

/** Cycling TSS approximated from zone midpoints (used when no NP is available). */
export function bikeTssFromZone(durationMin: number, zone: CogganZone): number {
  return tssFromHoursAndIf(durationMin / 60, COGGAN_ZONE_INTENSITY_FACTORS[zone]);
}

// ── Swimming ───────────────────────────────────────────────────────

/** Swim TSS from pace and CSS (preferred when timing is available). */
export function swimTssFromPace(args: {
  durationMin: number;
  avgPaceSecPer100m: number;
  cssSecPer100m: number;
}): number {
  const { durationMin, avgPaceSecPer100m, cssSecPer100m } = args;
  if (!Number.isFinite(avgPaceSecPer100m) || avgPaceSecPer100m <= 0) return 0;
  if (!Number.isFinite(cssSecPer100m) || cssSecPer100m <= 0) return 0;
  // For swim, faster pace = higher IF: IF = CSS / avgPace (inverse).
  const intensityFactor = cssSecPer100m / avgPaceSecPer100m;
  return tssFromHoursAndIf(durationMin / 60, intensityFactor);
}

/** Swim TSS from a zone midpoint (used for planned sessions). */
export function swimTssFromZone(durationMin: number, zone: SwimZone): number {
  return tssFromHoursAndIf(durationMin / 60, SWIM_ZONE_INTENSITY_FACTORS[zone]);
}

// ── Running ────────────────────────────────────────────────────────

/**
 * Run TSS approximated from a training zone (1–6). Used for planned sessions
 * where normalised graded pace is not known.
 */
export function runTssFromZone(durationMin: number, zone: number): number {
  const factor = RUNNING_IF_BY_ZONE[zone] ?? RUNNING_IF_BY_ZONE[2];
  return tssFromHoursAndIf(durationMin / 60, factor);
}

/**
 * Run TSS from normalised graded pace vs threshold pace (Skiba 2008).
 * Both paces are in min/km — faster pace = lower number.
 */
export function runTssFromPace(args: {
  durationMin: number;
  avgPaceMinPerKm: number;
  thresholdPaceMinPerKm: number;
}): number {
  const { durationMin, avgPaceMinPerKm, thresholdPaceMinPerKm } = args;
  if (!Number.isFinite(avgPaceMinPerKm) || avgPaceMinPerKm <= 0) return 0;
  if (!Number.isFinite(thresholdPaceMinPerKm) || thresholdPaceMinPerKm <= 0) return 0;
  // Faster pace (lower number) → higher IF.
  const intensityFactor = thresholdPaceMinPerKm / avgPaceMinPerKm;
  return tssFromHoursAndIf(durationMin / 60, intensityFactor);
}

// ── Unified API ────────────────────────────────────────────────────

export interface CrossDisciplineTssInput {
  discipline: Discipline;
  durationMin: number;
  /** Zone 1–6 for running, CogganZone for cycling, SwimZone for swimming. */
  zone: number | CogganZone | SwimZone;
}

/**
 * Unified TSS for any single-discipline session described by duration + zone.
 * Dispatches to the discipline-specific calculator.
 */
export function crossDisciplineTss(input: CrossDisciplineTssInput): number {
  const { discipline, durationMin, zone } = input;
  switch (discipline) {
    case "running":
      return runTssFromZone(durationMin, typeof zone === "number" ? zone : 2);
    case "cycling":
      return bikeTssFromZone(durationMin, typeof zone === "string" ? (zone as CogganZone) : "Z2");
    case "swimming":
      return swimTssFromZone(durationMin, typeof zone === "string" ? (zone as SwimZone) : "Z2");
  }
}

/**
 * Given a target TSS and a target discipline/zone, solve for the duration (in
 * minutes) that produces an equivalent stress. Useful for substitutions:
 * "this easy 45-min run is worth ~30 TSS → how long should the replacement
 * easy ride be?".
 *
 * Returns 0 when the zone's IF is zero (invalid input).
 */
export function equivalentDurationMinForTss(args: {
  targetTss: number;
  discipline: Discipline;
  zone: number | CogganZone | SwimZone;
}): number {
  const { targetTss, discipline, zone } = args;
  if (!Number.isFinite(targetTss) || targetTss <= 0) return 0;

  let intensityFactor = 0;
  if (discipline === "running") {
    intensityFactor = RUNNING_IF_BY_ZONE[typeof zone === "number" ? zone : 2] ?? 0;
  } else if (discipline === "cycling") {
    intensityFactor = COGGAN_ZONE_INTENSITY_FACTORS[
      (typeof zone === "string" ? zone : "Z2") as CogganZone
    ] ?? 0;
  } else {
    intensityFactor = SWIM_ZONE_INTENSITY_FACTORS[
      (typeof zone === "string" ? zone : "Z2") as SwimZone
    ] ?? 0;
  }

  if (intensityFactor <= 0) return 0;
  const hours = targetTss / (intensityFactor * intensityFactor * 100);
  return Math.round(hours * 60);
}

/**
 * Compare two TSS values and report their ratio. Handy for the substitution
 * picker that wants matches within ±10% of the planned session.
 */
export function tssMatchRatio(candidate: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0;
  return candidate / target;
}
