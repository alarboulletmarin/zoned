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
  test("moves a planned session off a blocked day to the nearest free day in the same week", () => {
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
      weeks: [makeWeek(1, [makeSession(2)])], // session on Wednesday
    });

    const result = autoReschedule(plan, 1, 1);

    // Session should have moved
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("moved");
    expect(result.changes[0].fromDay).toBe(2);
    expect(result.unplaced).toHaveLength(0);

    // The session should now be on day 1 or 3 (nearest free days)
    const movedDay = result.changes[0].toDay!;
    expect([1, 3]).toContain(movedDay);

    // The session should be in the updated plan at the new day
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions).toHaveLength(1);
    expect(week1.sessions[0].dayOfWeek).toBe(movedDay);
  });

  test("moves session to next week when all same-week days are blocked", () => {
    // Week 3: session on day 1, days 0-6 all blocked
    // Week 4: exists with free days
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [
          // Block all 7 days of week 3 (2025-01-20 Mon to 2025-01-26 Sun)
          { date: "2025-01-20" },
          { date: "2025-01-21" },
          { date: "2025-01-22" },
          { date: "2025-01-23" },
          { date: "2025-01-24" },
          { date: "2025-01-25" },
          { date: "2025-01-26" },
        ],
      },
      weeks: [
        makeWeek(3, [makeSession(1)]),
        makeWeek(4, []), // empty week 4 with free days
      ],
    });

    const result = autoReschedule(plan, 3, 2);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("moved");
    expect(result.changes[0].weekNumber).toBe(3);
    expect(result.changes[0].toWeekNumber).toBe(4);
    expect(result.unplaced).toHaveLength(0);

    // Session should now be in week 4
    const week4 = result.updatedPlan.weeks.find((w) => w.weekNumber === 4)!;
    expect(week4.sessions).toHaveLength(1);
    // Week 3 should be empty
    const week3 = result.updatedPlan.weeks.find((w) => w.weekNumber === 3)!;
    expect(week3.sessions).toHaveLength(0);
  });

  test("never moves __race_day__", () => {
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
    expect(result.unplaced).toHaveLength(0);

    // Race day is still on day 2
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions[0].dayOfWeek).toBe(2);
    expect(week1.sessions[0].workoutId).toBe("__race_day__");
  });

  test("never moves completed/skipped/modified sessions", () => {
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
    expect(result.unplaced).toHaveLength(0);

    // All sessions untouched
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions).toHaveLength(3);
    expect(week1.sessions.find((s) => s.workoutId === "w-completed")!.dayOfWeek).toBe(1);
    expect(week1.sessions.find((s) => s.workoutId === "w-skipped")!.dayOfWeek).toBe(2);
    expect(week1.sessions.find((s) => s.workoutId === "w-modified")!.dayOfWeek).toBe(3);
  });

  test("key session goes to unplaced when no slot available in window", () => {
    // All days of weeks 1-2 blocked, key session in week 1
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [
          // Week 1: all 7 days blocked
          { date: "2025-01-06" },
          { date: "2025-01-07" },
          { date: "2025-01-08" },
          { date: "2025-01-09" },
          { date: "2025-01-10" },
          { date: "2025-01-11" },
          { date: "2025-01-12" },
          // Week 2: all 7 days blocked
          { date: "2025-01-13" },
          { date: "2025-01-14" },
          { date: "2025-01-15" },
          { date: "2025-01-16" },
          { date: "2025-01-17" },
          { date: "2025-01-18" },
          { date: "2025-01-19" },
        ],
      },
      weeks: [
        makeWeek(1, [
          makeSession(3, { isKeySession: true, workoutId: "key-threshold" }),
        ]),
        makeWeek(2, []),
      ],
    });

    const result = autoReschedule(plan, 1, 2);

    expect(result.unplaced).toHaveLength(1);
    expect(result.unplaced[0].workoutId).toBe("key-threshold");

    // Session removed from the plan
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions).toHaveLength(0);
  });

  test("non-key session produces skipped change when no slot available", () => {
    // All days blocked, non-key session
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [
          { date: "2025-01-06" },
          { date: "2025-01-07" },
          { date: "2025-01-08" },
          { date: "2025-01-09" },
          { date: "2025-01-10" },
          { date: "2025-01-11" },
          { date: "2025-01-12" },
        ],
      },
      weeks: [makeWeek(1, [makeSession(2, { isKeySession: false })])],
    });

    const result = autoReschedule(plan, 1, 1);

    // Should produce a "skipped" change, not moved, not unplaced
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("skipped");
    expect(result.unplaced).toHaveLength(0);

    // Session is still in the plan (left in place)
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    expect(week1.sessions).toHaveLength(1);
    expect(week1.sessions[0].dayOfWeek).toBe(2);
  });

  test("warns when two key sessions end up adjacent after rescheduling", () => {
    // Two key sessions: day 2 and day 4. Day 2 is blocked.
    // Days 0, 1, 6 are occupied. Only free slots are 3 and 5.
    // Both day 3 and day 5 are adjacent to the key session on day 4,
    // so the strict (non-adjacent) pass finds nothing.
    // The relaxed pass picks day 3 (nearest spiral hit).
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }], // Wed (day 2)
      },
      weeks: [
        makeWeek(1, [
          makeSession(0, { workoutId: "s-0" }),
          makeSession(1, { workoutId: "s-1" }),
          makeSession(2, { isKeySession: true, workoutId: "key-moved" }),
          makeSession(4, { isKeySession: true, workoutId: "key-stay" }),
          makeSession(6, { workoutId: "s-6" }),
        ]),
      ],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("moved");
    expect(result.changes[0].workoutId).toBe("key-moved");

    // Both free slots (3, 5) are adjacent to the key on day 4.
    // The relaxed pass picks the closest one: day 3.
    const movedDay = result.changes[0].toDay!;
    expect(movedDay).toBe(3);

    // Verify both key sessions are now adjacent (days 3 and 4)
    const week1 = result.updatedPlan.weeks.find((w) => w.weekNumber === 1)!;
    const keyDays = week1.sessions
      .filter((s) => s.isKeySession)
      .map((s) => s.dayOfWeek)
      .sort();
    expect(keyDays).toEqual([3, 4]);
    expect(Math.abs(keyDays[1] - keyDays[0])).toBe(1); // adjacent
  });

  test("prefers non-adjacent slot for key sessions when one exists", () => {
    // Key session on day 2 (blocked). Other key on day 4.
    // Day 0 occupied, day 1 occupied, day 6 free (non-adjacent to day 4).
    // Strict pass should pick day 6 over day 3/5 which are adjacent to day 4.
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }], // Wed (day 2)
      },
      weeks: [
        makeWeek(1, [
          makeSession(0, { workoutId: "s-0" }),
          makeSession(1, { workoutId: "s-1" }),
          makeSession(2, { isKeySession: true, workoutId: "key-moved" }),
          makeSession(4, { isKeySession: true, workoutId: "key-stay" }),
          // day 3, 5, 6 are free. Day 3 and 5 are adjacent to key on 4. Day 6 is not.
        ]),
      ],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("moved");
    // Day 6 is the only non-adjacent free slot
    expect(result.changes[0].toDay).toBe(6);
  });

  test("does not modify the original plan object", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }], // Wed (day 2)
      },
      weeks: [makeWeek(1, [makeSession(2)])],
    });

    // Snapshot the original
    const originalJSON = JSON.stringify(plan);

    autoReschedule(plan, 1, 1);

    // The original must be untouched
    expect(JSON.stringify(plan)).toBe(originalJSON);
  });

  test("a session with status 'planned' on a blocked day is moved", () => {
    const plan = makePlan({
      config: {
        id: "test-plan",
        daysPerWeek: 5,
        createdAt: "2025-01-06T00:00:00Z",
        startDate: "2025-01-06",
        unavailabilities: [{ date: "2025-01-08" }],
      },
      weeks: [makeWeek(1, [makeSession(2, { status: "planned" })])],
    });

    const result = autoReschedule(plan, 1, 1);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].kind).toBe("moved");
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
  });

  test("no changes when there are no unavailabilities", () => {
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
    expect(result.unplaced).toHaveLength(0);
  });
});
