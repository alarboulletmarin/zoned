import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Circle, Mountain } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
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
    // No tint behind the row: the zone is the badge at the end, which carries
    // the code the ink ramp cannot say on its own.
    <Link to={`/workout/${workout.id}`} className={cn("zn-wrow", className)}>
      {/* Title and mobile duration */}
      <div className="zn-wrow__main">
        <span className="zn-wrow__name">{pick(workout, "name")}</span>
        {/* Mobile: show duration below title */}
        <span className="zn-wrow__compact">
          <Clock />
          <span>
            {duration} {t("common:units.minutes")}
          </span>
        </span>
      </div>

      {/* Desktop: show all info inline */}
      <div className="zn-wrow__facts">
        <span className="zn-wrow__category">
          {t(`categories.${workout.category}`)}
        </span>
        <span className="zn-wrow__duration">
          <Clock />
          {duration}
        </span>
        <Badge variant="secondary" className="zn-wrow__difficulty">
          {t(`difficulty.${workout.difficulty}`)}
        </Badge>
        {/* Terrain indicators */}
        <span className="zn-wrow__terrain">
          {workout.environment.requiresTrack && <Circle />}
          {hasTrail && climbLabel ? (
            <>
              <Mountain />
              <span>{climbLabel}</span>
            </>
          ) : (
            workout.environment.requiresHills && <Mountain />
          )}
        </span>
      </div>

      {/* Actions */}
      <div className="zn-wrow__actions">
        <FavoriteButton workoutId={workout.id} size="sm" />
        <ZoneBadge zone={dominantZone} size="sm" />
      </div>
    </Link>
  );
}
