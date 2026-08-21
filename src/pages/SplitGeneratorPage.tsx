import { useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download } from "@/components/icons";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { exportToPNG } from "@/lib/export/png";
import { convertPace, convertDistance, getPaceUnit, getDistanceUnit } from "@/lib/units";
import { generateSplits, formatSplitTime as formatTime, formatPaceDisplay } from "@/lib/splits";
import type { SplitStrategy as Strategy } from "@/lib/splits";
import { usePickLang } from "@/lib/i18n-utils";
import {
  CalculatorHero,
  CalculatorPanel,
  CalculatorLabel,
  CalculatorChip,
  CalculatorChipGroup,
  CalculatorTimeField,
  CalculatorEmptyResult,
} from "@/components/calculators";

interface RaceOption {
  label: string;
  labelEn: string;
  distanceKm: number;
}

const RACE_OPTIONS: RaceOption[] = [
  { label: "5K", labelEn: "5K", distanceKm: 5 },
  { label: "10K", labelEn: "10K", distanceKm: 10 },
  { label: "Semi-marathon", labelEn: "Half Marathon", distanceKm: 21.1 },
  { label: "Marathon", labelEn: "Marathon", distanceKm: 42.195 },
];

export function SplitGeneratorPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const { settings } = useSettings();
  const unit = settings.unitSystem;
  const tableRef = useRef<HTMLDivElement>(null);

  // Inputs
  const [searchParams] = useSearchParams();
  const [selectedRace, setSelectedRace] = useState<string>(
    () => searchParams.get("d") ?? "10",
  );
  const [customDistance, setCustomDistance] = useState<string>(
    () => searchParams.get("km") ?? "",
  );
  const [hours, setHours] = useState<string>(() => searchParams.get("h") ?? "0");
  const [minutes, setMinutes] = useState<string>(() => searchParams.get("m") ?? "45");
  const [seconds, setSeconds] = useState<string>(() => searchParams.get("s") ?? "0");
  const [strategy, setStrategy] = useState<Strategy>(() => {
    const shared = searchParams.get("strat");
    return shared === "negative" || shared === "positive" ? shared : "even";
  });

  const isCustom = selectedRace === "custom";
  const distanceKm = isCustom
    ? parseFloat(customDistance) || 0
    : parseFloat(selectedRace);

  const totalTimeSeconds =
    (parseInt(hours) || 0) * 3600 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0);

  const hasValidInput = distanceKm > 0 && totalTimeSeconds > 0;

  const splits = useMemo(() => {
    if (!hasValidInput) return [];
    return generateSplits(distanceKm, totalTimeSeconds, strategy);
  }, [distanceKm, totalTimeSeconds, strategy, hasValidInput]);

  const distanceUnitLabel = getDistanceUnit(unit);
  const paceUnitLabel = getPaceUnit(unit);

  const handleExport = async () => {
    if (!tableRef.current) return;
    const distLabel = isCustom ? `${distanceKm}km` : `${selectedRace}`;
    await exportToPNG(tableRef, `splits-${distLabel}`);
  };

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.splits.seoTitle")}
        description={t("calculators:calculateurs.splits.seoDescription")}
        canonical="/calculators/splits"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.splits.seoAppName"),
            description: t("calculators:calculateurs.splits.seoAppDescription"),
            url: "https://zoned.run/calculators/splits",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.splits.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto space-y-6">
        <CalculatorHero
          groupLabel={t("calculators:calculateurs.groups.terrain")}
          title={t("calculators:calculateurs.splits.title")}
          description={t("calculators:calculateurs.splits.description")}
          className="mb-0"
        />

        {/* Inputs */}
        <CalculatorPanel className="space-y-6">
          {/* Distance */}
          <div>
            <label htmlFor="split-distance" className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("calculators:calculateurs.splits.distance")}
            </label>
            <select
              id="split-distance"
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="block w-full border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 mt-2 font-mono text-lg focus-visible:outline-none"
            >
              {RACE_OPTIONS.map((opt) => (
                <option key={opt.distanceKm} value={opt.distanceKm.toString()}>
                  {pickLang(opt, "label")}
                </option>
              ))}
              <option value="custom">
                {t("calculators:calculateurs.splits.custom")}
              </option>
            </select>
            {isCustom && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={0.5}
                  max={200}
                  step={0.1}
                  placeholder="15"
                  value={customDistance}
                  onChange={(e) => setCustomDistance(e.target.value)}
                  className="w-24 border-0 border-b-2 border-foreground bg-transparent px-1 py-1 font-mono text-sm tabular-nums focus-visible:outline-none"
                />
                <span className="font-mono text-xs text-muted-foreground">km</span>
              </div>
            )}
          </div>

          {/* Target time */}
          <div>
            <CalculatorLabel className="mb-2.5">
              {t("calculators:calculateurs.splits.targetTime")}
            </CalculatorLabel>
            <div className="flex items-end gap-2">
              <CalculatorTimeField
                value={hours}
                onChange={setHours}
                max={23}
                placeholder="0"
                unitLabel="h"
                ariaLabel="Hours"
                className="w-12 sm:w-14"
              />
              <span className="pb-6 font-mono text-lg text-muted-foreground">:</span>
              <CalculatorTimeField
                value={minutes}
                onChange={setMinutes}
                max={59}
                placeholder="00"
                unitLabel="min"
                ariaLabel="Minutes"
                className="w-12 sm:w-14"
              />
              <span className="pb-6 font-mono text-lg text-muted-foreground">:</span>
              <CalculatorTimeField
                value={seconds}
                onChange={setSeconds}
                max={59}
                placeholder="00"
                unitLabel="s"
                ariaLabel="Seconds"
                className="w-12 sm:w-14"
              />
            </div>
          </div>

          {/* Strategy */}
          <CalculatorChipGroup label={t("calculators:calculateurs.splits.strategy")}>
            {([
              { value: "even" as Strategy, label: t("calculators:calculateurs.splits.even"), labelLong: t("calculators:calculateurs.splits.evenSplits") },
              { value: "negative" as Strategy, label: t("calculators:calculateurs.splits.negative"), labelLong: t("calculators:calculateurs.splits.negativeSplits") },
              { value: "positive" as Strategy, label: t("calculators:calculateurs.splits.positive"), labelLong: t("calculators:calculateurs.splits.positiveSplits") },
            ] as const).map((s) => (
              <CalculatorChip
                key={s.value}
                active={strategy === s.value}
                onClick={() => setStrategy(s.value)}
                title={s.labelLong}
              >
                {s.label}
              </CalculatorChip>
            ))}
          </CalculatorChipGroup>
          <p className="text-xs text-muted-foreground -mt-4">
            {strategy === "even" && t("calculators:calculateurs.splits.evenDesc")}
            {strategy === "negative" && t("calculators:calculateurs.splits.negativeDesc")}
            {strategy === "positive" && t("calculators:calculateurs.splits.positiveDesc")}
          </p>
        </CalculatorPanel>

        {/* Results */}
        {hasValidInput && splits.length > 0 && (
          <>
            <div ref={tableRef} className="border-2 border-foreground bg-card">
              <div className="px-5 sm:px-6 pt-5 pb-2">
                <CalculatorLabel>
                  {t("calculators:calculateurs.splits.splitTable")}
                </CalculatorLabel>
              </div>
              <div className="px-5 sm:px-6 pb-6 overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b-2 border-border font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
                      <th scope="col" className="py-2 px-2 text-left font-normal">#</th>
                      <th scope="col" className="py-2 px-2 text-left font-normal">
                        {t("calculators:calculateurs.splits.dist")}
                      </th>
                      <th scope="col" className="py-2 px-2 text-left font-normal">
                        {t("calculators:calculateurs.splits.split")}
                      </th>
                      <th scope="col" className="py-2 px-2 text-left font-normal">
                        {t("calculators:calculateurs.splits.paceLabel")}
                      </th>
                      <th scope="col" className="py-2 px-2 text-left font-normal">
                        {t("calculators:calculateurs.splits.cumul")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {splits.map((split) => {
                      const convertedPace = convertPace(split.paceMinPerKm, unit);
                      const displayDist =
                        split.distance < 0.999
                          ? convertDistance(split.distance, unit).toFixed(2)
                          : convertDistance(split.distance, unit).toFixed(
                              unit === "imperial" ? 2 : 0
                            );

                      return (
                        <tr
                          key={split.index}
                          className="border-b border-border/70 last:border-b-0"
                        >
                          <td className="py-2 px-2 tabular-nums text-muted-foreground">
                            {split.index}
                          </td>
                          <td className="py-2 px-2 tabular-nums">
                            {displayDist} {distanceUnitLabel}
                          </td>
                          <td className="py-2 px-2 tabular-nums">
                            {formatTime(split.splitTimeSeconds)}
                          </td>
                          <td className="py-2 px-2 tabular-nums">
                            {formatPaceDisplay(convertedPace)}
                            {paceUnitLabel}
                          </td>
                          <td className="py-2 px-2 tabular-nums font-bold">
                            {formatTime(split.cumulativeTimeSeconds)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-bold">
                      <td className="py-2 px-2">
                        {t("calculators:calculateurs.splits.total")}
                      </td>
                      <td className="py-2 px-2 tabular-nums">
                        {convertDistance(distanceKm, unit).toFixed(
                          unit === "imperial" ? 2 : 1
                        )}{" "}
                        {distanceUnitLabel}
                      </td>
                      <td className="py-2 px-2" />
                      <td className="py-2 px-2 tabular-nums">
                        {formatPaceDisplay(
                          convertPace(totalTimeSeconds / 60 / distanceKm, unit)
                        )}
                        {paceUnitLabel}
                      </td>
                      <td className="py-2 px-2 tabular-nums">
                        {formatTime(totalTimeSeconds)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Export button */}
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleExport} variant="outline">
                <Download className="size-4" />
                {t("calculators:calculateurs.splits.downloadPng")}
              </Button>
              <ShareLinkButton
                buildUrl={() =>
                  buildParamsUrl("/calculators/splits", {
                    d: selectedRace,
                    km: customDistance,
                    h: hours,
                    m: minutes,
                    s: seconds,
                    strat: strategy,
                  })
                }
                title={t("calculators:calculateurs.splits.title")}
              />
            </div>
          </>
        )}

        {/* Empty state */}
        {!hasValidInput && (
          <CalculatorEmptyResult hint={t("calculators:calculateurs.splits.emptyState")} />
        )}
      </div>
    </>
  );
}
