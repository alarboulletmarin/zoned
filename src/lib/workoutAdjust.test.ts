/**
 * The contract of adjusting a catalogue workout (issue #130).
 *
 * Three things must hold, and each has its own describe block below:
 * values are clamped to their bounds, the source template is never written to,
 * and the session's duration follows the numbers the user moved.
 *
 * The fixture is VMA-001 as it ships — a two-level repeat with a `scaling`
 * declaration — because it is the shape every rule has something to say about.
 */

import { describe, expect, test } from "bun:test";

import type { WorkoutTemplate } from "@/types";
import { getStructuredWorkoutDurationMinutes } from "./workoutStructure";
import {
  applyAdjustments,
  createAdjustedCopy,
  getAdjustableParams,
  getHardLimits,
  hasAdjustableParams,
  mergeParamBounds,
  widenParamTo,
} from "./workoutAdjust";

// ── Fixtures ────────────────────────────────────────────────────────

/** `2×(12×30s VMA / 30s récup)`, 3min between sets, 15min warmup, 10min cooldown. */
function vma001(): WorkoutTemplate {
  return {
    id: "VMA-001",
    name: "VMA courte 30/30",
    nameEn: "Short VO2max 30/30",
    description: "Séance de VMA courte",
    descriptionEn: "Short VO2max session",
    category: "vma_intervals",
    sessionType: "vo2max",
    targetSystem: "vo2max",
    difficulty: "intermediate",
    typicalDuration: { min: 45, max: 60 },
    environment: { requiresHills: false, requiresTrack: false },
    warmupTemplate: [],
    mainSetTemplate: [],
    cooldownTemplate: [],
    warmupStructure: [
      {
        kind: "segment",
        description: "15min footing progressif",
        descriptionEn: "15min progressive jog",
        durationSec: 900,
        zone: "Z2",
        role: "effort",
      },
    ],
    mainSetStructure: [
      {
        kind: "repeat",
        count: 2,
        unit: "sets",
        steps: [
          {
            kind: "repeat",
            count: 12,
            unit: "reps",
            steps: [
              {
                kind: "segment",
                description: "30s VMA",
                descriptionEn: "30s VO2max",
                durationSec: 30,
                zone: "Z5",
                role: "effort",
              },
            ],
            between: [
              {
                kind: "segment",
                description: "30s footing Z1",
                descriptionEn: "30s jog Z1",
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
            description: "3min footing Z1",
            descriptionEn: "3min jog Z1",
            durationSec: 180,
            zone: "Z1",
            role: "recovery",
          },
        ],
      },
    ],
    cooldownStructure: [
      {
        kind: "segment",
        description: "10min retour au calme",
        descriptionEn: "10min cooldown",
        durationSec: 600,
        zone: "Z1",
        role: "effort",
      },
    ],
    coachingTips: [],
    coachingTipsEn: [],
    commonMistakes: [],
    commonMistakesEn: [],
    variationIds: [],
    selectionCriteria: {
      phases: [],
      weekPositions: [],
      relativeLoad: "high",
      tags: [],
      priorityScore: 80,
    },
    scaling: { progressionType: "reps", minValue: 8, maxValue: 14, stepSize: 2 },
  };
}

/** A `1000m` track set — the distance-driven shape, no duration anywhere. */
function distanceWorkout(): WorkoutTemplate {
  return {
    ...vma001(),
    id: "VMA-999",
    scaling: undefined,
    warmupStructure: [],
    cooldownStructure: [],
    mainSetStructure: [
      {
        kind: "repeat",
        count: 6,
        unit: "reps",
        steps: [
          {
            kind: "segment",
            description: "1000m à allure 10K",
            descriptionEn: "1000m at 10K pace",
            distanceM: 1000,
            zone: "Z4",
            role: "effort",
          },
        ],
      },
    ],
  };
}

const REPS = "main/0/0#count";
const SETS = "main/0#count";
const EFFORT = "main/0/0/0#dur";
const REP_RECOVERY = "main/0/0/b0#dur";
const SET_RECOVERY = "main/0/b0#dur";
const WARMUP = "warmup/0#dur";

// ── Reading parameters ──────────────────────────────────────────────

describe("getAdjustableParams", () => {
  test("exposes every knob of the three phases, in tree order", () => {
    const params = getAdjustableParams(vma001());

    expect(params.map((p) => p.id)).toEqual([
      WARMUP,
      SETS,
      REPS,
      EFFORT,
      REP_RECOVERY,
      SET_RECOVERY,
      "cooldown/0#dur",
    ]);
    expect(params.map((p) => p.kind)).toEqual([
      "effortDuration",
      "sets",
      "reps",
      "effortDuration",
      "recoveryDuration",
      "recoveryDuration",
      "effortDuration",
    ]);
  });

  test("names a repeat after the effort it contains", () => {
    const reps = getAdjustableParams(vma001()).find((p) => p.id === REPS);

    expect(reps?.label).toBe("30s VMA");
    expect(reps?.labelEn).toBe("30s VO2max");
  });

  test("takes the declared scaling range for the parameter it describes", () => {
    const reps = getAdjustableParams(vma001()).find((p) => p.id === REPS);

    expect(reps).toMatchObject({ value: 12, min: 8, max: 14, step: 2 });
  });

  test("derives a range for every other parameter", () => {
    const params = getAdjustableParams(vma001());

    // Sets are counts: half to one and a half, never below one.
    expect(params.find((p) => p.id === SETS)).toMatchObject({ value: 2, min: 1, max: 3, step: 1 });
    // A 30s effort moves in 5s steps, a 3min recovery in 15s ones.
    expect(params.find((p) => p.id === EFFORT)).toMatchObject({ value: 30, min: 15, max: 45, step: 5 });
    expect(params.find((p) => p.id === SET_RECOVERY)).toMatchObject({ value: 180, min: 90, max: 270, step: 15 });
  });

  test("ignores a scaling range that does not contain the prescribed value", () => {
    const workout = vma001();
    // 12 reps is outside 2..4, so this declaration is about something else.
    workout.scaling = { progressionType: "reps", minValue: 2, maxValue: 4, stepSize: 1 };

    expect(getAdjustableParams(workout).find((p) => p.id === REPS)).toMatchObject({ min: 6, max: 18 });
  });

  test("reads a duration scaling as minutes and stores it as seconds", () => {
    const workout = vma001();
    workout.mainSetStructure = [
      {
        kind: "segment",
        description: "20min au seuil",
        descriptionEn: "20min at threshold",
        durationSec: 1200,
        zone: "Z4",
        role: "effort",
      },
    ];
    workout.scaling = { progressionType: "duration", minValue: 15, maxValue: 25, stepSize: 5 };

    expect(getAdjustableParams(workout).find((p) => p.id === "main/0#dur")).toMatchObject({
      value: 1200,
      min: 900,
      max: 1500,
      step: 300,
    });
  });

  test("exposes a distance when the segment has no duration", () => {
    const params = getAdjustableParams(distanceWorkout());

    expect(params.map((p) => p.id)).toEqual(["main/0#count", "main/0/0#dist"]);
    expect(params[1]).toMatchObject({ kind: "distance", value: 1000, min: 500, max: 1500, step: 100 });
  });

  test("reports nothing to adjust on a workout with no numbers", () => {
    const empty: WorkoutTemplate = {
      ...vma001(),
      warmupStructure: [],
      mainSetStructure: [
        { kind: "segment", description: "Footing libre", descriptionEn: "Free jog", zone: "Z2" },
      ],
      cooldownStructure: [],
      warmupTemplate: [],
      mainSetTemplate: [],
      cooldownTemplate: [],
    };

    expect(hasAdjustableParams(empty)).toBe(false);
    expect(hasAdjustableParams(vma001())).toBe(true);
  });
});

// ── Bounds clamping ─────────────────────────────────────────────────

describe("applyAdjustments · bounds", () => {
  test("clamps a value above the declared maximum", () => {
    const adjusted = applyAdjustments(vma001(), { [REPS]: 40 });

    expect(readReps(adjusted)).toBe(14);
  });

  test("clamps a value below the declared minimum", () => {
    const adjusted = applyAdjustments(vma001(), { [REPS]: 0 });

    expect(readReps(adjusted)).toBe(8);
  });

  test("clamps against derived bounds when there is no scaling", () => {
    const workout = vma001();
    workout.scaling = undefined;

    expect(readReps(applyAdjustments(workout, { [REPS]: 999 }))).toBe(18);
    expect(readReps(applyAdjustments(workout, { [REPS]: -5 }))).toBe(6);
  });

  test("clamps against the bounds the caller captured, not the current value", () => {
    const source = vma001();
    const frozen = getAdjustableParams(source);
    const once = applyAdjustments(source, { [REPS]: 8 }, frozen);

    // Bounds derived from `once` would be 4..12; the captured ones still allow 14.
    expect(readReps(applyAdjustments(once, { [REPS]: 14 }, frozen))).toBe(14);
  });

  test("ignores a value addressing a parameter that does not exist", () => {
    const adjusted = applyAdjustments(vma001(), { "main/9/9#count": 3 });

    expect(adjusted).toEqual(vma001());
  });

  test("leaves untouched phases reference-equal", () => {
    const source = vma001();
    const adjusted = applyAdjustments(source, { [REPS]: 10 });

    expect(adjusted.warmupStructure).toBe(source.warmupStructure);
    expect(adjusted.cooldownStructure).toBe(source.cooldownStructure);
    expect(adjusted.mainSetStructure).not.toBe(source.mainSetStructure);
  });
});

// ── Widening past the recommendation ────────────────────────────────
//
// The bounds a parameter carries are advice, not a ceiling. A value typed by
// hand goes through as long as it is not absurd.

describe("widenParamTo", () => {
  const reps = () => getAdjustableParams(vma001()).find((p) => p.id === REPS)!;

  test("opens the range to admit a value above the recommendation", () => {
    const widened = widenParamTo(reps(), 20);

    expect(widened).toMatchObject({ min: 8, max: 20 });
  });

  test("opens it downwards too", () => {
    expect(widenParamTo(reps(), 3)).toMatchObject({ min: 3, max: 14 });
  });

  test("keeps the recommendation visible after widening", () => {
    expect(widenParamTo(reps(), 20)).toMatchObject({ recommendedMin: 8, recommendedMax: 14 });
  });

  test("refuses only what no session could be", () => {
    expect(widenParamTo(reps(), 0).min).toBe(getHardLimits("reps").min);
    expect(widenParamTo(reps(), 10_000).max).toBe(getHardLimits("reps").max);
  });

  test("lets a widened parameter carry its value through applyAdjustments", () => {
    const source = vma001();
    const params = getAdjustableParams(source).map((param) =>
      param.id === REPS ? widenParamTo(param, 20) : param,
    );

    expect(readReps(applyAdjustments(source, { [REPS]: 20 }, params))).toBe(20);
  });
});

describe("mergeParamBounds", () => {
  test("holds the captured bounds while values track the draft", () => {
    const source = vma001();
    const captured = getAdjustableParams(source);
    const adjusted = applyAdjustments(source, { [REPS]: 8 }, captured);

    const merged = mergeParamBounds(getAdjustableParams(adjusted), captured);
    expect(merged.find((p) => p.id === REPS)).toMatchObject({ value: 8, min: 8, max: 14, step: 2 });
  });

  test("stretches to show a value the step editor pushed out of range", () => {
    const source = vma001();
    const captured = getAdjustableParams(source);
    const wild = applyAdjustments(source, { [REPS]: 20 }, captured.map((p) =>
      p.id === REPS ? widenParamTo(p, 20) : p,
    ));

    const merged = mergeParamBounds(getAdjustableParams(wild), captured);
    expect(merged.find((p) => p.id === REPS)).toMatchObject({
      value: 20,
      max: 20,
      recommendedMax: 14,
    });
  });
});

// ── Immutability of the source ──────────────────────────────────────

describe("applyAdjustments · immutability", () => {
  test("leaves the source template byte-identical", () => {
    const source = vma001();
    const before = JSON.stringify(source);

    applyAdjustments(source, {
      [SETS]: 3,
      [REPS]: 14,
      [EFFORT]: 45,
      [REP_RECOVERY]: 45,
      [SET_RECOVERY]: 270,
      [WARMUP]: 1200,
    });

    expect(JSON.stringify(source)).toBe(before);
  });

  test("survives a frozen source", () => {
    const source = deepFreeze(vma001());

    expect(() => applyAdjustments(source, { [REPS]: 10 })).not.toThrow();
  });

  test("createAdjustedCopy shares no structure with its source", () => {
    const source = vma001();
    const copy = createAdjustedCopy(source, "CUSTOM-test");

    expect(copy.mainSetStructure).not.toBe(source.mainSetStructure);
    expect(copy.selectionCriteria).not.toBe(source.selectionCriteria);

    const before = JSON.stringify(source);
    copy.mainSetStructure![0].kind = "segment";
    expect(JSON.stringify(source)).toBe(before);
  });
});

// ── Duration recomputation ──────────────────────────────────────────

describe("applyAdjustments · duration", () => {
  test("recomputes the session duration after a repetition change", () => {
    const source = vma001();
    // A set is 12×30s of effort and 11 recoveries of 30s — the recovery falls
    // between repetitions, so it plays one time fewer. 15 + 2×11.5 + 3 + 10.
    expect(getStructuredWorkoutDurationMinutes(source)).toBeCloseTo(51, 5);

    // Two repetitions fewer removes 2×30s of effort and 2×30s of recovery per
    // set, twice over.
    const adjusted = applyAdjustments(source, { [REPS]: 10 });
    expect(getStructuredWorkoutDurationMinutes(adjusted)).toBeCloseTo(47, 5);
  });

  test("recomputes after an effort duration change", () => {
    // +15s on each of the 24 efforts adds 6min.
    const adjusted = applyAdjustments(vma001(), { [EFFORT]: 45 });

    expect(getStructuredWorkoutDurationMinutes(adjusted)).toBeCloseTo(57, 5);
  });

  test("recomputes after a set count change", () => {
    // A third set adds 11.5min of work and one more 3min rest between sets.
    const adjusted = applyAdjustments(vma001(), { [SETS]: 3 });

    expect(getStructuredWorkoutDurationMinutes(adjusted)).toBeCloseTo(51 + 11.5 + 3, 5);
  });

  test("recomputes a distance-driven set from its estimated pace", () => {
    const source = distanceWorkout();
    const before = getStructuredWorkoutDurationMinutes(source);
    const adjusted = applyAdjustments(source, { "main/0/0#dist": 500 });

    expect(getStructuredWorkoutDurationMinutes(adjusted)).toBeCloseTo(before / 2, 5);
  });

  test("keeps the legacy blocks in step with the tree", () => {
    const adjusted = applyAdjustments(vma001(), { [REPS]: 10 });

    expect(adjusted.mainSetTemplate[0]).toMatchObject({ repetitions: 10, sets: 2 });
  });
});

// ── Prose ───────────────────────────────────────────────────────────

describe("applyAdjustments · descriptions", () => {
  test("retimes the prose in both languages", () => {
    const adjusted = applyAdjustments(vma001(), { [EFFORT]: 45, [SET_RECOVERY]: 240 });
    const effort = effortSegment(adjusted);

    expect(effort.description).toBe("45s VMA");
    expect(effort.descriptionEn).toBe("45s VO2max");
    expect(setRecoverySegment(adjusted).description).toBe("4min footing Z1");
  });

  test("switches unit when a seconds effort grows past a minute", () => {
    const workout = vma001();
    workout.scaling = undefined;

    expect(effortSegment(applyAdjustments(workout, { [EFFORT]: 45 })).description).toBe("45s VMA");
    // 30s tops out at 45s, so reach a minute the honest way: retime the recovery.
    expect(setRecoverySegment(applyAdjustments(workout, { [SET_RECOVERY]: 90 })).description)
      .toBe("1min30 footing Z1");
  });

  test("leaves a description with no duration in it alone", () => {
    const workout = vma001();
    workout.warmupStructure = [
      {
        kind: "segment",
        description: "Footing progressif",
        descriptionEn: "Progressive jog",
        durationSec: 900,
        zone: "Z2",
        role: "effort",
      },
    ];

    const warmup = applyAdjustments(workout, { [WARMUP]: 1200 }).warmupStructure![0];
    expect(warmup).toMatchObject({ description: "Footing progressif", durationSec: 1200 });
  });

  test("scales a trail segment's climb with the effort, holding its gradient", () => {
    const workout = vma001();
    workout.scaling = undefined;
    workout.mainSetStructure = [
      {
        kind: "segment",
        description: "60s en côte",
        descriptionEn: "60s uphill",
        durationSec: 60,
        zone: "Z5",
        elevationGainM: 18,
        gradientPercent: 7,
        terrainType: "trail_runnable",
        role: "effort",
      },
    ];

    // Twice as long up the same hill is twice the climb, at the same slope.
    const segment = applyAdjustments(workout, { "main/0#dur": 90 }).mainSetStructure![0];
    expect(segment).toMatchObject({ durationSec: 90, elevationGainM: 27, gradientPercent: 7 });
  });

  test("leaves a segment with no elevation alone", () => {
    const effort = effortSegment(applyAdjustments(vma001(), { [EFFORT]: 45 }));

    expect(effort).not.toHaveProperty("elevationGainM");
  });

  test("rewrites a distance in the unit the author used", () => {
    const adjusted = applyAdjustments(distanceWorkout(), { "main/0/0#dist": 800 });
    const segment = adjusted.mainSetStructure![0];
    if (segment.kind !== "repeat" || segment.steps[0].kind !== "segment") throw new Error("shape");

    expect(segment.steps[0]).toMatchObject({ description: "800m à allure 10K", distanceM: 800 });
  });
});

// ── The copy ────────────────────────────────────────────────────────

describe("createAdjustedCopy", () => {
  test("mints an id in the custom namespace", () => {
    expect(createAdjustedCopy(vma001()).id).toStartWith("CUSTOM-");
  });

  test("records where it came from", () => {
    expect(createAdjustedCopy(vma001()).sourceWorkoutId).toBe("VMA-001");
  });

  test("keeps both languages populated", () => {
    const copy = createAdjustedCopy(vma001());

    expect(copy.name).toBe("VMA courte 30/30 (ajusté)");
    expect(copy.nameEn).toBe("Short VO2max 30/30 (adjusted)");
    expect(copy.description).toBe("Séance de VMA courte");
    expect(copy.descriptionEn).toBe("Short VO2max session");
  });

  test("stays a full template, so every other surface keeps working on it", () => {
    const copy = createAdjustedCopy(vma001());

    expect(copy.category).toBe("vma_intervals");
    expect(copy.selectionCriteria.priorityScore).toBe(80);
    expect(getStructuredWorkoutDurationMinutes(copy)).toBeCloseTo(51, 5);
  });
});

// ── Helpers ─────────────────────────────────────────────────────────

function mainSet(workout: WorkoutTemplate) {
  const sets = workout.mainSetStructure?.[0];
  if (sets?.kind !== "repeat") throw new Error("expected a repeat at the root of the main set");
  const reps = sets.steps[0];
  if (reps?.kind !== "repeat") throw new Error("expected a nested repeat");
  return { sets, reps };
}

function readReps(workout: WorkoutTemplate): number {
  return mainSet(workout).reps.count;
}

function effortSegment(workout: WorkoutTemplate) {
  const segment = mainSet(workout).reps.steps[0];
  if (segment.kind !== "segment") throw new Error("expected a segment");
  return segment;
}

function setRecoverySegment(workout: WorkoutTemplate) {
  const segment = mainSet(workout).sets.between?.[0];
  if (segment?.kind !== "segment") throw new Error("expected a between segment");
  return segment;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}
