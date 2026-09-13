import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { StrengthIntensity } from "@/types/strength";

interface IntensityBadgeProps {
  intensity: StrengthIntensity;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Color mapping for strength intensity levels.
 * Uses CSS variables for theme support.
 *
 * These are the zone ink ramp: themes.css binds --intensity-* to
 * --zone-1/2/3/4/6, because intensity is ordinal exactly the way a zone is.
 * The paint lives in `src/styles/components/strength.css` and selects on
 * `data-intensity`; this table stays because other modules import it.
 */
const INTENSITY_COLORS: Record<StrengthIntensity, string> = {
  mobility: "var(--intensity-mobility)",
  endurance: "var(--intensity-endurance)",
  hypertrophy: "var(--intensity-hypertrophy)",
  strength: "var(--intensity-strength)",
  power: "var(--intensity-power)",
};

export function IntensityBadge({ intensity, size = "md", className }: IntensityBadgeProps) {
  const { t } = useTranslation("strength");
  const label = t(`intensity.${intensity}`);

  return (
    <span
      className={cn("zn-intensity", className)}
      data-intensity={intensity}
      data-size={size}
      title={label}
    >
      {label}
    </span>
  );
}

export { INTENSITY_COLORS };
