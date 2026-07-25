import { useTranslation } from "react-i18next";
import type { TimelineEvent } from "@/lib/raceSimulator";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { minutesToTime, timeToMinutes } from "./utils";
import { useNowMinutes } from "./useNowMinutes";

/**
 * The day, in order.
 *
 * Deliberately monochrome: the list is chronological, so position already
 * carries the grouping a five-colour palette was trying (and failing) to
 * convey. Emphasis is spent on two things only — the gun, and where you are
 * right now.
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
  // window — i.e. the race is today.
  const isLive = now >= first - 30 && now <= last + 30;
  const nextIndex = isLive ? minutes.findIndex((m) => m > now) : -1;
  const markerAt = isLive ? (nextIndex === -1 ? timeline.length : nextIndex) : -1;

  return (
    <ol className={cn("relative space-y-0", className)}>
      {timeline.map((event, i) => {
        const isStart = event.type === "race" && event.relativeMin === 0;
        const isPast = isLive && minutes[i] <= now;
        return (
          <li key={`${event.time}-${i}`}>
            {markerAt === i && <NowMarker now={now} label={t("timeline.now")} />}
            <div
              className={cn(
                "relative flex gap-3 border-l pl-4",
                isStart && "bg-muted/50",
              )}
            >
              {/* Dot on the spine */}
              <span
                aria-hidden
                className={cn(
                  "absolute -left-[4.5px] top-[0.9rem] size-[9px] rounded-full border-2 border-background",
                  isStart ? "bg-foreground" : "bg-muted-foreground/40",
                )}
              />
              <time
                className={cn(
                  "w-12 shrink-0 py-2.5 font-mono text-sm tabular-nums",
                  isStart
                    ? "font-semibold text-foreground"
                    : isPast
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground",
                )}
              >
                {event.time}
              </time>
              <p
                className={cn(
                  "min-w-0 py-2.5 pr-3 text-sm",
                  isStart && "text-base font-semibold tracking-tight",
                  !isStart && isPast && "text-muted-foreground/60",
                )}
              >
                {pick(event, "label")}
              </p>
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
    <div className="relative flex items-center gap-3 border-l border-primary pl-4">
      <span
        aria-hidden
        className="absolute -left-[5px] size-[11px] rounded-full border-2 border-background bg-primary"
      />
      <span className="w-12 shrink-0 font-mono text-sm font-semibold tabular-nums text-primary">
        {minutesToTime(now)}
      </span>
      <span className="flex flex-1 items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {label}
        </span>
        <span aria-hidden className="h-px flex-1 bg-primary/30" />
      </span>
    </div>
  );
}
