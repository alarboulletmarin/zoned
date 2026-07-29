import { describe, expect, test } from "bun:test";

import tempoCatalogue from "@/data/workouts/tempo.json";
import type { WorkoutBlock, WorkoutTemplate } from "@/types";
import type { StrengthBlock, StrengthWorkoutTemplate } from "@/types/strength";
import {
  WORKOUT_PHASES,
  getWorkoutPhaseBlocks,
  isRunningWorkout,
  isStrengthWorkout,
} from "./workoutTemplate";

function runningBlock(description: string): WorkoutBlock {
  return { description, descriptionEn: description, durationMin: 10, zone: "Z2" };
}

function strengthBlock(exerciseId: string): StrengthBlock {
  return { exerciseId, sets: 3, reps: 10, restBetweenSets: "60s", intensity: "strength" };
}

function makeRunning(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: "TMP-001",
    name: "Tempo",
    nameEn: "Tempo",
    description: "Description",
    descriptionEn: "Description",
    category: "tempo",
    sessionType: "tempo",
    targetSystem: "lactate_threshold",
    difficulty: "intermediate",
    typicalDuration: { min: 40, max: 60 },
    environment: { requiresHills: false, requiresTrack: false },
    warmupTemplate: [runningBlock("warmup")],
    mainSetTemplate: [runningBlock("main a"), runningBlock("main b")],
    cooldownTemplate: [runningBlock("cooldown")],
    coachingTips: [],
    coachingTipsEn: [],
    commonMistakes: [],
    commonMistakesEn: [],
    variationIds: [],
    selectionCriteria: {
      phases: ["build"],
      weekPositions: ["mid"],
      relativeLoad: "hard",
      tags: [],
      priorityScore: 1,
    },
    ...overrides,
  };
}

function makeStrength(overrides: Partial<StrengthWorkoutTemplate> = {}): StrengthWorkoutTemplate {
  return {
    id: "STR-001",
    kind: "strength",
    name: "Renfo",
    nameEn: "Strength",
    description: "Description",
    descriptionEn: "Description",
    category: "runner_lower",
    difficulty: "intermediate",
    typicalDuration: { min: 30, max: 45 },
    equipment: ["none"],
    primaryMuscleGroups: ["glutes"],
    warmupBlocks: [strengthBlock("EX-WU-001")],
    mainBlocks: [strengthBlock("EX-SQ-001"), strengthBlock("EX-LU-001")],
    cooldownBlocks: [strengthBlock("EX-CD-001")],
    intensity: "strength",
    coachingTips: [],
    coachingTipsEn: [],
    commonMistakes: [],
    commonMistakesEn: [],
    variationIds: [],
    suitablePhases: ["build"],
    weeklyFrequencyMax: 2,
    minimumRecoveryDays: 1,
    ...overrides,
  };
}

describe("fixtures", () => {
  /**
   * `tsconfig.json` excludes `src/**\/*.test.ts`, so `bunx tsc --noEmit` never
   * reads this file: a literal that no union admits compiles here for ever, and
   * the `: WorkoutTemplate` annotation buys nothing. `targetSystem: "threshold"`
   * did exactly that: a plausible string, and a SessionType rather than a
   * TargetSystem. Pinning the fixture's enum literals to values the shipped
   * catalogue really uses catches that at runtime, where this file does run.
   */
  test("the running fixture uses literals the shipped catalogue uses", () => {
    const shipped = tempoCatalogue.templates as readonly Record<string, unknown>[];
    const fixture = makeRunning() as unknown as Record<string, unknown>;
    for (const key of ["category", "sessionType", "targetSystem", "difficulty"] as const) {
      expect(new Set(shipped.map((template) => template[key]))).toContain(fixture[key]);
    }
  });
});

describe("guards", () => {
  test("a running template is running, not strength", () => {
    const workout = makeRunning();
    expect(isRunningWorkout(workout)).toBe(true);
    expect(isStrengthWorkout(workout)).toBe(false);
  });

  test("a strength template is strength, not running", () => {
    const workout = makeStrength();
    expect(isStrengthWorkout(workout)).toBe(true);
    expect(isRunningWorkout(workout)).toBe(false);
  });
});

describe("getWorkoutPhaseBlocks", () => {
  test("reads the running phase fields", () => {
    const workout = makeRunning();
    expect(getWorkoutPhaseBlocks(workout, "warmup")).toEqual(workout.warmupTemplate);
    expect(getWorkoutPhaseBlocks(workout, "main")).toEqual(workout.mainSetTemplate);
    expect(getWorkoutPhaseBlocks(workout, "cooldown")).toEqual(workout.cooldownTemplate);
  });

  test("reads the strength phase fields", () => {
    const workout = makeStrength();
    expect(getWorkoutPhaseBlocks(workout, "warmup")).toEqual(workout.warmupBlocks);
    expect(getWorkoutPhaseBlocks(workout, "main")).toEqual(workout.mainBlocks);
    expect(getWorkoutPhaseBlocks(workout, "cooldown")).toEqual(workout.cooldownBlocks);
  });

  test("never mixes the two namings", () => {
    // A strength template holds no running field and vice versa: reading the
    // wrong side would return the other kind's blocks, which is the bug the
    // union exists to prevent.
    const running = getWorkoutPhaseBlocks(makeRunning(), "main") as WorkoutBlock[];
    const strength = getWorkoutPhaseBlocks(makeStrength(), "main") as StrengthBlock[];
    expect(running.every((b) => "zone" in b)).toBe(true);
    expect(strength.every((b) => "exerciseId" in b)).toBe(true);
  });

  test("returns [] for a phase the template omits", () => {
    const running = makeRunning({ warmupTemplate: undefined as unknown as WorkoutBlock[] });
    const strength = makeStrength({ cooldownBlocks: undefined as unknown as StrengthBlock[] });
    expect(getWorkoutPhaseBlocks(running, "warmup")).toEqual([]);
    expect(getWorkoutPhaseBlocks(strength, "cooldown")).toEqual([]);
  });

  test("WORKOUT_PHASES walks a whole workout in order", () => {
    const running = makeRunning();
    const strength = makeStrength();
    expect(WORKOUT_PHASES.flatMap((p) => getWorkoutPhaseBlocks(running, p))).toEqual([
      ...running.warmupTemplate,
      ...running.mainSetTemplate,
      ...running.cooldownTemplate,
    ]);
    expect(WORKOUT_PHASES.flatMap((p) => getWorkoutPhaseBlocks(strength, p))).toEqual([
      ...strength.warmupBlocks,
      ...strength.mainBlocks,
      ...strength.cooldownBlocks,
    ]);
  });
});
