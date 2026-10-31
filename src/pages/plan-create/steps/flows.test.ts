import { describe, expect, test } from "bun:test";

import { indexOfStep, stepsFor } from "./flows";
import type { FormState, StepId } from "../types";

/** Un brouillon minimal : seuls les champs que `stepsFor` regarde comptent. */
function draft(over: Partial<FormState> = {}): FormState {
  return {
    practice: null,
    planPurpose: "race",
    trainingGoal: "time",
    raceDistance: null,
    raceDate: "",
    startDate: "",
    useCustomStartDate: false,
    raceName: "",
    runnerLevel: null,
    vma: "",
    daysPerWeek: 4,
    longRunDay: 6,
    targetPace: "",
    elevationGain: "",
    totalWeeksOverride: 0,
    currentWeeklyKm: "",
    currentLongRunKm: "",
    includeStrength: false,
    strengthFrequency: 2,
    intermediateGoals: [],
    terrain: "trail_runnable",
    ...over,
  };
}

describe("stepsFor", () => {
  test("tant que rien n'est choisi, il n'y a qu'une question à poser", () => {
    expect(stepsFor(draft())).toEqual(["race"]);
  });

  // Sept écrans pour une course : c'est le budget du parcours, et ce test le
  // tient. En ajouter un demande d'en retirer un, ou de changer ce nombre en
  // sachant ce qu'il coûte.
  test("une course, c'est sept écrans, la course en tête et le récapitulatif en queue", () => {
    for (const raceDistance of ["5K", "10K", "semi", "marathon", "trail_short", "trail"] as const) {
      const steps = stepsFor(draft({ raceDistance, practice: raceDistance.startsWith("trail") ? "trail" : "road" }));
      expect(steps).toHaveLength(7);
      expect(steps[0]).toBe("race");
      expect(steps[steps.length - 1]).toBe("summary");
    }
  });

  test("le trail ne coûte pas d'écran de plus : le terrain vit dans la course", () => {
    expect(stepsFor(draft({ raceDistance: "trail", practice: "trail" }))).toEqual(
      stepsFor(draft({ raceDistance: "10K", practice: "road" })),
    );
  });

  test("un plan sans course visée ne demande ni course ni allure, mais une durée", () => {
    for (const purpose of ["base_building", "return_from_injury", "beginner_start"] as const) {
      const steps = stepsFor(draft({ planPurpose: purpose, practice: "road" }));
      expect(steps).toHaveLength(6);
      expect(steps).not.toContain("event");
      expect(steps).not.toContain("pace");
      expect(steps).toContain("duration");
      expect(steps[steps.length - 1]).toBe("summary");
    }
  });

  test("aucune étape n'apparaît deux fois", () => {
    for (const form of [
      draft({ raceDistance: "10K", practice: "road" }),
      draft({ planPurpose: "base_building", practice: "road" }),
    ]) {
      const steps = stepsFor(form);
      expect(new Set(steps).size).toBe(steps.length);
    }
  });

  // Les StepId déclarés doivent tous être atteignables : une étape que personne
  // ne peut voir est du code mort qui se lit comme une intention. Le lien
  // registre ↔ StepId est garanti par `Record<StepId, StepDef>`.
  test("toutes les étapes déclarées sont atteignables", () => {
    const reachable = new Set<StepId>();
    for (const form of [
      draft({ raceDistance: "10K", practice: "road" }),
      draft({ raceDistance: "trail", practice: "trail" }),
      draft({ planPurpose: "base_building", practice: "road" }),
    ]) {
      for (const id of stepsFor(form)) reachable.add(id);
    }
    const declared: StepId[] = [
      "race", "event", "duration", "level", "goal", "schedule", "pace", "summary",
    ];
    expect(declared.filter((id) => !reachable.has(id))).toEqual([]);
  });
});

/**
 * Le garde-fou de la reprise d'un brouillon.
 *
 * Un index n'a de sens que dans le parcours où il a été écrit. Reprendre par
 * l'index ferait revenir sur la mauvaise question, en silence.
 */
describe("indexOfStep", () => {
  test("retrouve une étape par son id dans le bon parcours", () => {
    const road = draft({ raceDistance: "10K", practice: "road" });
    expect(indexOfStep("race", road)).toBe(0);
    expect(indexOfStep("summary", road)).toBe(stepsFor(road).length - 1);
  });

  test("rend null pour une étape absente de CE parcours", () => {
    // La course existe, mais pas pour un plan sans course visée.
    expect(indexOfStep("event", draft({ planPurpose: "base_building", practice: "road" }))).toBeNull();
    expect(indexOfStep("event", draft({ raceDistance: "10K", practice: "road" }))).not.toBeNull();
  });

  test("rend null pour un id inconnu", () => {
    expect(indexOfStep("pas_une_etape", draft())).toBeNull();
  });
});
