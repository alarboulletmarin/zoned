import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { MuscleGroup } from "@/types/strength";

interface MuscleGroupBadgeProps {
  muscle: MuscleGroup;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Color mapping for muscle groups.
 * Each returns a CSS variable reference for theme support (light/dark).
 */
const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  // Legs - Blue shades
  quadriceps: "var(--muscle-quadriceps)",
  hamstrings: "var(--muscle-hamstrings)",
  calves: "var(--muscle-calves)",
  // Hips - Orange shades
  glutes: "var(--muscle-glutes)",
  hip_flexors: "var(--muscle-hip_flexors)",
  adductors: "var(--muscle-adductors)",
  // Core - Purple shades
  core_anterior: "var(--muscle-core_anterior)",
  core_lateral: "var(--muscle-core_lateral)",
  core_posterior: "var(--muscle-core_posterior)",
  // Upper body - Cyan shades
  upper_back: "var(--muscle-upper_back)",
  shoulders: "var(--muscle-shoulders)",
  chest: "var(--muscle-chest)",
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
} as const;

export function MuscleGroupBadge({ muscle, size = "md", className }: MuscleGroupBadgeProps) {
  const { t } = useTranslation("strength");
  const color = MUSCLE_COLORS[muscle];
  const label = t(`muscles.${muscle}`);

  return (
    <span
      className={cn("muscle-badge", SIZE_CLASSES[size], className)}
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

interface MuscleGroupBadgesProps {
  muscles: MuscleGroup[];
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Max number of badges to show before "+N more" */
  max?: number;
}

export function MuscleGroupBadges({ muscles, size = "sm", className, max }: MuscleGroupBadgesProps) {
  const { t } = useTranslation("strength");
  const unique = [...new Set(muscles)];
  const visible = max ? unique.slice(0, max) : unique;
  const remaining = max ? unique.length - max : 0;

  return (
    <div className={cn("flex gap-1 flex-wrap", className)}>
      {visible.map((muscle) => (
        <MuscleGroupBadge key={muscle} muscle={muscle} size={size} />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "muscle-badge text-muted-foreground",
            SIZE_CLASSES[size],
          )}
          style={{ backgroundColor: "var(--muted)" }}
          title={unique.slice(max).map((m) => t(`muscles.${m}`)).join(", ")}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

export { MUSCLE_COLORS };
