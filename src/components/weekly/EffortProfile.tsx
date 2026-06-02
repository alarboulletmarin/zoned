import { useMemo } from "react";
import { transformSessionBlocks } from "@/components/visualization";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types";

interface EffortProfileProps {
  workout: WorkoutTemplate;
  className?: string;
}

/** Per-segment height by zone intensity (Z1 low → Z6 tall). */
function heightPercent(zone: number | null): number {
  if (!zone) return 35;
  return 30 + (zone - 1) * 14;
}

/**
 * Compact, non-interactive effort profile: one bar per segment, width =
 * duration share, height = zone intensity, colour = zone. Reuses the same
 * transform as the full session timeline. (Epic #83, issue #89)
 */
export function EffortProfile({ workout, className }: EffortProfileProps) {
  const data = useMemo(() => transformSessionBlocks(workout), [workout]);
  if (data.segments.length === 0 || !data.hasZoneData) return null;

  return (
    <div className={cn("flex h-8 w-full items-end gap-px", className)}>
      {data.segments.map((seg) => (
        <div
          key={seg.id}
          className={cn("rounded-sm", seg.isRecovery && "opacity-50")}
          style={{
            width: `${seg.widthPercent}%`,
            height: `${heightPercent(seg.zoneNumber)}%`,
            backgroundColor: seg.zoneNumber
              ? `var(--zone-${seg.zoneNumber})`
              : "var(--muted-foreground)",
          }}
        />
      ))}
    </div>
  );
}
