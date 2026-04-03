import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Shuffle, Info } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { ZONE_META, type ZoneNumber } from "@/types";
import { calculatePaceZones, loadUserZonePrefs } from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";

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
 * Riegel formula: t2 = t1 * (d2 / d1) ^ 1.06
 */
function riegel(t1Seconds: number, d1Km: number, d2Km: number): number {
  return t1Seconds * Math.pow(d2Km / d1Km, 1.06);
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
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [distanceId, setDistanceId] = useState<string>("10k");
  const [customKm, setCustomKm] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

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
      const predictedSeconds = riegel(totalSeconds, inputDistanceKm, d.km);
      const paceMinPerKm = predictedSeconds / 60 / d.km;
      const zone = paceZones ? findZoneForPace(paceMinPerKm, paceZones) : null;
      return {
        ...d,
        predictedSeconds,
        paceMinPerKm,
        zone,
        isReference: distanceId !== "custom" && d.id === distanceId,
      };
    });
  }, [hasValidInput, totalSeconds, inputDistanceKm, distanceId, paceZones]);

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
        title={
          isEn
            ? "Race Equivalence \u2014 Riegel Formula"
            : "\u00c9quivalence entre distances \u2014 Formule de Riegel"
        }
        description={
          isEn
            ? "Race time equivalence calculator using the Riegel formula. Predict your finish times across 5K, 10K, half marathon, and marathon from one race result."
            : "Équivalence temps de course entre distances avec la formule de Riegel. Prédiction de chronos du 5K au marathon à partir d'un résultat récent. Gratuit."
        }
        canonical="/calculators/equivalence"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: isEn
              ? "Race Equivalence Calculator"
              : "Calculateur d'\u00e9quivalence de course",
            description: isEn
              ? "Predict your race times across all distances from a recent result"
              : "Pr\u00e9disez vos temps de course sur toutes les distances",
            url: "https://zoned.run/calculators/equivalence",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: isEn ? "Calculators" : "Calculateurs", item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: isEn ? "Race Equivalence" : "\u00c9quivalence entre distances" },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shuffle className="size-8 text-primary" />
            {isEn
              ? "Race Equivalence"
              : "\u00c9quivalence entre distances"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isEn
              ? "Enter a race result to predict your times across all standard distances."
              : "Entrez un r\u00e9sultat de course pour pr\u00e9dire vos temps sur toutes les distances standard."}
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            {/* Distance Select */}
            <div className="space-y-2">
              <label htmlFor="distance" className="text-sm font-medium">
                {isEn ? "Race distance" : "Distance de course"}
              </label>
              <select
                id="distance"
                value={distanceId}
                onChange={(e) => setDistanceId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {DISTANCE_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isEn ? d.labelEn : d.label}
                    {d.km > 0 ? ` (${d.km} km)` : ""}
                  </option>
                ))}
              </select>

              {/* Custom distance input */}
              {distanceId === "custom" && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    placeholder="km"
                    value={customKm}
                    onChange={(e) => setCustomKm(e.target.value)}
                    className="flex h-10 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isEn ? "Custom distance in km" : "Distance personnalis\u00e9e en km"}
                  />
                  <span className="text-sm text-muted-foreground">km</span>
                </div>
              )}
            </div>

            {/* Time Inputs */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isEn ? "Race time" : "Temps de course"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min={0}
                    max={9}
                    placeholder="0"
                    value={hours}
                    onChange={(e) => handleNumericInput(e.target.value, setHours, 9)}
                    className="flex h-12 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isEn ? "Hours" : "Heures"}
                  />
                  <span className="text-xs text-muted-foreground mt-1">h</span>
                </div>
                <span className="text-xl font-bold text-muted-foreground pb-4">:</span>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="00"
                    value={minutes}
                    onChange={(e) => handleNumericInput(e.target.value, setMinutes, 59)}
                    className="flex h-12 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Minutes"
                  />
                  <span className="text-xs text-muted-foreground mt-1">min</span>
                </div>
                <span className="text-xl font-bold text-muted-foreground pb-4">:</span>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="00"
                    value={seconds}
                    onChange={(e) => handleNumericInput(e.target.value, setSeconds, 59)}
                    className="flex h-12 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isEn ? "Seconds" : "Secondes"}
                  />
                  <span className="text-xs text-muted-foreground mt-1">sec</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        {predictions && (
          <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50 mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">
                {isEn ? "Predicted times" : "Temps pr\u00e9dits"}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left font-medium">
                        {isEn ? "Distance" : "Distance"}
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        {isEn ? "Time" : "Temps"}
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        {isEn ? "Pace" : "Allure"}
                      </th>
                      {paceZones && (
                        <th className="py-2 px-3 text-left font-medium">
                          {isEn ? "Zone" : "Zone"}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p) => {
                      const displayPace = convertPace(p.paceMinPerKm, unit);
                      const zoneMeta = p.zone ? ZONE_META[p.zone] : null;

                      return (
                        <tr
                          key={p.id}
                          className={cn(
                            "border-b last:border-b-0",
                            p.isReference && "bg-primary/5",
                          )}
                        >
                          <td className="py-2.5 px-3 font-medium">
                            {isEn ? p.labelEn : p.label}
                            {p.isReference && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({isEn ? "ref" : "r\u00e9f"})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums font-medium">
                            {formatTime(p.predictedSeconds)}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums text-muted-foreground">
                            {formatPaceValue(displayPace)} {getPaceUnit(unit)}
                          </td>
                          {paceZones && (
                            <td className="py-2.5 px-3">
                              {zoneMeta ? (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full",
                                    `bg-${zoneMeta.color}/10 text-${zoneMeta.color}`,
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "size-2 rounded-full",
                                      `bg-${zoneMeta.color}`,
                                    )}
                                  />
                                  Z{p.zone}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explanation Card */}
        <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {isEn
                  ? "Based on Riegel's formula (1977), used by most running calculators. More reliable between similar distances (5K\u219210K) than distant ones (5K\u2192Marathon)."
                  : "Bas\u00e9 sur la formule de Riegel (1977), utilis\u00e9e par la plupart des calculateurs de course. Plus fiable entre distances proches (5K\u219210K) qu'entre distances \u00e9loign\u00e9es (5K\u2192Marathon)."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
