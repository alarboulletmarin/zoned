import { describe, expect, mock, test } from "bun:test";

// `weekStats` reaches the i18n entry point through `@/types`, and that module
// uses Vite's `import.meta.glob`. Stub it first, then load dynamically, the
// same way weekGenerator.test.ts does.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const {
  ACTIVITY_KINDS,
  activityKindOf,
  activitySessionTss,
  activitySessionZone,
  activitySlotInfo,
  activityWorkoutId,
  applyActivityDraft,
  defaultActivityDraft,
  isActivitySession,
  makeActivitySession,
} = await import("./activitySession");
const { computeWeekStats } = await import("./weekStats");

import type { CommutePattern } from "@/types/athlete-profile";
import type { PlanSession } from "@/types/plan";
import type { WeekSlot } from "@/types/week";

const pattern: CommutePattern = {
  version: 1,
  discipline: "cycling",
  daysOfWeek: [0, 2, 4],
  durationMin: 45,
  includeInPlan: false,
  updatedAt: "",
};

describe("the table of kinds", () => {
  test("every kind answers to its own workout id, and to nothing else", () => {
    for (const meta of ACTIVITY_KINDS) {
      expect(activityWorkoutId(meta.kind)).toBe(meta.workoutId);
      expect(activityKindOf(meta.workoutId)?.kind).toBe(meta.kind);
      expect(isActivitySession(meta.workoutId)).toBe(true);
    }
    expect(activityKindOf("REC-001")).toBeNull();
    expect(isActivitySession("REC-001")).toBe(false);
  });
});

describe("a commute", () => {
  test("is pre-filled from the profile, as declared, never doubled", () => {
    expect(defaultActivityDraft("commute", pattern)).toEqual({ durationMin: 45, intensity: "easy" });
    expect(defaultActivityDraft("commute", null)).toEqual({ durationMin: 0, intensity: "easy" });
    expect(defaultActivityDraft("cycling", pattern).durationMin).toBe(0);
  });

  test("lands as an easy cycling session with its duration", () => {
    const session = makeActivitySession("commute", 0, { durationMin: 45, intensity: "easy" }, pattern);
    expect(session).toEqual({
      dayOfWeek: 0,
      workoutId: "__activity_commute__",
      discipline: "cycling",
      sessionType: "cycling",
      isKeySession: false,
      estimatedDurationMin: 45,
      intensity: "easy",
    });
  });

  test("done on foot, it is a running session, so per-sport totals stay honest", () => {
    const session = makeActivitySession(
      "commute",
      1,
      { durationMin: 30, intensity: "easy" },
      { ...pattern, discipline: "running" },
    );
    expect(session.discipline).toBe("running");
    expect(session.sessionType).toBe("recovery");
  });
});

describe("zone and load", () => {
  const ride = (intensity: PlanSession["intensity"], durationMin = 60): PlanSession => ({
    dayOfWeek: 0,
    workoutId: "__activity_cycling__",
    sessionType: "cycling",
    isKeySession: false,
    estimatedDurationMin: durationMin,
    ...(intensity && { intensity }),
  });

  test("easy is Z2, moderate Z3, hard Z4, and absent means easy", () => {
    expect(activitySessionZone(ride("easy"))).toBe(2);
    expect(activitySessionZone(ride("moderate"))).toBe(3);
    expect(activitySessionZone(ride("hard"))).toBe(4);
    expect(activitySessionZone(ride(undefined))).toBe(2);
  });

  test("strength, yoga and rest carry no zone whatever the effort says", () => {
    for (const kind of ["strength", "yoga", "rest"] as const) {
      const session = makeActivitySession(kind, 3, { durationMin: 40, intensity: "hard" });
      expect(session.intensity).toBeUndefined();
      expect(activitySessionZone(session)).toBeNull();
      expect(activitySessionTss(session)).toBe(0);
    }
  });

  test("load is the running TSS of the zone: an easy hour is 49, a hard one 100", () => {
    expect(activitySessionTss(ride("easy"))).toBe(49);
    expect(activitySessionTss(ride("hard"))).toBe(100);
    expect(activitySessionTss(ride("easy", 0))).toBe(0);
  });

  test("the slot info is what the week reads", () => {
    expect(activitySlotInfo(ride("moderate", 30))).toEqual({
      workoutId: "__activity_cycling__",
      durationMin: 30,
      zone: 3,
      tss: 36,
    });
  });
});

describe("adjusting an activity", () => {
  test("replaces duration and effort, keeps the rest", () => {
    const session: PlanSession = {
      ...makeActivitySession("cycling", 2, { durationMin: 0, intensity: "easy" }),
      locked: true,
      notes: "keep",
    };
    const next = applyActivityDraft(session, { durationMin: 50, intensity: "moderate" });
    expect(next).toEqual({ ...session, estimatedDurationMin: 50, intensity: "moderate" });
  });

  test("a non-aerobic activity never gains an effort", () => {
    const yoga = makeActivitySession("yoga", 2, { durationMin: 30, intensity: "easy" });
    expect(applyActivityDraft(yoga, { durationMin: 45, intensity: "hard" }).intensity).toBeUndefined();
  });
});

describe("in the week stats", () => {
  const rest = (day: WeekSlot["day"]): WeekSlot => ({ day, kind: "rest", workout: null, locked: false });
  const commute = (day: WeekSlot["day"], durationMin: number): WeekSlot => ({
    day,
    kind: "easy",
    workout: null,
    locked: false,
    activity: activitySlotInfo(
      makeActivitySession("commute", day, { durationMin, intensity: "easy" }, pattern),
    ),
  });

  test("three commutes are three easy sessions, with their volume and load", () => {
    const stats = computeWeekStats([
      commute(0, 45),
      rest(1),
      commute(2, 45),
      rest(3),
      commute(4, 45),
      rest(5),
      rest(6),
    ]);
    expect(stats.sessions).toBe(3);
    expect(stats.totalMinutes).toBe(135);
    expect(stats.totalTss).toBe(111);
    expect(stats.hardSessions).toBe(0);
    expect(stats.polarised.lowMinutes).toBe(135);
    expect(stats.polarised.lowShare).toBe(1);
  });

  test("a commute without a duration weighs nothing and is not a session yet", () => {
    const stats = computeWeekStats([commute(0, 0), rest(1), rest(2), rest(3), rest(4), rest(5), rest(6)]);
    expect(stats.sessions).toBe(0);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.polarised.zonedMinutes).toBe(0);
  });

  test("a hard activity counts as a hard session, on the intense side", () => {
    const slot: WeekSlot = {
      day: 3,
      kind: "easy",
      workout: null,
      locked: false,
      activity: activitySlotInfo(makeActivitySession("cycling", 3, { durationMin: 60, intensity: "hard" })),
    };
    const stats = computeWeekStats([slot]);
    expect(stats.hardSessions).toBe(1);
    expect(stats.polarised.highMinutes).toBe(60);
  });
});
