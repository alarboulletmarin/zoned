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
  POI_SEARCH_RADIUS_FACTOR,
} from "../constants";
import { fetchPoiCandidates } from "../poi/overpass";
import { pickFurthestPoiInBearing, type PoiBoost } from "../poi/poiSelector";
import type { RoutePoi } from "../poi/poiTypes";
import { convergeWithCorrection, dampedRatioCorrection } from "./shared/convergence";
import { seededBearing } from "./shared/rng";

export interface OutAndBackGenerationResult extends BrouterTraceResult {
  attempts: number;
  withinTolerance: boolean;
  /** Bearing actually used (degrees, 0 = North). */
  bearingDeg: number;
  pois: RoutePoi[];
  strategy: "poi-aware" | "blind";
  /**
   * Final waypoint requested from Brouter. Surfaced so callers can detect
   * traces that didn't actually reach their target (e.g. turn point fell in
   * the sea and Brouter only routed to the coast).
   */
  projectedTurn: RouteCoordinate;
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
  poiBoost?: PoiBoost;
}): Promise<OutAndBackGenerationResult> {
  const { start, targetDistanceKm, discipline, seed, signal, poiBoost } = args;
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
      poiBoost,
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

  // State: distance to the projected turn point along the bearing.
  // The first attempt routes straight to the POI; subsequent attempts
  // extend or contract along the same vector.
  const result = await convergeWithCorrection<{ distanceM: number; turn: RouteCoordinate }>({
    initial: {
      distanceM: haversineDistanceM(start, poi.point),
      turn: poi.point,
    },
    routeOnce: ({ turn }) =>
      routeViaBrouter({ waypoints: [start, turn, start], discipline, signal }),
    refine: ({ distanceM }, ratio) => {
      const next = Math.max(50, distanceM * dampedRatioCorrection(ratio));
      return { distanceM: next, turn: destinationPoint(start, next, bearingDeg) };
    },
    targetM,
  });

  return {
    ...result.trace,
    attempts: result.attempts,
    withinTolerance: result.withinTolerance,
    bearingDeg,
    strategy: "poi-aware",
    pois: [{ type: poi.type, point: poi.point, name: poi.name }],
    projectedTurn: result.finalState.turn,
  };
}

async function iterateBlindOutAndBack(
  args: BlindArgs,
): Promise<OutAndBackGenerationResult> {
  const { start, targetM, discipline, signal, bearingDeg } = args;
  const initialDistance = targetM / 2;
  const result = await convergeWithCorrection<{ distanceM: number; turn: RouteCoordinate }>({
    initial: {
      distanceM: initialDistance,
      turn: destinationPoint(start, initialDistance, bearingDeg),
    },
    routeOnce: ({ turn }) =>
      routeViaBrouter({ waypoints: [start, turn, start], discipline, signal }),
    refine: ({ distanceM }, ratio) => {
      const next = Math.max(50, distanceM * dampedRatioCorrection(ratio));
      return { distanceM: next, turn: destinationPoint(start, next, bearingDeg) };
    },
    targetM,
  });

  return {
    ...result.trace,
    attempts: result.attempts,
    withinTolerance: result.withinTolerance,
    bearingDeg,
    strategy: "blind",
    pois: [],
    projectedTurn: result.finalState.turn,
  };
}

