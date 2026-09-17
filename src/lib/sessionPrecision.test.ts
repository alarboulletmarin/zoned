import { describe, expect, mock, test } from "bun:test";

// The catalog loader and `@/types` reach the i18n entry point, which uses
// Vite's `import.meta.glob`. Stub it, then load the modules under test.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { loadAllWorkouts, loadAllStrengthSessions } = await import("@/data/workouts").then(
  async (w) => ({ ...w, ...(await import("@/data/strength")) }),
);
const {
  canBeLoose,
  catalogRange,
  defaultPrecisionFor,
  fixedSession,
  initialDurationFor,
  isLooseSession,
  looseKmEstimate,
  looseSession,
  rangeMidpoint,
  sessionTssFor,
} = await import("./sessionPrecision");
const { sessionFromWorkout, planWeekToSlots } = await import("./weekToPlan");
const { computeWeekStats } = await import("./weekStats");
const { getDominantZone } = await import("@/types");
const { getAnyWorkoutDuration, getAnyWorkoutTss } = await import("./workoutFilters");

import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import type { PlanWeek } from "@/types/plan";

const running = await loadAllWorkouts();
const strength = await loadAllStrengthSessions();
const easy = running.find((w) => getDominantZone(w) <= 2 && w.typicalDuration.max > w.typicalDuration.min)!;
const hard = running.find((w) => getDominantZone(w) >= 4)!;
const lift = strength[0];

describe("what can be loose", () => {
  test("an easy run with a range can, a Z4+ session is fixed by default, strength never", () => {
    expect(canBeLoose(easy)).toBe(true);
    expect(defaultPrecisionFor(easy)).toBe("loose");
    expect(defaultPrecisionFor(hard)).toBe("fixed");
    expect(canBeLoose(lift)).toBe(false);
    expect(defaultPrecisionFor(lift)).toBe("fixed");
  });

  test("the range is the template's, rounded, and the midpoint is its middle", () => {
    const range = catalogRange(easy)!;
    expect(range.min).toBe(Math.round(easy.typicalDuration.min));
    expect(range.max).toBe(Math.round(easy.typicalDuration.max));
    expect(rangeMidpoint({ min: 25, max: 35 })).toBe(30);
    expect(rangeMidpoint({ min: 25, max: 36 })).toBe(31);
  });
});

describe("a session picked from the panel", () => {
  test("an easy run lands loose, at the middle of its range", () => {
    const session = sessionFromWorkout(1, easy);
    expect(session.precision).toBe("loose");
    expect(session.estimatedDurationMin).toBe(rangeMidpoint(catalogRange(easy)!));
    expect(session.isKeySession).toBe(false);
  });

  test("a hard session lands fixed, at its structured duration, as a key session", () => {
    const session = sessionFromWorkout(3, hard);
    expect(session.precision).toBe("fixed");
    expect(session.estimatedDurationMin).toBe(getAnyWorkoutDuration(hard));
    expect(session.isKeySession).toBe(true);
    expect(initialDurationFor(hard, "fixed")).toBe(getAnyWorkoutDuration(hard));
  });
});

describe("switching", () => {
  test("fixed keeps the duration and the km asked, rounded to a tenth", () => {
    const session = fixedSession(sessionFromWorkout(1, easy), 32.4, 6.44);
    expect(isLooseSession(session)).toBe(false);
    expect(session.estimatedDurationMin).toBe(32);
    expect(session.targetDistanceKm).toBe(6.4);
    expect(fixedSession(session, 30).targetDistanceKm).toBeUndefined();
  });

  test("loose goes back to the middle of the range and forgets the km", () => {
    const fixed = fixedSession(sessionFromWorkout(1, easy), 32, 6.4);
    const loose = looseSession(fixed, easy);
    expect(loose.precision).toBe("loose");
    expect(loose.estimatedDurationMin).toBe(rangeMidpoint(catalogRange(easy)!));
    expect(loose.targetDistanceKm).toBeUndefined();
  });

  test("a loose run has an estimate in km, a loose ride has none", () => {
    const run = sessionFromWorkout(1, easy);
    expect(looseKmEstimate(run)).toBeGreaterThan(0);
    const ride = { ...run, discipline: "cycling" as const };
    expect(looseKmEstimate(ride)).toBeNull();
  });
});

describe("the week counts the session's own duration", () => {
  const week = (sessions: PlanWeek["sessions"]): PlanWeek => ({
    weekNumber: 1,
    phase: "base",
    isRecoveryWeek: false,
    volumePercent: 100,
    sessions,
  });
  const byId = new Map<string, AnyWorkoutTemplate>([[easy.id, easy], [hard.id, hard]]);

  test("a session fixed at 32 min weighs 32, and its load scales with it", () => {
    const stats = computeWeekStats(
      planWeekToSlots(week([fixedSession(sessionFromWorkout(1, easy), 32)]), byId),
    );
    expect(stats.totalMinutes).toBe(32);
    expect(stats.totalTss).toBe(sessionTssFor(easy, 32)!);
    const base = getAnyWorkoutTss(easy as WorkoutTemplate)!;
    expect(sessionTssFor(easy, getAnyWorkoutDuration(easy))).toBe(base);
  });

  test("a loose session weighs the middle of its range", () => {
    const stats = computeWeekStats(planWeekToSlots(week([sessionFromWorkout(1, easy)]), byId));
    expect(stats.totalMinutes).toBe(rangeMidpoint(catalogRange(easy)!));
  });
});
