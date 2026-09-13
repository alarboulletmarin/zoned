import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Circle, Mountain } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ZoneBadge } from "./ZoneBadge";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import { getWorkoutDuration, ZoneBar, toZoneBarBlocks } from "@/components/visualization";
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
  const name = pick(workout, "name");
  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);
  // Le profil de la séance, au format d'une rangée : la même bar et le même
  // condensé que la carte, dans une vignette de 18px posée avant le favori.
  const blocks = useMemo(() => toZoneBarBlocks(workout), [workout]);
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
        <span className="zn-wrow__name">{name}</span>
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

      {/* Le profil, entre les faits et le favori : la rangée disait la zone
          dominante et la durée, jamais la FORME de la séance, ce qui rendait
          un 30/30 et un footing identiques à l'œil. */}
      {blocks.length > 0 && (
        <ZoneBar
          condense
          blocks={blocks}
          className="zn-profile-mini zn-wrow__profile"
          label={t("library:zoneBar.of", { name })}
        />
      )}

      {/* Actions */}
      <div className="zn-wrow__actions">
        <FavoriteButton workoutId={workout.id} size="sm" />
        <ZoneBadge zone={dominantZone} size="sm" />
      </div>
    </Link>
  );
}
