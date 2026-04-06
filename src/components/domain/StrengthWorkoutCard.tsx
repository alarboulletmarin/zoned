import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Dumbbell, UserRound } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./FavoriteButton";
import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";
import type { StrengthWorkoutTemplate, StrengthIntensity, MuscleGroup } from "@/types/strength";
import { DIFFICULTY_META } from "@/types";

// Warm / earthy tones for strength intensity levels
const INTENSITY_COLORS: Record<StrengthIntensity, { bg: string; text: string; bar: string }> = {
  mobility:    { bg: "bg-teal-500/15",   text: "text-teal-700 dark:text-teal-400",   bar: "bg-teal-500" },
  endurance:   { bg: "bg-amber-500/15",  text: "text-amber-700 dark:text-amber-400", bar: "bg-amber-500" },
  hypertrophy: { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400", bar: "bg-orange-500" },
  strength:    { bg: "bg-red-500/15",    text: "text-red-700 dark:text-red-400",      bar: "bg-red-500" },
  power:       { bg: "bg-purple-500/15", text: "text-purple-700 dark:text-purple-400", bar: "bg-purple-500" },
};

// Intensity level as a 1-5 bar scale
const INTENSITY_LEVEL: Record<StrengthIntensity, number> = {
  mobility: 1,
  endurance: 2,
  hypertrophy: 3,
  strength: 4,
  power: 5,
};

// Warm colors for muscle badges
const MUSCLE_BADGE_COLORS: Record<string, string> = {
  quadriceps:     "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  hamstrings:     "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  glutes:         "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  calves:         "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  hip_flexors:    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  adductors:      "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  core_anterior:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  core_lateral:   "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  core_posterior: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  upper_back:     "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  shoulders:      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  chest:          "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
};

function getMuscleBadgeColor(muscle: MuscleGroup): string {
  return MUSCLE_BADGE_COLORS[muscle] ?? "bg-muted text-muted-foreground";
}

interface StrengthWorkoutCardProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
  expanded?: boolean;
}

