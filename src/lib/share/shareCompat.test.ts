/**
 * Backward-compatibility guard for the share-link codec.
 *
 * `workoutShare.test.ts` only proves the codec is self-consistent: it encodes
 * with the current build and decodes with the current build, so a change to the
 * tuple layout moves both sides at once and the test stays green while every
 * link already in the wild silently decodes to something else.
 *
 * This file decodes payloads that were encoded ONCE, by an earlier build, and
 * pasted here as literals. That is the only shape of test that can fail when a
 * live link breaks, because share links are the one artefact we can never
 * migrate: they live in URLs, in messages, in bookmarks and possibly in search
 * indexes. See issue #127, "The share codec is the sharp edge".
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE LITERALS BELOW ARE FROZEN. DO NOT REGENERATE THEM.
 *
 * Each `FROZEN_*` string is a real v1 payload. If a code change makes one of
 * these tests fail, the code change is what is wrong, not the literal. Every
 * user holding such a link would get the wrong workout, or no workout at all.
 * New cases may be APPENDED; existing ones must never be edited or re-encoded.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, expect, test } from "bun:test";

import type { WorkoutStep } from "@/types";
import {
  DIFFICULTY_CODES,
  INTENSITY_CODES,
  REPEAT_UNIT_CODES,
  SESSION_TYPE_CODES,
  STEP_ROLE_CODES,
  TERRAIN_CODES,
} from "./codes";
import { decodeSharedPlan } from "./planShare";
import { decodeSharedSimulation } from "./raceSimShare";
import {
  decodeSharedWorkout,
  sharedWorkoutSteps,
  sharedWorkoutToTemplate,
} from "./workoutShare";

// ── Frozen v1 payloads ─────────────────────────────────────────────
//
// FROZEN: encoded by an earlier build, never regenerate.
// Decoded JSON, for review convenience only:
// {"v":1,"n":"Footing récupération",
//  "w":[[0,"Marche active",300,0,1]],
//  "m":[[0,"Footing en aisance respiratoire",2700,0,2,1]],
//  "cd":[[0,"Retour au calme",600,0,1,2]]}
const FROZEN_FLAT =
  "eyJ2IjoxLCJuIjoiRm9vdGluZyByw6ljdXDDqXJhdGlvbiIsInciOltbMCwiTWFyY2hlIGFjdGl2ZSIsMzAwLDAsMV1dLCJtIjpbWzAsIkZvb3RpbmcgZW4gYWlzYW5jZSByZXNwaXJhdG9pcmUiLDI3MDAsMCwyLDFdXSwiY2QiOltbMCwiUmV0b3VyIGF1IGNhbG1lIiw2MDAsMCwxLDJdXX0";

// FROZEN: encoded by an earlier build, never regenerate.
// Nested repeat-in-repeat with `between` steps at both levels:
// {"v":1,"n":"Fractionné 2x(8x400m)",
//  "w":[[0,"Échauffement progressif",1200,0,2]],
//  "m":[[1,2,2,[[1,8,1,[[0,"400m rapide",0,400,5,1,105,4]],
//                     [[0,"Récup trot",60,0,1,2]]]],
//              [[0,"3min marche",180,0,1,2]]]],
//  "cd":[[0,"Retour au calme",600,0,1]]}
const FROZEN_NESTED =
  "eyJ2IjoxLCJuIjoiRnJhY3Rpb25uw6kgMngoOHg0MDBtKSIsInciOltbMCwiw4ljaGF1ZmZlbWVudCBwcm9ncmVzc2lmIiwxMjAwLDAsMl1dLCJtIjpbWzEsMiwyLFtbMSw4LDEsW1swLCI0MDBtIHJhcGlkZSIsMCw0MDAsNSwxLDEwNSw0XV0sW1swLCJSw6ljdXAgdHJvdCIsNjAsMCwxLDJdXV1dLFtbMCwiM21pbiBtYXJjaGUiLDE4MCwwLDEsMl1dXV0sImNkIjpbWzAsIlJldG91ciBhdSBjYWxtZSIsNjAwLDAsMV1dfQ";

// FROZEN: encoded by an earlier build, never regenerate.
// Exercises the rare trailing slots (distanceKm, elevationGainM,
// gradientPercent, terrainType) and three different TERRAIN_CODES entries:
// {"v":1,"n":"Côte technique en montagne","w":[],
//  "m":[[0,"Montée technique",0,0,4,1,0,3,1.2,140,12,3],
//       [0,"Descente roulante",0,0,2,2,0,0,1.2,0,8,2],
//       [0,"Traversée mountain",0,0,0,3,0,0,2,60,0,4]],
//  "cd":[]}
const FROZEN_TRAIL =
  "eyJ2IjoxLCJuIjoiQ8O0dGUgdGVjaG5pcXVlIGVuIG1vbnRhZ25lIiwidyI6W10sIm0iOltbMCwiTW9udMOpZSB0ZWNobmlxdWUiLDAsMCw0LDEsMCwzLDEuMiwxNDAsMTIsM10sWzAsIkRlc2NlbnRlIHJvdWxhbnRlIiwwLDAsMiwyLDAsMCwxLjIsMCw4LDJdLFswLCJUcmF2ZXJzw6llIG1vdW50YWluIiwwLDAsMCwzLDAsMCwyLDYwLDAsNF1dLCJjZCI6W119";

// FROZEN: encoded by an earlier build, never regenerate.
// Free-text zone riding as a string next to a collapsed numeric zone:
// {"v":1,"n":"Seuil à 80% VMA","w":[],
//  "m":[[0,"Bloc seuil",1200,0,"80% VMA",0,0,3],
//       [0,"Bloc marathon",600,0,3,0,0,2]],
//  "cd":[]}
const FROZEN_FREETEXT_ZONE =
  "eyJ2IjoxLCJuIjoiU2V1aWwgw6AgODAlIFZNQSIsInciOltdLCJtIjpbWzAsIkJsb2Mgc2V1aWwiLDEyMDAsMCwiODAlIFZNQSIsMCwwLDNdLFswLCJCbG9jIG1hcmF0aG9uIiw2MDAsMCwzLDAsMCwyXV0sImNkIjpbXX0";

describe("frozen v1 share links still decode to the same workout", () => {
  test("a flat three-phase workout", () => {
    const payload = decodeSharedWorkout(FROZEN_FLAT);
    expect(payload).not.toBeNull();
    expect(payload!.v).toBe(1);
    expect(payload!.n).toBe("Footing récupération");

    expect(sharedWorkoutSteps(payload!, "w")).toEqual([
      { kind: "segment", description: "Marche active", durationSec: 300, zone: "Z1" },
    ] satisfies WorkoutStep[]);
    expect(sharedWorkoutSteps(payload!, "m")).toEqual([
      {
        kind: "segment",
        description: "Footing en aisance respiratoire",
        durationSec: 2700,
        zone: "Z2",
        role: "effort",
      },
    ] satisfies WorkoutStep[]);
    expect(sharedWorkoutSteps(payload!, "cd")).toEqual([
      { kind: "segment", description: "Retour au calme", durationSec: 600, zone: "Z1", role: "recovery" },
    ] satisfies WorkoutStep[]);
  });

  test("a repeat nested inside a repeat, with between-steps at both levels", () => {
    const payload = decodeSharedWorkout(FROZEN_NESTED);
    expect(payload).not.toBeNull();
    expect(payload!.n).toBe("Fractionné 2x(8x400m)");

    expect(sharedWorkoutSteps(payload!, "m")).toEqual([
      {
        kind: "repeat",
        count: 2,
        unit: "sets",
        steps: [
          {
            kind: "repeat",
            count: 8,
            unit: "reps",
            steps: [
              {
                kind: "segment",
                description: "400m rapide",
                distanceM: 400,
                zone: "Z5",
                role: "effort",
                vmaPercent: 105,
                intensityType: "I",
              },
            ],
            between: [
              { kind: "segment", description: "Récup trot", durationSec: 60, zone: "Z1", role: "recovery" },
            ],
          },
        ],
        between: [
          { kind: "segment", description: "3min marche", durationSec: 180, zone: "Z1", role: "recovery" },
        ],
      },
    ] satisfies WorkoutStep[]);
  });

  test("the rare trail slots keep their meaning", () => {
    const payload = decodeSharedWorkout(FROZEN_TRAIL);
    expect(payload).not.toBeNull();
    expect(payload!.n).toBe("Côte technique en montagne");

    expect(sharedWorkoutSteps(payload!, "m")).toEqual([
      {
        kind: "segment",
        description: "Montée technique",
        distanceKm: 1.2,
        zone: "Z4",
        role: "effort",
        intensityType: "T",
        elevationGainM: 140,
        gradientPercent: 12,
        terrainType: "trail_technical",
      },
      {
        kind: "segment",
        description: "Descente roulante",
        distanceKm: 1.2,
        zone: "Z2",
        role: "recovery",
        gradientPercent: 8,
        terrainType: "trail_runnable",
      },
      {
        kind: "segment",
        description: "Traversée mountain",
        distanceKm: 2,
        role: "transition",
        elevationGainM: 60,
        terrainType: "mountain",
      },
    ] satisfies WorkoutStep[]);
    expect(sharedWorkoutSteps(payload!, "w")).toEqual([]);
    expect(sharedWorkoutSteps(payload!, "cd")).toEqual([]);
  });

  test("a free-text zone survives next to a collapsed numeric one", () => {
    const payload = decodeSharedWorkout(FROZEN_FREETEXT_ZONE);
    expect(payload).not.toBeNull();
    expect(payload!.n).toBe("Seuil à 80% VMA");

    expect(sharedWorkoutSteps(payload!, "m")).toEqual([
      { kind: "segment", description: "Bloc seuil", durationSec: 1200, zone: "80% VMA", intensityType: "T" },
      { kind: "segment", description: "Bloc marathon", durationSec: 600, zone: "Z3", intensityType: "M" },
    ] satisfies WorkoutStep[]);
  });

  test("a frozen link still rebuilds an importable template", () => {
    const payload = decodeSharedWorkout(FROZEN_NESTED)!;
    const template = sharedWorkoutToTemplate(payload);

    expect(template.name).toBe("Fractionné 2x(8x400m)");
    expect(template.nameEn).toBe("Fractionné 2x(8x400m)");
    expect(template.mainSetStructure).toEqual(sharedWorkoutSteps(payload, "m"));
    // The legacy block mirror must be populated too; consumers still read it.
    expect(template.mainSetTemplate.length).toBeGreaterThan(0);
  });
});

// ── Wire code tables ───────────────────────────────────────────────
//
// These tables encode by ARRAY INDEX, so the index is part of the wire format.
// Appending an entry is safe; inserting, reordering or removing one silently
// re-labels every link already shared. Each literal below is the frozen prefix
// as shipped; assertions allow growth at the tail and nothing else.
//
// If one of these tests fails, do not update the literal: put the new entry at
// the END of the table in `codes.ts` instead.

describe("share wire codes are append-only", () => {
  test.each([
    ["SESSION_TYPE_CODES", SESSION_TYPE_CODES as readonly string[], [
      "recovery",
      "endurance",
      "tempo",
      "threshold",
      "vo2max",
      "speed",
      "long_run",
      "hills",
      "fartlek",
      "race_specific",
      "strength",
      "cycling",
      "swimming",
      "yoga",
      "rest",
      "rest_day",
      "cross_training",
    ]],
    ["STEP_ROLE_CODES", STEP_ROLE_CODES as readonly string[], ["effort", "recovery", "transition"]],
    ["REPEAT_UNIT_CODES", REPEAT_UNIT_CODES as readonly string[], ["reps", "sets", "blocks"]],
    ["INTENSITY_CODES", INTENSITY_CODES as readonly string[], ["E", "M", "T", "I", "R"]],
    ["TERRAIN_CODES", TERRAIN_CODES as readonly string[], [
      "road",
      "trail_runnable",
      "trail_technical",
      "mountain",
    ]],
    ["DIFFICULTY_CODES", DIFFICULTY_CODES as readonly string[], [
      "beginner",
      "intermediate",
      "advanced",
      "elite",
    ]],
  ])("%s keeps its frozen prefix", (_name, table, frozen) => {
    expect(table.length).toBeGreaterThanOrEqual(frozen.length);
    expect(table.slice(0, frozen.length)).toEqual(frozen);
  });
});

// ── Plan and race-simulation links ─────────────────────────────────
//
// `/plan/shared` and `/race-simulator/shared` carry their own index-coded
// tables, which live in `planShare.ts` (RACE_DISTANCES, GOALS, PURPOSES,
// LEVELS) and `raceSimShare.ts` (STRATEGY_CODES) rather than in `codes.ts`.
// The append-only guard above does not see them, and both round-trip suites
// encode and decode with the same build, so a reorder there is invisible.
// These frozen payloads are the only thing standing between a table edit and
// every plan link in the wild quietly changing race distance.

// FROZEN: never regenerate.
// {"v":1,"rd":3,"rdt":"2026-04-12","lvl":2,"dpw":5,"lrd":6,"g":2,"p":2,
//  "vma":16.5,"sd":"2026-01-05","str":1,"sf":1,"rn":"Semi de Paris"}
const FROZEN_PLAN_SEMI =
  "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsImciOjIsInAiOjIsInZtYSI6MTYuNSwic2QiOiIyMDI2LTAxLTA1Iiwic3RyIjoxLCJzZiI6MSwicm4iOiJTZW1pIGRlIFBhcmlzIn0";

// FROZEN: never regenerate.
// Rides the LAST entry of every table (ultra / elite / compete /
// beginner_start), so a value appended in front of them also trips this.
// {"v":1,"rd":7,"rdt":"2026-09-05","lvl":4,"dpw":6,"lrd":0,"g":3,"p":4,
//  "tp":4.5,"eg":3200,"tw":20,"wk":80,"lr":32}
const FROZEN_PLAN_ULTRA =
  "eyJ2IjoxLCJyZCI6NywicmR0IjoiMjAyNi0wOS0wNSIsImx2bCI6NCwiZHB3Ijo2LCJscmQiOjAsImciOjMsInAiOjQsInRwIjo0LjUsImVnIjozMjAwLCJ0dyI6MjAsIndrIjo4MCwibHIiOjMyfQ";

// FROZEN: never regenerate.
// {"v":1,"d":42.195,"t":12600,"s":510,"st":2,"w":68}
const FROZEN_SIM_NEGATIVE = "eyJ2IjoxLCJkIjo0Mi4xOTUsInQiOjEyNjAwLCJzIjo1MTAsInN0IjoyLCJ3Ijo2OH0";

// FROZEN: never regenerate. Tail of STRATEGY_CODES, midnight start, no weight.
// {"v":1,"d":10,"t":2400,"s":0,"st":3}
const FROZEN_SIM_POSITIVE = "eyJ2IjoxLCJkIjoxMCwidCI6MjQwMCwicyI6MCwic3QiOjN9";

// FROZEN: never regenerate.
// {"v":1,"d":21.0975,"t":5400,"s":600,"st":1}
const FROZEN_SIM_EVEN = "eyJ2IjoxLCJkIjoyMS4wOTc1LCJ0Ijo1NDAwLCJzIjo2MDAsInN0IjoxfQ";

describe("frozen v1 plan links still decode to the same config", () => {
  test("a semi-marathon config keeps every field it carried", () => {
    expect(decodeSharedPlan(FROZEN_PLAN_SEMI)).toEqual({
      planMode: "assisted",
      raceDistance: "semi",
      raceDate: "2026-04-12",
      runnerLevel: "intermediate",
      daysPerWeek: 5,
      longRunDay: 6,
      trainingGoal: "time",
      planPurpose: "base_building",
      vma: 16.5,
      startDate: "2026-01-05",
      includeStrength: true,
      strengthFrequency: 1,
      raceName: "Semi de Paris",
    });
  });

  test("the last entry of every plan table keeps its index", () => {
    expect(decodeSharedPlan(FROZEN_PLAN_ULTRA)).toEqual({
      planMode: "assisted",
      raceDistance: "ultra",
      raceDate: "2026-09-05",
      runnerLevel: "elite",
      daysPerWeek: 6,
      longRunDay: 0,
      trainingGoal: "compete",
      planPurpose: "beginner_start",
      targetPaceMinKm: 4.5,
      elevationGain: 3200,
      totalWeeksOverride: 20,
      currentWeeklyKm: 80,
      currentLongRunKm: 32,
    });
  });

  // One frozen payload per slot of every plan table. Pinning only a couple of
  // values would leave the untouched indexes free to be swapped, so each index
  // gets its own link, and this is what makes a reorder anywhere in
  // RACE_DISTANCES / LEVELS / GOALS / PURPOSES fail.
  // FROZEN: never regenerate any literal below.
  test.each([
    ["5K", "eyJ2IjoxLCJyZCI6MSwicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { raceDistance: "5K" }],
    ["10K", "eyJ2IjoxLCJyZCI6MiwicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { raceDistance: "10K" }],
    ["semi", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { raceDistance: "semi" }],
    ["marathon", "eyJ2IjoxLCJyZCI6NCwicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { raceDistance: "marathon" }],
    ["trail_short", "eyJ2IjoxLCJyZCI6NSwicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { raceDistance: "trail_short" }],
    ["trail", "eyJ2IjoxLCJyZCI6NiwicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { raceDistance: "trail" }],
    ["ultra", "eyJ2IjoxLCJyZCI6NywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { raceDistance: "ultra" }],
    ["beginner", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MSwiZHB3Ijo1LCJscmQiOjZ9", { runnerLevel: "beginner" }],
    ["intermediate", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjZ9", { runnerLevel: "intermediate" }],
    ["advanced", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MywiZHB3Ijo1LCJscmQiOjZ9", { runnerLevel: "advanced" }],
    ["elite", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6NCwiZHB3Ijo1LCJscmQiOjZ9", { runnerLevel: "elite" }],
    ["finish", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsImciOjF9", { trainingGoal: "finish" }],
    ["time", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsImciOjJ9", { trainingGoal: "time" }],
    ["compete", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsImciOjN9", { trainingGoal: "compete" }],
    ["race", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsInAiOjF9", { planPurpose: "race" }],
    ["base_building", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsInAiOjJ9", { planPurpose: "base_building" }],
    ["return_from_injury", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsInAiOjN9", { planPurpose: "return_from_injury" }],
    ["beginner_start", "eyJ2IjoxLCJyZCI6MywicmR0IjoiMjAyNi0wNC0xMiIsImx2bCI6MiwiZHB3Ijo1LCJscmQiOjYsInAiOjR9", { planPurpose: "beginner_start" }],
  ])("the frozen code for %s still decodes to it", (_label, encoded, expected) => {
    expect(decodeSharedPlan(encoded)).toMatchObject(expected);
  });
});

describe("frozen v1 race-simulation links still decode to the same inputs", () => {
  test.each([
    [
      "a negative-split marathon",
      FROZEN_SIM_NEGATIVE,
      {
        distanceKm: 42.195,
        targetTimeSeconds: 12600,
        startTime: "08:30",
        strategy: "negative",
        bodyWeightKg: 68,
      },
    ],
    [
      "a positive-split 10K starting at midnight",
      FROZEN_SIM_POSITIVE,
      { distanceKm: 10, targetTimeSeconds: 2400, startTime: "00:00", strategy: "positive" },
    ],
    [
      "an even-paced half",
      FROZEN_SIM_EVEN,
      { distanceKm: 21.0975, targetTimeSeconds: 5400, startTime: "10:00", strategy: "even" },
    ],
  ])("%s", (_label, encoded, expected) => {
    expect(decodeSharedSimulation(encoded)).toEqual(expected);
  });
});

describe("the v1 decoder stays reachable", () => {
  test("v: 1 is still accepted; bumping the version must keep this decoder", () => {
    // Every link ever shared carries v: 1. A future v: 2 format may be added,
    // but the v1 branch can never be deleted.
    expect(decodeSharedWorkout(FROZEN_FLAT)).not.toBeNull();
    expect(decodeSharedPlan(FROZEN_PLAN_SEMI)).not.toBeNull();
    expect(decodeSharedSimulation(FROZEN_SIM_NEGATIVE)).not.toBeNull();
  });
});
