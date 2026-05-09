/**
 * Public façade for the Route Generator. Algorithms, routing, elevation and
 * constants are re-exported here so callers only need a single import.
 */

import type { Discipline } from "@/types";
import type {
  Route,
  RouteCoordinate,
  RouteConstraints,
  RouteShape,
  RouteSurface,
} from "@/types/route";
import { generateLoop } from "./algorithms/loop";
import { generateOutAndBack } from "./algorithms/outAndBack";
import { buildElevationProfile, computeElevationGainM } from "./elevation";
import { estimateDurationSec } from "./durationEstimate";
import type { PoiBoost } from "./poi/poiSelector";
import { routeViaBrouter as routeViaBrouterImpl } from "./routing";
import { outAndBackReachedTurn } from "./sanity";

export type { PoiBoost } from "./poi/poiSelector";

export { generateLoop } from "./algorithms/loop";
export { generateOutAndBack } from "./algorithms/outAndBack";
export {
  buildElevationProfile,
  computeElevationGainM,
  computeTraceLengthM,
  destinationPoint,
  haversineDistanceM,
} from "./elevation";
export { routeViaBrouter, BrouterError } from "./routing";
export type { BrouterTraceResult } from "./routing";
export type { LoopGenerationResult } from "./algorithms/loop";
export type { OutAndBackGenerationResult } from "./algorithms/outAndBack";
export {
  BROUTER_BASE_URL,
  BROUTER_PROFILE_BY_DISCIPLINE,
  DISTANCE_TOLERANCE,
  MAX_ADJUSTMENT_ATTEMPTS,
  LOOP_CLOSING_THRESHOLD_M,
  ROUTE_STORAGE_SOFT_LIMIT,
} from "./constants";

/**
 * High-level helper that wraps the underlying algorithm result into a
 * persistable {@link Route}. Useful from the UI where we want a single
 * call site that hides the shape-specific details.
 */
export class UnreachableTurnError extends Error {
  constructor() {
    super("out-and-back turn point not reached (likely water or off-network)");
    this.name = "UnreachableTurnError";
  }
}

export async function generateRoute(args: {
  start: RouteCoordinate;
  targetDistanceKm: number;
  discipline: Discipline;
  shape: Extract<RouteShape, "loop" | "out_and_back">;
  surface: RouteSurface;
  elevationGainTargetM?: number;
  seed: number;
  bearingDeg?: number;
  signal?: AbortSignal;
  name?: string;
  poiBoost?: PoiBoost;
}): Promise<Route> {
  const { start, targetDistanceKm, discipline, shape, surface, elevationGainTargetM, seed, bearingDeg, signal, name, poiBoost } = args;

  const trace =
    shape === "loop"
      ? await generateLoop({ start, targetDistanceKm, discipline, seed, signal, poiBoost })
      : await generateOutAndBack({
          start,
          targetDistanceKm,
          discipline,
          seed,
          bearingDeg,
          signal,
          poiBoost,
        });

  if (shape === "out_and_back" && "projectedTurn" in trace) {
    if (!outAndBackReachedTurn(trace.points, trace.projectedTurn)) {
      throw new UnreachableTurnError();
    }
  }

  const elevation = buildElevationProfile(trace.points);
  const elevationGainM =
    trace.elevationGainM > 0 ? trace.elevationGainM : computeElevationGainM(elevation);

  const constraints: RouteConstraints = {
    shape,
    discipline,
    targetDistanceKm,
    surface,
    seed,
    ...(deriveElevationBounds(elevationGainTargetM)),
    ...(shape === "out_and_back" && "bearingDeg" in trace
      ? { bearingDeg: (trace as { bearingDeg: number }).bearingDeg }
      : {}),
  };

  // Brouter's `total-time` is computed for its routing profile, not for a
  // runner's actual pace, so we override it with a Zoned-side estimate that
  // factors discipline and elevation.
  const estimatedDurationSecValue = estimateDurationSec({
    distanceM: trace.distanceM,
    elevationGainM,
    discipline,
  });

  return {
    id: crypto.randomUUID(),
    name: name ?? defaultRouteName(shape, targetDistanceKm),
    discipline,
    shape,
    points: trace.points,
    elevation,
    distanceM: trace.distanceM,
    elevationGainM,
    estimatedDurationSec: estimatedDurationSecValue,
    constraints,
    generatedAt: new Date().toISOString(),
    pois: trace.pois.length > 0 ? trace.pois : undefined,
  };
}

