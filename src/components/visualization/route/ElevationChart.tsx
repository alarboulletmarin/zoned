import { useMemo, useRef, useState, type CSSProperties } from "react";

import type { RouteElevationPoint } from "@/types/route";
import { cn } from "@/lib/utils";

interface ElevationChartProps {
  profile: RouteElevationPoint[];
  className?: string;
  /**
   * SVG `viewBox` height. Used as the *ratio reference* (with VIEW_WIDTH it
   * defines the aspect ratio of the chart). The rendered height scales with
   * the container width thanks to CSS `aspect-ratio`, capped via `max-h`.
   */
  height?: number;
  /**
   * Stroke / wash colour. Handed to CSS as `--elev-ink` rather than to the
   * SVG attributes directly: a presentation attribute does not resolve
   * `var()`, so `stroke="var(--accent)"` would silently paint nothing.
   */
  color?: string;
}

interface PathPoints {
  line: string;
  area: string;
  yMin: number;
  yMax: number;
  totalKm: number;
}

const PADDING = { top: 8, right: 8, bottom: 22, left: 40 } as const;
const VIEW_WIDTH = 600;

function buildGeometry(profile: RouteElevationPoint[], viewHeight: number): PathPoints | null {
  if (profile.length < 2) return null;

  const altitudes = profile.map((p) => p.altitudeM);
  const minAlt = Math.min(...altitudes);
  const maxAlt = Math.max(...altitudes);
  const yMin = Math.floor(minAlt - 5);
  const yMax = Math.ceil(maxAlt + 5);
  const yRange = Math.max(1, yMax - yMin);

  const totalKm = profile[profile.length - 1].distanceM / 1000;
  const innerWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = viewHeight - PADDING.top - PADDING.bottom;

  const xFor = (distanceM: number): number => {
    const km = distanceM / 1000;
    return PADDING.left + (km / totalKm) * innerWidth;
  };
  const yFor = (alt: number): number => {
    const ratio = (alt - yMin) / yRange;
    return PADDING.top + (1 - ratio) * innerHeight;
  };

  const lineCmds: string[] = [];
  for (let i = 0; i < profile.length; i += 1) {
    const cmd = i === 0 ? "M" : "L";
    lineCmds.push(`${cmd}${xFor(profile[i].distanceM).toFixed(2)},${yFor(profile[i].altitudeM).toFixed(2)}`);
  }

  const baseY = PADDING.top + innerHeight;
  const areaCmds = [
    `M${xFor(profile[0].distanceM).toFixed(2)},${baseY.toFixed(2)}`,
    ...profile.map(
      (p) => `L${xFor(p.distanceM).toFixed(2)},${yFor(p.altitudeM).toFixed(2)}`,
    ),
    `L${xFor(profile[profile.length - 1].distanceM).toFixed(2)},${baseY.toFixed(2)}`,
    "Z",
  ];

  return {
    line: lineCmds.join(" "),
    area: areaCmds.join(" "),
    yMin,
    yMax,
    totalKm,
  };
}

/** Slope between two consecutive samples in %. Returns 0 for a zero-length segment. */
function slopePercent(prev: RouteElevationPoint, curr: RouteElevationPoint): number {
  const dx = curr.distanceM - prev.distanceM;
  if (dx <= 0) return 0;
  return ((curr.altitudeM - prev.altitudeM) / dx) * 100;
}

