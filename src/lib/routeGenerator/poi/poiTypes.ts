/**
 * POI taxonomy used by the route generator. Each type maps to:
 *   1. an Overpass tag query (in `overpass.ts`)
 *   2. an empirical "running-friendliness" weight (0-1, in `overpass.ts`)
 *   3. a label rendered next to map markers (in the UI layer)
 *
 * Keep this list small on purpose: every additional type adds a sub-query
 * to every Overpass call, increasing latency and the chance of a 429.
 */
export type PoiType =
  | "promenade"
  | "park"
  | "greenway"
  | "trail"
  | "beach"
  | "track";

import type { RouteCoordinate } from "@/types/route";

export interface PoiCandidate {
  /** OSM element id, used as a stable cache key. */
  id: number;
  type: PoiType;
  /** Centroid (`out center` from Overpass) — directly usable as a Brouter waypoint. */
  point: RouteCoordinate;
  /** Display name, when OSM tagged one. */
  name?: string;
  /** Empirical 0-1 score; higher = more attractive to runners. */
  weight: number;
}

/**
 * A POI that was selected as a routing waypoint and ended up on the trace.
 * Persisted on the {@link Route} so we can render named markers on the map.
 */
export interface RoutePoi {
  type: PoiType;
  point: RouteCoordinate;
  name?: string;
}
