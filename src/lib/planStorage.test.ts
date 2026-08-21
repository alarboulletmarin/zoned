import { beforeEach, describe, expect, test } from "bun:test";

import type { TrainingPlan } from "@/types/plan";
import { duplicatePlan, getPlan, savePlan } from "./planStorage";

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

if (typeof (globalThis as { localStorage?: Storage }).localStorage === "undefined") {
  (globalThis as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
}

beforeEach(() => {
  localStorage.clear();
});

function makeTestPlan(): TrainingPlan {
  return {
    id: "plan-source",
    name: "Semi de printemps",
    nameEn: "Spring half marathon",
    config: {
      id: "plan-source",
      planMode: "assisted",
      planName: "Semi de printemps",
      daysPerWeek: 4,
      createdAt: "2026-01-05T08:30:00.000Z",
      raceDistance: "semi",
    },
    totalWeeks: 1,
    phases: [{ phase: "base", startWeek: 1, endWeek: 1 }],
    weeks: [
      {
        weekNumber: 1,
        phase: "base",
        isRecoveryWeek: false,
        volumePercent: 100,
        sessions: [
          {
            dayOfWeek: 2,
            workoutId: "VMA-001",
            sessionType: "vo2max",
            isKeySession: true,
            estimatedDurationMin: 55,
            status: "completed",
            completedAt: "2026-01-07T18:00:00.000Z",
            rpe: 8,
          },
        ],
      },
    ],
  } as TrainingPlan;
}

describe("duplicatePlan", () => {
  test("returns null when the source id is unknown", () => {
    expect(duplicatePlan("does-not-exist")).toBeNull();
  });

  test("saves a copy under a new id, distinct from the source", () => {
    savePlan(makeTestPlan());
    const newId = duplicatePlan("plan-source");

    expect(newId).not.toBeNull();
    expect(newId).not.toBe("plan-source");
    const copy = getPlan(newId!);
    expect(copy).toBeDefined();
    expect(copy!.config.id).toBe(newId);
  });

  test("applies the provided name to both name and nameEn", () => {
    savePlan(makeTestPlan());
    const newId = duplicatePlan("plan-source", "Semi de printemps (copie)");

    const copy = getPlan(newId!)!;
    expect(copy.name).toBe("Semi de printemps (copie)");
    expect(copy.nameEn).toBe("Semi de printemps (copie)");
    expect(copy.config.planName).toBe("Semi de printemps (copie)");
  });

  test("resets completion tracking on the copy's sessions", () => {
    savePlan(makeTestPlan());
    const newId = duplicatePlan("plan-source");

    const copySession = getPlan(newId!)!.weeks[0].sessions[0];
    expect(copySession.status).toBeUndefined();
    expect(copySession.completedAt).toBeUndefined();
    expect(copySession.rpe).toBeUndefined();
  });

  test("the copy is independent of the source — mutating one does not affect the other", () => {
    savePlan(makeTestPlan());
    const newId = duplicatePlan("plan-source", "Copie de test");

    const copy = getPlan(newId!)!;
    copy.weeks[0].sessions[0].workoutId = "VMA-002";
    savePlan(copy);

    const original = getPlan("plan-source")!;
    expect(original.weeks[0].sessions[0].workoutId).toBe("VMA-001");
    expect(original.name).toBe("Semi de printemps");
  });
});
