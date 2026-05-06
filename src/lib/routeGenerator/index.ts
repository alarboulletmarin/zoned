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

  return {
    id: crypto.randomUUID(),
    name: name ?? defaultRouteName(shape, targetDistanceKm),
    discipline,
    shape,
    points: trace.points,
    elevation,
    distanceM: trace.distanceM,
    elevationGainM,
    estimatedDurationSec: trace.estimatedDurationSec,
    constraints,
    generatedAt: new Date().toISOString(),
  };
}

function defaultRouteName(shape: RouteShape, distanceKm: number): string {
  const km = Math.round(distanceKm * 10) / 10;
  if (shape === "loop") return `Boucle ${km} km`;
  if (shape === "out_and_back") return `Aller-retour ${km} km`;
  return `Parcours ${km} km`;
}
