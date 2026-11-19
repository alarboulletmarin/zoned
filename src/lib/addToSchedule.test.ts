import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";

// Le catalogue atteint l'entrée i18n et son `import.meta.glob` de Vite.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

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

const {
  addToDate,
  addToPlanWeek,
  dateInWeek,
  destinationForDate,
  followedPlans,
  undoAdd,
  weekdayIndex,
} = await import("./addToSchedule");
const { getAllPlans, getPlan, savePlan } = await import("./planStorage");
const { createFreePlan } = await import("./createFreePlan");
const { createEmptyWeekPlan } = await import("./weekToPlan");
const { loadTodayComposition } = await import("./todayComposition");
const { loadAllWorkouts } = await import("@/data/workouts");

import type { WorkoutTemplate } from "@/types";

/** Jeudi 19 novembre 2026, à midi. */
const TODAY = new Date(2026, 10, 19, 12);
const LABELS = { label: "Séance ajoutée", labelEn: "Session added", freshWeekName: "Semaine du 16 nov." };

let mix010: WorkoutTemplate;

beforeAll(async () => {
  mix010 = (await loadAllWorkouts()).find((w) => w.id === "MIX-010")!;
});

beforeEach(() => {
  (globalThis as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
});

/** Un plan de dix semaines qui a commencé le lundi 2 novembre : on est en semaine 3. */
function seedPlan(): string {
  const plan = createFreePlan("Marathon de printemps", 10, "2026-11-02");
  expect(savePlan(plan).ok).toBe(true);
  return plan.id;
}

const sessionsOf = (planId: string, weekNumber: number) =>
  getPlan(planId)!.weeks.find((w) => w.weekNumber === weekNumber)!.sessions;

describe("les jours", () => {
  test("lundi vaut 0, et le jour d'une semaine se retrouve", () => {
    expect(weekdayIndex(TODAY)).toBe(3);
    expect(dateInWeek(TODAY, 1).getDate()).toBe(17);
    expect(dateInWeek(TODAY, 6).getDate()).toBe(22);
  });
});

describe("Ajouter à…", () => {
  test("aujourd'hui, dans le plan suivi", () => {
    const planId = seedPlan();
    const before = sessionsOf(planId, 3).length;

    const result = addToDate(mix010, TODAY, LABELS, TODAY);

    expect(result).toEqual({ planId, weekNumber: 3, dayOfWeek: 3 });
    const sessions = sessionsOf(planId, 3);
    expect(sessions).toHaveLength(before + 1);
    expect(sessions.some((s) => s.workoutId === "MIX-010" && s.dayOfWeek === 3)).toBe(true);
    expect(getPlan(planId)!._lastUndoableChange?.kind).toBe("add_session");
  });

  test("un autre jour de cette semaine", () => {
    const planId = seedPlan();
    const tuesday = dateInWeek(TODAY, 1);

    const result = addToDate(mix010, tuesday, LABELS, TODAY);

    expect(result).toEqual({ planId, weekNumber: 3, dayOfWeek: 1 });
    expect(sessionsOf(planId, 3).some((s) => s.workoutId === "MIX-010" && s.dayOfWeek === 1)).toBe(true);
  });

  test("dans une semaine type, sans la poser", () => {
    const week = createEmptyWeekPlan("Semaine de renfo");
    savePlan(week);

    const result = addToPlanWeek(mix010, week.id, 1, 4, LABELS);

    expect(result).toEqual({ planId: week.id, weekNumber: 1, dayOfWeek: 4 });
    expect(sessionsOf(week.id, 1).map((s) => [s.workoutId, s.dayOfWeek])).toEqual([["MIX-010", 4]]);
    expect(loadTodayComposition().layers).toHaveLength(0);
  });

  test("annuler rend le plan tel qu'il était", () => {
    const planId = seedPlan();
    const before = JSON.stringify(sessionsOf(planId, 3));

    const result = addToDate(mix010, TODAY, LABELS, TODAY)!;
    expect(undoAdd(result)).toBe(true);

    expect(JSON.stringify(sessionsOf(planId, 3))).toBe(before);
    expect(getPlan(planId)!._lastUndoableChange).toBeUndefined();
  });

  test("sans rien sur la date, une semaine neuve posée sur son lundi, et l'annulation la retire", () => {
    const destination = destinationForDate([], loadTodayComposition(), TODAY, TODAY);
    expect(destination.kind).toBe("fresh");

    const result = addToDate(mix010, TODAY, LABELS, TODAY)!;

    expect(result.createdWeekId).toBe(result.planId);
    const week = getPlan(result.planId)!;
    expect(week.config.isSingleWeek).toBe(true);
    expect(week.name).toBe("Semaine du 16 nov.");
    expect(sessionsOf(result.planId, 1).map((s) => s.dayOfWeek)).toEqual([3]);
    expect(loadTodayComposition().layers).toEqual([
      { id: result.planId, enabled: true, anchor: "2026-11-16" },
    ]);

    expect(undoAdd(result)).toBe(true);
    expect(getAllPlans()).toHaveLength(0);
    expect(loadTodayComposition().layers).toHaveLength(0);
  });
});

describe("Dans mon plan", () => {
  test("absent quand aucun plan n'est suivi", () => {
    savePlan(createEmptyWeekPlan("Une semaine seule"));
    expect(followedPlans(getAllPlans(), loadTodayComposition(), TODAY)).toEqual([]);
  });

  test("le plan suivi, et la semaine en cours", () => {
    const planId = seedPlan();
    const followed = followedPlans(getAllPlans(), loadTodayComposition(), TODAY);
    expect(followed.map((f) => [f.plan.id, f.currentWeek])).toEqual([[planId, 3]]);
  });

  test("un plan fini n'est plus proposé", () => {
    savePlan(createFreePlan("Ancien plan", 2, "2026-01-05"));
    expect(followedPlans(getAllPlans(), loadTodayComposition(), TODAY)).toEqual([]);
  });
});
