/**
 * Elevation utilities — sample the elevation profile from Brouter's
 * embedded altitudes and compute geometric measures (haversine distance).
 */

import type { RouteCoordinate, RouteElevationPoint } from "@/types/route";

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two `[lon, lat]` points in meters.
 */
export function haversineDistanceM(a: RouteCoordinate, b: RouteCoordinate): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Total trace length in meters by summing haversine segments. Used as a
 * sanity check against Brouter's `track-length` when needed.
 */
export function computeTraceLengthM(points: RouteCoordinate[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineDistanceM(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Build an elevation profile keyed by cumulative distance. Skips points
 * without altitude data (Brouter sometimes omits the third value).
 */
export function buildElevationProfile(points: RouteCoordinate[]): RouteElevationPoint[] {
  const profile: RouteElevationPoint[] = [];
  let cumulative = 0;

  for (let i = 0; i < points.length; i += 1) {
    if (i > 0) cumulative += haversineDistanceM(points[i - 1], points[i]);
    const alt = points[i][2];
    if (alt == null) continue;
    profile.push({ distanceM: cumulative, altitudeM: alt });
  }

  return profile;
}

/**
 * Cumulative elevation gain (positive ascent only). Independent confirmation
 * for Brouter's `filtered ascend`, useful when re-stitching trace segments.
 */
export function computeElevationGainM(profile: RouteElevationPoint[]): number {
  let gain = 0;
  for (let i = 1; i < profile.length; i += 1) {
    const delta = profile[i].altitudeM - profile[i - 1].altitudeM;
    if (delta > 0) gain += delta;
  }
  return Math.round(gain);
}

/**
 * Project a starting `[lon, lat]` point to a destination at `distanceM` along
 * the given bearing (degrees, 0 = North, clockwise). Used by the loop and
 * out-and-back algorithms to place candidate waypoints around the start.
 */
export function destinationPoint(
  start: RouteCoordinate,
  distanceM: number,
  bearingDeg: number,
): RouteCoordinate {
  const [lon1, lat1] = start;
  const angularDistance = distanceM / EARTH_RADIUS_M;
  const bearing = toRad(bearingDeg);
  const lat1Rad = toRad(lat1);
  const lon1Rad = toRad(lon1);

  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(angularDistance) +
      Math.cos(lat1Rad) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lon2Rad =
    lon1Rad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1Rad),
      Math.cos(angularDistance) - Math.sin(lat1Rad) * Math.sin(lat2Rad),
    );

  const lat2 = (lat2Rad * 180) / Math.PI;
  const lon2 = (((lon2Rad * 180) / Math.PI + 540) % 360) - 180; // normalize to [-180, 180]
  return [lon2, lat2];
}
