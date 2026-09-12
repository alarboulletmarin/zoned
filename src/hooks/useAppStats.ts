import { useEffect, useState } from "react";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getAllCollections } from "@/data/collections";
import { articleMetadata } from "@/data/articles";
import { loadAllWorkouts, loadDisciplineWorkouts } from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";
import { countByPractice } from "@/lib/practiceIndex";
import { PRACTICES, practiceFromRaceDistance, type Practice } from "@/types/practice";

const ZONES = 6;

/** Ce qu'une pratique a réellement sur ses étagères. Jamais un nombre en dur. */
export type PracticeContent = {
  /** Séances qui revendiquent la pratique. Les transversales n'y entrent pas. */
  workouts: number;
  /** Plans tout prêts de cette pratique. Zéro est une réponse, et elle se dit. */
  plans: number;
};

export type AppStats = {
  workouts: number;
  calculators: number;
  plans: number;
  collections: number;
  articles: number;
  zones: number;
  /**
   * Le détail par pratique.
   *
   * Il manquait : ce hook ne rendait qu'un TOTAL, et les cartes de pratique
   * affichaient donc le nombre de distances de course — « 4 distances » —
   * c'est-à-dire une propriété du modèle, pas du contenu. Quelqu'un qui
   * choisit « trail » veut savoir ce qu'il y a derrière, pas combien de cases
   * la table contient.
   *
   * Les séances arrivent en asynchrone (le catalogue est découpé en chunks) :
   * avant le premier chargement, tout est à zéro, et l'appelant doit donc
   * savoir ne rien afficher plutôt qu'afficher « 0 séance ».
   */
  byPractice: Record<Practice, PracticeContent>;
};

const emptyByPractice = (): Record<Practice, PracticeContent> =>
  Object.fromEntries(PRACTICES.map((p) => [p, { workouts: 0, plans: 0 }])) as Record<
    Practice,
    PracticeContent
  >;

/**
 * Les plans tout prêts, rangés par pratique.
 *
 * La pratique se DÉDUIT de `raceDistance` — c'est toute l'idée de
 * `practiceFromRaceDistance`, et c'est ce qui évite d'ajouter un champ à onze
 * fichiers de plan générés. Un plan sans distance de course (construction de
 * base, retour de blessure) n'appartient à aucune pratique : il ne compte pour
 * aucune, plutôt que de gonfler la route.
 */
function prebuiltPlansByPractice(): Record<Practice, number> {
  const counts = Object.fromEntries(PRACTICES.map((p) => [p, 0])) as Record<Practice, number>;
  for (const plan of getAllPrebuiltPlans()) {
    if (!plan.raceDistance) continue;
    counts[practiceFromRaceDistance(plan.raceDistance)] += 1;
  }
  return counts;
}

export function useAppStats(): AppStats {
  const [workouts, setWorkouts] = useState(0);
  const [calculators, setCalculators] = useState(0);
  const [byPractice, setByPractice] = useState(emptyByPractice);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadAllWorkouts(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
      loadAllStrengthSessions(),
    ]).then(([running, cycling, swimming, strength]) => {
      if (cancelled) return;
      setWorkouts(running.length + cycling.length + swimming.length + strength.length);

      const perPractice = countByPractice([...running, ...cycling, ...swimming, ...strength]);
      const plans = prebuiltPlansByPractice();
      setByPractice(
        Object.fromEntries(
          PRACTICES.map((p) => [p, { workouts: perPractice[p], plans: plans[p] }]),
        ) as Record<Practice, PracticeContent>,
      );
    });
    import("@/pages/CalculateursPage").then((m) => {
      if (!cancelled) setCalculators(m.CALCULATEURS.length);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    workouts,
    calculators,
    plans: getAllPrebuiltPlans().length,
    collections: getAllCollections().length,
    articles: articleMetadata.length,
    zones: ZONES,
    byPractice,
  };
}
