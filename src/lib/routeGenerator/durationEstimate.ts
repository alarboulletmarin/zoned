/**
 * Discipline-aware duration estimate for a generated route.
 *
 * Brouter exposes a `total-time` field in its GeoJSON response, but it's
 * computed for the underlying *vehicle profile* (trekking / fastbike) rather
 * than a runner's expected pace — so an 8 km loop ends up at 24 minutes,
 * which is ~20 km/h and obviously wrong for running.
 *
 * Instead we re-derive the estimate from a baseline pace per discipline,
 * plus a Naismith-style elevation adjustment so a 200 m D+ loop reads
 * slower than a flat one of the same length.
 *
 * The baseline is intentionally a "reasonable casual" pace, not a race
 * pace — an order-of-magnitude figure that lets the user plan a workout
 * window. A future enhancement could tap the user's configured zones to
 * personalise this, but that's overkill for the first iteration.
 */

import type { Discipline } from "@/types";

/** Baseline horizontal speed in m/s. */
const BASELINE_SPEED_MS: Record<Discipline, number> = {
  running: 10_000 / 3_600, // 10 km/h ≈ 6:00/km — relaxed running pace
  cycling: 25_000 / 3_600, // 25 km/h — leisurely road pace
  swimming: 4_000 / 3_600, // 4 km/h ≈ 1:30/100m — moderate freestyle
};

/**
 * Extra seconds added per metre of cumulative elevation gain. Modelled on
 * Naismith's rule (1 minute per 10 m of ascent on foot) and softened for
 * cycling (climbing slows you down, but rolling terrain doesn't penalise
 * the same way).
 */
const ELEVATION_PENALTY_S_PER_M: Record<Discipline, number> = {
  running: 6, // ~1 min per 10 m of D+
  cycling: 3, // ~30 s per 10 m of D+
  swimming: 0,
};

export function estimateDurationSec(args: {
  distanceM: number;
  elevationGainM: number;
  discipline: Discipline;
}): number {
  const { distanceM, elevationGainM, discipline } = args;
  const speed = BASELINE_SPEED_MS[discipline];
  if (speed <= 0 || distanceM <= 0) return 0;

  const horizontalSec = distanceM / speed;
  const elevationSec = Math.max(0, elevationGainM) * ELEVATION_PENALTY_S_PER_M[discipline];
  return Math.round(horizontalSec + elevationSec);
}
