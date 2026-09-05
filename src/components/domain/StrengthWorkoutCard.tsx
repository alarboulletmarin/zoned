/**
 * The strength session in the catalogue: the grid card, the dense card and the
 * list row.
 *
 * The grid and dense cards are .zn-wcard (workout-card.css), the same piece of
 * paper the running card uses — a library grid mixing the two disciplines has
 * to read as one catalogue, and the strength-only organs are small enough to
 * bolt on: the intensity meter, and the muscle pills.
 *
 * Intensity replaces the zone: it is ordinal on the same ink ramp (themes.css
 * binds --intensity-* to --zone-1/2/3/4/6), so the meter codes it twice — ink
 * density and step height — exactly the way a ZoneBar codes a zone.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import { Dumbbell, UserRound } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./FavoriteButton";
import { CategoryIcon } from "./CategoryIcon";
import { IntensityBadge } from "./IntensityBadge";
import { MuscleGroupBadges } from "./MuscleGroupBadge";
import { cn } from "@/lib/utils";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { StrengthWorkoutTemplate, StrengthIntensity } from "@/types/strength";
import { usePickLang } from "@/lib/i18n-utils";

// Intensity level as a 1-5 bar scale
const INTENSITY_LEVEL: Record<StrengthIntensity, number> = {
  mobility: 1,
  endurance: 2,
  hypertrophy: 3,
  strength: 4,
  power: 5,
};

const STEPS = [1, 2, 3, 4, 5] as const;

const HEAD_ROW = { "--gap": "var(--sp-6)" } as CSSProperties;

/**
 * The five steps of the intensity ramp. Steps up to the session's level carry
 * their ink; every step carries its height, so the silhouette reads the level
 * a second time. Decorative — the level is named in words by IntensityBadge.
 */
function IntensityMeter({ intensity }: { intensity: StrengthIntensity }) {
  const level = INTENSITY_LEVEL[intensity];

  return (
    <div className="zn-str-meter" aria-hidden="true">
      {STEPS.map((step) => (
        <span
          key={step}
          className="zn-str-meter__step"
          data-step={step}
          data-reached={step <= level}
        />
      ))}
    </div>
  );
}

/** "Haltères, kettlebell +2", or the bodyweight mark. */
function useEquipmentLabel(workout: StrengthWorkoutTemplate) {
  const { t } = useTranslation("strength");
  const list = workout.equipment.filter((e) => e !== "none");

  if (list.length === 0) return { label: t("equipment.none"), free: true };

  const shown = list.slice(0, 2).map((e) => t(`equipment.${e}`)).join(", ");
  return {
    label: list.length > 2 ? `${shown} +${list.length - 2}` : shown,
    free: false,
  };
}

interface StrengthWorkoutCardProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
  expanded?: boolean;
}

export function StrengthWorkoutCard({ workout, className, expanded }: StrengthWorkoutCardProps) {
  const { t: tStrength } = useTranslation("strength");
  const { t: tLib } = useTranslation("library");
  const pick = usePickLang();
  const avgDuration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
  const equipment = useEquipmentLabel(workout);

  return (
    <Link to={`/workout/${workout.id}`} className="zn-wcard-link">
      <article className={cn("zn-wcard", className)} data-expanded={expanded}>
        <div className="zn-row zn-row--start" style={HEAD_ROW}>
          <h3 className="zn-wcard__title zn-fill">{pick(workout, "name")}</h3>
          <FavoriteButton workoutId={workout.id} size="sm" />
        </div>

        <p className="zn-wcard__desc">{pick(workout, "description")}</p>

        <IntensityMeter intensity={workout.intensity} />

        <div className="zn-cluster">
          <IntensityBadge intensity={workout.intensity} size="sm" />
          <Badge variant="outline">
            <CategoryIcon category={workout.category} size="sm" />
            {tStrength(`categories.${workout.category}`)}
          </Badge>
          <Badge variant="outline">
            {equipment.free ? <UserRound size={12} /> : <Dumbbell size={12} />}
            {equipment.label}
          </Badge>
        </div>

        {workout.primaryMuscleGroups.length > 0 && (
          <MuscleGroupBadges
            muscles={workout.primaryMuscleGroups}
            size="sm"
            max={expanded ? undefined : 3}
          />
        )}

        <div className="zn-wcard__meta">
          <span className="zn-wcard__zone">{formatDurationMinutes(avgDuration)}</span>
          <span className="zn-wcard__fact">{tLib(`difficulty.${workout.difficulty}`)}</span>
          <span className="zn-wcard__code">{workout.id}</span>
        </div>
      </article>
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
  const { t } = useTranslation("strength");
  const pick = usePickLang();
  const avgDuration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
  const needsEquipment = workout.equipment.some((e) => e !== "none");

  return (
    <Link to={`/workout/${workout.id}`} className="zn-wcard-link">
      <article className={cn("zn-wcard", className)} data-size="compact">
        <div className="zn-row zn-row--start" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <h3 className="zn-wcard__title zn-fill">{pick(workout, "name")}</h3>
          <FavoriteButton workoutId={workout.id} size="sm" />
        </div>
        <div className="zn-wcard__meta">
          <span className="zn-wcard__zone">{formatDurationMinutes(avgDuration)}</span>
          <span className="zn-wcard__fact">
            {t(`intensity.${workout.intensity}`)}
          </span>
          {!needsEquipment && (
            <span className="zn-wcard__fact">{t("equipment.none")}</span>
          )}
          <span className="zn-wcard__code">{workout.id}</span>
        </div>
      </article>
    </Link>
  );
}

// List item version for strength workouts
interface StrengthWorkoutListItemProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
}

export function StrengthWorkoutListItem({ workout, className }: StrengthWorkoutListItemProps) {
  const { t: tStrength } = useTranslation("strength");
  const { t: tLib } = useTranslation("library");
  const pick = usePickLang();
  const avgDuration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
  const equipment = useEquipmentLabel(workout);

  return (
    <Link to={`/workout/${workout.id}`} className={cn("zn-str-row", className)}>
      {/* Title and mobile duration */}
      <div className="zn-fill">
        <span className="zn-str-row__name">{pick(workout, "name")}</span>
        {/* Mobile: show duration below title */}
        <div className="zn-str-row__small">
          {formatDurationMinutes(avgDuration)}
        </div>
      </div>

      {/* Desktop: show all info inline */}
      <div className="zn-str-row__facts">
        <span className="zn-str-row__col">
          {tStrength(`categories.${workout.category}`)}
        </span>
        <span className="zn-str-row__col" style={{ "--col": "6ch" } as CSSProperties}>
          {formatDurationMinutes(avgDuration)}
        </span>
        <Badge variant="secondary">{tLib(`difficulty.${workout.difficulty}`)}</Badge>
        <span className="zn-str-row__col" style={{ "--col": "14ch" } as CSSProperties}>
          {equipment.label}
        </span>
      </div>

      {/* Actions */}
      <div className="zn-row zn-fixed" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
        <FavoriteButton workoutId={workout.id} size="sm" />
        <IntensityBadge intensity={workout.intensity} size="sm" />
      </div>
    </Link>
  );
}
