import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { RouteCoordinate } from "@/types/route";
import { cn } from "@/lib/utils";

interface RouteMapProps {
  points: RouteCoordinate[];
  className?: string;
  /** Optional accent colour for the trace polyline. Defaults to a Zoned-aware orange. */
  color?: string;
  /** Disable user interaction (drag, zoom) — useful for previews. */
  interactive?: boolean;
}

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/**
 * Leaflet wrapper that renders a routed trace. Imported lazily by route
 * pages to keep Leaflet (~40 KB gzip + CSS) out of the main bundle.
 */
export function RouteMap({ points, className, color = "#ea580c", interactive = true }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // Already initialised — useEffect with [] deps runs once

    const map = L.map(containerRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      keyboard: interactive,
    });

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
    if (!map || points.length === 0) return;

    // Wipe any previous polyline / start marker before redrawing
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const latLngs: [number, number][] = points.map(([lon, lat]) => [lat, lon]);

    const polyline = L.polyline(latLngs, {
      color,
      weight: 4,
      opacity: 0.9,
    }).addTo(map);

    L.circleMarker(latLngs[0], {
      radius: 6,
      color: "#ffffff",
      weight: 2,
      fillColor: color,
      fillOpacity: 1,
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [24, 24] });
  }, [points, color]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-72 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 sm:h-96",
        className,
      )}
      role="region"
      aria-label="Carte du parcours"
    />
  );
}

export default RouteMap;
