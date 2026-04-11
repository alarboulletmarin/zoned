import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Gauge, Info } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { loadUserZonePrefs, calculatePaceZones } from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import {
  convertPace,
  convertSpeed,
  getPaceUnit,
  getSpeedUnit,
} from "@/lib/units";
import type { ZoneNumber, ZoneRange } from "@/types";

/**
 * Find which training zone a given pace falls into.
 * Returns the zone number or null if no zone matches.
 */
function findZoneForPace(
  paceMinPerKm: number,
  zones: ZoneRange[]
): ZoneNumber | null {
  for (const z of zones) {
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

export function TreadmillConverterPage() {
  const { t } = useTranslation("common");
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [speed, setSpeed] = useState<string>("10");
  const [incline, setIncline] = useState<string>("1");
  const [vma, setVma] = useState<number | null>(null);

  // Load stored VMA on mount
  useEffect(() => {
    const prefs = loadUserZonePrefs();
    if (prefs?.vma) {
      setVma(prefs.vma);
    }
  }, []);

  const speedValue = speed ? parseFloat(speed) : 0;
  const inclineValue = incline ? parseFloat(incline) : 0;

  const hasValidInput = speedValue >= 4 && speedValue <= 25 && inclineValue >= 0 && inclineValue <= 15;

  // Equivalent outdoor speed: treadmillSpeed * (1 + 0.03 * incline%)
  const equivalentSpeedKmh = hasValidInput
    ? speedValue * (1 + 0.03 * inclineValue)
    : 0;
  const equivalentPaceMinPerKm =
    equivalentSpeedKmh > 0 ? 60 / equivalentSpeedKmh : 0;

  // Zone detection
  const paceZones = useMemo(
    () => (vma ? calculatePaceZones(vma) : []),
    [vma]
  );
  const matchedZone =
    equivalentPaceMinPerKm > 0
      ? findZoneForPace(equivalentPaceMinPerKm, paceZones)
      : null;

  // Format values for display
  const displayPace = equivalentPaceMinPerKm > 0
    ? (() => {
        const converted = convertPace(equivalentPaceMinPerKm, unit);
        const min = Math.floor(converted);
        const sec = Math.round((converted - min) * 60);
        return `${min}:${sec.toString().padStart(2, "0")}`;
      })()
    : "--:--";

  const displaySpeed = equivalentSpeedKmh > 0
    ? convertSpeed(equivalentSpeedKmh, unit).toFixed(1)
    : "--";

  return (
    <>
      <SEOHead
        title={t("calculateurs.treadmill.seoTitle")}
        description={t("calculateurs.treadmill.seoDescription")}
        canonical="/calculators/tapis-roulant"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.treadmill.seoAppName"),
            description: t("calculateurs.treadmill.seoAppDescription"),
            url: "https://zoned.run/calculators/tapis-roulant",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.treadmill.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t("calculateurs.treadmill.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculateurs.treadmill.description")}
          </p>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="size-5" />
              {t("calculateurs.treadmill.settings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Speed input */}
              <div className="space-y-2">
                <label
                  htmlFor="treadmill-speed"
                  className="text-sm font-medium"
                >
                  {t("calculateurs.treadmill.speed")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="treadmill-speed"
                    type="number"
                    min={4}
                    max={25}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    km/h
                  </span>
                </div>
              </div>

              {/* Incline input */}
              <div className="space-y-2">
                <label
                  htmlFor="treadmill-incline"
                  className="text-sm font-medium"
                >
                  {t("calculateurs.treadmill.incline")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="treadmill-incline"
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    value={incline}
                    onChange={(e) => setIncline(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasValidInput && (
          <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="size-5" />
                {t("calculateurs.treadmill.equivalentEffort")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Pace */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("calculateurs.treadmill.pace")}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {displayPace}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      {getPaceUnit(unit)}
                    </span>
                  </p>
                </div>

                {/* Speed */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("calculateurs.treadmill.speed")}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {displaySpeed}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      {getSpeedUnit(unit)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Zone badge */}
              {matchedZone && (
                <div className="mt-4 pt-4 border-t flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t("calculateurs.treadmill.trainingZone")}
                  </span>
                  <ZoneBadge zone={matchedZone} showLabel size="md" />
                </div>
              )}

              {!vma && (
                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="size-4 shrink-0" />
                  {t("calculateurs.treadmill.configureVma")}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Explanation */}
        <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic">
              {t("calculateurs.treadmill.formula")}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
