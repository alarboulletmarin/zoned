/**
 * Le nom de fichier d'un plan, le meme pour les trois formats.
 *
 * Les trois exports d'un plan le nommaient chacun a sa facon : le PDF prenait
 * son nom, le JSON aussi mais sans la distance, et l'ICS prenait son
 * identifiant, c'est a dire un UUID. Le calendrier, le seul des trois qu'on
 * range vraiment quelque part, arrivait donc sous
 * "plan-5K-5f107baf-5d76-4fc0-8e83-55d1ee74eba2.ics", ou rien ne dit de quel
 * plan il s'agit.
 *
 * Le nom du plan est ce que l'utilisateur y reconnait ; l'identifiant ne sert
 * que si le plan n'a pas de nom, ce que le modele autorise.
 */

import type { TrainingPlan } from "@/types/plan";

/** Ce que les trois exports lisent d'un plan. Rien de plus n'est requis. */
type NamedPlan = Pick<TrainingPlan, "id" | "name"> & {
  config?: { raceDistance?: string };
};

/**
 * "plan-10K-Mon semi de printemps.pdf". La distance reste dans le nom : elle
 * trie une etagere de plans mieux que leurs noms.
 */
export function planFilename(plan: NamedPlan, extension: string): string {
  const distance = plan.config?.raceDistance ?? "free";
  const label = plan.name?.trim() || plan.id;
  return `plan-${distance}-${label}.${extension}`;
}
