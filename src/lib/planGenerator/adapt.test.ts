import { describe, expect, test } from "bun:test";

import { computeAdaptation, adaptPlan } from "./adapt";
import type { TrainingPlan, PlanSession, PlanWeek, PlanConfig } from "@/types/plan";
import type { TrainingPhase } from "@/types";

// ── Test helpers ──────────────────────────────────────────────────

function makeSession(overrides?: Partial<PlanSession>): PlanSession {
  return {
    dayOfWeek: 1,
    workoutId: "workout-easy",
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
    status: "planned",
    ...overrides,
  };
}

function makePlan(weeks: Partial<PlanWeek>[]): TrainingPlan {
  return {
    id: "test",
    name: "Test",
    nameEn: "Test",
    totalWeeks: weeks.length,
    phases: [],
    config: { id: "test", daysPerWeek: 4, createdAt: "2025-01-06" } as PlanConfig,
    weeks: weeks.map((w, i) => ({
      weekNumber: i + 1,
      phase: "build" as TrainingPhase,
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: [],
      ...w,
    })),
  };
}

function completedSession(rpe: number, overrides?: Partial<PlanSession>): PlanSession {
  return makeSession({ status: "completed", rpe, ...overrides });
}

function skippedSession(overrides?: Partial<PlanSession>): PlanSession {
  return makeSession({ status: "skipped", ...overrides });
}

// ── Tests ─────────────────────────────────────────────────────────

