import { useState, useMemo } from "react";
import { zoneClass } from "@/lib/zoneColors";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { ZONE_META, type ZoneNumber } from "@/types";
import { calculatePaceZones, loadUserZonePrefs } from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import {
  CalculatorHero,
  CalculatorPanel,
  CalculatorLabel,
  CalculatorChip,
  CalculatorChipGroup,
  CalculatorTimeField,
  CalculatorSidebar,
  CalculatorFormulaBox,
  CalculatorRelatedLinks,
  CalculatorEmptyResult,
} from "@/components/calculators";

/**
 * Standard race distances in km.
 */
const STANDARD_DISTANCES = [
  { id: "5k", label: "5K", labelEn: "5K", km: 5 },
  { id: "10k", label: "10K", labelEn: "10K", km: 10 },
  { id: "semi", label: "Semi-marathon", labelEn: "Half Marathon", km: 21.1 },
  { id: "marathon", label: "Marathon", labelEn: "Marathon", km: 42.195 },
] as const;

/**
 * Distance options for input select (includes custom).
 */
const DISTANCE_OPTIONS = [
  ...STANDARD_DISTANCES,
  { id: "custom", label: "Personnalisé", labelEn: "Custom", km: 0 },
] as const;

/**
 * Riegel formula: t2 = t1 * (d2 / d1) ^ exponent
 */
function riegel(t1Seconds: number, d1Km: number, d2Km: number, exponent: number): number {
  return t1Seconds * Math.pow(d2Km / d1Km, exponent);
}

/**
 * Selectable Riegel exponents. 1.06 is Riegel's published value and stays the
 * default; 1.04 suits well-trained runners whose endurance decays more slowly,
 * 1.08 fits speed-biased runners fading on long distances.
 */
const EXPONENTS = [1.04, 1.06, 1.08] as const;
const DEFAULT_EXPONENT = 1.06;

/** Parse the `e` share param, falling back to Riegel's own 1.06. */
function parseExponent(raw: string | null): number {
  const value = raw !== null ? parseFloat(raw) : NaN;
  return EXPONENTS.includes(value as (typeof EXPONENTS)[number]) ? value : DEFAULT_EXPONENT;
}

/**
 * Format total seconds as h:mm:ss or mm:ss.
 */
function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Format pace as mm:ss from decimal min/km.
 */
