import type { StepDef, StepId } from "../types";
import { raceStep } from "./RaceStep";
import { eventStep } from "./EventStep";
import { durationStep } from "./DurationStep";
import { levelStep } from "./LevelStep";
import { goalStep } from "./GoalStep";
import { scheduleStep } from "./ScheduleStep";
import { paceStep } from "./PaceStep";
import { summaryStep } from "./SummaryStep";

/**
 * Le registre des étapes.
 *
 * Chaque étape déclare elle-même sa question, ce qui répond, et sa condition
 * d'avancement. La page n'a plus de `switch canProceed` ni de table de
 * rendus : elle lit le registre.
 *
 * Les corps de la date, du nom, du terrain, des courses de prépa et du volume
 * actuel existent toujours (`DateStep.tsx`, ...) mais ne sont plus des
 * étapes : `event` et `schedule` les composent.
 */
export const STEPS: Record<StepId, StepDef> = {
  race: raceStep,
  event: eventStep,
  duration: durationStep,
  level: levelStep,
  goal: goalStep,
  schedule: scheduleStep,
  pace: paceStep,
  summary: summaryStep,
};

export { indexOfStep, stepsFor } from "./flows";
