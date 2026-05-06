/**
 * Waypoint selection from a list of {@link PoiCandidate}s. The two helpers
 * below each serve a different generation shape:
 *
 *   - {@link selectDiverseWaypoints} for loops: picks N points spread in
 *     azimuth so the routed loop traverses different neighbourhoods.
 *   - {@link pickFurthestPoiInBearing} for out-and-backs: a single waypoint
 *     in the requested direction that's also a runner-friendly POI.
 */

import type { RouteCoordinate } from "@/types/route";
import type { PoiCandidate } from "./poiTypes";
import { haversineDistanceM } from "../elevation";

/**
 * Compass bearing (0 = North, 90 = East, …) from `from` to `to`.
 *
 * Standard formula on a sphere — the small approximation error vs WGS-84
 * doesn't matter at the scale we use it (for POI within a few km).
 */
export function computeBearing(from: RouteCoordinate, to: RouteCoordinate): number {
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Smallest unsigned angle (0-180) between two bearings.
 */
export function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Greedy diverse subset of POI for a loop. Score each candidate by
 * `weight * distanceFitness(distance vs targetRadius)`, sort, then pick the
 * top-scoring entry whose bearing differs from already-picked entries by at
 * least `MIN_ANGULAR_GAP_DEG`. Falls back to the next-best regardless of
 * bearing if we ran out of diverse candidates.
 *
 * The bearing diversity is what gives the routed loop its triangular shape
 * — without it, all 3 waypoints can collapse onto the same nearest park.
 */
const MIN_ANGULAR_GAP_DEG = 60;

export function selectDiverseWaypoints(
  start: RouteCoordinate,
  candidates: PoiCandidate[],
  /** Ideal distance from the start, meters (typically half the loop radius). */
  targetRadiusM: number,
  /** How many waypoints to return. */
  count: number,
): PoiCandidate[] {
  if (candidates.length === 0 || count <= 0) return [];

  // Annotate each candidate with its score and bearing relative to start.
  const annotated = candidates
    .map((c) => {
      const distance = haversineDistanceM(start, c.point);
      // Bell-shaped fitness: peaks at targetRadiusM, drops off symmetrically.
      // Anything more than 2x the target gets a near-zero contribution.
      const offset = Math.abs(distance - targetRadiusM) / targetRadiusM;
      const distanceFitness = Math.max(0, 1 - offset);
      return {
        candidate: c,
        score: c.weight * distanceFitness,
        bearing: computeBearing(start, c.point),
      };
    })
    .filter((entry) => entry.score > 0.05)
    .sort((a, b) => b.score - a.score);

  if (annotated.length === 0) return [];

  const picked: typeof annotated = [];

  // First pass: enforce angular diversity.
  for (const entry of annotated) {
    if (picked.length >= count) break;
    const tooClose = picked.some(
      (p) => angularDistance(p.bearing, entry.bearing) < MIN_ANGULAR_GAP_DEG,
    );
    if (!tooClose) picked.push(entry);
  }

  // Second pass: top up if diversity left us short. Better to have a usable
  // loop with a slightly clustered waypoint than fall back to triangulation.
  if (picked.length < count) {
    for (const entry of annotated) {
      if (picked.length >= count) break;
      if (!picked.includes(entry)) picked.push(entry);
    }
  }

  return picked.map((p) => p.candidate);
}

/**
 * Pick the highest-scoring POI within `±toleranceDeg` of `bearingDeg` whose
 * distance to the start is between `minDistanceM` and `maxDistanceM`. For
 * out-and-back generation: routes a leg in the requested direction towards
 * an actual destination instead of a coordinate in the void.
 *
 * Returns `null` when no POI falls in the angular slice — the caller is
 * expected to fall back to the blind algorithm.
 */
export function pickFurthestPoiInBearing(
  start: RouteCoordinate,
  candidates: PoiCandidate[],
  bearingDeg: number,
  /** Half-width of the acceptable angular slice (e.g. 45° → ±45°). */
  toleranceDeg: number,
  minDistanceM: number,
  maxDistanceM: number,
): PoiCandidate | null {
  let best: { candidate: PoiCandidate; score: number } | null = null;

  for (const c of candidates) {
    const dist = haversineDistanceM(start, c.point);
    if (dist < minDistanceM || dist > maxDistanceM) continue;

    const bearing = computeBearing(start, c.point);
    const offset = angularDistance(bearing, bearingDeg);
    if (offset > toleranceDeg) continue;

    // Reward POI close to the centre of the requested distance window so
    // we don't pick a POI right at the edge that may not converge.
    const target = (minDistanceM + maxDistanceM) / 2;
    const distFitness = Math.max(0, 1 - Math.abs(dist - target) / target);
    const angleFitness = 1 - offset / toleranceDeg;
    const score = c.weight * distFitness * (0.5 + 0.5 * angleFitness);

    if (!best || score > best.score) best = { candidate: c, score };
  }

  return best?.candidate ?? null;
}
