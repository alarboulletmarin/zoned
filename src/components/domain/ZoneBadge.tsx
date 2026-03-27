import { cn } from "@/lib/utils";
import type { Zone, ZoneNumber } from "@/types";
import { getZoneNumber, ZONE_META } from "@/types";
import { useTranslation } from "react-i18next";

interface ZoneBadgeProps {
  zone: Zone | ZoneNumber;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ZoneBadge({
  zone,
  showLabel = false,
  size = "md",
  className,
}: ZoneBadgeProps) {
  const { i18n } = useTranslation();
  const zoneNum = typeof zone === "number" ? zone : getZoneNumber(zone);
  const meta = ZONE_META[zoneNum];
  const isEn = i18n.language?.startsWith("en") ?? false;

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
      aria-label={`Zone ${zoneNum} - ${isEn ? meta.labelEn : meta.label}`}
    >
      Z{zoneNum}
      {showLabel && (
        <span className="ml-1">
          {isEn ? meta.labelEn : meta.label}
        </span>
      )}
    </span>
  );
}

// Multi-zone display (for workouts with multiple zones)
interface ZoneBadgesProps {
  zones: (Zone | ZoneNumber)[];
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
