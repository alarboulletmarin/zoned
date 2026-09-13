import { useMemo } from "react";
import type { TrainingPlan } from "@/types/plan";

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

      return {
        x,
        y,
        height: barH,
        // The ink ramp is the whole legend: what is done is dark, what is
        // still ahead is pale, and the week you are in is the one accent.
        when: isCurrent ? "current" : isPast ? "past" : "future",
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
      className="zn-spark"
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
        className="zn-spark__svg"
      >
        {/* Week bars */}
        {bars.map((bar) => (
          <g key={bar.weekNumber}>
            <rect
              className="zn-spark__bar"
              data-when={bar.when}
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.height}
              rx={2}
            />
            {/* Current week: an ink outline around the accent bar, and the
                marker above it. Two channels, no third colour. */}
            {bar.isCurrent && (
              <>
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={barWidth}
                  height={bar.height}
                  rx={2}
                  fill="none"
                  stroke="var(--line-strong)"
                  strokeWidth={1.5}
                />
                {/* Triangle marker above current week */}
                <polygon
                  className="zn-spark__marker"
                  points={`${bar.x + barWidth / 2 - 3},${bar.y - 2} ${bar.x + barWidth / 2 + 3},${bar.y - 2} ${bar.x + barWidth / 2},${bar.y - 6}`}
                />
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
