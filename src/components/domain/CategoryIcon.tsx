import {
  Leaf,
  Activity,
  Gauge,
  Flame,
  Rocket,
  Route,
  Mountain,
  Crosshair,
  Flag,
  RefreshCw,
  ClipboardCheck,
  Dumbbell,
  Footprints,
  Shield,
  ArrowUp,
  Zap,
  Waves,
  HeartPulse,
  type IconProps,
} from "@/components/icons";
import type { WorkoutCategory } from "@/types";
import type { StrengthCategory } from "@/types/strength";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

const CATEGORY_ICONS: Record<WorkoutCategory, ComponentType<IconProps>> = {
  recovery: Leaf,
  endurance: Activity,
  tempo: Gauge,
  threshold: Flame,
  vma_intervals: Rocket,
  long_run: Route,
  hills: Mountain,
  fartlek: Crosshair,
  race_pace: Flag,
  mixed: RefreshCw,
  assessment: ClipboardCheck,
};

const STRENGTH_CATEGORY_ICONS: Record<StrengthCategory, ComponentType<IconProps>> = {
  runner_full_body: Dumbbell,
  runner_lower: Footprints,
  runner_core: Shield,
  runner_upper: ArrowUp,
  plyometrics: Zap,
  mobility: Waves,
  prehab: HeartPulse,
};

interface CategoryIconProps {
  category: WorkoutCategory | StrengthCategory;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CategoryIcon({ category, className, size = "md" }: CategoryIconProps) {
  const Icon =
    CATEGORY_ICONS[category as WorkoutCategory] ??
    STRENGTH_CATEGORY_ICONS[category as StrengthCategory];
  const sizeClass = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  }[size];

  if (!Icon) return null;

  return <Icon className={cn(sizeClass, className)} />;
}
