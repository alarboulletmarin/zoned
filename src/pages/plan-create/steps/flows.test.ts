import { describe, expect, test } from "bun:test";

import { indexOfStep, stepsFor } from "./flows";
import type { FormState, StepId } from "../types";
import { PRACTICES } from "@/types/practice";

/** Un brouillon minimal : seuls les champs que `stepsFor` regarde comptent. */
function draft(over: Partial<FormState> = {}): FormState {
  return {
    practice: "road",
    planPurpose: "race",
    trainingGoal: "time",
    raceDistance: null,
    raceDate: "",
    startDate: "",
    useCustomStartDate: false,
    raceName: "",
    runnerLevel: null,
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
    ultraNight: false,
    ultraFuelling: false,
    ultraPoles: false,
    ultraBackToBack: false,
    ...over,
  };
}

describe("stepsFor", () => {
  test("sans pratique choisie, il n'y a qu'une question à poser", () => {
    expect(stepsFor(draft({ practice: null }))).toEqual(["practice"]);
  });

  test("la pratique est toujours la première étape", () => {
    for (const practice of PRACTICES) {
      expect(stepsFor(draft({ practice }))[0]).toBe("practice");
    }
  });

  // Le triathlon est annoncé, pas livré : l'écran le dit et s'arrête. Ni
  // demi-parcours, ni champ en trompe-l'œil.
  test("le triathlon s'arrête à sa première étape", () => {
    expect(stepsFor(draft({ practice: "triathlon" }))).toEqual(["practice"]);
  });

  test("la route ne demande ni terrain ni logistique", () => {
    const steps = stepsFor(draft({ practice: "road" }));
    expect(steps).not.toContain("terrain");
    expect(steps).not.toContain("ultra_logistics");
  });

  // Le champ dénivelé existait, mais sur l'écran d'allure et SANS condition :
  // un coureur de 5 km sur route se faisait demander un D+.
  test("le trail demande le terrain, pas la logistique ultra", () => {
    const steps = stepsFor(draft({ practice: "trail" }));
    expect(steps).toContain("terrain");
    expect(steps).not.toContain("ultra_logistics");
  });

  test("l'ultra demande les deux", () => {
    const steps = stepsFor(draft({ practice: "ultra" }));
    expect(steps).toContain("terrain");
    expect(steps).toContain("ultra_logistics");
  });

  test("le terrain vient avant la semaine type, la logistique juste après", () => {
    const steps = stepsFor(draft({ practice: "ultra" }));
    expect(steps.indexOf("terrain")).toBeLessThan(steps.indexOf("ultra_logistics"));
    expect(steps.indexOf("ultra_logistics")).toBeLessThan(steps.indexOf("schedule"));
  });

  test("chaque parcours finit par le récapitulatif", () => {
    for (const practice of ["road", "trail", "ultra"] as const) {
      const steps = stepsFor(draft({ practice }));
      expect(steps[steps.length - 1]).toBe("summary");
    }
    for (const purpose of ["base_building", "return_from_injury", "beginner_start"] as const) {
      const steps = stepsFor(draft({ planPurpose: purpose }));
      expect(steps[steps.length - 1]).toBe("summary");
    }
  });

  test("un plan sans course visée ne demande ni date ni distance", () => {
    const steps = stepsFor(draft({ planPurpose: "base_building" }));
    expect(steps).not.toContain("distance");
    expect(steps).not.toContain("date");
    expect(steps).toContain("duration");
  });

  test("aucune étape n'apparaît deux fois", () => {
    for (const practice of PRACTICES) {
      const steps = stepsFor(draft({ practice }));
      expect(new Set(steps).size).toBe(steps.length);
    }
  });

  // Les douze StepId déclarés doivent tous être atteignables : une étape que
  // personne ne peut voir est du code mort qui se lit comme une intention.
  // (Le registre lui-même n'est pas importé ici : il tire les composants,
  // donc react-i18next, dont `import.meta.glob` n'existe pas hors de Vite.
  // Le lien registre ↔ StepId est garanti par `Record<StepId, StepDef>`.)
  test("toutes les étapes déclarées sont atteignables", () => {
    const reachable = new Set<StepId>();
    for (const practice of PRACTICES) {
      for (const purpose of ["race", "base_building", "return_from_injury", "beginner_start"] as const) {
        for (const id of stepsFor(draft({ practice, planPurpose: purpose }))) reachable.add(id);
      }
    }
    const declared: StepId[] = [
      "practice", "purpose", "distance", "date", "duration", "race_name",
      "intermediate_goals", "level", "goal", "fitness", "terrain",
      "ultra_logistics", "schedule", "pace", "summary",
    ];
    expect(declared.filter((id) => !reachable.has(id))).toEqual([]);
  });
});

/**
 * Le garde-fou de la reprise d'un brouillon.
 *
 * Un index n'a de sens que dans le parcours où il a été écrit : l'ajout de
 * l'étape « pratique » en tête a décalé tous les autres d'un cran. Reprendre
 * par l'index ferait donc revenir sur la mauvaise question, en silence.
 */
describe("indexOfStep", () => {
  test("retrouve une étape par son id dans le bon parcours", () => {
    expect(indexOfStep("practice", draft())).toBe(0);
    expect(indexOfStep("summary", draft({ practice: "road" }))).toBe(
      stepsFor(draft({ practice: "road" })).length - 1,
    );
  });

  test("rend null pour une étape absente de CE parcours", () => {
    // « terrain » existe, mais pas pour la route.
    expect(indexOfStep("terrain", draft({ practice: "road" }))).toBeNull();
    expect(indexOfStep("terrain", draft({ practice: "trail" }))).not.toBeNull();
  });

  test("rend null pour un id inconnu", () => {
    expect(indexOfStep("pas_une_etape", draft())).toBeNull();
  });

  // Le décalage exact que l'ajout de la pratique a créé : l'index 5 désignait
  // « Niveau » dans l'ancien parcours, et désigne « Courses de prépa » dans le
  // nouveau. C'est pour ça que l'id gagne toujours.
  test("l'id désigne la même question que l'index ne désigne plus", () => {
    const steps = stepsFor(draft({ practice: "road" }));
    expect(steps[5]).toBe("intermediate_goals");
    expect(indexOfStep("level", draft({ practice: "road" }))).toBe(6);
  });
});
