import { Option, OptionStack } from "../Option";
import { GOAL_OPTION_KEYS } from "../constants";
import type { StepContext, StepDef } from "../types";

/** La mentalité : finir, viser un chrono, ou performer. */
function GoalBody({ form, setForm, uid, t, questionId, commit }: StepContext) {
  return (
    <OptionStack questionId={questionId}>
      {GOAL_OPTION_KEYS.map((opt) => (
        <Option
          key={opt.value}
          name={`${uid}-goal`}
          glyph={opt.icon}
          checked={form.trainingGoal === opt.value}
          title={t(opt.labelKey)}
          body={t(opt.descKey)}
          onSelect={() => setForm((f) => ({ ...f, trainingGoal: opt.value }))}
          onCommit={commit}
        />
      ))}
    </OptionStack>
  );
}

export const goalStep: StepDef = {
  id: "goal",
  titleKey: "goal.title",
  subtitleKey: "goal.subtitle",
  Body: GoalBody,
  autoAdvance: true,
  isComplete: (form) => !!form.trainingGoal,
};
