import type { FormState, StepDef, StepId } from "../types";
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
import { summaryStep } from "./SummaryStep";

/**
 * Le registre des étapes.
 *
 * Chaque étape déclare elle-même sa question, ce qui répond, et sa condition
 * d'avancement. La page n'a plus de `switch canProceed` ni de table de
 * rendus : elle lit le registre.
 */
export const STEPS: Record<StepId, StepDef> = {
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
  summary: summaryStep,
};

/**
 * L'enchaînement, tel qu'il était : une course, ou pas.
 *
 * Il vit ici et non dans `PRACTICE_META` : la méta est de la donnée de domaine
 * lue par `lib/` et `data/`, le séquencement est de l'UI. Les mélanger
 * traînerait des types de composants React dans `src/types/`.
 */
const RACE_STEPS: StepId[] = [
  "purpose",
  "distance",
  "date",
  "race_name",
  "intermediate_goals",
  "level",
  "goal",
  "fitness",
  "schedule",
  "pace",
  "summary",
];

const NON_RACE_STEPS: StepId[] = [
  "purpose",
  "duration",
  "level",
  "goal",
  "fitness",
  "schedule",
  "summary",
];

/** Les étapes qui s'appliquent à ce brouillon. */
export function stepsFor(form: FormState): StepId[] {
  return form.planPurpose === "race" ? RACE_STEPS : NON_RACE_STEPS;
}
