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
import { getWorkoutDiscipline } from "@/types";
import type { TimelineSegment, ZoneNumber } from "./types";
import { transformSessionBlocks, formatDurationMinutes } from "./transforms";
import { useZoneColors, type ZoneColorMap } from "@/hooks/useZoneColors";
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
 * Height percentage based on zone intensity
 * Z1 = 30%, Z6 = 100% (linear interpolation)
 */
function getHeightPercent(zone: ZoneNumber | null): number {
  if (!zone) return 40;
  return 30 + (zone - 1) * 14;
}

/**
 * Round-number gradations for the time axis, sized so labels never crowd:
 * roughly 3 to 5 ticks whatever the session length. The final tick is
 * dropped when it would collide with the total duration on the right.
 */
function buildTimeTicks(totalMin: number): number[] {
  if (!Number.isFinite(totalMin) || totalMin <= 0) return [];
  const step = totalMin <= 20 ? 5 : totalMin <= 75 ? 15 : totalMin <= 150 ? 30 : 60;

  const ticks: number[] = [];
  for (let minute = 0; minute < totalMin; minute += step) {
    ticks.push(minute);
  }
  // Drop a trailing tick sitting within 12% of the end — the total label owns
  // that space.
  const last = ticks[ticks.length - 1];
  if (last != null && last > 0 && (totalMin - last) / totalMin < 0.12) ticks.pop();
  return ticks;
}

interface SegmentTooltipContentProps {
  segment: TimelineSegment;
  zoneColors: ZoneColorMap;
  t: (key: string) => string;
}

function SegmentTooltipContent({ segment, zoneColors, t }: SegmentTooltipContentProps) {
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
            style={{ backgroundColor: zoneColors[segment.zoneNumber] }}
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
          {segment.setIndex && segment.totalSets && (
            <span>Série {segment.setIndex}/{segment.totalSets} • </span>
          )}
          Rép {segment.repetitionIndex}/{segment.totalRepetitions}
        </p>
      )}
      {segment.isSeriesRecovery && (
        <p className="text-xs text-muted-foreground italic">
          Récupération inter-séries
        </p>
      )}
    </div>
  );
}

export function SessionTimeline({ workout, className }: SessionTimelineProps) {
  const { t } = useTranslation("session");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null);

  const { segments, totalDurationMin } = useMemo(() => {
    return transformSessionBlocks(workout);
  }, [workout]);

  const zoneColors = useZoneColors(getWorkoutDiscipline(workout));
  const ticks = useMemo(() => buildTimeTicks(totalDurationMin), [totalDurationMin]);

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
      <div className={cn("w-full pt-3", className)}>
        {/* Timeline bar container */}
        <div
          className="relative flex items-end h-40 md:h-56 rounded-xl overflow-hidden"
          style={{ backgroundColor: "color-mix(in srgb, var(--muted) 40%, transparent)" }}
          role="img"
          aria-label={t("visualization.timeline")}
        >
          {segments.map((segment, index) => {
            const heightPercent = getHeightPercent(segment.zoneNumber);
            const isHovered = hoveredIndex === index;
            const prevSegment = index > 0 ? segments[index - 1] : null;
            const isTypeChange = prevSegment && prevSegment.type !== segment.type;

            return (
              <Tooltip
                key={segment.id}
                open={openTooltipIndex === index}
                onOpenChange={(open) => {
                  if (open) {
                    setOpenTooltipIndex(index);
                  } else if (openTooltipIndex === index) {
                    setOpenTooltipIndex(null);
                  }
                }}
              >
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative transition-all duration-200 cursor-pointer rounded-t-sm",
                      "hover:brightness-110 hover:z-10",
                      segment.isRecovery && "opacity-70",
                      isHovered && "brightness-110"
                    )}
                    style={{
                      width: `${segment.widthPercent}%`,
                      height: `${heightPercent}%`,
                      backgroundColor: segment.zoneNumber
                        ? zoneColors[segment.zoneNumber]
                        : "var(--muted-foreground)",
                      marginLeft: index > 0 ? "2px" : undefined,
                      borderLeft: isTypeChange
                        ? "3px solid rgba(0,0,0,0.3)"
                        : undefined,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      setOpenTooltipIndex(openTooltipIndex === index ? null : index);
                    }}
                  >
                    {/* Hover label */}
                    {isHovered && segment.zoneNumber && segment.widthPercent > 3 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap z-20 pointer-events-none">
                        Z{segment.zoneNumber} · {formatDurationMinutes(segment.durationMin)}
                      </div>
                    )}

                    {/* Recovery indicator pattern */}
                    {segment.isRecovery && (
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--background)) 3px, hsl(var(--background)) 6px)",
                        }}
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <SegmentTooltipContent segment={segment} zoneColors={zoneColors} t={t} />
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Time axis — a real scale. The total duration sits at the right
            edge, where the session actually ends; centring it read as
            "56min at the halfway point". */}
        <div className="relative h-7 mt-2 select-none" aria-hidden="true">
          {ticks.map((minute) => (
            <div
              key={minute}
              className="absolute top-0 flex flex-col items-start"
              style={{ left: `${(minute / totalDurationMin) * 100}%` }}
            >
              <span className="block h-1.5 w-px bg-border" />
              <span
                className={cn(
                  "font-mono text-[10px] sm:text-xs text-muted-foreground mt-1",
                  minute > 0 && "-translate-x-1/2"
                )}
              >
                {minute}
              </span>
            </div>
          ))}
          <div className="absolute top-0 right-0 flex flex-col items-end">
            <span className="block h-1.5 w-px bg-border" />
            <span className="font-mono text-[10px] sm:text-xs font-bold text-foreground mt-1">
              {formatDurationMinutes(totalDurationMin)}
            </span>
          </div>
        </div>
        <span className="sr-only">
          {t("visualization.start")} — {formatDurationMinutes(totalDurationMin)} — {t("visualization.end")}
        </span>
      </div>
    </TooltipProvider>
  );
}

export default SessionTimeline;
