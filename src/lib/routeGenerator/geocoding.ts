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
    const raw = sessionStorage.getItem(SESSION_CACHE_PREFIX + query);
    return raw ? (JSON.parse(raw) as GeocodeResult[]) : null;
  } catch {
    return null;
  }
}

function writeCache(query: string, results: GeocodeResult[]): void {
  try {
    sessionStorage.setItem(SESSION_CACHE_PREFIX + query, JSON.stringify(results));
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

  const items = (await response.json()) as NominatimResponseItem[];
  const results: GeocodeResult[] = items.map((item) => ({
    label: item.display_name,
    point: [parseFloat(item.lon), parseFloat(item.lat)],
    city: item.address?.city ?? item.address?.town ?? item.address?.village,
    country: item.address?.country,
  }));

  writeCache(trimmed, results);
  return results;
}
