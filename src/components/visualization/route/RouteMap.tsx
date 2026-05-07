import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { RouteCoordinate, RoutePoiSummary } from "@/types/route";
import { cn } from "@/lib/utils";

interface RouteMapProps {
  /** Ordered points of the routed trace. Empty when no route has been generated yet. */
  points?: RouteCoordinate[];
  /**
   * Alternative candidates rendered behind the selected trace in a muted
   * tone, so the user can compare proposals at a glance. Each entry carries
   * the original index in the parent's candidates array so a click on a
   * muted trace can promote it as the new selection without a re-fetch.
   */
  candidates?: { index: number; points: RouteCoordinate[]; label?: string }[];
  /**
   * Fired when the user clicks a muted candidate trace on the map. Lets
   * the parent flip selection without forcing the user to scroll back to
   * the segmented control inside the drawer/sidebar.
   */
  onCandidateSelect?: (index: number) => void;
  /**
   * POI traversed by the trace, rendered as small named markers so the user
   * can recognise familiar places on the map.
   */
  pois?: RoutePoiSummary[];
  /** Optional start point shown as a marker even when no trace exists yet. */
  start?: RouteCoordinate | null;
  className?: string;
  /** Trace stroke colour. Defaults to Zoned primary. */
  color?: string;
  /** Disable user interaction (drag, zoom) — useful for previews. */
  interactive?: boolean;
  /**
   * When provided, clicking the map calls this with `[lon, lat]`. Useful to
   * let the user define a start point without typing or using GPS.
   */
  onMapClick?: (point: RouteCoordinate) => void;
  /** Render directional chevrons along the trace. Off for static previews. */
  showDirection?: boolean;
  /**
   * When set, the map enters edit mode: each entry becomes a draggable
   * marker and the trace polyline accepts insertion clicks. Endpoints are
   * not removable; intermediate waypoints are removed by clicking them.
   */
  editableWaypoints?: RouteCoordinate[];
  /**
   * Hide the dedicated "end" marker because the trace is a closed loop
   * (last waypoint == first). The visible "start" marker doubles as both.
   */
  editClosedLoop?: boolean;
  onWaypointMove?: (index: number, point: RouteCoordinate) => void;
  onWaypointRemove?: (index: number) => void;
  onWaypointInsert?: (insertIndex: number, point: RouteCoordinate) => void;
}

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

const DEFAULT_CENTER: [number, number] = [46.7, 2.4];
const DEFAULT_ZOOM = 5;
const START_ZOOM = 13;

const DIRECTION_SPACING_M = 600;

