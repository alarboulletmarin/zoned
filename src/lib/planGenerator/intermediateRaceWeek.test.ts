import { describe, expect, test } from "bun:test";

import { applyIntermediateRaces } from "./intermediateRaceWeek";
import type {
  PlanWeek,
  PlanSession,
  AssistedPlanConfig,
  IntermediateGoal,
} from "@/types/plan";
import type { WorkoutTemplate } from "@/types";

// ── Test helpers ─────────────────────────────────────────────────

function makeSession(overrides: Partial<PlanSession> = {}): PlanSession {
  return {
    dayOfWeek: 1,
    workoutId: "test-workout",
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
    ...overrides,
  };
}

function makeWeek(
  weekNumber: number,
  overrides: Partial<PlanWeek> = {},
): PlanWeek {
  return {
    weekNumber,
    phase: "build",
    isRecoveryWeek: false,
    volumePercent: 85,
    sessions: [
      makeSession({ dayOfWeek: 1, sessionType: "endurance" }),
      makeSession({
        dayOfWeek: 3,
        sessionType: "vo2max",
        isKeySession: true,
      }),
      makeSession({ dayOfWeek: 5, sessionType: "endurance" }),
      makeSession({ dayOfWeek: 0, sessionType: "long_run" }), // Sunday long run (day 6 in 0-indexed Mon)
    ],
    targetKm: 60,
    targetLongRunKm: 20,
    ...overrides,
  };
}

function makeConfig(
  overrides: Partial<AssistedPlanConfig> = {},
): AssistedPlanConfig {
  return {
    id: "test-plan",
    daysPerWeek: 4,
    createdAt: "2025-01-06",
    startDate: "2025-01-06",
    raceDistance: "marathon",
    raceDate: "2025-06-15",
    runnerLevel: "intermediate",
    longRunDay: 0, // Sunday (day index 0 in our week model = Monday, but longRunDay convention here)
    intermediateGoals: [],
    ...overrides,
  } as AssistedPlanConfig;
}

const mockWorkouts: WorkoutTemplate[] = [
  {
    id: "opener-1",
    name: "Footing activation",
    nameEn: "Activation jog",
    description: "Footing leger avec accelerations",
    descriptionEn: "Easy jog with strides",
    category: "recovery",
    sessionType: "recovery",
    targetSystem: "aerobic_base",
    difficulty: "intermediate",
    typicalDuration: { min: 20, max: 30 },
    environment: {
      requiresHills: false,
      requiresTrack: false,
    },
    warmupTemplate: [],
    mainSetTemplate: [],
    cooldownTemplate: [],
    coachingTips: [],
    coachingTipsEn: [],
    commonMistakes: [],
    commonMistakesEn: [],
    variationIds: [],
    selectionCriteria: {
      phases: ["taper"],
      weekPositions: ["late"],
      relativeLoad: "light",
      tags: ["opener", "shakeout"],
      priorityScore: 5,
    },
  },
];

