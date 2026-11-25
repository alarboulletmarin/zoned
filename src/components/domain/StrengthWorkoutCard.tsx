import { useSharedTransition } from "@/lib/sharedTransition";
/**
 * The strength session in the catalogue: the grid card and the dense card.
 * The library row is `WorkoutRow`, shared with the endurance sessions.
 *
 * The grid and dense cards are .zn-wcard (workout-card.css), the same piece of
 * paper the running card uses, a library grid mixing the two disciplines has
 * to read as one catalogue, and the strength-only organs are small enough to
 * bolt on: the intensity meter, and the muscle pills.
 *
 * Intensity replaces the zone: it is ordinal on the same ink ramp (themes.css
 * binds --intensity-* to --zone-1/2/3/4/6), so the meter codes it twice, ink
 * density and step height, exactly the way a ZoneBar codes a zone.
 */

import { Link } from "react-router-dom";
import { useIsEnglish } from "@/lib/i18n-utils";
import { localeTo } from "@/lib/seo/locale-to";
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
 * a second time. Decorative, the level is named in words by IntensityBadge.
 */
export function IntensityMeter({
  intensity,
  className,
}: {
  intensity: StrengthIntensity;
  className?: string;
}) {
  const level = INTENSITY_LEVEL[intensity];

  return (
    <div className={cn("zn-str-meter", className)} aria-hidden="true">
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
export function useEquipmentLabel(workout: StrengthWorkoutTemplate) {
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
}

export function StrengthWorkoutCard({ workout, className }: StrengthWorkoutCardProps) {
  const { t: tStrength } = useTranslation("strength");
  const { t: tLib } = useTranslation("library");
  const pick = usePickLang();
  const avgDuration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);
  const equipment = useEquipmentLabel(workout);
  const isEn = useIsEnglish();
  // Origine : le titre de la carte activée rejoint celui de la séance.
  const shareOrigin = useSharedTransition(localeTo(`/workout/${workout.id}`, isEn), "wk", workout.id, ".zn-wcard__title");

  return (
    <Link to={localeTo(`/workout/${workout.id}`, isEn)} className="zn-wcard-link" onClick={shareOrigin}>
      <article className={cn("zn-wcard", className)}>
        <div className="zn-row zn-row--start" style={HEAD_ROW}>
          <h3 className="zn-wcard__title zn-fill">{pick(workout, "name")}</h3>
          <FavoriteButton workoutId={workout.id} size="sm" />
        </div>

        {/* No prose here either, see the note in WorkoutCard.tsx. */}

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
            max={3}
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
  const isEn = useIsEnglish();
  // Origine : le titre de la carte activée rejoint celui de la séance.
  const shareOrigin = useSharedTransition(localeTo(`/workout/${workout.id}`, isEn), "wk", workout.id, ".zn-wcard__title");

  return (
    <Link to={localeTo(`/workout/${workout.id}`, isEn)} className="zn-wcard-link" onClick={shareOrigin}>
      <article className={cn("zn-wcard", className)} data-size="compact">
        <div className="zn-row zn-row--start" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <h3 className="zn-wcard__title zn-fill">{pick(workout, "name")}</h3>
          <FavoriteButton workoutId={workout.id} size="sm" />
        </div>
        {/* La rampe, à la taille de la carte dense. Une carte de renfo et une
            carte de course voisinent dans la même grille : si l'une porte son
            profil et l'autre rien, la grille se lit comme deux catalogues. */}
        <IntensityMeter intensity={workout.intensity} className="zn-profile-mini" />
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
