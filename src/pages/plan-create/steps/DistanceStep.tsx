import { Option, OptionStack } from "../Option";
import { RACE_DISTANCE_ICONS } from "../constants";
import { RACE_DISTANCE_META, type RaceDistance } from "@/types/plan";
import type { StepContext, StepDef } from "../types";

/** Quelle course. */
function DistanceBody({ form, setForm, uid, pick, questionId }: StepContext) {
  return (
    <OptionStack questionId={questionId}>
      {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => {
        const meta = RACE_DISTANCE_META[dist];
        return (
          <Option
            key={dist}
            name={`${uid}-distance`}
            glyph={RACE_DISTANCE_ICONS[dist]}
            checked={form.raceDistance === dist}
            title={pick(meta, "label")}
            data={`${meta.distanceKm} km`}
            onSelect={() => setForm((f) => ({ ...f, raceDistance: dist }))}
          />
        );
      })}
    </OptionStack>
  );
}

export const distanceStep: StepDef = {
  id: "distance",
  titleKey: "distance.title",
  subtitleKey: "distance.subtitle",
  Body: DistanceBody,
  isComplete: (form) => !!form.raceDistance,
};
