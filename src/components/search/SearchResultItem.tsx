import { useTranslation } from "react-i18next";
import { Clock } from "@/components/icons";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import type { WorkoutTemplate } from "@/types";
import { getDominantZone, CATEGORY_META } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";
import { cn } from "@/lib/utils";

interface SearchResultItemProps {
  workout: WorkoutTemplate;
  isSelected: boolean;
  onClick: () => void;
}

export function SearchResultItem({ workout, isSelected, onClick }: SearchResultItemProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") ?? false;

  const name = isEn ? workout.nameEn : workout.name;
  const categoryMeta = CATEGORY_META[workout.category];
  const categoryLabel = isEn ? categoryMeta.labelEn : categoryMeta.label;
  const dominantZone = getDominantZone(workout);
  const duration = `${getWorkoutDuration(workout)} min`;

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
      {/* Zone color bar */}
      <div
        className={cn(
          "w-1 h-10 rounded-full flex-shrink-0",
          `bg-zone-${dominantZone}`
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

      {/* Zone badge */}
      <ZoneBadge zone={dominantZone} size="sm" />
    </button>
  );
}
