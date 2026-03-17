import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Route, Download, Info } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { exportToPNG } from "@/lib/export/png";
import { convertPace, convertDistance, getPaceUnit, getDistanceUnit } from "@/lib/units";
import { cn } from "@/lib/utils";

type Strategy = "even" | "negative" | "positive";

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

interface SplitRow {
  index: number;
  distance: number; // km for this split (1 or partial)
  splitTimeSeconds: number;
  paceMinPerKm: number;
  cumulativeTimeSeconds: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatPaceDisplay(paceMinPerKm: number): string {
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function generateSplits(
  distanceKm: number,
  totalTimeSeconds: number,
  strategy: Strategy
): SplitRow[] {
  const fullSplits = Math.floor(distanceKm);
  const partialKm = distanceKm - fullSplits;
  const hasPartial = partialKm > 0.001;
  const numberOfSplits = hasPartial ? fullSplits + 1 : fullSplits;

  // Base pace in seconds per km
  const basePaceSecPerKm = totalTimeSeconds / distanceKm;

  const splits: SplitRow[] = [];
  let cumulative = 0;

  for (let i = 0; i < numberOfSplits; i++) {
    const isLastPartial = hasPartial && i === numberOfSplits - 1;
    const splitDistanceKm = isLastPartial ? partialKm : 1;

    let paceMultiplier = 1;
    if (strategy === "negative" && numberOfSplits > 1) {
      // Linear progression from +2% to -2%
      paceMultiplier = 1 + 0.02 - (0.04 * i) / (numberOfSplits - 1);
    } else if (strategy === "positive" && numberOfSplits > 1) {
      // Linear progression from -2% to +2%
      paceMultiplier = 1 - 0.02 + (0.04 * i) / (numberOfSplits - 1);
    }

    const paceSecPerKm = basePaceSecPerKm * paceMultiplier;
    const splitTimeSeconds = paceSecPerKm * splitDistanceKm;
    cumulative += splitTimeSeconds;

    splits.push({
      index: i + 1,
      distance: splitDistanceKm,
      splitTimeSeconds,
      paceMinPerKm: paceSecPerKm / 60,
      cumulativeTimeSeconds: cumulative,
    });
  }

  // Adjust last split cumulative to match exact total time
  // (floating point rounding correction)
  if (splits.length > 0) {
    const diff = totalTimeSeconds - splits[splits.length - 1].cumulativeTimeSeconds;
    splits[splits.length - 1].cumulativeTimeSeconds = totalTimeSeconds;
    splits[splits.length - 1].splitTimeSeconds += diff;
  }

  return splits;
}

export function SplitGeneratorPage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
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
        title={
          isEn
            ? "Split Generator"
            : "Generateur de Splits"
        }
        description={
          isEn
            ? "Generate per-km or per-mile splits for your target race time with even, negative, or positive split strategies."
            : "Generez vos temps de passage par km pour votre objectif chrono avec des strategies de splits reguliers, negatifs ou positifs."
        }
        canonical="/calculateurs/splits"
      />
      <div className="py-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isEn ? "Split Generator" : "Generateur de Splits"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isEn
              ? "Plan your race splits to reach your target time."
              : "Planifiez vos temps de passage pour atteindre votre objectif chrono."}
          </p>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="size-5" />
              {isEn ? "Race Parameters" : "Parametres de course"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Distance */}
            <div className="space-y-2">
              <label htmlFor="split-distance" className="text-sm font-medium">
                {isEn ? "Distance" : "Distance"}
              </label>
              <select
                id="split-distance"
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {RACE_OPTIONS.map((opt) => (
                  <option key={opt.distanceKm} value={opt.distanceKm.toString()}>
                    {isEn ? opt.labelEn : opt.label}
                  </option>
                ))}
                <option value="custom">
                  {isEn ? "Custom" : "Personnalise"}
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
                {isEn ? "Target Time" : "Temps cible"}
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
                {isEn ? "Strategy" : "Strategie"}
              </label>
              <div className="flex gap-2">
                {([
                  { value: "even" as Strategy, label: isEn ? "Even" : "Regulier", labelLong: isEn ? "Even splits" : "Splits reguliers" },
                  { value: "negative" as Strategy, label: isEn ? "Negative" : "Negatif", labelLong: isEn ? "Negative splits" : "Splits negatifs" },
                  { value: "positive" as Strategy, label: isEn ? "Positive" : "Positif", labelLong: isEn ? "Positive splits" : "Splits positifs" },
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
                {strategy === "even" &&
                  (isEn
                    ? "All splits at the same pace."
                    : "Tous les splits a la meme allure.")}
                {strategy === "negative" &&
                  (isEn
                    ? "Start slower, finish faster (-2% to +2%)."
                    : "Depart plus lent, finish plus rapide (-2% a +2%).")}
                {strategy === "positive" &&
                  (isEn
                    ? "Start faster, finish slower (+2% to -2%)."
                    : "Depart plus rapide, finish plus lent (+2% a -2%).")}
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
                  {isEn ? "Split Table" : "Tableau des splits"}
                </h3>
              </div>
              <div className="px-6 pb-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left font-medium">#</th>
                      <th className="py-2 px-2 text-left font-medium">
                        {isEn ? "Dist." : "Dist."}
                      </th>
                      <th className="py-2 px-2 text-left font-medium">
                        {isEn ? "Split" : "Split"}
                      </th>
                      <th className="py-2 px-2 text-left font-medium">
                        {isEn ? "Pace" : "Allure"}
                      </th>
                      <th className="py-2 px-2 text-left font-medium">
                        {isEn ? "Cumul." : "Cumul."}
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
                        {isEn ? "Total" : "Total"}
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
              {isEn ? "Download PNG" : "Telecharger en PNG"}
            </button>
          </>
        )}

        {/* Empty state */}
        {!hasValidInput && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Info className="size-4 shrink-0" />
            {isEn
              ? "Enter a distance and target time to generate your splits."
              : "Entrez une distance et un temps cible pour generer vos splits."}
          </div>
        )}
      </div>
    </>
  );
}
