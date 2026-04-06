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
 */
const INTENSITY_COLORS: Record<StrengthIntensity, string> = {
  mobility: "var(--intensity-mobility)",
  endurance: "var(--intensity-endurance)",
  hypertrophy: "var(--intensity-hypertrophy)",
  strength: "var(--intensity-strength)",
  power: "var(--intensity-power)",
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
} as const;

export function IntensityBadge({ intensity, size = "md", className }: IntensityBadgeProps) {
  const { t } = useTranslation("strength");
  const color = INTENSITY_COLORS[intensity];
  const label = t(`intensity.${intensity}`);

  return (
    <span
      className={cn("intensity-badge", SIZE_CLASSES[size], className)}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
      title={label}
    >
      {label}
    </span>
  );
}

export { INTENSITY_COLORS };
