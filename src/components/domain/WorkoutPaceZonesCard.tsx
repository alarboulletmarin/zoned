import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { zoneClass } from "@/lib/zoneColors";
import { formatPace } from "@/lib/zones";
import { cn } from "@/lib/utils";
import type { ZoneNumber, ZoneRange } from "@/types";

interface WorkoutPaceZonesCardProps {
  /** The runner's full zone table, as returned by `calculateAllZones()`. */
  zones: ZoneRange[];
  /** Runner's VMA (km/h), shown in the header. */
  vma: number;
  /** The workout's dominant zone — highlighted in the table. */
  targetZone: ZoneNumber;
  className?: string;
}

/**
 * Compact personal pace table for the workout detail sidebar: one row per
 * zone with a pace range in min/km, the session's own zone highlighted.
 * Mirrors the read-only table on `/me` (MePage) but scoped to pace only —
 * HR-only preferences carry no pace data and render nothing (see caller).
 */
export function WorkoutPaceZonesCard({ zones, vma, targetZone, className }: WorkoutPaceZonesCardProps) {
  const { t } = useTranslation("session");

  const paceZones = zones.filter(
    (z) => z.paceMinPerKm !== undefined && z.paceMaxPerKm !== undefined
  );
  if (paceZones.length === 0) return null;

  return (
    <div className={className}>
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
        {t("paceZones.title", { vma })}
      </p>
      <div className="mt-3 border-t border-border">
        {paceZones.map((z) => {
          const zone = z.zone;
          const isTarget = zone === targetZone;
          return (
            <div
              key={zone}
              className={cn(
                "grid grid-cols-[44px_1fr] border-b border-border font-mono text-sm",
                isTarget && "bg-accent-acid text-ink font-bold"
              )}
            >
              <span className={cn("px-2.5 py-2", !isTarget && zoneClass(zone, "text"))}>
                Z{zone}
              </span>
              <span className={cn("px-2.5 py-2", !isTarget && "text-muted-foreground")}>
                {formatPace(z.paceMinPerKm!)}–{formatPace(z.paceMaxPerKm!)}/km
              </span>
            </div>
          );
        })}
      </div>
      <Link
        to="/me/zones"
        className="mt-2.5 inline-block font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("paceZones.editLink")}
      </Link>
    </div>
  );
}
