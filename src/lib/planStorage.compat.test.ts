/**
 * Backward-compatibility guard for `zoned-plans`.
 *
 * Plans are immune to workout *format* changes because `PlanSession.workoutId`
 * is a string reference (`src/types/plan.ts`): the template is resolved at
 * read time, never copied into the plan. What plans are NOT immune to is an id
 * changing: a renumbered workout turns every session pointing at it into a
 * dangling reference, in every plan already saved on every device.
 *
 * Issue #127, rule 1: "Ids are permanent. Reassigning a workout's category,
 * fields or file is fine. Renumbering its id is not."
 *
 * The blob below is FROZEN: it is a plan as written by an earlier build. Do
 * not regenerate it, and above all do not "fix" a workout id inside it: if one
 * of these ids stops resolving, the catalogue is what broke, not the test.
 */

import { beforeEach, describe, expect, test } from "bun:test";

import { getWorkoutById } from "@/data/workouts";
import type { PlanSession, TrainingPlan } from "@/types/plan";
import { getAllPlans, getPlan } from "./planStorage";

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

const STORAGE_KEY = "zoned-plans";

beforeEach(() => {
  localStorage.clear();
});

/**
 * FROZEN legacy plan blob. Written by an earlier build; the workout ids it
 * names cover every prefix family shipped at the time (running categories,
 * both long-run prefixes, trail, cycling, swimming and strength) so that a
 * renumbering anywhere in the catalogue trips this file.
 *
 * Never regenerate. Never edit a `workoutId` here.
 */
const FROZEN_LEGACY_PLAN_BLOB = JSON.stringify([
  {
    id: "plan-frozen-2026",
    name: "Semi de printemps",
    nameEn: "Spring half marathon",
    version: 2,
    config: {
      id: "plan-frozen-2026",
      planMode: "assisted",
      planName: "Semi de printemps",
      raceDistance: "semi",
      raceDate: "2026-04-12",
      daysPerWeek: 5,
      longRunDay: 6,
      vma: 16.5,
      trainingGoal: "time",
      createdAt: "2026-01-05T08:30:00.000Z",
      startDate: "2026-01-05",
      includeStrength: true,
      strengthFrequency: 1,
    },
    totalWeeks: 3,
    phases: [
      { phase: "base", startWeek: 1, endWeek: 2 },
      { phase: "build", startWeek: 3, endWeek: 3 },
    ],
    weeks: [
      {
        weekNumber: 1,
        phase: "base",
        isRecoveryWeek: false,
        volumePercent: 100,
        targetKm: 42,
        sessions: [
          { dayOfWeek: 0, workoutId: "REC-001", sessionType: "recovery", isKeySession: false, estimatedDurationMin: 35 },
          { dayOfWeek: 1, workoutId: "END-001", sessionType: "endurance", isKeySession: false, estimatedDurationMin: 50 },
          { dayOfWeek: 2, workoutId: "VMA-001", sessionType: "vo2max", isKeySession: true, estimatedDurationMin: 55, status: "completed", completedAt: "2026-01-07T18:00:00.000Z", rpe: 8 },
          { dayOfWeek: 4, workoutId: "TMP-001", sessionType: "tempo", isKeySession: false, estimatedDurationMin: 45 },
          { dayOfWeek: 6, workoutId: "SL-001", sessionType: "long_run", isKeySession: true, estimatedDurationMin: 90 },
        ],
      },
      {
        weekNumber: 2,
        phase: "base",
        isRecoveryWeek: false,
        volumePercent: 105,
        targetKm: 45,
        sessions: [
          { dayOfWeek: 0, workoutId: "STR-001", sessionType: "strength", isKeySession: false, estimatedDurationMin: 40 },
          { dayOfWeek: 1, workoutId: "CYC-001", sessionType: "cycling", discipline: "cycling", isKeySession: false, estimatedDurationMin: 75 },
          { dayOfWeek: 2, workoutId: "THR-001", sessionType: "threshold", isKeySession: true, estimatedDurationMin: 60 },
          { dayOfWeek: 3, workoutId: "SWM-001", sessionType: "swimming", discipline: "swimming", isKeySession: false, estimatedDurationMin: 45 },
          { dayOfWeek: 5, workoutId: "FAR-001", sessionType: "fartlek", isKeySession: false, estimatedDurationMin: 50 },
          { dayOfWeek: 6, workoutId: "LR-013", sessionType: "long_run", isKeySession: true, estimatedDurationMin: 100 },
        ],
      },
      {
        weekNumber: 3,
        phase: "build",
        isRecoveryWeek: false,
        volumePercent: 110,
        targetKm: 50,
        sessions: [
          { dayOfWeek: 1, workoutId: "HIL-001", sessionType: "hills", isKeySession: true, estimatedDurationMin: 55 },
          { dayOfWeek: 2, workoutId: "MIX-001", sessionType: "endurance", isKeySession: false, estimatedDurationMin: 50 },
          { dayOfWeek: 3, workoutId: "ASS-001", sessionType: "endurance", isKeySession: false, estimatedDurationMin: 40 },
          { dayOfWeek: 4, workoutId: "RP-001", sessionType: "race_specific", isKeySession: true, estimatedDurationMin: 65 },
          { dayOfWeek: 5, workoutId: "TRL-001", sessionType: "endurance", isKeySession: false, estimatedDurationMin: 70 },
        ],
        crossTraining: [
          { id: "xt-1", dayOfWeek: 0, activityType: "yoga", durationMin: 30, description: "Yoga doux", intensity: "easy" },
        ],
      },
    ],
  },
]);

