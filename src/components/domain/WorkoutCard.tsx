import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Circle,
  Mountain,
} from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveCard } from "@/components/editorial";
import { ZoneBadge, ZoneBadges } from "./ZoneBadge";
import { CATEGORY_ICONS } from "./CategoryIcon";
import { DifficultyIcon } from "./DifficultyIcon";
import { FavoriteButton } from "./FavoriteButton";
import { getWorkoutZones } from "@/lib/landing-stats";
import {
  SessionIntensityBar,
  transformSessionBlocks,
  getWorkoutDuration,
  formatDurationMinutes,
  MiniElevationProfile,
} from "@/components/visualization";
import { computeTrailMetrics } from "@/lib/workoutMetrics";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { WorkoutTemplate, AnyWorkoutTemplate } from "@/types";
import { getDominantZone, getWorkoutDiscipline, isStrengthWorkout } from "@/types";
import { useZoneColors } from "@/hooks/useZoneColors";
import { StrengthWorkoutCard, StrengthWorkoutCardCompact } from "./StrengthWorkoutCard";
import { usePickLang } from "@/lib/i18n-utils";

interface WorkoutCardProps {
  workout: AnyWorkoutTemplate;
  className?: string;
  expanded?: boolean;
}

export function WorkoutCard({ workout, className, expanded }: WorkoutCardProps) {
  // Branch to strength card if this is a strength workout
  if (isStrengthWorkout(workout)) {
    return <StrengthWorkoutCard workout={workout} className={className} expanded={expanded} />;
  }

  return <RunningWorkoutCard workout={workout} className={className} expanded={expanded} />;
}

/**
 * Shared presentational shell for a running-family workout (running, cycling,
 * swimming). Renders the visual chrome (zone gradient, title, description,
 * intensity bar, duration/category line) and exposes slots so the same card
 * can serve both the library grid (wrapped in a Link, with favourite + peek)
 * and the "draw a session" result (no link, with an eyebrow, zone badges, a
 * metrics grid and action buttons).
 *
 * Defaults reproduce the original library card exactly, so existing call sites
 * keep their behaviour without passing any new prop.
 */
interface WorkoutCardChromeProps {
  workout: WorkoutTemplate;
  className?: string;
  expanded?: boolean;
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
  expanded,
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
  const CategoryIcon = CATEGORY_ICONS[workout.category];

  const isMobile = useIsMobile();
  // Follows the workout's discipline, like the timelines do. The card used to
  // hold its own copy of the running ramp, so a cycling session was painted
  // with running colours here and blue in the session timeline.
  const zoneColors = useZoneColors(getWorkoutDiscipline(workout));

