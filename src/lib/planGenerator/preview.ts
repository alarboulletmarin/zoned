/**
 * Plan shape preview — the phase distribution and volume envelope a config
 * would produce, without building a single session.
 *
 * The plan-creation wizard shows this live while the form is being filled, so
 * it has to answer with whatever is known so far. It deliberately reuses the
 * generator's own phase and volume functions (steps 5 and 6 of `generatePlan`)
 * rather than approximating them, so the preview and the generated plan can
 * never tell two different stories.
 */

import type { Difficulty } from "@/types";
import type {
  PhaseRange,
  PlanPurpose,
  RaceDistance,
  TrainingGoal,
} from "@/types/plan";
import { MIN_PLAN_WEEKS, PURPOSE_CONFIGS } from "./constants";
import { goalDemandFactor } from "./goalCalibration";
import { calculatePhases, calculatePurposePhases } from "./phases";
import { calculateVolumeProgression } from "./volume";

export interface PlanPreviewInput {
  planPurpose: PlanPurpose;
  /** Weeks between start and race, or the chosen duration for non-race plans. */
  totalWeeks: number;
  raceDistance: RaceDistance | null;
  runnerLevel: Difficulty | null;
  daysPerWeek: number;
  trainingGoal: TrainingGoal;
  currentWeeklyKm?: number;
  targetPaceMinKm?: number;
  vma?: number;
}

export interface PlanShapePreview {
  totalWeeks: number;
  phases: PhaseRange[];
  /** Highest weekly target of the progression, in km. */
  peakWeeklyKm: number;
  /** Sum of every week's target, in km. */
  totalKm: number;
  /** > 1 when the target pace asks for more than the current VMA delivers. */
  demandFactor: number;
}

/**
 * @returns null while the config is too incomplete to shape a plan (duration
 *          below the minimum the purpose accepts).
 */
export function previewPlanShape(
  input: PlanPreviewInput,
): PlanShapePreview | null {
  const isRacePlan = input.planPurpose === "race";
  const purposeConfig = isRacePlan
    ? null
    : PURPOSE_CONFIGS[input.planPurpose as Exclude<PlanPurpose, "race">];

  const totalWeeks = Math.round(input.totalWeeks);
  const minWeeks = purposeConfig?.minWeeks ?? MIN_PLAN_WEEKS;
  if (!Number.isFinite(totalWeeks) || totalWeeks < minWeeks) return null;

  const distance =
    input.raceDistance ?? purposeConfig?.fallbackDistance ?? "10K";
  const level: Difficulty = input.runnerLevel ?? "intermediate";

  const phases = purposeConfig
    ? calculatePurposePhases(totalWeeks, purposeConfig.phases)
    : calculatePhases(totalWeeks, distance, input.trainingGoal);

  const demandFactor = isRacePlan
    ? goalDemandFactor(input.targetPaceMinKm, input.vma, distance)
    : 1;

  const weeks = calculateVolumeProgression(
    totalWeeks,
    phases,
    distance,
    level,
    input.currentWeeklyKm,
    input.trainingGoal,
    input.daysPerWeek,
    purposeConfig?.volumeMultiplier ?? 1,
    demandFactor,
    purposeConfig?.startVolumeMultiplier,
  );

  let peakWeeklyKm = 0;
  let totalKm = 0;
  for (const week of weeks) {
    if (week.targetKm > peakWeeklyKm) peakWeeklyKm = week.targetKm;
    totalKm += week.targetKm;
  }

  return {
    totalWeeks,
    phases,
    peakWeeklyKm: Math.round(peakWeeklyKm),
    totalKm: Math.round(totalKm),
    demandFactor,
  };
}
