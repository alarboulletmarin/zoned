import { describe, expect, test } from "bun:test";

import { auditPlan } from "./audit";
import type { TrainingPlan, PlanSession, PlanWeek, PlanConfig } from "@/types/plan";
import type { TrainingPhase } from "@/types";

// ── Test helpers ──────────────────────────────────────────────────

function makeSession(day: number, overrides?: Partial<PlanSession>): PlanSession {
  return {
    dayOfWeek: day,
    workoutId: "workout-easy",
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
    status: "planned",
    ...overrides,
  };
}

function makePlan(
  weeks: Partial<PlanWeek>[],
  configOverrides?: Partial<PlanConfig>,
): TrainingPlan {
  return {
    id: "test",
    name: "Test",
    nameEn: "Test",
    totalWeeks: weeks.length,
    phases: [],
    config: {
      id: "test",
      daysPerWeek: 4,
      createdAt: "2025-01-06",
      ...configOverrides,
    } as PlanConfig,
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

// ── Tests ─────────────────────────────────────────────────────────

describe("auditPlan", () => {
  test("healthy plan returns no errors or warnings", () => {
    const plan = makePlan(
      [
        {
          sessions: [
            makeSession(0, { isKeySession: true, sessionType: "threshold" }),
            makeSession(2, { isKeySession: true, sessionType: "vo2max" }),
            makeSession(5, { sessionType: "long_run" }),
          ],
          volumePercent: 80,
        },
        {
          sessions: [
            makeSession(0, { isKeySession: true, sessionType: "threshold" }),
            makeSession(3, { isKeySession: true, sessionType: "vo2max" }),
            makeSession(5, { sessionType: "long_run" }),
          ],
          volumePercent: 90,
        },
        {
          sessions: [
            makeSession(1, { isKeySession: true, sessionType: "tempo" }),
            makeSession(4, { sessionType: "endurance" }),
            makeSession(6, {
              sessionType: "long_run",
              workoutId: "__race_day__",
            }),
          ],
          volumePercent: 100,
        },
      ],
      { raceDate: "2025-06-01" },
    );

    const findings = auditPlan(plan);
    const errorsAndWarnings = findings.filter(
      (f) => f.severity === "error" || f.severity === "warning",
    );
    expect(errorsAndWarnings).toHaveLength(0);
  });

  test("RACE_DAY_MISSING: plan with raceDate but no __race_day__ session", () => {
    const plan = makePlan(
      [
        { sessions: [makeSession(1)] },
        { sessions: [makeSession(3)] },
      ],
      { raceDate: "2025-06-01" },
    );

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "RACE_DAY_MISSING");
    expect(match).toBeDefined();
    expect(match!.severity).toBe("error");
    expect(match!.weekNumber).toBe(plan.totalWeeks);
  });

  test("RACE_DAY_NOT_LAST_WEEK: __race_day__ in non-last week", () => {
    const plan = makePlan(
      [
        {
          sessions: [makeSession(6, { workoutId: "__race_day__" })],
        },
        {
          sessions: [makeSession(1)],
        },
        {
          sessions: [makeSession(3)],
        },
      ],
      { raceDate: "2025-06-01" },
    );

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "RACE_DAY_NOT_LAST_WEEK");
    expect(match).toBeDefined();
    expect(match!.severity).toBe("error");
    expect(match!.weekNumber).toBe(1);
  });

  test("KEY_SESSIONS_TOO_CLOSE: two key sessions on consecutive days", () => {
    const plan = makePlan([
      {
        sessions: [
          makeSession(2, { isKeySession: true }),
          makeSession(3, { isKeySession: true }),
        ],
      },
    ]);

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "KEY_SESSIONS_TOO_CLOSE");
    expect(match).toBeDefined();
    expect(match!.severity).toBe("warning");
    expect(match!.message).toContain("Mer");
    expect(match!.message).toContain("Jeu");
  });

  test("KEY_SESSION_ADJACENT_LONG_RUN: key session next to long run", () => {
    const plan = makePlan([
      {
        sessions: [
          makeSession(4, { isKeySession: true, sessionType: "threshold" }),
          makeSession(5, { sessionType: "long_run" }),
        ],
      },
    ]);

    const findings = auditPlan(plan);
    const match = findings.find(
      (f) => f.code === "KEY_SESSION_ADJACENT_LONG_RUN",
    );
    expect(match).toBeDefined();
    expect(match!.severity).toBe("warning");
    expect(match!.messageEn).toContain("Fri");
    expect(match!.messageEn).toContain("Sat");
  });

  test("RECOVERY_WEEK_TOO_HARD: recovery week with key session", () => {
    const plan = makePlan([
      {
        isRecoveryWeek: true,
        sessions: [
          makeSession(1, { isKeySession: true, sessionType: "vo2max" }),
          makeSession(4),
        ],
      },
    ]);

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "RECOVERY_WEEK_TOO_HARD");
    expect(match).toBeDefined();
    expect(match!.severity).toBe("warning");
    expect(match!.weekNumber).toBe(1);
  });

  test("TAPER_WEEK_HEAVY: taper week with volume > 70%", () => {
    const plan = makePlan([
      {
        phase: "taper" as TrainingPhase,
        volumePercent: 85,
        sessions: [makeSession(1), makeSession(4)],
      },
    ]);

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "TAPER_WEEK_HEAVY");
    expect(match).toBeDefined();
    expect(match!.severity).toBe("warning");
    expect(match!.message).toContain("85%");
  });

  test("VOLUME_JUMP_TOO_LARGE: >20% volume increase from non-recovery week", () => {
    const plan = makePlan([
      { volumePercent: 70, sessions: [makeSession(1)] },
      { volumePercent: 100, sessions: [makeSession(1)] }, // +42.8%
    ]);

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "VOLUME_JUMP_TOO_LARGE");
    expect(match).toBeDefined();
    expect(match!.severity).toBe("warning");
    expect(match!.weekNumber).toBe(2);
  });

  test("VOLUME_JUMP_TOO_LARGE: skip if previous week is recovery", () => {
    const plan = makePlan([
      {
        volumePercent: 50,
        isRecoveryWeek: true,
        sessions: [makeSession(1)],
      },
      { volumePercent: 100, sessions: [makeSession(1)] }, // big jump but from recovery
    ]);

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "VOLUME_JUMP_TOO_LARGE");
    expect(match).toBeUndefined();
  });

  test("EMPTY_WEEK: week with zero sessions", () => {
    const plan = makePlan([
      { sessions: [makeSession(1)] },
      { sessions: [] },
    ]);

    const findings = auditPlan(plan);
    const match = findings.find((f) => f.code === "EMPTY_WEEK");
    expect(match).toBeDefined();
    expect(match!.severity).toBe("info");
    expect(match!.weekNumber).toBe(2);
  });
});
