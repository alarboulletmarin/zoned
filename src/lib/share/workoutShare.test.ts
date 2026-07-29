import { describe, expect, test } from "bun:test";

import type { WorkoutStep, WorkoutTemplate } from "@/types";
import { createEmptyWorkout } from "@/lib/customWorkoutStorage";
import { replaceWorkoutPhaseSteps } from "@/lib/workoutStructure";
import {
  decodeSharedWorkout,
  encodeSharedWorkout,
  publicWorkoutUrl,
  sharedWorkoutSteps,
  sharedWorkoutToTemplate,
  sharedWorkoutUrl,
} from "./workoutShare";

/** 20min Z2 · 2x(8x400m @105% / 1min récup) · 10min Z1 */
function buildWorkout(): WorkoutTemplate {
  const warmup: WorkoutStep[] = [
    { kind: "segment", description: "Échauffement progressif", durationSec: 1200, zone: "Z2" },
  ];
  const main: WorkoutStep[] = [
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
              vmaPercent: 105,
              role: "effort",
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
  ];
  const cooldown: WorkoutStep[] = [
    { kind: "segment", description: "Retour au calme", durationSec: 600, zone: "Z1" },
  ];

  let workout = createEmptyWorkout();
  workout = { ...workout, name: "Fractionné 8x400", nameEn: "Fractionné 8x400" };
  workout = replaceWorkoutPhaseSteps(workout, "warmup", warmup);
  workout = replaceWorkoutPhaseSteps(workout, "main", main);
  workout = replaceWorkoutPhaseSteps(workout, "cooldown", cooldown);
  return workout;
}

describe("encode/decode round-trip", () => {
  test("preserves the nested step tree", () => {
    const workout = buildWorkout();
    const payload = decodeSharedWorkout(encodeSharedWorkout(workout));
    expect(payload).not.toBeNull();

    const restored = sharedWorkoutToTemplate(payload!);
    expect(restored.name).toBe("Fractionné 8x400");
    expect(restored.warmupStructure).toEqual(workout.warmupStructure);
    expect(restored.mainSetStructure).toEqual(workout.mainSetStructure);
    expect(restored.cooldownStructure).toEqual(workout.cooldownStructure);
  });

  test("preserves rare trail fields (no silent data loss)", () => {
    let workout = createEmptyWorkout();
    workout = { ...workout, name: "Côte technique", nameEn: "Côte technique" };
    workout = replaceWorkoutPhaseSteps(workout, "main", [
      {
        kind: "segment",
        description: "Montée",
        distanceKm: 1.2,
        elevationGainM: 140,
        gradientPercent: 12,
        terrainType: "trail_technical",
        intensityType: "T",
      },
    ]);

    const payload = decodeSharedWorkout(encodeSharedWorkout(workout))!;
    expect(sharedWorkoutSteps(payload, "m")).toEqual(workout.mainSetStructure!);
  });

  test("keeps free-text zones intact", () => {
    let workout = createEmptyWorkout();
    workout = { ...workout, name: "Seuil", nameEn: "Seuil" };
    workout = replaceWorkoutPhaseSteps(workout, "main", [
      { kind: "segment", description: "Bloc", durationSec: 600, zone: "80% VMA" },
    ]);

    const payload = decodeSharedWorkout(encodeSharedWorkout(workout))!;
    expect(sharedWorkoutSteps(payload, "m")[0]).toMatchObject({ zone: "80% VMA" });
  });
});

describe("URL length", () => {
  test("a realistic nested workout stays well under 500 chars", () => {
    const url = sharedWorkoutUrl(buildWorkout());
    expect(url.length).toBeLessThan(500);
  });

  test("a simple workout stays short", () => {
    let workout = createEmptyWorkout();
    workout = { ...workout, name: "Footing 45min", nameEn: "Footing 45min" };
    workout = replaceWorkoutPhaseSteps(workout, "main", [
      { kind: "segment", description: "Footing en aisance respiratoire", durationSec: 2700, zone: "Z2" },
    ]);
    expect(sharedWorkoutUrl(workout).length).toBeLessThan(220);
  });
});

/**
 * The link handed to somebody else has to open for *them*. A custom workout
 * lives only in its author's localStorage, so `/workout/CUSTOM-x` is a dead end
 * for every other visitor — and a dead one that looks perfectly healthy to
 * whoever copied it.
 */
describe("publicWorkoutUrl", () => {
  test("points a catalogue workout at its own page", () => {
    const workout = { ...buildWorkout(), id: "VMA-001" };

    expect(publicWorkoutUrl(workout)).toEndWith("/workout/VMA-001");
  });

  test("carries a custom workout inside the link instead", () => {
    const workout = { ...buildWorkout(), id: "CUSTOM-abc123" };
    const url = publicWorkoutUrl(workout);

    expect(url).toContain("/workout/shared?d=");
    expect(url).not.toContain("CUSTOM-abc123");
  });

  test("the custom link decodes back to the same session", () => {
    const workout = { ...buildWorkout(), id: "CUSTOM-abc123" };
    const encoded = new URL(publicWorkoutUrl(workout)).searchParams.get("d")!;
    const decoded = decodeSharedWorkout(encoded);

    expect(decoded?.n).toBe(workout.name);
    expect(sharedWorkoutSteps(decoded!).main).toEqual(
      sharedWorkoutSteps(decodeSharedWorkout(encodeSharedWorkout(workout))!).main,
    );
  });
});

describe("decodeSharedWorkout rejects bad input", () => {
  const encode = (payload: unknown) =>
    Buffer.from(JSON.stringify(payload)).toString("base64url");

  test.each([
    ["a wrong version", encode({ v: 2, n: "x", m: [[0, "a"]] })],
    ["a blank name", encode({ v: 1, n: "   ", m: [[0, "a"]] })],
    ["an empty main set", encode({ v: 1, n: "x", m: [] })],
    ["a malformed step", encode({ v: 1, n: "x", m: [[0, 42]] })],
    ["an unknown step kind", encode({ v: 1, n: "x", m: [[7, "a"]] })],
    ["a repeat with no inner steps", encode({ v: 1, n: "x", m: [[1, 3, 1, []]] })],
    ["a repeat with count 0", encode({ v: 1, n: "x", m: [[1, 0, 1, [[0, "a"]]]] })],
    ["garbage", "!!!"],
  ])("returns null for %s", (_label, encoded) => {
    expect(decodeSharedWorkout(encoded)).toBeNull();
  });

  test("rejects steps nested past the depth limit", () => {
    let nested: unknown[] = [0, "deep"];
    for (let i = 0; i < 10; i++) nested = [1, 2, 1, [nested]];
    expect(decodeSharedWorkout(encode({ v: 1, n: "x", m: [nested] }))).toBeNull();
  });
});
