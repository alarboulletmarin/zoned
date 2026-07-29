/**
 * Backward-compatibility guard for `zoned-custom-workouts`.
 *
 * Custom workouts are full `WorkoutTemplate` objects written by whatever build
 * the user happened to run. Unlike share links they ARE migratable, because we
 * own the read path: `getCustomWorkouts()` funnels every read through
 * `normalizeWorkoutStructureSource()`. That normaliser is the migration seam,
 * and this file pins what it must keep doing (issue #127, rule 3:
 * "read old, write new", never require a write to fix a read).
 *
 * The blob below is FROZEN: it is what a build that predates the
 * `*Structure` fields wrote to localStorage. Do not regenerate it and do not
 * "modernise" it by adding structures; its whole point is to be old.
 */

import { beforeEach, describe, expect, test } from "bun:test";

import type { WorkoutTemplate } from "@/types";
import { getCustomWorkout, getCustomWorkouts } from "./customWorkoutStorage";
import { normalizeWorkoutStructureSource } from "./workoutStructure";

// ── Minimal localStorage shim for bun test (jsdom-free) ────────────
class MemoryStorage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

// Install once; Bun reuses the same globalThis between tests.
if (typeof (globalThis as { localStorage?: Storage }).localStorage === "undefined") {
  (globalThis as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
}

const STORAGE_KEY = "zoned-custom-workouts";

beforeEach(() => {
  localStorage.clear();
});

/**
 * FROZEN legacy blob: a custom workout as written before `warmupStructure` /
 * `mainSetStructure` / `cooldownStructure` existed. Only the `*Template` block
 * arrays are present. Never regenerate: this is the shape sitting in the
 * localStorage of users who have not opened the builder since.
 */
const FROZEN_PRE_STRUCTURE_BLOB = JSON.stringify([
  {
    id: "CUSTOM-legacy1",
    name: "Séance seuil maison",
    nameEn: "Homemade threshold session",
    description: "Créée avant les structures",
    descriptionEn: "Authored before structures existed",
    category: "threshold",
    sessionType: "threshold",
    targetSystem: "lactate_threshold",
    difficulty: "intermediate",
    typicalDuration: { min: 45, max: 60 },
    environment: { requiresHills: false, requiresTrack: false },
    warmupTemplate: [{ description: "Échauffement 15min", durationMin: 15, zone: "Z2" }],
    mainSetTemplate: [
      {
        description: "3x8min au seuil",
        durationMin: 8,
        zone: "Z4",
        repetitions: 3,
        recovery: "2min trot Z1",
      },
    ],
    cooldownTemplate: [{ description: "Retour au calme 10min", durationMin: 10, zone: "Z1" }],
    coachingTips: ["Rester régulier"],
    coachingTipsEn: ["Stay steady"],
    commonMistakes: [],
    commonMistakesEn: [],
    variationIds: [],
    selectionCriteria: {
      phases: [],
      weekPositions: [],
      relativeLoad: "moderate",
      tags: ["custom"],
      priorityScore: 0,
    },
  },
]);

describe("a pre-structure custom workout still reads back usable", () => {
  test("the identity fields survive untouched", () => {
    localStorage.setItem(STORAGE_KEY, FROZEN_PRE_STRUCTURE_BLOB);
    const workouts = getCustomWorkouts();

    expect(workouts).toHaveLength(1);
    const workout = workouts[0];
    expect(workout.id).toBe("CUSTOM-legacy1");
    expect(workout.name).toBe("Séance seuil maison");
    expect(workout.nameEn).toBe("Homemade threshold session");
    expect(workout.category).toBe("threshold");
    expect(workout.typicalDuration).toEqual({ min: 45, max: 60 });
    expect(workout.coachingTips).toEqual(["Rester régulier"]);
  });

  test("the legacy blocks are still there; nothing is dropped on read", () => {
    localStorage.setItem(STORAGE_KEY, FROZEN_PRE_STRUCTURE_BLOB);
    const workout = getCustomWorkouts()[0];

    expect(workout.warmupTemplate).toHaveLength(1);
    expect(workout.mainSetTemplate).toHaveLength(1);
    expect(workout.cooldownTemplate).toHaveLength(1);
    expect(workout.mainSetTemplate[0]).toMatchObject({
      durationMin: 8,
      zone: "Z4",
      repetitions: 3,
      recovery: "2min trot Z1",
    });
  });

  test("the missing structure is derived from the blocks", () => {
    localStorage.setItem(STORAGE_KEY, FROZEN_PRE_STRUCTURE_BLOB);
    const workout = getCustomWorkouts()[0];

    expect(workout.warmupStructure).toEqual([
      { kind: "segment", description: "Échauffement 15min", durationSec: 900, zone: "Z2", role: "effort" },
    ]);
    // "3x8min au seuil" + recovery becomes a real repeat, not a text blob.
    expect(workout.mainSetStructure).toEqual([
      {
        kind: "repeat",
        count: 3,
        unit: "reps",
        steps: [
          { kind: "segment", description: "8min au seuil", durationSec: 480, zone: "Z4", role: "effort" },
        ],
        between: [
          { kind: "segment", description: "2min trot Z1", durationSec: 120, zone: "Z1", role: "recovery" },
        ],
      },
    ]);
    expect(workout.cooldownStructure).toEqual([
      { kind: "segment", description: "Retour au calme 10min", durationSec: 600, zone: "Z1", role: "effort" },
    ]);
  });

  test("getCustomWorkout resolves a legacy id", () => {
    localStorage.setItem(STORAGE_KEY, FROZEN_PRE_STRUCTURE_BLOB);
    expect(getCustomWorkout("CUSTOM-legacy1")?.name).toBe("Séance seuil maison");
  });

  test("normalising is a fixed point, so reads never mutate the workout again", () => {
    // Migration on read is only safe if it converges. If it did not, every
    // read/save cycle would keep rewriting the user's own descriptions.
    localStorage.setItem(STORAGE_KEY, FROZEN_PRE_STRUCTURE_BLOB);
    const once = getCustomWorkouts()[0];
    const twice = normalizeWorkoutStructureSource(once);
    expect(twice).toEqual(once);
  });
});

describe("a malformed blob never throws", () => {
  test.each([
    ["unparseable text", "not json at all"],
    ["a truncated array", '[{"id":"CUSTOM-x","name":"Broken"'],
    ["the literal null", "null"],
    ["an object instead of an array", "{}"],
    ["primitives instead of workouts", "[1,2,3]"],
    ["objects missing every field", '[{},{}]'],
    ["a workout with no blocks at all", '[{"id":"CUSTOM-y","name":"Nu"}]'],
  ])("tolerates %s", (_label, blob) => {
    localStorage.setItem(STORAGE_KEY, blob);
    let workouts: WorkoutTemplate[] | undefined;
    expect(() => {
      workouts = getCustomWorkouts();
    }).not.toThrow();
    expect(Array.isArray(workouts)).toBe(true);
  });

  test("unreadable blobs degrade to an empty list, not an exception", () => {
    for (const blob of ["not json at all", "null", "{}"]) {
      localStorage.setItem(STORAGE_KEY, blob);
      expect(getCustomWorkouts()).toEqual([]);
    }
  });

  test("an absent key reads as an empty list", () => {
    expect(getCustomWorkouts()).toEqual([]);
  });
});
