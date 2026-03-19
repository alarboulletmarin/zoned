import type { TrainingPlan, PlanWeek, PlanConfig } from "@/types/plan";
import type { TrainingPhase } from "@/types";

export function createFreePlan(name: string, totalWeeks: number): TrainingPlan {
  const id = crypto.randomUUID();
  const config: PlanConfig = {
    id,
    planMode: "free",
    daysPerWeek: 7,
    planName: name,
    createdAt: new Date().toISOString(),
  };

  const weeks: PlanWeek[] = Array.from({ length: totalWeeks }, (_, i) => ({
    weekNumber: i + 1,
    phase: "base" as TrainingPhase,
    isRecoveryWeek: false,
    volumePercent: 100,
    sessions: [],
  }));

  return { id, config, weeks, totalWeeks, phases: [], name, nameEn: name };
}
