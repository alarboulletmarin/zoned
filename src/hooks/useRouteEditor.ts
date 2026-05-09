/**
 * Edit-mode state machine for the route generator page.
 *
 * Encapsulates everything that happens between the user clicking
 * "Modifier le tracé" and either applying the changes or bailing out:
 *   - editWaypoints: the live list the user is dragging.
 *   - lastValidWaypoints: the last list that Brouter accepted, so we
 *     can revert when a drag lands the waypoint in the sea.
 *   - editPreview: the routed Route returned by Brouter for the
 *     current waypoints — what the map actually shows during editing.
 *   - isReRouting: gates the loading hint on the map.
 *
 * The re-route call is debounced (300 ms) and cancellable via
 * AbortController so a quick drag-release-drag-release sequence
 * collapses into a single Brouter call and the user never waits on a
 * stale answer for a layout they've already abandoned.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BrouterError, routeFromWaypoints } from "@/lib/routeGenerator";
import type { Route, RouteCoordinate } from "@/types/route";

const REROUTE_DEBOUNCE_MS = 300;

/**
 * Build a sparse list of editable handles from a routed trace. We keep
 * the start, the end, and ~1 mid-handle per km — clamped between 2 and
 * 8 — so a 3 km loop stays grabbable and a 60 km cycling route doesn't
 * get cluttered with a hundred markers.
 */
export function deriveInitialWaypoints(
  route: Route,
  displayPoints: RouteCoordinate[],
): RouteCoordinate[] {
  const pts = displayPoints.length > 0 ? displayPoints : route.points;
  if (pts.length < 3) return pts;

  const totalM = route.distanceM;
  if (totalM <= 0) return [pts[0], pts[pts.length - 1]];

  const midCount = Math.max(2, Math.min(8, Math.round(totalM / 1_000)));
  const stepCount = midCount + 1;

  const waypoints: RouteCoordinate[] = [pts[0]];
  for (let s = 1; s < stepCount; s += 1) {
    const fraction = s / stepCount;
    const idx = Math.max(1, Math.min(pts.length - 2, Math.round(fraction * (pts.length - 1))));
    waypoints.push(pts[idx]);
  }
  waypoints.push(pts[pts.length - 1]);
  return waypoints;
}

export interface UseRouteEditorArgs {
  /** Currently selected route, or null if none. */
  route: Route | null;
  /**
   * Lazy getter for the points currently rendered on the map (could
   * be reversed). Lazy because the hook gates editing on this list,
   * but the list itself is typically derived *from* the hook's own
   * state (`editPreview`) — passing it directly would create a
   * read-before-declaration cycle in the caller.
   */
  getDisplayPoints: () => RouteCoordinate[];
  /**
   * Called when the user applies the edit. The hook only knows the new
   * Route — the parent decides where to commit it (which candidate
   * slot, whether to clear reversal, etc.).
   */
  onApply: (next: Route) => void;
}

export interface UseRouteEditorResult {
  editWaypoints: RouteCoordinate[] | null;
  editPreview: Route | null;
  isReRouting: boolean;
  isEditing: boolean;
  onEnterEdit: () => void;
  onExitEdit: () => void;
  onApplyEdit: () => void;
  onWaypointMove: (index: number, point: RouteCoordinate) => void;
  onWaypointInsert: (insertIndex: number, point: RouteCoordinate) => void;
  onWaypointRemove: (index: number) => void;
}

