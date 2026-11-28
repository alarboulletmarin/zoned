import { beforeEach, describe, expect, test } from "bun:test";

import {
  __resetPracticeIndexCache,
  countByPractice,
  practicesOfWorkout,
  workoutMatchesPractice,
} from "./practiceIndex";
import { loadAllWorkouts, loadDisciplineWorkouts } from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";

/** Un gabarit minimal : seuls les champs que le classement regarde comptent. */
function running(over: Partial<WorkoutTemplate> & { id: string }): WorkoutTemplate {
  return {
    category: "endurance",
    selectionCriteria: { phases: [], weekPositions: [], relativeLoad: "medium", tags: [], priorityScore: 0 },
    ...over,
  } as WorkoutTemplate;
}

beforeEach(() => {
  __resetPracticeIndexCache();
});

describe("classement d'une séance de course", () => {
  test("une séance de plat est de la route, et pas du trail", () => {
    const practices = practicesOfWorkout(running({ id: "T-road" }));
    expect(practices).toContain("road");
    expect(practices).not.toContain("trail");
  });

  test("la catégorie trail suffit", () => {
    expect(practicesOfWorkout(running({ id: "T-cat", category: "trail" }))).toContain("trail");
  });

  test("un terrain trail sur un segment suffit, hors catégorie trail", () => {
    const w = running({
      id: "T-terrain",
      category: "hills",
      mainSetStructure: [
        { kind: "segment", description: "montée", terrainType: "trail_technical" },
      ],
    });
    const practices = practicesOfWorkout(w);
    expect(practices).toContain("trail");
    expect(practices).not.toContain("road");
  });

  test("un terrain trail niché dans une répétition compte aussi", () => {
    const w = running({
      id: "T-nested",
      mainSetStructure: [
        {
          kind: "repeat",
          count: 4,
          steps: [{ kind: "segment", description: "côte", terrainType: "mountain" }],
        },
      ],
    });
    expect(practicesOfWorkout(w)).toContain("trail");
  });

  test("un terrain route ne qualifie pas le trail", () => {
    const w = running({
      id: "T-roadterrain",
      mainSetStructure: [{ kind: "segment", description: "bitume", terrainType: "road" }],
    });
    expect(practicesOfWorkout(w)).toEqual(["road"]);
  });

  test("une sortie longue sur route reste de la route", () => {
    expect(practicesOfWorkout(running({ id: "T-lr", category: "long_run" }))).toEqual(["road"]);
  });

  test("un tag d'ultra ne crée plus de pratique", () => {
    const w = running({
      id: "T-tag",
      selectionCriteria: {
        phases: [], weekPositions: [], relativeLoad: "high",
        tags: ["time-on-feet"], priorityScore: 0,
      },
    });
    expect(practicesOfWorkout(w)).toEqual(["road"]);
  });

  test("le champ practices explicite gagne sur la déduction", () => {
    const w = running({ id: "T-override", category: "trail" }) as WorkoutTemplate & {
      practices: ["road"];
    };
    w.practices = ["road"];
    expect(practicesOfWorkout(w)).toEqual(["road"]);
  });
});

describe("transversales et modalités", () => {
  test("vélo et natation n'appartiennent à aucune pratique, et n'y passent pas", () => {
    const bike = running({ id: "CYC-t", discipline: "cycling" });
    const swim = running({ id: "SWM-t", discipline: "swimming" });
    expect(practicesOfWorkout(bike)).toHaveLength(0);
    expect(practicesOfWorkout(swim)).toHaveLength(0);
    for (const p of ["road", "trail"] as const) {
      expect(workoutMatchesPractice(bike, p)).toBe(false);
      expect(workoutMatchesPractice(swim, p)).toBe(false);
    }
  });

  test("le renforcement ne revendique rien et passe sous toutes les pratiques", () => {
    const strength = { id: "STR-t", kind: "strength" } as unknown as AnyWorkoutTemplate;
    expect(practicesOfWorkout(strength)).toHaveLength(0);
    for (const p of ["road", "trail"] as const) {
      expect(workoutMatchesPractice(strength, p)).toBe(true);
    }
  });

  test("une séance route ne passe pas sous le trail", () => {
    const w = running({ id: "T-match" });
    expect(workoutMatchesPractice(w, "road")).toBe(true);
    expect(workoutMatchesPractice(w, "trail")).toBe(false);
  });
});

describe("mémoïsation", () => {
  test("un id déjà vu rend le même tableau, sans reclasser", () => {
    const w = running({ id: "T-memo", category: "trail" });
    const first = practicesOfWorkout(w);
    expect(practicesOfWorkout(w)).toBe(first);
  });
});

// Le garde-fou qui compte vraiment : si quelqu'un touche aux règles de
// classement, ces chiffres bougent et le test le dit. 197 séances de route, 33
// de trail ; le trail les doit à sa catégorie ou à son terrain. Depuis le
// 25 novembre 2026 il n'existe plus que ces deux pratiques (docs/pratiques.md).
describe("le catalogue réel", () => {
  test("les compteurs par pratique sont ceux mesurés", async () => {
    __resetPracticeIndexCache();
    const [run, bike, swim, strength] = await Promise.all([
      loadAllWorkouts(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
      loadAllStrengthSessions(),
    ]);
    const counts = countByPractice([...run, ...bike, ...swim, ...strength]);

    expect(run).toHaveLength(237);
    expect(counts.road).toBe(204);
    expect(counts.trail).toBe(33);
    expect(Object.keys(counts).sort()).toEqual(["road", "trail"]);

    // Route + trail partitionnent la course : une séance est sur l'un ou
    // l'autre, jamais sur les deux, jamais sur aucun. Le vélo et la natation
    // ne comptent nulle part.
    expect(counts.road + counts.trail).toBe(run.length);
    expect(bike.length + swim.length).toBeGreaterThan(0);

    // Le renforcement ne gonfle aucun compteur.
    expect(strength.length).toBeGreaterThan(0);
    for (const s of strength) expect(practicesOfWorkout(s)).toHaveLength(0);
  });
});