export function StrengthWorkoutCard({ workout, className, expanded }: StrengthWorkoutCardProps) {
  const { t: tStrength, i18n } = useTranslation("strength");
  const { t: tLib } = useTranslation("library");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const intensityStyle = INTENSITY_COLORS[workout.intensity];
  const intensityLevel = INTENSITY_LEVEL[workout.intensity];
  const avgDuration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
  void DIFFICULTY_META[workout.difficulty];
  const needsEquipment = workout.equipment.length > 0 && !workout.equipment.every((e) => e === "none");
  const equipmentList = workout.equipment.filter((e) => e !== "none");

  return (
    <Link to={`/workout/${workout.id}`}>
      <Card
        interactive
        size="compact"
        className={cn(
          "bg-gradient-to-br from-amber-500/10 dark:from-amber-500/15 to-transparent",
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
              {/* Strength intensity badge instead of zone badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full text-xs px-2 py-0.5 font-medium",
                  intensityStyle.bg,
                  intensityStyle.text,
                )}
              >
                <Dumbbell className="size-3" />
              </span>
            </div>
          </div>
          <p className={cn("hidden sm:block text-muted-foreground text-sm line-clamp-2", expanded && "block")}>
            {isEn ? workout.descriptionEn : workout.description}
          </p>
        </CardHeader>

        <CardContent className={cn("px-3 sm:px-4 pt-0 mt-auto space-y-2 sm:space-y-3", expanded && "px-4 space-y-3")}>
          {/* Intensity bar (visual analog of SessionIntensityBar for running) */}
          <div className="flex items-center gap-0.5 h-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full h-full transition-colors",
                  i < intensityLevel ? intensityStyle.bar : "bg-muted",
                  i < intensityLevel && "opacity-80",
                )}
              />
            ))}
          </div>

          <div className={cn("flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground", expanded && "gap-3 text-sm")}>
            <div className="flex items-center gap-1">
              <Clock className="size-3.5" />
              <span>{avgDuration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <CategoryIcon category={workout.category} size="sm" />
              <span>{tStrength(`categories.${workout.category}`)}</span>
            </div>
          </div>

          {/* Equipment indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {needsEquipment ? (
              <>
                <Dumbbell className="size-3 shrink-0" />
                <span className="truncate">
                  {equipmentList.slice(0, 2).map((e) => tStrength(`equipment.${e}`)).join(", ")}
                  {equipmentList.length > 2 && ` +${equipmentList.length - 2}`}
                </span>
              </>
            ) : (
              <>
                <UserRound className="size-3 shrink-0 text-emerald-500" />
                <span>{tStrength("equipment.none")}</span>
              </>
            )}
          </div>

          <div className={cn("hidden sm:flex items-center gap-2 flex-wrap", expanded && "flex")}>
            {/* Difficulty badge */}
            <Badge variant="secondary" className="text-xs">
              <Dumbbell className="size-3 mr-1" />
              {tLib(`difficulty.${workout.difficulty}`)}
            </Badge>
            {/* Intensity badge */}
            <Badge
              variant="outline"
              className={cn("text-xs", intensityStyle.text)}
            >
              {tStrength(`intensity.${workout.intensity}`)}
            </Badge>
          </div>

          {/* Muscle groups as colored pills */}
          {workout.primaryMuscleGroups.length > 0 && (
            <div className="border-t border-border/30 pt-2 mt-1">
              <div className="flex flex-wrap gap-1">
                {workout.primaryMuscleGroups.slice(0, expanded ? undefined : 3).map((muscle) => (
                  <span
                    key={muscle}
                    className={cn(
                      "inline-flex items-center rounded-full text-[10px] sm:text-xs px-1.5 py-0.5 font-medium",
                      getMuscleBadgeColor(muscle),
                    )}
                  >
                    {tStrength(`muscles.${muscle}`)}
                  </span>
                ))}
                {!expanded && workout.primaryMuscleGroups.length > 3 && (
                  <span className="inline-flex items-center text-[10px] sm:text-xs text-muted-foreground px-1">
                    +{workout.primaryMuscleGroups.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact version for strength workouts
interface StrengthWorkoutCardCompactProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
}

export function StrengthWorkoutCardCompact({
  workout,
  className,
}: StrengthWorkoutCardCompactProps) {
  const { i18n } = useTranslation("strength");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const intensityStyle = INTENSITY_COLORS[workout.intensity];
  const avgDuration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
  const needsEquipment = workout.equipment.length > 0 && !workout.equipment.every((e) => e === "none");

  return (
    <Link
      to={`/workout/${workout.id}`}
      className={cn(
        "bg-gradient-to-br from-amber-500/10 dark:from-amber-500/15 to-transparent",
        "border-border/50",
        "block p-3 rounded-xl border hover:bg-accent/50 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm line-clamp-1 flex-1">
          {isEn ? workout.nameEn : workout.name}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium",
            intensityStyle.bg,
            intensityStyle.text,
          )}
        >
          <Dumbbell className="size-3" />
        </span>
      </div>
      <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {avgDuration} min
        </span>
        <span className="flex items-center gap-1">
          {needsEquipment ? (
            <Dumbbell className="size-3" />
          ) : (
            <UserRound className="size-3 text-emerald-500" />
          )}
        </span>
      </div>
    </Link>
  );
}

// List item version for strength workouts
interface StrengthWorkoutListItemProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
}

export function StrengthWorkoutListItem({ workout, className }: StrengthWorkoutListItemProps) {
  const { t: tStrength, i18n } = useTranslation("strength");
  const { t: tLib } = useTranslation("library");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const intensityStyle = INTENSITY_COLORS[workout.intensity];
  const avgDuration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
  const needsEquipment = workout.equipment.length > 0 && !workout.equipment.every((e) => e === "none");

  return (
    <Link
      to={`/workout/${workout.id}`}
      className={cn(
        "bg-gradient-to-r from-amber-500/10 dark:from-amber-500/15 to-transparent",
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
          <span>{avgDuration} min</span>
        </div>
      </div>

      {/* Desktop: show all info inline */}
      <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground shrink-0">
        <span className="w-24 truncate">
          {tStrength(`categories.${workout.category}`)}
        </span>
        <span className="w-16 flex items-center gap-1">
          <Clock className="size-3.5" />
          {avgDuration}
        </span>
        <Badge variant="secondary" className="w-24 justify-center text-xs">
          {tLib(`difficulty.${workout.difficulty}`)}
        </Badge>
        {/* Equipment indicator */}
        <div className="w-20 flex items-center gap-1 text-xs text-muted-foreground">
          {needsEquipment ? (
            <>
              <Dumbbell className="size-3.5 shrink-0" />
              <span>{workout.equipment.filter((e) => e !== "none").length}</span>
            </>
          ) : (
            <UserRound className="size-3.5 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <FavoriteButton workoutId={workout.id} size="sm" />
        <span
          className={cn(
            "inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium",
            intensityStyle.bg,
            intensityStyle.text,
          )}
        >
          <Dumbbell className="size-3" />
        </span>
      </div>
    </Link>
  );
}
