import { useMemo } from "react";
import type { TrainingPlan } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import { PHASE_ZONE_BAR } from "@/components/domain/PrebuiltPlanCard";

/**
 * Phase -> SVG paint. The bars used to carry their own decorative hex ramp
 * (blue/yellow/orange/green), unrelated to anything the app paints elsewhere.
 * They now read the same phase->zone approximation as the segmented phase bar
 * (`PHASE_ZONE_BAR`, see CLAUDE.md #114) and resolve it to the live
 * `var(--zone-N)` token, so the sparkline follows the theme and the
 * colour-blind palettes instead of freezing a copy of the ramp.
 */
function phaseToSvgColor(phase: TrainingPhase): string {
  const zone = /^bg-zone-([1-6])$/.exec(PHASE_ZONE_BAR[phase] ?? "")?.[1];
  return zone ? `var(--zone-${zone})` : "var(--filet)";
}

interface PlanSparklineProps {
  plan: TrainingPlan;
  currentWeek: number;
  isEn: boolean;
}

export function PlanSparkline({ plan, currentWeek, isEn }: PlanSparklineProps) {
  const { bars, svgWidth, barWidth } = useMemo(() => {
    const weekCount = plan.weeks.length;
    if (weekCount === 0) return { bars: [], svgWidth: 0, barWidth: 0 };

    // Compute duration per week
    const weekDurations = plan.weeks.map((week) =>
      week.sessions.reduce(
        (sum, s) =>
          s.workoutId === "__race_day__" ? sum : sum + s.estimatedDurationMin,
        0
      )
    );

    const peakDuration = Math.max(...weekDurations, 1);

    const HEIGHT = 36;
    const TOP_PADDING = 8; // space for the triangle marker
    const usableHeight = HEIGHT - TOP_PADDING;

    const g = Math.max(1, Math.min(3, Math.round(80 / weekCount)));
    const bw = Math.max(4, Math.min(16, Math.round(200 / weekCount)));
    const totalWidth = weekCount * bw + (weekCount - 1) * g;

    const computed = plan.weeks.map((week, i) => {
      const duration = weekDurations[i];
      const heightRatio = duration / peakDuration;
      const barH = Math.max(2, heightRatio * usableHeight);
      const y = TOP_PADDING + usableHeight - barH;
      const x = i * (bw + g);
      const isPast = week.weekNumber < currentWeek;
      const isCurrent = week.weekNumber === currentWeek;
      const isFuture = week.weekNumber > currentWeek;

      return {
        x,
        y,
        height: barH,
        color: phaseToSvgColor(week.phase),
        opacity: isFuture ? 0.4 : 1,
        isCurrent,
        isPast,
        weekNumber: week.weekNumber,
        phase: week.phase,
        durationMin: duration,
      };
    });

    return {
      bars: computed,
      svgWidth: totalWidth,
      barWidth: bw,
    };
  }, [plan, currentWeek]);

  if (bars.length === 0) return null;

  return (
    <div
      className="w-full"
      role="img"
      aria-label={
        isEn
          ? `Training volume sparkline: ${bars.length} weeks`
          : `Sparkline du volume: ${bars.length} semaines`
      }
    >
      <svg
        viewBox={`0 0 ${svgWidth} 36`}
        width="100%"
        height="36"
        preserveAspectRatio="none"
        className="block"
      >
        {/* Week bars */}
        {bars.map((bar) => (
          <g key={bar.weekNumber}>
            <rect
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.height}
              fill={bar.color}
              opacity={bar.opacity}
            />
            {/* Current week highlight: bright top stroke */}
            {bar.isCurrent && (
              <>
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={barWidth}
                  height={bar.height}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth={1.5}
                />
                {/* Triangle marker above current week */}
                <polygon
                  points={`${bar.x + barWidth / 2 - 3},${bar.y - 2} ${bar.x + barWidth / 2 + 3},${bar.y - 2} ${bar.x + barWidth / 2},${bar.y - 6}`}
                  fill="var(--foreground)"
                />
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
