/**
 * Overpass API wrapper — fetches running-friendly POIs (parks, promenades,
 * greenways, trails, beaches) around a given centre to seed the routing
 * algorithms with real-world waypoints instead of blind triangulation.
 *
 * Read-only queries; no auth required. The public endpoint is rate-limited
 * (~10 000 requests/day, no hard QPS) so callers should keep payloads small
 * (`out center N`) and rely on the in-memory cache below.
 */

import type { RouteCoordinate } from "@/types/route";
import type { PoiCandidate, PoiType } from "./poiTypes";
import { OVERPASS_BASE_URL, OVERPASS_TIMEOUT_S } from "../constants";
import { haversineDistanceM } from "../elevation";

/**
 * Overpass tag fragments per POI type. Keep them as Overpass-QL substrings
 * (no `(around:...)` clause yet — that's appended at query time so the same
 * fragments can be reused across calls without string-template gymnastics).
 */
const POI_QUERIES: Record<PoiType, string> = {
  promenade: 'way[highway~"^(footway|cycleway|path|pedestrian)$"][name~"promenade",i]',
  beach: 'way[natural=beach]',
  park: 'way[leisure=park]',
  greenway: 'way[route=bicycle][name~"voie verte",i]',
  trail: 'way[route=hiking]',
  // Athletics tracks only — soccer/cricket stadiums are filtered out via the
  // sport regex so Allianz Riviera doesn't get suggested for a running loop.
  track: 'way[leisure=track][sport~"running|athletics"]',
};

/**
 * Empirical running-friendliness weight per type. Tuned for urban Europe:
 * promenades and beaches dominate seafronts, parks fill suburban grids,
 * trails cover rural areas. Tracks are useful as targets but not as the
 * dominant waypoint of a loop — most runners don't want to circle one.
 */
const POI_WEIGHTS: Record<PoiType, number> = {
  promenade: 1.0,
  beach: 0.95,
  park: 0.9,
  greenway: 0.85,
  trail: 0.7,
  track: 0.6,
};

/** Inputs that uniquely identify a fetch — used as the cache key. */
interface FetchKey {
  lat: number;
  lon: number;
  radiusM: number;
  types: PoiType[];
}

/** In-memory cache. Cleared on a hard reload — that's fine for this use case. */
const cache = new Map<string, PoiCandidate[]>();

function cacheKey(k: FetchKey): string {
  // Round coordinates to 4 decimals (~11 m) and radius to the nearest 100 m
  // so successive calls from the same general area hit the cache.
  const lat = Math.round(k.lat * 10_000) / 10_000;
  const lon = Math.round(k.lon * 10_000) / 10_000;
  const r = Math.round(k.radiusM / 100) * 100;
  return `${lat}|${lon}|${r}|${[...k.types].sort().join(",")}`;
}