function allSessions(plan: TrainingPlan): PlanSession[] {
  return plan.weeks.flatMap((week) => week.sessions);
}

describe("a frozen legacy plan still loads", () => {
  test("getAllPlans returns it with every week and session intact", () => {
    localStorage.setItem(STORAGE_KEY, FROZEN_LEGACY_PLAN_BLOB);
    const plans = getAllPlans();

    expect(plans).toHaveLength(1);
    const plan = plans[0];
    expect(plan.id).toBe("plan-frozen-2026");
    expect(plan.name).toBe("Semi de printemps");
    expect(plan.weeks.map((w) => w.weekNumber)).toEqual([1, 2, 3]);
    expect(plan.weeks.map((w) => w.sessions.length)).toEqual([5, 6, 5]);
    expect(getPlan("plan-frozen-2026")?.name).toBe("Semi de printemps");
  });

  test("session state written by the old build survives the read", () => {
    localStorage.setItem(STORAGE_KEY, FROZEN_LEGACY_PLAN_BLOB);
    const week1 = getAllPlans()[0].weeks[0];
    const vma = week1.sessions.find((s) => s.workoutId === "VMA-001");

    expect(vma?.status).toBe("completed");
    expect(vma?.completedAt).toBe("2026-01-07T18:00:00.000Z");
    expect(vma?.rpe).toBe(8);
    expect(vma?.isKeySession).toBe(true);
  });

  test("workoutId values are never rewritten on read", () => {
    localStorage.setItem(STORAGE_KEY, FROZEN_LEGACY_PLAN_BLOB);
    const stored = JSON.parse(FROZEN_LEGACY_PLAN_BLOB) as TrainingPlan[];
    const expected = allSessions(stored[0])
      .map((s) => s.workoutId)
      .sort();
    const actual = allSessions(getAllPlans()[0])
      .map((s) => s.workoutId)
      .sort();

    expect(actual).toEqual(expected);
  });
});

describe("every workout a frozen plan points at still exists", () => {
  // This is the test that makes "ids are permanent" enforceable. A failure
  // here means a catalogue id was renumbered and existing saved plans now
  // carry a dangling reference. Restore the id; do not edit the blob.
  const referenced = allSessions(
    (JSON.parse(FROZEN_LEGACY_PLAN_BLOB) as TrainingPlan[])[0],
  ).map((session) => session.workoutId);

  test("the frozen plan covers every id prefix family", () => {
    const prefixes = new Set(referenced.map((id) => id.split("-")[0]));
    expect(prefixes).toEqual(
      new Set(["REC", "END", "VMA", "TMP", "SL", "LR", "STR", "CYC", "SWM", "THR", "FAR", "HIL", "MIX", "ASS", "RP", "TRL"]),
    );
  });

  test.each(referenced)("%s still resolves in the catalogue", async (workoutId) => {
    const workout = await getWorkoutById(workoutId);
    expect(workout).toBeDefined();
    expect(workout?.id).toBe(workoutId);
  });
});

describe("a malformed plans blob never throws", () => {
  test.each([
    ["unparseable text", "not json at all"],
    ["the literal null", "null"],
    ["an object instead of an array", '{"id":"plan-1"}'],
    ["primitives instead of plans", "[1,2,3]"],
    ["a plan with no weeks", '[{"id":"p","config":{"daysPerWeek":4},"weeks":[]}]'],
  ])("tolerates %s", (_label, blob) => {
    localStorage.setItem(STORAGE_KEY, blob);
    expect(() => getAllPlans()).not.toThrow();
    expect(getAllPlans()).toEqual([]);
  });

  test("an absent key reads as an empty list", () => {
    expect(getAllPlans()).toEqual([]);
  });
});
