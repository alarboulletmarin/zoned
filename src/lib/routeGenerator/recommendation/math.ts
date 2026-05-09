/**
 * Geometry and small numeric helpers shared by the recommendation
 * scoring pipeline. Kept in their own module so the main scoring file
 * doesn't drown in trig boilerplate, and so the pure functions can be
 * unit-tested in isolation.
 */

import type { RouteCoordinate } from "@/types/route";

/** Initial bearing from `from` to `to`, in degrees [0, 360). */
export function bearing(from: RouteCoordinate, to: RouteCoordinate): number {
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLambda = toRad(lon2 - lon1);

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Smallest unsigned angle between two bearings, in degrees [0, 180]. */
export function angularDistance(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Pick the item that minimises `selector` across the list. Returns null
 *  for an empty list. */
export function pickExtreme<T>(items: T[], selector: (item: T) => number): T | null {
  if (items.length === 0) return null;
  return items.reduce((best, current) => (selector(current) < selector(best) ? current : best));
}

/** Round to nearest 0.5 with a floor of 1. Used for "nice" distance
 *  defaults (e.g. 1, 1.5, 2, ..., 21.5). */
export function roundHalf(value: number): number {
  return Math.max(1, Math.round(value * 2) / 2);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Approximate sharp-turn density (turns per km), used as a proxy for
 *  trail twistiness when scoring routes. A turn counts as "sharp" when
 *  the heading change between consecutive segments exceeds 45°. */
export function computeTurnDensityPerKm(points: RouteCoordinate[], distanceKm: number): number {
  if (points.length < 3 || distanceKm <= 0) return 0;
  let sharpTurns = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const first = bearing(points[i - 1], points[i]);
    const second = bearing(points[i], points[i + 1]);
    const delta = angularDistance(first, second);
    if (delta >= 45) sharpTurns += 1;
  }
  return sharpTurns / distanceKm;
}
