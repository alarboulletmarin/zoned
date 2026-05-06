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
   * tone, so the user can compare proposals at a glance. Mutually used with
   * `points` (which holds the selected one).
   */
  candidates?: RouteCoordinate[][];
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
  pois,
  start = null,
  className,
  color = "#ea580c",
  interactive = true,
  onMapClick,
  showDirection = false,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clickHandlerRef = useRef<typeof onMapClick>(onMapClick);

  useEffect(() => {
    clickHandlerRef.current = onMapClick;
  }, [onMapClick]);

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

      const others = (candidates ?? []).filter((c) => c !== points && c.length > 1);
      const ALT_STYLES = [
        { color: "#0ea5e9", dashArray: "6 6" },
        { color: "#a855f7", dashArray: "2 6" },
        { color: "#10b981", dashArray: "8 4" },
      ];
      others.forEach((cand, idx) => {
        const latLngs: [number, number][] = cand.map(([lon, lat]) => [lat, lon]);
        const style = ALT_STYLES[idx % ALT_STYLES.length];
        L.polyline(latLngs, {
          color: style.color,
          weight: 3,
          opacity: 0.7,
          dashArray: style.dashArray,
        }).addTo(map);
      });

      L.polyline(selectedLatLngs, { color, weight: 4, opacity: 0.9 }).addTo(map);

      if (showDirection) {
        for (const { pos, angle } of sampleChevrons(selectedLatLngs)) {
          L.marker(pos, { icon: chevronIcon(angle, color), interactive: false }).addTo(map);
        }
      }

      L.circleMarker(selectedLatLngs[0], {
        radius: 6,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(map);

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
        for (const [lon, lat] of cand) allBounds.extend([lat, lon]);
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
  }, [points, candidates, pois, start, color, showDirection]);

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
