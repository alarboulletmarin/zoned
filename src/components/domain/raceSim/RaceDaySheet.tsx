import { useTranslation } from "react-i18next";
import { Brain, Clock, Flame, Heart, Route, Utensils } from "@/components/icons";
import { Card } from "@/components/ui/card";
import type { RacePlan } from "@/lib/raceSimulator";
import { usePickLang } from "@/lib/i18n-utils";
import { formatPaceDisplay, formatSplitTime } from "@/lib/splits";
import { convertPace, getPaceUnit } from "@/lib/units";
import type { UnitSystem } from "@/types/settings";
import { cn } from "@/lib/utils";
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
    <div className="space-y-4">
      <NextUp plan={plan} />

      <Block icon={<Flame className="size-4" />} title={t("sections.warmup")}>
        <WarmupChecklist
          exercises={plan.warmupExercises}
          startTime={plan.warmupStartTime}
          totalDurationMin={plan.warmupDurationMin}
          checked={checked}
          onToggle={onToggle}
        />
      </Block>

      <Block icon={<Route className="size-4" />} title={t("sections.race")}>
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <Stat
            label={t("labels.targetPace")}
            value={
              <>
                {formatPaceDisplay(
                  convertPace(plan.targetTimeSeconds / 60 / plan.distanceKm, unit),
                )}
                <span className="text-sm font-normal text-muted-foreground">
                  {paceUnit}
                </span>
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

      <Block icon={<Brain className="size-4" />} title={t("sections.mental")}>
        <MentalCuesPanel cues={plan.mentalCues} />
      </Block>

      {inRaceFueling.length > 0 && (
        <Block
          icon={<Utensils className="size-4" />}
          title={t("sections.nutrition")}
        >
          <ul className="space-y-2">
            {inRaceFueling.map((cp, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-11 shrink-0 font-mono tabular-nums text-muted-foreground">
                  {minutesToTime(
                    timeToMinutes(plan.startTime) + Math.round(cp.timeMin),
                  )}
                </span>
                <span className="min-w-0 flex-1">{pick(cp, "action")}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {recovery.length > 0 && (
        <Block icon={<Heart className="size-4" />} title={t("sections.recovery")}>
          <ul className="space-y-2">
            {recovery.map((cp, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {pick(cp, "action")}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block icon={<Clock className="size-4" />} title={t("sections.timeline")}>
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
    <Card size="flush" className="px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
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
      <Card size="flush" className="px-5 py-4">
        <FieldLabel>{t("raceDay.notToday")}</FieldLabel>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("raceDay.startsAt", { time: plan.timeline[0].time })}
        </p>
      </Card>
    );
  }

  const inMin = minutes[nextIndex] - now;

  return (
    <Card
      size="flush"
      className={cn(
        "border-primary/40 bg-primary/5 px-5 py-4",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel className="text-primary">{t("raceDay.nextUp")}</FieldLabel>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {minutesToTime(now)}
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-3">
        <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
          {next.time}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatCountdown(inMin, t)}
        </span>
      </p>
      <p className="mt-1 text-base font-medium leading-snug">
        {pick(next, "label")}
      </p>
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
