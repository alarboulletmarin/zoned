import { describe, expect, test } from "bun:test";

import type { RunnerProfile } from "@/types/runner-profile";
import type { Route } from "@/types/route";
import type { PlanSession } from "@/types/plan";
import type { WorkoutTemplate } from "@/types";

import {
  buildTrainingRoutePreset,
  buildManualRouteIntent,
  buildWorkoutRoutePreset,
  pickWeekRouteTarget,
  poiBoostForSession,
  rankRouteCandidates,
} from "./recommendation";

function makeRunnerProfile(overrides: Partial<RunnerProfile> = {}): RunnerProfile {
  return {
    version: 1,
    performanceReferences: {},
    benchmarks: [],
    personalRecords: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    runnerLevel: "intermediate",
    vma: 15,
    currentWeeklyKm: 45,
    currentLongRunKm: 18,
    ...overrides,
  };
}

function makeSession(overrides: Partial<PlanSession> = {}): PlanSession {
  return {
    dayOfWeek: 1,
    workoutId: "RUN-001",
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 50,
    ...overrides,
  };
}

function makeRoute(overrides: Partial<Route> = {}): Route {
  return {
    id: "route-1",
    name: "Test route",
    discipline: "running",
    shape: "loop",
    points: [
      [2.35, 48.8566, 35],
      [2.355, 48.861, 37],
      [2.36, 48.8566, 35],
      [2.35, 48.8566, 35],
    ],
    elevation: [],
    distanceM: 8_000,
    elevationGainM: 40,
    estimatedDurationSec: 3_300,
    constraints: {
      shape: "loop",
      discipline: "running",
      targetDistanceKm: 8,
      surface: "mixed",
      seed: 1,
    },
    generatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeWorkout(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: "END-001",
    name: "Footing progressif",
    nameEn: "Progressive easy run",
    description: "45 min d'endurance régulière.",
    descriptionEn: "45 minutes of steady endurance.",
    category: "endurance",
    sessionType: "endurance",
    targetSystem: "aerobic_base",
    difficulty: "intermediate",
    typicalDuration: { min: 45, max: 55 },
    environment: {
      requiresHills: false,
      requiresTrack: false,
      prefersFlat: false,
      prefersSoft: false,
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
      phases: ["base"],
      weekPositions: ["mid"],
      relativeLoad: "moderate",
      tags: [],
      priorityScore: 1,
    },
    ...overrides,
  };
}

describe("buildTrainingRoutePreset", () => {
  test("derives a steady road preset for threshold sessions", () => {
    const preset = buildTrainingRoutePreset({
      session: makeSession({
        sessionType: "threshold",
        isKeySession: true,
        estimatedDurationMin: 60,
        targetDurationMin: 60,
      }),
      runnerProfile: makeRunnerProfile({ vma: 15.5 }),
      planSessionRef: { planId: "plan-1", weekNumber: 4, sessionIndex: 1 },
    });

    expect(preset.formDefaults.shape).toBe("out_and_back");
    expect(preset.formDefaults.surface).toBe("road");
    expect(preset.intent.continuityPriority).toBe("high");
    expect(preset.intent.terrainPreference).toBe("flat");
    expect(preset.formDefaults.targetDistanceKm).toBeGreaterThan(11);
    expect(preset.formDefaults.targetDistanceKm).toBeLessThan(15);
  });
});

describe("buildWorkoutRoutePreset", () => {
  test("derives a threshold road preset from a library workout", () => {
    const preset = buildWorkoutRoutePreset({
      workout: makeWorkout({
        id: "THR-007",
        category: "threshold",
        sessionType: "threshold",
        typicalDuration: { min: 55, max: 65 },
        environment: {
          requiresHills: false,
          requiresTrack: false,
          prefersFlat: true,
          prefersSoft: false,
        },
      }),
      runnerProfile: makeRunnerProfile({ vma: 15.5 }),
    });

    expect(preset.formDefaults.shape).toBe("out_and_back");
    expect(preset.formDefaults.surface).toBe("road");
    expect(preset.intent.continuityPriority).toBe("high");
    expect(preset.intent.terrainPreference).toBe("flat");
    expect(preset.formDefaults.targetDistanceKm).toBeGreaterThan(11);
  });
});

describe("rankRouteCandidates", () => {
  test("prefers the flatter route for a recovery session", () => {
    const preset = buildTrainingRoutePreset({
      session: makeSession({
        sessionType: "recovery",
        estimatedDurationMin: 45,
        targetDistanceKm: 8,
      }),
      runnerProfile: makeRunnerProfile({
        runnerLevel: "beginner",
        currentWeeklyKm: 20,
        currentLongRunKm: 10,
      }),
    });

    const flatLoop = makeRoute({
      id: "flat-loop",
      shape: "loop",
      distanceM: 8_300,
      elevationGainM: 28,
    });
    const hillyOutAndBack = makeRoute({
      id: "hilly-out-and-back",
      shape: "out_and_back",
      distanceM: 8_000,
      elevationGainM: 190,
      points: [
        [2.35, 48.8566, 35],
        [2.36, 48.8566, 75],
        [2.35, 48.8566, 35],
      ],
    });

    const ranked = rankRouteCandidates([hillyOutAndBack, flatLoop], {
      intent: preset.intent,
      athlete: preset.athlete,
    });

    expect(ranked[0].route.id).toBe("flat-loop");
    expect(ranked[0].reasons).toContain("keeps_climbing_low");
  });

  test("prefers climbing out-and-back routes for hill sessions", () => {
    const preset = buildTrainingRoutePreset({
      session: makeSession({
        sessionType: "hills",
        estimatedDurationMin: 55,
        targetDistanceKm: 10,
      }),
      runnerProfile: makeRunnerProfile(),
    });

    const hillRepeats = makeRoute({
      id: "hill-repeats",
      shape: "out_and_back",
      distanceM: 9_700,
      elevationGainM: 260,
      points: [
        [2.35, 48.8566, 35],
        [2.36, 48.8585, 135],
        [2.35, 48.8566, 35],
      ],
    });
    const flatLoop = makeRoute({
      id: "flat-loop",
      shape: "loop",
      distanceM: 10_000,
      elevationGainM: 32,
    });

    const ranked = rankRouteCandidates([flatLoop, hillRepeats], {
      intent: preset.intent,
      athlete: preset.athlete,
    });

    expect(ranked[0].route.id).toBe("hill-repeats");
    expect(ranked[0].reasons).toContain("adds_useful_climbing");
    expect(ranked[0].reasons).toContain("stays_repeatable_for_repeats");
  });

  test("uses athlete paces to predict duration for quality sessions", () => {
    const preset = buildTrainingRoutePreset({
      session: makeSession({
        sessionType: "threshold",
        estimatedDurationMin: 55,
        targetDurationMin: 55,
        targetDistanceKm: 12,
      }),
      runnerProfile: makeRunnerProfile({ vma: 16, runnerLevel: "advanced" }),
    });

    const route = makeRoute({
      id: "steady-12k",
      distanceM: 12_000,
      elevationGainM: 20,
      estimatedDurationSec: 4_700,
      shape: "out_and_back",
      constraints: {
        shape: "out_and_back",
        discipline: "running",
        targetDistanceKm: 12,
        surface: "road",
        seed: 2,
      },
    });

    const [ranked] = rankRouteCandidates([route], {
      intent: preset.intent,
      athlete: preset.athlete,
    });

    expect(ranked.predictedDurationSec).toBeLessThan(route.estimatedDurationSec);
    expect(ranked.reasons).toContain("matches_target_duration");
  });

  test("prefers the route closest to the requested elevation target", () => {
    const intent = buildManualRouteIntent({
      discipline: "running",
      shape: "loop",
      targetDistanceKm: 10,
      surface: "mixed",
      elevationGainTargetM: 180,
    });

    const low = makeRoute({ id: "low", distanceM: 10_000, elevationGainM: 25 });
    const medium = makeRoute({ id: "medium", distanceM: 10_000, elevationGainM: 165 });
    const high = makeRoute({ id: "high", distanceM: 10_000, elevationGainM: 340 });

    const ranked = rankRouteCandidates([low, high, medium], { intent, athlete: null });

    expect(ranked[0].route.id).toBe("medium");
    expect(ranked[0].reasons).toContain("matches_elevation_target");
  });
});

describe("poiBoostForSession", () => {
  test("boosts athletics tracks for interval-shaped sessions", () => {
    expect(poiBoostForSession("vo2max")).toEqual({ type: "track", factor: 4 });
    expect(poiBoostForSession("speed")).toEqual({ type: "track", factor: 4 });
    expect(poiBoostForSession("vma")).toEqual({ type: "track", factor: 4 });
  });

  test("returns undefined for non-interval sessions", () => {
    expect(poiBoostForSession("endurance")).toBeUndefined();
    expect(poiBoostForSession("recovery")).toBeUndefined();
    expect(poiBoostForSession("long_run")).toBeUndefined();
    expect(poiBoostForSession(undefined)).toBeUndefined();
  });
});

describe("rankRouteCandidates with track POI", () => {
  test("surfaces the 'uses_athletics_track' reason on interval sessions when the trace passes a track", () => {
    const preset = buildTrainingRoutePreset({
      session: makeSession({
        sessionType: "vo2max",
        isKeySession: true,
        estimatedDurationMin: 50,
        targetDistanceKm: 8,
      }),
      runnerProfile: makeRunnerProfile(),
    });

    const trackRoute = makeRoute({
      id: "with-track",
      distanceM: 8_000,
      elevationGainM: 30,
      pois: [{ type: "track", point: [2.36, 48.86] }],
    });

    const [ranked] = rankRouteCandidates([trackRoute], {
      intent: preset.intent,
      athlete: preset.athlete,
    });

    expect(ranked.reasons).toContain("uses_athletics_track");
  });

  test("does not surface the track reason when the session isn't interval-shaped", () => {
    const preset = buildTrainingRoutePreset({
      session: makeSession({ sessionType: "endurance", estimatedDurationMin: 50 }),
      runnerProfile: makeRunnerProfile(),
    });

    const trackRoute = makeRoute({
      id: "with-track",
      pois: [{ type: "track", point: [2.36, 48.86] }],
    });

    const [ranked] = rankRouteCandidates([trackRoute], {
      intent: preset.intent,
      athlete: preset.athlete,
    });

    expect(ranked.reasons).not.toContain("uses_athletics_track");
  });
});

describe("pickWeekRouteTarget", () => {
  test("prefers the key running session before the long run", () => {
    const target = pickWeekRouteTarget({
      sessions: [
        makeSession({ sessionType: "endurance", estimatedDurationMin: 50 }),
        makeSession({ sessionType: "threshold", isKeySession: true, estimatedDurationMin: 60 }),
        makeSession({ sessionType: "long_run", estimatedDurationMin: 95 }),
      ],
    });

    expect(target?.session.sessionType).toBe("threshold");
    expect(target?.sessionIndex).toBe(1);
  });

  test("falls back to the long run when no key running session exists", () => {
    const target = pickWeekRouteTarget({
      sessions: [
        makeSession({ sessionType: "strength", discipline: "running", estimatedDurationMin: 40 }),
        makeSession({ sessionType: "long_run", estimatedDurationMin: 100 }),
        makeSession({ sessionType: "endurance", estimatedDurationMin: 55 }),
      ],
    });

    expect(target?.session.sessionType).toBe("long_run");
    expect(target?.sessionIndex).toBe(1);
  });
});
