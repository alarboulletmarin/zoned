/**
 * Unit tests for the workout schema validator.
 *
 * These run against in-memory fixtures, never against src/data; the real
 * catalogue is covered by running the script itself (`bun run
 * scripts/qa-workout-schema.ts`), which is the CI gate.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { ID_PREFIX_REGISTRY, validateCatalogue, type CatalogueFile, type Violation } from "./qa-workout-schema";

function runningTemplate(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "VMA-901",
    name: "Séance test",
    nameEn: "Test session",
    description: "Description de test",
    descriptionEn: "Test description",
    category: "vma_intervals",
    sessionType: "vo2max",
    targetSystem: "vo2max",
    difficulty: "intermediate",
    typicalDuration: { min: 40, max: 50 },
    environment: { requiresHills: false, requiresTrack: true },
    warmupTemplate: [{ description: "20min footing", descriptionEn: "20min jog", durationMin: 20, zone: "Z2" }],
    mainSetTemplate: [{ description: "10x400m", descriptionEn: "10x400m", distanceM: 400, repetitions: 10, zone: "Z5" }],
    cooldownTemplate: [{ description: "10min footing", descriptionEn: "10min jog", durationMin: 10, zone: "Z1" }],
    coachingTips: ["Astuce"],
    coachingTipsEn: ["Tip"],
    commonMistakes: ["Erreur"],
    commonMistakesEn: ["Mistake"],
    variationIds: [],
    selectionCriteria: {
      phases: ["build"],
      weekPositions: ["mid"],
      relativeLoad: "key",
      tags: ["vma"],
      priorityScore: 80,
    },
    ...overrides,
  };
}

function strengthTemplate(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "STR-901",
    kind: "strength",
    name: "Renfo test",
    nameEn: "Test strength",
    description: "Description de test",
    descriptionEn: "Test description",
    category: "runner_core",
    difficulty: "beginner",
    typicalDuration: { min: 20, max: 30 },
    equipment: ["none"],
    primaryMuscleGroups: ["core_anterior"],
    warmupBlocks: [],
    mainBlocks: [{ exerciseId: "EX-CO-001", sets: 3, reps: "30s", restBetweenSets: "45s", intensity: "endurance" }],
    cooldownBlocks: [],
    intensity: "endurance",
    coachingTips: ["Astuce"],
    coachingTipsEn: ["Tip"],
    commonMistakes: ["Erreur"],
    commonMistakesEn: ["Mistake"],
    variationIds: [],
    suitablePhases: ["base"],
    weeklyFrequencyMax: 2,
    minimumRecoveryDays: 1,
    ...overrides,
  };
}

function workoutFile(
  templates: unknown[],
  path = "src/data/workouts/vma.json",
  category = "vma_intervals",
): CatalogueFile {
  return { path, root: { category, templates } };
}

function strengthFile(
  templates: unknown[],
  path = "src/data/strength/sessions/runner_core.json",
  category = "runner_core",
): CatalogueFile {
  return { path, root: { category, templates } };
}

/**
 * The exercise library every strength fixture points into. Strength files must
 * be validated alongside it, because an absent library makes every exerciseId
 * dangle.
 */
function exerciseFile(ids: string[] = ["EX-CO-001"]): CatalogueFile {
  return {
    path: "src/data/strength/exercises/core.json",
    root: { category: "runner_core", exercises: ids.map((id) => ({ id })) },
  };
}

function fields(violations: Violation[]): string[] {
  return violations.map((violation) => violation.field);
}

