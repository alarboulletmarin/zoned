import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZoneBadge } from "./ZoneBadge";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate } from "@/types";
import {
  getDominantZone,
  getEstimatedDuration,
  CATEGORY_META,
  DIFFICULTY_META,
} from "@/types";

interface WorkoutCardProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function WorkoutCard({ workout, className }: WorkoutCardProps) {
  const { t, i18n } = useTranslation(["library", "common"]);
  const isEn = i18n.language === "en";
  const dominantZone = getDominantZone(workout);
  const duration = getEstimatedDuration(workout);
  const categoryMeta = CATEGORY_META[workout.category];
  // Reserved for potential future use
void DIFFICULTY_META[workout.difficulty];

  return (
    <Link to={`/workout/${workout.id}`}>
      <Card
        interactive
        size="compact"
        className={cn(
          `zone-${dominantZone}`,
          "zone-stripe pl-2 overflow-hidden",
          className
        )}
      >
        <CardHeader className="pb-2 px-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">
              {isEn ? workout.nameEn : workout.name}
            </CardTitle>
            <ZoneBadge zone={dominantZone} size="sm" />
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {isEn ? workout.descriptionEn : workout.description}
          </p>
        </CardHeader>

        <CardContent className="px-4 pt-0">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-3.5" />
              <span>{duration} {t("common:units.minutes")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{categoryMeta.icon}</span>
              <span>{t(`categories.${workout.category}`)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              <Dumbbell className="size-3 mr-1" />
              {t(`difficulty.${workout.difficulty}`)}
            </Badge>
            {workout.environment.requiresTrack && (
              <Badge variant="outline" className="text-xs">
                🏟️ Track
              </Badge>
            )}
            {workout.environment.requiresHills && (
              <Badge variant="outline" className="text-xs">
                ⛰️ Hills
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact version for related workouts
interface WorkoutCardCompactProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function WorkoutCardCompact({
  workout,
  className,
}: WorkoutCardCompactProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const dominantZone = getDominantZone(workout);

  return (
    <Link
      to={`/workout/${workout.id}`}
      className={cn(
        `zone-${dominantZone}`,
        "zone-stripe pl-2 block p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm line-clamp-1">
          {isEn ? workout.nameEn : workout.name}
        </span>
        <ZoneBadge zone={dominantZone} size="sm" />
      </div>
    </Link>
  );
}
