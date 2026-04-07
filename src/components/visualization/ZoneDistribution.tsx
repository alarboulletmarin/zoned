/**
 * Zone Distribution - Shows time spent in each zone
 * Uses transformed data that accounts for repetitions
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { WorkoutTemplate } from "@/types";
import { transformSessionBlocks } from "./transforms";
import { cn } from "@/lib/utils";

interface ZoneDistributionProps {
  workout: WorkoutTemplate;
  className?: string;
  /** Volume scaling (0-100) from plan context. Scales main set durations. */
  volumePercent?: number;
}

export function ZoneDistribution({ workout, className, volumePercent }: ZoneDistributionProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") ?? false;

  const { zoneBreakdown, totalDurationMin } = useMemo(() => {
    return transformSessionBlocks(
      {
        warmup: workout.warmupTemplate,
        mainSet: workout.mainSetTemplate,
        cooldown: workout.cooldownTemplate,
      },
      isEn,
      volumePercent
    );
  }, [workout, isEn, volumePercent]);

  if (zoneBreakdown.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Horizontal bars */}
      <div className="space-y-2">
        {zoneBreakdown.map((item) => (
          <div key={item.zone} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Z{item.zone} - {item.label}</span>
              <span className="text-muted-foreground">
                {Math.round(item.percent)}% ({Math.round(item.durationMin)}min)
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: `var(--zone-${item.zone})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total duration */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        {isEn ? "Total" : "Total"}: {Math.round(totalDurationMin)} min
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
  const { zoneBreakdown } = useMemo(() => {
    return transformSessionBlocks({
      warmup: workout.warmupTemplate,
      mainSet: workout.mainSetTemplate,
      cooldown: workout.cooldownTemplate,
    });
  }, [workout]);

  if (zoneBreakdown.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex h-1 w-full overflow-hidden rounded-full bg-muted", className)}>
      {zoneBreakdown.map((item) => (
        <div
          key={item.zone}
          style={{
            flex: item.percent,
            backgroundColor: `var(--zone-${item.zone})`,
          }}
        />
      ))}
    </div>
  );
}
