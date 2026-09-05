import {
  Leaf,
  Activity,
  Gauge,
  Flame,
  Sprint,
  Route,
  Mountain,
  TreePine,
  Intervals,
  Flag,
  RefreshCw,
  ClipboardCheck,
  Dumbbell,
  Footprints,
  Shield,
  UpperBody,
  Zap,
  Stretching,
  Healing,
  type IconProps,
} from "@/components/icons";
import type { WorkoutCategory } from "@/types";
import type { StrengthCategory } from "@/types/strength";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

/**
 * Single source of truth for category glyphs. Exported so that call sites
 * needing the raw component (a different size, another wrapper) reuse the same
 * mapping instead of keeping a divergent copy.
 */
export const CATEGORY_ICONS: Record<WorkoutCategory, ComponentType<IconProps>> = {
  recovery: Leaf,
  endurance: Activity,
  tempo: Gauge,
  threshold: Flame,
  vma_intervals: Sprint,
  long_run: Route,
  hills: Mountain,
  fartlek: Intervals,
  race_pace: Flag,
  mixed: RefreshCw,
  assessment: ClipboardCheck,
  trail: TreePine,
};

export const STRENGTH_CATEGORY_ICONS: Record<StrengthCategory, ComponentType<IconProps>> = {
  runner_full_body: Dumbbell,
  runner_lower: Footprints,
  runner_core: Shield,
  runner_upper: UpperBody,
  plyometrics: Zap,
  mobility: Stretching,
  prehab: Healing,
};

interface CategoryIconProps {
  category: WorkoutCategory | StrengthCategory;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/** The three steps the Tailwind `size-4/5/6` classes stood for. */
const ICON_SIZES: Record<NonNullable<CategoryIconProps["size"]>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function CategoryIcon({ category, className, size = "md" }: CategoryIconProps) {
  const Icon =
    CATEGORY_ICONS[category as WorkoutCategory] ??
    STRENGTH_CATEGORY_ICONS[category as StrengthCategory];

  if (!Icon) return null;

  // The size rides the icon's own prop, which writes width/height attributes:
  // a class handed in by a call site still overrides them, exactly as it
  // overrode the utility class before.
  return <Icon size={ICON_SIZES[size]} className={cn("zn-cat-icon", className)} />;
}