function chevronIcon(angleDeg: number, color: string): L.DivIcon {
  return L.divIcon({
    className: "route-map-chevron",
    html: `<svg width="22" height="22" viewBox="0 0 22 22" style="display:block;transform:rotate(${angleDeg}deg);transform-origin:center;filter:drop-shadow(0 0 1px rgba(0,0,0,0.6))"><path d="M11 4 L18 14 L11 11 L4 14 Z" fill="${color}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

type WaypointKind = "start" | "end" | "mid" | "loop";

function waypointIcon(kind: WaypointKind, color: string): L.DivIcon {
  const size = kind === "mid" ? 14 : 22;
  const half = size / 2;
  const filterShadow = "drop-shadow(0 1px 2px rgba(0,0,0,0.45))";

  if (kind === "mid") {
    const html = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;cursor:grab;filter:${filterShadow}"><circle cx="${half}" cy="${half}" r="${half - 2}" fill="#ffffff" stroke="${color}" stroke-width="2"/><circle cx="${half}" cy="${half}" r="${half - 4}" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="0.4"/></svg>`;
    return L.divIcon({
      className: "route-map-waypoint route-map-waypoint--mid",
      html,
      iconSize: [size, size],
      iconAnchor: [half, half],
    });
  }

  // start: green flag, end: red flag, loop: dual flag (start/end combined)
  const palette: Record<Exclude<WaypointKind, "mid">, { fill: string; label: string }> = {
    start: { fill: "#16a34a", label: "S" },
    end: { fill: "#dc2626", label: "F" },
    loop: { fill: "#16a34a", label: "•" },
  };
  const { fill, label } = palette[kind];
  const html = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;cursor:grab;filter:${filterShadow}"><circle cx="${half}" cy="${half}" r="${half - 2}" fill="${fill}" stroke="#ffffff" stroke-width="2.5"/><text x="${half}" y="${half + 4}" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="700" fill="#ffffff">${label}</text></svg>`;
  return L.divIcon({
    className: `route-map-waypoint route-map-waypoint--${kind}`,
    html,
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

/**
 * Decide where to splice a new waypoint into the user-facing waypoint list
 * given the click coordinates. Picks the segment whose nearest endpoint is
 * the closest to the click — good enough for short waypoint lists where a
 * full point-to-segment projection would be overkill.
 */
function pickInsertionIndex(
  click: RouteCoordinate,
  waypoints: RouteCoordinate[],
): number {
  if (waypoints.length < 2) return 1;
  let bestInsertAt = 1;
  let bestScore = Infinity;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const da = haversineMeters([a[1], a[0]], [click[1], click[0]]);
    const db = haversineMeters([b[1], b[0]], [click[1], click[0]]);
    const score = Math.min(da, db);
    if (score < bestScore) {
      bestScore = score;
      bestInsertAt = i + 1;
    }
  }
  return bestInsertAt;
}

function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6_371_000;
  const phi1 = (a[0] * Math.PI) / 180;
  const phi2 = (b[0] * Math.PI) / 180;
  const dPhi = ((b[0] - a[0]) * Math.PI) / 180;
  const dLambda = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function bearingDeg(a: [number, number], b: [number, number]): number {
  const phi1 = (a[0] * Math.PI) / 180;
  const phi2 = (b[0] * Math.PI) / 180;
  const dLambda = ((b[1] - a[1]) * Math.PI) / 180;
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Sample chevron positions every ~DIRECTION_SPACING_M along the trace so the
 * user can read the route's direction at a glance. Each chevron is oriented
 * along the local segment.
 */
function sampleChevrons(latLngs: [number, number][]): Array<{ pos: [number, number]; angle: number }> {
  if (latLngs.length < 2) return [];
  const chevrons: Array<{ pos: [number, number]; angle: number }> = [];
  let traveled = 0;
  let nextMark = DIRECTION_SPACING_M;
  for (let i = 1; i < latLngs.length; i += 1) {
    const a = latLngs[i - 1];
    const b = latLngs[i];
    const seg = haversineMeters(a, b);
    if (seg <= 0) continue;
    while (traveled + seg >= nextMark) {
      const t = (nextMark - traveled) / seg;
      const lat = a[0] + (b[0] - a[0]) * t;
      const lon = a[1] + (b[1] - a[1]) * t;
      chevrons.push({ pos: [lat, lon], angle: bearingDeg(a, b) });
      nextMark += DIRECTION_SPACING_M;
    }
    traveled += seg;
  }
  return chevrons;
}

export function RouteMap({
  points = [],
  candidates,
  onCandidateSelect,
  pois,
  start = null,
  className,
  color = "#ea580c",
  interactive = true,
  onMapClick,
  showDirection = false,
  editableWaypoints,
  editClosedLoop = false,
  onWaypointMove,
  onWaypointRemove,
  onWaypointInsert,
}: RouteMapProps) {
  const candidateSelectRef = useRef<typeof onCandidateSelect>(onCandidateSelect);
  useEffect(() => {
    candidateSelectRef.current = onCandidateSelect;
  }, [onCandidateSelect]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clickHandlerRef = useRef<typeof onMapClick>(onMapClick);
  const editCallbacksRef = useRef({
    onMove: onWaypointMove,
    onRemove: onWaypointRemove,
    onInsert: onWaypointInsert,
  });

  useEffect(() => {
    clickHandlerRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    editCallbacksRef.current = {
      onMove: onWaypointMove,
      onRemove: onWaypointRemove,
      onInsert: onWaypointInsert,
    };
  }, [onWaypointMove, onWaypointRemove, onWaypointInsert]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      keyboard: interactive,
      attributionControl: true,
      // Zoom animations interact badly with React-driven invalidateSize calls
      // (the tile-container can stay stuck mid-transform — visible bug:
      // blank/scaled tiles after generation). Disabling them removes the
      // race entirely; we lose the ~150ms zoom ease but everything stays
      // crisp.
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    const onClick = (e: L.LeafletMouseEvent) => {
      const handler = clickHandlerRef.current;
      if (!handler) return;
      handler([e.latlng.lng, e.latlng.lat]);
    };
    map.on("click", onClick);

    mapRef.current = map;

    return () => {
      map.off("click", onClick);
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Pin the map to the current container box before any geographic call
    // (fitBounds, setView). Without this, layout changes that React just
    // committed (e.g. expand/collapse toggle) wouldn't reach Leaflet until
    // the next ResizeObserver tick — fitBounds would zoom on a stale size
    // and the tile layer would render blank cells until a manual pan.
    map.invalidateSize({ animate: false, pan: false });

    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    if (points.length > 1) {
      const selectedLatLngs: [number, number][] = points.map(([lon, lat]) => [lat, lon]);

      const others = (candidates ?? []).filter((c) => c.points !== points && c.points.length > 1);
      const ALT_STYLES = [
        { color: "#0ea5e9", dashArray: "6 6" },
        { color: "#a855f7", dashArray: "2 6" },
        { color: "#10b981", dashArray: "8 4" },
      ];
      others.forEach((cand, displayIdx) => {
        const latLngs: [number, number][] = cand.points.map(([lon, lat]) => [lat, lon]);
        const style = ALT_STYLES[displayIdx % ALT_STYLES.length];
        // Visible dashed trace.
        const visible = L.polyline(latLngs, {
          color: style.color,
          weight: 3,
          opacity: 0.7,
          dashArray: style.dashArray,
          interactive: false,
        }).addTo(map);
        // Fat invisible hit target so taps on touch devices land easily on
        // a 3px dashed line. Same path, no styling, generous weight.
        const hit = L.polyline(latLngs, {
          color: style.color,
          weight: 18,
          opacity: 0,
          interactive: true,
          bubblingMouseEvents: false,
        }).addTo(map);
        hit.on("mouseover", () => {
          visible.setStyle({ opacity: 1, weight: 5 });
          if (mapRef.current) {
            mapRef.current.getContainer().style.cursor = "pointer";
          }
        });
        hit.on("mouseout", () => {
          visible.setStyle({ opacity: 0.7, weight: 3 });
          if (mapRef.current) {
            mapRef.current.getContainer().style.cursor = "";
          }
        });
        if (cand.label) {
          hit.bindTooltip(cand.label, { sticky: true, direction: "top", offset: [0, -4] });
        }
        hit.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          candidateSelectRef.current?.(cand.index);
        });
      });

      const trackLine = L.polyline(selectedLatLngs, {
        color,
        weight: editableWaypoints ? 5 : 4,
        opacity: 0.9,
      }).addTo(map);

      if (editableWaypoints) {
        // Insertion clicks travel through the polyline so we can put the new
        // waypoint at the right index — Leaflet routes the click to whichever
        // listener registered first, hence stopping propagation here so the
        // ambient `onMapClick` (used outside edit mode) doesn't fire too.
        trackLine.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          const click: RouteCoordinate = [e.latlng.lng, e.latlng.lat];
          const insertAt = pickInsertionIndex(click, editableWaypoints);
          editCallbacksRef.current.onInsert?.(insertAt, click);
        });
      }

      if (showDirection) {
        for (const { pos, angle } of sampleChevrons(selectedLatLngs)) {
          L.marker(pos, { icon: chevronIcon(angle, color), interactive: false }).addTo(map);
        }
      }

      if (!editableWaypoints) {
        L.circleMarker(selectedLatLngs[0], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          fillColor: color,
          fillOpacity: 1,
        }).addTo(map);
      }

      if (editableWaypoints) {
        const lastIdx = editableWaypoints.length - 1;
        editableWaypoints.forEach((wp, idx) => {
          const isStart = idx === 0;
          const isEnd = idx === lastIdx;
          // For closed loops the end marker would sit on top of the start
          // and confuse the user; we just hide it. Drags on the start
          // implicitly carry the end with them (handled in the page).
          if (editClosedLoop && isEnd) return;
          const kind: WaypointKind = isStart
            ? editClosedLoop
              ? "loop"
              : "start"
            : isEnd
              ? "end"
              : "mid";
          const marker = L.marker([wp[1], wp[0]], {
            draggable: true,
            icon: waypointIcon(kind, color),
            keyboard: false,
            zIndexOffset: kind === "mid" ? 1000 : 1100,
          }).addTo(map);

          let dragging = false;
          marker.on("dragstart", () => {
            dragging = true;
          });
          marker.on("dragend", (e) => {
            const ll = (e.target as L.Marker).getLatLng();
            editCallbacksRef.current.onMove?.(idx, [ll.lng, ll.lat]);
            setTimeout(() => {
              dragging = false;
            }, 50);
          });
          marker.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            if (dragging) return;
            if (isStart || isEnd) return;
            editCallbacksRef.current.onRemove?.(idx);
          });
        });
      }

      for (const poi of pois ?? []) {
        const [poiLon, poiLat] = poi.point;
        const marker = L.circleMarker([poiLat, poiLon], {
          radius: 5,
          color: "#ffffff",
          weight: 1.5,
          fillColor: "#475569",
          fillOpacity: 0.9,
        }).addTo(map);
        if (poi.name) {
          marker.bindTooltip(poi.name, {
            direction: "top",
            offset: [0, -6],
            opacity: 0.95,
            className: "route-map-poi-tooltip",
          });
        }
      }

      const allBounds = L.latLngBounds(selectedLatLngs);
      for (const cand of others) {
        for (const [lon, lat] of cand.points) allBounds.extend([lat, lon]);
      }
      // animate:false avoids leaving the tile-container stuck on a partial
      // zoom transform if React triggers a downstream invalidateSize while
      // the fit animation is mid-flight (visible bug: blank tiles around
      // the trace).
      map.fitBounds(allBounds, { padding: [24, 24], animate: false });
      return;
    }

    if (start) {
      const [lon, lat] = start;
      L.circleMarker([lat, lon], {
        radius: 7,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(map);
      map.setView([lat, lon], START_ZOOM, { animate: false });
      return;
    }

    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
  }, [points, candidates, pois, start, color, showDirection, editableWaypoints, editClosedLoop]);

  // Leaflet caches the container size at init time, so any external resize
  // (e.g. wrapper toggling between collapsed/expanded heights) leaves the
  // tile layer painted onto stale dimensions — the visible result is a
  // blank map until the user pans. ResizeObserver papers over that by
  // calling invalidateSize as soon as our container's box changes.
  useEffect(() => {
    const map = mapRef.current;
    const node = containerRef.current;
    if (!map || !node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(node);
    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const id = requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
    return () => cancelAnimationFrame(id);
  }, [className]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-72 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 sm:h-96 lg:h-[28rem]",
        onMapClick ? "cursor-crosshair" : undefined,
        className,
      )}
      role="region"
      aria-label="Carte du parcours"
    />
  );
}

export default RouteMap;
