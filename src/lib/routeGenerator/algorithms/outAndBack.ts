/**
 * Out-and-back generation algorithm — projects a single waypoint at half
 * the target distance in the requested bearing, then routes there and back.
 *
 * Same iterative correction loop as the loop algorithm, but operating on a
 * single waypoint distance rather than a triangle radius.
 */

import type { Discipline } from "@/types";
import type { RouteCoordinate } from "@/types/route";
import { destinationPoint } from "../elevation";
import { routeViaBrouter, type BrouterTraceResult } from "../routing";
import {
  DISTANCE_TOLERANCE,
  MAX_ADJUSTMENT_ATTEMPTS,
} from "../constants";

export interface OutAndBackGenerationResult extends BrouterTraceResult {
  attempts: number;
  withinTolerance: boolean;
  /** Bearing actually used (degrees, 0 = North). */
  bearingDeg: number;
}

function seededBearing(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return ((x - Math.floor(x)) * 360) % 360;
}

/**
 * Generate an out-and-back starting at `start` with a routed length close
 * to `targetDistanceKm`. The total distance is the round trip — the turning
 * point is placed at half the target plus an adjustment factor.
 *
 * @param bearingDeg Optional fixed bearing. When undefined a deterministic
 *   bearing is derived from the seed.
 */
export async function generateOutAndBack(args: {
  start: RouteCoordinate;
  targetDistanceKm: number;
  discipline: Discipline;
  seed: number;
  bearingDeg?: number;
  signal?: AbortSignal;
}): Promise<OutAndBackGenerationResult> {
  const { start, targetDistanceKm, discipline, seed, signal } = args;
  const bearingDeg = args.bearingDeg ?? seededBearing(seed);

  const targetM = targetDistanceKm * 1000;
  // Routed path between two points is usually 1.2-1.4× the great-circle
  // distance in mixed terrain. Start with target/2 and let the loop adjust.
  let waypointDistanceM = targetM / 2;

  let trace: BrouterTraceResult | null = null;
  let attempts = 0;

  while (attempts < MAX_ADJUSTMENT_ATTEMPTS) {
    const turn = destinationPoint(start, waypointDistanceM, bearingDeg);
    trace = await routeViaBrouter({
      waypoints: [start, turn, start],
      discipline,
      signal,
    });

    const ratio = trace.distanceM / targetM;
    if (Math.abs(ratio - 1) <= DISTANCE_TOLERANCE) break;

    const correction = 1 + (1 / ratio - 1) * 0.7;
    waypointDistanceM = Math.max(50, waypointDistanceM * correction);
    attempts += 1;
  }

  if (!trace) {
    throw new Error("out-and-back generation produced no trace");
  }

  return {
    ...trace,
    attempts,
    withinTolerance: Math.abs(trace.distanceM / targetM - 1) <= DISTANCE_TOLERANCE,
    bearingDeg,
  };
}
