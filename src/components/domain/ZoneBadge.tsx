import { cn } from "@/lib/utils";
import type { ZoneSpec, ZoneNumber } from "@/types";
import { getZoneNumber, ZONE_META } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

interface ZoneBadgeProps {
  zone: ZoneSpec | ZoneNumber;
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
  const pickLang = usePickLang();
  const zoneNum = typeof zone === "number" ? zone : getZoneNumber(zone);
  const meta = ZONE_META[zoneNum];
  const label = pickLang(meta, "label");

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
      aria-label={`Zone ${zoneNum} - ${label}`}
    >
      Z{zoneNum}
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
