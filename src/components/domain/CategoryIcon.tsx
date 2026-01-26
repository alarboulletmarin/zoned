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
  type LucideIcon,
} from "lucide-react";
import type { WorkoutCategory } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<WorkoutCategory, LucideIcon> = {
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

interface CategoryIconProps {
  category: WorkoutCategory;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CategoryIcon({ category, className, size = "md" }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category];
  const sizeClass = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  }[size];

  return <Icon className={cn(sizeClass, className)} />;
}