describe("validateCatalogue: running templates", () => {
  test("accepts a well-formed template", () => {
    expect(validateCatalogue([workoutFile([runningTemplate()])])).toEqual([]);
  });

  test("reports a missing bilingual twin by name", () => {
    const template = runningTemplate();
    delete template.coachingTipsEn;
    const [violation] = validateCatalogue([workoutFile([template])]);
    expect(violation).toMatchObject({
      id: "VMA-901",
      field: "coachingTipsEn",
      message: "missing (required, bilingual twin of coachingTips)",
    });
  });

  test("reports bilingual arrays of unequal length", () => {
    const violations = validateCatalogue([
      workoutFile([runningTemplate({ commonMistakesEn: ["Mistake", "Extra"] })]),
    ]);
    expect(fields(violations)).toEqual(["commonMistakesEn"]);
    expect(violations[0].message).toContain("2 entries but commonMistakes has 1");
  });

  test("reports an inverted typicalDuration", () => {
    const violations = validateCatalogue([
      workoutFile([runningTemplate({ typicalDuration: { min: 60, max: 40 } })]),
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toBe("min 60 > max 40");
  });

  test("reports an invalid enum value and lists the allowed ones", () => {
    const [violation] = validateCatalogue([workoutFile([runningTemplate({ sessionType: "turbo" })])]);
    expect(violation.field).toBe("sessionType");
    expect(violation.message).toContain('"turbo" is not a valid SessionType');
    expect(violation.message).toContain("vo2max");
  });

  test("reports an unparsable zone spec, naming the block", () => {
    const template = runningTemplate();
    (template.mainSetTemplate as Record<string, unknown>[])[0].zone = "Zebra";
    const [violation] = validateCatalogue([workoutFile([template])]);
    expect(violation.field).toBe("mainSetTemplate[0].zone");
    expect(violation.message).toContain("not a parsable zone spec");
  });

  test("accepts zone spans and the Z5+ shorthand", () => {
    const template = runningTemplate();
    (template.mainSetTemplate as Record<string, unknown>[])[0].zone = "Z4→Z5+";
    expect(validateCatalogue([workoutFile([template])])).toEqual([]);
  });

  test("reports a dangling variationId", () => {
    const [violation] = validateCatalogue([
      workoutFile([runningTemplate({ variationIds: ["VMA-902"] })]),
    ]);
    expect(violation.field).toBe("variationIds[0]");
    expect(violation.message).toContain("does not resolve to any template");
  });

  test("resolves a variationId that lives in another file", () => {
    const files = [
      workoutFile([runningTemplate({ variationIds: ["STR-901"] })]),
      strengthFile([strengthTemplate()]),
      exerciseFile(),
    ];
    expect(validateCatalogue(files)).toEqual([]);
  });

  test("reports an id prefix that is not registered for the category", () => {
    const [violation] = validateCatalogue([workoutFile([runningTemplate({ id: "TMP-901" })])]);
    expect(violation.field).toBe("id");
    expect(violation.message).toBe(
      'prefix "TMP" is not registered for category "vma_intervals" (expected "VMA")',
    );
  });

  test("accepts both long_run prefixes", () => {
    const base = { category: "long_run", sessionType: "long_run", targetSystem: "aerobic_base" };
    const files = [
      workoutFile(
        [runningTemplate({ ...base, id: "LR-901" }), runningTemplate({ ...base, id: "SL-901" })],
        "src/data/workouts/long_run.json",
        "long_run",
      ),
    ];
    expect(validateCatalogue(files)).toEqual([]);
  });

  test("keys the prefix on the discipline for cycling and swimming", () => {
    const cycling = runningTemplate({ id: "CYC-901", discipline: "cycling", category: "recovery", sessionType: "recovery", targetSystem: "aerobic_base" });
    const wrong = runningTemplate({ id: "REC-901", discipline: "cycling", category: "recovery", sessionType: "recovery", targetSystem: "aerobic_base" });
    const file = { path: "src/data/workouts/cycling.json", root: { discipline: "cycling", templates: [cycling, wrong] } };
    const violations = validateCatalogue([file]);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toBe(
      'prefix "REC" is not registered for discipline "cycling" (expected "CYC")',
    );
  });

  test("reports duplicate ids across files", () => {
    const files = [
      workoutFile([runningTemplate()]),
      workoutFile([runningTemplate()], "src/data/workouts/tempo.json"),
    ];
    const violations = validateCatalogue(files);
    expect(violations).toHaveLength(2);
    expect(violations[0].message).toContain("duplicate id: declared 2 times");
    expect(violations[0].message).toContain("src/data/workouts/tempo.json");
  });

  test("reports malformed repeat nodes inside a structure", () => {
    const violations = validateCatalogue([
      workoutFile([
        runningTemplate({
          mainSetStructure: [{ kind: "repeat", count: 0, unit: "reps", steps: [] }],
        }),
      ]),
    ]);
    expect(fields(violations)).toEqual(["mainSetStructure[0].count", "mainSetStructure[0].steps"]);
  });

  test("accepts a nested repeat structure", () => {
    const violations = validateCatalogue([
      workoutFile([
        runningTemplate({
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
                  steps: [{ kind: "segment", description: "30s VMA", descriptionEn: "30s VO2max", durationSec: 30, zone: "Z5", role: "effort" }],
                  between: [{ kind: "segment", description: "30s footing", descriptionEn: "30s jog", durationSec: 30, zone: "Z1", role: "recovery" }],
                },
              ],
            },
          ],
        }),
      ]),
    ]);
    expect(violations).toEqual([]);
  });

  test("reports an inverted scaling range and a non-positive stepSize", () => {
    const violations = validateCatalogue([
      workoutFile([
        runningTemplate({ scaling: { progressionType: "reps", minValue: 12, maxValue: 8, stepSize: 0 } }),
      ]),
    ]);
    expect(fields(violations)).toEqual(["scaling.stepSize", "scaling"]);
    expect(violations[1].message).toBe("minValue 12 > maxValue 8");
  });

  test("accepts an empty selectionCriteria.phases (the manual-only opt-out)", () => {
    const template = runningTemplate({
      selectionCriteria: { phases: [], weekPositions: ["early"], relativeLoad: "light", tags: ["manual"], priorityScore: 95 },
    });
    expect(validateCatalogue([workoutFile([template])])).toEqual([]);
  });
});

