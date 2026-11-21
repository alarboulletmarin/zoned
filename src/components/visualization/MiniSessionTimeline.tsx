import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ChevronUp } from "@/components/icons";
import type { WorkoutTemplate } from "@/types";
import { getWorkoutDiscipline } from "@/types";
import type { ZoneNumber } from "./types";
import { transformSessionBlocks, formatDurationMinutes } from "./transforms";
import { usePickLang } from "@/lib/i18n-utils";
import { useZoneColors } from "@/hooks/useZoneColors";

interface MiniSessionTimelineProps {
  workout: WorkoutTemplate;
  onClickScrollBack: () => void;
}

function getHeightPercent(zone: ZoneNumber | null): number {
  if (!zone) return 40;
  return 30 + (zone - 1) * 14;
}


export function MiniSessionTimeline({
  workout,
  onClickScrollBack,
}: MiniSessionTimelineProps) {
  const { t } = useTranslation("session");
  const pick = usePickLang();
  const isMobile = useIsMobile();
  const zoneColors = useZoneColors(getWorkoutDiscipline(workout));

  const data = useMemo(() => {
    return transformSessionBlocks(workout);
  }, [workout]);

  if (data.segments.length === 0 || !data.hasZoneData) return null;

  const title = t("visualization.backToTimeline");
  const workoutName = pick(workout, "name");

  // Find dominant zone (highest time share)
  const dominantZone = data.zoneBreakdown.length > 0
    ? data.zoneBreakdown.reduce((a, b) => a.durationMin > b.durationMin ? a : b)
    : null;

  return (
    <div
      className="zn-minitl"
      onClick={onClickScrollBack}
      role="button"
      tabIndex={0}
      title={title}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClickScrollBack();
      }}
    >
      {/* Left: workout name */}
      <div className="zn-minitl__head">
        <p className="zn-minitl__name">
          {workoutName}
        </p>
        {dominantZone && !isMobile && (
          <p className="zn-minitl__meta">
            Z{dominantZone.zone} · {formatDurationMinutes(data.totalDurationMin)}
          </p>
        )}
      </div>

      {/* Center: timeline bar */}
      <div className="zn-minitl__bar">
        {data.segments.map((seg) => (
          <div
            key={seg.id}
            className="zn-minitl__seg"
            data-recovery={seg.isRecovery || undefined}
            style={
              {
                "--flex": seg.widthPercent,
                "--h": isMobile
                  ? "100%"
                  : `${getHeightPercent(seg.zoneNumber)}%`,
                "--fill": seg.zoneNumber
                  ? zoneColors[seg.zoneNumber]
                  : "var(--text-faint)",
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Right: mobile duration + scroll-back hint */}
      <div className="zn-minitl__end">
        {isMobile && (
          <span className="zn-minitl__time">
            {formatDurationMinutes(data.totalDurationMin)}
          </span>
        )}
        <span className="zn-minitl__hint">
          <ChevronUp size={isMobile ? 12 : 14} />
        </span>
      </div>
    </div>
  );
}

export default MiniSessionTimeline;
