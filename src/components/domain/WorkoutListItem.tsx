import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Circle, Mountain } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ZoneBadge } from "./ZoneBadge";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types";
import { getDominantZone } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";

interface WorkoutListItemProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function WorkoutListItem({ workout, className }: WorkoutListItemProps) {
  const { t, i18n } = useTranslation(["library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);

  return (
    <Link
      to={`/workout/${workout.id}`}
      className={cn(
        `zone-${dominantZone} bg-gradient-to-r from-zone-${dominantZone}/10 dark:from-zone-${dominantZone}/20 to-transparent`,
        "flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {/* Title and mobile duration */}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm line-clamp-1">
          {isEn ? workout.nameEn : workout.name}
        </span>
        {/* Mobile: show duration below title */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 sm:hidden">
          <Clock className="size-3" />
          <span>
            {duration} {t("common:units.minutes")}
          </span>
        </div>
      </div>

      {/* Desktop: show all info inline */}
      <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground shrink-0">
        <span className="w-24 truncate">
          {t(`categories.${workout.category}`)}
        </span>
        <span className="w-16 flex items-center gap-1">
          <Clock className="size-3.5" />
          {duration}
        </span>
        <Badge variant="secondary" className="w-24 justify-center text-xs">
          {t(`difficulty.${workout.difficulty}`)}
        </Badge>
        {/* Terrain indicators */}
        <div className="w-16 flex items-center gap-1">
          {workout.environment.requiresTrack && (
            <Circle className="size-3.5 text-muted-foreground" />
          )}
          {workout.environment.requiresHills && (
            <Mountain className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <FavoriteButton workoutId={workout.id} size="sm" />
        <ZoneBadge zone={dominantZone} size="sm" />
      </div>
    </Link>
  );
}
