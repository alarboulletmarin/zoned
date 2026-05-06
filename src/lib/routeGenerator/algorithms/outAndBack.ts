/**
 * Out-and-back generation algorithm. Two strategies:
 *
 *   1. POI-aware. Pick the highest-scoring POI in a ±45° slice around the
 *     requested bearing, at roughly half the target distance. The trip
 *     ends at a real destination (a park, a beach, a promenade) instead
 *     of a coordinate in the void.
 *
 *   2. Blind. Project a single waypoint at half the target distance in
 *      the requested bearing. Convergence is identical to the loop
 *      algorithm — single iterative correction loop.
 *
 * As with loops, both strategies share the same correction loop and only
 * differ in how they choose the turn point.
 */

import type { Discipline } from "@/types";
import type { RouteCoordinate } from "@/types/route";
import { destinationPoint, haversineDistanceM } from "../elevation";
import { routeViaBrouter, type BrouterTraceResult } from "../routing";
import {
  DISTANCE_TOLERANCE,
  MAX_ADJUSTMENT_ATTEMPTS,
  POI_SEARCH_RADIUS_FACTOR,
} from "../constants";
import { fetchPoiCandidates } from "../poi/overpass";
import { pickFurthestPoiInBearing } from "../poi/poiSelector";
import type { RoutePoi } from "../poi/poiTypes";

export interface OutAndBackGenerationResult extends BrouterTraceResult {
  attempts: number;
  withinTolerance: boolean;
  /** Bearing actually used (degrees, 0 = North). */
  bearingDeg: number;
  pois: RoutePoi[];
  strategy: "poi-aware" | "blind";
}

function seededBearing(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return ((x - Math.floor(x)) * 360) % 360;
}

/** Half-width of the directional slice when looking for a POI in a bearing. */
const BEARING_TOLERANCE_DEG = 45;

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
  // Routed legs are typically 1.2-1.4× the great-circle distance in mixed
  // terrain, so the turn point sits at target/2 then gets corrected.
  const halfTargetM = targetM / 2;

  // ── Strategy 1: POI-aware ─────────────────────────────────────
  try {
    const pois = await fetchPoiCandidates({
      center: start,
      radiusM: halfTargetM * POI_SEARCH_RADIUS_FACTOR,
      signal,
    });

    const poi = pickFurthestPoiInBearing(
      start,
      pois,
      bearingDeg,
      BEARING_TOLERANCE_DEG,
      halfTargetM * 0.6,
      halfTargetM * 1.4,
    );

    if (poi) {
      const result = await iteratePoiOutAndBack({
        start,
        targetM,
        discipline,
        signal,
        bearingDeg,
        poi,
      });
      if (result) return result;
    }
  } catch {
    // Network / Overpass error → fall through to blind algorithm.
  }

  // ── Strategy 2: Blind projection ──────────────────────────────
  return iterateBlindOutAndBack({
    start,
    targetM,
    discipline,
    signal,
    bearingDeg,
  });
}

interface BlindArgs {
  start: RouteCoordinate;
  targetM: number;
  discipline: Discipline;
  bearingDeg: number;
  signal?: AbortSignal;
}

/**
 * POI-aware leg: route start → POI → start. Same iterative correction loop,
 * but on each pass the turn point is *projected from the start in the same
 * bearing as the POI* — so the routed length is corrected without abandoning
 * the POI's general neighbourhood.
 */
async function iteratePoiOutAndBack(
  args: BlindArgs & {
    poi: NonNullable<ReturnType<typeof pickFurthestPoiInBearing>>;
  },
): Promise<OutAndBackGenerationResult | null> {
  const { start, targetM, discipline, signal, bearingDeg, poi } = args;

  // First call: trip directly to the POI. Subsequent calls extend or
  // contract along the same vector.
  let trace: BrouterTraceResult | null = null;
  let waypoint: RouteCoordinate = poi.point;
  let waypointDistanceM = haversineDistanceM(start, poi.point);
  let attempts = 0;

  while (attempts < MAX_ADJUSTMENT_ATTEMPTS) {
    trace = await routeViaBrouter({
      waypoints: [start, waypoint, start],
      discipline,
      signal,
    });

    const ratio = trace.distanceM / targetM;
    if (Math.abs(ratio - 1) <= DISTANCE_TOLERANCE) break;

    const correction = 1 + (1 / ratio - 1) * 0.7;
    waypointDistanceM = Math.max(50, waypointDistanceM * correction);
    waypoint = destinationPoint(start, waypointDistanceM, bearingDeg);
    attempts += 1;
  }

  if (!trace) return null;

  return {
    ...trace,
    attempts,
    withinTolerance: Math.abs(trace.distanceM / targetM - 1) <= DISTANCE_TOLERANCE,
    bearingDeg,
    strategy: "poi-aware",
    pois: [{ type: poi.type, point: poi.point, name: poi.name }],
  };
}

async function iterateBlindOutAndBack(
  args: BlindArgs,
): Promise<OutAndBackGenerationResult> {
  const { start, targetM, discipline, signal, bearingDeg } = args;

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
    strategy: "blind",
    pois: [],
  };
}

