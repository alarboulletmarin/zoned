/**
 * Route Generator types — generated parcours stored locally.
 *
 * A {@link Route} represents a single generated path the user can save,
 * export to GPX, or attach to a planned session. Coordinates are kept in
 * GeoJSON-style `[lon, lat]` order to stay aligned with the routing API
 * (Brouter) and Leaflet's GeoJSON layer.
 */

import type { Discipline } from "@/types";

/** GeoJSON-style coordinate: `[longitude, latitude, optional altitude in meters]`. */
export type RouteCoordinate = [number, number, number?];

/** Surface preference used as input to the routing engine. */
export type RouteSurface = "road" | "trail" | "mixed";

/** Topology of a generated route. */
export type RouteShape = "loop" | "out_and_back" | "point_to_point";

/**
 * Single point on the elevation profile. Distance is the cumulative distance
 * from the start of the route, in meters.
 */
export interface RouteElevationPoint {
  distanceM: number;
  altitudeM: number;
}

/**
 * Inputs that drove a generation. Stored on the route so the user can see
 * how the parcours was built and easily regenerate a variant.
 */
export interface RouteConstraints {
  shape: RouteShape;
  discipline: Discipline;
  targetDistanceKm: number;
  surface: RouteSurface;
  /** Direction (degrees, 0 = North) for out_and_back; absent for loops. */
  bearingDeg?: number;
  /** Optional elevation gain target (meters). */
  elevationMinM?: number;
  elevationMaxM?: number;
  /** Random seed used by the generator. Reused to regenerate identical routes. */
  seed: number;
}

/**
 * A generated route saved by the user. Stored as-is in localStorage —
 * any future migration must keep this schema backward compatible.
 */
export interface Route {
  id: string;
  /** User-given name (defaults to a generated label). */
  name: string;
  discipline: Discipline;
  shape: RouteShape;
  /** Ordered list of GeoJSON points that compose the trace. */
  points: RouteCoordinate[];
  /** Elevation profile sampled along the route. */
  elevation: RouteElevationPoint[];
  /** Total length, meters (Brouter `track-length`). */
  distanceM: number;
  /** Cumulative elevation gain, meters. */
  elevationGainM: number;
  /** Estimated traversal time, seconds (Brouter `total-time`). */
  estimatedDurationSec: number;
  constraints: RouteConstraints;
  /** ISO timestamp of generation. */
  generatedAt: string;
  /** Optional ISO timestamp of last user edit (rename, tags). */
  updatedAt?: string;
  /** Optional plan session this route is attached to (UC6, v2). */
  planSessionRef?: {
    planId: string;
    weekNumber: number;
    sessionIndex: number;
  };
  /** Optional free-form tags. */
  tags?: string[];
}
