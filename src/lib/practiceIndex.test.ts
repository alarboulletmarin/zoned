import { beforeEach, describe, expect, test } from "bun:test";

import {
  __resetPracticeIndexCache,
  countByPractice,
  isUltraSpecific,
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

  test("le trail sert aussi l'ultra", () => {
    expect(practicesOfWorkout(running({ id: "T-tu", category: "trail" }))).toContain("ultra");
  });

  test("une sortie longue sur route sert l'ultra sans devenir du trail", () => {
    const practices = practicesOfWorkout(running({ id: "T-lr", category: "long_run" }));
    expect(practices).toEqual(expect.arrayContaining(["road", "ultra"]));
    expect(practices).not.toContain("trail");
  });

  test("un tag ultra qualifie une séance qui ne l'annonce pas autrement", () => {
    const w = running({
      id: "T-tag",
      selectionCriteria: {
        phases: [], weekPositions: [], relativeLoad: "high",
        tags: ["time-on-feet"], priorityScore: 0,
      },
    });
    expect(practicesOfWorkout(w)).toContain("ultra");
    expect(isUltraSpecific(w)).toBe(true);
  });

  test("une séance trail sans tag sert l'ultra sans être écrite pour lui", () => {
    const w = running({ id: "T-notspecific", category: "trail" });
    expect(practicesOfWorkout(w)).toContain("ultra");
    expect(isUltraSpecific(w)).toBe(false);
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
  test("vélo et natation vont au triathlon", () => {
    const bike = running({ id: "CYC-t", discipline: "cycling" });
    const swim = running({ id: "SWM-t", discipline: "swimming" });
    expect(practicesOfWorkout(bike)).toEqual(["triathlon"]);
    expect(practicesOfWorkout(swim)).toEqual(["triathlon"]);
  });

  test("le renforcement ne revendique rien et passe sous toutes les pratiques", () => {
    const strength = { id: "STR-t", kind: "strength" } as unknown as AnyWorkoutTemplate;
    expect(practicesOfWorkout(strength)).toHaveLength(0);
    for (const p of ["road", "trail", "ultra", "triathlon"] as const) {
      expect(workoutMatchesPractice(strength, p)).toBe(true);
    }
    expect(isUltraSpecific(strength)).toBe(false);
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
// classement, ces chiffres bougent et le test le dit.
//
// Premier relevé, avant toute écriture : 197 route, 28 trail, 44 ultra dont 11
// spécifiques — le terrain et les tags étaient déjà là, c'est le critère qui
// manquait. Les cinq séances écrites pour l'ultra (TRL-015, TRL-017…TRL-020)
// portent le trail à 33 et l'ultra à 49, dont 16 spécifiques. Une séance ultra
// ajoutée sans terrain ni tag ne bougerait aucun de ces nombres, et c'est
// justement ce que ce test attrape.
//
// Trois autres avaient été écrites puis RETIRÉES le même jour : elles
// doublaient des archétypes déjà au catalogue (LR-016 « Ultra time-on-feet »,
// TRL-009/TRL-010 « Back-to-back jour 1/2 », TRL-005 « Descente technique
// contrôlée »). Les ids TRL-013, TRL-014 et TRL-016 restent donc brûlés — un
// identifiant ne se réemploie pas.
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

    expect(run).toHaveLength(230);
    expect(counts.road).toBe(197);
    expect(counts.trail).toBe(33);
    expect(counts.ultra).toBe(49);
    expect(counts.triathlon).toBe(bike.length + swim.length);

    // Route + trail partitionnent la course : une séance est sur l'un ou
    // l'autre, jamais sur les deux, jamais sur aucun.
    expect(counts.road + counts.trail).toBe(run.length);

    // L'ultra est un sur-ensemble du trail.
    expect(counts.ultra).toBeGreaterThan(counts.trail);
    expect(run.filter(isUltraSpecific)).toHaveLength(16);

    // Le renforcement ne gonfle aucun compteur.
    expect(strength.length).toBeGreaterThan(0);
    for (const s of strength) expect(practicesOfWorkout(s)).toHaveLength(0);
  });
});
