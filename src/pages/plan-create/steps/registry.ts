import type { StepDef, StepId } from "../types";
import { practiceStep } from "./PracticeStep";
import { purposeStep } from "./PurposeStep";
import { distanceStep } from "./DistanceStep";
import { dateStep } from "./DateStep";
import { durationStep } from "./DurationStep";
import { raceNameStep } from "./RaceNameStep";
import { intermediateGoalsStep } from "./IntermediateGoalsStep";
import { levelStep } from "./LevelStep";
import { goalStep } from "./GoalStep";
import { fitnessStep } from "./FitnessStep";
import { scheduleStep } from "./ScheduleStep";
import { paceStep } from "./PaceStep";
import { terrainStep } from "./TerrainStep";
import { ultraLogisticsStep } from "./UltraLogisticsStep";
import { summaryStep } from "./SummaryStep";

/**
 * Le registre des étapes.
 *
 * Chaque étape déclare elle-même sa question, ce qui répond, et sa condition
 * d'avancement. La page n'a plus de `switch canProceed` ni de table de
 * rendus : elle lit le registre.
 */
export const STEPS: Record<StepId, StepDef> = {
  practice: practiceStep,
  purpose: purposeStep,
  distance: distanceStep,
  date: dateStep,
  duration: durationStep,
  race_name: raceNameStep,
  intermediate_goals: intermediateGoalsStep,
  level: levelStep,
  goal: goalStep,
  fitness: fitnessStep,
  schedule: scheduleStep,
  pace: paceStep,
  terrain: terrainStep,
  ultra_logistics: ultraLogisticsStep,
  summary: summaryStep,
};

export { indexOfStep, stepsFor } from "./flows";