interface OverpassElement {
  id: number;
  type: "way" | "node" | "relation";
  center?: { lat: number; lon: number };
  lat?: number;
  lon?: number;
  tags?: {
    name?: string;
    leisure?: string;
    highway?: string;
    natural?: string;
    route?: string;
    sport?: string;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Map a tagged element to its canonical POI type. Returns `null` for
 * elements that didn't match any expected pattern (defensive — Overpass
 * occasionally yields broader results than the query asks for).
 */
function inferType(tags: NonNullable<OverpassElement["tags"]>): PoiType | null {
  const name = tags.name ?? "";
  const sport = tags.sport ?? "";
  if (tags.natural === "beach") return "beach";
  if (tags.leisure === "park") return "park";
  if (tags.leisure === "track" && /running|athletics/.test(sport)) return "track";
  if (tags.route === "hiking") return "trail";
  if (tags.route === "bicycle" && /voie verte/i.test(name)) return "greenway";
  if (tags.highway && /promenade/i.test(name)) return "promenade";
  return null;
}

/**
 * Build the Overpass-QL query string for a centre + radius + type set.
 */
function buildQuery(
  lat: number,
  lon: number,
  radiusM: number,
  types: PoiType[],
): string {
  const sub = types
    .map((t) => `${POI_QUERIES[t]}(around:${Math.round(radiusM)},${lat},${lon});`)
    .join("\n  ");
  return `[out:json][timeout:${OVERPASS_TIMEOUT_S}];(\n  ${sub}\n);out center 80;`;
}

export interface FetchPoiArgs {
  center: RouteCoordinate;
  radiusM: number;
  /** Subset of POI types to query. Defaults to all known types. */
  types?: PoiType[];
  signal?: AbortSignal;
}

/**
 * Fetch POI candidates around `center`. Results are cached per (center,
 * radius, types) tuple so re-running a generation with the same parameters
 * doesn't re-hit Overpass.
 *
 * Errors from Overpass (network, 429, malformed JSON) are surfaced as
 * thrown errors — the caller is expected to gracefully fall back to the
 * blind triangulation path.
 */
export async function fetchPoiCandidates(
  args: FetchPoiArgs,
): Promise<PoiCandidate[]> {
  const types = args.types ?? (Object.keys(POI_QUERIES) as PoiType[]);
  const [lon, lat] = args.center;

  const key = cacheKey({ lat, lon, radiusM: args.radiusM, types });
  const cached = cache.get(key);
  if (cached) return cached;

  const ql = buildQuery(lat, lon, args.radiusM, types);

  const response = await fetch(OVERPASS_BASE_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(ql)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: args.signal,
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const data = (await response.json()) as OverpassResponse;
  const candidates = parseOverpassElements(data.elements);
  cache.set(key, candidates);
  return candidates;
}

/**
 * Parse a list of Overpass elements into typed POI candidates. Exported
 * so unit tests can validate the parser without making network calls.
 */
export function parseOverpassElements(
  elements: OverpassElement[],
): PoiCandidate[] {
  const out: PoiCandidate[] = [];
  for (const el of elements) {
    const lat = el.center?.lat ?? el.lat;
    const lon = el.center?.lon ?? el.lon;
    if (lat == null || lon == null) continue;

    const tags = el.tags ?? {};
    const type = inferType(tags);
    if (!type) continue;

    out.push({
      id: el.id,
      type,
      point: [lon, lat],
      name: tags.name,
      weight: POI_WEIGHTS[type],
    });
  }
  return out;
}

/** Test/debug helper — clear the in-memory cache. */
export function __clearPoiCacheForTests(): void {
  cache.clear();
}

/**
 * Athletics track found near a starting point. Distance is straight-line
 * (haversine) — the routed distance is computed downstream by the caller
 * when the user picks a track to commit a route to.
 */
export interface NearbyTrack {
  id: number;
  name?: string;
  point: RouteCoordinate;
  haversineDistanceM: number;
}

/**
 * Discover athletics tracks within `radiusM` of `center`. Distinct from
 * {@link fetchPoiCandidates} in that it always returns the `track` type
 * specifically and exposes the haversine distance pre-computed so the UI
 * can sort results without re-deriving the geometry.
 *
 * Used by the dedicated "find a track" flow: the user lands on the page
 * with no preset, picks one of the listed tracks, and only then the app
 * reaches Brouter to route a there-and-back leg.
 */
export async function findNearbyTracks(args: {
  center: RouteCoordinate;
  radiusM?: number;
  signal?: AbortSignal;
}): Promise<NearbyTrack[]> {
  const radiusM = args.radiusM ?? 15_000;
  const candidates = await fetchPoiCandidates({
    center: args.center,
    radiusM,
    types: ["track"],
    signal: args.signal,
  });

  return candidates
    .map((c) => ({
      id: c.id,
      name: c.name,
      point: c.point,
      haversineDistanceM: haversineDistanceM(args.center, c.point),
    }))
    .sort((a, b) => a.haversineDistanceM - b.haversineDistanceM);
}
