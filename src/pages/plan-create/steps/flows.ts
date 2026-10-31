import type { FormState, StepId } from "../types";

/**
 * L'enchaînement des étapes, sans React.
 *
 * Séparé du registre pour une raison concrète : `registry.ts` importe les
 * composants, donc `@/components/ui/*`, donc `react-i18next`, dont le
 * `import.meta.glob` n'existe pas hors de Vite. La logique d'enchaînement est
 * pure et c'est elle qu'il faut verrouiller par des tests, voir
 * `flows.test.ts`.
 *
 * Sept écrans pour une course, six sans course. Le parcours en comptait
 * douze, treize en trail, précédés de deux couloirs (`/plan/new` demandait la
 * pratique, `/plan/new/mode` le mode de fabrication), soit treize décisions
 * avant un plan route. Ce qui a fusionné :
 *
 * - **race** = pratique + pourquoi + distance. La pratique se déduit de la
 *   course, comme partout ailleurs dans l'app, et les plans sans course sont
 *   des réponses de la même question ;
 * - **event** = date + nom + terrain (trail) + courses de prépa (en repli) ;
 * - **schedule** porte aussi le volume actuel, facultatif, qui avait son
 *   écran à lui.
 *
 * Niveau, état d'esprit, allure et récapitulatif ne changent pas. Le niveau
 * accueille la VMA, le seul chiffre que le générateur lit, et qu'il inventait
 * en silence quand il manquait.
 */
const RACE_STEPS: StepId[] = ["race", "event", "level", "goal", "schedule", "pace", "summary"];

const NON_RACE_STEPS: StepId[] = ["race", "duration", "level", "goal", "schedule", "summary"];

/** Les étapes qui s'appliquent à ce brouillon. */
export function stepsFor(form: FormState): StepId[] {
  // Tant que rien n'est choisi, il n'y a qu'une question à poser.
  if (form.planPurpose === "race" && !form.raceDistance) return ["race"];
  if (form.planPurpose !== "race") return NON_RACE_STEPS;
  return RACE_STEPS;
}

/** L'index d'une étape dans le parcours d'un brouillon, ou null. */
export function indexOfStep(stepId: string, form: FormState): number | null {
  const index = stepsFor(form).indexOf(stepId as StepId);
  return index >= 0 ? index : null;
}