describe("validateCatalogue: strength templates", () => {
  test("accepts a well-formed session", () => {
    expect(validateCatalogue([strengthFile([strengthTemplate()]), exerciseFile()])).toEqual([]);
  });

  test("reports an invalid muscle group and equipment entry", () => {
    const violations = validateCatalogue([
      strengthFile([strengthTemplate({ equipment: ["jetpack"], primaryMuscleGroups: ["biceps"] })]),
      exerciseFile(),
    ]);
    expect(fields(violations)).toEqual(["equipment[0]", "primaryMuscleGroups[0]"]);
  });

  test("reports a block whose reps is neither a count nor a hold", () => {
    const template = strengthTemplate();
    (template.mainBlocks as Record<string, unknown>[])[0].reps = null;
    const [violation] = validateCatalogue([strengthFile([template]), exerciseFile()]);
    expect(violation.field).toBe("mainBlocks[0].reps");
  });

  test("requires notesEn once notes is present", () => {
    const template = strengthTemplate();
    (template.mainBlocks as Record<string, unknown>[])[0].notes = "Gainage strict";
    const [violation] = validateCatalogue([strengthFile([template]), exerciseFile()]);
    expect(violation.field).toBe("mainBlocks[0].notesEn");
  });
});

describe("validateCatalogue: exerciseId resolution", () => {
  // docs/workout-format.md promises "it must resolve" and names this script as
  // the enforcer. Before this check the id was only tested for being a non-empty
  // string, so an invented exercise passed with 0 violations.
  test("reports a StrengthBlock pointing at an exercise that does not exist", () => {
    const template = strengthTemplate();
    (template.mainBlocks as Record<string, unknown>[])[0].exerciseId = "totally-made-up-exercise";
    const violations = validateCatalogue([strengthFile([template]), exerciseFile()]);
    expect(fields(violations)).toEqual(["mainBlocks[0].exerciseId"]);
    expect(violations[0].message).toContain("does not resolve to any exercise");
  });

  test("resolves an exerciseId declared in any exercise file", () => {
    const template = strengthTemplate({
      warmupBlocks: [{ exerciseId: "EX-MO-002", sets: 1, reps: 8, restBetweenSets: "0s", intensity: "mobility" }],
    });
    const files = [
      strengthFile([template]),
      exerciseFile(["EX-CO-001"]),
      { path: "src/data/strength/exercises/mobility.json", root: { category: "mobility", exercises: [{ id: "EX-MO-002" }] } },
    ];
    expect(validateCatalogue(files)).toEqual([]);
  });

  test("reports an exercise library whose root is not shaped like one", () => {
    const violations = validateCatalogue([
      { path: "src/data/strength/exercises/core.json", root: { category: "runner_core", templates: [] } },
    ]);
    expect(fields(violations)).toEqual(["exercises"]);
  });
});

