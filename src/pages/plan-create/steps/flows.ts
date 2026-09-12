import { isPracticeLive } from "@/types/practice";
import type { FormState, StepId } from "../types";

/**
 * L'enchaînement des étapes, sans React.
 *
 * Séparé du registre pour une raison concrète : `registry.ts` importe les
 * douze composants, donc `@/components/ui/*`, donc `react-i18next`, dont le
 * `import.meta.glob` n'existe pas hors de Vite. La logique d'enchaînement est
 * pure et c'est elle qu'il faut verrouiller par des tests — voir
 * `flows.test.ts`.
 */

/**
 * L'enchaînement, par pratique.
 *
 * Il vit ici et non dans `PRACTICE_META` : la méta est de la donnée de domaine
 * lue par `lib/` et `data/`, le séquencement est de l'UI. Les mélanger
 * traînerait des types de composants React dans `src/types/`.
 *
 * Deux étapes seulement changent avec la pratique — et elles changent par
 * DONNÉE (`distancesOfPractice`), pas par branchement :
 *
 * - le **terrain et le dénivelé** n'apparaissent qu'en trail et en ultra. Le
 *   champ dénivelé existait déjà, mais il était posé sur l'écran d'allure et
 *   rendait pour TOUT LE MONDE : un coureur de 5 km sur route se faisait
 *   demander un D+ ;
 * - la **logistique ultra** — nuit, ravitaillement, bâtons, week-end
 *   disponible — n'a de sens qu'au-delà du trail.
 */
const AFTER_DISTANCE: StepId[] = [
  "date",
  "race_name",
  "intermediate_goals",
  "level",
  "goal",
  "fitness",
];

const BASE_RACE: StepId[] = ["practice", "purpose", "distance", ...AFTER_DISTANCE];

const NON_RACE_STEPS: StepId[] = [
  "practice",
  "purpose",
  "duration",
  "level",
  "goal",
  "fitness",
  "schedule",
  "summary",
];

/** Les étapes qui s'appliquent à ce brouillon. */
export function stepsFor(form: FormState): StepId[] {
  // Une pratique annoncée n'a pas de suite : l'écran le dit et s'arrête.
  if (form.practice && !isPracticeLive(form.practice)) return ["practice"];
  // Tant qu'aucune pratique n'est choisie, il n'y a qu'une question à poser.
  if (!form.practice) return ["practice"];

  if (form.planPurpose !== "race") return NON_RACE_STEPS;

  const terrain: StepId[] =
    form.practice === "trail" || form.practice === "ultra" ? ["terrain"] : [];
  const ultra: StepId[] = form.practice === "ultra" ? ["ultra_logistics"] : [];

  return [...BASE_RACE, ...terrain, ...ultra, "schedule", "pace", "summary"];
}

/** L'index d'une étape dans le parcours d'un brouillon, ou null. */
export function indexOfStep(stepId: string, form: FormState): number | null {
  const index = stepsFor(form).indexOf(stepId as StepId);
  return index >= 0 ? index : null;
}
