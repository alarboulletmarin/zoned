import type { CSSProperties } from "react";
import { Option } from "../Option";
import { DURATION_OPTIONS } from "../constants";
import type { StepContext, StepDef } from "../types";

/** Combien de semaines, pour un plan sans course visée. */
function DurationBody({ form, setForm, uid, t, questionId }: StepContext) {
  return (
    <fieldset
      className="zn-contrib-group zn-grid zn-wiz__tiles"
      style={{ "--gap": "var(--sp-5)" } as CSSProperties}
      aria-labelledby={questionId}
    >
      {DURATION_OPTIONS.map((opt) => (
        <Option
          key={opt.weeks}
          name={`${uid}-duration`}
          shape="tile"
          checked={form.totalWeeksOverride === opt.weeks}
          title={String(opt.weeks)}
          body={t("duration.weeks")}
          onSelect={() => setForm((f) => ({ ...f, totalWeeksOverride: opt.weeks }))}
        />
      ))}
    </fieldset>
  );
}

export const durationStep: StepDef = {
  id: "duration",
  titleKey: "duration.title",
  subtitleKey: "duration.subtitle",
  Body: DurationBody,
  isComplete: (form) => form.totalWeeksOverride > 0,
};
