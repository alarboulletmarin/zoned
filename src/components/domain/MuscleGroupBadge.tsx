import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import type { MuscleGroup } from "@/types/strength";

interface MuscleGroupBadgeProps {
  muscle: MuscleGroup;
  size?: "sm" | "md" | "lg";
  /** Ink density: a primary mover is solid, a secondary one dashed and muted. */
  involvement?: "primary" | "secondary";
  className?: string;
}

/**
 * Color mapping for muscle groups.
 * Each returns a CSS variable reference for theme support (light/dark).
 *
 * Muscle groups are categorical and there are twelve of them, which is more
 * categories than a paper-and-one-accent system can name. The twelve hues
 * therefore survive the redesign, demoted from a tinted fill to the badge's
 * 1.5px stroke — see the header of `src/styles/components/strength.css`.
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

export function MuscleGroupBadge({
  muscle,
  size = "md",
  involvement = "primary",
  className,
}: MuscleGroupBadgeProps) {
  const { t } = useTranslation("strength");
  const label = t(`muscles.${muscle}`);

  return (
    <span
      className={cn("zn-muscle", className)}
      data-size={size}
      data-involvement={involvement}
      style={{ "--zn-muscle": MUSCLE_COLORS[muscle] } as CSSProperties}
      title={label}
    >
      {label}
    </span>
  );
}

interface MuscleGroupBadgesProps {
  muscles: MuscleGroup[];
  /** Muscles the exercise only assists with. Drawn dashed, after the primaries. */
  secondary?: MuscleGroup[];
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Max number of badges to show before "+N more" */
  max?: number;
}

export function MuscleGroupBadges({
  muscles,
  secondary = [],
  size = "sm",
  className,
  max,
}: MuscleGroupBadgesProps) {
  const { t } = useTranslation("strength");

  // Primaries first, then the assisting muscles, each named once.
  const seen = new Set<MuscleGroup>();
  const unique: { muscle: MuscleGroup; involvement: "primary" | "secondary" }[] = [];
  for (const [list, involvement] of [
    [muscles, "primary"],
    [secondary, "secondary"],
  ] as const) {
    for (const muscle of list) {
      if (seen.has(muscle)) continue;
      seen.add(muscle);
      unique.push({ muscle, involvement });
    }
  }

  const visible = max ? unique.slice(0, max) : unique;
  const remaining = max ? unique.length - max : 0;

  return (
    <div
      className={cn("zn-cluster", className)}
      style={{ "--gap": "var(--sp-2)" } as CSSProperties}
    >
      {visible.map(({ muscle, involvement }) => (
        <MuscleGroupBadge
          key={muscle}
          muscle={muscle}
          size={size}
          involvement={involvement}
        />
      ))}
      {remaining > 0 && (
        <span
          className="zn-muscle"
          data-size={size}
          data-involvement="more"
          title={unique.slice(max).map(({ muscle }) => t(`muscles.${muscle}`)).join(", ")}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

export { MUSCLE_COLORS };
