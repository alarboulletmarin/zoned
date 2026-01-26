/**
 * SessionTimeline - Horizontal flexbox bar showing workout structure
 *
 * Like TrainingPeaks/Strava workout builders:
 * - Horizontal bar with segments proportional to duration
 * - Height proportional to zone intensity
 * - Color-coded by training zone
 * - Repetitions expanded into individual segments
 */

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { WorkoutTemplate } from "@/types";
import type { TimelineSegment, ZoneNumber } from "./types";
import { transformSessionBlocks, formatDurationMinutes } from "./transforms";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionTimelineProps {
  workout: WorkoutTemplate;
  className?: string;
}

/**
 * Zone colors using CSS variables for theme support
 */
const ZONE_COLORS: Record<ZoneNumber, string> = {
  1: "var(--zone-1)",
  2: "var(--zone-2)",
  3: "var(--zone-3)",
  4: "var(--zone-4)",
  5: "var(--zone-5)",
  6: "var(--zone-6)",
};

/**
 * Height percentage based on zone intensity
 * Z1 = 30%, Z6 = 100% (linear interpolation)
 */
function getHeightPercent(zone: ZoneNumber | null): number {
  if (!zone) return 40;
  return 30 + (zone - 1) * 14;
}

interface SegmentTooltipContentProps {
  segment: TimelineSegment;
  t: (key: string) => string;
}

function SegmentTooltipContent({ segment, t }: SegmentTooltipContentProps) {
  const typeLabel = {
    warmup: t("structure.warmup"),
    main: t("structure.main"),
    cooldown: t("structure.cooldown"),
  }[segment.type];

  return (
    <div className="space-y-1">
      <p className="font-medium text-sm">{segment.description}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {segment.zoneNumber && (
          <span
            className="inline-block w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: ZONE_COLORS[segment.zoneNumber] }}
          />
        )}
        <span>{typeLabel}</span>
        <span className="font-mono">{formatDurationMinutes(segment.durationMin)}</span>
        {segment.zoneNumber && (
          <span className="font-mono font-medium">Z{segment.zoneNumber}</span>
        )}
      </div>
      {segment.repetitionIndex && segment.totalRepetitions && (
        <p className="text-xs text-muted-foreground font-mono">
          {segment.repetitionIndex}/{segment.totalRepetitions}
        </p>
      )}
    </div>
  );
}

export function SessionTimeline({ workout, className }: SessionTimelineProps) {
  const { t, i18n } = useTranslation("session");
  const isEn = i18n.language === "en";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { segments, totalDurationMin } = useMemo(() => {
    return transformSessionBlocks(
      {
        warmup: workout.warmupTemplate,
        mainSet: workout.mainSetTemplate,
        cooldown: workout.cooldownTemplate,
      },
      isEn
    );
  }, [workout, isEn]);

  if (segments.length === 0) {
    return (
      <div className={cn("rounded-lg bg-muted/50 p-4 text-center", className)}>
        <p className="text-sm text-muted-foreground italic">
          {t("visualization.noData")}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("w-full", className)}>
        {/* Timeline bar container */}
        <div
          className="relative flex items-end h-16 rounded-lg overflow-hidden bg-slate-300 dark:bg-slate-700 border-2 border-border"
          role="img"
          aria-label={t("visualization.timeline")}
        >
          {segments.map((segment, index) => {
            const heightPercent = getHeightPercent(segment.zoneNumber);
            const isHovered = hoveredIndex === index;
            const prevSegment = index > 0 ? segments[index - 1] : null;
            const isTypeChange = prevSegment && prevSegment.type !== segment.type;

            return (
              <Tooltip key={segment.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative transition-all duration-150 cursor-pointer",
                      "hover:brightness-110 hover:z-10",
                      segment.isRecovery && "opacity-60",
                      isHovered && "brightness-110"
                    )}
                    style={{
                      width: `${segment.widthPercent}%`,
                      height: `${heightPercent}%`,
                      backgroundColor: segment.zoneNumber
                        ? ZONE_COLORS[segment.zoneNumber]
                        : "hsl(var(--muted))",
                      // Dark outline for accessibility
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)",
                      // Gap between segments
                      marginLeft: index > 0 ? "1px" : undefined,
                      // Stronger border on type change
                      borderLeft: isTypeChange
                        ? "3px solid rgba(0,0,0,0.5)"
                        : undefined,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Recovery indicator pattern */}
                    {segment.isRecovery && (
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent, transparent 2px, hsl(var(--background)) 2px, hsl(var(--background)) 4px)",
                        }}
                      />
                    )}

                    {/* Type indicator dots */}
                    {!segment.isRecovery && segment.type === "warmup" && (
                      <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/50" />
                    )}
                    {!segment.isRecovery && segment.type === "cooldown" && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/50" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <SegmentTooltipContent segment={segment} t={t} />
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5 px-0.5">
          <span>{t("visualization.start")}</span>
          <span className="font-mono font-medium">
            {formatDurationMinutes(totalDurationMin)}
          </span>
          <span>{t("visualization.end")}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default SessionTimeline;
