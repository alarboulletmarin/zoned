import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronDown } from "@/components/icons";
import { FavoriteMark, PeakFact, LevelFact, ClimbFact, RowProfile } from "./WorkoutRow";
import type { AnyWorkoutTemplate } from "@/types";
import { isStrengthWorkout } from "@/types";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";
import { localeTo } from "@/lib/seo/locale-to";
import { useSharedTransition } from "@/lib/sharedTransition";
import { measureWorkout, type LibrarySort } from "@/lib/libraryFilters";

/**
 * La bibliothèque sur bureau : un vrai tableau, parce que c'en est un. Six
 * colonnes qu'on compare d'une séance à l'autre, Séance, Profil, Pic, Durée,
 * Niveau, D+, et un tri par en-tête.
 *
 * Le lien est sur le nom, étendu à toute la ligne par un pseudo-élément :
 * une seule cible, aucun contenu interactif dans un autre, et le survol comme
 * le focus se voient sur la ligne entière (`library.css`).
 *
 * `aria-sort` se pose sur le `<th>`, là où ARIA le définit, et le geste est
 * un `<button>` dedans. Le poser sur le bouton ne voudrait rien dire.
 */
export function WorkoutTable({
  workouts,
  favorites,
  sort,
  onSort,
  caption,
}: {
  workouts: AnyWorkoutTemplate[];
  favorites: ReadonlySet<string>;
  sort: LibrarySort;
  onSort: (sort: LibrarySort) => void;
  caption: string;
}) {
  const { t } = useTranslation("library");

  const sortable = (key: LibrarySort, label: string) => (
    <th scope="col" aria-sort={sort === key ? "ascending" : undefined}>
      <button
        type="button"
        className="zn-wtable__sort"
        data-active={sort === key || undefined}
        onClick={() => onSort(key)}
      >
        {label}
        <ChevronDown size={14} className="zn-wtable__sortmark" />
      </button>
    </th>
  );

  return (
    <table className="zn-wtable">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{t("table.session")}</th>
          <th scope="col">{t("table.profile")}</th>
          {sortable("intensity", t("table.peak"))}
          {sortable("duration", t("sort.by.duration"))}
          {sortable("level", t("sort.by.level"))}
          <th scope="col">{t("table.climb")}</th>
        </tr>
      </thead>
      <tbody>
        {workouts.map((workout) => (
          <WorkoutTableRow
            key={workout.id}
            workout={workout}
            favorite={favorites.has(workout.id)}
          />
        ))}
      </tbody>
    </table>
  );
}

function WorkoutTableRow({
  workout,
  favorite,
}: {
  workout: AnyWorkoutTemplate;
  favorite: boolean;
}) {
  const { t } = useTranslation("strength");
  const pick = usePickLang();
  const isEn = useIsEnglish();
  const to = localeTo(`/workout/${workout.id}`, isEn);
  // Le lien est dans la cellule du nom : la portée de la transition est la ligne.
  const shareOrigin = useSharedTransition(to, "wk", workout.id, ".zn-wtable__title", "tr");
  const m = measureWorkout(workout);

  return (
    <tr className="zn-wtable__row">
      <th scope="row" className="zn-wtable__name">
        <Link to={to} className="zn-wtable__link" onClick={shareOrigin}>
          <span className="zn-wtable__title">{pick(workout, "name")}</span>
        </Link>
        {favorite && <FavoriteMark />}
      </th>
      <td>
        {isStrengthWorkout(workout) ? (
          <span className="zn-wtable__kind">{t(`categories.${workout.category}`)}</span>
        ) : (
          <RowProfile workout={workout} className="zn-wtable__profile" />
        )}
      </td>
      <td>
        <PeakFact workout={workout} />
      </td>
      <td className="zn-wfact--duration">{formatDurationMinutes(m.duration)}</td>
      <td>
        <LevelFact workout={workout} />
      </td>
      <td className="zn-wtable__climb">
        <ClimbFact workout={workout} />
      </td>
    </tr>
  );
}
