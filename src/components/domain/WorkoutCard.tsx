import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Circle, Mountain } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ZoneBadges } from "./ZoneBadge";
import { FavoriteButton } from "./FavoriteButton";
import { getWorkoutZones } from "@/lib/landing-stats";
import {
  ZoneBar,
  toZoneBarBlocks,
  getWorkoutDuration,
  formatDurationMinutes,
  MiniElevationProfile,
} from "@/components/visualization";
import { computeTrailMetrics } from "@/lib/workoutMetrics";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import {
  StrengthWorkoutCard,
  StrengthWorkoutCardCompact,
} from "./StrengthWorkoutCard";
import { usePickLang } from "@/lib/i18n-utils";

interface WorkoutCardProps {
  workout: AnyWorkoutTemplate;
  className?: string;
}

export function WorkoutCard({ workout, className }: WorkoutCardProps) {
  // Branch to strength card if this is a strength workout
  if (isStrengthWorkout(workout)) {
    return <StrengthWorkoutCard workout={workout} className={className} />;
  }

  return <RunningWorkoutCard workout={workout} className={className} />;
}

/**
 * Shared presentational shell for a running-family workout (running, cycling,
 * swimming), and the piece the rest of the app reuses.
 *
 * It reads in the system's order: the session name, why you would run it, the
 * zone profile, then the facts — zone, duration, level, and the catalogue code
 * in vermillon at the end of the line. Slots keep the same card serving both
 * the library grid (wrapped in a Link, with favourite + peek) and the "draw a
 * session" result (no link, with an eyebrow, zone badges and a metrics grid).
 *
 * Defaults reproduce the library card, so existing call sites keep their
 * behaviour without passing any new prop.
 */
interface WorkoutCardChromeProps {
  workout: WorkoutTemplate;
  className?: string;
  /** Hover affordance: keep on when the card is wrapped in a link. */
  interactive?: boolean;
  /** Content rendered above the title (e.g. discipline · method · n°). */
  eyebrow?: React.ReactNode;
  /** Content rendered after the badge row (e.g. a metrics grid). */
  metrics?: React.ReactNode;
  /** Show the zone badges for every zone the workout touches. */
  showZoneBadges?: boolean;
  showFavorite?: boolean;
  showPeek?: boolean;
  showBadges?: boolean;
}

