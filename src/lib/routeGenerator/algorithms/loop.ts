/**
 * Loop generation algorithm — places three waypoints in a triangular pattern
 * around the start, routes them through Brouter, and iteratively adjusts the
 * search radius until the trace length lands within the requested tolerance.
 *
 * Triangle (rather than square or random) keeps the route convex and avoids
 * accidental self-crossings while staying simple to reason about.
 */

import type { Discipline } from "@/types";
import type { RouteCoordinate } from "@/types/route";
import { destinationPoint } from "../elevation";
import { routeViaBrouter, type BrouterTraceResult } from "../routing";
import {
  DISTANCE_TOLERANCE,
  MAX_ADJUSTMENT_ATTEMPTS,
} from "../constants";

export interface LoopGenerationResult extends BrouterTraceResult {
  /** Number of adjustment passes that ran (0 = first attempt was good). */
  attempts: number;
  /** True when the final distance is within {@link DISTANCE_TOLERANCE}. */
  withinTolerance: boolean;
}

/**
 * Deterministic pseudo-random based on the seed. Good enough to vary the
 * triangle orientation between regenerations without pulling a PRNG dep.
 */
function seededAngleOffset(seed: number): number {
  // Hash the seed into a [0, 360) bearing offset.
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return ((x - Math.floor(x)) * 360) % 360;
}

function buildTriangleWaypoints(
  start: RouteCoordinate,
  radiusM: number,
  seed: number,
): RouteCoordinate[] {
  const offset = seededAngleOffset(seed);
  return [0, 120, 240].map((step) =>
    destinationPoint(start, radiusM, (offset + step) % 360),
  );
}

/**
 * Generate a loop starting and ending at `start` with a routed length close
 * to `targetDistanceKm`. Sends up to {@link MAX_ADJUSTMENT_ATTEMPTS} requests
 * to Brouter, halving the absolute correction each pass to converge quickly.
 */
export async function generateLoop(args: {
  start: RouteCoordinate;
  targetDistanceKm: number;
  discipline: Discipline;
  seed: number;
  signal?: AbortSignal;
}): Promise<LoopGenerationResult> {
  const { start, targetDistanceKm, discipline, seed, signal } = args;

  const targetM = targetDistanceKm * 1000;
  // The triangle inscribes the loop; the routed path passes through three
  // waypoints + return. Empirically the routed length is roughly π × radius
  // for urban areas, so seed the radius from that approximation.
  let radiusM = (targetM / Math.PI) * 0.5;

  let trace: BrouterTraceResult | null = null;
  let attempts = 0;

  while (attempts < MAX_ADJUSTMENT_ATTEMPTS) {
    const waypoints = buildTriangleWaypoints(start, radiusM, seed);
    trace = await routeViaBrouter({
      waypoints: [start, ...waypoints, start],
      discipline,
      signal,
    });

    const ratio = trace.distanceM / targetM;
    const deviation = Math.abs(ratio - 1);
    if (deviation <= DISTANCE_TOLERANCE) break;

    // Damp the correction to avoid oscillation. 0.7 converges faster than 1.0
    // while staying stable on routes that compound (e.g. forced detours).
    const correction = 1 + (1 / ratio - 1) * 0.7;
    radiusM = Math.max(50, radiusM * correction);
    attempts += 1;
  }

  if (!trace) {
    throw new Error("loop generation produced no trace");
  }

  const finalRatio = trace.distanceM / targetM;
  return {
    ...trace,
    attempts,
    withinTolerance: Math.abs(finalRatio - 1) <= DISTANCE_TOLERANCE,
  };
}
