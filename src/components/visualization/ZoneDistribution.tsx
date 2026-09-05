/**
 * Zone Distribution - Shows time spent in each zone
 * Uses transformed data that accounts for repetitions
 */

import { useMemo, type CSSProperties } from "react";
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
    <div className={className}>
      {/* Horizontal bars */}
      <div className="zn-viz-bars">
        {zoneBreakdown.map((item) => (
          <div key={item.zone ?? "unzoned"} className="zn-viz-bar">
            <div className="zn-viz-bar__head">
              <span className="zn-viz-bar__label">
                {item.zone != null && <span className="zn-viz-bar__code">Z{item.zone}</span>}
                {item.zone != null && " · "}
                {item.label}
              </span>
              <span className="zn-viz-bar__value">
                {Math.round(item.percent)}% · {formatDurationMinutes(item.durationMin)}
              </span>
            </div>
            <div className="zn-viz-bar__track">
              <div
                className="zn-viz-bar__fill"
                style={
                  {
                    "--pct": `${item.percent}%`,
                    "--fill":
                      item.zone != null ? zoneColors[item.zone] : "var(--text-faint)",
                  } as CSSProperties
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total duration */}
      <div className="zn-viz-total">
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
    <div className={cn("zn-viz-strip", className)}>
      {zoneBreakdown.map((item) => (
        <div
          key={item.zone ?? "unzoned"}
          className="zn-viz-strip__seg"
          style={
            {
              flex: item.percent,
              "--fill":
                item.zone != null ? zoneColors[item.zone] : "var(--text-faint)",
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
