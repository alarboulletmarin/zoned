import type { PlanForm } from "@/lib/planCreate";

/**
 * L'enchaînement des écrans, sans React.
 *
 * Cinq écrans au plus : l'objectif, la date (ou la durée), le choix entre un
 * plan prêt et le sur mesure (seulement s'il existe un plan prêt pour cet
 * objectif), toi et ta semaine (sur mesure seulement), puis l'aperçu. Le
 * parcours en comptait sept, et le plan n'apparaissait qu'une fois créé.
 */
export type ScreenId = "goal" | "date" | "path" | "you" | "preview";

export const SCREENS: readonly ScreenId[] = ["goal", "date", "path", "you", "preview"];

export function isScreenId(value: string | null): value is ScreenId {
  return !!value && (SCREENS as readonly string[]).includes(value);
}

/** Les écrans de ce brouillon, sachant combien de plans prêts répondent à son objectif. */
export function stepsFor(form: Pick<PlanForm, "prebuiltSlug">, prebuiltCount: number): ScreenId[] {
  const steps: ScreenId[] = ["goal", "date"];
  if (prebuiltCount > 0) steps.push("path");
  if (!form.prebuiltSlug) steps.push("you");
  steps.push("preview");
  return steps;
}

/**
 * L'écran qu'on peut vraiment montrer : une URL qui demande l'aperçu sans
 * objectif ni date ramène à la première question restée sans réponse.
 */
export function reachableStep(
  wanted: ScreenId,
  steps: readonly ScreenId[],
  answered: { goal: boolean; date: boolean },
): ScreenId {
  if (!answered.goal) return "goal";
  const step = steps.includes(wanted) ? wanted : steps[steps.length - 1];
  if (!answered.date && steps.indexOf(step) > steps.indexOf("date")) return "date";
  return step;
}
