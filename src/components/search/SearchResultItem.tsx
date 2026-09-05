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
      className={cn("zn-cmdk__item", isSelected && "zn-cmdk__item--active")}
    >
      {/* Intensity rail — zone ink when there is a zone, hollow when there is not */}
      <div className="zn-cmdk__rail" data-zone={dominantZone ?? undefined} />

      {/* Content */}
      <div className="zn-fill">
        <div className="zn-cmdk__item-title zn-truncate">{name}</div>
        <div className="zn-cmdk__meta">
          <span>{categoryLabel}</span>
          <span className="zn-cmdk__dot">·</span>
          <span className="zn-cmdk__dur">
            <Clock />
            {duration}
          </span>
        </div>
      </div>

      {/* Badge */}
      {isStrength ? (
        <Dumbbell />
      ) : (
        <ZoneBadge zone={dominantZone!} size="sm" />
      )}
    </button>
  );
}
