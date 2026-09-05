/**
 * SessionTimeline - Horizontal flexbox bar showing workout structure
 *
 * Like TrainingPeaks/Strava workout builders:
 * - Horizontal bar with segments proportional to duration
 * - Height proportional to zone intensity
 * - Color-coded by training zone
 * - Repetitions expanded into individual segments
 */

import { useState, useMemo, type CSSProperties } from "react";
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
    <div className="zn-timeline__tip">
      <p className="zn-timeline__tip-title">{segment.description}</p>
      <div className="zn-timeline__tip-meta">
        {segment.zoneNumber && (
          <span
            className="zn-timeline__tip-dot"
            style={{ "--fill": zoneColors[segment.zoneNumber] } as CSSProperties}
          />
        )}
        <span>{typeLabel}</span>
        <span>{formatDurationMinutes(segment.durationMin)}</span>
        {segment.zoneNumber && <span>Z{segment.zoneNumber}</span>}
      </div>
      {segment.repetitionIndex && segment.totalRepetitions && (
        <p className="zn-timeline__tip-note">
          {segment.setIndex && segment.totalSets && (
            <span>Série {segment.setIndex}/{segment.totalSets} • </span>
          )}
          Rép {segment.repetitionIndex}/{segment.totalRepetitions}
        </p>
      )}
      {segment.isSeriesRecovery && (
        <p className="zn-timeline__tip-note">
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
      <div className={cn("zn-viz-empty", className)}>
        <p className="zn-viz-empty__text">
          {t("visualization.noData")}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("zn-timeline", className)}>
        {/* Timeline bar container */}
        <div
          className="zn-timeline__plot"
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
                    className="zn-timeline__seg"
                    data-recovery={segment.isRecovery || undefined}
                    data-phase-change={isTypeChange || undefined}
                    data-hovered={isHovered || undefined}
                    style={
                      {
                        "--flex": segment.widthPercent,
                        "--h": `${heightPercent}%`,
                        "--fill": segment.zoneNumber
                          ? zoneColors[segment.zoneNumber]
                          : "var(--text-faint)",
                      } as CSSProperties
                    }
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      setOpenTooltipIndex(openTooltipIndex === index ? null : index);
                    }}
                  >
                    {/* Hover label */}
                    {isHovered && segment.zoneNumber && segment.widthPercent > 3 && (
                      <div className="zn-timeline__flag">
                        Z{segment.zoneNumber} · {formatDurationMinutes(segment.durationMin)}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <SegmentTooltipContent segment={segment} zoneColors={zoneColors} t={t} />
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Time axis — a real scale. The total duration sits at the right
            edge, where the session actually ends; centring it read as
            "56min at the halfway point". */}
        <div className="zn-timeline__axis" aria-hidden="true">
          {ticks.map((minute) => (
            <div
              key={minute}
              className="zn-timeline__tick"
              data-centered={minute > 0 || undefined}
              style={
                { "--x": `${(minute / totalDurationMin) * 100}%` } as CSSProperties
              }
            >
              <span className="zn-timeline__tick-mark" />
              <span className="zn-timeline__tick-label">{minute}</span>
            </div>
          ))}
          <div className="zn-timeline__end">
            <span className="zn-timeline__tick-mark" />
            <span className="zn-timeline__tick-label">
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