export function useRouteEditor({
  route,
  getDisplayPoints,
  onApply,
}: UseRouteEditorArgs): UseRouteEditorResult {
  const { t } = useTranslation("routes");

  const [editWaypoints, setEditWaypoints] = useState<RouteCoordinate[] | null>(null);
  const [lastValidWaypoints, setLastValidWaypoints] = useState<RouteCoordinate[] | null>(null);
  const [editPreview, setEditPreview] = useState<Route | null>(null);
  const [isReRouting, setIsReRouting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel pending debounce + in-flight request on unmount so a stale
  // promise doesn't try to setState on a gone component.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const reRoute = useCallback(
    (waypoints: RouteCoordinate[]) => {
      if (!route) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsReRouting(true);
      timerRef.current = setTimeout(async () => {
        try {
          const next = await routeFromWaypoints({
            waypoints,
            discipline: route.discipline,
            shape: route.shape,
            surface: route.constraints.surface,
            routeId: route.id,
            name: route.name,
            signal: controller.signal,
          });
          if (controller.signal.aborted) return;
          setEditPreview(next);
          setLastValidWaypoints(waypoints);
        } catch (err) {
          if (controller.signal.aborted) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          console.warn("useRouteEditor: re-route failed", err);
          // Brouter answers 400 when one of the waypoints isn't on its
          // routing graph (sea, building, private road). Revert to the
          // last accepted layout so the user sees their drag bounce
          // back, and tell them why.
          const isUnreachable = err instanceof BrouterError && (err.status === 400 || err.status === 0);
          if (isUnreachable && lastValidWaypoints) {
            setEditWaypoints(lastValidWaypoints);
            toast.error(t("errors.unreachableWaypoint"));
          } else {
            toast.error(t("errors.routingFailed"));
          }
        } finally {
          if (!controller.signal.aborted) setIsReRouting(false);
        }
      }, REROUTE_DEBOUNCE_MS);
    },
    [route, t, lastValidWaypoints],
  );

  const onEnterEdit = useCallback(() => {
    if (!route) return;
    const waypoints = deriveInitialWaypoints(route, getDisplayPoints());
    setEditWaypoints(waypoints);
    setLastValidWaypoints(waypoints);
    setEditPreview(null);
  }, [route, getDisplayPoints]);

  const onExitEdit = useCallback(() => {
    setEditWaypoints(null);
    setLastValidWaypoints(null);
    setEditPreview(null);
  }, []);

  const onApplyEdit = useCallback(() => {
    if (!editPreview) {
      onExitEdit();
      return;
    }
    onApply(editPreview);
    setEditWaypoints(null);
    setLastValidWaypoints(null);
    setEditPreview(null);
    toast.success(t("edit.applied"));
  }, [editPreview, onExitEdit, onApply, t]);

  const onWaypointMove = useCallback(
    (index: number, point: RouteCoordinate) => {
      if (!editWaypoints) return;
      const isLoop = route?.shape === "loop";
      const lastIdx = editWaypoints.length - 1;
      const next = editWaypoints.map((wp, i) => {
        if (i === index) return point;
        // Closed loops keep first and last in lockstep so the routing
        // request still closes — otherwise dragging the start would
        // leave the end stranded at the original location.
        if (isLoop && (index === 0 || index === lastIdx)) {
          if (i === 0 || i === lastIdx) return point;
        }
        return wp;
      });
      setEditWaypoints(next);
      reRoute(next);
    },
    [editWaypoints, reRoute, route],
  );

  const onWaypointInsert = useCallback(
    (insertIndex: number, point: RouteCoordinate) => {
      if (!editWaypoints) return;
      const next = [
        ...editWaypoints.slice(0, insertIndex),
        point,
        ...editWaypoints.slice(insertIndex),
      ];
      setEditWaypoints(next);
      reRoute(next);
    },
    [editWaypoints, reRoute],
  );

  const onWaypointRemove = useCallback(
    (index: number) => {
      if (!editWaypoints) return;
      if (editWaypoints.length <= 2) return;
      const next = editWaypoints.filter((_, i) => i !== index);
      setEditWaypoints(next);
      reRoute(next);
    },
    [editWaypoints, reRoute],
  );

  return {
    editWaypoints,
    editPreview,
    isReRouting,
    isEditing: editWaypoints !== null,
    onEnterEdit,
    onExitEdit,
    onApplyEdit,
    onWaypointMove,
    onWaypointInsert,
    onWaypointRemove,
  };
}
