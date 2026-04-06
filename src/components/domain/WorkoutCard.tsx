import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Dumbbell,
  Circle,
  Mountain,
  Leaf,
  Footprints,
  Zap,
  Flame,
  Rocket,
  Route,
  Timer,
  Target,
  Shuffle,
  ClipboardCheck,
} from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZoneBadge } from "./ZoneBadge";
import { FavoriteButton } from "./FavoriteButton";
import {
  SessionIntensityBar,
  transformSessionBlocks,
  getWorkoutDuration,
} from "@/components/visualization";
import type { ZoneNumber } from "@/components/visualization";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { WorkoutTemplate, WorkoutCategory, AnyWorkoutTemplate } from "@/types";
import { getDominantZone, DIFFICULTY_META, isStrengthWorkout } from "@/types";
import { StrengthWorkoutCard, StrengthWorkoutCardCompact } from "./StrengthWorkoutCard";

/** Category icons using Lucide */
const CATEGORY_ICONS: Record<WorkoutCategory, React.ComponentType<{ className?: string }>> = {
  recovery: Leaf,
  endurance: Footprints,
  tempo: Zap,
  threshold: Flame,
  vma_intervals: Rocket,
  long_run: Route,
  hills: Mountain,
  fartlek: Timer,
  race_pace: Target,
  mixed: Shuffle,
  assessment: ClipboardCheck,
};

const ZONE_COLORS: Record<ZoneNumber, string> = {
  1: "var(--zone-1)",
  2: "var(--zone-2)",
  3: "var(--zone-3)",
  4: "var(--zone-4)",
  5: "var(--zone-5)",
  6: "var(--zone-6)",
};

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

/** Internal running-only card with properly typed props */
function RunningWorkoutCard({ workout, className, expanded }: { workout: WorkoutTemplate; className?: string; expanded?: boolean }) {
  const { t, i18n } = useTranslation(["library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);
  const CategoryIcon = CATEGORY_ICONS[workout.category];
  void DIFFICULTY_META[workout.difficulty];

  const isMobile = useIsMobile();

  // Compute segments for the peek preview (only when visible, but memoised for stability)
  const peekData = useMemo(() => {
    const { segments } = transformSessionBlocks(
      {
        warmup: workout.warmupTemplate ?? [],
        mainSet: workout.mainSetTemplate,
        cooldown: workout.cooldownTemplate ?? [],
      },
      isEn,
    );
    // First main-set block description for the one-line summary
    const firstMain = workout.mainSetTemplate[0];
    const summary = firstMain
      ? (isEn ? (firstMain.descriptionEn ?? firstMain.description) : firstMain.description)
      : null;
    return { segments, summary };
  }, [workout, isEn]);

  return (
    <Link to={`/workout/${workout.id}`}>
      <Card
        interactive
        size="compact"
        className={cn(
          `zone-${dominantZone} bg-gradient-to-br from-zone-${dominantZone}/10 dark:from-zone-${dominantZone}/20 to-transparent`,
          "border-border/50",
          "overflow-hidden h-full flex flex-col",
          className
        )}
      >
        <CardHeader className={cn("pb-1.5 sm:pb-2 px-3 sm:px-4", expanded && "pb-2 px-4")}>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className={cn("text-sm sm:text-base line-clamp-2 sm:line-clamp-1 flex-1", expanded && "text-base line-clamp-none")}>
              {isEn ? workout.nameEn : workout.name}
            </CardTitle>
            <div className="flex items-center gap-1">
              <FavoriteButton workoutId={workout.id} size="sm" />
              <ZoneBadge zone={dominantZone} size="sm" />
            </div>
          </div>
          <p className={cn("hidden sm:block text-muted-foreground text-sm line-clamp-2", expanded && "block")}>
            {isEn ? workout.descriptionEn : workout.description}
          </p>
        </CardHeader>

        <CardContent className={cn("px-3 sm:px-4 pt-0 mt-auto space-y-2 sm:space-y-3", expanded && "px-4 space-y-3")}>
          {/* Intensity bar showing zone distribution */}
          <SessionIntensityBar workout={workout} />

          <div className={cn("flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground", expanded && "gap-3 text-sm")}>
            <div className="flex items-center gap-1">
              <Clock className="size-3.5" />
              <span>{duration} {t("common:units.minutes")}</span>
            </div>
            <div className="flex items-center gap-1">
              <CategoryIcon className="size-3.5" />
              <span>{t(`categories.${workout.category}`)}</span>
            </div>
          </div>

          <div className={cn("hidden sm:flex items-center gap-2", expanded && "flex")}>
            <Badge variant="secondary" className="text-xs">
              <Dumbbell className="size-3 mr-1" />
              {t(`difficulty.${workout.difficulty}`)}
            </Badge>
            {workout.environment.requiresTrack && (
              <Badge variant="outline" className="text-xs gap-1">
                <Circle className="size-3" />
                {isEn ? "Track" : "Piste"}
              </Badge>
            )}
            {workout.environment.requiresHills && (
              <Badge variant="outline" className="text-xs gap-1">
                <Mountain className="size-3" />
                {isEn ? "Hills" : "Côtes"}
              </Badge>
            )}
          </div>

          {/* Always-visible peek preview */}
          {peekData.segments.length > 0 && (
            <div className="border-t border-border/30 pt-2 mt-1 space-y-1.5">
              {/* Compact session timeline bar */}
              <div className={cn("flex items-end rounded-md overflow-hidden", isMobile ? "h-4" : "h-6")}>
                {peekData.segments.map((seg, i) => {
                  const zoneColor = seg.zoneNumber
                    ? ZONE_COLORS[seg.zoneNumber]
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
            </div>
          )}
        </CardContent>
      </Card>
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
  const { t, i18n } = useTranslation(["library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);

  return (
    <Link
      to={`/workout/${workout.id}`}
      className={cn(
        `zone-${dominantZone} bg-gradient-to-br from-zone-${dominantZone}/10 dark:from-zone-${dominantZone}/20 to-transparent`,
        "border-border/50",
        "block p-3 rounded-xl border hover:bg-accent/50 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm line-clamp-1 flex-1">
          {isEn ? workout.nameEn : workout.name}
        </span>
        <ZoneBadge zone={dominantZone} size="sm" />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {duration} {t("common:units.minutes")}
        </span>
        <FavoriteButton workoutId={workout.id} size="sm" />
      </div>
    </Link>
  );
}
