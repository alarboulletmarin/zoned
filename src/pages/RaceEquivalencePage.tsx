import { useState, useMemo, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info } from "@/components/icons";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { ZoneScale } from "@/components/visualization";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { Card, CardContent } from "@/components/ui/card";
import { ChronoInput } from "@/components/ui/chrono-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { SEOHead } from "@/components/seo";
import { type ZoneNumber } from "@/types";
import { calculatePaceZones, loadUserZonePrefs } from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";
import { usePickLang } from "@/lib/i18n-utils";
import {
  hmsParamsToSeconds,
  secondsToHmsParams,
  secondsToTimeDigits,
  timeDigitsToSeconds,
} from "@/lib/paceFields";

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
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [searchParams] = useSearchParams();
  const [distanceId, setDistanceId] = useState<string>(
    () => searchParams.get("d") ?? "10k",
  );
  const [customKm, setCustomKm] = useState<string>(() => searchParams.get("km") ?? "");
  // One masked field, digits entering from the right. Shared links still
  // carry `h`, `m`, `s`: summed on the way in, split again on the way out.
  const [timeDigitsValue, setTimeDigitsValue] = useState<string>(() => {
    const id = searchParams.get("d") ?? "10k";
    const km =
      id === "custom"
        ? parseFloat(searchParams.get("km") ?? "") || 0
        : (STANDARD_DISTANCES.find((d) => d.id === id)?.km ?? 0);
    return secondsToTimeDigits(
      hmsParamsToSeconds(searchParams.get("h"), searchParams.get("m"), searchParams.get("s")),
      km,
    );
  });

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
  const totalSeconds = timeDigitsToSeconds(timeDigitsValue, inputDistanceKm) ?? 0;
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

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.equivalence.seoTitle")}
        description={t("calculators:calculateurs.equivalence.seoDescription")}
        canonical="/calculators/equivalence"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.equivalence.seoAppName"),
            description: t("calculators:calculateurs.equivalence.seoAppDescription"),
            url: "https://zoned.run/calculators/equivalence",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.equivalence.seoBreadcrumb") },
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
            {t("calculators:calculateurs.equivalence.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.equivalence.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.equivalence.description")}
          </p>
        </section>

        {/* The prediction below paints a whole zone column. */}
        {paceZones && (
          <div className="zn-num__legend">
            <ZoneScale />
          </div>
        )}

        <section className="zn-num__panel zn-stack zn-tool">
          {/* The result you already have. */}
          <Card>
            <CardContent
              className="zn-stack"
              style={{ "--gap": "var(--sp-12)" } as CSSProperties}
            >
              <div className="zn-calc__field">
                <label htmlFor="distance" className="zn-calc__label">
                  {t("calculators:calculateurs.equivalence.raceDistance")}
                </label>
                <Select value={distanceId} onValueChange={setDistanceId}>
                  <SelectTrigger id="distance" className="zn-tool__wide">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTANCE_OPTIONS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {pickLang(d, "label")}
                        {d.km > 0 ? ` (${d.km} km)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {distanceId === "custom" && (
                  <span className="zn-numfield" style={{ "--field-w": "56px" } as CSSProperties}>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      placeholder="10"
                      value={customKm}
                      onChange={(e) => setCustomKm(e.target.value)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.equivalence.customDistanceLabel")}
                    />
                    <span className="zn-numfield__unit">km</span>
                  </span>
                )}
              </div>

              <div className="zn-calc__field">
                <span className="zn-calc__label">
                  {t("calculators:calculateurs.equivalence.raceTime")}
                </span>
                <span className="zn-numfield">
                  <ChronoInput
                    format="hms"
                    distanceKm={inputDistanceKm}
                    digits={timeDigitsValue}
                    onDigitsChange={setTimeDigitsValue}
                    className="zn-numfield__input zn-numfield__input--chrono"
                    aria-label={t("calculators:calculateurs.equivalence.raceTime")}
                  />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* The same effort, projected onto the four standard distances. */}
          <div className="zn-stack" style={{ "--gap": "var(--sp-13)" } as CSSProperties}>
            {predictions && (
              <>
                <h2 className="zn-title" data-level="4">
                  {t("calculators:calculateurs.equivalence.predictedTimes")}
                </h2>

                <ResponsiveTable
                  data={predictions}
                  rowKey="id"
                  stickyHeader
                  mobileCardTitle={(p) => (
                    <span>
                      {pickLang(p, "label")}
                      {p.isReference && (
                        <span className="zn-faint">
                          {" "}
                          ({t("calculators:calculateurs.equivalence.ref")})
                        </span>
                      )}
                    </span>
                  )}
                  columns={[
                    {
                      key: "distance",
                      header: t("calculators:calculateurs.equivalence.distanceCol"),
                      hideOnMobile: true,
                      cell: (p) => (
                        <>
                          {pickLang(p, "label")}
                          {p.isReference && (
                            <span className="zn-faint">
                              {" "}
                              ({t("calculators:calculateurs.equivalence.ref")})
                            </span>
                          )}
                        </>
                      ),
                    },
                    {
                      key: "time",
                      header: t("calculators:calculateurs.equivalence.timeCol"),
                      className: "zn-num__num",
                      cell: (p) => formatTime(p.predictedSeconds),
                    },
                    {
                      key: "pace",
                      header: t("calculators:calculateurs.equivalence.paceCol"),
                      className: "zn-num__num",
                      cell: (p) =>
                        `${formatPaceValue(convertPace(p.paceMinPerKm, unit))} ${getPaceUnit(unit)}`,
                    },
                    ...(paceZones
                      ? [
                          {
                            key: "zone",
                            header: t("calculators:calculateurs.equivalence.zoneCol"),
                            cell: (p: typeof predictions[number]) =>
                              p.zone ? (
                                <ZoneBadge zone={p.zone} size="sm" />
                              ) : (
                                <span className="zn-faint">-</span>
                              ),
                          },
                        ]
                      : []),
                  ]}
                />

                <div className="zn-cluster">
                  <ShareLinkButton
                    buildUrl={() =>
                      buildParamsUrl("/calculators/equivalence", {
                        d: distanceId,
                        km: customKm,
                        ...secondsToHmsParams(totalSeconds),
                      })
                    }
                    title={t("calculators:calculateurs.equivalence.title")}
                  />
                </div>
              </>
            )}

            <div className="zn-tool__note">
              <Info />
              <p className="zn-body zn-body--sm zn-muted">
                {t("calculators:calculateurs.equivalence.riegelExplanation")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
