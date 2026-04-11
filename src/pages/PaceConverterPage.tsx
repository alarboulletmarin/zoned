import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { loadUserZonePrefs, calculatePaceZones } from "@/lib/zones";
import type { ZoneNumber } from "@/types";

/**
 * Parse a pace string like "4:30" into total minutes (4.5).
 * Returns null if the input is invalid or incomplete.
 */
function parsePaceInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":");
  if (parts.length !== 2) return null;

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (!Number.isFinite(minutes) || minutes < 0) return null;
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 59) return null;

  return minutes + seconds / 60;
}

/**
 * Format total minutes as "m:ss".
 */
function formatPaceValue(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "";
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  // Handle rounding to 60 seconds
  if (seconds === 60) {
    return `${minutes + 1}:00`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const KM_TO_MILES = 0.621371;

/**
 * Determine which zone a pace falls into given pace zones.
 */
function findZoneForPace(
  paceMinPerKm: number,
  paceZones: ReturnType<typeof calculatePaceZones>
): ZoneNumber | null {
  for (const zone of paceZones) {
    if (
      zone.paceMinPerKm != null &&
      zone.paceMaxPerKm != null &&
      paceMinPerKm >= zone.paceMinPerKm &&
      paceMinPerKm <= zone.paceMaxPerKm
    ) {
      return zone.zone;
    }
  }
  return null;
}

export function PaceConverterPage() {
  const { t } = useTranslation("common");
  const { settings } = useSettings();
  const isImperial = settings.unitSystem === "imperial";

  // Controlled input values (display strings)
  const [primaryPace, setPrimaryPace] = useState("");
  const [speed, setSpeed] = useState("");
  const [secondaryPace, setSecondaryPace] = useState("");

  // Load VMA and compute pace zones
  const userPrefs = useMemo(() => loadUserZonePrefs(), []);
  const paceZones = useMemo(
    () => (userPrefs?.vma ? calculatePaceZones(userPrefs.vma) : null),
    [userPrefs]
  );

  // Compute the current pace in min/km from whichever field was last edited
  // We track a single internal value derived from current field states
  const currentPaceMinPerKm = useMemo(() => {
    // Try to derive from primaryPace first (most recently likely edited)
    // but since we update all three on change, we use speed as canonical
    const speedVal = parseFloat(speed);
    if (Number.isFinite(speedVal) && speedVal > 0) {
      if (isImperial) {
        // speed is mph, convert to km/h first
        const kmh = speedVal / KM_TO_MILES;
        return 60 / kmh;
      }
      return 60 / speedVal;
    }
    return null;
  }, [speed, isImperial]);

  const currentZone = useMemo(() => {
    if (!paceZones || currentPaceMinPerKm == null) return null;
    return findZoneForPace(currentPaceMinPerKm, paceZones);
  }, [paceZones, currentPaceMinPerKm]);

  // Labels depending on unit system
  // When metric: primary = min/km, speed = km/h, secondary = min/mile
  // When imperial: primary = min/mile, speed = mph, secondary = min/km
  const primaryLabel = isImperial ? "min/mi" : "min/km";
  const speedLabel = isImperial ? "mph" : "km/h";
  const secondaryLabel = isImperial ? "min/km" : "min/mi";

  const handlePrimaryPaceChange = useCallback(
    (value: string) => {
      setPrimaryPace(value);
      const parsed = parsePaceInput(value);
      if (parsed == null || parsed <= 0) {
        setSpeed("");
        setSecondaryPace("");
        return;
      }

      if (isImperial) {
        // Primary is min/mile
        const minPerKm = parsed * KM_TO_MILES;
        const kmh = 60 / minPerKm;
        const mph = kmh * KM_TO_MILES;
        setSpeed(mph.toFixed(1));
        setSecondaryPace(formatPaceValue(minPerKm));
      } else {
        // Primary is min/km
        const kmh = 60 / parsed;
        const minPerMile = parsed / KM_TO_MILES;
        setSpeed(kmh.toFixed(1));
        setSecondaryPace(formatPaceValue(minPerMile));
      }
    },
    [isImperial]
  );

  const handleSpeedChange = useCallback(
    (value: string) => {
      setSpeed(value);
      const speedVal = parseFloat(value);
      if (!Number.isFinite(speedVal) || speedVal <= 0) {
        setPrimaryPace("");
        setSecondaryPace("");
        return;
      }

      if (isImperial) {
        // Speed is mph
        const kmh = speedVal / KM_TO_MILES;
        const minPerKm = 60 / kmh;
        const minPerMile = minPerKm / KM_TO_MILES;
        setPrimaryPace(formatPaceValue(minPerMile));
        setSecondaryPace(formatPaceValue(minPerKm));
      } else {
        // Speed is km/h
        const minPerKm = 60 / speedVal;
        const minPerMile = minPerKm / KM_TO_MILES;
        setPrimaryPace(formatPaceValue(minPerKm));
        setSecondaryPace(formatPaceValue(minPerMile));
      }
    },
    [isImperial]
  );

  const handleSecondaryPaceChange = useCallback(
    (value: string) => {
      setSecondaryPace(value);
      const parsed = parsePaceInput(value);
      if (parsed == null || parsed <= 0) {
        setPrimaryPace("");
        setSpeed("");
        return;
      }

      if (isImperial) {
        // Secondary is min/km
        const kmh = 60 / parsed;
        const mph = kmh * KM_TO_MILES;
        const minPerMile = parsed / KM_TO_MILES;
        setSpeed(mph.toFixed(1));
        setPrimaryPace(formatPaceValue(minPerMile));
      } else {
        // Secondary is min/mile
        const minPerKm = parsed * KM_TO_MILES;
        const kmh = 60 / minPerKm;
        setSpeed(kmh.toFixed(1));
        setPrimaryPace(formatPaceValue(minPerKm));
      }
    },
    [isImperial]
  );

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.converter.seoTitle")}
        description={t("calculators:calculateurs.converter.seoDescription")}
        canonical="/calculators/convertisseur"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.converter.seoAppName"),
            description: t("calculators:calculateurs.converter.seoAppDescription"),
            url: "https://zoned.run/calculators/convertisseur",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.converter.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("calculators:calculateurs.converter.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculators:calculateurs.converter.description")}
          </p>
        </div>

        {/* Input grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary pace */}
          <Card>
            <CardContent className="pt-4">
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                {primaryLabel}
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="4:30"
                value={primaryPace}
                onChange={(e) => handlePrimaryPaceChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-2xl font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </CardContent>
          </Card>

          {/* Speed */}
          <Card>
            <CardContent className="pt-4">
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                {speedLabel}
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="13.3"
                value={speed}
                onChange={(e) => handleSpeedChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-2xl font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </CardContent>
          </Card>

          {/* Secondary pace */}
          <Card>
            <CardContent className="pt-4">
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                {secondaryLabel}
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="7:14"
                value={secondaryPace}
                onChange={(e) => handleSecondaryPaceChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-2xl font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </CardContent>
          </Card>
        </div>

        {/* Zone badge */}
        {paceZones && currentZone && (
          <div className="mt-6 flex justify-center">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-zone-${currentZone}/10 text-zone-${currentZone}`}
            >
              {t("calculators:calculateurs.converter.zoneForYou", { zone: currentZone })}
            </span>
          </div>
        )}

        {/* Unit system note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("calculators:calculateurs.converter.displayingUnits", {
            system: isImperial
              ? t("calculators:calculateurs.converter.imperial")
              : t("calculators:calculateurs.converter.metric"),
          })}
        </p>
      </div>
    </>
  );
}
