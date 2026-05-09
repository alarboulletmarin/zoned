/**
 * Nominatim geocoding wrapper.
 *
 * Public usage policy: max 1 request per second, descriptive User-Agent
 * recommended. We debounce at the call site rather than throttling here
 * so the UI stays simple. Results are cached in `sessionStorage` to keep
 * traffic minimal across re-renders.
 */

import type { RouteCoordinate } from "@/types/route";
import { NOMINATIM_BASE_URL, NOMINATIM_MIN_INTERVAL_MS } from "./constants";

const SESSION_CACHE_PREFIX = "zoned-geocode:";

export interface GeocodeResult {
  /** Display name returned by Nominatim (street, city, country). */
  label: string;
  /** Coordinate in `[lon, lat]` order, ready for routing. */
  point: RouteCoordinate;
  /** Optional structured address fields. */
  city?: string;
  country?: string;
}

interface NominatimResponseItem {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
}

/** Maximum length kept from `display_name` (Nominatim labels can run long). */
const MAX_LABEL_LENGTH = 200;

/**
 * Normalize the cache key so `"Paris"`, `" paris "` and `"PARIS"` all hit
 * the same entry. Diacritics are stripped (NFKD) so accented vs unaccented
 * spellings of the same query don't fragment the cache.
 */
function normalizeCacheKey(query: string): string {
  // Strip combining diacritical marks (U+0300–U+036F) so "café" and "cafe"
  // share the same cache entry.
  return query.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Strip control characters and angle brackets from third-party text before
 *  it lands in the UI / localStorage. React escapes by default but we do not
 *  want `<script>` ever ending up in `route.name` or in a `title`. */
function sanitizeLabel(s: string | undefined): string {
  if (typeof s !== "string") return "";
  return s
    .replace(/[\u0000-\u001f<>]/g, "")
    .slice(0, MAX_LABEL_LENGTH)
    .trim();
}

function parseLatLon(item: NominatimResponseItem): RouteCoordinate | null {
  const lon = Number.parseFloat(item.lon);
  const lat = Number.parseFloat(item.lat);
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return null;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  return [lon, lat];
}

let lastRequestAt = 0;

async function respectRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, NOMINATIM_MIN_INTERVAL_MS - elapsed));
  }
  lastRequestAt = Date.now();
}

function readCache(query: string): GeocodeResult[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_PREFIX + normalizeCacheKey(query));
    return raw ? (JSON.parse(raw) as GeocodeResult[]) : null;
  } catch {
    return null;
  }
}

function writeCache(query: string, results: GeocodeResult[]): void {
  try {
    sessionStorage.setItem(
      SESSION_CACHE_PREFIX + normalizeCacheKey(query),
      JSON.stringify(results),
    );
  } catch {
    // sessionStorage might be full or disabled — silently ignore
  }
}

/**
 * Search addresses matching the user's query. Results are limited to 5 by
 * default and cached for the session.
 */
export async function searchAddress(args: {
  query: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<GeocodeResult[]> {
  const { query, limit = 5, signal } = args;
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const cached = readCache(trimmed);
  if (cached) return cached;

  await respectRateLimit();

  const url = new URL(`${NOMINATIM_BASE_URL}/search`);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { signal, headers: { "Accept-Language": "fr,en" } });
  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }

  const raw = (await response.json()) as unknown;
  if (!Array.isArray(raw)) {
    throw new Error("Nominatim returned a non-array response");
  }
  const results: GeocodeResult[] = [];
  for (const item of raw as NominatimResponseItem[]) {
    if (!item || typeof item.lat !== "string" || typeof item.lon !== "string") continue;
    const point = parseLatLon(item);
    if (!point) continue;
    const label = sanitizeLabel(item.display_name);
    if (!label) continue;
    results.push({
      label,
      point,
      city: sanitizeLabel(item.address?.city ?? item.address?.town ?? item.address?.village) || undefined,
      country: sanitizeLabel(item.address?.country) || undefined,
    });
  }

  writeCache(trimmed, results);
  return results;
}
