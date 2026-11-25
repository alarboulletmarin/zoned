import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Mountain } from "@/components/icons";
import { ZoneBadge } from "./ZoneBadge";
import { DifficultyIcon } from "./DifficultyIcon";
import { useEquipmentLabel } from "./StrengthWorkoutCard";
import { cn } from "@/lib/utils";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import { isStrengthWorkout } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { ZoneBar, toZoneBarBlocks } from "@/components/visualization/ZoneBar";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";
import { localeTo } from "@/lib/seo/locale-to";
import { useSharedTransition } from "@/lib/sharedTransition";
import { measureWorkout } from "@/lib/libraryFilters";

/**
 * Une séance de la bibliothèque, en une rangée et une seule action : l'ouvrir.
 *
 * La rangée était un lien qui contenait le bouton favori, un contenu
 * interactif dans un autre (HTML invalide, et un lecteur d'écran qui ne sait
 * plus ce qu'il active), et deux cibles par ligne dont une de 32 px collée au
 * badge. Le favori se pose maintenant sur la page séance, dans sa barre
 * d'actions ; ici un petit coeur plein dit seulement que la séance y est,
 * c'est un état, pas un geste.
 *
 * Trois lignes, le vocabulaire de l'app sans variante locale :
 *   1. le nom, puis le coeur d'état ;
 *   2. la `ZoneBar` de la séance, condensée, pleine largeur ;
 *   3. le pic (`ZoneBadge`), la durée de la page séance
 *      (`formatDurationMinutes(getWorkoutDuration(w))`, 1 h 03 des deux
 *      côtés), la jauge `DifficultyIcon` et son libellé, le D+ de
 *      `computeTrailMetrics`, et Piste quand elle est exigée.
 *
 * Le renfo n'a ni zone ni profil : la ligne 2 dit sa catégorie et son
 * matériel, la ligne 3 garde la durée et la jauge.
 *
 * Le nom accessible du lien est le nom de la séance (`aria-labelledby`), le
 * reste est sa description : un lien qui s'annonce par sept faits ne se
 * retrouve plus dans une liste de liens.
 */
export function WorkoutRow({
  workout,
  favorite,
  className,
}: {
  workout: AnyWorkoutTemplate;
  favorite: boolean;
  className?: string;
}) {
  const pick = usePickLang();
  const isEn = useIsEnglish();
  const id = useId();
  const to = localeTo(`/workout/${workout.id}`, isEn);
  // Origine : le nom et le profil de la rangée rejoignent ceux de la séance.
  const shareOrigin = useSharedTransition(to, "wk", workout.id, ".zn-wrow__name");
  const name = pick(workout, "name");
  const nameId = `${id}-name`;
  const favId = `${id}-fav`;
  const factsId = `${id}-facts`;

  return (
    <Link
      to={to}
      className={cn("zn-wrow", className)}
      onClick={shareOrigin}
      aria-labelledby={nameId}
      aria-describedby={favorite ? `${favId} ${factsId}` : factsId}
    >
      <span className="zn-wrow__head">
        <span id={nameId} className="zn-wrow__name">
          {name}
        </span>
        {favorite && <FavoriteMark id={favId} />}
      </span>
      {isStrengthWorkout(workout) ? (
        <StrengthLine workout={workout} />
      ) : (
        <RowProfile workout={workout} />
      )}
      <WorkoutFacts id={factsId} workout={workout} className="zn-wrow__facts" />
    </Link>
  );
}

/** Le coeur d'état : 13 px, plein, vermillon. Une image nommée, jamais un bouton. */
export function FavoriteMark({ id }: { id?: string }) {
  const { t } = useTranslation("library");
  return (
    <span id={id} className="zn-favmark" role="img" aria-label={t("row.favorite")}>
      <Heart filled size={13} />
    </span>
  );
}

/** Le profil de la page séance, condensé, à la hauteur d'une rangée. */
export function RowProfile({
  workout,
  className,
}: {
  workout: WorkoutTemplate;
  className?: string;
}) {
  const blocks = useMemo(() => toZoneBarBlocks(workout), [workout]);
  if (blocks.length === 0) return null;
  return (
    <ZoneBar
      condense
      decorative
      blocks={blocks}
      className={cn("zn-wrow__profile", className)}
    />
  );
}

function StrengthLine({ workout }: { workout: StrengthWorkoutTemplate }) {
  const { t } = useTranslation("strength");
  const equipment = useEquipmentLabel(workout);
  return (
    <span className="zn-wrow__kind">
      {t(`categories.${workout.category}`)} · {equipment.label}
    </span>
  );
}

/** Le pic, en badge. Rien pour le renfo. */
export function PeakFact({ workout }: { workout: AnyWorkoutTemplate }) {
  const peak = measureWorkout(workout).peak;
  return peak === null ? null : <ZoneBadge zone={peak} size="sm" />;
}

/** La jauge du niveau et son libellé. */
export function LevelFact({ workout }: { workout: AnyWorkoutTemplate }) {
  const { t } = useTranslation("library");
  return (
    <span className="zn-wfact">
      <DifficultyIcon difficulty={workout.difficulty} size={14} className="zn-wfact__gauge" />
      {t(`difficulty.${workout.difficulty}`)}
    </span>
  );
}

/** Le D+, quand il y en a. */
export function ClimbFact({ workout }: { workout: AnyWorkoutTemplate }) {
  const climb = measureWorkout(workout).climbM;
  if (climb <= 0) return null;
  return (
    <span className="zn-wfact">
      <Mountain size={14} />
      {climb}{" "}m
    </span>
  );
}

/**
 * La ligne des faits, qui passe à la ligne si besoin. Aucun séparateur : un
 * point médian en fin de ligne est ce qu'on obtient dès qu'un fait manque.
 */
function WorkoutFacts({
  id,
  workout,
  className,
}: {
  id: string;
  workout: AnyWorkoutTemplate;
  className?: string;
}) {
  const { t } = useTranslation("library");
  const m = measureWorkout(workout);
  return (
    <span id={id} className={className}>
      <PeakFact workout={workout} />
      <span className="zn-wfact zn-wfact--duration">{formatDurationMinutes(m.duration)}</span>
      <LevelFact workout={workout} />
      <ClimbFact workout={workout} />
      {m.needsTrack && <span className="zn-wfact">{t("row.track")}</span>}
    </span>
  );
}
