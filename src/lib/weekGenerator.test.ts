import { describe, expect, mock, test } from "bun:test";

// The generator pulls in `workoutFilters` → `@/components/visualization`, whose
// i18n entry point uses Vite's `import.meta.glob`. Stub it, then load the module
// under test dynamically so the mock is in place first.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { loadAllWorkouts, loadDisciplineWorkouts } = await import("@/data/workouts");
const { generateWeek, redrawSlot } = await import("./weekGenerator");
const { getAnyWorkoutDuration, getDrawDiscipline } = await import("./workoutFilters");
const { DEFAULT_WEEK_SETTINGS } = await import("@/types/week");

import type { AnyWorkoutTemplate } from "@/types";
import type { WeekSlot } from "@/types/week";

// The real catalog: running categories plus the cross-discipline chunks, so
// the discipline-aware draw is exercised against actual data.
const catalog = [
  ...(await loadAllWorkouts()),
  ...(await loadDisciplineWorkouts("cycling")),
  ...(await loadDisciplineWorkouts("swimming")),
] as AnyWorkoutTemplate[];

// The two locked-slot tests below each run generateWeek several times against
// the real 239-workout catalogue, so they are slow by nature: ~4.8s locally and
// 7.5s on a GitHub runner, against bun's 5s default. They get an explicit
// timeout rather than fewer iterations, which would weaken what they assert.
describe("generateWeek — locked slots", () => {
  test("keeps a locked slot verbatim across regenerations", () => {
    const first = generateWeek(DEFAULT_WEEK_SETTINGS, catalog);
    const pinned = first.slots.find((s) => s.workout);
    expect(pinned).toBeDefined();

    const locked: WeekSlot = { ...pinned!, locked: true };
    for (let i = 0; i < 5; i++) {
      const next = generateWeek(DEFAULT_WEEK_SETTINGS, catalog, {
        locked: [locked],
      });
      const slot = next.slots.find((s) => s.day === locked.day);
      expect(slot?.workout?.id).toBe(locked.workout!.id);
      expect(slot?.locked).toBe(true);
    }
  }, 30_000);

  test("fills the other days without duplicating the locked workout", () => {
    const base = generateWeek(DEFAULT_WEEK_SETTINGS, catalog);
    const locked: WeekSlot = { ...base.slots.find((s) => s.workout)!, locked: true };

    for (let i = 0; i < 3; i++) {
      const next = generateWeek(DEFAULT_WEEK_SETTINGS, catalog, {
        locked: [locked],
      });
      const filled = next.slots.filter((s) => s.workout);
      expect(filled.length).toBeGreaterThan(1);
      expect(
        filled.filter((s) => s.workout!.id === locked.workout!.id),
      ).toHaveLength(1);
    }
  }, 30_000);
});

describe("redrawSlot", () => {
  test("draws a workout that is not already in the week", () => {
    const week = generateWeek(DEFAULT_WEEK_SETTINGS, catalog);
    const slot = week.slots.find((s) => s.kind === "easy" && s.workout)!;
    const used = week.slots.map((s) => s.workout?.id).filter(Boolean) as string[];

    const replacement = redrawSlot(DEFAULT_WEEK_SETTINGS, catalog, "easy", {
      targetMin: getAnyWorkoutDuration(slot.workout!),
      excludeIds: used,
      currentId: slot.workout!.id,
    });

    expect(replacement).not.toBeNull();
    expect(used).not.toContain(replacement!.id);
  });

  test("never returns the workout being replaced, even with an exhausted pool", () => {
    const week = generateWeek(DEFAULT_WEEK_SETTINGS, catalog);
    const slot = week.slots.find((s) => s.kind === "easy" && s.workout)!;

    const replacement = redrawSlot(DEFAULT_WEEK_SETTINGS, catalog, "easy", {
      excludeIds: catalog.map((w) => w.id),
      currentId: slot.workout!.id,
    });

    expect(replacement?.id).not.toBe(slot.workout!.id);
  });

  test("stays within the requested discipline", () => {
    for (const discipline of ["cycling", "swimming"] as const) {
      const replacement = redrawSlot(DEFAULT_WEEK_SETTINGS, catalog, "easy", {
        discipline,
      });
      expect(replacement).not.toBeNull();
      expect(getDrawDiscipline(replacement!)).toBe(discipline);
    }
  });

  test("returns null on a rest slot", () => {
    expect(redrawSlot(DEFAULT_WEEK_SETTINGS, catalog, "rest")).toBeNull();
  });
});
