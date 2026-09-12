import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { ZoneScale } from "@/components/visualization";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/ui/responsive-table";
import { loadUserZonePrefs, calculatePaceZones } from "@/lib/zones";
import type { ZoneNumber } from "@/types";

const KM_TO_MILES = 0.621371;

interface PaceRow {
  totalSeconds: number;
  paceMinPerKm: number;
  kmh: number;
  paceMinPerMile: number;
  time5K: number; // minutes
  time10K: number;
  timeSemi: number;
  timeMarathon: number;
  zone: ZoneNumber | null;
}

/**
 * Format a pace value (min/km or min/mile) as "m:ss".
 */
function formatPace(totalMinutes: number): string {
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  if (seconds === 60) {
    return `${minutes + 1}:00`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format a duration in minutes as "h:mm:ss" or "mm:ss".
 */
function formatDuration(totalMinutes: number): string {
  const totalSeconds = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Find which zone a pace falls into.
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

export function PaceTablePage() {
  const { t } = useTranslation("common");
  const userPrefs = useMemo(() => loadUserZonePrefs(), []);
  const paceZones = useMemo(
    () => (userPrefs?.vma ? calculatePaceZones(userPrefs.vma) : null),
    [userPrefs]
  );

  // VMA pace at 100% (the row to highlight)
  const vmaPaceMinPerKm = useMemo(() => {
    if (!userPrefs?.vma) return null;
    return 60 / userPrefs.vma;
  }, [userPrefs]);

  const hasZones = paceZones != null;

  // Generate rows from 3:00/km to 10:00/km in 10-second steps
  const rows = useMemo<PaceRow[]>(() => {
    const result: PaceRow[] = [];
    for (let s = 180; s <= 600; s += 10) {
      const paceMinPerKm = s / 60;
      const kmh = 60 / paceMinPerKm;
      const paceMinPerMile = paceMinPerKm / KM_TO_MILES;
      const time5K = paceMinPerKm * 5;
      const time10K = paceMinPerKm * 10;
      const timeSemi = paceMinPerKm * 21.1;
      const timeMarathon = paceMinPerKm * 42.195;
      const zone = paceZones
        ? findZoneForPace(paceMinPerKm, paceZones)
        : null;

      result.push({
        totalSeconds: s,
        paceMinPerKm,
        kmh,
        paceMinPerMile,
        time5K,
        time10K,
        timeSemi,
        timeMarathon,
        zone,
      });
    }
    return result;
  }, [paceZones]);

  // Find the row closest to VMA pace (100%) for highlighting
  const highlightSeconds = useMemo(() => {
    if (vmaPaceMinPerKm == null) return null;
    const vmaTotalSeconds = vmaPaceMinPerKm * 60;
    // Round to nearest 10s step
    const rounded = Math.round(vmaTotalSeconds / 10) * 10;
    // Clamp within range
    return Math.max(180, Math.min(600, rounded));
  }, [vmaPaceMinPerKm]);

  // Every figure is a mono column, right-aligned on its digits.
  const numericCell = "zn-num__num";

  // ResponsiveTable: real <table> at md+, stacked key/value cards on phones so
  // every column (incl. semi/marathon) is readable without horizontal scroll (#104).
  const columns = useMemo<ResponsiveTableColumn<PaceRow>[]>(() => {
    const base: ResponsiveTableColumn<PaceRow>[] = [
      { key: "kmPace", header: "min/km", className: numericCell, cell: (r) => formatPace(r.paceMinPerKm) },
      { key: "kmh", header: "km/h", className: numericCell, cell: (r) => r.kmh.toFixed(1) },
      { key: "milePace", header: "min/mi", className: numericCell, cell: (r) => formatPace(r.paceMinPerMile) },
      { key: "5k", header: "5K", className: numericCell, cell: (r) => formatDuration(r.time5K) },
      { key: "10k", header: "10K", className: numericCell, cell: (r) => formatDuration(r.time10K) },
      {
        key: "semi",
        header: t("calculators:calculateurs.paceTable.halfLabel"),
        className: numericCell,
        cell: (r) => formatDuration(r.timeSemi),
      },
      { key: "marathon", header: "Marathon", className: numericCell, cell: (r) => formatDuration(r.timeMarathon) },
    ];
    if (hasZones) {
      base.push({
        key: "zone",
        header: t("calculators:calculateurs.paceTable.yourZone"),
        cell: (r) =>
          r.zone != null ? (
            <ZoneBadge zone={r.zone} size="sm" />
          ) : (
            <span className="zn-faint">—</span>
          ),
      });
    }
    return base;
  }, [hasZones, t]);

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.paceTable.seoTitle")}
        description={t("calculators:calculateurs.paceTable.seoDescription")}
        canonical="/calculators/table-allures"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.paceTable.seoAppName"),
            description: t("calculators:calculateurs.paceTable.seoAppDescription"),
            url: "https://zoned.run/calculators/table-allures",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.paceTable.seoBreadcrumb") },
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
            {t("calculators:calculateurs.paceTable.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.paceTable.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.paceTable.subtitle")}
          </p>
        </section>

        {/* The table paints a whole zone column, so the ramp is named once. */}
        {hasZones && (
          <div className="zn-num__legend">
            <ZoneScale />
          </div>
        )}

        <section
          className="zn-num__panel zn-stack"
          style={{ "--gap": "var(--sp-10)" } as CSSProperties}
        >
          <ResponsiveTable
            data={rows}
            columns={columns}
            rowKey="totalSeconds"
            stickyHeader
            mobileCardTitle={(row) => (
              <span className="zn-mono">
                {formatPace(row.paceMinPerKm)}
                <span className="zn-faint"> /km</span>
              </span>
            )}
            rowClassName={(row) =>
              highlightSeconds != null && row.totalSeconds === highlightSeconds
                ? "zn-tool__mark"
                : undefined
            }
          />

          {highlightSeconds != null && (
            <p className="zn-caption zn-muted">
              {t("calculators:calculateurs.paceTable.highlightNote")}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
