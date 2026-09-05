import { useState, useMemo, useRef, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Route, Download } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { exportToPNG } from "@/lib/export/png";
import { convertPace, convertDistance, getPaceUnit, getDistanceUnit } from "@/lib/units";
import { generateSplits, formatSplitTime as formatTime, formatPaceDisplay } from "@/lib/splits";
import type { SplitStrategy as Strategy } from "@/lib/splits";
import { usePickLang } from "@/lib/i18n-utils";

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

/**
 * One printed line of the split table. The total is the last row rather than a
 * `<tfoot>`: ResponsiveTable renders one row shape on desktop and on the phone,
 * and a footer would only exist on one of the two.
 */
interface SplitTableRow {
  id: string;
  marker: string;
  distance: string;
  split: string;
  pace: string;
  cumulative: string;
  isTotal: boolean;
}

export function SplitGeneratorPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const { settings } = useSettings();
  const unit = settings.unitSystem;
  const tableRef = useRef<HTMLDivElement>(null);

  // Inputs
  const [searchParams] = useSearchParams();
  const [selectedRace, setSelectedRace] = useState<string>(
    () => searchParams.get("d") ?? "10",
  );
  const [customDistance, setCustomDistance] = useState<string>(
    () => searchParams.get("km") ?? "",
  );
  const [hours, setHours] = useState<string>(() => searchParams.get("h") ?? "0");
  const [minutes, setMinutes] = useState<string>(() => searchParams.get("m") ?? "45");
  const [seconds, setSeconds] = useState<string>(() => searchParams.get("s") ?? "0");
  const [strategy, setStrategy] = useState<Strategy>(() => {
    const shared = searchParams.get("strat");
    return shared === "negative" || shared === "positive" ? shared : "even";
  });

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

  const tableRows = useMemo<SplitTableRow[]>(() => {
    if (splits.length === 0) return [];

    const rows: SplitTableRow[] = splits.map((split) => {
      const converted = convertDistance(split.distance, unit);
      return {
        id: String(split.index),
        marker: String(split.index),
        distance: `${
          split.distance < 0.999
            ? converted.toFixed(2)
            : converted.toFixed(unit === "imperial" ? 2 : 0)
        } ${distanceUnitLabel}`,
        split: formatTime(split.splitTimeSeconds),
        pace: `${formatPaceDisplay(convertPace(split.paceMinPerKm, unit))}${paceUnitLabel}`,
        cumulative: formatTime(split.cumulativeTimeSeconds),
        isTotal: false,
      };
    });

    rows.push({
      id: "total",
      marker: t("calculators:calculateurs.splits.total"),
      distance: `${convertDistance(distanceKm, unit).toFixed(
        unit === "imperial" ? 2 : 1,
      )} ${distanceUnitLabel}`,
      split: "",
      pace: `${formatPaceDisplay(
        convertPace(totalTimeSeconds / 60 / distanceKm, unit),
      )}${paceUnitLabel}`,
      cumulative: formatTime(totalTimeSeconds),
      isTotal: true,
    });

    return rows;
  }, [splits, unit, distanceUnitLabel, paceUnitLabel, distanceKm, totalTimeSeconds, t]);

  const handleExport = async () => {
    if (!tableRef.current) return;
    const distLabel = isCustom ? `${distanceKm}km` : `${selectedRace}`;
    await exportToPNG(tableRef, `splits-${distLabel}`);
  };

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.splits.seoTitle")}
        description={t("calculators:calculateurs.splits.seoDescription")}
        canonical="/calculators/splits"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.splits.seoAppName"),
            description: t("calculators:calculateurs.splits.seoAppDescription"),
            url: "https://zoned.run/calculators/splits",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.splits.seoBreadcrumb") },
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
            {t("calculators:calculateurs.splits.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.splits.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.splits.description")}
          </p>
        </section>

        <section className="zn-num__panel zn-tool__band zn-stack zn-tool">
          {/* The race you are pacing. */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("calculators:calculateurs.splits.raceParams")}
              </CardTitle>
            </CardHeader>
            <CardContent
              className="zn-stack"
              style={{ "--gap": "var(--sp-12)" } as CSSProperties}
            >
              <div className="zn-calc__field">
                <label htmlFor="split-distance" className="zn-calc__label">
                  {t("calculators:calculateurs.splits.distance")}
                </label>
                <Select value={selectedRace} onValueChange={setSelectedRace}>
                  <SelectTrigger id="split-distance" className="zn-tool__wide">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RACE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.distanceKm} value={opt.distanceKm.toString()}>
                        {pickLang(opt, "label")}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      {t("calculators:calculateurs.splits.custom")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isCustom && (
                  <span className="zn-numfield" style={{ "--field-w": "56px" } as CSSProperties}>
                    <input
                      type="number"
                      min={0.5}
                      max={200}
                      step={0.1}
                      placeholder={t("calculators:calculateurs.splits.customDistancePlaceholder")}
                      value={customDistance}
                      onChange={(e) => setCustomDistance(e.target.value)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.splits.customDistanceLabel")}
                    />
                    <span className="zn-numfield__unit">km</span>
                  </span>
                )}
              </div>

              <div className="zn-calc__field">
                <span className="zn-calc__label">
                  {t("calculators:calculateurs.splits.targetTime")}
                </span>
                <div className="zn-num__time">
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.splits.hours")}
                    />
                    <span className="zn-numfield__unit">h</span>
                  </span>
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.splits.minutes")}
                    />
                    <span className="zn-numfield__unit">min</span>
                  </span>
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.splits.seconds")}
                    />
                    <span className="zn-numfield__unit">s</span>
                  </span>
                </div>
              </div>

              <div className="zn-calc__field">
                <span className="zn-calc__label">
                  {t("calculators:calculateurs.splits.strategy")}
                </span>
                <Segmented
                  value={strategy}
                  onChange={setStrategy}
                  label={t("calculators:calculateurs.splits.strategy")}
                  options={[
                    {
                      value: "even",
                      label: t("calculators:calculateurs.splits.even"),
                      title: t("calculators:calculateurs.splits.evenSplits"),
                    },
                    {
                      value: "negative",
                      label: t("calculators:calculateurs.splits.negative"),
                      title: t("calculators:calculateurs.splits.negativeSplits"),
                    },
                    {
                      value: "positive",
                      label: t("calculators:calculateurs.splits.positive"),
                      title: t("calculators:calculateurs.splits.positiveSplits"),
                    },
                  ]}
                />
                <p className="zn-caption zn-faint">
                  {strategy === "even" && t("calculators:calculateurs.splits.evenDesc")}
                  {strategy === "negative" && t("calculators:calculateurs.splits.negativeDesc")}
                  {strategy === "positive" && t("calculators:calculateurs.splits.positiveDesc")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* The race, kilometre by kilometre. */}
          <div className="zn-stack" style={{ "--gap": "var(--sp-13)" } as CSSProperties}>
            {tableRows.length > 0 ? (
              <>
                {/* The PNG export flattens this block, so it carries its own
                    opaque paper rather than relying on the page behind it. */}
                <div ref={tableRef} className="zn-tool__sheet">
                  <h2 className="zn-title" data-level="4">
                    {t("calculators:calculateurs.splits.splitTable")}
                  </h2>
                  <ResponsiveTable
                    data={tableRows}
                    rowKey="id"
                    mobileCardTitle={(row) => (
                      <span className="zn-mono">{row.marker}</span>
                    )}
                    rowClassName={(row) => (row.isTotal ? "zn-tool__total" : undefined)}
                    columns={[
                      {
                        key: "marker",
                        header: "#",
                        className: "zn-num__num",
                        hideOnMobile: true,
                        cell: (row) => row.marker,
                      },
                      {
                        key: "distance",
                        header: t("calculators:calculateurs.splits.dist"),
                        className: "zn-num__num",
                        cell: (row) => row.distance,
                      },
                      {
                        key: "split",
                        header: t("calculators:calculateurs.splits.split"),
                        className: "zn-num__num",
                        cell: (row) => row.split,
                      },
                      {
                        key: "pace",
                        header: t("calculators:calculateurs.splits.paceLabel"),
                        className: "zn-num__num",
                        cell: (row) => row.pace,
                      },
                      {
                        key: "cumul",
                        header: t("calculators:calculateurs.splits.cumul"),
                        className: "zn-num__num",
                        cell: (row) => row.cumulative,
                      },
                    ]}
                  />
                </div>

                <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                  <Button onClick={handleExport}>
                    <Download />
                    {t("calculators:calculateurs.splits.downloadPng")}
                  </Button>
                  <ShareLinkButton
                    buildUrl={() =>
                      buildParamsUrl("/calculators/splits", {
                        d: selectedRace,
                        km: customDistance,
                        h: hours,
                        m: minutes,
                        s: seconds,
                        strat: strategy,
                      })
                    }
                    title={t("calculators:calculateurs.splits.title")}
                  />
                </div>
              </>
            ) : (
              <EmptyState
                icon={Route}
                variant="not-started"
                title={t("calculators:calculateurs.splits.emptyTitle")}
                description={t("calculators:calculateurs.splits.emptyState")}
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
