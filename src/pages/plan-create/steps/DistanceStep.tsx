import { Option, OptionStack } from "../Option";
import { RACE_DISTANCE_ICONS } from "../constants";
import { RACE_DISTANCE_META } from "@/types/plan";
import { PRACTICES, distancesOfPractice } from "@/types/practice";
import type { StepContext, StepDef } from "../types";

/**
 * Quelle course — mais seulement parmi celles de la pratique choisie.
 *
 * Cette étape affichait les SEPT distances à plat dans une seule grille :
 * 5 km, 10 km, semi, marathon, trail court, trail, ultra côte à côte, sans
 * cadrage. La pratique connue, c'est quatre cartes pour la route, deux pour le
 * trail, une pour l'ultra. La réduction vient d'une DONNÉE
 * (`distancesOfPractice`), pas d'un branchement.
 */
function DistanceBody({ form, setForm, uid, pick, questionId, commit }: StepContext) {
  // Sans pratique — cas qui ne devrait pas arriver, l'étape venant après —
  // on montre tout plutôt que rien.
  const distances = form.practice
    ? distancesOfPractice(form.practice)
    : PRACTICES.flatMap((p) => distancesOfPractice(p));

  return (
    <OptionStack questionId={questionId}>
      {distances.map((dist) => {
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
            onCommit={commit}
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
  autoAdvance: true,
  isComplete: (form) => !!form.raceDistance,
};
