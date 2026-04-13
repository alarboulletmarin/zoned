import { describe, expect, test } from "bun:test";

import type { WorkoutTemplate } from "@/types";
import { transformSessionBlocks } from "./transforms";

function makeWorkout(): WorkoutTemplate {
  return {
    id: "VIS-001",
    name: "Visual test",
    nameEn: "Visual test",
    description: "desc",
    descriptionEn: "desc",
    category: "vma_intervals",
    sessionType: "vo2max",
    targetSystem: "vo2max",
    difficulty: "intermediate",
    typicalDuration: { min: 30, max: 40 },
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
              {
                kind: "segment",
                description: "1min VMA",
                durationSec: 60,
                zone: "Z5",
                role: "effort",
              },
            ],
            between: [
              {
                kind: "segment",
                description: "30s jog",
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
            description: "2min jog",
            durationSec: 120,
            zone: "Z1",
            role: "recovery",
          },
        ],
      },
    ],
  };
}

describe("transformSessionBlocks", () => {
  test("distinguishes recovery between reps and between sets", () => {
    const { segments } = transformSessionBlocks(makeWorkout());

    const repRecovery = segments.find((segment) => segment.description === "30s jog");
    const setRecovery = segments.find((segment) => segment.description === "2min jog");

    expect(repRecovery?.isSeriesRecovery).toBe(false);
    expect(setRecovery?.isSeriesRecovery).toBe(true);
  });
});
