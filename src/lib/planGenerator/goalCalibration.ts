/**
 * Goal Calibration — let the target race time shape the plan
 *
 * The wizard collects a target pace, but it only ever reached the PDF and the
 * share link: a runner aiming for a 2h30 marathon and one aiming for 4h30 got
 * the exact same plan. Chasing a time the current fitness does not support
 * requires more volume, not just more hope, so the target pace now feeds the
 * volume model.
 */

import type { RaceDistance } from "@/types/plan";
import { VMA_RACE_PERCENTAGES } from "./constants";

/** How far the goal may push weekly volume, up or down */
const MIN_DEMAND = 0.95;
const MAX_DEMAND = 1.25;

/** Beyond this gap the goal is out of reach in one cycle, not just ambitious */
export const UNREALISTIC_DEMAND = 1.15;

function raceDistanceKm(raceDistance: RaceDistance): number {
  const distances: Record<RaceDistance, number> = {
    "5K": 5, "10K": 10, semi: 21.1, marathon: 42.195,
    trail_short: 30, trail: 60, ultra: 100,
  };
  return distances[raceDistance];
}

/**
 * VMA a runner needs to hold `paceMinKm` over `raceDistance`, derived from the
 * same VMA percentages the race-time prediction uses.
 */
export function vmaRequiredForPace(paceMinKm: number, raceDistance: RaceDistance): number {
  if (paceMinKm <= 0) return 0;
  const speedKmh = 60 / paceMinKm;
  const pct = VMA_RACE_PERCENTAGES[raceDistance] / 100;
  return pct > 0 ? speedKmh / pct : 0;
}

/**
 * Volume multiplier implied by the target time.
 *
 * 1.0 means the goal matches current fitness. Above 1.0 the runner is reaching
 * for a time their current VMA does not support, which needs more training
 * volume. Returns 1 when either input is missing, so plans without a target
 * pace behave exactly as before.
 */
export function goalDemandFactor(
  targetPaceMinKm: number | undefined,
  vma: number | undefined,
  raceDistance: RaceDistance,
): number {
  if (!targetPaceMinKm || !vma || vma <= 0) return 1;
  const required = vmaRequiredForPace(targetPaceMinKm, raceDistance);
  if (required <= 0) return 1;
  return Math.min(MAX_DEMAND, Math.max(MIN_DEMAND, required / vma));
}

/**
 * Target time in minutes implied by a pace, for user-facing messages.
 */
export function targetTimeMinutes(paceMinKm: number, raceDistance: RaceDistance): number {
  return paceMinKm * raceDistanceKm(raceDistance);
}
