import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Answer, formatDecimal, NextSteps, Provenance, StepChrono, StepField, ToolHeader } from "@/components/calc";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Stamp } from "@/components/ui/stamp";
import { toast } from "@/components/ui/toast";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { SEOHead } from "@/components/seo";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { useJustChanged } from "@/hooks/useJustChanged";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { hmsParamsToSeconds, secondsToHmsParams } from "@/lib/paceFields";
import { calculatePaceZones, saveUserZonePrefs } from "@/lib/zones";
import { loadRunnerProfile, updateBaseData } from "@/lib/runnerProfile";
import { enduranceIndexFor, equivalentRaceMinutes, predictRaceMinutes, sustainableVmaFraction, vmaFromRaceTime } from "@/lib/racePerformance";
import type { PerformanceReferences } from "@/types/runner-profile";
import "@/styles/components/calc-chrono.css";

const DISTANCES = [
  { id: "5k", km: 5, reference: "5K" },
  { id: "10k", km: 10, reference: "10K" },
  { id: "semi", km: 21.1, reference: "semi" },
  { id: "marathon", km: 42.195, reference: "marathon" },
] as const;
const ENDURANCE = enduranceIndexFor("intermediate");

// Round the whole duration first so a carried second never appears as :60.
function formatTime(seconds: number): string {
  const { h, m, s } = secondsToHmsParams(seconds);
  return Number(h) > 0 ? `${h}:${m.padStart(2, "0")}:${s.padStart(2, "0")}` : `${m}:${s.padStart(2, "0")}`;
}
function threshold(vma: number): string {
  const z4 = calculatePaceZones(vma).find((zone) => zone.zone === 4)!;
  return `${formatTime(z4.paceMinPerKm! * 60)}-${formatTime(z4.paceMaxPerKm! * 60)}`;
}

