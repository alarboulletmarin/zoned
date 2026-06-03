import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getAnyWorkoutDuration } from "@/lib/workoutFilters";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { AnyWorkoutTemplate } from "@/types";
import type { WeekSlot } from "@/types/week";

interface WeekRhythmChartProps {
  slots: WeekSlot[];
  className?: string;
}

/** Accent zone for a slot — strength/rest have no aerobic zone. */
function slotZone(w: AnyWorkoutTemplate | null): number | null {
  if (!w || isStrengthWorkout(w)) return null;
  return getDominantZone(w);
}

/**
 * Seven columns Mon→Sun: height = session duration, colour = dominant zone,
 * rest days shown as a flat muted baseline. Reads the shape of the week at a
 * glance (Epic #83, issue #88).
 */
export function WeekRhythmChart({ slots, className }: WeekRhythmChartProps) {
  const { t } = useTranslation("library");

  const ordered = [...slots].sort((a, b) => a.day - b.day);
  const maxDuration = Math.max(
    1,
    ...ordered.map((s) => (s.workout ? getAnyWorkoutDuration(s.workout) : 0)),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-sm font-medium">{t("weekly.rhythm.title")}</span>
      <div className="flex items-end gap-1.5 sm:gap-2 h-32">
        {ordered.map((slot) => {
          const duration = slot.workout
            ? getAnyWorkoutDuration(slot.workout)
            : 0;
          const zone = slotZone(slot.workout);
          // Reserve the bottom 12 % for the baseline / day label area.
          const heightPct =
            duration > 0 ? 12 + (duration / maxDuration) * 88 : 0;

          return (
            <div
              key={slot.day}
              className="flex flex-1 flex-col items-center justify-end gap-1 h-full"
            >
              <div className="relative flex w-full flex-1 items-end justify-center">
                {duration > 0 ? (
                  <div
                    className="w-full max-w-10 rounded-t-md transition-all"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: zone
                        ? `var(--zone-${zone})`
                        : "var(--muted-foreground)",
                    }}
                    title={`${t(`weekly.days.${slot.day}`)} · ${duration} min`}
                  />
                ) : (
                  <div
                    className="h-1 w-full max-w-10 rounded-full bg-border"
                    title={t("weekly.kinds.rest")}
                  />
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {t(`weekly.daysShort.${slot.day}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
