import { cn } from "@/lib/utils";
import type { ZoneSpec, ZoneNumber } from "@/types";
import { getZoneNumber, parseZoneSpan, ZONE_META } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

interface ZoneBadgeProps {
  zone: ZoneSpec | ZoneNumber;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Renders a zone spec as written in the data. A range stays a range —
 * `Z1-Z2` is a progressive jog, not a recovery jog, and flattening it here
 * is what made the phase badge contradict the zone breakdown.
 * Colour follows the dominant (hardest) zone.
 */
export function ZoneBadge({
  zone,
  showLabel = false,
  size = "md",
  className,
}: ZoneBadgeProps) {
  const pickLang = usePickLang();
  const span = typeof zone === "number" ? { min: zone, max: zone } : parseZoneSpan(zone);
  const zoneNum = span?.max ?? (typeof zone === "number" ? zone : getZoneNumber(zone));
  const isRange = span != null && span.min !== span.max;

  const label = isRange
    ? `${pickLang(ZONE_META[span.min], "label")} → ${pickLang(ZONE_META[span.max], "label")}`
    : pickLang(ZONE_META[zoneNum], "label");
  const zoneText = isRange ? `Z${span.min}-Z${span.max}` : `Z${zoneNum}`;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  return (
    <span
      className={cn(
        `zone-${zoneNum}`,
        "zone-badge",
        sizeClasses[size],
        className
      )}
      aria-label={`${zoneText} - ${label}`}
    >
      {zoneText}
      {showLabel && (
        <span className="ml-1">
          {label}
        </span>
      )}
    </span>
  );
}

// Multi-zone display (for workouts with multiple zones)
interface ZoneBadgesProps {
  zones: (ZoneSpec | ZoneNumber)[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ZoneBadges({ zones, size = "sm", className }: ZoneBadgesProps) {
  // Deduplicate zones
  const uniqueZones = [...new Set(zones.map((z) =>
    typeof z === "number" ? z : getZoneNumber(z)
  ))].sort();

  return (
    <div className={cn("flex gap-1 flex-wrap", className)}>
      {uniqueZones.map((zone) => (
        <ZoneBadge key={zone} zone={zone} size={size} />
      ))}
    </div>
  );
}
