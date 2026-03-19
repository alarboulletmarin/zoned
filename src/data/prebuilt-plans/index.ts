import type { PrebuiltPlan } from "./types";
import { plan5kBeginner } from "./plans/5k-beginner";
import { plan5kIntermediate } from "./plans/5k-intermediate";
import { plan10kBeginner } from "./plans/10k-beginner";
import { plan10kIntermediate } from "./plans/10k-intermediate";
import { planSemiMarathon } from "./plans/semi-marathon";
import { planMarathon } from "./plans/marathon";
import { planBaseBuilding } from "./plans/base-building";
import { planReturnFromInjury } from "./plans/return-from-injury";

const allPlans: PrebuiltPlan[] = [
  plan5kBeginner,
  plan5kIntermediate,
  plan10kBeginner,
  plan10kIntermediate,
  planSemiMarathon,
  planMarathon,
  planBaseBuilding,
  planReturnFromInjury,
];

const bySlug = new Map(allPlans.map((p) => [p.slug, p]));

export function getAllPrebuiltPlans(): PrebuiltPlan[] {
  return allPlans;
}

export function getPrebuiltBySlug(slug: string): PrebuiltPlan | undefined {
  return bySlug.get(slug);
}

export type { PrebuiltPlan } from "./types";