export function ElevationChart({
  profile,
  className,
  height = 140,
  color = "var(--accent)",
}: ElevationChartProps) {
  const geometry = useMemo(() => buildGeometry(profile, height), [profile, height]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!geometry) return null;

  const { yMin, yMax, totalKm } = geometry;
  const yRange = Math.max(1, yMax - yMin);
  const innerWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;
  const baseY = PADDING.top + innerHeight;

  const xFor = (distanceM: number): number =>
    PADDING.left + ((distanceM / 1000) / totalKm) * innerWidth;
  const yFor = (alt: number): number =>
    PADDING.top + (1 - (alt - yMin) / yRange) * innerHeight;

  /**
   * Map a pointer X in CSS pixels (relative to wrapperRef) onto the
   * nearest profile sample. Uses binary search on cumulative distance —
   * accurate across non-uniform sampling and O(log n).
   */
  const pickIndex = (clientX: number): number | null => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return null;
    const rect = wrapper.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    if (!Number.isFinite(ratio)) return null;

    const viewX = ratio * VIEW_WIDTH;
    if (viewX < PADDING.left) return 0;
    if (viewX > PADDING.left + innerWidth) return profile.length - 1;

    const targetKm = ((viewX - PADDING.left) / innerWidth) * totalKm;
    const targetM = targetKm * 1000;

    let lo = 0;
    let hi = profile.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (profile[mid].distanceM < targetM) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) {
      const a = profile[lo - 1].distanceM;
      const b = profile[lo].distanceM;
      if (Math.abs(targetM - a) < Math.abs(targetM - b)) return lo - 1;
    }
    return lo;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const i = pickIndex(e.clientX);
    setHoverIndex(i);
  };
  const onPointerLeave = () => setHoverIndex(null);

  const hoverPoint = hoverIndex != null ? profile[hoverIndex] : null;
  const hoverPrev =
    hoverIndex != null && hoverIndex > 0 ? profile[hoverIndex - 1] : null;
  const hoverSlope =
    hoverPoint && hoverPrev ? slopePercent(hoverPrev, hoverPoint) : 0;

  // Convert the SVG-space hover X (viewBox units) to a CSS percentage so
  // the tooltip overlay positions itself reliably regardless of the
  // chart's rendered width.
  const hoverPctX = hoverPoint
    ? (xFor(hoverPoint.distanceM) / VIEW_WIDTH) * 100
    : null;

  return (
    <div
      ref={wrapperRef}
      className={cn("zn-elev", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerMove}
      style={{ "--elev-ink": color } as CSSProperties}
    >
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
        className="zn-elev__svg"
        style={{ aspectRatio: `${VIEW_WIDTH} / ${height}` }}
        role="img"
        aria-label="Profil de dénivelé"
        preserveAspectRatio="none"
      >
        <text x={PADDING.left - 6} y={PADDING.top + 4} textAnchor="end" className="zn-elev__label">
          {Math.round(yMax)} m
        </text>
        <text x={PADDING.left - 6} y={baseY} textAnchor="end" className="zn-elev__label">
          {Math.round(yMin)} m
        </text>

        <text x={PADDING.left} y={height - 4} textAnchor="start" className="zn-elev__label">
          0 km
        </text>
        <text x={VIEW_WIDTH - PADDING.right} y={height - 4} textAnchor="end" className="zn-elev__label">
          {Math.round(totalKm * 10) / 10} km
        </text>

        <line
          x1={PADDING.left}
          x2={VIEW_WIDTH - PADDING.right}
          y1={baseY}
          y2={baseY}
          className="zn-elev__baseline"
        />

        <path d={geometry.area} className="zn-elev__area" />
        <path d={geometry.line} className="zn-elev__line" />

        {hoverPoint && (
          <>
            <line
              x1={xFor(hoverPoint.distanceM)}
              x2={xFor(hoverPoint.distanceM)}
              y1={PADDING.top}
              y2={baseY}
              className="zn-elev__cursor"
            />
            <circle
              cx={xFor(hoverPoint.distanceM)}
              cy={yFor(hoverPoint.altitudeM)}
              r={3.5}
              className="zn-elev__dot"
            />
          </>
        )}
      </svg>

      {hoverPoint && hoverPctX != null && (
        <div
          className="zn-elev__tip"
          style={
            {
              "--x": `${Math.min(95, Math.max(5, hoverPctX))}%`,
            } as CSSProperties
          }
        >
          <span>{(hoverPoint.distanceM / 1000).toFixed(2)} km</span>
          <span>·</span>
          <span>{Math.round(hoverPoint.altitudeM)} m</span>
          <span>·</span>
          <span className="zn-elev__slope">
            {hoverSlope > 0 ? "+" : ""}
            {hoverSlope.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default ElevationChart;
