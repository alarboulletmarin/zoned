import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Circle, Mountain } from "@/components/icons";
import { ZoneBadge } from "./ZoneBadge";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";
import { StrengthWorkoutListItem } from "./StrengthWorkoutCard";
import { usePickLang } from "@/lib/i18n-utils";
import { computeTrailMetrics } from "@/lib/workoutMetrics";

interface WorkoutListItemProps {
  workout: AnyWorkoutTemplate;
  className?: string;
}

export function WorkoutListItem({ workout, className }: WorkoutListItemProps) {
  // Branch to strength list item if this is a strength workout
  if (isStrengthWorkout(workout)) {
    return <StrengthWorkoutListItem workout={workout} className={className} />;
  }

  return <RunningWorkoutListItem workout={workout} className={className} />;
}

/** Internal running-only list item */
function RunningWorkoutListItem({ workout, className }: { workout: WorkoutTemplate; className?: string }) {
  const { t } = useTranslation(["library", "common"]);
  const pick = usePickLang();
  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);
  const trail = computeTrailMetrics(workout);
  const hasTrail = trail.totalElevationGainM > 0 || trail.totalElevationLossM > 0 || trail.dominantTerrain != null;
  const climbLabel = trail.totalElevationGainM > 0
    ? `${trail.totalElevationGainM} m`
    : trail.totalElevationLossM > 0
      ? `-${trail.totalElevationLossM} m`
      : null;

  return (
    <Link
      to={`/workout/${workout.id}`}
      className={cn(
        "flex items-center gap-3 p-3 border-2 border-foreground bg-card hover:shadow-[4px_4px_0_var(--shadow-hard)] transition-shadow duration-150 ease-out focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        className
      )}
    >
      <ZoneBadge zone={dominantZone} size="sm" />

      {/* Title and mobile duration */}
      <div className="flex-1 min-w-0">
        <span className="font-sans font-bold uppercase tracking-tight text-sm line-clamp-1">
          {pick(workout, "name")}
        </span>
        {/* Mobile: show duration below title */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground mt-0.5 sm:hidden">
          <Clock className="size-3" />
          <span>
            {duration} {t("common:units.minutes")}
          </span>
        </div>
      </div>

      {/* Desktop: show all info inline */}
      <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground shrink-0">
        <span className="w-24 truncate">
          {t(`categories.${workout.category}`)}
        </span>
        <span className="w-16 flex items-center gap-1">
          <Clock className="size-3.5" />
          {duration}
        </span>
        <span className="w-24 truncate">
          {t(`difficulty.${workout.difficulty}`)}
        </span>
        {/* Terrain indicators */}
        <div className="w-20 flex items-center gap-1">
          {workout.environment.requiresTrack && (
            <Circle className="size-3.5" />
          )}
          {hasTrail && climbLabel ? (
            <span className="flex items-center gap-1">
              <Mountain className="size-3.5" />
              <span>{climbLabel}</span>
            </span>
          ) : (
            workout.environment.requiresHills && (
              <Mountain className="size-3.5" />
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <FavoriteButton workoutId={workout.id} size="sm" />
      </div>
    </Link>
  );
}
