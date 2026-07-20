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
 * Seven columns Mon→Sun: height = total session duration, colour = dominant
 * zone, rest days shown as a flat muted baseline. Days holding several
 * sessions stack one segment per session. Reads the shape of the week at a
 * glance (Epic #83, issue #88).
 */
export function WeekRhythmChart({ slots, className }: WeekRhythmChartProps) {
  const { t } = useTranslation("library");

  // Group per day — planWeekToSlots may emit several slots for the same day.
  const days = [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const sessions = slots
      .filter((s) => s.day === day && s.workout)
      .map((s) => ({
        duration: getAnyWorkoutDuration(s.workout!),
        zone: slotZone(s.workout),
      }));
    return {
      day,
      sessions,
      total: sessions.reduce((acc, s) => acc + s.duration, 0),
    };
  });
  const maxDuration = Math.max(1, ...days.map((d) => d.total));

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-sm font-medium">{t("weekly.rhythm.title")}</span>
      <div className="flex items-end gap-1.5 sm:gap-2 h-32">
        {days.map(({ day, sessions, total }) => {
          // Reserve the bottom 12 % for the baseline / day label area.
          const heightPct = total > 0 ? 12 + (total / maxDuration) * 88 : 0;

          return (
            <div
              key={day}
              className="flex flex-1 flex-col items-center justify-end gap-1 h-full"
            >
              <div className="relative flex w-full flex-1 items-end justify-center">
                {total > 0 ? (
                  <div
                    className="w-full max-w-10 rounded-t-md overflow-hidden flex flex-col-reverse gap-px transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${t(`weekly.days.${day}`)} · ${total} min`}
                  >
                    {sessions.map((session, idx) => (
                      <div
                        key={idx}
                        className="w-full"
                        style={{
                          height: `${(session.duration / total) * 100}%`,
                          backgroundColor: session.zone
                            ? `var(--zone-${session.zone})`
                            : "var(--muted-foreground)",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="h-1 w-full max-w-10 rounded-full bg-border"
                    title={t("weekly.kinds.rest")}
                  />
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {t(`weekly.daysShort.${day}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
