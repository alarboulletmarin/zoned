import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { SplitBars } from "@/components/calc";
import { getDateLocale, usePickLang } from "@/lib/i18n-utils";
import { formatPaceDisplay, formatSplitTime, type SplitStrategy } from "@/lib/splits";
import type { RacePlan } from "@/lib/raceSimulator";
import { hmToMinutes, minutesToHm, warmupBlocks } from "@/lib/raceDay";
import { Checklist } from "./Checklist";

export type ChapterId = "eve" | "morning" | "warmup" | "race" | "after";

export interface Chapter {
  id: ChapterId;
  /** Short name, for the chapter rail. */
  name: string;
  /** Mono time line above the title. */
  when: string;
  /** Time alone, for the rail beside the name. */
  at: string;
}

function eveDate(raceDate: string | undefined, _lang: string): string | undefined {
  if (!raceDate) return undefined;
  const d = new Date(`${raceDate}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString(getDateLocale(), { weekday: "long", day: "numeric" });
}

/** The five chapters of the day, shared by the document and its rail. */
export function useChapters(plan: RacePlan, raceDate: string | undefined): Chapter[] {
  const { t, i18n } = useTranslation("simulator");
  const start = hmToMinutes(plan.startTime);
  const finish = start + Math.ceil(plan.targetTimeSeconds / 60);
  const warm = hmToMinutes(plan.warmupStartTime);
  const eve = eveDate(raceDate, i18n.language);
  return [
    { id: "eve", name: t("doc.eve.name"), when: eve ?? t("doc.eve.dayBefore"), at: eve ?? t("doc.eve.dayBefore") },
    { id: "morning", name: t("doc.morning.name"), when: `${minutesToHm(hmToMinutes(plan.wakeUpTime))} → ${minutesToHm(warm)}`, at: minutesToHm(hmToMinutes(plan.wakeUpTime)) },
    { id: "warmup", name: t("doc.warmup.name"), when: `${minutesToHm(warm)} → ${minutesToHm(warm + plan.warmupDurationMin)}`, at: minutesToHm(warm) },
    { id: "race", name: t("doc.race.name"), when: `${minutesToHm(start)} → ${minutesToHm(finish)}`, at: minutesToHm(start) },
    { id: "after", name: t("doc.after.name"), when: `${minutesToHm(finish)} →`, at: minutesToHm(finish) },
  ];
}

/** "3:59", the way the race pages print a pace. */
const pace = (minPerKm: number) => formatPaceDisplay(minPerKm);

export function raceTitle(plan: RacePlan, strategy: SplitStrategy, isTrail: boolean, t: TFunction<"simulator">) {
  if (isTrail || plan.splits.length === 0) return t("doc.race.titleTrail", { time: formatSplitTime(plan.targetTimeSeconds) });
  const first = plan.splits[0].paceMinPerKm;
  const last = plan.splits[plan.splits.length - 1].paceMinPerKm;
  if (strategy === "even" || Math.abs(first - last) < 1 / 120) {
    return t("doc.race.titleEven", { pace: pace(plan.targetTimeSeconds / 60 / plan.distanceKm) });
  }
  return t("doc.race.titleSplit", { first: pace(first), last: pace(last) });
}

export function fuelLine(plan: RacePlan, t: TFunction<"simulator">): string {
  const f = plan.fuelingPlan;
  if (f.carbsPerHourG > 0) {
    return t("doc.race.fuel", {
      carbs: f.carbsPerHourG,
      gels: f.gelCount,
      every: f.gelFrequencyMin,
      fluid: f.fluidMlPerHour,
    });
  }
  return t("doc.race.fuelWater", { minutes: Math.round(plan.targetTimeSeconds / 60) });
}

/** KM / SPLIT / PASSAGE / HEURE, the table of the right column and of the race chapter. */
export function PassagesTable({ plan, compact }: { plan: RacePlan; compact?: boolean }) {
  const { t, i18n } = useTranslation("simulator");
  const start = hmToMinutes(plan.startTime);
  const num = (n: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 3 }).format(n);
  return (
    <div className="zn-calc-tablebox">
      <table className="zn-calc-table zn-rs-passages">
        <thead>
          <tr>
            <th scope="col">{t("doc.table.km")}</th>
            <th scope="col">{t("doc.table.split")}</th>
            {!compact && <th scope="col">{t("doc.table.passage")}</th>}
            <th scope="col">{t("doc.table.clock")}</th>
          </tr>
        </thead>
        <tbody>
          {plan.splits.map((s, i) => (
            <tr key={s.index}>
              <th scope="row">{num(i === plan.splits.length - 1 ? plan.distanceKm : s.index)}</th>
              <td>{formatSplitTime(s.splitTimeSeconds)}</td>
              {!compact && <td>{formatSplitTime(s.cumulativeTimeSeconds)}</td>}
              <td className="zn-calc-table__muted">{minutesToHm(start + s.cumulativeTimeSeconds / 60)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Préparer : la journée en un seul document chronologique, cinq chapitres
 * sur une ligne de temps verticale, chacun avec son horaire, un titre qui
 * dit l'intention et son contenu.
 */
export function RacePrepDocument({
  plan,
  chapters,
  strategy,
  isTrail,
  checked,
  onToggle,
}: {
  plan: RacePlan;
  chapters: Chapter[];
  strategy: SplitStrategy;
  isTrail: boolean;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const { t, i18n } = useTranslation("simulator");
  const pick = usePickLang();
  const by = Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<ChapterId, Chapter>;
  const start = hmToMinutes(plan.startTime);
  const blocks = warmupBlocks(plan);
  const durationMin = plan.targetTimeSeconds / 60;
  const recovery = plan.fuelingPlan.timeline.filter((cp) => cp.timeMin >= durationMin);
  const num = (n: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(n);
  const hasSplits = !isTrail && plan.splits.length > 0;
  const avg = pace(durationMin / plan.distanceKm);

  const head = (id: ChapterId, title: string) => (
    <>
      <span className="zn-rs-doc__dot" aria-hidden="true" />
      <p className="zn-rs-doc__when">
        {by[id].when} · {by[id].name}
      </p>
      <h2 className="zn-rs-doc__title">{title}</h2>
    </>
  );

  return (
    <ol className="zn-rs-doc">
      <li id="rs-eve" className="zn-rs-doc__chapter">
        {head("eve", t("doc.eve.title"))}
        <Checklist
          entries={plan.dayBeforeChecklist.map((item, i) => ({ key: `dayBefore:${i}`, text: pick(item, "text") }))}
          checked={checked}
          onToggle={onToggle}
        />
        {plan.raceDayChecklist.length > 0 && (
          <details className="zn-rs-doc__more">
            <summary>{t("doc.eve.bag", { count: plan.raceDayChecklist.length })}</summary>
            <Checklist
              entries={plan.raceDayChecklist.map((item, i) => ({ key: `packing:${i}`, text: pick(item, "text") }))}
              checked={checked}
              onToggle={onToggle}
            />
          </details>
        )}
      </li>

      <li id="rs-morning" className="zn-rs-doc__chapter">
        {head("morning", t("doc.morning.title"))}
        <dl className="zn-rs-doc__times">
          <dt>{minutesToHm(hmToMinutes(plan.wakeUpTime))}</dt>
          <dd>{t("doc.morning.wake")}</dd>
          <dt>{minutesToHm(hmToMinutes(plan.breakfastTime))}</dt>
          <dd>
            {t("doc.morning.breakfast")}
            <span className="zn-rs-doc__aside">{pick(plan.breakfast, "description")}</span>
          </dd>
          <dt>{minutesToHm(start - 60)}</dt>
          <dd>{t("doc.morning.venue")}</dd>
        </dl>
      </li>

      <li id="rs-warmup" className="zn-rs-doc__chapter">
        {head("warmup", t("doc.warmup.title", { minutes: plan.warmupDurationMin, count: blocks.length }))}
        <dl className="zn-rs-doc__times">
          {blocks.map((b) => (
            <div key={b.kind} className="zn-rs-doc__row">
              <dt>{minutesToHm(b.at)}</dt>
              <dd>
                {b.kind === "drills"
                  ? t("doc.warmup.drills", { list: b.exercises.map((e) => pick(e, "name")).join(", ") })
                  : t(isTrail && b.kind === "strides" ? "doc.warmup.stridesTrail" : `doc.warmup.${b.kind}`, { pace: avg })}
              </dd>
              <dd className="zn-rs-doc__dur">{t("doc.minutes", { count: b.minutes })}</dd>
            </div>
          ))}
        </dl>
      </li>

      <li id="rs-race" className="zn-rs-doc__chapter">
        {head("race", raceTitle(plan, strategy, isTrail, t))}
        {hasSplits ? (
          <>
            <SplitBars
              paces={plan.splits.map((s) => s.paceMinPerKm)}
              label={t("doc.race.chart", {
                first: pace(plan.splits[0].paceMinPerKm),
                last: pace(plan.splits[plan.splits.length - 1].paceMinPerKm),
              })}
              axis={["km 1", t("doc.race.halfway"), `km ${Math.ceil(plan.distanceKm)}`]}
            />
            <dl className="zn-rs-doc__cues">
              {plan.mentalCues.map((c, i) => (
                <div key={i} className="zn-rs-doc__row">
                  <dt>
                    {num(c.fromKm)}-{num(c.toKm)} km
                  </dt>
                  <dd>{pick(c, "text")}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="zn-rs-doc__note">{t("doc.race.trailSoon")}</p>
        )}
        <p className="zn-rs-doc__line">{fuelLine(plan, t)}</p>
        {hasSplits && (
          <details className="zn-rs-doc__more zn-rs-doc__passages">
            <summary>{t("doc.race.passages", { count: plan.splits.length })}</summary>
            <PassagesTable plan={plan} />
          </details>
        )}
      </li>

      <li id="rs-after" className="zn-rs-doc__chapter">
        {head("after", t("doc.after.title"))}
        {recovery.length > 0 ? (
          <ul className="zn-rs-doc__list">
            {recovery.map((cp, i) => (
              <li key={i}>{pick(cp, "action")}</li>
            ))}
          </ul>
        ) : (
          <p className="zn-rs-doc__line">{t("doc.after.body")}</p>
        )}
      </li>
    </ol>
  );
}
