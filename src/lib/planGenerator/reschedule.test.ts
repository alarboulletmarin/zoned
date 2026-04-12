import { describe, expect, test } from "bun:test";

import { autoReschedule } from "./reschedule";
import type { TrainingPlan, PlanSession, PlanWeek, PlanConfig } from "@/types/plan";

// ── Test helpers ──────────────────────────────────────────────────

function makePlan(overrides?: Partial<TrainingPlan>): TrainingPlan {
  return {
    id: "test-plan",
    name: "Test Plan",
    nameEn: "Test Plan",
    totalWeeks: 8,
    phases: [],
    config: {
      id: "test-plan",
      daysPerWeek: 5,
      createdAt: "2025-01-06T00:00:00Z", // Monday
      startDate: "2025-01-06",
      ...overrides?.config,
    } as PlanConfig,
    weeks: overrides?.weeks ?? [],
    ...overrides,
  };
}

function makeSession(day: number, overrides?: Partial<PlanSession>): PlanSession {
  return {
    dayOfWeek: day,
    workoutId: `workout-${day}`,
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
    ...overrides,
  };
}

function makeWeek(weekNumber: number, sessions: PlanSession[]): PlanWeek {
  return {
    weekNumber,
    phase: "base",
    isRecoveryWeek: false,
    volumePercent: 100,
    sessions,
  };
}

// ── Tests ─────────────────────────────────────────────────────────

describe("autoReschedule", () => {
  test("marks planned sessions on blocked days as skipped", () => {
    // Session on day 2 (Wednesday), day 2 is blocked
    // startDate 2025-01-06 is a Monday
    // Week 1 day 2 = 2025-01-08 (Wednesday)
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }], // Wednesday of week 1
      },
      weeks: [makeWeek(1, [makeSession(2)])],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("skipped");
    expect(result.changes[0].fromDay).toBe(2);
    expect(result.changes[0].weekNumber).toBe(1);

    // Session should still be in the plan but with status "skipped"
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions).toHaveLength(1);
    expect(week1.sessions[0].dayOfWeek).toBe(2);
    expect(week1.sessions[0].status).toBe("skipped");
  });

  test("never marks __race_day__ as skipped", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }], // Wednesday of week 1
      },
      weeks: [
        makeWeek(1, [
          makeSession(2, { workoutId: "__race_day__", sessionType: "race_specific" }),
        ]),
      ],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(0);

    // Race day is still on day 2, untouched
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions[0].dayOfWeek).toBe(2);
    expect(week1.sessions[0].workoutId).toBe("__race_day__");
    expect(week1.sessions[0].status).toBeUndefined();
  });

  test("never marks completed/skipped/modified sessions", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [
          { date: "2025-01-07" }, // Tue
          { date: "2025-01-08" }, // Wed
          { date: "2025-01-09" }, // Thu
        ],
      },
      weeks: [
        makeWeek(1, [
          makeSession(1, { status: "completed", workoutId: "w-completed" }),
          makeSession(2, { status: "skipped", workoutId: "w-skipped" }),
          makeSession(3, { status: "modified", workoutId: "w-modified" }),
        ]),
      ],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(0);

    // All sessions untouched
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions).toHaveLength(3);
    expect(week1.sessions.find((s) => s.workoutId === "w-completed")!.status).toBe("completed");
    expect(week1.sessions.find((s) => s.workoutId === "w-skipped")!.status).toBe("skipped");
    expect(week1.sessions.find((s) => s.workoutId === "w-modified")!.status).toBe("modified");
  });

  test("does not modify the original plan", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }], // Wednesday of week 1
      },
      weeks: [makeWeek(1, [makeSession(2)])],
    });

    // Snapshot the original
    const originalJSON = JSON.stringify(plan);

    autoReschedule(plan, 1, 1);

    // The original must be untouched
    expect(JSON.stringify(plan)).toBe(originalJSON);
  });

  test("returns empty changes when no unavailabilities", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
      },
      weeks: [makeWeek(1, [makeSession(2)])],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(0);
  });

  test("sets userNote with the unavailability reason", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08", reason: "travel" }],
      },
      weeks: [makeWeek(1, [makeSession(2)])],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(1);
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions[0].userNote).toBe("travel");
  });

  test("sessions outside the window are not touched", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [
          { date: "2025-01-08" }, // week 1 day 2
          { date: "2025-02-05" }, // week 5 day 2
        ],
      },
      weeks: [
        makeWeek(1, [makeSession(2)]),
        makeWeek(5, [makeSession(2, { workoutId: "outside-window" })]),
      ],
    });

    // Window covers weeks 1-2 only
    const result = autoReschedule(plan, 1, 2);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].weekNumber).toBe(1);

    // Week 5 session is untouched
    const week5 = result.updatedPlan.weeks.find((w) => w.weekNumber === 5)!;
    expect(week5.sessions[0].dayOfWeek).toBe(2);
    expect(week5.sessions[0].status).toBeUndefined();
  });

  test("defaults userNote to 'unavailability' when no reason provided", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }], // no reason
      },
      weeks: [makeWeek(1, [makeSession(2)])],
    });

    const result = autoReschedule(plan, 1, 1);

    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions[0].userNote).toBe("unavailability");
  });
});
