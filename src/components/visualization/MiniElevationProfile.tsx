import { useMemo } from "react";
import type { WorkoutBlock, WorkoutTemplate } from "@/types";
import { cn } from "@/lib/utils";

interface MiniElevationProfileProps {
  workout: WorkoutTemplate;
  className?: string;
  height?: number;
}

interface ProfilePoint {
  x: number;
  altitude: number;
}

function blockEffectiveCount(block: WorkoutBlock): number {
  const reps = block.repetitions && block.repetitions > 0 ? block.repetitions : 1;
  const sets = block.sets && block.sets > 0 ? block.sets : 1;
  return reps * sets;
}

function blockTotalMin(block: WorkoutBlock): number {
  if (block.durationMin != null) {
    return block.durationMin * blockEffectiveCount(block);
  }
  if (block.distanceM != null) {
    return (block.distanceM / 1000) * 5 * blockEffectiveCount(block);
  }
  return 0;
}

const DESCENT_RECOVERY = /descente|descend|jog down|walk down|remont/i;
const ASCENT_RECOVERY = /remont|jog up|montée trott/i;

function recoveryDirection(recovery: string | undefined, gradient: number): "opposite" | "same" | "none" {
  if (!recovery) return "none";
  if (gradient > 0 && DESCENT_RECOVERY.test(recovery)) return "opposite";
  if (gradient < 0 && ASCENT_RECOVERY.test(recovery)) return "opposite";
  return "none";
}

function parseRecoveryMin(recovery: string | undefined, effortMin: number): number {
  if (!recovery) return 0;
  const minMatch = recovery.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*min/i);
  if (minMatch) {
    const lo = parseFloat(minMatch[1]);
    const hi = minMatch[2] ? parseFloat(minMatch[2]) : lo;
    return (lo + hi) / 2;
  }
  const secMatch = recovery.match(/(\d+)\s*s\b/i);
  if (secMatch) return parseFloat(secMatch[1]) / 60;

  if (effortMin <= 0.5) return 2;
  if (effortMin <= 1.5) return 1;
  return effortMin;
}

function buildProfile(workout: WorkoutTemplate): { points: ProfilePoint[]; totalMin: number; minAlt: number; maxAlt: number } {
  const blocks: WorkoutBlock[] = [
    ...(workout.warmupTemplate ?? []),
    ...(workout.mainSetTemplate ?? []),
    ...(workout.cooldownTemplate ?? []),
  ];

  let cumulativeMin = 0;
  let altitude = 0;
  const points: ProfilePoint[] = [{ x: 0, altitude: 0 }];
  let minAlt = 0;
  let maxAlt = 0;

  const pushPoint = () => {
    points.push({ x: cumulativeMin, altitude });
    if (altitude < minAlt) minAlt = altitude;
    if (altitude > maxAlt) maxAlt = altitude;
  };

  for (const block of blocks) {
    const totalMin = blockTotalMin(block);
    if (totalMin <= 0) continue;

    const count = blockEffectiveCount(block);
    const perRepMin = totalMin / count;
    const gain = block.elevationGainM ?? 0;
    const gradient = block.gradientPercent ?? 0;

    let perRepAltDelta = 0;
    if (gain > 0) {
      perRepAltDelta = gradient < 0 ? -gain : gain;
    } else if (gradient !== 0 && perRepMin > 0) {
      const distanceKmEstimate = perRepMin / 5;
      perRepAltDelta = (gradient / 100) * distanceKmEstimate * 1000;
    }

    const oscillates = count > 1 && perRepAltDelta !== 0 && recoveryDirection(block.recovery, gradient || (perRepAltDelta > 0 ? 1 : -1)) === "opposite";

    if (oscillates) {
      const recoveryMin = parseRecoveryMin(block.recovery, perRepMin);
      for (let i = 0; i < count; i++) {
        cumulativeMin += perRepMin;
        altitude += perRepAltDelta;
        pushPoint();
        cumulativeMin += recoveryMin;
        altitude -= perRepAltDelta;
        pushPoint();
      }
    } else {
      for (let i = 0; i < count; i++) {
        cumulativeMin += perRepMin;
        altitude += perRepAltDelta;
        pushPoint();
      }
    }
  }

  return { points, totalMin: cumulativeMin, minAlt, maxAlt };
}

export function MiniElevationProfile({ workout, className, height = 60 }: MiniElevationProfileProps) {
  const { path, areaPath, totalMin, minAlt, maxAlt, hasData } = useMemo(() => {
    const profile = buildProfile(workout);
    if (profile.totalMin === 0 || profile.maxAlt === profile.minAlt) {
      return { path: "", areaPath: "", totalMin: 0, minAlt: 0, maxAlt: 0, hasData: false };
    }
    const width = 200;
    const pad = 2;
    const innerH = height - pad * 2;
    const range = Math.max(1, profile.maxAlt - profile.minAlt);
    const xFor = (m: number) => (m / profile.totalMin) * width;
    const yFor = (alt: number) => pad + (1 - (alt - profile.minAlt) / range) * innerH;

    const lineCmds = profile.points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.x).toFixed(1)},${yFor(p.altitude).toFixed(1)}`);
    const path = lineCmds.join(" ");

    const last = profile.points[profile.points.length - 1];
    const areaCmds = [
      `M${xFor(0).toFixed(1)},${(height - pad).toFixed(1)}`,
      ...profile.points.map((p) => `L${xFor(p.x).toFixed(1)},${yFor(p.altitude).toFixed(1)}`),
      `L${xFor(last.x).toFixed(1)},${(height - pad).toFixed(1)}`,
      "Z",
    ];
    const areaPath = areaCmds.join(" ");

    return { path, areaPath, totalMin: profile.totalMin, minAlt: profile.minAlt, maxAlt: profile.maxAlt, hasData: true };
  }, [workout, height]);

  if (!hasData) return null;

  const gainDisplay = Math.round(maxAlt - minAlt);

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 200 ${height}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height }}
        role="img"
        aria-label={`Profil altimétrique : +${gainDisplay} m sur ${Math.round(totalMin)} min`}
      >
        <path d={areaPath} fill="currentColor" className="text-primary/15" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-primary" />
      </svg>
    </div>
  );
}
