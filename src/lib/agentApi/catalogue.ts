/**
 * The whole published catalogue, in one list, for the agent API.
 *
 * Running, cycling, swimming and strength templates live behind four
 * different lazy loaders (`src/data/workouts/index.ts`, `src/data/strength`).
 * An agent does not care about that split: it names a session by id. This
 * module loads everything once and answers "does this id exist, and what is
 * it?" for the build script and for `/plan/import` alike.
 *
 * Custom workouts (`CUSTOM-*`) are never part of it: they live in one
 * browser's storage and an agent cannot know them.
 */

import type { AnyWorkoutTemplate } from "@/types";
import { loadAllWorkouts, loadDisciplineWorkouts } from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";

export type CatalogueLookup = ReadonlyMap<string, AnyWorkoutTemplate>;

let cached: Promise<AnyWorkoutTemplate[]> | null = null;

/** Every catalogue template, sorted by id so generated files are stable. */
export function loadAgentCatalogue(): Promise<AnyWorkoutTemplate[]> {
  if (!cached) {
    cached = Promise.all([
      loadAllWorkouts(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
      loadAllStrengthSessions(),
    ]).then((groups) => {
      // Keyed by id: a template reachable from two loaders is published once.
      const byId = new Map<string, AnyWorkoutTemplate>();
      for (const t of groups.flat()) byId.set(t.id, t);
      return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
    });
    // A failed load must not poison every later call.
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

export function buildCatalogueLookup(templates: readonly AnyWorkoutTemplate[]): CatalogueLookup {
  return new Map(templates.map((t) => [t.id, t]));
}
