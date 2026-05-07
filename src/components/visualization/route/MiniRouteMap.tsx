import { useMemo } from "react";

import type { RouteCoordinate } from "@/types/route";

interface MiniRouteMapProps {
  /** GeoJSON-style ordered points (longitude, latitude). */
  points: RouteCoordinate[];
  /** Stroke colour for the trace. Defaults to Zoned primary. */
  color?: string;
  /** Tailwind class for sizing/aspect-ratio override. */
  className?: string;
  /** Background fill. Defaults to a faint muted tone. */
  background?: string;
}

/**
 * SVG mini-map preview of a route trace. Pure projection of the polyline
 * into a normalised box — no tiles, no map library — so it renders fast
 * inside list cards (Strava-style candidate thumbnails).
 *
 * The latitude axis is inverted (smaller pixel-y for larger lat) so the
 * sketch reads "north up" without depending on a mercator projection;
 * for short routes the curvature error is below visual perception.
 */
export function MiniRouteMap({
  points,
  color = "#ea580c",
  className = "h-16 w-24",
  background = "rgb(var(--muted) / 0.4)",
}: MiniRouteMapProps) {
  const path = useMemo(() => {
    if (points.length < 2) return null;
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    for (const [lon, lat] of points) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    const lonSpan = Math.max(maxLon - minLon, 1e-6);
    const latSpan = Math.max(maxLat - minLat, 1e-6);
    // Pad inside a 100×60 viewBox; preserve aspect ratio of the bbox so
    // the trace doesn't get squashed into a square that distorts the
    // route shape.
    const VB_W = 100;
    const VB_H = 60;
    const PAD = 4;
    const innerW = VB_W - PAD * 2;
    const innerH = VB_H - PAD * 2;
    const scale = Math.min(innerW / lonSpan, innerH / latSpan);
    const usedW = lonSpan * scale;
    const usedH = latSpan * scale;
    const offsetX = PAD + (innerW - usedW) / 2;
    const offsetY = PAD + (innerH - usedH) / 2;

    const segments: string[] = [];
    points.forEach(([lon, lat], i) => {
      const x = offsetX + (lon - minLon) * scale;
      // Invert lat so north (large lat) is at top.
      const y = offsetY + (maxLat - lat) * scale;
      segments.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
    });
    return { d: segments.join(" "), viewBox: `0 0 ${VB_W} ${VB_H}` };
  }, [points]);

  if (!path) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-border/60 ${className}`}
        style={{ background }}
        aria-hidden
      />
    );
  }

  return (
    <svg
      className={`shrink-0 rounded-md border border-border/60 ${className}`}
      viewBox={path.viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ background }}
      role="img"
      aria-label="Mini-aperçu du parcours"
    >
      <path
        d={path.d}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
