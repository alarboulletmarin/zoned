import { useTranslation } from "react-i18next";
import type { TimelineEvent } from "@/lib/raceSimulator";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { minutesToTime, timeToMinutes } from "./utils";
import { useNowMinutes } from "./useNowMinutes";

/**
 * The day, in order.
 *
 * Ink on paper: a ruled spine, a dot per event, every clock in mono. The list
 * is chronological, so position already carries the grouping a five-colour
 * palette was trying (and failing) to convey. Emphasis is spent on two things
 * only, the gun, and where you are right now, which is the one vermillon mark
 * on the graphic.
 */
export function RaceTimeline({
  timeline,
  className,
}: {
  timeline: TimelineEvent[];
  className?: string;
}) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();
  const now = useNowMinutes();

  if (timeline.length === 0) return null;

  const minutes = timeline.map((e) => timeToMinutes(e.time));
  const first = minutes[0];
  const last = minutes[minutes.length - 1];
  // Only claim to know "now" when the clock actually sits inside the plan's
  // window, i.e. the race is today.
  const isLive = now >= first - 30 && now <= last + 30;
  const nextIndex = isLive ? minutes.findIndex((m) => m > now) : -1;
  const markerAt = isLive ? (nextIndex === -1 ? timeline.length : nextIndex) : -1;

  return (
    <ol className={cn("zn-rs-timeline", className)}>
      {timeline.map((event, i) => {
        const isStart = event.type === "race" && event.relativeMin === 0;
        const isPast = isLive && minutes[i] <= now;
        return (
          <li key={`${event.time}-${i}`}>
            {markerAt === i && <NowMarker now={now} label={t("timeline.now")} />}
            <div
              className="zn-rs-timeline__row"
              data-start={isStart || undefined}
              data-past={isPast || undefined}
            >
              {/* Dot on the spine */}
              <span aria-hidden className="zn-rs-timeline__dot" />
              <time className="zn-rs-timeline__time">{event.time}</time>
              <p className="zn-rs-timeline__label">{pick(event, "label")}</p>
            </div>
          </li>
        );
      })}
      {markerAt === timeline.length && (
        <NowMarker now={now} label={t("timeline.now")} />
      )}
    </ol>
  );
}

function NowMarker({ now, label }: { now: number; label: string }) {
  return (
    <div className="zn-rs-now">
      <span aria-hidden className="zn-rs-now__dot" />
      <span className="zn-rs-now__time">{minutesToTime(now)}</span>
      <span className="zn-rs-now__label">
        <span className="zn-rs-now__text">{label}</span>
        <span aria-hidden className="zn-rs-now__rule" />
      </span>
    </div>
  );
}
