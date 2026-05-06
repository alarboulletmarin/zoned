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
}

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

const DEFAULT_CENTER: [number, number] = [46.7, 2.4]; // approx geographic centre of metropolitan France
const DEFAULT_ZOOM = 5;
const START_ZOOM = 13;

/**
 * Leaflet wrapper that renders an interactive map. When `points` are
 * provided, the routed trace and a start marker are drawn and the map is
 * fitted to the trace bounds. When only `start` is provided, a single marker
 * is rendered at zoom 13. Without either, the map shows a default view.
 */
export function RouteMap({
  points = [],
  candidates,
  pois,
  start = null,
  className,
  color = "#ea580c",
  interactive = true,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

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
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    if (points.length > 1) {
      const selectedLatLngs: [number, number][] = points.map(([lon, lat]) => [lat, lon]);

      // Draw non-selected candidates first so the selected trace renders on
      // top. Each gets its own muted hue + dash pattern so two overlapping
      // candidates remain visually distinguishable even when they share a
      // significant portion of their tracks (common around the start).
      const others = (candidates ?? []).filter((c) => c !== points && c.length > 1);
      const ALT_STYLES = [
        { color: "#0ea5e9", dashArray: "6 6" }, // sky-500
        { color: "#a855f7", dashArray: "2 6" }, // purple-500
        { color: "#10b981", dashArray: "8 4" }, // emerald-500
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
      L.circleMarker(selectedLatLngs[0], {
        radius: 6,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(map);

      // POI markers — small slate-coloured dots with a tooltip carrying the
      // OSM name. Rendered after the trace so they sit on top.
      for (const poi of pois ?? []) {
        const [poiLon, poiLat] = poi.point;
        const marker = L.circleMarker([poiLat, poiLon], {
          radius: 5,
          color: "#ffffff",
          weight: 1.5,
          fillColor: "#475569", // slate-600 — distinct from the orange trace
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

      // Fit to the union of all rendered traces so muted candidates remain
      // visible even when they extend beyond the selected one.
      const allBounds = L.latLngBounds(selectedLatLngs);
      for (const cand of others) {
        for (const [lon, lat] of cand) allBounds.extend([lat, lon]);
      }
      map.fitBounds(allBounds, { padding: [24, 24] });
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
      map.setView([lat, lon], START_ZOOM, { animate: true });
      return;
    }

    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  }, [points, candidates, pois, start, color]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-72 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 sm:h-96 lg:h-[28rem]",
        className,
      )}
      role="region"
      aria-label="Carte du parcours"
    />
  );
}

export default RouteMap;
