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
  POI_AWARE_MIN_COUNT,
  POI_SEARCH_RADIUS_FACTOR,
} from "../constants";
import { fetchPoiCandidates } from "../poi/overpass";
import { selectDiverseWaypoints, type PoiBoost } from "../poi/poiSelector";
import type { RoutePoi } from "../poi/poiTypes";
import { convergeWithCorrection, dampedRatioCorrection } from "./shared/convergence";
import { seededBearing } from "./shared/rng";

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

function buildTriangleWaypoints(
  start: RouteCoordinate,
  radiusM: number,
  seed: number,
): RouteCoordinate[] {
  // Bearing offset is derived from the seed so two candidates with
  // different seeds explore different orientations of the triangle.
  const offset = seededBearing(seed);
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

  // The state we mutate across passes is the *selection radius*, not the
  // POI list. A new attempt re-derives a per-pass seed so a missed first
  // selection tries a different trio rather than re-picking the same one.
  interface PoiState {
    radiusM: number;
    chosen: ReturnType<typeof selectDiverseWaypoints>;
    attempts: number;
  }

  let lastChosen: PoiState["chosen"] = [];
  try {
    const result = await convergeWithCorrection<PoiState>({
      initial: {
        radiusM: (targetM / Math.PI) * 0.5,
        chosen: [],
        attempts: 0,
      },
      routeOnce: async (state) => {
        const chosen = selectDiverseWaypoints(
          start,
          pois,
          state.radiusM,
          3,
          seed + state.attempts * 1009,
          poiBoost,
        );
        if (chosen.length === 0) {
          throw new EmptySelectionError();
        }
        state.chosen = chosen;
        lastChosen = chosen;
        return routeViaBrouter({
          waypoints: [start, ...chosen.map((p) => p.point), start],
          discipline,
          signal,
        });
      },
      refine: (state, ratio) => ({
        radiusM: Math.max(50, state.radiusM * dampedRatioCorrection(ratio)),
        chosen: state.chosen,
        attempts: state.attempts + 1,
      }),
      targetM,
    });
    if (result.finalState.chosen.length === 0) return null;
    return {
      ...result.trace,
      attempts: result.attempts,
      withinTolerance: result.withinTolerance,
      strategy: "poi-aware",
      pois: result.finalState.chosen.map((p) => ({ type: p.type, point: p.point, name: p.name })),
    };
  } catch (err) {
    if (err instanceof EmptySelectionError) {
      // No diverse POI trio could be selected — caller falls back.
      return lastChosen.length === 0 ? null : null;
    }
    throw err;
  }
}

/** Internal sentinel: thrown by {@link iteratePoiLoop} when the diverse
 *  selector returns nothing. Caught locally to convert into a `null`
 *  return that signals "fall back to triangulation". */
class EmptySelectionError extends Error {}

/**
 * Original blind-triangulation loop. Used as a fallback when no POI is
 * available. Identical to the pre-refactor behaviour modulo the new return
 * fields (`pois`, `strategy`).
 */
async function iterateTriangulation(
  args: LoopAttemptArgs & { initialRadiusM: number },
): Promise<LoopGenerationResult> {
  const { start, targetM, discipline, seed, signal } = args;
  const result = await convergeWithCorrection<{ radiusM: number }>({
    initial: { radiusM: args.initialRadiusM },
    routeOnce: ({ radiusM }) =>
      routeViaBrouter({
        waypoints: [start, ...buildTriangleWaypoints(start, radiusM, seed), start],
        discipline,
        signal,
      }),
    refine: ({ radiusM }, ratio) => ({
      radiusM: Math.max(50, radiusM * dampedRatioCorrection(ratio)),
    }),
    targetM,
  });
  return {
    ...result.trace,
    attempts: result.attempts,
    withinTolerance: result.withinTolerance,
    strategy: "triangulation",
    pois: [],
  };
}
