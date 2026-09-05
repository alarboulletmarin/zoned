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
    <div className={cn("zn-wk-rhythm", className)}>
      <span className="zn-label">{t("weekly.rhythm.title")}</span>
      <div className="zn-wk-rhythm__days">
        {days.map(({ day, sessions, total }) => {
          // Reserve the bottom 12 % for the baseline / day label area.
          const heightPct = total > 0 ? 12 + (total / maxDuration) * 88 : 0;

          return (
            <div key={day} className="zn-wk-rhythm__day">
              <div className="zn-wk-rhythm__slot">
                {total > 0 ? (
                  <div
                    className="zn-wk-rhythm__col"
                    style={{ height: `${heightPct}%` }}
                    title={`${t(`weekly.days.${day}`)} · ${total} min`}
                  >
                    {sessions.map((session, idx) => (
                      <div
                        key={idx}
                        className="zn-wk-rhythm__seg"
                        style={{
                          height: `${(session.duration / total) * 100}%`,
                          // A session with no aerobic zone — strength — is
                          // unmeasured work, and this system draws anything
                          // unmeasured as a 45° hatch, never as a fake zone.
                          background: session.zone
                            ? `var(--zone-${session.zone})`
                            : "var(--zone-recovery)",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="zn-wk-rhythm__rest"
                    title={t("weekly.kinds.rest")}
                  />
                )}
              </div>
              <span className="zn-kicker zn-kicker--xs">
                {t(`weekly.daysShort.${day}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
