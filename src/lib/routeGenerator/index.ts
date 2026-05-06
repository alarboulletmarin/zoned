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
export async function generateRoute(args: {
  start: RouteCoordinate;
  targetDistanceKm: number;
  discipline: Discipline;
  shape: Extract<RouteShape, "loop" | "out_and_back">;
  surface: RouteSurface;
  seed: number;
  bearingDeg?: number;
  signal?: AbortSignal;
  name?: string;
}): Promise<Route> {
  const { start, targetDistanceKm, discipline, shape, surface, seed, bearingDeg, signal, name } = args;

  const trace =
    shape === "loop"
      ? await generateLoop({ start, targetDistanceKm, discipline, seed, signal })
      : await generateOutAndBack({
          start,
          targetDistanceKm,
          discipline,
          seed,
          bearingDeg,
          signal,
        });

  const elevation = buildElevationProfile(trace.points);
  const elevationGainM =
    trace.elevationGainM > 0 ? trace.elevationGainM : computeElevationGainM(elevation);

  const constraints: RouteConstraints = {
    shape,
    discipline,
    targetDistanceKm,
    surface,
    seed,
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
 * Generate {@link count} route candidates by varying the seed (loops) or
 * the bearing (out-and-backs). Each candidate is checked against a generous
 * distance window — generations that miss the target by more than 20% are
 * dropped and replaced with a fresh attempt (within a budget) so the UI
 * never proposes a 12 km route when the user asked for 8 km.
 *
 * Candidates are sorted by ascending distance error so index 0 is the best
 * match — the UI defaults to selecting it.
 */
export async function generateRouteCandidates(args: {
  start: RouteCoordinate;
  targetDistanceKm: number;
  discipline: Discipline;
  shape: Extract<RouteShape, "loop" | "out_and_back">;
  surface: RouteSurface;
  seed: number;
  bearingDeg?: number;
  count?: number;
  signal?: AbortSignal;
}): Promise<Route[]> {
  const { count = 3, shape, bearingDeg, seed, targetDistanceKm } = args;
  const targetM = targetDistanceKm * 1000;
  const maxAttempts = count * MAX_CANDIDATE_ATTEMPTS_FACTOR;

  /** Build override seed/bearing for the i-th attempt. */
  const overrideFor = (i: number) => {
    if (shape === "out_and_back") {
      const baseBearing = bearingDeg ?? 0;
      // Spread around the requested bearing for the first `count` attempts,
      // then jitter further out for retries so we don't repeatedly pick the
      // same neighbourhoods.
      const spread = bearingDeg != null ? 60 : 360 / count;
      const offset = bearingDeg != null
        ? (i - Math.floor(count / 2)) * spread
        : i * spread;
      const bearing = ((baseBearing + offset) % 360 + 360) % 360;
      return { seed: seed + i * 7, bearingDeg: bearing };
    }
    return { seed: seed + i * 7919 };
  };

  // Sequential rather than fully parallel: respects the public Brouter
  // capacity and gives a predictable progression for the UI.
  const accepted: Array<{ route: Route; deviation: number }> = [];
  for (let i = 0; i < maxAttempts && accepted.length < count; i += 1) {
    const ov = overrideFor(i);
    const candidate = await generateRoute({
      ...args,
      seed: ov.seed,
      bearingDeg: ov.bearingDeg,
      name: undefined,
    });
    const deviation = Math.abs(candidate.distanceM / targetM - 1);
    if (deviation <= CANDIDATE_DISTANCE_SLACK) {
      accepted.push({ route: candidate, deviation });
    }
  }

  // Sort best first so the UI's default selection is the closest match. If
  // every attempt was off the target, return what we have anyway — the UI
  // surfaces the deviation through the segmented control labels.
  accepted.sort((a, b) => a.deviation - b.deviation);
  return accepted.map((entry) => entry.route);
}