describe("validateCatalogue: schema chosen by file location", () => {
  // Dispatching on `kind` made a session that simply forgot the discriminator
  // fall into the running schema and report ~8 unrelated violations, none of
  // them naming the actual cause.
  test("a strength session missing kind reports exactly that, once", () => {
    const template = strengthTemplate();
    delete template.kind;
    const violations = validateCatalogue([strengthFile([template]), exerciseFile()]);
    expect(fields(violations)).toEqual(["kind"]);
    expect(violations[0]).toMatchObject({ id: "STR-901" });
    expect(violations[0].message).toContain('expected "strength"');
  });

  test("a strength session with the wrong kind reports exactly that, once", () => {
    const violations = validateCatalogue([
      strengthFile([strengthTemplate({ kind: "renfo" })]),
      exerciseFile(),
    ]);
    expect(fields(violations)).toEqual(["kind"]);
    expect(violations[0].message).toContain('got "renfo"');
  });

  test("a template carrying kind under src/data/workouts/ is reported once", () => {
    const violations = validateCatalogue([workoutFile([runningTemplate({ kind: "strength" })])]);
    expect(fields(violations)).toEqual(["kind"]);
    expect(violations[0].message).toContain("src/data/strength/sessions/");
  });
});

describe("validateCatalogue: template ↔ file binding", () => {
  test("reports a template whose category contradicts its file", () => {
    const violations = validateCatalogue([
      workoutFile([runningTemplate({ id: "TMP-901", category: "tempo" })]),
    ]);
    expect(fields(violations)).toEqual(["category"]);
    expect(violations[0].message).toBe(
      '"tempo" contradicts the file, which declares category "vma_intervals"',
    );
  });

  test("reports a template that omits the discipline its file declares", () => {
    const template = runningTemplate({ id: "CYC-901", category: "recovery", sessionType: "recovery", targetSystem: "aerobic_base" });
    const violations = validateCatalogue([
      { path: "src/data/workouts/cycling.json", root: { discipline: "cycling", templates: [template] } },
    ]);
    // The id is judged against the bucket the template claims, so an omitted
    // discipline also strands the CYC prefix; both clear up with one fix.
    expect(fields(violations)).toEqual(["id", "discipline"]);
    expect(violations[1].message).toContain('missing "cycling"');
  });

  test("reports a template whose discipline contradicts its file", () => {
    const template = runningTemplate({ id: "CYC-901", discipline: "swimming", category: "recovery", sessionType: "recovery", targetSystem: "aerobic_base" });
    const violations = validateCatalogue([
      { path: "src/data/workouts/cycling.json", root: { discipline: "cycling", templates: [template] } },
    ]);
    expect(fields(violations)).toEqual(["id", "discipline"]);
    expect(violations[1].message).toBe(
      '"swimming" contradicts the file, which declares discipline "cycling"',
    );
  });

  test("reports a root category that is not a WorkoutCategory", () => {
    const violations = validateCatalogue([workoutFile([], "src/data/workouts/vma.json", "vma")]);
    expect(fields(violations)).toEqual(["root.category"]);
    expect(violations[0].message).toContain('"vma" is not a valid WorkoutCategory');
  });

  test("holds a strength file's root category to StrengthCategory", () => {
    const violations = validateCatalogue([
      { path: "src/data/strength/sessions/runner_core.json", root: { category: "endurance", templates: [] } },
    ]);
    expect(fields(violations)).toEqual(["root.category"]);
    expect(violations[0].message).toContain("is not a valid StrengthCategory");
  });

  test("reports a root discipline that is not a Discipline", () => {
    const violations = validateCatalogue([
      { path: "src/data/workouts/cycling.json", root: { discipline: "rowing", templates: [] } },
    ]);
    expect(fields(violations)).toEqual(["root.discipline"]);
  });

  test("lets a strength file host a neighbouring category: mobility.json holds prehab", () => {
    const files = [
      strengthFile(
        [strengthTemplate({ id: "STR-902", category: "prehab" })],
        "src/data/strength/sessions/mobility.json",
        "mobility",
      ),
      exerciseFile(),
    ];
    expect(validateCatalogue(files)).toEqual([]);
  });
});