describe("computeAdaptation", () => {
  test("returns no changes when week is not fully resolved", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(6),
          makeSession({ status: "planned" }), // not resolved
        ],
      },
      { sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(false);
    expect(result.changes).toHaveLength(0);
  });

  test("reduces volume by 10% when average RPE > 8 (single week)", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(8.5),
          completedSession(8.2),
          completedSession(8.3),
        ],
      },
      { volumePercent: 100, targetKm: 50, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    const nextWeek = result.updatedPlan.weeks.find(w => w.weekNumber === 2)!;
    // avgRpe ~8.33 → Rule 4 applies (>8 but <=8.5) → volume × 0.90
    expect(nextWeek.volumePercent).toBe(90);
    expect(nextWeek.targetKm).toBe(45);
  });

  test("inserts recovery week when >50% sessions skipped", () => {
    const plan = makePlan([
      {
        sessions: [
          skippedSession(),
          skippedSession(),
          skippedSession(),
          completedSession(6),
        ],
      },
      { volumePercent: 100, targetKm: 60, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    const nextWeek = result.updatedPlan.weeks.find(w => w.weekNumber === 2)!;
    expect(nextWeek.isRecoveryWeek).toBe(true);
    // Rule 3: single week < 50% → volume × 0.65
    expect(nextWeek.volumePercent).toBe(65);
    expect(nextWeek.targetKm).toBe(39);
  });

  test("increases volume by 5% when RPE < 5 and completion >= 80%", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(3),
          completedSession(4),
          completedSession(4),
          completedSession(3.5),
        ],
      },
      { volumePercent: 90, targetKm: 40, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    const nextWeek = result.updatedPlan.weeks.find(w => w.weekNumber === 2)!;
    // Rule 5: low RPE + good completion → volume × 1.05
    expect(nextWeek.volumePercent).toBe(95); // Math.round(90 * 1.05) = 95
    expect(nextWeek.targetKm).toBe(42);
  });

  test("caps volume increase at 100%", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(3),
          completedSession(4),
        ],
      },
      { volumePercent: 98, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    const nextWeek = result.updatedPlan.weeks.find(w => w.weekNumber === 2)!;
    // Math.round(98 * 1.05) = 103 → capped to 100
    expect(nextWeek.volumePercent).toBe(100);
  });

  test("never modifies taper weeks", () => {
    const plan = makePlan([
      {
        sessions: [
          skippedSession(),
          skippedSession(),
          skippedSession(),
          completedSession(5),
        ],
      },
      { phase: "taper" as TrainingPhase, volumePercent: 70, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    // The only future week is taper → no modifiable weeks
    // Week 3 is the last week (totalWeeks=3) → race week protection
    expect(result.adapted).toBe(false);
  });

  test("never modifies race week (last week)", () => {
    const plan = makePlan([
      {
        sessions: [
          skippedSession(),
          skippedSession(),
          completedSession(5),
        ],
      },
      // Week 2 is the last week (totalWeeks = 2) → race week
      { volumePercent: 80, sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    // Only future week is last week → protected
    expect(result.adapted).toBe(false);
  });

  test("does not mutate the original plan", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(9),
          completedSession(9),
        ],
      },
      { volumePercent: 100, targetKm: 50, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const originalVolume = plan.weeks[1].volumePercent;
    const originalTargetKm = plan.weeks[1].targetKm;

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    // Original plan must be untouched
    expect(plan.weeks[1].volumePercent).toBe(originalVolume);
    expect(plan.weeks[1].targetKm).toBe(originalTargetKm);
    expect(plan.weeks[1]._originalVolumePercent).toBeUndefined();
  });

  test("reduces N+1 and N+2 when 2 consecutive high-RPE weeks", () => {
    const plan = makePlan([
      {
        // Week 1: RPE > 8
        sessions: [
          completedSession(8.5),
          completedSession(8.2),
        ],
      },
      {
        // Week 2: RPE > 8
        sessions: [
          completedSession(8.4),
          completedSession(8.6),
        ],
      },
      { volumePercent: 100, targetKm: 60, sessions: [makeSession()] },
      { volumePercent: 100, targetKm: 65, sessions: [makeSession()] },
      { sessions: [makeSession()] }, // last week = race
    ]);

    const result = computeAdaptation(plan, 2);
    expect(result.adapted).toBe(true);

    // Rule 1 (acute fatigue via consecutive): N+1 × 0.85, N+2 × 0.95
    const week3 = result.updatedPlan.weeks.find(w => w.weekNumber === 3)!;
    const week4 = result.updatedPlan.weeks.find(w => w.weekNumber === 4)!;
    expect(week3.volumePercent).toBe(85);
    expect(week3.targetKm).toBe(51);
    expect(week4.volumePercent).toBe(95);
    expect(week4.targetKm).toBe(62);

    // Should have 2 volume_adjusted changes
    const volChanges = result.changes.filter(c => c.kind === "volume_adjusted");
    expect(volChanges).toHaveLength(2);
  });

  test("applies Rule 1 (acute fatigue) when current week RPE > 8.5", () => {
    const plan = makePlan([
      {
        // Week 1: RPE > 8.5
        sessions: [
          completedSession(9),
          completedSession(8.8),
        ],
      },
      { volumePercent: 100, targetKm: 50, sessions: [makeSession()] },
      { volumePercent: 100, targetKm: 55, sessions: [makeSession()] },
      { sessions: [makeSession()] }, // race week
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    // Rule 1: avgRpe ~8.9 > 8.5 → N+1 × 0.85, N+2 × 0.95
    const week2 = result.updatedPlan.weeks.find(w => w.weekNumber === 2)!;
    const week3 = result.updatedPlan.weeks.find(w => w.weekNumber === 3)!;
    expect(week2.volumePercent).toBe(85);
    expect(week3.volumePercent).toBe(95);
  });

  test("notes missed key session types", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(6),
          completedSession(6),
          skippedSession({ isKeySession: true, sessionType: "threshold" }),
        ],
      },
      { volumePercent: 100, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    const missedChanges = result.changes.filter(c => c.kind === "unplaced" && c.reason === "missed_key");
    expect(missedChanges).toHaveLength(1);
    expect(missedChanges[0].workoutId).toBe("threshold");
  });

  test("handles modified sessions with partial duration (weight flips threshold)", () => {
    // 3 modified at <70% duration + 1 skipped
    // weighted completed: 0.7 + 0.7 + 0.7 = 2.1
    // total resolved: 2.1 + 1 = 3.1
    // completionRate: 2.1 / 3.1 ≈ 0.677
    // WITHOUT weighting: 3/4 = 0.75

    // For <50%, we need more skips. Let's use 1 modified partial + 2 skipped
    // weighted: 0.7
    // total resolved: 0.7 + 2 = 2.7
    // completionRate: 0.7 / 2.7 ≈ 0.259 → < 0.5

    // Without weighting: 1/3 = 0.33 → also < 0.5

    // Better: 2 modified partial + 1 skipped
    // weighted: 0.7 + 0.7 = 1.4, total: 1.4 + 1 = 2.4
    // completionRate: 1.4 / 2.4 ≈ 0.583 → NOT < 0.5
    // Without weighting: 2/3 = 0.667

    // To make partial weighting actually flip the threshold, let's do:
    // 3 modified partial + 2 skipped
    // weighted: 0.7*3 = 2.1, total: 2.1 + 2 = 4.1
    // rate: 2.1/4.1 ≈ 0.512 → NOT < 0.5
    // Without weighting: 3/5 = 0.6

    // 2 modified partial + 2 skipped
    // weighted: 1.4, total: 1.4+2 = 3.4, rate: 1.4/3.4 ≈ 0.412 → < 0.5
    // Without weighting: 2/4 = 0.5 → NOT < 0.5 (equal, not less)
    const plan = makePlan([
      {
        sessions: [
          makeSession({
            status: "modified",
            rpe: 6,
            estimatedDurationMin: 60,
            actualDurationMin: 30,
          }),
          makeSession({
            status: "modified",
            rpe: 6,
            estimatedDurationMin: 60,
            actualDurationMin: 25,
          }),
          skippedSession(),
          skippedSession(),
        ],
      },
      { volumePercent: 100, targetKm: 50, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    const nextWeek = result.updatedPlan.weeks.find(w => w.weekNumber === 2)!;
    // Completion < 0.5 → Rule 3 → recovery week × 0.65
    expect(nextWeek.isRecoveryWeek).toBe(true);
    expect(nextWeek.volumePercent).toBe(65);
  });

  test("inserts aggressive recovery when 2 consecutive weeks < 50% completion", () => {
    const plan = makePlan([
      {
        // Week 1: mostly skipped
        sessions: [
          skippedSession(),
          skippedSession(),
          completedSession(5),
        ],
      },
      {
        // Week 2: also mostly skipped
        sessions: [
          skippedSession(),
          skippedSession(),
          skippedSession(),
          completedSession(5),
        ],
      },
      { volumePercent: 100, targetKm: 50, sessions: [makeSession()] },
      { sessions: [makeSession()] }, // race week
    ]);

    const result = computeAdaptation(plan, 2);
    expect(result.adapted).toBe(true);

    const nextWeek = result.updatedPlan.weeks.find(w => w.weekNumber === 3)!;
    // Rule 2: 2 consecutive < 50% → recovery × 0.60
    expect(nextWeek.isRecoveryWeek).toBe(true);
    expect(nextWeek.volumePercent).toBe(60);
    expect(nextWeek.targetKm).toBe(30);
  });

  test("does not produce missed key changes when next week is recovery", () => {
    const plan = makePlan([
      {
        sessions: [
          skippedSession({ isKeySession: true, sessionType: "threshold" }),
          skippedSession(),
          skippedSession(),
          completedSession(5),
        ],
      },
      { volumePercent: 100, targetKm: 50, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);

    // Next week converted to recovery → no missed_key changes
    const nextWeek = result.updatedPlan.weeks.find(w => w.weekNumber === 2)!;
    expect(nextWeek.isRecoveryWeek).toBe(true);

    const missedChanges = result.changes.filter(c => c.reason === "missed_key");
    expect(missedChanges).toHaveLength(0);
  });

  test("produces bilingual summary", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(9),
          completedSession(9),
        ],
      },
      { volumePercent: 100, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = computeAdaptation(plan, 1);
    expect(result.adapted).toBe(true);
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.summaryEn.length).toBeGreaterThan(0);
    expect(result.summary).toContain("réduit");
    expect(result.summaryEn).toContain("reduced");
  });
});

describe("adaptPlan (legacy wrapper)", () => {
  test("mutates the original plan and returns legacy format", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(9),
          completedSession(9),
        ],
      },
      { volumePercent: 100, targetKm: 50, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = adaptPlan(plan, 1);
    expect(result.adapted).toBe(true);
    expect(result.changes.length).toBeGreaterThan(0);

    // Plan should be mutated
    expect(plan.weeks[1].volumePercent).toBeLessThan(100);
    expect(plan.weeks[1]._originalVolumePercent).toBe(100);

    // Legacy format check
    for (const change of result.changes) {
      expect(change).toHaveProperty("type");
      expect(change).toHaveProperty("description");
      expect(change).toHaveProperty("descriptionEn");
    }
  });

  test("returns adapted: false when no changes needed", () => {
    const plan = makePlan([
      {
        sessions: [
          completedSession(6),
          completedSession(6),
        ],
      },
      { volumePercent: 100, sessions: [makeSession()] },
      { sessions: [makeSession()] },
    ]);

    const result = adaptPlan(plan, 1);
    // avgRpe = 6 → no rule triggers
    expect(result.adapted).toBe(false);
    expect(result.changes).toHaveLength(0);
  });
});