export function WorkoutCardChrome({
  workout,
  className,
  interactive = true,
  eyebrow,
  metrics,
  showZoneBadges = false,
  showFavorite = true,
  showPeek = true,
  showBadges = true,
}: WorkoutCardChromeProps) {
  const { t } = useTranslation(["library", "common"]);
  const pick = usePickLang();
  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);
  const name = pick(workout, "name");

  // The profile: one block per phase, width = time, intensity by ink and by
  // height. Memoised because it walks the whole workout structure.
  const blocks = useMemo(() => toZoneBarBlocks(workout), [workout]);

  // First main-set block description — the one-line summary under the profile.
  const summary = useMemo(() => {
    const firstMain = workout.mainSetTemplate[0];
    return firstMain ? pick(firstMain, "description") : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout, pick]);

  const trailMetrics = useMemo(() => computeTrailMetrics(workout), [workout]);
  const hasTrail =
    trailMetrics.totalElevationGainM > 0 ||
    trailMetrics.totalElevationLossM > 0 ||
    trailMetrics.dominantTerrain != null;

  const zones = useMemo(
    () => (showZoneBadges ? getWorkoutZones(workout) : []),
    [showZoneBadges, workout],
  );

  return (
    <article className={cn("zn-wcard", className)} data-interactive={interactive}>
      {eyebrow && <div className="zn-wcard__eyebrow">{eyebrow}</div>}

      <div className="zn-row zn-row--start" style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}>
        <h3 className="zn-wcard__title zn-fill">{name}</h3>
        {showFavorite && <FavoriteButton workoutId={workout.id} size="sm" />}
      </div>

      {/* The template's prose description used to sit here. A card is a
          preview: the name says which session it is, the profile says what it
          costs, and the fact line says the zone, the duration and the level.
          The paragraph is what the detail page is for — and on a phone it was
          two clamped lines that broke mid-word. `description` is untouched in
          the data and still rendered on /workout/:id. */}

      {blocks.length > 0 && (
        <ZoneBar
          condense
          blocks={blocks}
          label={t("library:zoneBar.of", { name })}
        />
      )}

      {showZoneBadges && zones.length > 0 && <ZoneBadges zones={zones} size="sm" />}

      {showBadges && (
        <div className="zn-cluster">
          {workout.environment.requiresTrack && (
            <Badge variant="outline">
              <Circle size={12} />
              {t("common:library.track")}
            </Badge>
          )}
          {workout.environment.requiresHills && !hasTrail && (
            <Badge variant="outline">
              <Mountain size={12} />
              {t("common:library.hills")}
            </Badge>
          )}
          {hasTrail && trailMetrics.totalElevationGainM > 0 && (
            <Badge variant="outline">
              <Mountain size={12} />
              {t("library:trail.elevationGain", { value: trailMetrics.totalElevationGainM })}
            </Badge>
          )}
          {hasTrail && trailMetrics.totalElevationLossM > 0 && (
            <Badge variant="outline">
              {t("library:trail.elevationLoss", { value: trailMetrics.totalElevationLossM })}
            </Badge>
          )}
          {hasTrail && trailMetrics.dominantTerrain && (
            <Badge variant="outline">
              {t(`library:trail.terrainType.${trailMetrics.dominantTerrain}`)}
            </Badge>
          )}
        </div>
      )}

      {/* Optional metrics grid (draw result) */}
      {metrics}

      {showPeek && (
        <>
          {summary && <p className="zn-wcard__summary">{summary}</p>}
          {hasTrail && <MiniElevationProfile workout={workout} height={28} />}
        </>
      )}

      <div className="zn-wcard__meta">
        <span className="zn-wcard__zone">Z{dominantZone}</span>
        <span className="zn-wcard__fact">{formatDurationMinutes(duration)}</span>
        <span className="zn-wcard__fact">{t(`difficulty.${workout.difficulty}`)}</span>
        <span className="zn-wcard__code">{workout.id}</span>
      </div>
    </article>
  );
}

/** Internal running-only card with properly typed props */
function RunningWorkoutCard({ workout, className }: { workout: WorkoutTemplate; className?: string }) {
  return (
    <Link to={`/workout/${workout.id}`} className="zn-wcard-link">
      <WorkoutCardChrome
        workout={workout}
        className={className}
        interactive={false}
      />
    </Link>
  );
}

// Compact version for related workouts
interface WorkoutCardCompactProps {
  workout: AnyWorkoutTemplate;
  className?: string;
}

export function WorkoutCardCompact({
  workout,
  className,
}: WorkoutCardCompactProps) {
  // Branch to strength compact card if this is a strength workout
  if (isStrengthWorkout(workout)) {
    return <StrengthWorkoutCardCompact workout={workout} className={className} />;
  }

  return <RunningWorkoutCardCompact workout={workout} className={className} />;
}

/** Internal running-only compact card */
function RunningWorkoutCardCompact({ workout, className }: { workout: WorkoutTemplate; className?: string }) {
  const pick = usePickLang();
  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);
  const trail = computeTrailMetrics(workout);
  const climbLabel = trail.totalElevationGainM > 0
    ? `${trail.totalElevationGainM} m`
    : trail.totalElevationLossM > 0
      ? `-${trail.totalElevationLossM} m`
      : null;

  return (
    <Link to={`/workout/${workout.id}`} className="zn-wcard-link">
      <article className={cn("zn-wcard", className)} data-size="compact">
        <div className="zn-row zn-row--start" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
          <h3 className="zn-wcard__title zn-fill">{pick(workout, "name")}</h3>
          <FavoriteButton workoutId={workout.id} size="sm" />
        </div>
        <div className="zn-wcard__meta">
          <span className="zn-wcard__zone">Z{dominantZone}</span>
          <span className="zn-wcard__fact">{formatDurationMinutes(duration)}</span>
          {climbLabel && <span className="zn-wcard__fact">{climbLabel}</span>}
          <span className="zn-wcard__code">{workout.id}</span>
        </div>
      </article>
    </Link>
  );
}
