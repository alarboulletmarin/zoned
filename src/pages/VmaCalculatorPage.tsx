import { useEffect, useMemo, useState } from "react";
import { zoneClass } from "@/lib/zoneColors";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save, ArrowRight, Download } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { exportZonesAtlasToPDF } from "@/lib/export";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { ZONE_META, type ZoneNumber } from "@/types";
import { calculatePaceZones, saveUserZonePrefs, formatPace } from "@/lib/zones";
import { calculateRaceTimes } from "@/lib/paceCalculator";
import { updateBaseData } from "@/lib/runnerProfile";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";
import { usePickLang } from "@/lib/i18n-utils";
import {
  CalculatorHero,
  CalculatorPanel,
  CalculatorLabel,
  CalculatorChip,
  CalculatorChipGroup,
  CalculatorTimeField,
  CalculatorResultHeadline,
  CalculatorResultStat,
  CalculatorSidebar,
  CalculatorFormulaBox,
  CalculatorInfoList,
  CalculatorRelatedLinks,
  CalculatorLocalNote,
  CalculatorEmptyResult,
  CalculatorImplausibleWarning,
} from "@/components/calculators";

/**
 * Race distance configurations with VMA percentages.
 * Matches the values from paceCalculator.ts.
 */
const DISTANCES = [
  { id: "5k", label: "5 km", distanceKm: 5, vmaPercentage: 97 },
  { id: "10k", label: "10 km", distanceKm: 10, vmaPercentage: 92 },
  { id: "semi", label: "Semi", distanceKm: 21.1, vmaPercentage: 82 },
  { id: "marathon", label: "Marathon", distanceKm: 42.195, vmaPercentage: 77 },
] as const;

/** Realistic VMA band for a real all-out effort — below/above this, the
 *  result is possible but probably means the input wasn't a race PB (a
 *  warm-up jog, a typo in the time field, etc.). Distinct from the hard
 *  [4, 35] finiteness guard kept in the calculation itself. */
const PLAUSIBLE_VMA_MIN = 8;
const PLAUSIBLE_VMA_MAX = 26;

function formatHms(hours: number, minutes: number, seconds: number): string {
  const parts = hours > 0 ? [hours, minutes, seconds] : [minutes, seconds];
  return parts.map((p, i) => (i === 0 ? String(p) : String(p).padStart(2, "0"))).join(":");
}

