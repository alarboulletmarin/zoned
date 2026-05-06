/**
 * Brouter HTTP wrapper — converts a list of waypoints into a routed trace,
 * with elevation already included in the GeoJSON coordinates.
 */

import type { Discipline } from "@/types";
import type { RouteCoordinate } from "@/types/route";
import { BROUTER_BASE_URL, BROUTER_PROFILE_BY_DISCIPLINE } from "./constants";

export interface BrouterTraceResult {
  /** Points along the routed path, `[lon, lat, alt]`. */
  points: RouteCoordinate[];
  /** Total length in meters, from Brouter `track-length`. */
  distanceM: number;
  /** Cumulative elevation gain in meters, from Brouter `filtered ascend`. */
  elevationGainM: number;
  /** Estimated traversal time in seconds, from Brouter `total-time`. */
  estimatedDurationSec: number;
}

export class BrouterError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "BrouterError";
  }
}

interface BrouterFeatureProperties {
  "track-length"?: string;
  "filtered ascend"?: string;
  "total-time"?: string;
}

interface BrouterGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: BrouterFeatureProperties;
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
  }>;
}

function formatLonLats(waypoints: RouteCoordinate[]): string {
  return waypoints.map(([lon, lat]) => `${lon},${lat}`).join("|");
}

/**
 * Routes the given ordered waypoints through Brouter and returns the
 * trace, distance, ascent and estimated duration.
 *
 * @throws {BrouterError} on non-2xx responses or empty feature collections.
 */
export async function routeViaBrouter(args: {
  waypoints: RouteCoordinate[];
  discipline: Discipline;
  signal?: AbortSignal;
}): Promise<BrouterTraceResult> {
  const { waypoints, discipline, signal } = args;

  if (waypoints.length < 2) {
    throw new BrouterError(0, "routing requires at least two waypoints");
  }

  const profile = BROUTER_PROFILE_BY_DISCIPLINE[discipline];
  if (!profile) {
    throw new BrouterError(
      0,
      `discipline ${discipline} has no Brouter profile (swimming uses water, not roads)`,
    );
  }

  const url = new URL(BROUTER_BASE_URL);
  url.searchParams.set("lonlats", formatLonLats(waypoints));
  url.searchParams.set("profile", profile);
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new BrouterError(response.status, `Brouter request failed: ${response.statusText}`);
  }

  const data = (await response.json()) as BrouterGeoJSON;
  const feature = data.features?.[0];
  if (!feature || feature.geometry.coordinates.length === 0) {
    throw new BrouterError(0, "Brouter returned an empty trace");
  }

  const points: RouteCoordinate[] = feature.geometry.coordinates.map((c) => {
    const [lon, lat, alt] = c;
    return alt != null ? [lon, lat, alt] : [lon, lat];
  });

  return {
    points,
    distanceM: parseInt(feature.properties["track-length"] ?? "0", 10),
    elevationGainM: parseInt(feature.properties["filtered ascend"] ?? "0", 10),
    estimatedDurationSec: parseInt(feature.properties["total-time"] ?? "0", 10),
  };
}
