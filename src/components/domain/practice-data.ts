import type { TFunction } from "i18next";
import type { PracticeContent } from "@/hooks/useAppStats";
import { isPracticeLive, type Practice } from "@/types/practice";

/**
 * La ligne de données d'une carte de pratique : ce qu'il y a réellement
 * derrière, en chiffres.
 *
 * Elle disait 4 distances, une propriété de la table `PRACTICE_META`, pas
 * du contenu. Quelqu'un qui hésite entre trail et ultra veut savoir combien de
 * séances et de plans l'attendent, pas combien de cases le modèle compte.
 *
 * Trois cas, et le troisième est celui qui coûte le plus cher à rater :
 *
 *   · pratique annoncée → bientôt, et rien d'autre. Pas de compteur, pas
 *     de promesse chiffrée sur une étagère qui n'existe pas ;
 *   · catalogue pas encore chargé (il arrive en chunks) → chaîne vide, donc
 *     rien ne s'affiche. Écrire 0 séance pendant 300 ms est un mensonge
 *     court mais c'en est un, et il fait aussi sauter la mise en page ;
 *   · zéro plan tout prêt → on le DIT (aucun plan prêt) au lieu de
 *     masquer la moitié de la ligne. C'était l'ultra jusqu'au 12 septembre
 *     2026, où il est passé annoncé : il tombe donc dans le premier cas
 *     maintenant, et aucune pratique ouverte n'est dans celui-ci. Le cas
 *     reste, parce que c'est celui d'une étagère qui se vide.
 *
 * Partagé par l'entrée du parcours (`PlanNewPage`) et son étape 1
 * (`PracticeStep`) : deux écrans qui montrent les mêmes quatre cartes et qui,
 * sinon, divergeraient au premier changement.
 */
export function practiceData(
  practice: Practice,
  content: PracticeContent | undefined,
  t: TFunction,
): string {
  if (!isPracticeLive(practice)) return t("plan:practice.soon");
  if (!content || content.workouts === 0) return "";
  const plans =
    content.plans > 0
      ? t("plan:practice.planCount", { count: content.plans })
      : t("plan:practice.noPlanYet");
  return `${t("plan:practice.workoutCount", { count: content.workouts })} · ${plans}`;
}