export function VmaCalculatorPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [searchParams] = useSearchParams();
  const [distanceId, setDistanceId] = useState<string>(
    () => searchParams.get("d") ?? "10k",
  );
  const [hours, setHours] = useState<string>(() => searchParams.get("h") ?? "");
  const [minutes, setMinutes] = useState<string>(() => searchParams.get("m") ?? "");
  const [seconds, setSeconds] = useState<string>(() => searchParams.get("s") ?? "");
  const [forceShow, setForceShow] = useState(false);

  const selectedDistance = DISTANCES.find((d) => d.id === distanceId)!;

  // Parse time inputs
  const parsedHours = hours !== "" ? parseInt(hours, 10) : 0;
  const parsedMinutes = minutes !== "" ? parseInt(minutes, 10) : 0;
  const parsedSeconds = seconds !== "" ? parseInt(seconds, 10) : 0;

  const totalTimeMinutes = parsedHours * 60 + parsedMinutes + parsedSeconds / 60;
  const hasValidTime = totalTimeMinutes > 0;

  // Raw VMA from input — the only guard here is finiteness/sign, not plausibility.
  const rawVma = useMemo(() => {
    if (!hasValidTime) return null;
    const raceSpeedKmh = selectedDistance.distanceKm / (totalTimeMinutes / 60);
    const vma = raceSpeedKmh / (selectedDistance.vmaPercentage / 100);
    if (!Number.isFinite(vma) || vma <= 0 || vma > 40) return null;
    return Math.round(vma * 10) / 10;
  }, [hasValidTime, selectedDistance.distanceKm, selectedDistance.vmaPercentage, totalTimeMinutes]);

  const isImplausible =
    rawVma !== null && (rawVma < PLAUSIBLE_VMA_MIN || rawVma > PLAUSIBLE_VMA_MAX);

  // Reset the override whenever the input changes so a stale "calculate
  // anyway" doesn't silently apply to a different, newly-plausible entry.
  useEffect(() => {
    setForceShow(false);
  }, [distanceId, hours, minutes, seconds]);

  const calculatedVma = rawVma !== null && (!isImplausible || forceShow) ? rawVma : null;

  // Calculate pace zones from VMA
  const paceZones = useMemo(() => {
    if (!calculatedVma) return null;
    return calculatePaceZones(calculatedVma);
  }, [calculatedVma]);

  const raceEstimates = useMemo(() => {
    if (!calculatedVma) return null;
    return calculateRaceTimes(calculatedVma);
  }, [calculatedVma]);
  const pace10k = raceEstimates?.find((r) => r.distance === "10K")?.paceMinKm;

  const handleUseVma = () => {
    if (!calculatedVma) return;
    saveUserZonePrefs({ vma: calculatedVma });
    updateBaseData({ vma: calculatedVma });
    toast.success(t("calculators:calculateurs.vma.vmaSaved", { vma: calculatedVma }));
  };

  const handleCreatePlan = () => {
    if (!calculatedVma) return;
    saveUserZonePrefs({ vma: calculatedVma });
    updateBaseData({ vma: calculatedVma });
    navigate("/plan/new");
  };

  const handleCopyTable = () => {
    if (!paceZones) return;
    const lines = paceZones.map((z) => {
      const meta = ZONE_META[z.zone as ZoneNumber];
      return `Z${z.zone} ${pickLang(meta, "label")}\t${formatPace(convertPace(z.paceMinPerKm!, unit))}-${formatPace(convertPace(z.paceMaxPerKm!, unit))} ${getPaceUnit(unit)}`;
    });
    navigator.clipboard?.writeText(lines.join("\n"));
    toast.success(t("calculators:calculateurs.vma.tableCopied"));
  };

  const handleExportPdf = () => {
    if (!calculatedVma) return;
    void exportZonesAtlasToPDF({ vma: calculatedVma }, unit);
  };

  const handleReset = () => {
    setHours("");
    setMinutes("");
    setSeconds("");
    setForceShow(false);
  };

  const handleCorrect = () => {
    setHours("");
    setMinutes("");
    setSeconds("");
  };

  // Clamp numeric input within range
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
        title={t("calculators:calculateurs.vma.seoTitle")}
        description={t("calculators:calculateurs.vma.seoDescription")}
        canonical="/calculators/vma"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.vma.seoAppName"),
            description: t("calculators:calculateurs.vma.seoAppDescription"),
            url: "https://zoned.run/calculators/vma",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.vma.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8">
        <CalculatorPanel className="p-0">
          <div className="grid lg:grid-cols-[1fr_360px]">
            {/* ── Main column: form + result ── */}
            <div className="p-5 sm:p-7 md:p-8">
              <CalculatorHero
                groupLabel={t("calculators:calculateurs.groups.performance")}
                title={t("calculators:calculateurs.vma.title")}
                description={t("calculators:calculateurs.vma.description")}
                className="mb-7 md:mb-8"
              />

              <div className="grid sm:grid-cols-2 gap-6">
                <CalculatorChipGroup label={t("calculators:calculateurs.vma.raceDistance")}>
                  {DISTANCES.map((d) => (
                    <CalculatorChip
                      key={d.id}
                      active={distanceId === d.id}
                      onClick={() => setDistanceId(d.id)}
                    >
                      {d.label}
                    </CalculatorChip>
                  ))}
                </CalculatorChipGroup>

                <div>
                  <CalculatorLabel className="mb-2.5">
                    {t("calculators:calculateurs.vma.raceTime")}
                  </CalculatorLabel>
                  <div className="flex items-end gap-2">
                    <CalculatorTimeField
                      value={hours}
                      onChange={(v) => handleNumericInput(v, setHours, 9)}
                      max={9}
                      placeholder="0"
                      unitLabel={t("calculators:calculateurs.vma.hoursShort")}
                      ariaLabel={t("calculators:calculateurs.vma.hours")}
                    />
                    <span className="pb-6 font-mono text-xl text-muted-foreground">:</span>
                    <CalculatorTimeField
                      value={minutes}
                      onChange={(v) => handleNumericInput(v, setMinutes, 59)}
                      max={59}
                      placeholder="00"
                      unitLabel="min"
                      ariaLabel={t("calculators:calculateurs.vma.minutes")}
                    />
                    <span className="pb-6 font-mono text-xl text-muted-foreground">:</span>
                    <CalculatorTimeField
                      value={seconds}
                      onChange={(v) => handleNumericInput(v, setSeconds, 59)}
                      max={59}
                      placeholder="00"
                      unitLabel="sec"
                      ariaLabel={t("calculators:calculateurs.vma.seconds")}
                    />
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="mt-8 md:mt-9">
                {!hasValidTime && (
                  <CalculatorEmptyResult hint={t("calculators:calculateurs.vma.emptyHint")} />
                )}

                {hasValidTime && rawVma !== null && isImplausible && !forceShow && (
                  <CalculatorImplausibleWarning
                    message={t("calculators:calculateurs.vma.implausibleMessage", {
                      time: formatHms(parsedHours, parsedMinutes, parsedSeconds),
                      distance: selectedDistance.label,
                      vma: rawVma,
                    })}
                    onProceed={() => setForceShow(true)}
                    onCorrect={handleCorrect}
                    proceedLabel={t("calculators:calculateurs.vma.implausibleProceed")}
                    correctLabel={t("calculators:calculateurs.vma.implausibleCorrect")}
                    note={t("calculators:calculateurs.vma.implausibleNote")}
                  />
                )}

                {calculatedVma && paceZones && (
                  <>
                    <div className="border-t-2 border-foreground pt-6 flex flex-wrap items-end gap-8 sm:gap-11">
                      <CalculatorResultHeadline
                        label={t("calculators:calculateurs.vma.estimatedVma")}
                        value={calculatedVma.toLocaleString("fr-FR")}
                        unit="km/h"
                      />
                      <div className="flex gap-7 sm:gap-8">
                        <CalculatorResultStat
                          label={t("calculators:calculateurs.vma.vpaceLabel")}
                          value={formatPace(convertPace(60 / calculatedVma, unit))}
                        />
                        {pace10k && (
                          <CalculatorResultStat
                            label={t("calculators:calculateurs.vma.pace10kLabel")}
                            value={pace10k}
                          />
                        )}
                      </div>
                    </div>

                    {/* Zone table */}
                    <div className="mt-7">
                      <CalculatorLabel>{t("calculators:calculateurs.vma.paceZonesPreview")}</CalculatorLabel>
                      <div className="border-2 border-border/70 mt-3 overflow-x-auto">
                        <table className="w-full text-left min-w-[480px]">
                          <thead>
                            <tr className="bg-ink text-paper font-mono text-[10px] tracking-[0.1em] uppercase">
                              <th className="px-3 py-2.5 font-normal">{t("calculators:calculateurs.vma.zone")}</th>
                              <th className="px-3 py-2.5 font-normal">{t("calculators:calculateurs.vma.usageCol")}</th>
                              <th className="px-3 py-2.5 font-normal">{t("calculators:calculateurs.vma.pace")}</th>
                              <th className="px-3 py-2.5 font-normal">% VMA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paceZones.map((z) => {
                              const meta = ZONE_META[z.zone as ZoneNumber];
                              const isThreshold = z.zone === 4;
                              const minPct = Math.round((60 / z.paceMaxPerKm! / calculatedVma) * 100);
                              const maxPct = Math.round((60 / z.paceMinPerKm! / calculatedVma) * 100);
                              return (
                                <tr
                                  key={z.zone}
                                  className={cn(
                                    "border-t border-border/70 font-mono text-[13px]",
                                    isThreshold && "bg-accent-acid text-ink font-bold",
                                  )}
                                >
                                  <td className={cn("px-3 py-2.5", !isThreshold && zoneClass(z.zone as ZoneNumber, "text"))}>
                                    Z{z.zone}
                                  </td>
                                  <td className="px-3 py-2.5 font-sans text-[14px]">
                                    {pickLang(meta, "label")}
                                  </td>
                                  <td className={cn("px-3 py-2.5 tabular-nums", !isThreshold && "text-foreground/80")}>
                                    {formatPace(convertPace(z.paceMinPerKm!, unit))}-{formatPace(convertPace(z.paceMaxPerKm!, unit))}
                                  </td>
                                  <td className={cn("px-3 py-2.5 tabular-nums", !isThreshold && "text-muted-foreground")}>
                                    {minPct}-{maxPct}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 mt-7">
                      <Button onClick={handleUseVma}>
                        <Save className="size-4" />
                        {t("calculators:calculateurs.vma.useThisVma")}
                      </Button>
                      <Button onClick={handleCreatePlan} variant="outline">
                        <ArrowRight className="size-4" />
                        {t("calculators:calculateurs.vma.createPlan")}
                      </Button>
                      <Button onClick={handleCopyTable} variant="outline">
                        {t("calculators:calculateurs.vma.copyTable")}
                      </Button>
                      <Button onClick={handleExportPdf} variant="outline">
                        <Download className="size-4" />
                        {t("calculators:calculateurs.vma.exportPdf")}
                      </Button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t("calculators:calculateurs.vma.reset")}
                      </button>
                      <ShareLinkButton
                        buildUrl={() =>
                          buildParamsUrl("/calculators/vma", {
                            d: distanceId,
                            h: hours,
                            m: minutes,
                            s: seconds,
                          })
                        }
                        title={t("calculators:calculateurs.vma.title")}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <CalculatorSidebar className="border-t-2 lg:border-t-0 lg:border-l-2 border-foreground p-5 sm:p-7 md:p-8">
              <CalculatorFormulaBox
                label={t("calculators:calculateurs.vma.formulaLabel")}
                formula={
                  <>
                    {t("calculators:calculateurs.vma.formulaLine1")}
                    <br />
                    {t("calculators:calculateurs.vma.formulaLine2")}
                  </>
                }
                note={t("calculators:calculateurs.vma.formulaNote")}
                source={t("calculators:calculateurs.vma.formulaSource")}
              />
              <CalculatorInfoList
                label={t("calculators:calculateurs.vma.toKnowLabel")}
                items={[
                  t("calculators:calculateurs.vma.toKnow1"),
                  t("calculators:calculateurs.vma.toKnow2"),
                  t("calculators:calculateurs.vma.toKnow3"),
                ]}
              />
              <CalculatorRelatedLinks
                label={t("calculators:calculateurs.vma.relatedLabel")}
                links={[
                  { label: t("calculators:calculateurs.vma.relatedEquivalence"), to: "/calculators/equivalence" },
                  { label: t("calculators:calculateurs.vma.relatedZones"), to: "/calculators/zones" },
                ]}
              />
              <CalculatorLocalNote>
                {t("calculators:calculateurs.vma.localNote")}
              </CalculatorLocalNote>
            </CalculatorSidebar>
          </div>
        </CalculatorPanel>
      </div>
    </>
  );
}
