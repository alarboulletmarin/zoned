import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { Answer, NextSteps, Provenance, StepChrono, StepField, ToolHeader, Wristband, printWristband } from "@/components/calc";
import { SEOHead } from "@/components/seo";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { generateSplits, formatSplitTime as formatTime, formatPaceDisplay } from "@/lib/splits";
import type { SplitStrategy } from "@/lib/splits";
import { hmsParamsToSeconds, secondsToHmsParams } from "@/lib/paceFields";

const DISTANCES = ["5", "10", "21.1", "42.195"];

function readStart(raw: string | null): number | undefined {
  if (!raw || !/^\d{4}$/.test(raw)) return undefined;
  const h = Number(raw.slice(0, 2));
  const m = Number(raw.slice(2));
  return h < 24 && m < 60 ? h * 60 + m : undefined;
}

function startParam(minutes: number | undefined): string | undefined {
  if (minutes === undefined) return undefined;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}${String(minutes % 60).padStart(2, "0")}`;
}

function clockTime(seconds: number): string {
  const total = Math.round(seconds) % 86400;
  return `${String(Math.floor(total / 3600)).padStart(2, "0")}:${String(Math.floor(total % 3600 / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function SplitGeneratorPage() {
  const { t, i18n } = useTranslation("calculators");
  const { numbers } = useMyNumbers();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const hasSharedInput = ["d", "km", "h", "m", "s"].some((key) => searchParams.has(key));
  const planRace = hasSharedInput ? undefined : numbers.races.find((race) => !race.isTrail && (race.targetSeconds ?? 0) > 0);
  const sharedDistance = searchParams.get("d");
  const initialDistance = sharedDistance === "custom" || (sharedDistance && DISTANCES.includes(sharedDistance))
    ? sharedDistance : searchParams.has("km") ? "custom" : undefined;
  // Undefined edits continue to follow the plan while the storage hook hydrates.
  const [distanceEdit, setDistanceEdit] = useState<string | undefined>(initialDistance);
  const [kmEdit, setKmEdit] = useState<number | undefined>(() => {
    const value = Number(searchParams.get("km")?.replace(",", "."));
    return value >= 0.001 && value <= 200 ? value : undefined;
  });
  const [goalEdit, setGoalEdit] = useState<number | undefined | null>(() => {
    if (!["h", "m", "s"].some((key) => searchParams.has(key))) return null;
    return hmsParamsToSeconds(searchParams.get("h"), searchParams.get("m"), searchParams.get("s")) || undefined;
  });
  const [strategy, setStrategy] = useState<SplitStrategy>(() => {
    const value = searchParams.get("strat");
    return value === "negative" || value === "positive" ? value : "even";
  });
  const [start, setStart] = useState(() => readStart(searchParams.get("start")));
  const [edited, setEdited] = useState(false);
  const [animate, setAnimate] = useState(false);
  const markEdit = () => { setEdited(true); setAnimate(true); };
  const selectedDistance = distanceEdit ?? (planRace ? DISTANCES.includes(String(planRace.distanceKm)) ? String(planRace.distanceKm) : "custom" : "10");
  const distanceKm = selectedDistance === "custom" ? kmEdit ?? (distanceEdit === undefined ? planRace?.distanceKm : undefined) ?? 0 : Number(selectedDistance);
  const goal = goalEdit === null ? planRace?.targetSeconds : goalEdit;
  const valid = Number.isFinite(distanceKm) && distanceKm > 0 && distanceKm <= 200 && goal !== undefined && Number.isFinite(goal) && goal > 0;
  const splits = useMemo(() => valid ? generateSplits(distanceKm, goal!, strategy) : [], [valid, distanceKm, goal, strategy]);
  const number = (value: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 3 }).format(value);
  const rows = splits.map((split, index) => ({
    km: number(index === splits.length - 1 ? distanceKm : split.index),
    split: formatTime(split.splitTimeSeconds),
    passage: formatTime(split.cumulativeTimeSeconds),
  }));
  const first = splits[0];
  const last = splits.at(-1);
  // Integrate the actual splits up to half the distance, including a partial split.
  let remaining = distanceKm / 2;
  let halfway = 0;
  for (const split of splits) {
    const km = Math.min(remaining, split.distance);
    halfway += km * split.paceMinPerKm * 60;
    remaining -= km;
    if (remaining <= 0) break;
  }
  const summary = first && last ? t(`tools.splits.${strategy === "even" ? "summaryEven" : "summary"}`, {
    first: formatPaceDisplay(first.paceMinPerKm), last: formatPaceDisplay(last.paceMinPerKm), halfway: formatTime(halfway),
  }) : t("tools.splits.empty");
  const hms = secondsToHmsParams(goal ?? 0);
  const startValue = startParam(start);
  const params = { km: String(distanceKm), ...hms, strat: strategy, ...(startValue ? { start: startValue } : {}) };
  const fromPlan = planRace && !edited ? planRace : undefined;
  const simulatorUrl = fromPlan ? `/race-simulator?race=${encodeURIComponent(fromPlan.key)}` : `/race-simulator?${new URLSearchParams(params)}`;
  const fastest = splits.length ? Math.min(...splits.map((split) => split.paceMinPerKm)) : 1;

  return (
    <>
      <SEOHead
        title={t("calculateurs.splits.seoTitle")}
        description={t("calculateurs.splits.seoDescription")}
        canonical="/calculators/splits"
        jsonLd={[
          { "@type": "WebApplication", name: t("calculateurs.splits.seoAppName"), description: t("calculateurs.splits.seoAppDescription"), url: "https://zoned.run/calculators/splits", applicationCategory: "SportsApplication" },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: t("tools.splits.home"), item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
            { "@type": "ListItem", position: 3, name: t("calculateurs.splits.seoBreadcrumb") },
          ] },
        ]}
      />
      <div className="zn-calc zn-splits">
        <ToolHeader kicker={t("tools.splits.kicker")} title={t("tools.splits.title")} />
        <div className="zn-calc-fields">
          <div className="zn-calc-field">
            <label className="zn-calc-field__label" htmlFor="splits-distance">{t("tools.splits.distance")}</label>
            <select id="splits-distance" className="zn-splits__select" value={selectedDistance} onChange={(event) => { markEdit(); setDistanceEdit(event.target.value); if (event.target.value === "custom") setKmEdit(distanceKm); }}>
              {DISTANCES.map((distance) => <option key={distance} value={distance}>{distance === "21.1" ? t("tools.splits.half") : distance === "42.195" ? t("tools.splits.marathon") : `${distance} km`}</option>)}
              <option value="custom">{t("tools.splits.custom")}</option>
            </select>
          </div>
          <StepChrono label={t("tools.splits.goal")} format="hms" value={goal} distanceKm={distanceKm} step={5} onChange={(value) => { markEdit(); setGoalEdit(value); }} />
          {selectedDistance === "custom" && <StepField label={t("tools.splits.customKm")} value={distanceKm || undefined} unit="km" min={0.001} max={200} step={0.1} decimals={3} onChange={(value) => { markEdit(); setKmEdit(value); setDistanceEdit("custom"); }} />}
        </div>
        {fromPlan && <p className="zn-calc-hint">{t("tools.splits.prefill", {
          distance: number(fromPlan.distanceKm), name: fromPlan.name ? ` ${fromPlan.name}` : "",
          date: new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "long" }).format(new Date(`${fromPlan.date}T12:00:00`)),
        })}</p>}
        <Segmented value={strategy} onChange={(value) => { setAnimate(true); setStrategy(value); }} label={t("tools.splits.strategy")} options={[
          { value: "even", label: t("tools.splits.even") }, { value: "negative", label: t("tools.splits.negative") }, { value: "positive", label: t("tools.splits.positive") },
        ]} />
        <Answer label={t("tools.splits.average")} value={valid ? formatPaceDisplay(goal! / distanceKm / 60) : t("kit.unset")} unit={valid ? "/km" : undefined}>
          <p className="zn-calc-answer__say">{summary}</p>
          {valid && settings.unitSystem === "imperial" && <p className="zn-calc-hint">{formatPaceDisplay(convertPace(goal! / distanceKm / 60, "imperial"))}{getPaceUnit("imperial")}</p>}
        </Answer>
        {valid && <>
          <div className="zn-splits__chart" role="img" aria-label={t("tools.splits.chart", { distance: number(distanceKm), summary })}>
            <div className="zn-splits__bars" data-animate={animate || undefined} aria-hidden="true">
              {splits.map((split, index) => <span key={split.index} className="zn-splits__bar" data-half={index < splits.length / 2 ? "first" : "second"} style={{ height: `${fastest / split.paceMinPerKm * 100}%` }} />)}
            </div>
            <div className="zn-splits__axis" aria-hidden="true"><span>km 1</span><span>{t("tools.splits.halfway")}</span><span>km {number(Math.ceil(distanceKm))}</span></div>
          </div>
        </>}
        <div className="zn-splits__start" data-midnight={start === 0 || undefined} onChange={(event) => {
          // The shared duration field treats zero as empty; a clock must keep midnight.
          const input = event.target;
          if (input instanceof HTMLInputElement && /^0+:?0*$/.test(input.value)) setStart(0);
        }}>
          <StepChrono label={t("tools.splits.start")} format="hm" value={start} step={1} min={0} max={1439} onChange={(value) => { setStart(value === undefined ? undefined : Math.max(0, Math.min(1439, value))); }} />
          <p className="zn-calc-hint">{start === undefined ? t("tools.splits.startHint") : t("tools.splits.startKnown", { time: clockTime(start * 60).slice(0, 5) })}</p>
        </div>
        {valid && <>
          <section className="zn-calc-section">
            <h2 className="zn-calc-h2">{t("tools.splits.passages")}</h2>
            <div className="zn-calc-tablebox"><table className="zn-calc-table">
              <thead><tr><th scope="col">{t("tools.splits.km")}</th><th scope="col">{t("tools.splits.split")}</th><th scope="col">{t("tools.splits.passage")}</th>{start !== undefined && <th scope="col">{t("tools.splits.clock")}</th>}</tr></thead>
              <tbody>{rows.map((row, index) => <tr key={row.km} data-ref={index === rows.length - 1 || undefined}>
                <th scope="row">{row.km}</th><td>{row.split}</td><td>{row.passage}</td>{start !== undefined && <td>{clockTime(start * 60 + splits[index].cumulativeTimeSeconds)}</td>}
              </tr>)}</tbody>
            </table></div>
          </section>
          <div className="zn-calc-answer__actions">
            <Button asChild><Link to={simulatorUrl}>{t("tools.splits.prepare")}</Link></Button>
            <Button variant="outline" onClick={printWristband}>{t("tools.splits.wristband")}</Button>
            <ShareLinkButton title={t("tools.splits.title")} buildUrl={() => buildParamsUrl("/calculators/splits", { d: selectedDistance, km: selectedDistance === "custom" ? distanceKm : undefined, ...hms, strat: strategy, start: startValue })} />
          </div>
          <Wristband title={`${t("tools.splits.title")} · ${number(distanceKm)} km · ${formatTime(goal!)}`} rows={rows} />
        </>}
        <Provenance><p>{t("tools.splits.provenance")}</p></Provenance>
        {valid && <NextSteps links={[{ to: simulatorUrl, label: t("tools.splits.prepare") }]} />}
      </div>
    </>
  );
}
