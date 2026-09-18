import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { weekRhythm } from "@/lib/weekRhythm";
import type { WeekSlot } from "@/types/week";

interface WeekRhythmChartProps {
  slots: WeekSlot[];
  className?: string;
  /** Bars only, no title and no day labels: the folded summary's thumbnail. */
  compact?: boolean;
}

/**
 * Seven columns Mon→Sun: height = total session duration, colour = dominant
 * zone, rest days shown as a flat muted baseline. Days holding several
 * sessions stack one segment per session. Reads the shape of the week at a
 * glance (Epic #83, issue #88). The figures come from `weekRhythm`, which the
 * share images read too, so both draw the same week.
 */
export function WeekRhythmChart({ slots, className, compact }: WeekRhythmChartProps) {
  const { t } = useTranslation("library");
  const { days, maxDuration } = weekRhythm(slots);

  return (
    <div
      className={cn("zn-wk-rhythm", compact && "zn-wk-rhythm--compact", className)}
      aria-hidden={compact || undefined}
    >
      {!compact && <span className="zn-label">{t("weekly.rhythm.title")}</span>}
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
                          // A session with no aerobic zone, strength, is
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
              {!compact && (
                <span className="zn-kicker zn-kicker--xs">
                  {t(`weekly.daysShort.${day}`)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
