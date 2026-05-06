/**
 * Hook accessor for the user's saved routes. Wraps {@link routeStorage}
 * with React state so component trees re-render when routes are saved or
 * deleted from anywhere in the app.
 */

import { useCallback, useEffect, useState } from "react";
import type { Route } from "@/types/route";
import {
  ROUTE_STORAGE_KEY,
  deleteRoute as deleteRouteStorage,
  getAllRoutes,
  saveRoute as saveRouteStorage,
} from "@/lib/routeStorage";

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);

  const reload = useCallback(() => {
    setRoutes(getAllRoutes());
  }, []);

  useEffect(() => {
    reload();
    const onStorage = (event: StorageEvent) => {
      if (event.key === ROUTE_STORAGE_KEY) reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const saveRoute = useCallback(
    (route: Route): boolean => {
      const ok = saveRouteStorage(route);
      if (ok) reload();
      return ok;
    },
    [reload],
  );

  const deleteRoute = useCallback(
    (id: string): boolean => {
      const ok = deleteRouteStorage(id);
      if (ok) reload();
      return ok;
    },
    [reload],
  );

  return { routes, saveRoute, deleteRoute, reload };
}
