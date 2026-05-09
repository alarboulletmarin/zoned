/**
 * Local persistence layer for generated routes.
 *
 * Storage backend: IndexedDB (via {@link idb-keyval}). Compared to
 * localStorage this gives us:
 *   - 50-500 MB quota instead of 5-10 MB,
 *   - per-key writes instead of `JSON.stringify` of the full array on
 *     every save (an O(N) cost that bites once a user accumulates
 *     dozens of long routes),
 *   - async access that never blocks the main thread.
 *
 * Layout:
 *   - `zoned-routes:index` — ordered array of route IDs (most recent first).
 *   - `zoned-route:<id>` — the full {@link Route} payload.
 *
 * Migration: at first read we look for the legacy localStorage payload
 * (`zoned-routes`) and copy it into IndexedDB before clearing it.
 */

import {
  del as idbDel,
  get as idbGet,
  getMany as idbGetMany,
  set as idbSet,
  setMany as idbSetMany,
} from "idb-keyval";
import type { Route } from "@/types/route";
import { ROUTE_STORAGE_SOFT_LIMIT } from "./routeGenerator/constants";

/** Legacy localStorage key — kept for one-shot migration only. */
export const ROUTE_STORAGE_KEY = "zoned-routes";
const INDEX_KEY = "zoned-routes:index";
const ROUTE_PREFIX = "zoned-route:";
const MIGRATION_FLAG_KEY = "zoned-routes:migrated";

/** True when IndexedDB is available. Under Node/Bun unit tests we no-op
 *  every persistence call so route storage doesn't crash with a
 *  ReferenceError. The hooks layer simply observes an empty list. */
const HAS_IDB = typeof indexedDB !== "undefined";

function routeKey(id: string): string {
  return ROUTE_PREFIX + id;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRoute(raw: unknown): Route | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== "string" || raw.id.trim().length === 0) return null;
  if (!Array.isArray(raw.points) || raw.points.length === 0) return null;
  if (raw.discipline !== "running" && raw.discipline !== "cycling") return null;
  if (raw.shape !== "loop" && raw.shape !== "out_and_back" && raw.shape !== "point_to_point") return null;

  return raw as unknown as Route;
}

/**
 * One-shot migration of the legacy `localStorage["zoned-routes"]` array
 * into the per-key IndexedDB layout. Idempotent: gated by a flag so a
 * user reopening the app doesn't repeat the work, and silently no-ops
 * when nothing legacy is present.
 */
async function migrateFromLocalStorageIfNeeded(): Promise<void> {
  if (!HAS_IDB) return;
  try {
    const flag = await idbGet<boolean>(MIGRATION_FLAG_KEY);
    if (flag) return;
    if (typeof localStorage === "undefined") {
      await idbSet(MIGRATION_FLAG_KEY, true);
      return;
    }
    const legacy = localStorage.getItem(ROUTE_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown;
      if (Array.isArray(parsed)) {
        const valid = parsed.map(normalizeRoute).filter((r): r is Route => r !== null);
        if (valid.length > 0) {
          await idbSetMany(valid.map((r) => [routeKey(r.id), r] as [string, Route]));
          await idbSet(INDEX_KEY, valid.map((r) => r.id));
        }
      }
      // Tear down the legacy entry so subsequent runs don't double-handle it.
      localStorage.removeItem(ROUTE_STORAGE_KEY);
    }
    await idbSet(MIGRATION_FLAG_KEY, true);
  } catch (err) {
    console.warn("routeStorage: migration from localStorage failed", err);
  }
}

let migrationPromise: Promise<void> | null = null;
function ensureMigrated(): Promise<void> {
  if (!migrationPromise) migrationPromise = migrateFromLocalStorageIfNeeded();
  return migrationPromise;
}

async function readIndex(): Promise<string[]> {
  if (!HAS_IDB) return [];
  const ids = await idbGet<string[]>(INDEX_KEY);
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
}

async function writeIndex(ids: string[]): Promise<void> {
  if (!HAS_IDB) return;
  await idbSet(INDEX_KEY, ids);
}

export async function getAllRoutes(): Promise<Route[]> {
  try {
    await ensureMigrated();
    const ids = await readIndex();
    if (ids.length === 0) return [];
    const values = await idbGetMany<Route>(ids.map(routeKey));
    const out: Route[] = [];
    for (const raw of values) {
      const route = normalizeRoute(raw);
      if (route) out.push(route);
    }
    return out;
  } catch (err) {
    console.warn("routeStorage: failed to load routes", err);
    return [];
  }
}

export async function getRoute(id: string): Promise<Route | null> {
  if (!HAS_IDB) return null;
  try {
    await ensureMigrated();
    const raw = await idbGet<Route>(routeKey(id));
    return normalizeRoute(raw);
  } catch (err) {
    console.warn("routeStorage: failed to load route", err);
    return null;
  }
}

export async function saveRoute(route: Route): Promise<boolean> {
  if (!HAS_IDB) return false;
  try {
    await ensureMigrated();
    const stamped: Route = { ...route, updatedAt: new Date().toISOString() };
    await idbSet(routeKey(route.id), stamped);
    const ids = await readIndex();
    // Most recent first; if the route was already known we move it to the
    // front so the listing stays in last-edited order.
    const next = [route.id, ...ids.filter((id) => id !== route.id)];
    await writeIndex(next);
    return true;
  } catch (err) {
    console.warn("routeStorage: failed to persist route", err);
    return false;
  }
}

export async function deleteRoute(id: string): Promise<boolean> {
  if (!HAS_IDB) return false;
  try {
    await ensureMigrated();
    await idbDel(routeKey(id));
    const ids = await readIndex();
    await writeIndex(ids.filter((existing) => existing !== id));
    return true;
  } catch (err) {
    console.warn("routeStorage: failed to delete route", err);
    return false;
  }
}

/**
 * Returns true when the user has reached the soft cap, used by the UI to
 * surface a warning before adding more routes.
 */
export async function hasReachedRouteSoftLimit(): Promise<boolean> {
  await ensureMigrated();
  const ids = await readIndex();
  return ids.length >= ROUTE_STORAGE_SOFT_LIMIT;
}

/** Test/debug helper — reset the in-process migration latch. */
export function __resetMigrationLatchForTests(): void {
  migrationPromise = null;
}
