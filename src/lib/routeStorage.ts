/**
 * Local persistence layer for generated routes.
 * - Routes live entirely in `localStorage` under a single key.
 * - Schema is the {@link Route} interface; any future migration must keep
 *   it backward compatible or run a migration step at load time.
 */

import type { Route } from "@/types/route";
import { ROUTE_STORAGE_SOFT_LIMIT } from "./routeGenerator/constants";

export const ROUTE_STORAGE_KEY = "zoned-routes";

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

export function getAllRoutes(): Route[] {
  try {
    const stored = localStorage.getItem(ROUTE_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRoute).filter((route): route is Route => route !== null);
  } catch (err) {
    console.warn("routeStorage: failed to load routes", err);
    return [];
  }
}

export function getRoute(id: string): Route | null {
  return getAllRoutes().find((route) => route.id === id) ?? null;
}

export function saveRoute(route: Route): boolean {
  try {
    const routes = getAllRoutes();
    const idx = routes.findIndex((r) => r.id === route.id);
    if (idx >= 0) {
      routes[idx] = { ...route, updatedAt: new Date().toISOString() };
    } else {
      routes.unshift(route);
    }
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routes));
    return true;
  } catch (err) {
    console.warn("routeStorage: failed to persist route (storage quota or serialization)", err);
    return false;
  }
}

export function deleteRoute(id: string): boolean {
  try {
    const routes = getAllRoutes().filter((r) => r.id !== id);
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routes));
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
export function hasReachedRouteSoftLimit(): boolean {
  return getAllRoutes().length >= ROUTE_STORAGE_SOFT_LIMIT;
}
