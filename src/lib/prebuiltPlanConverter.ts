import type { TrainingPlan, PlanConfig } from "@/types/plan";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";
import { pickLang } from "@/lib/i18n-utils";

export function convertPrebuiltToPlan(
  prebuilt: PrebuiltPlan,
): TrainingPlan {
  const id = crypto.randomUUID();
  const config: PlanConfig = {
    id,
    planMode: "prebuilt",
    planName: pickLang(prebuilt, "name"),
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
