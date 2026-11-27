import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "@/components/icons";
import { Stamp } from "@/components/ui/stamp";
import { useJustChanged } from "@/hooks/useJustChanged";
import { useWakeLock } from "@/hooks/useWakeLock";
import { getDateLocale, usePickLang } from "@/lib/i18n-utils";
import { formatPaceDisplay } from "@/lib/splits";
import type { RacePlan } from "@/lib/raceSimulator";
import { dayState, dayStepsFromPlan, hmToMinutes, isRaceToday, minutesToHm, type DayStep } from "@/lib/raceDay";
import { isoDateOnly } from "@/lib/planDates";
import { daysBetween } from "@/lib/myNumbers";
import { useNowMinutes } from "./useNowMinutes";

function useStepText(plan: RacePlan, isTrail: boolean) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();
  const start = hmToMinutes(plan.startTime);
  const avg = formatPaceDisplay(plan.targetTimeSeconds / 60 / plan.distanceKm);
  const sip = start - 15;
  return (step: DayStep, next?: DayStep) => {
    const title = t(`day.steps.${step.kind}.title`);
    let detail =
      step.kind === "breakfast"
        ? pick(plan.breakfast, "description")
        : step.kind === "drills"
          ? (step.exercises ?? []).map((e) => pick(e, "name")).join(", ")
          : t(isTrail && step.kind === "strides" ? "day.steps.strides.detailTrail" : `day.steps.${step.kind}.detail`, { pace: avg });
    // The last sip of water falls inside the warm-up: say it on that step.
    if (step.at <= sip && (next?.at ?? Infinity) > sip && step.kind !== "race") {
      detail = `${detail} ${t("day.lastSip", { time: minutesToHm(sip) })}`;
    }
    return { title, detail };
  };
}

/**
 * Jour J. Le jour de la course, l'horloge est la vraie et l'écran reste
 * allumé. Les autres jours, c'est une répétition : un encadré le dit et un
 * curseur fait parcourir la journée. L'heure réelle n'est jamais présentée
 * comme maintenant hors du jour de la course.
 */
