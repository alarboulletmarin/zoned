import type { TrainingPlan, PlanConfig } from "@/types/plan";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";

export function convertPrebuiltToPlan(
  prebuilt: PrebuiltPlan,
  isEn: boolean,
): TrainingPlan {
  const id = crypto.randomUUID();
  const config: PlanConfig = {
    id,
    planMode: "prebuilt",
    planName: isEn ? prebuilt.nameEn : prebuilt.name,
    raceDistance: prebuilt.raceDistance,
    daysPerWeek: prebuilt.sessionsPerWeek,
    createdAt: new Date().toISOString(),
  };

  return {
    id,
    config,
    weeks: structuredClone(prebuilt.weeks),
    totalWeeks: prebuilt.totalWeeks,
    phases: structuredClone(prebuilt.phases),
    name: prebuilt.name,
    nameEn: prebuilt.nameEn,
  };
}