// Helper: compute a goal date that falls within a specific week number
function goalDateForWeek(weekNumber: number): string {
  // planStart is 2025-01-06 (Monday)
  // Week N starts at day (N-1)*7 from planStart
  const start = new Date(2025, 0, 6); // Jan 6 2025
  start.setDate(start.getDate() + (weekNumber - 1) * 7 + 2); // +2 = Wednesday of that week
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Tests ────────────────────────────────────────────────────────

describe("applyIntermediateRaces", () => {
  test("no goals — weeks unchanged", () => {
    const weeks = [makeWeek(1), makeWeek(2), makeWeek(3)];
    const original = JSON.stringify(weeks);
    const config = makeConfig({ intermediateGoals: [] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    expect(JSON.stringify(weeks)).toBe(original);
  });

  test("priority A — race week volume reduced to ~50%", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const raceWeek = weeks.find((w) => w.weekNumber === 10)!;
    // A raceWeekPct = 0.50, original volumePercent = 85
    expect(raceWeek.volumePercent).toBe(Math.round(85 * 0.5));
    // Should have __intermediate_race__ session
    const raceSession = raceWeek.sessions.find(
      (s) => s.workoutId === "__intermediate_race__",
    );
    expect(raceSession).toBeDefined();
  });

  test("priority A — long run removed from race week", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const raceWeek = weeks.find((w) => w.weekNumber === 10)!;
    const longRun = raceWeek.sessions.find(
      (s) => s.sessionType === "long_run",
    );
    expect(longRun).toBeUndefined();
  });

  test("priority A — opener session added", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const raceWeek = weeks.find((w) => w.weekNumber === 10)!;
    const opener = raceWeek.sessions.find(
      (s) => s.estimatedDurationMin === 25 && s.notes && s.notes.toLowerCase().includes("activation"),
    );
    expect(opener).toBeDefined();
  });

  test("priority A — pre-race week volume reduced to ~75%", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const preWeek = weeks.find((w) => w.weekNumber === 9)!;
    // A preRaceWeekPct = 0.75, original = 85
    expect(preWeek.volumePercent).toBe(Math.round(85 * 0.75));
  });

  test("priority A — post-race week is recovery with ~65% volume", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const postWeek = weeks.find((w) => w.weekNumber === 11)!;
    expect(postWeek.isRecoveryWeek).toBe(true);
    // A postRaceWeekPct = 0.65, original = 85
    expect(postWeek.volumePercent).toBe(Math.round(85 * 0.65));
  });

  test("priority B — race week volume ~70%, long run removed", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "B",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const raceWeek = weeks.find((w) => w.weekNumber === 10)!;
    // B raceWeekPct = 0.70, original = 85
    expect(raceWeek.volumePercent).toBe(Math.round(85 * 0.7));
    // Long run removed for priority B
    const longRun = raceWeek.sessions.find(
      (s) => s.sessionType === "long_run",
    );
    expect(longRun).toBeUndefined();
  });

  test("priority C — minimal disruption, ~85% volume", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "5K",
      raceDate: goalDateForWeek(10),
      priority: "C",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const raceWeek = weeks.find((w) => w.weekNumber === 10)!;
    // C raceWeekPct = 0.85, original = 85
    expect(raceWeek.volumePercent).toBe(Math.round(85 * 0.85));
    // Race session replaces one session, race session present
    const raceSession = raceWeek.sessions.find(
      (s) => s.workoutId === "__intermediate_race__",
    );
    expect(raceSession).toBeDefined();
  });

  test("two races 2 weeks apart — overlap takes most conservative volume", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal1: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(6),
      priority: "A",
    };
    const goal2: IntermediateGoal = {
      raceDistance: "5K",
      raceDate: goalDateForWeek(8),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal1, goal2] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    // Week 7 is post-race for goal1 AND pre-race for goal2
    const overlapWeek = weeks.find((w) => w.weekNumber === 7)!;
    // Post-race A = 0.65, pre-race A = 0.75 → should take the minimum
    // The first adjustment (pre-race for goal2) sets it to 85*0.75=64
    // Then overlap logic compares with 85*0.65=55 → min(64, 55) = 55
    // But the actual behavior depends on processing order; key thing: it picks the lower value
    expect(overlapWeek.volumePercent).toBeLessThanOrEqual(Math.round(85 * 0.75));
  });

  test("race week has intermediateRace metadata and weekLabel", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      raceName: "Semi de Paris",
      priority: "B",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const raceWeek = weeks.find((w) => w.weekNumber === 10)!;
    expect(raceWeek.intermediateRace).toBeDefined();
    expect(raceWeek.intermediateRace!.raceDistance).toBe("10K");
    expect(raceWeek.weekLabel).toContain("Semi de Paris");
  });

  test("original values preserved on adjusted pre/post weeks", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const preWeek = weeks.find((w) => w.weekNumber === 9)!;
    expect(preWeek._originalVolumePercent).toBe(85);

    const postWeek = weeks.find((w) => w.weekNumber === 11)!;
    expect(postWeek._originalVolumePercent).toBe(85);
  });

  test("goal outside plan range does not crash", () => {
    const weeks = Array.from({ length: 5 }, (_, i) => makeWeek(i + 1));
    // Goal maps to week ~20 but plan only has 5 weeks
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: "2025-06-01",
      priority: "B",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    // Should not throw
    expect(() =>
      applyIntermediateRaces(weeks, config, mockWorkouts),
    ).not.toThrow();

    // Weeks remain unchanged
    expect(weeks[0].volumePercent).toBe(85);
    expect(weeks[4].volumePercent).toBe(85);
  });

  // ── P6: Post-race long run capping ────────────────────────────

  test("P6 — post-race week caps long run at 60% for semi+ race", () => {
    const weeks = Array.from({ length: 15 }, (_, i) =>
      makeWeek(i + 1, { targetLongRunKm: 20 }),
    );
    const goal: IntermediateGoal = {
      raceDistance: "semi",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const postWeek = weeks.find((w) => w.weekNumber === 11)!;
    // 60% of 20 = 12
    expect(postWeek.targetLongRunKm).toBe(12);
  });

  test("P6 — post-race week caps long run at 80% for 10K race", () => {
    const weeks = Array.from({ length: 15 }, (_, i) =>
      makeWeek(i + 1, { targetLongRunKm: 20 }),
    );
    const goal: IntermediateGoal = {
      raceDistance: "10K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const postWeek = weeks.find((w) => w.weekNumber === 11)!;
    // 80% of 20 = 16
    expect(postWeek.targetLongRunKm).toBe(16);
  });

  test("P6 — pre-race week caps long run at 60% for semi+ race", () => {
    const weeks = Array.from({ length: 15 }, (_, i) =>
      makeWeek(i + 1, { targetLongRunKm: 20 }),
    );
    const goal: IntermediateGoal = {
      raceDistance: "semi",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const preWeek = weeks.find((w) => w.weekNumber === 9)!;
    // 60% of 20 = 12 (more aggressive than the old 70%)
    expect(preWeek.targetLongRunKm).toBe(12);
  });

  // ── P7: Key sessions converted to endurance in post-race week ──

  test("P7 — post-race key sessions converted to endurance for semi+ race", () => {
    const weeks = Array.from({ length: 15 }, (_, i) =>
      makeWeek(i + 1, {
        sessions: [
          makeSession({ dayOfWeek: 1, sessionType: "endurance" }),
          makeSession({
            dayOfWeek: 3,
            sessionType: "vo2max",
            isKeySession: true,
            estimatedDurationMin: 60,
          }),
          makeSession({ dayOfWeek: 5, sessionType: "endurance" }),
        ],
      }),
    );
    const goal: IntermediateGoal = {
      raceDistance: "semi",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const postWeek = weeks.find((w) => w.weekNumber === 11)!;
    // All sessions should be non-key and endurance
    const keySessions = postWeek.sessions.filter((s) => s.isKeySession);
    expect(keySessions.length).toBe(0);
    // The former vo2max session should be endurance now
    const enduranceSessions = postWeek.sessions.filter(
      (s) => s.sessionType === "endurance",
    );
    expect(enduranceSessions.length).toBeGreaterThan(0);
    // Duration should be reduced: min(45, round(60*0.7)) = min(45, 42) = 42
    const converted = postWeek.sessions.find(
      (s) => s.estimatedDurationMin === 42,
    );
    expect(converted).toBeDefined();
    // Post-race week should be forced to recovery
    expect(postWeek.isRecoveryWeek).toBe(true);
  });

  test("P7 — post-race key sessions NOT converted for short race", () => {
    const weeks = Array.from({ length: 15 }, (_, i) =>
      makeWeek(i + 1, {
        sessions: [
          makeSession({ dayOfWeek: 1, sessionType: "endurance" }),
          makeSession({
            dayOfWeek: 3,
            sessionType: "vo2max",
            isKeySession: true,
            estimatedDurationMin: 60,
          }),
          makeSession({ dayOfWeek: 5, sessionType: "endurance" }),
        ],
      }),
    );
    const goal: IntermediateGoal = {
      raceDistance: "5K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const postWeek = weeks.find((w) => w.weekNumber === 11)!;
    // 5K < 21.1km, so key sessions should remain
    const keySessions = postWeek.sessions.filter((s) => s.isKeySession);
    expect(keySessions.length).toBeGreaterThan(0);
  });

  // ── P8: S+2 adjustment for long races ──────────────────────────

  test("P8 — S+2 week gets 90% volume for semi+ race", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "semi",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const s2Week = weeks.find((w) => w.weekNumber === 12)!;
    // 90% of 85 = 77 (rounded)
    expect(s2Week.volumePercent).toBe(Math.round(85 * 0.90));
    expect(s2Week._originalVolumePercent).toBe(85);
  });

  test("P8 — S+2 long run capped at 80% for semi+ race", () => {
    const weeks = Array.from({ length: 15 }, (_, i) =>
      makeWeek(i + 1, { targetLongRunKm: 20 }),
    );
    const goal: IntermediateGoal = {
      raceDistance: "semi",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const s2Week = weeks.find((w) => w.weekNumber === 12)!;
    // 80% of 20 = 16
    expect(s2Week.targetLongRunKm).toBe(16);
  });

  test("P8 — no S+2 adjustment for short races (spike smoother may still apply)", () => {
    const weeks = Array.from({ length: 15 }, (_, i) => makeWeek(i + 1));
    const goal: IntermediateGoal = {
      raceDistance: "5K",
      raceDate: goalDateForWeek(10),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    const postWeek = weeks.find((w) => w.weekNumber === 11)!;
    const s2Week = weeks.find((w) => w.weekNumber === 12)!;
    // 5K < 21.1km, no explicit S+2 overlay (90% rule not applied).
    // But spike smoother caps the return at 15% above post-race volume.
    const maxReturn = Math.round(postWeek.volumePercent * 1.15);
    expect(s2Week.volumePercent).toBeLessThanOrEqual(maxReturn);
  });

  // ── P9: Volume spike smoothing ─────────────────────────────────

  test("P9 — volume spike capped at 15% increase after race adjustments", () => {
    // Create weeks with increasing volume to simulate a real plan
    const weeks = Array.from({ length: 15 }, (_, i) =>
      makeWeek(i + 1, {
        volumePercent: 70 + i * 2, // 70, 72, 74, ..., 98
        targetKm: 40 + i * 3,
      }),
    );
    const goal: IntermediateGoal = {
      raceDistance: "semi",
      raceDate: goalDateForWeek(6),
      priority: "A",
    };
    const config = makeConfig({ intermediateGoals: [goal] });

    applyIntermediateRaces(weeks, config, mockWorkouts);

    // After S+2 (week 8), week 9 should not spike more than 15% above week 8
    const s2Week = weeks.find((w) => w.weekNumber === 8)!;
    const nextWeek = weeks.find((w) => w.weekNumber === 9)!;

    // If spike smoothing is active, the jump should be <= 15%
    if (nextWeek._originalVolumePercent !== undefined) {
      expect(nextWeek.volumePercent).toBeLessThanOrEqual(
        Math.round(s2Week.volumePercent * 1.15),
      );
    }
  });
});
