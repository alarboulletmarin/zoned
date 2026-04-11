import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Timer, Save, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { ZONE_META, type ZoneNumber } from "@/types";
import { calculatePaceZones, saveUserZonePrefs, formatPace } from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";

/**
 * Race distance configurations with VMA percentages.
 * Matches the values from paceCalculator.ts.
 */
const DISTANCES = [
  { id: "5k", label: "5 km", distanceKm: 5, vmaPercentage: 97 },
  { id: "10k", label: "10 km", distanceKm: 10, vmaPercentage: 92 },
  { id: "semi", label: "Semi-marathon (21.1 km)", distanceKm: 21.1, vmaPercentage: 82 },
  { id: "marathon", label: "Marathon (42.195 km)", distanceKm: 42.195, vmaPercentage: 77 },
] as const;

export function VmaCalculatorPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [distanceId, setDistanceId] = useState<string>("10k");
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

  const selectedDistance = DISTANCES.find((d) => d.id === distanceId)!;

  // Parse time inputs
  const parsedHours = hours !== "" ? parseInt(hours, 10) : 0;
  const parsedMinutes = minutes !== "" ? parseInt(minutes, 10) : 0;
  const parsedSeconds = seconds !== "" ? parseInt(seconds, 10) : 0;

  const totalTimeMinutes = parsedHours * 60 + parsedMinutes + parsedSeconds / 60;
  const hasValidTime = totalTimeMinutes > 0;

  // Calculate VMA
  const calculatedVma = useMemo(() => {
    if (!hasValidTime) return null;
    const raceSpeedKmh = selectedDistance.distanceKm / (totalTimeMinutes / 60);
    const vma = raceSpeedKmh / (selectedDistance.vmaPercentage / 100);
    // Sanity check: VMA should be between 8 and 30
    if (!Number.isFinite(vma) || vma < 4 || vma > 35) return null;
    return Math.round(vma * 10) / 10;
  }, [hasValidTime, selectedDistance.distanceKm, selectedDistance.vmaPercentage, totalTimeMinutes]);

  // Calculate pace zones from VMA
  const paceZones = useMemo(() => {
    if (!calculatedVma) return null;
    return calculatePaceZones(calculatedVma);
  }, [calculatedVma]);

  const handleUseVma = () => {
    if (!calculatedVma) return;
    saveUserZonePrefs({ vma: calculatedVma });
    toast.success(t("calculateurs.vma.vmaSaved", { vma: calculatedVma }));
  };

  const handleCreatePlan = () => {
    if (!calculatedVma) return;
    saveUserZonePrefs({ vma: calculatedVma });
    navigate("/plan/new");
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
        title={t("calculateurs.vma.seoTitle")}
        description={t("calculateurs.vma.seoDescription")}
        canonical="/calculators/vma"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.vma.seoAppName"),
            description: t("calculateurs.vma.seoAppDescription"),
            url: "https://zoned.run/calculators/vma",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.vma.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Timer className="size-8 text-primary" />
            {t("calculateurs.vma.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculateurs.vma.description")}
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            {/* Distance Select */}
            <div className="space-y-2">
              <label htmlFor="distance" className="text-sm font-medium">
                {t("calculateurs.vma.raceDistance")}
              </label>
              <select
                id="distance"
                value={distanceId}
                onChange={(e) => setDistanceId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {DISTANCES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {t("calculateurs.vma.vmaPercentUsed", { percent: selectedDistance.vmaPercentage })}
              </p>
            </div>

            {/* Time Inputs */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("calculateurs.vma.raceTime")}
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
                    aria-label={t("calculateurs.vma.hours")}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {t("calculateurs.vma.hoursShort")}
                  </span>
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
                    aria-label={t("calculateurs.vma.minutes")}
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
                    aria-label={t("calculateurs.vma.seconds")}
                  />
                  <span className="text-xs text-muted-foreground mt-1">sec</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {calculatedVma && paceZones && (
          <div className="space-y-6">
            {/* VMA Display */}
            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="py-8 flex flex-col items-center text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("calculateurs.vma.estimatedVma")}
                </p>
                <p className="text-5xl font-bold text-primary tabular-nums">
                  {calculatedVma.toFixed(1)}
                </p>
                <p className="text-lg text-muted-foreground mt-1">km/h</p>
              </CardContent>
            </Card>

            {/* Zones Preview Table */}
            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  {t("calculateurs.vma.paceZonesPreview")}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th scope="col" className="py-2 px-3 text-left font-medium">
                          {t("calculateurs.vma.zone")}
                        </th>
                        <th scope="col" className="py-2 px-3 text-left font-medium">
                          {t("calculateurs.vma.pace")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paceZones.map((z) => {
                        const meta = ZONE_META[z.zone as ZoneNumber];
                        return (
                          <tr
                            key={z.zone}
                            className={cn(
                              "border-b last:border-b-0",
                              `bg-${meta.color}/10`
                            )}
                          >
                            <td className="py-2 px-3">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-2 font-medium",
                                  `text-${meta.color}`
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-3 rounded-full",
                                    `bg-${meta.color}`
                                  )}
                                />
                                Z{z.zone} - {isEn ? meta.labelEn : meta.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 tabular-nums">
                              {formatPace(convertPace(z.paceMinPerKm!, unit))}-
                              {formatPace(convertPace(z.paceMaxPerKm!, unit))} {getPaceUnit(unit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleUseVma} className="flex-1">
                <Save className="size-4" />
                {t("calculateurs.vma.useThisVma")}
              </Button>
              <Button onClick={handleCreatePlan} variant="outline" className="flex-1">
                <ArrowRight className="size-4" />
                {t("calculateurs.vma.createPlan")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
