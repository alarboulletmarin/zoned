import { describe, expect, test } from "bun:test";

import type { WorkoutTemplate, WorkoutStep } from "@/types";
import {
  buildLegacyBlocksFromSteps,
  flattenWorkoutSegments,
  getStructuredWorkoutDurationMinutes,
  getStructuredWorkoutDominantZone,
  getWorkoutPhaseSteps,
  getWorkoutZoneNumbers,
  normalizeWorkoutStructureSource,
  replaceWorkoutPhaseSteps,
  summarizeWorkoutSteps,
} from "./workoutStructure";

function makeWorkout(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: "TEST-001",
    name: "Test",
    nameEn: "Test",
    description: "Description",
    descriptionEn: "Description",
    category: "vma_intervals",
    sessionType: "vo2max",
    targetSystem: "vo2max",
    difficulty: "intermediate",
    typicalDuration: { min: 30, max: 60 },
    environment: { requiresHills: false, requiresTrack: false },
    warmupTemplate: [],
    mainSetTemplate: [],
    cooldownTemplate: [],
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

describe("getWorkoutPhaseSteps", () => {
  test("converts legacy sets and repetitions into nested repeat steps", () => {
    const workout = makeWorkout({
      mainSetTemplate: [
        {
          description: "2x(3x 1min VMA / 30s récup)",
          descriptionEn: "2x(3x 1min VO2max / 30s recovery)",
          durationMin: 1,
          zone: "Z5",
          repetitions: 3,
          sets: 2,
          recovery: "30s jog Z1",
          restBetweenSets: "2min jog Z1",
        },
      ],
    });

    expect(getWorkoutPhaseSteps(workout, "main")).toEqual<WorkoutStep[]>([
      {
        kind: "repeat",
        count: 2,
        unit: "sets",
        steps: [
          {
            kind: "repeat",
            count: 3,
            unit: "reps",
            steps: [
              {
                kind: "segment",
                description: "1min VMA",
                descriptionEn: "1min VO2max",
                durationSec: 60,
                zone: "Z5",
                role: "effort",
              },
            ],
            between: [
              {
                kind: "segment",
                description: "30s jog Z1",
                durationSec: 30,
                zone: "Z1",
                role: "recovery",
              },
            ],
          },
        ],
        between: [
          {
            kind: "segment",
            description: "2min jog Z1",
            durationSec: 120,
            zone: "Z1",
            role: "recovery",
          },
        ],
      },
    ]);
  });

  test("prefers explicit structured phases when present", () => {
    const workout = makeWorkout({
      mainSetTemplate: [{ description: "legacy", durationMin: 10, zone: "Z2" }],
      mainSetStructure: [
        {
          kind: "repeat",
          count: 5,
          unit: "reps",
          steps: [
            { kind: "segment", description: "30s easy", durationSec: 30, zone: "Z1", role: "effort" },
            { kind: "segment", description: "20s tempo", durationSec: 20, zone: "Z3", role: "effort" },
            { kind: "segment", description: "10s sprint", durationSec: 10, zone: "Z6", role: "effort" },
          ],
        },
      ],
    });

    expect(getWorkoutPhaseSteps(workout, "main")).toEqual(workout.mainSetStructure);
  });
});

describe("structured workout helpers", () => {
  test("computes duration, zones and dominant zone from structured phases", () => {
    const workout = makeWorkout({
      warmupStructure: [
        { kind: "segment", description: "Warmup", durationSec: 600, zone: "Z1-Z2", role: "transition" },
      ],
      mainSetStructure: [
        {
          kind: "repeat",
          count: 5,
          unit: "reps",
          steps: [
            { kind: "segment", description: "30s easy", durationSec: 30, zone: "Z1", role: "effort" },
            { kind: "segment", description: "20s tempo", durationSec: 20, zone: "Z3", role: "effort" },
            { kind: "segment", description: "10s sprint", durationSec: 10, zone: "Z6", role: "effort" },
          ],
        },
      ],
      cooldownStructure: [
        { kind: "segment", description: "Cooldown", durationSec: 300, zone: "Z1", role: "recovery" },
      ],
    });

    expect(getStructuredWorkoutDurationMinutes(workout)).toBe(20);
    expect(getWorkoutZoneNumbers(workout)).toEqual([1, 2, 3, 6]);
    expect(getStructuredWorkoutDominantZone(workout)).toBe(6);
  });

  test("flattens nested repeats into atomic segments with repeat metadata", () => {
    const workout = makeWorkout({
      mainSetStructure: [
        {
          kind: "repeat",
          count: 2,
          unit: "sets",
          steps: [
            {
              kind: "repeat",
              count: 3,
              unit: "reps",
              steps: [
                { kind: "segment", description: "1min VMA", durationSec: 60, zone: "Z5", role: "effort" },
              ],
              between: [
                { kind: "segment", description: "30s jog", durationSec: 30, zone: "Z1", role: "recovery" },
              ],
            },
          ],
          between: [
            { kind: "segment", description: "2min jog", durationSec: 120, zone: "Z1", role: "recovery" },
          ],
        },
      ],
    });

    const segments = flattenWorkoutSegments(workout);

    expect(segments).toHaveLength(11);
    expect(segments[0]).toMatchObject({
      phase: "main",
      description: "1min VMA",
      durationSec: 60,
      setIndex: 1,
      totalSets: 2,
      repetitionIndex: 1,
      totalRepetitions: 3,
      role: "effort",
    });
    expect(segments[3]).toMatchObject({
      description: "30s jog",
      durationSec: 30,
      role: "recovery",
    });
    expect(segments[5]).toMatchObject({
      description: "2min jog",
      durationSec: 120,
      role: "recovery",
    });
    expect(segments[10]).toMatchObject({
      setIndex: 2,
      totalSets: 2,
      repetitionIndex: 3,
      totalRepetitions: 3,
    });
  });

  test("builds a compatible legacy block summary from structured steps", () => {
    const steps: WorkoutStep[] = [
      {
        kind: "repeat",
        count: 2,
        unit: "sets",
        steps: [
          {
            kind: "repeat",
            count: 3,
            unit: "reps",
            steps: [
              { kind: "segment", description: "1min VMA", durationSec: 60, zone: "Z5", role: "effort" },
            ],
            between: [
              { kind: "segment", description: "30s jog Z1", durationSec: 30, zone: "Z1", role: "recovery" },
            ],
          },
        ],
        between: [
          { kind: "segment", description: "2min jog Z1", durationSec: 120, zone: "Z1", role: "recovery" },
        ],
      },
    ];

    expect(buildLegacyBlocksFromSteps(steps)).toEqual([
      {
        description: "2x(3x 1min VMA / 30s jog Z1)",
        durationMin: 1,
        repetitions: 3,
        sets: 2,
        recovery: "30s jog Z1",
        restBetweenSets: "2min jog Z1",
        zone: "Z5",
      },
    ]);
  });

  test("normalizes and synchronizes phase structures for editing", () => {
    const workout = makeWorkout({
      warmupTemplate: [{ description: "10min easy", durationMin: 10, zone: "Z1" }],
    });

    const normalized = normalizeWorkoutStructureSource(workout);
    expect(normalized.warmupStructure).toEqual([
      { kind: "segment", description: "10min easy", durationSec: 600, role: "effort", zone: "Z1" },
    ]);

    const updated = replaceWorkoutPhaseSteps(normalized, "warmup", [
      { kind: "segment", description: "12min easy", durationSec: 720, zone: "Z1", role: "effort" },
    ]);

    expect(updated.warmupStructure).toEqual([
      { kind: "segment", description: "12min easy", durationSec: 720, zone: "Z1", role: "effort" },
    ]);
    expect(updated.warmupTemplate).toEqual([
      { description: "12min easy", durationMin: 12, zone: "Z1" },
    ]);
  });

  test("formats nested repeats with natural macro notation", () => {
    const steps: WorkoutStep[] = [
      {
        kind: "repeat",
        count: 3,
        unit: "sets",
        steps: [
          {
            kind: "repeat",
            count: 15,
            unit: "reps",
            steps: [
              { kind: "segment", description: "20s VMA", durationSec: 20, zone: "Z5", role: "effort" },
            ],
            between: [
              { kind: "segment", description: "20s footing très lent", durationSec: 20, zone: "Z1", role: "recovery" },
            ],
          },
        ],
        between: [
          { kind: "segment", description: "3min footing Z1", durationSec: 180, zone: "Z1", role: "recovery" },
        ],
      },
    ];

    expect(summarizeWorkoutSteps(steps)).toBe(`3 x (15 x 20"/20") + 3' récup`);
  });

  test("formats compound repeats with concise macro notation", () => {
    const steps: WorkoutStep[] = [
      {
        kind: "repeat",
        count: 3,
        unit: "blocks",
        steps: [
          {
            kind: "repeat",
            count: 5,
            unit: "reps",
            steps: [
              { kind: "segment", description: "30s Z1", durationSec: 30, zone: "Z1", role: "effort" },
              { kind: "segment", description: "20s Z3", durationSec: 20, zone: "Z3", role: "effort" },
              { kind: "segment", description: "10s sprint", durationSec: 10, zone: "Z6", role: "effort" },
            ],
          },
        ],
        between: [
          { kind: "segment", description: "2min footing Z1", durationSec: 120, zone: "Z1", role: "recovery" },
        ],
      },
    ];

    expect(summarizeWorkoutSteps(steps)).toBe(`3 blocs de 5 x (30" + 20" + 10") + 2' récup`);
  });
});
