import { useTranslation } from "react-i18next";
import { Clock, Dumbbell } from "@/components/icons";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, CATEGORY_META } from "@/types";
import { isRunningWorkout, isStrengthWorkout } from "@/lib/workoutTemplate";
import { getWorkoutDuration } from "@/components/visualization";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";

interface SearchResultItemProps {
  workout: AnyWorkoutTemplate;
  isSelected: boolean;
  onClick: () => void;
}

export function SearchResultItem({ workout, isSelected, onClick }: SearchResultItemProps) {
  const { t: tStrength } = useTranslation("strength");
  const pick = usePickLang();

  const isStrength = isStrengthWorkout(workout);
  const name = pick(workout, "name");
  const categoryLabel = isStrengthWorkout(workout)
    ? tStrength(`categories.${workout.category}`)
    : pick(CATEGORY_META[workout.category], "label");
  const dominantZone = isRunningWorkout(workout) ? getDominantZone(workout) : null;
  const duration = isStrengthWorkout(workout)
    ? formatDurationMinutes(Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2))
    : formatDurationMinutes(getWorkoutDuration(workout));

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md transition-colors",
        "hover:bg-accent focus:outline-none focus:bg-accent",
        isSelected && "bg-accent"
      )}
    >
      {/* Color bar */}
      <div
        className={cn(
          "w-1 h-10 rounded-full flex-shrink-0",
          isStrength ? "bg-amber-500" : `bg-zone-${dominantZone}`
        )}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{name}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{categoryLabel}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {duration}
          </span>
        </div>
      </div>

      {/* Badge */}
      {isStrength ? (
        <Dumbbell className="size-4 text-amber-500" />
      ) : (
        <ZoneBadge zone={dominantZone!} size="sm" />
      )}
    </button>
  );
}