  // Compute segments for the peek preview (only when visible, but memoised for stability)
  const peekData = useMemo(() => {
    const { segments } = transformSessionBlocks(workout);
    // First main-set block description for the one-line summary
    const firstMain = workout.mainSetTemplate[0];
    const summary = firstMain ? pick(firstMain, "description") : null;
    return { segments, summary };
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
    <Card
      interactive={interactive}
      size="compact"
      className={cn("overflow-hidden h-full flex flex-col", className)}
    >
      <CardHeader className={cn("pb-1.5 sm:pb-2 px-3 sm:px-4", expanded && "pb-2 px-4")}>
        {eyebrow && <div className="mb-1">{eyebrow}</div>}
        <div className="flex items-center justify-between gap-2">
          <ZoneBadge zone={dominantZone} size="sm" />
          <span className="font-mono text-xs text-muted-foreground shrink-0">
            {formatDurationMinutes(duration)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 mt-2.5">
          <CardTitle
            className={cn(
              "font-sans font-bold uppercase leading-[1.05] tracking-tight text-base sm:text-lg line-clamp-2 sm:line-clamp-1 flex-1 min-w-0 break-words",
              expanded && "text-xl line-clamp-none",
            )}
          >
            {pick(workout, "name")}
          </CardTitle>
          {showFavorite && <FavoriteButton workoutId={workout.id} size="sm" />}
        </div>
        <p className={cn("hidden sm:block text-muted-foreground text-sm leading-snug mt-1.5 line-clamp-2", expanded && "block")}>
          {pick(workout, "description")}
        </p>
      </CardHeader>

      <CardContent className={cn("px-3 sm:px-4 pt-0 mt-auto space-y-2 sm:space-y-3", expanded && "px-4 space-y-3")}>
        {/* Intensity bar showing zone distribution */}
        <SessionIntensityBar workout={workout} />

        {showZoneBadges && zones.length > 0 && (
          <ZoneBadges zones={zones} size="sm" />
        )}

        {showBadges && (
          <div
            className={cn(
              "hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground",
              expanded && "flex",
            )}
          >
            <span className="inline-flex items-center gap-1">
              <CategoryIcon className="size-3 shrink-0" />
              {t(`categories.${workout.category}`)}
            </span>
            <span className="inline-flex items-center gap-1">
              <DifficultyIcon difficulty={workout.difficulty} className="size-3" />
              {t(`difficulty.${workout.difficulty}`)}
            </span>
            {workout.environment.requiresTrack && (
              <span className="inline-flex items-center gap-1">
                <Circle className="size-3" />
                {t("common:library.track")}
              </span>
            )}
            {workout.environment.requiresHills && !hasTrail && (
              <span className="inline-flex items-center gap-1">
                <Mountain className="size-3" />
                {t("common:library.hills")}
              </span>
            )}
            {hasTrail && trailMetrics.totalElevationGainM > 0 && (
              <span className="inline-flex items-center gap-1">
                <Mountain className="size-3" />
                {t("library:trail.elevationGain", { value: trailMetrics.totalElevationGainM })}
              </span>
            )}
            {hasTrail && trailMetrics.totalElevationLossM > 0 && (
              <span>{t("library:trail.elevationLoss", { value: trailMetrics.totalElevationLossM })}</span>
            )}
            {hasTrail && trailMetrics.dominantTerrain && (
              <span>{t(`library:trail.terrainType.${trailMetrics.dominantTerrain}`)}</span>
            )}
          </div>
        )}

        {/* Optional metrics grid (draw result) */}
        {metrics}

        {/* Always-visible peek preview */}
        {showPeek && peekData.segments.length > 0 && (
          <div className="border-t border-border/30 pt-2 mt-1 space-y-1.5">
            {/* Compact session timeline bar */}
            <div className={cn("flex items-end rounded-none overflow-hidden", isMobile ? "h-4" : "h-6")}>
              {peekData.segments.map((seg, i) => {
                const zoneColor = seg.zoneNumber
                  ? zoneColors[seg.zoneNumber]
                  : "var(--muted-foreground)";
                const heightPct = seg.zoneNumber
                  ? 30 + (seg.zoneNumber - 1) * 14
                  : 40;
                return (
                  <div
                    key={seg.id}
                    className={cn(
                      "relative",
                      seg.isRecovery && "opacity-50",
                    )}
                    style={{
                      width: `${seg.widthPercent}%`,
                      height: `${heightPct}%`,
                      backgroundColor: zoneColor,
                      marginLeft: i > 0 ? "1px" : undefined,
                    }}
                  />
                );
              })}
            </div>
            {/* One-line summary of main set */}
            {!isMobile && peekData.summary && (
              <p className="text-xs text-muted-foreground truncate">
                {peekData.summary}
              </p>
            )}
            {hasTrail && (
              <MiniElevationProfile workout={workout} height={28} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Internal running-only card with properly typed props */
function RunningWorkoutCard({ workout, className, expanded }: { workout: WorkoutTemplate; className?: string; expanded?: boolean }) {
  const dominantZone = getDominantZone(workout);
  return (
    <Link to={`/workout/${workout.id}`} className="block h-full">
      <InteractiveCard
        accent={`var(--zone-${dominantZone})`}
        className="block h-full"
      >
        <WorkoutCardChrome
          workout={workout}
          className={className}
          expanded={expanded}
          interactive={false}
        />
      </InteractiveCard>
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
    ? `${trail.totalElevationGainM} m`
    : trail.totalElevationLossM > 0
      ? `-${trail.totalElevationLossM} m`
      : null;

  return (
    <Link to={`/workout/${workout.id}`} className="block h-full">
      <InteractiveCard
        accent={`var(--zone-${dominantZone})`}
        className={cn("block p-3 rounded-none bg-card h-full", className)}
      >
      <div className="flex items-center justify-between gap-2">
        <ZoneBadge zone={dominantZone} size="sm" />
        <span className="font-mono text-[10px] text-muted-foreground">
          {formatDurationMinutes(duration)}
        </span>
      </div>
      <div className="flex items-start justify-between gap-2 mt-2">
        <span className="font-sans font-bold uppercase leading-tight tracking-tight text-sm line-clamp-2 flex-1">
          {pick(workout, "name")}
        </span>
        <FavoriteButton workoutId={workout.id} size="sm" />
      </div>
      {climbLabel && (
        <div className="flex items-center gap-1 mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <Mountain className="size-3" />
          {climbLabel}
        </div>
      )}
      </InteractiveCard>
    </Link>
  );
}
