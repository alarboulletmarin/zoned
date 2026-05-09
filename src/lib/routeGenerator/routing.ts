/**
 * Brouter HTTP wrapper — converts a list of waypoints into a routed trace,
 * with elevation already included in the GeoJSON coordinates.
 */

import type { Discipline } from "@/types";
import type { RouteCoordinate } from "@/types/route";
import {
  BROUTER_BASE_URL,
  BROUTER_MAX_RETRIES,
  BROUTER_PROFILE_BY_DISCIPLINE,
  BROUTER_RETRY_BASE_MS,
  BROUTER_TIMEOUT_MS,
} from "./constants";

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

/** Soft cap on cached Brouter answers — beyond this we evict the oldest
 *  entry on each new write. 100 cached traces is enough for a session of
 *  drag-edits + multiple regenerates without runaway memory growth. */
const BROUTER_CACHE_LIMIT = 100;
const brouterCache = new Map<string, BrouterTraceResult>();
const brouterInFlight = new Map<string, Promise<BrouterTraceResult>>();

/**
 * Build a cache key that's stable across the convergence loop's tiny
 * waypoint perturbations. Rounding to 5 decimals (~1.1 m) collapses the
 * micro-jitter introduced by the damping factor (`0.7 × correction`) so
 * pass 2 and pass 3 of a converging route hit the cache rather than
 * issuing a fresh Brouter call. Profile is included because the same
 * waypoints route differently for running vs cycling.
 */
function brouterCacheKey(waypoints: RouteCoordinate[], profile: string): string {
  const rounded = waypoints
    .map(([lon, lat]) => `${lon.toFixed(5)},${lat.toFixed(5)}`)
    .join("|");
  return `${profile}|${rounded}`;
}

function setBrouterCache(key: string, value: BrouterTraceResult): void {
  if (brouterCache.has(key)) brouterCache.delete(key);
  brouterCache.set(key, value);
  if (brouterCache.size > BROUTER_CACHE_LIMIT) {
    const firstKey = brouterCache.keys().next().value;
    if (firstKey !== undefined) brouterCache.delete(firstKey);
  }
}

/** Test/debug helper. */
export function __clearBrouterCacheForTests(): void {
  brouterCache.clear();
  brouterInFlight.clear();
}

/**
 * Fetch with a timeout AbortController + automatic retry on transient
 * failures (5xx / 429 / network). Honors an externally provided abort
 * signal so the caller can still cancel the whole pipeline. Retries are
 * spaced with exponential backoff (`base × 2^attempt`); 4xx responses
 * other than 429 are treated as terminal and surfaced immediately.
 */
async function fetchWithRetry(url: string, externalSignal?: AbortSignal): Promise<Response> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= BROUTER_MAX_RETRIES; attempt += 1) {
    if (externalSignal?.aborted) throw new DOMException("aborted", "AbortError");
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), BROUTER_TIMEOUT_MS);
    const onExternalAbort = () => timeout.abort();
    externalSignal?.addEventListener("abort", onExternalAbort, { once: true });
    try {
      const response = await fetch(url, { signal: timeout.signal });
      if (response.ok) return response;
      // 4xx (except 429) is the user/request — never retry. 5xx/429 might
      // be a hiccup on Brouter's side — retry with backoff.
      if (response.status !== 429 && response.status < 500) {
        throw new BrouterError(response.status, `Brouter request failed: ${response.statusText}`);
      }
      lastError = new BrouterError(response.status, `Brouter ${response.status}: ${response.statusText}`);
    } catch (err) {
      // The external signal aborted: surface immediately. The internal
      // timeout abort gets retried like any other transient error.
      if (externalSignal?.aborted) throw err;
      if (err instanceof BrouterError && err.status !== 429 && err.status < 500) throw err;
      lastError = err;
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    }
    if (attempt < BROUTER_MAX_RETRIES) {
      const delay = BROUTER_RETRY_BASE_MS * 2 ** attempt;
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, delay);
        externalSignal?.addEventListener("abort", () => {
          clearTimeout(t);
          reject(new DOMException("aborted", "AbortError"));
        }, { once: true });
      });
    }
  }
  throw lastError ?? new BrouterError(0, "Brouter request failed after retries");
}

/**
 * Defensive parsing of a single Brouter feature. Brouter publishes string
 * properties (`"track-length": "1234"`); we coerce to numbers and bail on
 * NaN/Infinity rather than letting them propagate into ratio computations
 * downstream (where a NaN distance becomes a NaN correction ratio, etc.).
 */
function parsePositiveFloat(value: string | undefined, label: string): number {
  if (value == null) {
    throw new BrouterError(0, `Brouter response missing ${label}`);
  }
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new BrouterError(0, `Brouter returned invalid ${label}: ${value}`);
  }
  return n;
}

function isValidCoord(c: unknown): c is number[] {
  if (!Array.isArray(c) || c.length < 2) return false;
  const [lon, lat, alt] = c as unknown[];
  if (typeof lon !== "number" || !Number.isFinite(lon) || lon < -180 || lon > 180) return false;
  if (typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90) return false;
  if (alt != null && (typeof alt !== "number" || !Number.isFinite(alt))) return false;
  return true;
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

  const cacheKey = brouterCacheKey(waypoints, profile);
  const cached = brouterCache.get(cacheKey);
  if (cached) {
    // Refresh LRU position so a frequently re-routed candidate stays warm.
    setBrouterCache(cacheKey, cached);
    return cached;
  }
  // Coalesce concurrent identical requests — the parallel candidate
  // generation might issue the same exact route twice in a single tick.
  const inFlight = brouterInFlight.get(cacheKey);
  if (inFlight) return inFlight;

  const promise = (async (): Promise<BrouterTraceResult> => {
    const url = new URL(BROUTER_BASE_URL);
    url.searchParams.set("lonlats", formatLonLats(waypoints));
    url.searchParams.set("profile", profile);
    url.searchParams.set("alternativeidx", "0");
    url.searchParams.set("format", "geojson");

    const response = await fetchWithRetry(url.toString(), signal);

    const data = (await response.json()) as BrouterGeoJSON;
    const feature = data?.features?.[0];
    if (!feature || !Array.isArray(feature.geometry?.coordinates) || feature.geometry.coordinates.length === 0) {
      throw new BrouterError(0, "Brouter returned an empty trace");
    }

    const points: RouteCoordinate[] = [];
    for (const c of feature.geometry.coordinates) {
      if (!isValidCoord(c)) {
        throw new BrouterError(0, "Brouter returned an invalid coordinate");
      }
      const [lon, lat, alt] = c;
      points.push(alt != null ? [lon, lat, alt] : [lon, lat]);
    }

    const distanceM = parsePositiveFloat(feature.properties["track-length"], "track-length");
    if (distanceM <= 0) {
      throw new BrouterError(0, "Brouter returned a zero-length trace");
    }

    const result: BrouterTraceResult = {
      points,
      distanceM,
      // ascend / total-time may legitimately be 0 on flat or very short routes.
      elevationGainM: parsePositiveFloat(feature.properties["filtered ascend"] ?? "0", "filtered ascend"),
      estimatedDurationSec: parsePositiveFloat(feature.properties["total-time"] ?? "0", "total-time"),
    };
    setBrouterCache(cacheKey, result);
    return result;
  })();

  brouterInFlight.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    brouterInFlight.delete(cacheKey);
  }
}