describe("validateCatalogue: file selection", () => {
  test("reports only on the selected file but still resolves ids globally", () => {
    const files = [
      workoutFile([runningTemplate({ variationIds: ["STR-901"] })]),
      strengthFile([strengthTemplate({ coachingTipsEn: [] })]),
      exerciseFile(),
    ];
    const selected = validateCatalogue(files, new Set(["src/data/workouts/vma.json"]));
    expect(selected).toEqual([]);

    const all = validateCatalogue(files);
    expect(all).toHaveLength(1);
    expect(all[0].file).toBe("src/data/strength/sessions/runner_core.json");
  });

  test("reports a root missing both category and discipline", () => {
    const violations = validateCatalogue([{ path: "src/data/workouts/vma.json", root: { templates: [] } }]);
    expect(violations).toHaveLength(1);
    expect(violations[0].field).toBe("root");
  });
});

describe("CLI exit codes", () => {
  // CI gates on the exit code, not on stdout, so the codes are the contract:
  // 0 clean · 1 violations · 2 usage error.
  function run(...args: string[]): number {
    return Bun.spawnSync({
      cmd: ["bun", "run", join(import.meta.dir, "qa-workout-schema.ts"), ...args],
      cwd: join(import.meta.dir, ".."),
      stdout: "ignore",
      stderr: "ignore",
    }).exitCode;
  }

  test("exits 0 on the committed catalogue", () => {
    expect(run()).toBe(0);
  });

  test("exits 2 on a bare path, the easy typo for --file <path>", () => {
    expect(run("src/data/workouts/vma.json")).toBe(2);
  });

  test("exits 2 rather than validating user data outside src/data", () => {
    expect(run("--file", "package.json")).toBe(2);
  });
});

describe("ID_PREFIX_REGISTRY", () => {
  test("registers every catalogue bucket", () => {
    expect(Object.keys(ID_PREFIX_REGISTRY).sort()).toEqual(
      [
        "assessment",
        "cycling",
        "endurance",
        "fartlek",
        "hills",
        "long_run",
        "mixed",
        "race_pace",
        "recovery",
        "strength",
        "swimming",
        "tempo",
        "threshold",
        "trail",
        "vma_intervals",
      ].sort(),
    );
  });

  test("only long_run carries two prefixes", () => {
    const multi = Object.entries(ID_PREFIX_REGISTRY).filter(([, prefixes]) => prefixes.length > 1);
    expect(multi).toEqual([["long_run", ["LR", "SL"]]]);
  });
});
