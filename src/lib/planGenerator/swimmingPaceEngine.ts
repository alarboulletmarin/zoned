/**
 * Swimming Pace Engine — Evidence-based training pace calculations.
 *
 * Implements the Critical Swim Speed (CSS) 6-zone model used in most
 * triathlon and open-water curricula. Paces are expressed as seconds per 100m.
 *
 * References:
 * - Rushall, B. & Pyne, D. (2009). A Scientific Approach to Swimming.
 * - Maglischo, E. (2003). Swimming Fastest.
 * - Ginn, E. (1993). The Application of the Critical Power Test to Swimming.
 *   Derivation of CSS from a 400m + 200m time trial.
 */

import type { Difficulty } from "@/types";

// ── Zone system ─────────────────────────────────────────────────────

/** Swim training zones (aligned on the running 6-zone convention for cross-reference). */
export type SwimZone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6";

export interface SwimPaceRange {
  /** Faster end of the pace range (seconds per 100m). */
  minSecPer100m: number;
  /** Slower end of the pace range (seconds per 100m). */
  maxSecPer100m: number;
}

export interface SwimmingZones {
  /** Source CSS (seconds per 100m). */
  cssSecPer100m: number;
  /** True if CSS was provided by the athlete (vs difficulty fallback). */
  fromUserData: boolean;
  /** Pace ranges by zone. */
  zones: Record<SwimZone, SwimPaceRange>;
}

// ── Zone deltas in seconds per 100m relative to CSS ─────────────────
// Negative = faster than CSS. Positive = slower than CSS.
// Convention: [fasterDelta, slowerDelta] with slowerDelta ≥ fasterDelta.
// Calibrated against common tri / masters protocols (Sheila Taormina, Swim Smooth).

const CSS_DELTAS: Record<SwimZone, [number, number]> = {
  Z1: [+10, +20], // Recovery — easy aerobic, technique focus
  Z2: [+5, +10],  // Aerobic endurance
  Z3: [+2, +5],   // Tempo / aerobic threshold
  Z4: [-2, +2],   // Threshold (CSS itself)
  Z5: [-5, -2],   // VO2max intervals (25s–1min reps)
  Z6: [-10, -5],  // Sprint / neuromuscular (short reps with full recovery)
};

// ── Fallback CSS by difficulty ──────────────────────────────────────
// Population estimates expressed as seconds per 100m (freestyle).

const FALLBACK_CSS_SEC_PER_100M: Record<Difficulty, number> = {
  beginner: 145,     // 2:25 / 100m
  intermediate: 115, // 1:55 / 100m
  advanced: 95,      // 1:35 / 100m
  elite: 75,         // 1:15 / 100m
};

// ── Intensity factors per swim zone (for sTSS) ──────────────────────
// Zone midpoints relative to CSS. Calibrated to align with the running and
// cycling scales at Z2–Z4 so cross-discipline substitution produces
// meaningful TSS matches. Z1 stays slightly higher than other disciplines
// because swimming has an inherent buoyancy floor.

export const SWIM_ZONE_INTENSITY_FACTORS: Record<SwimZone, number> = {
  Z1: 0.55,
  Z2: 0.75,
  Z3: 0.88,
  Z4: 1.00,
  Z5: 1.08,
  Z6: 1.18,
};

// ── Helpers ─────────────────────────────────────────────────────────

function roundSeconds(value: number): number {
  return Math.round(value);
}

function buildZones(cssSecPer100m: number): Record<SwimZone, SwimPaceRange> {
  const result = {} as Record<SwimZone, SwimPaceRange>;
  for (const [zone, [fasterDelta, slowerDelta]] of Object.entries(CSS_DELTAS) as [
    SwimZone,
    [number, number],
  ][]) {
    result[zone] = {
      minSecPer100m: roundSeconds(cssSecPer100m + fasterDelta),
      maxSecPer100m: roundSeconds(cssSecPer100m + slowerDelta),
    };
  }
  return result;
}

// ── Core functions ──────────────────────────────────────────────────

/**
 * Compute swimming training zones from CSS. When CSS is absent, a conservative
 * fallback based on difficulty is used (e.g. a beginner plan stays swimmable).
 */
export function calculateSwimmingZones(args: {
  cssSecPer100m?: number;
  difficulty?: Difficulty;
}): SwimmingZones {
  const { cssSecPer100m, difficulty } = args;
  const hasReal = typeof cssSecPer100m === "number" && cssSecPer100m > 0;
  const effectiveCss = hasReal
    ? cssSecPer100m!
    : FALLBACK_CSS_SEC_PER_100M[difficulty ?? "intermediate"];

  return {
    cssSecPer100m: effectiveCss,
    fromUserData: hasReal,
    zones: buildZones(effectiveCss),
  };
}

/**
 * Derive CSS in seconds per 100m from a 400m + 200m field test
 * (Ginn 1993: CSS = (400 − 200) / (t400 − t200) converted to s/100m).
 *
 * @param time400Sec - Time for 400m freestyle in seconds
 * @param time200Sec - Time for 200m freestyle in seconds
 * @returns CSS in seconds per 100m, or 0 when inputs are invalid.
 */
export function estimateCssFrom400And200(time400Sec: number, time200Sec: number): number {
  if (!Number.isFinite(time400Sec) || !Number.isFinite(time200Sec)) return 0;
  if (time400Sec <= time200Sec || time200Sec <= 0) return 0;
  const speedMetersPerSec = (400 - 200) / (time400Sec - time200Sec);
  if (speedMetersPerSec <= 0) return 0;
  return roundSeconds(100 / speedMetersPerSec);
}

/** Map a generic session type to the swim zone the main set targets. */
export function swimmingSessionTypeToZone(sessionType: string): SwimZone {
  switch (sessionType) {
    case "recovery":
    case "technique":
      return "Z1";
    case "endurance":
    case "long_swim":
    case "long_run":
      return "Z2";
    case "tempo":
      return "Z3";
    case "threshold":
    case "race_specific":
      return "Z4";
    case "vo2max":
    case "intervals":
      return "Z5";
    case "speed":
    case "sprint":
      return "Z6";
    default:
      return "Z2";
  }
}

/** Format a swim pace value as "mm:ss / 100m". */
export function formatSwimPace(secPer100m: number): string {
  const minutes = Math.floor(secPer100m / 60);
  const seconds = Math.round(secPer100m % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Format a swim pace range as "mm:ss–mm:ss / 100m" (faster first). */
export function formatSwimPaceRange(range: SwimPaceRange): string {
  return `${formatSwimPace(range.minSecPer100m)}–${formatSwimPace(range.maxSecPer100m)}`;
}

/**
 * Estimate duration to cover a given distance at a zone's average pace.
 *
 * @param distanceMeters - Swim distance in metres
 * @param zone - Target swim zone
 * @param zones - Zone map (output of {@link calculateSwimmingZones})
 * @returns Estimated duration in minutes
 */
export function estimateSwimDuration(
  distanceMeters: number,
  zone: SwimZone,
  zones: SwimmingZones,
): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) return 0;
  const range = zones.zones[zone];
  const avgPacePer100m = (range.minSecPer100m + range.maxSecPer100m) / 2;
  const totalSec = (distanceMeters / 100) * avgPacePer100m;
  return Math.round((totalSec / 60) * 10) / 10;
}
