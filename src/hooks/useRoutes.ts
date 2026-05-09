/**
 * Hook accessor for the user's saved routes. Wraps {@link routeStorage}
 * with React state so component trees re-render when routes are saved or
 * deleted from anywhere in the app.
 *
 * The underlying storage is now IndexedDB and therefore async — the hook
 * still exposes a synchronous `routes` snapshot (rehydrated on mount and
 * after every mutation) plus async `saveRoute` / `deleteRoute` mutators
 * that resolve to `boolean` (success/failure) once the write has landed.
 *
 * Cross-tab sync goes through a `BroadcastChannel` rather than the legacy
 * `storage` event because IndexedDB doesn't emit one. We fall back to a
 * no-op channel when the browser is too old to support it.
 */

import { useCallback, useEffect, useState } from "react";
import type { Route } from "@/types/route";
import {
  deleteRoute as deleteRouteStorage,
  getAllRoutes,
  saveRoute as saveRouteStorage,
} from "@/lib/routeStorage";

const ROUTE_BROADCAST_CHANNEL = "zoned-routes";

function notifyOtherTabs(): void {
  if (typeof BroadcastChannel === "undefined") return;
  try {
    const channel = new BroadcastChannel(ROUTE_BROADCAST_CHANNEL);
    channel.postMessage({ type: "routes:changed" });
    channel.close();
  } catch {
    // BroadcastChannel might not be available — best-effort sync only.
  }
}

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);

  const reload = useCallback(async () => {
    const next = await getAllRoutes();
    setRoutes(next);
  }, []);

  useEffect(() => {
    void reload();
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(ROUTE_BROADCAST_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.type === "routes:changed") void reload();
    };
    return () => channel.close();
  }, [reload]);

  const saveRoute = useCallback(
    async (route: Route): Promise<boolean> => {
      const ok = await saveRouteStorage(route);
      if (ok) {
        await reload();
        notifyOtherTabs();
      }
      return ok;
    },
    [reload],
  );

  const deleteRoute = useCallback(
    async (id: string): Promise<boolean> => {
      const ok = await deleteRouteStorage(id);
      if (ok) {
        await reload();
        notifyOtherTabs();
      }
      return ok;
    },
    [reload],
  );

  return { routes, saveRoute, deleteRoute, reload };
}
