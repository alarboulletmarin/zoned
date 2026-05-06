/**
 * Static configuration for the Route Generator: third-party endpoints,
 * routing profiles, generation tolerances, and rate-limit guards.
 *
 * All constants live here so providers can be swapped without touching the
 * algorithms or UI layer.
 */

import type { Discipline } from "@/types";
import type { RouteShape } from "@/types/route";

// ── Routing engine (Brouter) ──────────────────────────────────────

export const BROUTER_BASE_URL = "https://brouter.de/brouter";

/**
 * Brouter profile per Zoned discipline.
 * - running uses `trekking` because Brouter does not ship a dedicated
 *   running profile; trekking matches its routing preferences (paths,
 *   sidewalks, parks).
 * - cycling uses `fastbike` for road-oriented rides.
 * - swimming has no surface routing — generation is disabled at the
 *   algorithm layer rather than here.
 */
export const BROUTER_PROFILE_BY_DISCIPLINE: Record<Discipline, string | null> = {
  running: "trekking",
  cycling: "fastbike",
  swimming: null,
};

// ── Geocoding (Nominatim) ─────────────────────────────────────────

export const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
/** Nominatim public usage policy: maximum 1 request per second. */
export const NOMINATIM_MIN_INTERVAL_MS = 1000;

// ── POI lookup (Overpass) ─────────────────────────────────────────

export const OVERPASS_BASE_URL = "https://overpass-api.de/api/interpreter";
/** Embedded in the Overpass-QL `timeout:` directive — server-side cap. */
export const OVERPASS_TIMEOUT_S = 25;
/** When fetching POI for a loop, look this much wider than the loop radius
 *  so candidates exist past the ideal half-radius distance. */
export const POI_SEARCH_RADIUS_FACTOR = 1.5;
/** Minimum number of distinct POI required to switch from triangulation to
 *  the POI-aware algorithm. Below this we fall back. */
export const POI_AWARE_MIN_COUNT = 3;

// ── Generation tolerances ─────────────────────────────────────────

/** Acceptable deviation from the target distance, ratio of target. */
export const DISTANCE_TOLERANCE = 0.05;

/** Maximum number of waypoint adjustment passes before accepting the result. */
export const MAX_ADJUSTMENT_ATTEMPTS = 4;

/** Closing distance threshold for a loop, meters (start ≈ end). */
export const LOOP_CLOSING_THRESHOLD_M = 50;

// ── Storage limits ────────────────────────────────────────────────

/** Soft cap on routes saved to localStorage (warn the user beyond this). */
export const ROUTE_STORAGE_SOFT_LIMIT = 100;

// ── Defaults per shape ────────────────────────────────────────────

export const DEFAULT_SURFACE_BY_SHAPE: Record<RouteShape, "road" | "trail" | "mixed"> = {
  loop: "mixed",
  out_and_back: "mixed",
  point_to_point: "mixed",
};
