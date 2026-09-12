import { useState, useMemo, useCallback, useEffect, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { buildParamsUrl } from "@/lib/share/urlParams";
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

  const [searchParams] = useSearchParams();

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

  // Shared links carry km/h so they survive a unit-system mismatch between
  // sender and recipient; convert into whatever this browser displays.
  const sharedKmh = searchParams.get("kmh");
  useEffect(() => {
    if (!sharedKmh) return;
    const kmh = parseFloat(sharedKmh);
    if (!Number.isFinite(kmh) || kmh <= 0) return;
    handleSpeedChange((isImperial ? kmh * KM_TO_MILES : kmh).toFixed(1));
  }, [sharedKmh, isImperial, handleSpeedChange]);

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

      <div className="zn-num">
        <section
          className="zn-num__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("calculators:calculateurs.converter.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.converter.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.converter.description")}
          </p>
        </section>

        {/* The three units are one value written three ways, so they are three
            equal fields rather than a form and a result. */}
        <section
          className="zn-num__panel zn-stack"
          style={{ "--gap": "var(--sp-14)" } as CSSProperties}
        >
          <div className="zn-grid">
            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
              <label className="zn-kicker" htmlFor="pace-primary">
                {primaryLabel}
              </label>
              <span className="zn-tool__entry">
                <input
                  id="pace-primary"
                  type="text"
                  inputMode="numeric"
                  placeholder="4:30"
                  value={primaryPace}
                  onChange={(e) => handlePrimaryPaceChange(e.target.value)}
                  className="zn-tool__entry-input"
                />
                <span className="zn-tool__entry-unit">{primaryLabel}</span>
              </span>
            </div>

            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
              <label className="zn-kicker" htmlFor="pace-speed">
                {speedLabel}
              </label>
              <span className="zn-tool__entry">
                <input
                  id="pace-speed"
                  type="text"
                  inputMode="decimal"
                  placeholder="13.3"
                  value={speed}
                  onChange={(e) => handleSpeedChange(e.target.value)}
                  className="zn-tool__entry-input"
                />
                <span className="zn-tool__entry-unit">{speedLabel}</span>
              </span>
            </div>

            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
              <label className="zn-kicker" htmlFor="pace-secondary">
                {secondaryLabel}
              </label>
              <span className="zn-tool__entry">
                <input
                  id="pace-secondary"
                  type="text"
                  inputMode="numeric"
                  placeholder="7:14"
                  value={secondaryPace}
                  onChange={(e) => handleSecondaryPaceChange(e.target.value)}
                  className="zn-tool__entry-input"
                />
                <span className="zn-tool__entry-unit">{secondaryLabel}</span>
              </span>
            </div>
          </div>

          {/* One zone on screen, named where it is painted: the badge carries
              its own label, so this surface owes no six-item legend. */}
          {paceZones && currentZone && (
            <div className="zn-stack" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
              <span className="zn-kicker">
                {t("calculators:calculateurs.converter.yourZone")}
              </span>
              <span>
                <ZoneBadge zone={currentZone} showLabel size="lg" />
              </span>
            </div>
          )}

          {currentPaceMinPerKm != null && (
            <div className="zn-cluster">
              <ShareLinkButton
                buildUrl={() =>
                  buildParamsUrl("/calculators/convertisseur", {
                    kmh: (60 / currentPaceMinPerKm).toFixed(2),
                  })
                }
                title={t("calculators:calculateurs.converter.title")}
              />
            </div>
          )}

          <p className="zn-source">
            {t("calculators:calculateurs.converter.displayingUnits", {
              system: isImperial
                ? t("calculators:calculateurs.converter.imperial")
                : t("calculators:calculateurs.converter.metric"),
            })}
          </p>
        </section>
      </div>
    </>
  );
}
