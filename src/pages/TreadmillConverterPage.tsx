import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info } from "@/components/icons";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { SEOHead } from "@/components/seo";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { CalculatorHero, CalculatorPanel, CalculatorLabel } from "@/components/calculators";
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

  const [searchParams] = useSearchParams();
  const [speed, setSpeed] = useState<string>(() => searchParams.get("speed") ?? "10");
  const [incline, setIncline] = useState<string>(
    () => searchParams.get("incline") ?? "1",
  );
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
        title={t("calculators:calculateurs.treadmill.seoTitle")}
        description={t("calculators:calculateurs.treadmill.seoDescription")}
        canonical="/calculators/tapis-roulant"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.treadmill.seoAppName"),
            description: t("calculators:calculateurs.treadmill.seoAppDescription"),
            url: "https://zoned.run/calculators/tapis-roulant",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.treadmill.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto space-y-6">
        <CalculatorHero
          groupLabel={t("calculators:calculateurs.groups.terrain")}
          title={t("calculators:calculateurs.treadmill.title")}
          description={t("calculators:calculateurs.treadmill.description")}
          className="mb-0"
        />

        {/* Inputs */}
        <CalculatorPanel>
          <CalculatorLabel className="mb-4">
            {t("calculators:calculateurs.treadmill.settings")}
          </CalculatorLabel>
          <div className="grid grid-cols-2 gap-6">
            {/* Speed input */}
            <div>
              <label
                htmlFor="treadmill-speed"
                className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("calculators:calculateurs.treadmill.speed")}
              </label>
              <div className="flex items-baseline gap-2 mt-2">
                <input
                  id="treadmill-speed"
                  type="number"
                  min={4}
                  max={25}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 font-mono text-2xl tabular-nums focus-visible:outline-none focus-visible:border-b-primary"
                />
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  km/h
                </span>
              </div>
            </div>

            {/* Incline input */}
            <div>
              <label
                htmlFor="treadmill-incline"
                className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("calculators:calculateurs.treadmill.incline")}
              </label>
              <div className="flex items-baseline gap-2 mt-2">
                <input
                  id="treadmill-incline"
                  type="number"
                  min={0}
                  max={15}
                  step={0.5}
                  value={incline}
                  onChange={(e) => setIncline(e.target.value)}
                  className="w-full border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 font-mono text-2xl tabular-nums focus-visible:outline-none focus-visible:border-b-primary"
                />
                <span className="font-mono text-xs text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </CalculatorPanel>

        {/* Results */}
        {hasValidInput && (
          <CalculatorPanel>
            <CalculatorLabel className="mb-4">
              {t("calculators:calculateurs.treadmill.equivalentEffort")}
            </CalculatorLabel>
            <div className="grid grid-cols-2 gap-6">
              {/* Pace */}
              <div>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                  {t("calculators:calculateurs.treadmill.pace")}
                </p>
                <p className="font-mono text-3xl tabular-nums mt-1">
                  {displayPace}
                  <span className="text-sm text-muted-foreground ml-1">
                    {getPaceUnit(unit)}
                  </span>
                </p>
              </div>

              {/* Speed */}
              <div>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                  {t("calculators:calculateurs.treadmill.speed")}
                </p>
                <p className="font-mono text-3xl tabular-nums mt-1">
                  {displaySpeed}
                  <span className="text-sm text-muted-foreground ml-1">
                    {getSpeedUnit(unit)}
                  </span>
                </p>
              </div>
            </div>

            {/* Zone badge */}
            {matchedZone && (
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("calculators:calculateurs.treadmill.trainingZone")}
                </span>
                <ZoneBadge zone={matchedZone} showLabel size="md" />
              </div>
            )}

            {!vma && (
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="size-4 shrink-0" />
                {t("calculators:calculateurs.treadmill.configureVma")}
              </div>
            )}
          </CalculatorPanel>
        )}

        <ShareLinkButton
          buildUrl={() =>
            buildParamsUrl("/calculators/tapis-roulant", { speed, incline })
          }
          title={t("calculators:calculateurs.treadmill.title")}
        />

        {/* Explanation */}
        <div className="border-2 border-border/70 px-4 py-3.5">
          <p className="text-sm text-muted-foreground italic">
            {t("calculators:calculateurs.treadmill.formula")}
          </p>
        </div>
      </div>
    </>
  );
}
