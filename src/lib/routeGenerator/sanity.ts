/**
 * Sanity checks applied to a routed candidate before showing it to the user.
 *
 * Brouter does its best to route between any two coordinates, even when the
 * caller projects a turn point into the sea. The result is usually a trace
 * that ends well short of the requested coordinate (Brouter only got to the
 * coast) or, worse, a valid-looking trace that loops along the shoreline
 * before turning back at an arbitrary inland match.
 *
 * The heuristics here detect those degenerate cases without an external
 * land/water dataset:
 *
 *   - **End-of-trace mismatch.** For an out-and-back, the routed turn point
 *     should be within ~250 m of the projected target. If it sits far from
 *     it, Brouter probably hit the coast and bailed.
 *   - **Distance shortfall.** A trace much shorter than the requested target
 *     means the algorithm couldn't reach the turn point. Already mostly
 *     covered by `CANDIDATE_DISTANCE_SLACK`, but stricter when projected.
 */

import type { RouteCoordinate } from "@/types/route";
import { haversineDistanceM } from "./elevation";

const TURNAROUND_MISMATCH_THRESHOLD_M = 350;

/**
 * Check that an out-and-back trace actually reached its projected turn
 * waypoint. Returns `true` when the trace is plausible, `false` when the
 * turn point is suspiciously far from the routed apex (likely sea/water).
 */
export function outAndBackReachedTurn(
  points: RouteCoordinate[],
  projectedTurn: RouteCoordinate,
): boolean {
  if (points.length < 3) return false;
  const apex = pickApex(points);
  return haversineDistanceM(apex, projectedTurn) <= TURNAROUND_MISMATCH_THRESHOLD_M;
}

/**
 * Pick the point of the trace that is the furthest from the start. For an
 * out-and-back this is the actual turn point, regardless of how Brouter
 * shaped the trace.
 */
function pickApex(points: RouteCoordinate[]): RouteCoordinate {
  const start = points[0];
  let best = points[1] ?? start;
  let bestDist = 0;
  for (const p of points) {
    const d = haversineDistanceM(start, p);
    if (d > bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

export const SEA_DETECTION_TURN_THRESHOLD_M = TURNAROUND_MISMATCH_THRESHOLD_M;
