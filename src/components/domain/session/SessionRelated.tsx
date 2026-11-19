import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@/components/icons";
import { useRelatedContent } from "@/hooks/useRelatedContent";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";
import type { ContentRef } from "@/lib/content-relationships";

/**
 * Dans le même esprit : trois séances en lignes cliquables (nom, puis
 * `ID · catégorie` en mono, et une flèche), puis le glossaire de la séance,
 * dans la langue de la page. Les trois séances et les termes viennent de
 * `findRelatedContent`, qui complète jusqu'à trois et ne tire ses termes que
 * de la séance elle-même.
 */
export function SessionRelated({ workoutId }: { workoutId: string }) {
  const { t } = useTranslation(["session", "library"]);
  const pick = usePickLang();
  const isEn = useIsEnglish();
  const source = useMemo<ContentRef>(() => ({ type: "workout", id: workoutId }), [workoutId]);
  const { workouts, glossaryTerms, isLoading } = useRelatedContent(source);

  if (isLoading || (workouts.length === 0 && glossaryTerms.length === 0)) return null;

  return (
    <>
      {workouts.length > 0 && (
        <ul className="zn-srel">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <Link to={`/workout/${workout.id}`} className="zn-srel__row">
                <span className="zn-srel__text">
                  <span className="zn-srel__name">{pick(workout, "name")}</span>
                  <span className="zn-srel__meta">
                    {workout.id} · {t(`library:categories.${workout.category}`)}
                  </span>
                </span>
                <ArrowRight className="zn-srel__arrow" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {glossaryTerms.length > 0 && (
        <div className="zn-sgloss">
          <span className="zn-sgloss__label" id={`gloss-${workoutId}`}>
            {t("session:page.glossary")}
          </span>
          <ul className="zn-sgloss__list" aria-labelledby={`gloss-${workoutId}`}>
            {glossaryTerms.map((term) => (
              <li key={term.id}>
                <Link to={`/glossary/${term.id}`} className="zn-sgloss__chip">
                  {term.acronym || (isEn && term.termEn ? term.termEn : term.term)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
