import type { PrebuiltPlan } from "./types";
import { plan5kDebutant } from "./plans/5k-debutant";
import { plan5kIntermediaire } from "./plans/5k-intermediaire";
import { plan10kDebutant } from "./plans/10k-debutant";
import { plan10kIntermediaire } from "./plans/10k-intermediaire";
import { planSemiMarathon } from "./plans/semi-marathon";
import { planMarathon } from "./plans/marathon";
import { planBaseBuilding } from "./plans/base-building";
import { planRetourBlessure } from "./plans/retour-blessure";

const allPlans: PrebuiltPlan[] = [
  plan5kDebutant,
  plan5kIntermediaire,
  plan10kDebutant,
  plan10kIntermediaire,
  planSemiMarathon,
  planMarathon,
  planBaseBuilding,
  planRetourBlessure,
];

const bySlug = new Map(allPlans.map((p) => [p.slug, p]));

export function getAllPrebuiltPlans(): PrebuiltPlan[] {
  return allPlans;
}

export function getPrebuiltBySlug(slug: string): PrebuiltPlan | undefined {
  return bySlug.get(slug);
}

export type { PrebuiltPlan } from "./types";
