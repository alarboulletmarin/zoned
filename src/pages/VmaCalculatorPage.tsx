import { useState, useMemo, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { StatBlock } from "@/components/domain/StatBlock";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { ZoneScale } from "@/components/visualization";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { SEOHead } from "@/components/seo";
import { ZONE_META, type ZoneNumber } from "@/types";
import { calculatePaceZones, saveUserZonePrefs, formatPace } from "@/lib/zones";
import { updateBaseData } from "@/lib/runnerProfile";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getPaceUnit } from "@/lib/units";
import { usePickLang } from "@/lib/i18n-utils";

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
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [searchParams] = useSearchParams();
  const [distanceId, setDistanceId] = useState<string>(
    () => searchParams.get("d") ?? "10k",
  );
  const [hours, setHours] = useState<string>(() => searchParams.get("h") ?? "");
  const [minutes, setMinutes] = useState<string>(() => searchParams.get("m") ?? "");
  const [seconds, setSeconds] = useState<string>(() => searchParams.get("s") ?? "");

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
    updateBaseData({ vma: calculatedVma });
    toast.success(t("calculators:calculateurs.vma.vmaSaved", { vma: calculatedVma }));
  };

  const handleCreatePlan = () => {
    if (!calculatedVma) return;
    saveUserZonePrefs({ vma: calculatedVma });
    updateBaseData({ vma: calculatedVma });
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
        title={t("calculators:calculateurs.vma.seoTitle")}
        description={t("calculators:calculateurs.vma.seoDescription")}
        canonical="/calculators/vma"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.vma.seoAppName"),
            description: t("calculators:calculateurs.vma.seoAppDescription"),
            url: "https://zoned.run/calculators/vma",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.vma.seoBreadcrumb") },
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
            {t("calculators:calculateurs.vma.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.vma.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.vma.description")}
          </p>
        </section>

        <section className="zn-num__panel zn-stack zn-tool">
          {/* The race you ran. */}
          <Card>
            <CardContent
              className="zn-stack"
              style={{ "--gap": "var(--sp-12)" } as CSSProperties}
            >
              <div className="zn-calc__field">
                <label htmlFor="distance" className="zn-calc__label">
                  {t("calculators:calculateurs.vma.raceDistance")}
                </label>
                <Select value={distanceId} onValueChange={setDistanceId}>
                  <SelectTrigger id="distance" className="zn-tool__wide">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTANCES.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="zn-caption zn-faint">
                  {t("calculators:calculateurs.vma.vmaPercentUsed", {
                    percent: selectedDistance.vmaPercentage,
                  })}
                </p>
              </div>

              <div className="zn-calc__field">
                <span className="zn-calc__label">
                  {t("calculators:calculateurs.vma.raceTime")}
                </span>
                <div className="zn-num__time">
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={9}
                      placeholder="0"
                      value={hours}
                      onChange={(e) => handleNumericInput(e.target.value, setHours, 9)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.vma.hours")}
                    />
                    <span className="zn-numfield__unit">
                      {t("calculators:calculateurs.vma.hoursShort")}
                    </span>
                  </span>
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="00"
                      value={minutes}
                      onChange={(e) => handleNumericInput(e.target.value, setMinutes, 59)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.vma.minutes")}
                    />
                    <span className="zn-numfield__unit">min</span>
                  </span>
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="00"
                      value={seconds}
                      onChange={(e) => handleNumericInput(e.target.value, setSeconds, 59)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.vma.seconds")}
                    />
                    <span className="zn-numfield__unit">sec</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The speed it implies, and the zones that follow from it. */}
          {calculatedVma && paceZones && (
            <div className="zn-stack" style={{ "--gap": "var(--sp-13)" } as CSSProperties}>
              <StatBlock
                tone="ink"
                size="lg"
                value={`${calculatedVma.toFixed(1)} km/h`}
                label={t("calculators:calculateurs.vma.estimatedVma")}
              />

              <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
                <h2 className="zn-title" data-level="4">
                  {t("calculators:calculateurs.vma.paceZonesPreview")}
                </h2>
                {/* The table below paints a whole zone column, so the ramp is
                    named where it is painted — a legend above the form would
                    appear as the chrono becomes valid and push the field the
                    runner is typing in down the page. */}
                <ZoneScale />
                <ResponsiveTable
                  data={paceZones}
                  rowKey="zone"
                  stickyHeader
                  columns={[
                    {
                      key: "zone",
                      header: t("calculators:calculateurs.vma.zone"),
                      cell: (z) => (
                        <span className="zn-row" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
                          <ZoneBadge zone={z.zone as ZoneNumber} size="sm" />
                          <span className="zn-body zn-body--sm">
                            {pickLang(ZONE_META[z.zone as ZoneNumber], "label")}
                          </span>
                        </span>
                      ),
                    },
                    {
                      key: "pace",
                      header: t("calculators:calculateurs.vma.pace"),
                      className: "zn-num__num",
                      cell: (z) =>
                        `${formatPace(convertPace(z.paceMinPerKm!, unit))}-${formatPace(convertPace(z.paceMaxPerKm!, unit))} ${getPaceUnit(unit)}`,
                    },
                  ]}
                />
              </div>

              <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                <Button onClick={handleUseVma}>
                  <Save />
                  {t("calculators:calculateurs.vma.useThisVma")}
                </Button>
                <Button onClick={handleCreatePlan} variant="outline">
                  <ArrowRight />
                  {t("calculators:calculateurs.vma.createPlan")}
                </Button>
                <ShareLinkButton
                  buildUrl={() =>
                    buildParamsUrl("/calculators/vma", {
                      d: distanceId,
                      h: hours,
                      m: minutes,
                      s: seconds,
                    })
                  }
                  title={t("calculators:calculateurs.vma.title")}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