function formatPaceValue(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Find which training zone a pace falls in.
 * Returns the zone number (1-6) or null if no zones configured.
 */
function findZoneForPace(
  paceMinPerKm: number,
  paceZones: { zone: ZoneNumber; paceMinPerKm?: number; paceMaxPerKm?: number }[],
): ZoneNumber | null {
  for (const z of paceZones) {
    if (
      z.paceMinPerKm !== undefined &&
      z.paceMaxPerKm !== undefined &&
      paceMinPerKm >= z.paceMinPerKm &&
      paceMinPerKm <= z.paceMaxPerKm
    ) {
      return z.zone;
    }
  }
  return null;
}

export function RaceEquivalencePage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const isEnglish = useIsEnglish();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [searchParams] = useSearchParams();
  const [distanceId, setDistanceId] = useState<string>(
    () => searchParams.get("d") ?? "10k",
  );
  const [customKm, setCustomKm] = useState<string>(() => searchParams.get("km") ?? "");
  const [hours, setHours] = useState<string>(() => searchParams.get("h") ?? "");
  const [minutes, setMinutes] = useState<string>(() => searchParams.get("m") ?? "");
  const [seconds, setSeconds] = useState<string>(() => searchParams.get("s") ?? "");
  const [exponent, setExponent] = useState<number>(() => parseExponent(searchParams.get("e")));

  // Riegel's exponent is written with the locale's decimal separator.
  const formatExponent = (value: number) =>
    value.toFixed(2).replace(".", isEnglish ? "." : ",");

  // Resolve input distance in km
  const inputDistanceKm = useMemo(() => {
    if (distanceId === "custom") {
      const val = parseFloat(customKm);
      return Number.isFinite(val) && val > 0 ? val : 0;
    }
    const found = STANDARD_DISTANCES.find((d) => d.id === distanceId);
    return found ? found.km : 0;
  }, [distanceId, customKm]);

  // Parse time
  const parsedHours = hours !== "" ? parseInt(hours, 10) : 0;
  const parsedMinutes = minutes !== "" ? parseInt(minutes, 10) : 0;
  const parsedSeconds = seconds !== "" ? parseInt(seconds, 10) : 0;
  const totalSeconds = parsedHours * 3600 + parsedMinutes * 60 + parsedSeconds;
  const hasValidInput = totalSeconds > 0 && inputDistanceKm > 0;

  // Load user zone prefs for zone badge
  const paceZones = useMemo(() => {
    const prefs = loadUserZonePrefs();
    if (!prefs?.vma) return null;
    return calculatePaceZones(prefs.vma);
  }, []);

  // Calculate predictions
  const predictions = useMemo(() => {
    if (!hasValidInput) return null;
    return STANDARD_DISTANCES.map((d) => {
      const predictedSeconds = riegel(totalSeconds, inputDistanceKm, d.km, exponent);
      const paceMinPerKm = predictedSeconds / 60 / d.km;
      const zone = paceZones ? findZoneForPace(paceMinPerKm, paceZones) : null;
      return {
        ...d,
        predictedSeconds,
        paceMinPerKm,
        zone,
        isReference: distanceId !== "custom" && d.id === distanceId,
        // Beyond the half, Riegel's extrapolation error grows fast without
        // distance-specific endurance training — flagged rather than hidden.
        isExtrapolated: d.km > 21.1 && inputDistanceKm <= 21.1,
      };
    });
  }, [hasValidInput, totalSeconds, inputDistanceKm, distanceId, paceZones, exponent]);

  const maxPace = predictions
    ? Math.max(...predictions.map((p) => p.paceMinPerKm))
    : null;

  // Clamp numeric input
  const handleNumericInput = (
    value: string,
    setter: (v: string) => void,
    max: number,
  ) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    if (num > max) {
      setter(String(max));
      return;
    }
    setter(String(num));
  };

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.equivalence.seoTitle")}
        description={t("calculators:calculateurs.equivalence.seoDescription")}
        canonical="/calculators/equivalence"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.equivalence.seoAppName"),
            description: t("calculators:calculateurs.equivalence.seoAppDescription"),
            url: "https://zoned.run/calculators/equivalence",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.equivalence.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8">
        <CalculatorPanel className="p-0">
          {/* Header row — hero + reference performance inputs */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-5 sm:p-7 md:p-8 border-b-2 border-border">
            <CalculatorHero
              groupLabel={t("calculators:calculateurs.groups.performance")}
              title={t("calculators:calculateurs.equivalence.title")}
              description={t("calculators:calculateurs.equivalence.description")}
              className="mb-0"
            />

            <div className="shrink-0">
              <CalculatorLabel>{t("calculators:calculateurs.equivalence.referenceLabel")}</CalculatorLabel>
              <div className="flex items-end gap-3 mt-2.5">
                <div>
                  <select
                    id="distance"
                    value={distanceId}
                    onChange={(e) => setDistanceId(e.target.value)}
                    aria-label={t("calculators:calculateurs.equivalence.raceDistance")}
                    className="border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 font-mono text-2xl focus-visible:outline-none"
                  >
                    {DISTANCE_OPTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {pickLang(d, "label")}
                        {d.km > 0 ? ` (${d.km} km)` : ""}
                      </option>
                    ))}
                  </select>
                  {distanceId === "custom" && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        min={0.1}
                        step={0.1}
                        placeholder="km"
                        value={customKm}
                        onChange={(e) => setCustomKm(e.target.value)}
                        className="w-24 border-0 border-b-2 border-foreground bg-transparent px-1 py-1 font-mono text-sm tabular-nums focus-visible:outline-none"
                        aria-label={t("calculators:calculateurs.equivalence.customDistanceLabel")}
                      />
                      <span className="font-mono text-xs text-muted-foreground">km</span>
                    </div>
                  )}
                </div>
                <div className="flex items-end gap-1.5">
                  <CalculatorTimeField
                    value={hours}
                    onChange={(v) => handleNumericInput(v, setHours, 9)}
                    max={9}
                    placeholder="0"
                    unitLabel="h"
                    ariaLabel={t("calculators:calculateurs.equivalence.hours")}
                    className="w-11 sm:w-12"
                  />
                  <span className="pb-6 font-mono text-lg text-muted-foreground">:</span>
                  <CalculatorTimeField
                    value={minutes}
                    onChange={(v) => handleNumericInput(v, setMinutes, 59)}
                    max={59}
                    placeholder="00"
                    unitLabel="min"
                    ariaLabel="Minutes"
                    className="w-11 sm:w-12"
                  />
                  <span className="pb-6 font-mono text-lg text-muted-foreground">:</span>
                  <CalculatorTimeField
                    value={seconds}
                    onChange={(v) => handleNumericInput(v, setSeconds, 59)}
                    max={59}
                    placeholder="00"
                    unitLabel="sec"
                    ariaLabel={t("calculators:calculateurs.equivalence.seconds")}
                    className="w-11 sm:w-12"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px]">
            {/* ── Main column: table + chart ── */}
            <div className="p-5 sm:p-7 md:p-8">
              {!predictions && (
                <CalculatorEmptyResult hint={t("calculators:calculateurs.equivalence.emptyHint")} />
              )}

              {predictions && (
                <>
                  <div className="border-2 border-border/70 overflow-x-auto">
                    <table className="w-full text-left min-w-[560px]">
                      <thead>
                        <tr className="bg-ink text-paper font-mono text-[10px] tracking-[0.1em] uppercase">
                          <th className="px-3 py-2.5 font-normal">{t("calculators:calculateurs.equivalence.distanceCol")}</th>
                          <th className="px-3 py-2.5 font-normal">{t("calculators:calculateurs.equivalence.timeCol")}</th>
                          <th className="px-3 py-2.5 font-normal">{t("calculators:calculateurs.equivalence.paceCol")}</th>
                          {paceZones && (
                            <th className="px-3 py-2.5 font-normal">{t("calculators:calculateurs.equivalence.zoneCol")}</th>
                          )}
                          <th className="px-3 py-2.5 font-normal" />
                        </tr>
                      </thead>
                      <tbody>
                        {predictions.map((p) => {
                          const zoneMeta = p.zone ? ZONE_META[p.zone] : null;
                          return (
                            <tr
                              key={p.id}
                              className={cn(
                                "border-t border-border/70",
                                p.isReference && "bg-secondary",
                              )}
                            >
                              <td className="px-3 py-3 font-sans font-bold text-lg uppercase tracking-tight">
                                {pickLang(p, "label")}
                                {p.isReference && (
                                  <span className="ml-2 font-mono text-[10px] font-normal text-muted-foreground normal-case tracking-normal">
                                    ({t("calculators:calculateurs.equivalence.ref")})
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 font-mono text-xl tabular-nums">
                                {formatTime(p.predictedSeconds)}
                              </td>
                              <td className="px-3 py-3 font-mono text-[13px] tabular-nums text-foreground/80">
                                {formatPaceValue(convertPace(p.paceMinPerKm, unit))} {getPaceUnit(unit)}
                              </td>
                              {paceZones && (
                                <td className="px-3 py-3">
                                  {zoneMeta ? (
                                    <span
                                      className={cn(
                                        "font-mono text-[11px] font-bold px-1.5 py-0.5",
                                        zoneClass(p.zone!, "bg"),
                                      )}
                                    >
                                      Z{p.zone}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </td>
                              )}
                              <td className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-right">
                                {p.isExtrapolated ? (
                                  <span className="text-zone-3">
                                    {t("calculators:calculateurs.equivalence.extrapolatedLabel")}
                                  </span>
                                ) : !p.isReference ? (
                                  <span className="text-muted-foreground">
                                    {t("calculators:calculateurs.equivalence.ref")}
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Bar chart */}
                  {maxPace && (
                    <div className="mt-7">
                      <div className="flex items-end gap-1.5 h-24">
                        {predictions.map((p) => (
                          <div key={p.id} className="flex-1 flex flex-col justify-end items-stretch gap-2 h-full">
                            <span className="font-mono text-[10px] text-muted-foreground text-center">
                              {formatPaceValue(p.paceMinPerKm)}
                            </span>
                            <div
                              className={cn("w-full", zoneClass((p.zone ?? 2) as ZoneNumber, "bg"))}
                              style={{ height: `${Math.max(8, (p.paceMinPerKm / maxPace) * 100)}%` }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
                        {predictions.map((p) => (
                          <span key={p.id}>{pickLang(p, "label")}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <ShareLinkButton
                      buildUrl={() =>
                        buildParamsUrl("/calculators/equivalence", {
                          d: distanceId,
                          km: customKm,
                          h: hours,
                          m: minutes,
                          s: seconds,
                          e: String(exponent),
                        })
                      }
                      title={t("calculators:calculateurs.equivalence.title")}
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── Sidebar ── */}
            <CalculatorSidebar className="border-t-2 lg:border-t-0 lg:border-l-2 border-foreground p-5 sm:p-7 md:p-8">
              <CalculatorFormulaBox
                label={t("calculators:calculateurs.equivalence.formulaLabel")}
                formula={t("calculators:calculateurs.equivalence.formulaLine", {
                  exponent: formatExponent(exponent),
                })}
                note={t("calculators:calculateurs.equivalence.formulaNote", {
                  exponent: formatExponent(exponent),
                })}
              />
              <div>
                <CalculatorChipGroup
                  label={t("calculators:calculateurs.equivalence.exponentLabel")}
                >
                  {EXPONENTS.map((e) => (
                    <CalculatorChip
                      key={e}
                      active={exponent === e}
                      onClick={() => setExponent(e)}
                    >
                      {formatExponent(e)}
                    </CalculatorChip>
                  ))}
                </CalculatorChipGroup>
                <p className="mt-3 text-[13px] leading-[1.6] text-muted-foreground">
                  {t("calculators:calculateurs.equivalence.exponentNote")}
                </p>
              </div>
              <div className="border-2 border-zone-3 px-4 py-3.5">
                <CalculatorLabel className="text-zone-3">
                  {t("calculators:calculateurs.equivalence.whatItDoesntSayLabel")}
                </CalculatorLabel>
                <p className="mt-2 text-sm leading-[1.6] text-foreground/85">
                  {t("calculators:calculateurs.equivalence.whatItDoesntSay")}
                </p>
              </div>
              <CalculatorRelatedLinks
                label={t("calculators:calculateurs.equivalence.relatedLabel")}
                links={[
                  { label: t("calculators:calculateurs.equivalence.relatedPlan"), to: "/plan/new" },
                  { label: t("calculators:calculateurs.splits.title"), to: "/calculators/splits" },
                ]}
              />
            </CalculatorSidebar>
          </div>
        </CalculatorPanel>
      </div>
    </>
  );
}
