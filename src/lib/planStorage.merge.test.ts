import { beforeEach, describe, expect, test } from "bun:test";

import type { PlanSession, TrainingPlan } from "@/types/plan";
import { getPlan, mergeWeekIntoPlan, savePlan, undoLastChange } from "./planStorage";

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

function session(dayOfWeek: number, workoutId: string, extra: Partial<PlanSession> = {}): PlanSession {
  return { dayOfWeek, workoutId, sessionType: "endurance", isKeySession: false, estimatedDurationMin: 45, ...extra };
}

function plan(id: string, totalWeeks: number, isSingleWeek = false): TrainingPlan {
  return {
    id,
    config: { id, daysPerWeek: 4, createdAt: "2026-09-01T10:00:00.000Z", startDate: "2026-08-31", isSingleWeek: isSingleWeek || undefined },
    weeks: Array.from({ length: totalWeeks }, (_, i) => ({
      weekNumber: i + 1,
      phase: "base" as const,
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [],
    })),
    totalWeeks,
    phases: [{ phase: "base", startWeek: 1, endWeek: totalWeeks }],
    name: id,
    nameEn: id,
    version: 2,
  };
}

const LABELS = { label: "fusion", labelEn: "merge" };

describe("fusionner une semaine seule dans un plan", () => {
  beforeEach(() => {
    (globalThis as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
    const marathon = plan("marathon", 4);
    marathon.weeks[1].sessions = [session(0, "END-001", { status: "completed" }), session(3, "END-002")];
    savePlan(marathon);
    const renfo = plan("renfo", 1, true);
    renfo.weeks[0].sessions = [
      session(0, "STR-001", { status: "completed", rpe: 7, locked: true, precision: "loose" }),
      session(4, "STR-002", { discipline: "running" }),
    ];
    savePlan(renfo);
  });

  test("ajouter garde les séances du plan et pose celles de la semaine à côté", () => {
    expect(mergeWeekIntoPlan("marathon", 2, "renfo", "add", LABELS)).toBe(true);
    const ids = getPlan("marathon")!.weeks[1].sessions.map((s) => s.workoutId);
    expect(ids).toEqual(["END-001", "STR-001", "END-002", "STR-002"]);
    // Les autres semaines du plan, et la semaine seule, ne bougent pas.
    expect(getPlan("marathon")!.weeks[0].sessions).toEqual([]);
    expect(getPlan("renfo")!.weeks[0].sessions).toHaveLength(2);
  });

  test("remplacer retire les séances du plan cette semaine-là", () => {
    expect(mergeWeekIntoPlan("marathon", 2, "renfo", "replace", LABELS)).toBe(true);
    const ids = getPlan("marathon")!.weeks[1].sessions.map((s) => s.workoutId);
    expect(ids).toEqual(["STR-001", "STR-002"]);
  });

  test("ce qui décrit la séance traverse, ce qui a été vécu et le verrou non", () => {
    mergeWeekIntoPlan("marathon", 2, "renfo", "replace", LABELS);
    const [first] = getPlan("marathon")!.weeks[1].sessions;
    expect(first.precision).toBe("loose");
    expect(first.status).toBeUndefined();
    expect(first.rpe).toBeUndefined();
    expect(first.locked).toBeUndefined();
  });

  test("la fusion se défait d'un geste", () => {
    mergeWeekIntoPlan("marathon", 2, "renfo", "replace", LABELS);
    expect(getPlan("marathon")!._lastUndoableChange?.kind).toBe("merge_week");
    expect(undoLastChange("marathon")).toBe(true);
    const ids = getPlan("marathon")!.weeks[1].sessions.map((s) => s.workoutId);
    expect(ids).toEqual(["END-001", "END-002"]);
  });

  test("refuse un plan comme source, une semaine hors du plan, un id inconnu", () => {
    expect(mergeWeekIntoPlan("marathon", 2, "marathon", "add", LABELS)).toBe(false);
    expect(mergeWeekIntoPlan("marathon", 9, "renfo", "add", LABELS)).toBe(false);
    expect(mergeWeekIntoPlan("nope", 1, "renfo", "add", LABELS)).toBe(false);
    // Rien n'a été écrit en chemin.
    expect(getPlan("marathon")!.weeks[1].sessions).toHaveLength(2);
    expect(getPlan("marathon")!._lastUndoableChange).toBeUndefined();
  });
});
