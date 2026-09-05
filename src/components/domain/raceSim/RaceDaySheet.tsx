import { useTranslation } from "react-i18next";
import { Brain, Clock, Flame, Heart, Route, Utensils } from "@/components/icons";
import { Card } from "@/components/ui/card";
import type { RacePlan } from "@/lib/raceSimulator";
import { usePickLang } from "@/lib/i18n-utils";
import { formatPaceDisplay, formatSplitTime } from "@/lib/splits";
import { convertPace, getPaceUnit } from "@/lib/units";
import type { UnitSystem } from "@/types/settings";
import { FieldLabel, Stat } from "./RaceSimSection";
import { MentalCuesPanel } from "./MentalCuesPanel";
import { RaceTimeline } from "./RaceTimeline";
import { WarmupChecklist } from "./WarmupChecklist";
import { useNowMinutes } from "./useNowMinutes";
import { minutesToTime, timeToMinutes } from "./utils";

/**
 * The "execute" projection of the same plan.
 *
 * Preparing (sat down, a week out) and executing (stood up, stressed, twelve
 * minutes before the gun) are different jobs, and one collapsible tunnel was
 * serving neither. This view drops the reference prose, keeps only what you
 * act on, orders it by when you need it, and never hides anything behind a
 * chevron.
 */
export function RaceDaySheet({
  plan,
  unit,
  checked,
  onToggle,
}: {
  plan: RacePlan;
  unit: UnitSystem;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();
  const paceUnit = getPaceUnit(unit);

  const durationMin = plan.targetTimeSeconds / 60;
  const inRaceFueling = plan.fuelingPlan.timeline.filter(
    (cp) => cp.timeMin > 0 && cp.timeMin < durationMin,
  );
  const recovery = plan.fuelingPlan.timeline.filter(
    (cp) => cp.timeMin >= durationMin,
  );

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
    >
      <NextUp plan={plan} />

      <Block icon={<Flame />} title={t("sections.warmup")}>
        <WarmupChecklist
          exercises={plan.warmupExercises}
          startTime={plan.warmupStartTime}
          totalDurationMin={plan.warmupDurationMin}
          checked={checked}
          onToggle={onToggle}
        />
      </Block>

      <Block icon={<Route />} title={t("sections.race")}>
        <div className="zn-rs-stats">
          <Stat
            label={t("labels.targetPace")}
            value={
              <>
                {formatPaceDisplay(
                  convertPace(plan.targetTimeSeconds / 60 / plan.distanceKm, unit),
                )}
                <span className="zn-rs-stat__unit">{paceUnit}</span>
              </>
            }
          />
          <Stat
            label={t("labels.raceStart")}
            value={plan.startTime}
          />
          <Stat
            label={t("labels.estimatedFinish")}
            value={plan.estimatedFinishTime}
            hint={formatSplitTime(plan.targetTimeSeconds)}
          />
        </div>
      </Block>

      <Block icon={<Brain />} title={t("sections.mental")}>
        <MentalCuesPanel cues={plan.mentalCues} />
      </Block>

      {inRaceFueling.length > 0 && (
        <Block icon={<Utensils />} title={t("sections.nutrition")}>
          <ul
            className="zn-stack zn-rs-cp"
            style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
          >
            {inRaceFueling.map((cp, i) => (
              <li key={i} className="zn-rs-cp__item">
                <span className="zn-rs-cp__time">
                  {minutesToTime(
                    timeToMinutes(plan.startTime) + Math.round(cp.timeMin),
                  )}
                </span>
                <span className="zn-rs-cp__text">{pick(cp, "action")}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {recovery.length > 0 && (
        <Block icon={<Heart />} title={t("sections.recovery")}>
          <ul
            className="zn-stack zn-rs-cp"
            style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
          >
            {recovery.map((cp, i) => (
              <li key={i} className="zn-rs-note">
                {pick(cp, "action")}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block icon={<Clock />} title={t("sections.timeline")}>
        <RaceTimeline timeline={plan.timeline} />
      </Block>
    </div>
  );
}

function Block({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card size="flush" className="zn-rs-block">
      <div
        className="zn-row zn-rs-block__head"
        style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
      >
        {icon && <span className="zn-rs-block__icon">{icon}</span>}
        <h3 className="zn-rs-block__title">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

/**
 * The single most useful line on race morning: what happens next, and in how
 * long. Falls back to the plan's start time when the clock isn't inside the
 * plan's window — i.e. the race isn't today.
 */
function NextUp({ plan }: { plan: RacePlan }) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();
  const now = useNowMinutes();

  const minutes = plan.timeline.map((e) => timeToMinutes(e.time));
  const first = minutes[0];
  const last = minutes[minutes.length - 1];
  const isLive = now >= first - 30 && now <= last + 30;
  const nextIndex = minutes.findIndex((m) => m > now);
  const next = nextIndex === -1 ? null : plan.timeline[nextIndex];

  if (!isLive || !next) {
    return (
      <Card size="flush" className="zn-rs-block">
        <FieldLabel>{t("raceDay.notToday")}</FieldLabel>
        <p className="zn-rs-next__note">
          {t("raceDay.startsAt", { time: plan.timeline[0].time })}
        </p>
      </Card>
    );
  }

  const inMin = minutes[nextIndex] - now;

  return (
    <Card size="flush" className="zn-rs-block zn-rs-next">
      <div
        className="zn-row zn-row--split zn-row--baseline"
        style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
      >
        <FieldLabel className="zn-accent">{t("raceDay.nextUp")}</FieldLabel>
        <span className="zn-rs-next__clock">{minutesToTime(now)}</span>
      </div>
      <p className="zn-rs-next__when">
        <span className="zn-rs-next__figure">{next.time}</span>
        <span className="zn-rs-next__in">{formatCountdown(inMin, t)}</span>
      </p>
      <p className="zn-rs-next__label">{pick(next, "label")}</p>
    </Card>
  );
}

function formatCountdown(
  minutes: number,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (minutes <= 0) return t("raceDay.inNow");
  if (minutes < 60) return t("raceDay.inMin", { min: minutes });
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0
    ? t("raceDay.inH", { h })
    : t("raceDay.inHM", { h, min: m });
}
