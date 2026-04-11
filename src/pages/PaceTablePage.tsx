import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
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
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("calculators:calculateurs.paceTable.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculators:calculateurs.paceTable.subtitle")}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 bg-background border-b">
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  min/km
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  km/h
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  min/mi
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  5K
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  10K
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {t("calculators:calculateurs.paceTable.halfLabel")}
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Marathon
                </th>
                {hasZones && (
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t("calculators:calculateurs.paceTable.yourZone")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isHighlighted =
                  highlightSeconds != null &&
                  row.totalSeconds === highlightSeconds;

                return (
                  <tr
                    key={row.totalSeconds}
                    className={
                      isHighlighted
                        ? "bg-primary/10 font-medium"
                        : "even:bg-muted/50"
                    }
                  >
                    <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap">
                      {formatPace(row.paceMinPerKm)}
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap">
                      {row.kmh.toFixed(1)}
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap">
                      {formatPace(row.paceMinPerMile)}
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap">
                      {formatDuration(row.time5K)}
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap">
                      {formatDuration(row.time10K)}
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap">
                      {formatDuration(row.timeSemi)}
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap">
                      {formatDuration(row.timeMarathon)}
                    </td>
                    {hasZones && (
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {row.zone != null ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-zone-${row.zone}/10 text-zone-${row.zone}`}
                          >
                            Z{row.zone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer notes */}
        {highlightSeconds != null && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("calculators:calculateurs.paceTable.highlightNote")}
          </p>
        )}
      </div>
    </>
  );
}
