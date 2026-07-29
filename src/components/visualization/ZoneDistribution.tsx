/**
 * Zone Distribution - Shows time spent in each zone
 * Uses transformed data that accounts for repetitions
 */

import { useMemo } from "react";
import type { WorkoutTemplate } from "@/types";
import { getWorkoutDiscipline } from "@/types";
import { transformSessionBlocks, formatDurationMinutes } from "./transforms";
import { useZoneColors } from "@/hooks/useZoneColors";
import { useIsEnglish } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

interface ZoneDistributionProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function ZoneDistribution({ workout, className }: ZoneDistributionProps) {
  // `transformSessionBlocks` resolves the zone names through `pickLang`, which
  // reads the active language when it is called. Without the language in the
  // dependency list the memo keeps the labels it computed on first render, so
  // switching FR/EN left "Récupération" on an otherwise English page until a
  // reload.
  const isEnglish = useIsEnglish();
  const { zoneBreakdown, totalDurationMin } = useMemo(() => {
    return transformSessionBlocks(workout);
  }, [workout, isEnglish]);
  const zoneColors = useZoneColors(getWorkoutDiscipline(workout));

  if (zoneBreakdown.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Horizontal bars */}
      <div className="space-y-3">
        {zoneBreakdown.map((item) => (
          <div key={item.zone ?? "unzoned"} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-medium truncate">
                {item.zone != null && <span className="font-mono">Z{item.zone}</span>}
                {item.zone != null && " · "}
                {item.label}
              </span>
              <span className="text-muted-foreground font-mono tabular-nums shrink-0">
                {Math.round(item.percent)}% · {formatDurationMinutes(item.durationMin)}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.zone != null ? zoneColors[item.zone] : "var(--muted-foreground)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total duration */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        Total: {formatDurationMinutes(totalDurationMin)}
      </div>
    </div>
  );
}

/**
 * Mini bar for cards - shows zone proportions without labels
 */
interface SessionIntensityBarProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function SessionIntensityBar({ workout, className }: SessionIntensityBarProps) {
  // Same reason as in ZoneDistribution above.
  const isEnglish = useIsEnglish();
  const { zoneBreakdown } = useMemo(() => {
    return transformSessionBlocks(workout);
  }, [workout, isEnglish]);
  const zoneColors = useZoneColors(getWorkoutDiscipline(workout));

  if (zoneBreakdown.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex h-1 w-full overflow-hidden rounded-full bg-muted", className)}>
      {zoneBreakdown.map((item) => (
        <div
          key={item.zone ?? "unzoned"}
          style={{
            flex: item.percent,
            backgroundColor: item.zone != null ? zoneColors[item.zone] : "var(--muted-foreground)",
          }}
        />
      ))}
    </div>
  );
}
