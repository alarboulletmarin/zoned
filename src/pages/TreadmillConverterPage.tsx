import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { StatBlock } from "@/components/domain/StatBlock";
import { buildParamsUrl } from "@/lib/share/urlParams";
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

      <div className="zn-num">
        <section
          className="zn-num__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("calculators:calculateurs.treadmill.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.treadmill.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.treadmill.description")}
          </p>
        </section>

        <section className="zn-num__panel zn-tool__band zn-stack zn-tool">
          {/* What you set on the machine. */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("calculators:calculateurs.treadmill.settings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="zn-calc__fields">
              <div className="zn-calc__field">
                <label htmlFor="treadmill-speed" className="zn-calc__label">
                  {t("calculators:calculateurs.treadmill.speed")}
                </label>
                <span className="zn-numfield" style={{ "--field-w": "56px" } as CSSProperties}>
                  <input
                    id="treadmill-speed"
                    type="number"
                    min={4}
                    max={25}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="zn-numfield__input"
                  />
                  <span className="zn-numfield__unit">km/h</span>
                </span>
              </div>

              <div className="zn-calc__field">
                <label htmlFor="treadmill-incline" className="zn-calc__label">
                  {t("calculators:calculateurs.treadmill.incline")}
                </label>
                <span className="zn-numfield" style={{ "--field-w": "56px" } as CSSProperties}>
                  <input
                    id="treadmill-incline"
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    value={incline}
                    onChange={(e) => setIncline(e.target.value)}
                    className="zn-numfield__input"
                  />
                  <span className="zn-numfield__unit">%</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* What it costs outside. */}
          <div className="zn-stack" style={{ "--gap": "var(--sp-13)" } as CSSProperties}>
            {hasValidInput ? (
              <>
                <h2 className="zn-title" data-level="4">
                  {t("calculators:calculateurs.treadmill.equivalentEffort")}
                </h2>

                <div className="zn-tool__figures">
                  <StatBlock
                    value={`${displayPace} ${getPaceUnit(unit)}`}
                    label={t("calculators:calculateurs.treadmill.pace")}
                  />
                  <StatBlock
                    value={`${displaySpeed} ${getSpeedUnit(unit)}`}
                    label={t("calculators:calculateurs.treadmill.speed")}
                  />
                </div>

                {/* A single zone, named where it is painted. */}
                {matchedZone && (
                  <div className="zn-row" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                    <span className="zn-kicker">
                      {t("calculators:calculateurs.treadmill.trainingZone")}
                    </span>
                    <ZoneBadge zone={matchedZone} showLabel />
                  </div>
                )}

                {!vma && (
                  <Alert
                    action={
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/my-zones">
                          {t("calculators:calculateurs.treadmill.configureVmaCta")}
                        </Link>
                      </Button>
                    }
                  >
                    {t("calculators:calculateurs.treadmill.configureVma")}
                  </Alert>
                )}

                <div className="zn-cluster">
                  <ShareLinkButton
                    buildUrl={() =>
                      buildParamsUrl("/calculators/tapis-roulant", { speed, incline })
                    }
                    title={t("calculators:calculateurs.treadmill.title")}
                  />
                </div>
              </>
            ) : (
              <Alert kind="warning">
                {t("calculators:calculateurs.treadmill.outOfRange")}
              </Alert>
            )}

            <div className="zn-tool__note">
              <Info />
              <p className="zn-body zn-body--sm zn-muted">
                {t("calculators:calculateurs.treadmill.formula")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
