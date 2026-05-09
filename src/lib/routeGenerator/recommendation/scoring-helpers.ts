/**
 * Scoring sub-functions extracted from {@link recommendation.ts} so the
 * main scoring loop reads as a recipe (call helper, weigh, sum) rather
 * than a 200-line inline pipeline. Each helper here is a pure function
 * over `(route, intent, athlete)` slices.
 */

import { calculateTrainingPaces, sessionTypeToIntensity } from "@/lib/planGenerator/paceEngine";
import type { SessionType } from "@/types";
import type { Route } from "@/types/route";
import type { RouteAthleteProfile, RouteIntent } from "../recommendation";
import { clamp01 } from "./math";

/**
 * Estimate how long the route would take *for this user*. Brouter's own
 * `total-time` is computed for its routing profile, not for a runner's
 * actual paces, so we override it with a pace-aware estimate when the
 * discipline is running. Cycling falls back to Brouter's value.
 */
export function estimatePredictedDurationSec(
  route: Route,
  intent: RouteIntent,
  athlete: RouteAthleteProfile | null,
): number {
  if (intent.discipline === "running") {
    const paces = calculateTrainingPaces(athlete?.vma, athlete?.runnerLevel);
    const intensity = intent.sessionType ? sessionTypeToIntensity(intent.sessionType) : "E";
    const paceRange = paces[intensity];
    const avgPaceMinKm = (paceRange.min + paceRange.max) / 2;
    const horizontalSec = (route.distanceM / 1000) * avgPaceMinKm * 60;
    const elevationPenaltySec = route.elevationGainM * 4;
    return Math.round(horizontalSec + elevationPenaltySec);
  }

  return route.estimatedDurationSec;
}

/**
 * Map (terrainPreference, climbPerKm) → [0, 1] score.
 * - `flat` rewards low climb-per-km (ideal: 0 m/km).
 * - `climbing` rewards high climb-per-km (ideal: 28+ m/km).
 * - `rolling` rewards values around 15 m/km (mixed terrain).
 */
export function terrainScoreForIntent(
  preference: RouteIntent["terrainPreference"],
  climbPerKm: number,
): number {
  switch (preference) {
    case "flat":
      return clamp01(1 - climbPerKm / 22);
    case "climbing":
      return clamp01(climbPerKm / 28);
    case "rolling":
      return clamp01(1 - Math.abs(climbPerKm - 15) / 18);
  }
}

/**
 * Penalise routes that don't suit the athlete: too long for their
 * current long-run baseline, too hilly for a beginner, too far past the
 * weekly mileage they've been holding. Returns 1 when no profile is
 * available (we don't know enough to penalise).
 */
export function athleteFitScore(
  intent: RouteIntent,
  athlete: RouteAthleteProfile | null,
  distanceKm: number,
  climbPerKm: number,
): number {
  if (!athlete) return 0.9;

  let score = 1;
  if (
    intent.sessionType === "long_run" &&
    athlete.currentLongRunKm &&
    distanceKm > athlete.currentLongRunKm * 1.1
  ) {
    score -= Math.min(0.35, (distanceKm - athlete.currentLongRunKm * 1.1) / 8);
  }

  if (athlete.runnerLevel === "beginner" && intent.terrainPreference !== "climbing" && climbPerKm > 14) {
    score -= Math.min(0.3, (climbPerKm - 14) / 22);
  }

  if (athlete.currentWeeklyKm && athlete.currentWeeklyKm < 25 && distanceKm > intent.targetDistanceKm * 1.12) {
    score -= 0.12;
  }

  return clamp01(score);
}

export interface ScoreWeights {
  distance: number;
  duration: number;
  terrain: number;
  continuity: number;
  shape: number;
  repeatability: number;
  athlete: number;
}

/**
 * Per-session-type weight presets, tuned empirically so the score
 * reflects what runners care about for that workout (e.g. distance is
 * king for a long run; terrain dominates for hills; continuity matters
 * for a tempo session where the athlete shouldn't be turning every
 * block).
 */
export function scoreWeightsForIntent(sessionType?: SessionType): ScoreWeights {
  switch (sessionType) {
    case "recovery":
      return { distance: 0.22, duration: 0.14, terrain: 0.28, continuity: 0.12, shape: 0.1, repeatability: 0.04, athlete: 0.1 };
    case "threshold":
    case "tempo":
    case "race_specific":
      return { distance: 0.2, duration: 0.18, terrain: 0.22, continuity: 0.18, shape: 0.08, repeatability: 0.04, athlete: 0.1 };
    case "hills":
      return { distance: 0.14, duration: 0.1, terrain: 0.28, continuity: 0.08, shape: 0.08, repeatability: 0.22, athlete: 0.1 };
    case "long_run":
      return { distance: 0.24, duration: 0.16, terrain: 0.12, continuity: 0.1, shape: 0.1, repeatability: 0.03, athlete: 0.15 };
    default:
      return { distance: 0.24, duration: 0.14, terrain: 0.18, continuity: 0.12, shape: 0.1, repeatability: 0.06, athlete: 0.16 };
  }
}
