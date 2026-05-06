/**
 * Loop generation algorithm. Two strategies, in order of preference:
 *
 *   1. POI-aware. Fetch parks, promenades, greenways and trails around the
 *      start, pick three angularly-spread waypoints, route through them.
 *      This is what makes Nice loops include the Promenade des Anglais
 *      instead of bouncing off arbitrary points in the sea or in dodgy
 *      neighbourhoods.
 *
 *   2. Blind triangulation. Fallback when Overpass times out or returns
 *      too few POI (rural areas, sparsely tagged regions). Same code as
 *      the original MVP — three waypoints in a triangle pattern, iterative
 *      radius correction. Kept as a safety net so the feature degrades
 *      gracefully instead of failing.
 *
 * Both strategies share the same convergence loop: ratio-based correction
 * with a damping factor, capped at MAX_ADJUSTMENT_ATTEMPTS passes.
 */

import type { Discipline } from "@/types";
import type { RouteCoordinate } from "@/types/route";
import { destinationPoint } from "../elevation";
import { routeViaBrouter, type BrouterTraceResult } from "../routing";
import {
  DISTANCE_TOLERANCE,
  MAX_ADJUSTMENT_ATTEMPTS,
  POI_AWARE_MIN_COUNT,
  POI_SEARCH_RADIUS_FACTOR,
} from "../constants";
import { fetchPoiCandidates } from "../poi/overpass";
import { selectDiverseWaypoints, type PoiBoost } from "../poi/poiSelector";
import type { RoutePoi } from "../poi/poiTypes";

export interface LoopGenerationResult extends BrouterTraceResult {
  /** Number of adjustment passes that ran (0 = first attempt was good). */
  attempts: number;
  /** True when the final distance is within {@link DISTANCE_TOLERANCE}. */
  withinTolerance: boolean;
  /** POI selected as waypoints, attached so the UI can render named markers. */
  pois: RoutePoi[];
  /** Which strategy actually produced the trace. Useful for debugging. */
  strategy: "poi-aware" | "triangulation";
}

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
 * to `targetDistanceKm`. Tries the POI-aware strategy first and falls back
 * to blind triangulation on failure.
 */
export async function generateLoop(args: {
  start: RouteCoordinate;
  targetDistanceKm: number;
  discipline: Discipline;
  seed: number;
  signal?: AbortSignal;
  /**
   * Optional POI bias used for session-aware generation: e.g. nudge
   * interval workouts onto an athletics track instead of a generic park.
   */
  poiBoost?: PoiBoost;
}): Promise<LoopGenerationResult> {
  const { start, targetDistanceKm, discipline, seed, signal, poiBoost } = args;
  const targetM = targetDistanceKm * 1000;
  // The loop circumscribes a triangle of side ≈ π × radius in urban areas,
  // so radius ≈ target / (π × 2) when each side is half the perimeter.
  const baseRadiusM = (targetM / Math.PI) * 0.5;

  // ── Strategy 1: POI-aware ─────────────────────────────────────
  try {
    const pois = await fetchPoiCandidates({
      center: start,
      radiusM: baseRadiusM * POI_SEARCH_RADIUS_FACTOR,
      signal,
    });

    if (pois.length >= POI_AWARE_MIN_COUNT) {
      const result = await iteratePoiLoop({
        start,
        targetM,
        discipline,
        pois,
        seed,
        signal,
        poiBoost,
      });
      if (result) return result;
      // result === null means we couldn't converge on a POI loop —
      // drop through to triangulation.
    }
  } catch {
    // Network/Overpass error → fall back silently.
  }

  // ── Strategy 2: Blind triangulation fallback ──────────────────
  return iterateTriangulation({
    start,
    targetM,
    discipline,
    seed,
    signal,
    initialRadiusM: baseRadiusM,
  });
}

interface LoopAttemptArgs {
  start: RouteCoordinate;
  targetM: number;
  discipline: Discipline;
  seed: number;
  signal?: AbortSignal;
}

/**
 * Iterative POI-aware loop. Each pass selects three diverse POI, routes
 * through them, and adjusts the *target distance window* used for selection
 * — not the POI list — so we stay in the same neighbourhoods while
 * re-tightening on the requested length.
 */
async function iteratePoiLoop(
  args: LoopAttemptArgs & {
    pois: NonNullable<Awaited<ReturnType<typeof fetchPoiCandidates>>>;
    poiBoost?: PoiBoost;
  },
): Promise<LoopGenerationResult | null> {
  const { start, targetM, discipline, pois, seed, signal, poiBoost } = args;

  let targetRadiusM = (targetM / Math.PI) * 0.5;
  let trace: BrouterTraceResult | null = null;
  let chosen: ReturnType<typeof selectDiverseWaypoints> = [];
  let attempts = 0;

  while (attempts < MAX_ADJUSTMENT_ATTEMPTS) {
    // The seed is passed through to the selector so two candidates with
    // different seeds explore different waypoint sets even when their POI
    // pool is identical. We also re-derive a per-attempt seed so a failed
    // first pass tries a different selection on retry instead of repeating
    // the same trio that just over/undershot.
    chosen = selectDiverseWaypoints(
      start,
      pois,
      targetRadiusM,
      3,
      seed + attempts * 1009,
      poiBoost,
    );
    if (chosen.length === 0) return null;

    trace = await routeViaBrouter({
      waypoints: [start, ...chosen.map((p) => p.point), start],
      discipline,
      signal,
    });

    const ratio = trace.distanceM / targetM;
    if (Math.abs(ratio - 1) <= DISTANCE_TOLERANCE) break;

    // Same damped correction as triangulation but applied to the *selection*
    // target, not a triangle radius. Damping 0.7 is empirically stable.
    const correction = 1 + (1 / ratio - 1) * 0.7;
    targetRadiusM = Math.max(50, targetRadiusM * correction);
    attempts += 1;
  }

  if (!trace || chosen.length === 0) return null;

  const finalRatio = trace.distanceM / targetM;
  return {
    ...trace,
    attempts,
    withinTolerance: Math.abs(finalRatio - 1) <= DISTANCE_TOLERANCE,
    strategy: "poi-aware",
    pois: chosen.map((p) => ({ type: p.type, point: p.point, name: p.name })),
  };
}

/**
 * Original blind-triangulation loop. Used as a fallback when no POI is
 * available. Identical to the pre-refactor behaviour modulo the new return
 * fields (`pois`, `strategy`).
 */
async function iterateTriangulation(
  args: LoopAttemptArgs & { initialRadiusM: number },
): Promise<LoopGenerationResult> {
  const { start, targetM, discipline, seed, signal } = args;
  let radiusM = args.initialRadiusM;
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
    if (Math.abs(ratio - 1) <= DISTANCE_TOLERANCE) break;

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
    strategy: "triangulation",
    pois: [],
  };
}