function defaultRouteName(shape: RouteShape, distanceKm: number): string {
  const km = Math.round(distanceKm * 10) / 10;
  if (shape === "loop") return `Boucle ${km} km`;
  if (shape === "out_and_back") return `Aller-retour ${km} km`;
  return `Parcours ${km} km`;
}

/** Maximum ratio deviation from the target distance accepted as a candidate. */
const CANDIDATE_DISTANCE_SLACK = 0.2;
/** Maximum total attempts to find {@link count} valid candidates. */
const MAX_CANDIDATE_ATTEMPTS_FACTOR = 2;
/**
 * When a target ascent is provided we widen the candidate pool so the
 * scoring step has enough material to actually pick a route close to the
 * D+ goal — without it the slot would be filled by the first three
 * generations regardless of elevation.
 */
const ASCENT_AWARE_OVERSAMPLE = 2;

/**
 * Generate route candidates by varying the seed (loops) or the bearing
 * (out-and-backs). Each candidate is checked against a generous distance
 * window — generations that miss the target by more than 20% are dropped
 * and replaced with a fresh attempt (within a budget) so the UI never
 * proposes a 12 km route when the user asked for 8 km.
 *
 * When `elevationGainTargetM` is provided we oversample the pool and rank
 * by a combined distance + ascent error before slicing the top {@link count}
 * — distance stays the dominant criterion but ascent now actually filters.
 */
export async function generateRouteCandidates(args: {
  start: RouteCoordinate;
  targetDistanceKm: number;
  discipline: Discipline;
  shape: Extract<RouteShape, "loop" | "out_and_back">;
  surface: RouteSurface;
  elevationGainTargetM?: number;
  seed: number;
  bearingDeg?: number;
  count?: number;
  signal?: AbortSignal;
  /**
   * Per-session POI bias (e.g. boost athletics tracks for VO2max workouts).
   * Pass through to {@link generateRoute} so the underlying algorithms can
   * weight track waypoints higher than generic parks during selection.
   */
  poiBoost?: PoiBoost;
}): Promise<Route[]> {
  const { count = 3, shape, bearingDeg, seed, targetDistanceKm, elevationGainTargetM } = args;
  const targetM = targetDistanceKm * 1000;
  const oversample = elevationGainTargetM != null ? ASCENT_AWARE_OVERSAMPLE : 1;
  const generationTarget = count * oversample;
  const maxAttempts = generationTarget * MAX_CANDIDATE_ATTEMPTS_FACTOR;

  const overrideFor = (i: number) => {
    if (shape === "out_and_back") {
      const baseBearing = bearingDeg ?? 0;
      const spread = bearingDeg != null ? 45 : 360 / generationTarget;
      const offset = bearingDeg != null
        ? (i - Math.floor(generationTarget / 2)) * spread
        : i * spread;
      const bearing = ((baseBearing + offset) % 360 + 360) % 360;
      return { seed: seed + i * 7, bearingDeg: bearing };
    }
    return { seed: seed + i * 7919 };
  };

  // Wave-based parallel generation. We launch `generationTarget` candidates
  // at once so the user-perceived latency drops from N×(routing latency) to
  // ~max(routing latency). If the first wave doesn't produce enough valid
  // candidates (rejected by distance slack, killed by UnreachableTurnError),
  // we launch a follow-up wave with the next seeds — up to `maxAttempts`
  // total. The wave size is capped at `generationTarget` so we never run
  // more than the public Brouter can handle in flight (≈3-6 concurrent).
  const accepted: Array<{ route: Route; deviation: number; score: number }> = [];
  const rejected: Array<{ route: Route; deviation: number; score: number }> = [];
  let lastError: unknown = null;
  let attemptsLaunched = 0;
  while (accepted.length < generationTarget && attemptsLaunched < maxAttempts) {
    const batchSize = Math.min(
      generationTarget - accepted.length,
      maxAttempts - attemptsLaunched,
    );
    const batch = Array.from({ length: batchSize }, (_, j) => {
      const ov = overrideFor(attemptsLaunched + j);
      return generateRoute({
        ...args,
        seed: ov.seed,
        bearingDeg: ov.bearingDeg,
        name: undefined,
      });
    });
    attemptsLaunched += batchSize;
    const results = await Promise.allSettled(batch);
    for (const result of results) {
      if (result.status === "fulfilled") {
        const candidate = result.value;
        const deviation = Math.abs(candidate.distanceM / targetM - 1);
        const score = candidateError(candidate, targetM, elevationGainTargetM);
        const entry = { route: candidate, deviation, score };
        if (deviation <= CANDIDATE_DISTANCE_SLACK) accepted.push(entry);
        else rejected.push(entry);
      } else {
        // UnreachableTurnError and BrouterError are silenced so a single bad
        // bearing (e.g. into the sea) doesn't kill the whole generation.
        lastError = result.reason;
      }
    }
  }

  if (accepted.length === 0 && rejected.length === 0 && lastError) {
    throw lastError;
  }

  // Rank by combined error so D+ actually influences which routes survive.
  // Ties on score fall back to the raw distance deviation.
  const cmp = (
    a: { score: number; deviation: number },
    b: { score: number; deviation: number },
  ) => a.score - b.score || a.deviation - b.deviation;
  accepted.sort(cmp);
  rejected.sort(cmp);

  return [...accepted, ...rejected]
    .slice(0, count)
    .map((entry) => entry.route);
}