export function RaceDayNow({
  plan,
  raceDate,
  isTrail,
  done,
  onToggleDone,
}: {
  plan: RacePlan;
  raceDate?: string;
  isTrail: boolean;
  done: Record<string, boolean>;
  onToggleDone: (key: string) => void;
}) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();
  const steps = useMemo(() => dayStepsFromPlan(plan), [plan]);
  const todayIso = isoDateOnly(new Date());
  const live = isRaceToday(raceDate, todayIso);
  const clock = useNowMinutes();
  const [rehearsal, setRehearsal] = useState(() => steps[0]?.at ?? 0);
  const now = live ? clock : rehearsal;
  useWakeLock(live);

  const state = dayState(steps, isTrail ? { ...plan, splits: [] } : plan, now);
  const text = useStepText(plan, isTrail);
  const current = state.index >= 0 ? steps[state.index] : undefined;
  const nextStep = state.next >= 0 ? steps[state.next] : undefined;
  const doneKey = (i: number) => `day:${i}`;
  const isDone = state.index >= 0 && !!done[doneKey(state.index)];

  // Geste : l'étape vient d'être cochée. Le tampon, une seule fois.
  const stamped = useJustChanged(
    state.index >= 0 ? [[doneKey(state.index), isDone] as const] : [],
    (prev, next) => !prev && next,
  );

  // L'étape change : l'ancienne carte sort vers le haut, la suivante monte.
  const [leaving, setLeaving] = useState<{ index: number; title: string; window: string } | null>(null);
  const shown = useRef<{ index: number; title: string; window: string } | null>(null);
  const [entering, setEntering] = useState(false);

  let nowTitle = t("day.notStarted");
  let nowDetail = nextStep ? t("day.startsAt", { time: minutesToHm(nextStep.at) }) : "";
  let nowLeft = "";
  if (current) {
    const s = text(current, nextStep);
    nowTitle = s.title;
    nowDetail = s.detail;
    nowLeft = nextStep ? t("day.left", { count: state.remaining }) : t("day.over");
    if (state.race) {
      const r = state.race;
      nowTitle = t("day.kmNow", { km: r.km + 1, pace: formatPaceDisplay(r.paceMinPerKm) });
      nowDetail = r.cueIndex >= 0 ? pick(plan.mentalCues[r.cueIndex], "text") : "";
      nowLeft = t("day.passage", { km: r.km + 1, time: minutesToHm(r.passageAt) });
    }
  }
  const windowLabel = current ? `${minutesToHm(state.from)} → ${minutesToHm(state.to)}` : "";

  useLayoutEffect(() => {
    const prev = shown.current;
    const cur = { index: state.index, title: nowTitle, window: windowLabel };
    shown.current = cur;
    if (prev && prev.index !== state.index) {
      setLeaving(prev);
      setEntering(true);
    }
  }, [state.index, nowTitle, windowLabel]);

  const days = raceDate ? daysBetween(todayIso, raceDate) : undefined;
  const raceDayLabel = raceDate
    ? new Date(`${raceDate}T12:00:00`).toLocaleDateString(getDateLocale(), {
        day: "numeric",
        month: "long",
      })
    : "";
  const first = steps[0]?.at ?? 0;
  const last = steps[steps.length - 1]?.at ?? 0;

  return (
    <div className="zn-rs-now">
      {!live && (
        <div className="zn-rs-now__rehearsal">
          <p>
            <b>{t("day.rehearsal")}</b>{" "}
            {days !== undefined && days > 0
              ? t("day.rehearsalIn", { count: days, date: raceDayLabel })
              : t("day.rehearsalNoDate")}
          </p>
          <label className="zn-rs-now__clock" htmlFor="rs-clock">
            <span className="zn-kicker">{t("day.itIs")}</span>
            <span className="zn-rs-now__clockvalue">{minutesToHm(rehearsal)}</span>
          </label>
          <input
            id="rs-clock"
            type="range"
            min={first - 30}
            max={last + 30}
            step={1}
            value={rehearsal}
            onChange={(e) => setRehearsal(Number(e.target.value))}
            aria-valuetext={minutesToHm(rehearsal)}
          />
        </div>
      )}

      <div className="zn-rs-now__stage">
        {leaving && (
          <div className="zn-rs-now__card" data-leaving aria-hidden="true" onAnimationEnd={() => setLeaving(null)}>
            <p className="zn-kicker">
              {t("day.now")} · {leaving.window}
            </p>
            <p className="zn-rs-now__title">{leaving.title}</p>
          </div>
        )}
        <section
          className="zn-rs-now__card"
          aria-live="polite"
          aria-label={t("day.now")}
          data-entering={entering || undefined}
          onAnimationEnd={(e) => e.target === e.currentTarget && setEntering(false)}
        >
          <p className="zn-kicker">
            {t("day.now")}
            {windowLabel && ` · ${windowLabel}`}
          </p>
          <h2 className="zn-rs-now__title">{nowTitle}</h2>
          {nowDetail && <p className="zn-rs-now__detail">{nowDetail}</p>}
          {current && (
            <>
              <div className="zn-rs-now__bar" aria-hidden="true">
                <span style={{ transform: `scaleX(${state.progress})` }} />
              </div>
              <div className="zn-rs-now__foot">
                <span className="zn-mono">{nowLeft}</span>
                <button
                  type="button"
                  className="zn-rs-now__done"
                  aria-pressed={isDone}
                  data-just-done={stamped.keys.has(doneKey(state.index)) || undefined}
                  onClick={() => onToggleDone(doneKey(state.index))}
                >
                  <Check size={18} />
                  {isDone ? t("day.doneDone") : t("day.done")}
                  {stamped.keys.has(doneKey(state.index)) && (
                    <Stamp onDone={() => stamped.clear(doneKey(state.index))} />
                  )}
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="zn-rs-now__next" aria-label={t("day.next")}>
        <p className="zn-kicker">
          {t("day.next")} · {nextStep ? minutesToHm(nextStep.at) : "-"}
        </p>
        <p className="zn-rs-now__nexttitle">{nextStep ? text(nextStep).title : t("day.nothingElse")}</p>
        {nextStep && <p className="zn-mono zn-muted">{t("day.inMin", { count: state.minutesToNext })}</p>}
      </section>

      <h2 className="zn-calc-h2">{t("day.list")}</h2>
      <ol className="zn-rs-now__list">
        {steps.map((s, i) => (
          <li
            key={`${s.kind}-${i}`}
            data-current={i === state.index || undefined}
            data-past={i < state.index || undefined}
            data-done={done[doneKey(i)] || undefined}
          >
            <span className="zn-mono">{minutesToHm(s.at)}</span>
            <span>{text(s).title}</span>
            <span className="zn-rs-now__mark" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </div>
  );
}
