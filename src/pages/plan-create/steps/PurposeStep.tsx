import { Option, OptionStack } from "../Option";
import { PURPOSE_OPTIONS } from "../constants";
import type { StepContext, StepDef, TrainingGoal } from "../types";

/** Pourquoi un plan : une course, une base, une reprise, un début. */
function PurposeBody({ form, setForm, uid, t, questionId }: StepContext) {
  return (
    <OptionStack questionId={questionId}>
      {PURPOSE_OPTIONS.map((opt) => (
        <Option
          key={opt.value}
          name={`${uid}-purpose`}
          glyph={opt.icon}
          checked={form.planPurpose === opt.value}
          title={t(opt.labelKey)}
          body={t(opt.descKey)}
          onSelect={() =>
            setForm((f) => ({
              ...f,
              planPurpose: opt.value,
              // Set defaults for non-race plans
              ...(opt.value === "beginner_start" ? { daysPerWeek: 3, totalWeeksOverride: 8, trainingGoal: "finish" as TrainingGoal } : {}),
              ...(opt.value === "return_from_injury" ? { daysPerWeek: 3, totalWeeksOverride: 10, trainingGoal: "finish" as TrainingGoal } : {}),
              ...(opt.value === "base_building" ? { totalWeeksOverride: 12, trainingGoal: "time" as TrainingGoal } : {}),
            }))
          }
        />
      ))}
    </OptionStack>
  );
}

export const purposeStep: StepDef = {
  id: "purpose",
  titleKey: "purpose.title",
  subtitleKey: "purpose.subtitle",
  Body: PurposeBody,
  isComplete: (form) => !!form.planPurpose,
};
