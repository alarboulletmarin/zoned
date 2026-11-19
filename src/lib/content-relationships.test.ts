import { beforeAll, describe, expect, mock, test } from "bun:test";

// Le catalogue atteint l'entrée i18n et son `import.meta.glob` de Vite.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { findRelatedContent, findGlossaryForWorkout, RELATED_SESSIONS } = await import(
  "./content-relationships"
);
const { loadAllWorkouts } = await import("@/data/workouts");
const { loadAllTerms } = await import("@/data/glossary");

import type { WorkoutTemplate } from "@/types";
import type { GlossaryTerm } from "@/data/glossary/types";

let workouts: WorkoutTemplate[];
let terms: GlossaryTerm[];

beforeAll(async () => {
  [workouts, terms] = await Promise.all([loadAllWorkouts(), loadAllTerms()]);
});

const byId = (id: string) => workouts.find((w) => w.id === id)!;

describe("glossaire d'une séance", () => {
  test("MIX-010 : les termes de la séance, ni FTP ni Over-unders", () => {
    const found = findGlossaryForWorkout(byId("MIX-010"), terms, new Set(), 5).map((t) => t.id);
    expect(found).not.toContain("ftp");
    expect(found).not.toContain("over-unders");
    expect(found.slice(0, 4)).toEqual(["vma", "zone-5", "race-pace", "taper"]);
  });

  test("MIX-010 : les libellés français sont en français", () => {
    const found = findGlossaryForWorkout(byId("MIX-010"), terms, new Set(), 5);
    const labels = found.map((t) => t.acronym || t.term);
    expect(labels).toContain("Allure spécifique");
    expect(labels).toContain("Affûtage");
  });

  test("aucun terme vélo ou natation sur une séance de course", () => {
    const running = workouts.filter((w) => (w.discipline ?? "running") === "running");
    for (const w of running) {
      const ids = findGlossaryForWorkout(w, terms, new Set(), 5).map((t) => t.id);
      for (const banned of ["ftp", "np", "vi", "if", "sweet-spot", "over-unders", "css", "brick"]) {
        expect(ids).not.toContain(banned);
      }
    }
  });

  test("le terme de mesure suit la discipline", () => {
    const ride = workouts.find((w) => w.discipline === "cycling");
    if (!ride) return;
    const ids = findGlossaryForWorkout(ride, terms, new Set(), 5).map((t) => t.id);
    expect(ids[0]).toBe("ftp");
    expect(ids).not.toContain("vma");
  });
});

describe("séances liées", () => {
  test("MIX-010 en a trois, sans elle-même, variante en tête", () => {
    const related = findRelatedContent({ type: "workout", id: "MIX-010" }, workouts, [], terms).workouts;
    expect(related).toHaveLength(RELATED_SESSIONS);
    expect(related.map((w) => w.id)).not.toContain("MIX-010");
    expect(related[0].id).toBe("MIX-001");
    expect(new Set(related.map((w) => w.id)).size).toBe(RELATED_SESSIONS);
  });

  test("toute séance de course en a trois", () => {
    for (const w of workouts.filter((w) => (w.discipline ?? "running") === "running")) {
      const related = findRelatedContent({ type: "workout", id: w.id }, workouts, [], terms).workouts;
      expect(related.length).toBe(RELATED_SESSIONS);
      for (const r of related) expect(r.discipline ?? "running").toBe("running");
    }
  });
});
