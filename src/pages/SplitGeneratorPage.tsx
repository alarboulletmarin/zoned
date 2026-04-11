import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Route, Download, Info } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { exportToPNG } from "@/lib/export/png";
import { convertPace, convertDistance, getPaceUnit, getDistanceUnit } from "@/lib/units";
import { cn } from "@/lib/utils";
import { generateSplits, formatSplitTime as formatTime, formatPaceDisplay } from "@/lib/splits";
import type { SplitStrategy as Strategy } from "@/lib/splits";
import { usePickLang } from "@/lib/i18n-utils";

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
  const [selectedRace, setSelectedRace] = useState<string>("10");
  const [customDistance, setCustomDistance] = useState<string>("");
  const [hours, setHours] = useState<string>("0");
  const [minutes, setMinutes] = useState<string>("45");
  const [seconds, setSeconds] = useState<string>("0");
  const [strategy, setStrategy] = useState<Strategy>("even");

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t("calculators:calculateurs.splits.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculators:calculateurs.splits.description")}
          </p>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="size-5" />
              {t("calculators:calculateurs.splits.raceParams")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Distance */}
            <div className="space-y-2">
              <label htmlFor="split-distance" className="text-sm font-medium">
                {t("calculators:calculateurs.splits.distance")}
              </label>
              <select
                id="split-distance"
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">km</span>
                </div>
              )}
            </div>

            {/* Target time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("calculators:calculateurs.splits.targetTime")}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="flex h-9 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">h</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="flex h-9 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="flex h-9 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">s</span>
                </div>
              </div>
            </div>

            {/* Strategy */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("calculators:calculateurs.splits.strategy")}
              </label>
              <div className="flex gap-2">
                {([
                  { value: "even" as Strategy, label: t("calculators:calculateurs.splits.even"), labelLong: t("calculators:calculateurs.splits.evenSplits") },
                  { value: "negative" as Strategy, label: t("calculators:calculateurs.splits.negative"), labelLong: t("calculators:calculateurs.splits.negativeSplits") },
                  { value: "positive" as Strategy, label: t("calculators:calculateurs.splits.positive"), labelLong: t("calculators:calculateurs.splits.positiveSplits") },
                ] as const).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStrategy(s.value)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors",
                      strategy === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-input hover:bg-muted"
                    )}
                    title={s.labelLong}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {strategy === "even" && t("calculators:calculateurs.splits.evenDesc")}
                {strategy === "negative" && t("calculators:calculateurs.splits.negativeDesc")}
                {strategy === "positive" && t("calculators:calculateurs.splits.positiveDesc")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasValidInput && splits.length > 0 && (
          <>
            <div ref={tableRef} className="bg-card rounded-xl border shadow-sm">
              <div className="px-6 pt-6 pb-2">
                <h3 className="font-semibold">
                  {t("calculators:calculateurs.splits.splitTable")}
                </h3>
              </div>
              <div className="px-6 pb-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th scope="col" className="py-2 px-2 text-left font-medium">#</th>
                      <th scope="col" className="py-2 px-2 text-left font-medium">
                        {t("calculators:calculateurs.splits.dist")}
                      </th>
                      <th scope="col" className="py-2 px-2 text-left font-medium">
                        {t("calculators:calculateurs.splits.split")}
                      </th>
                      <th scope="col" className="py-2 px-2 text-left font-medium">
                        {t("calculators:calculateurs.splits.paceLabel")}
                      </th>
                      <th scope="col" className="py-2 px-2 text-left font-medium">
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
                          className="border-b last:border-b-0 hover:bg-muted/50"
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
                          <td className="py-2 px-2 tabular-nums font-medium">
                            {formatTime(split.cumulativeTimeSeconds)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-medium">
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
                      <td className="py-2 px-2 tabular-nums font-bold">
                        {formatTime(totalTimeSeconds)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="size-4" />
              {t("calculators:calculateurs.splits.downloadPng")}
            </button>
          </>
        )}

        {/* Empty state */}
        {!hasValidInput && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Info className="size-4 shrink-0" />
            {t("calculators:calculateurs.splits.emptyState")}
          </div>
        )}
      </div>
    </>
  );
}