/**
 * Combined cost used to rank candidates. Lower is better. The distance
 * mismatch dominates by design — a beautiful 12 km loop is useless when the
 * user asked for 8 km — but ascent error adds a soft secondary penalty so
 * a target D+ stops being purely cosmetic.
 */
function candidateError(
  route: Route,
  targetM: number,
  ascentTargetM: number | undefined,
): number {
  const distanceErr = Math.abs(route.distanceM - targetM) / targetM;
  if (ascentTargetM == null) return distanceErr;
  const denom = Math.max(ascentTargetM, 80);
  const ascentErr = Math.abs(route.elevationGainM - ascentTargetM) / denom;
  return distanceErr + ascentErr * 0.5;
}

function deriveElevationBounds(elevationGainTargetM?: number): Pick<RouteConstraints, "elevationMinM" | "elevationMaxM"> {
  if (elevationGainTargetM == null) return {};
  const tolerance = Math.max(60, Math.round(elevationGainTargetM * 0.3));
  return {
    elevationMinM: Math.max(0, elevationGainTargetM - tolerance),
    elevationMaxM: elevationGainTargetM + tolerance,
  };
}

/**
 * Re-route an arbitrary list of waypoints through Brouter and produce a
 * fresh {@link Route}. Used by the in-app editor: when the user drags or
 * inserts a waypoint, the new waypoint list is sent here and the resulting
 * trace replaces the candidate on screen — no triangulation, no convergence
 * loop, just whatever Brouter routes between the points.
 *
 * For loops, the caller is expected to pass the start as both the first and
 * last waypoint.
 */
export async function routeFromWaypoints(args: {
  waypoints: RouteCoordinate[];
  discipline: Discipline;
  shape: RouteShape;
  surface?: RouteSurface;
  /** Existing route id, when re-editing in place. A new id is minted otherwise. */
  routeId?: string;
  seed?: number;
  name?: string;
  signal?: AbortSignal;
}): Promise<Route> {
  const { waypoints, discipline, shape, surface = "mixed", routeId, seed, name, signal } = args;
  if (waypoints.length < 2) {
    throw new Error("routeFromWaypoints requires at least two waypoints");
  }

  const trace = await routeViaBrouterImpl({ waypoints, discipline, signal });
  const elevation = buildElevationProfile(trace.points);
  const elevationGainM =
    trace.elevationGainM > 0 ? trace.elevationGainM : computeElevationGainM(elevation);
  const distanceKm = trace.distanceM / 1000;

  return {
    id: routeId ?? crypto.randomUUID(),
    name: name ?? defaultRouteName(shape, distanceKm),
    discipline,
    shape,
    points: trace.points,
    elevation,
    distanceM: trace.distanceM,
    elevationGainM,
    estimatedDurationSec: estimateDurationSec({
      distanceM: trace.distanceM,
      elevationGainM,
      discipline,
    }),
    constraints: {
      shape,
      discipline,
      targetDistanceKm: Math.round(distanceKm * 10) / 10,
      surface,
      seed: seed ?? 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