export function VmaCalculatorPage() {
  const { t, i18n } = useTranslation("calculators");
  const [params] = useSearchParams();
  const { numbers, ready, refresh } = useMyNumbers();
  const { settings } = useSettings();
  const validId = (id: string | null) => DISTANCES.some((d) => d.id === id) || id === "custom" ? id! : "10k";
  const [distanceId, setDistanceId] = useState(() => validId(params.get("d")));
  const [customKm, setCustomKm] = useState<number | undefined>(() => {
    const km = Number(params.get("km"));
    return Number.isFinite(km) && km > 0 && km <= 1000 ? km : undefined;
  });
  const selected = DISTANCES.find((distance) => distance.id === distanceId);
  const distanceKm = distanceId === "custom" ? customKm : selected?.km;
  const inputKey = `${distanceId}:${distanceKm ?? ""}`;
  const [references, setReferences] = useState<PerformanceReferences>();
  const [input, setInput] = useState<{ key: string; seconds?: number }>(() => {
    const seconds = hmsParamsToSeconds(params.get("h"), params.get("m"), params.get("s"));
    return { key: seconds > 0 ? inputKey : "", seconds: seconds > 0 ? seconds : undefined };
  });
  useEffect(() => {
    setReferences(loadRunnerProfile()?.performanceReferences ?? {});
  }, []);
  useEffect(() => {
    if (!ready || references === undefined) return;
    setInput((current) => {
      // Preserve edits, including an explicitly cleared field, on refresh.
      if (current.key === inputKey) return current;
      const reference = selected && references[selected.reference]?.totalSeconds;
      const predicted = numbers.vma && distanceKm ? predictRaceMinutes(numbers.vma, distanceKm, ENDURANCE) * 60 : undefined;
      const seconds = reference && Number.isFinite(reference) && reference > 0 ? reference : predicted;
      return { key: inputKey, seconds: seconds && seconds > 0 ? Math.round(seconds) : undefined };
    });
  }, [ready, references, inputKey, selected, distanceKm, numbers.vma]);

  const seconds = input.key === inputKey ? input.seconds : undefined;
  const valid = !!seconds && seconds > 0 && seconds <= 24 * 3600 && !!distanceKm && distanceKm > 0;
  const rawVma = valid ? vmaFromRaceTime(distanceKm!, seconds! / 60, ENDURANCE) : 0;
  const estimated = Number.isFinite(rawVma) && rawVma >= 4 && rawVma <= 35 ? Math.round(rawVma * 10) / 10 : undefined;
  const currentVma = numbers.vma === undefined ? undefined : Math.round(numbers.vma * 10) / 10;
  const same = estimated !== undefined && currentVma === estimated;
  const changed = useJustChanged<number | undefined>(ready && references !== undefined ? [["vma", currentVma]] : [], (_before, after) => after !== undefined);
  const justDone = changed.keys.has("vma");
  const decimal = (value: number) => formatDecimal(value, 1, i18n.language);
  const distanceLabel = distanceId === "custom" ? `${formatDecimal(distanceKm ?? 0, 3, i18n.language).replace(/[.,]?0+$/, "")} km` : t(`tools.chrono.distances.${distanceId}`);
  const time = formatTime(seconds ?? 0);
  const comparison = currentVma === undefined
    ? t("tools.chrono.noVma")
    : same
      ? t("tools.chrono.equalVma", { vma: decimal(currentVma) })
      : t(estimated! > currentVma ? "tools.chrono.aboveVma" : "tools.chrono.belowVma", { delta: decimal(Math.abs(estimated! - currentVma)), vma: decimal(currentVma) });
  const rows = [...DISTANCES.map((d) => ({ id: d.id as string, km: d.km as number })), ...(distanceId === "custom" && distanceKm ? [{ id: "custom", km: distanceKm }] : [])];
  const pace = (duration: number, km: number) => formatTime(duration / km);
  const save = () => {
    if (estimated === undefined || same) return;
    const saved = updateBaseData({ vma: estimated });
    if (!saved.ok) {
      toast.failure(t("profile:base.saveFailed"), saved);
      return;
    }
    try {
      saveUserZonePrefs({ vma: estimated });
    } catch (error) {
      toast.failure(t("profile:base.saveFailed"), error);
      return;
    }
    refresh();
  };
  const sharedParams = { d: distanceId, km: distanceId === "custom" ? distanceKm : undefined, ...secondsToHmsParams(seconds ?? 0) };
  const splitsParams = new URLSearchParams({ d: distanceId === "custom" ? "custom" : String(distanceKm), ...secondsToHmsParams(seconds ?? 0) });
  if (distanceId === "custom" && distanceKm) splitsParams.set("km", String(distanceKm));

  return (
    <>
      <SEOHead title={t("tools.chrono.seoTitle")} description={t("tools.chrono.seoDescription")} canonical="/calculators/vma" jsonLd={[
        { "@type": "WebApplication", name: t("tools.chrono.seoAppName"), description: t("tools.chrono.seoDescription"), url: "https://zoned.run/calculators/vma", applicationCategory: "SportsApplication" },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: t("tools.chrono.home"), item: "https://zoned.run/" },
          { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
          { "@type": "ListItem", position: 3, name: t("tools.chrono.title") },
        ] },
      ]} />
      <div className="zn-calc">
        <ToolHeader kicker={t("tools.chrono.kicker")} title={t("tools.chrono.title")} />
        <div className="zn-calc-fields">
          <div className="zn-calc-field zn-chrono-distance">
            <span className="zn-calc-field__label">{t("tools.chrono.distance")}</span>
            <Segmented className="zn-chrono-distances" value={distanceId} onChange={setDistanceId} label={t("tools.chrono.distance")} options={[...DISTANCES.map((d) => ({ value: d.id as string, label: t(`tools.chrono.distances.${d.id}`) })), { value: "custom", label: t("tools.chrono.distances.custom") }]} />
          </div>
          {distanceId === "custom" && <StepField label={t("tools.chrono.customDistance")} value={customKm} onChange={setCustomKm} min={0.1} max={1000} step={0.1} decimals={3} unit="km" />}
          <div>
            <StepChrono label={t("tools.chrono.chrono")} format="hms" size="lg" step={5} distanceKm={distanceKm} value={seconds} onChange={(value) => setInput({ key: inputKey, seconds: value })} />
            {valid && <p className="zn-calc-hint">{t("tools.chrono.paceHint", { pace: pace(seconds!, distanceKm!) })}{settings.unitSystem === "imperial" && ` · ${formatTime(convertPace(seconds! / 60 / distanceKm!, "imperial") * 60)} ${getPaceUnit("imperial")}`}</p>}
          </div>
        </div>
        {estimated !== undefined && <>
          <Answer label={t("tools.chrono.estimatedVma")} value={decimal(estimated)} unit="km/h">
            <p className="zn-calc-answer__say">{t("tools.chrono.say", { time, percent: Math.round(sustainableVmaFraction(seconds! / 60, ENDURANCE) * 100) })} {comparison}</p>
            <div className="zn-chrono-adopt" data-just-done={justDone || undefined}>
              {!same && <div className="zn-calc-answer__actions"><Button onClick={save} disabled={estimated < 8 || estimated > 30}>{t("tools.chrono.takeVma", { vma: decimal(estimated) })}</Button></div>}
              <p className="zn-calc-hint" aria-live="polite">{same
                ? t("tools.chrono.zonesSaved", { next: threshold(estimated) })
                : currentVma === undefined
                  ? t("tools.chrono.zonesNew", { next: threshold(estimated) })
                  : t("tools.chrono.zonesChange", { before: threshold(currentVma), next: threshold(estimated) })}</p>
              {(estimated < 8 || estimated > 30) && <p className="zn-calc-hint">{t("tools.chrono.unsavable")}</p>}
              {justDone && <Stamp onDone={() => changed.clear("vma")} />}
            </div>
          </Answer>
          <section className="zn-calc-section">
            <h2 className="zn-calc-h2">{t("tools.chrono.elsewhere")}</h2>
            <div className="zn-calc-tablebox"><table className="zn-calc-table">
              <thead><tr><th scope="col">{t("tools.chrono.distance")}</th><th scope="col">{t("tools.chrono.time")}</th><th scope="col">{t("tools.chrono.pace")}</th></tr></thead>
              <tbody>{rows.map((row) => {
                const reference = row.id === distanceId;
                const duration = reference ? seconds! : equivalentRaceMinutes(distanceKm!, seconds! / 60, row.km, ENDURANCE) * 60;
                return <tr key={row.id} data-ref={reference || undefined}>
                  <th scope="row">{row.id === "custom" ? distanceLabel : t(`tools.chrono.distances.${row.id}`)}{reference && ` · ${t("tools.chrono.yourChrono")}`}</th>
                  <td>{formatTime(duration)}</td><td>{pace(duration, row.km)}</td>
                </tr>;
              })}</tbody>
            </table></div>
          </section>
        </>}
        <Provenance><p>{t("tools.chrono.provenance")}</p></Provenance>
        {estimated !== undefined && <NextSteps links={[
          { to: `/calculators/splits?${splitsParams}`, label: t("tools.chrono.nextSplits", { distance: distanceLabel, time }) },
          { to: `/calculators/zones?vma=${estimated}`, label: t("tools.chrono.nextZones", { vma: decimal(estimated) }) },
        ]} />}
        <ShareLinkButton buildUrl={() => buildParamsUrl("/calculators/vma", sharedParams)} title={t("tools.chrono.title")} disabled={!valid} />
      </div>
    </>
  );
}
