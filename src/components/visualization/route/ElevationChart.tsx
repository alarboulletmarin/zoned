import { useMemo } from "react";

import type { RouteElevationPoint } from "@/types/route";
import { cn } from "@/lib/utils";

interface ElevationChartProps {
  profile: RouteElevationPoint[];
  className?: string;
  /** Chart height in pixels. Defaults to 140. */
  height?: number;
  /** Stroke / fill accent. */
  color?: string;
}

interface PathPoints {
  line: string;
  area: string;
  minAlt: number;
  maxAlt: number;
  totalKm: number;
}

const PADDING = { top: 8, right: 8, bottom: 22, left: 40 } as const;
const VIEW_WIDTH = 600;

function buildPaths(profile: RouteElevationPoint[], viewHeight: number): PathPoints | null {
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
    minAlt: yMin,
    maxAlt: yMax,
    totalKm,
  };
}

export function ElevationChart({
  profile,
  className,
  height = 140,
  color = "#ea580c",
}: ElevationChartProps) {
  const paths = useMemo(() => buildPaths(profile, height), [profile, height]);

  if (!paths) return null;

  const baseY = height - PADDING.bottom;
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      className={cn("w-full text-muted-foreground", className)}
      style={{ height }}
      role="img"
      aria-label="Profil de dénivelé"
      preserveAspectRatio="none"
    >
      {/* Y-axis labels (min and max only — keeps the chart clean) */}
      <text x={PADDING.left - 6} y={PADDING.top + 4} fontSize={10} textAnchor="end" fill="currentColor">
        {Math.round(paths.maxAlt)} m
      </text>
      <text x={PADDING.left - 6} y={baseY} fontSize={10} textAnchor="end" fill="currentColor">
        {Math.round(paths.minAlt)} m
      </text>

      {/* X-axis labels */}
      <text x={PADDING.left} y={height - 4} fontSize={10} textAnchor="start" fill="currentColor">
        0 km
      </text>
      <text x={VIEW_WIDTH - PADDING.right} y={height - 4} fontSize={10} textAnchor="end" fill="currentColor">
        {Math.round(paths.totalKm * 10) / 10} km
      </text>

      {/* Baseline */}
      <line
        x1={PADDING.left}
        x2={VIEW_WIDTH - PADDING.right}
        y1={baseY}
        y2={baseY}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={1}
      />

      <defs>
        <linearGradient id="elev-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      <path d={paths.area} fill="url(#elev-grad)" stroke="none" />
      <path d={paths.line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

export default ElevationChart;
