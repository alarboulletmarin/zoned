import { beforeEach, describe, expect, test } from "bun:test";

import type { PlanSession, TrainingPlan } from "@/types/plan";
import { getPlan, moveSession, savePlan } from "./planStorage";

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

function session(dayOfWeek: number, workoutId: string): PlanSession {
  return { dayOfWeek, workoutId, sessionType: "endurance", isKeySession: false, estimatedDurationMin: 45 };
}

/** Lundi : A B C, mercredi : D. */
function seed(): void {
  const week: TrainingPlan = {
    id: "semaine",
    config: { id: "semaine", daysPerWeek: 4, createdAt: "2026-09-01T10:00:00.000Z", startDate: "2026-08-31", isSingleWeek: true },
    weeks: [
      {
        weekNumber: 1,
        phase: "base",
        isRecoveryWeek: false,
        volumePercent: 100,
        sessions: [session(0, "A"), session(0, "B"), session(0, "C"), session(2, "D")],
      },
    ],
    totalWeeks: 1,
    phases: [{ phase: "base", startWeek: 1, endWeek: 1 }],
    name: "semaine",
    nameEn: "semaine",
    version: 2,
  };
  savePlan(week);
}

/** Les séances de la semaine, "jour:id" dans l'ordre du tableau. */
function order(): string[] {
  return getPlan("semaine")!.weeks[0].sessions.map((s) => `${s.dayOfWeek}:${s.workoutId}`);
}

describe("déplacer une séance, et la placer dans la journée", () => {
  beforeEach(() => {
    (globalThis as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
    seed();
  });

  test("sans repère, la séance ferme la journée où elle arrive", () => {
    expect(moveSession("semaine", 1, 3, 1, 0)).toBe(true);
    expect(order()).toEqual(["0:A", "0:B", "0:C", "0:D"]);
  });

  test("devant une séance du même jour, elle la précède : la dernière passe en tête", () => {
    expect(moveSession("semaine", 1, 2, 1, 0, 0)).toBe(true);
    expect(order()).toEqual(["0:C", "0:A", "0:B", "2:D"]);
  });

  test("la première descend d'un cran en se plaçant devant la troisième", () => {
    expect(moveSession("semaine", 1, 0, 1, 0, 2)).toBe(true);
    expect(order()).toEqual(["0:B", "0:A", "0:C", "2:D"]);
  });

  test("sans repère, une séance du même jour passe en fin de journée", () => {
    expect(moveSession("semaine", 1, 0, 1, 0)).toBe(true);
    expect(order()).toEqual(["0:B", "0:C", "0:A", "2:D"]);
  });

  test("devant elle-même, rien ne bouge", () => {
    expect(moveSession("semaine", 1, 1, 1, 0, 1)).toBe(true);
    expect(order()).toEqual(["0:A", "0:B", "0:C", "2:D"]);
  });

  test("changer de jour avec un repère la glisse dans la file de ce jour", () => {
    expect(moveSession("semaine", 1, 3, 1, 0, 1)).toBe(true);
    expect(order()).toEqual(["0:A", "0:D", "0:B", "0:C"]);
  });

  test("un repère d'un autre jour n'est pas une position : la séance ferme le jour visé", () => {
    // B (lundi) envoyée au mardi, devant D, qui est un mercredi.
    expect(moveSession("semaine", 1, 1, 1, 1, 3)).toBe(true);
    expect(order()).toEqual(["0:A", "0:C", "1:B", "2:D"]);
  });
});
