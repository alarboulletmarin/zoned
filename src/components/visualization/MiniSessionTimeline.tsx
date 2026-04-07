import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ChevronUp } from "@/components/icons";
import type { WorkoutTemplate } from "@/types";
import type { ZoneNumber } from "./types";
import { transformSessionBlocks, formatDurationMinutes } from "./transforms";

interface MiniSessionTimelineProps {
  workout: WorkoutTemplate;
  onClickScrollBack: () => void;
}

const ZONE_COLORS: Record<ZoneNumber, string> = {
  1: "var(--zone-1)",
  2: "var(--zone-2)",
  3: "var(--zone-3)",
  4: "var(--zone-4)",
  5: "var(--zone-5)",
  6: "var(--zone-6)",
};

function getHeightPercent(zone: ZoneNumber | null): number {
  if (!zone) return 40;
  return 30 + (zone - 1) * 14;
}


export function MiniSessionTimeline({
  workout,
  onClickScrollBack,
}: MiniSessionTimelineProps) {
  const { i18n } = useTranslation("session");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const isMobile = useIsMobile();

  const data = useMemo(() => {
    return transformSessionBlocks(
      {
        warmup: workout.warmupTemplate,
        mainSet: workout.mainSetTemplate,
        cooldown: workout.cooldownTemplate,
      },
      isEn,
    );
  }, [workout, isEn]);

  if (data.segments.length === 0 || !data.hasZoneData) return null;

  const title = isEn ? "Back to timeline" : "Retour à la timeline";
  const segmentCount = data.segments.length;
  const workoutName = isEn ? (workout.nameEn || workout.name) : workout.name;

  // Find dominant zone (highest time share)
  const dominantZone = data.zoneBreakdown.length > 0
    ? data.zoneBreakdown.reduce((a, b) => a.durationMin > b.durationMin ? a : b)
    : null;

  return (
    <div
      className="group/mini flex items-center gap-3 py-2 cursor-pointer"
      onClick={onClickScrollBack}
      role="button"
      tabIndex={0}
      title={title}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClickScrollBack();
      }}
    >
      {/* Left: workout name */}
      <div className="shrink-0 min-w-0 max-w-[140px] md:max-w-[200px]">
        <p className="text-xs font-semibold text-foreground/90 truncate leading-tight">
          {workoutName}
        </p>
        {dominantZone && !isMobile && (
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
            Z{dominantZone.zone} · {formatDurationMinutes(data.totalDurationMin)}
          </p>
        )}
      </div>

      {/* Center: timeline bar */}
      <div className="flex-1 relative min-w-0"
      >

        {/* Bar container */}
        <div
          className={cn(
            "relative flex items-end rounded-md overflow-hidden transition-all duration-200",
            "group-hover/mini:shadow-lg group-hover/mini:shadow-foreground/5",
            isMobile ? "h-5" : "h-7"
          )}
        >
          {data.segments.map((seg, i) => {
            const isFirst = i === 0;
            const isLast = i === segmentCount - 1;
            const zoneColor = seg.zoneNumber
              ? ZONE_COLORS[seg.zoneNumber]
              : "var(--muted-foreground)";

            return (
              <div
                key={seg.id}
                className={cn(
                  "relative transition-all duration-200",
                  "group-hover/mini:brightness-110",
                  seg.isRecovery && "opacity-50"
                )}
                style={{
                  width: `${seg.widthPercent}%`,
                  height: isMobile ? "100%" : `${getHeightPercent(seg.zoneNumber)}%`,
                  marginLeft: i > 0 ? "1px" : undefined,
                  borderRadius: isFirst
                    ? "4px 0 0 4px"
                    : isLast
                      ? "0 4px 4px 0"
                      : undefined,
                  overflow: "hidden",
                }}
              >
                {/* Base fill with vertical gradient for depth */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, color-mix(in srgb, ${zoneColor} 85%, white) 0%, ${zoneColor} 40%, color-mix(in srgb, ${zoneColor} 80%, black) 100%)`,
                  }}
                />
                {/* Top edge highlight for a subtle 3D bevel */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `color-mix(in srgb, ${zoneColor} 50%, white)`,
                    opacity: 0.4,
                  }}
                />
                {/* Recovery hatching */}
                {seg.isRecovery && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Glow reflection underneath the bar */}
        <div
          className={cn(
            "flex items-end overflow-hidden blur-md opacity-0 transition-opacity duration-300",
            "group-hover/mini:opacity-30",
            isMobile ? "h-3 -mt-1" : "h-4 -mt-1.5"
          )}
          aria-hidden="true"
          style={{ transform: "scaleY(-1)" }}
        >
          {data.segments.map((seg, i) => {
            const zoneColor = seg.zoneNumber
              ? ZONE_COLORS[seg.zoneNumber]
              : "transparent";
            return (
              <div
                key={`glow-${seg.id}`}
                style={{
                  width: `${seg.widthPercent}%`,
                  height: "100%",
                  backgroundColor: zoneColor,
                  marginLeft: i > 0 ? "1px" : undefined,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Right: mobile duration + scroll-back hint */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isMobile && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium tabular-nums">
            {formatDurationMinutes(data.totalDurationMin)}
          </span>
        )}
        <div
          className={cn(
            "flex items-center justify-center rounded-md transition-all duration-200",
            "text-muted-foreground/50 group-hover/mini:text-foreground/80",
            "group-hover/mini:bg-muted/60",
            isMobile ? "size-5" : "size-6"
          )}
        >
          <ChevronUp size={isMobile ? 12 : 14} className="transition-transform duration-200 group-hover/mini:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );
}

export default MiniSessionTimeline;
