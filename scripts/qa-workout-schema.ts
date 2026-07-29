/**
 * QA audit: schema contract for every workout template committed on disk.
 *
 * Invariants checked, per template:
 *   1. every required WorkoutTemplate / StrengthWorkoutTemplate field is present
 *      and correctly typed;
 *   2. every enum-typed field holds a value its TS union allows;
 *   3. `id` is unique across the whole catalogue (running + cycling + swimming +
 *      strength) and carries a prefix registered for its bucket, listed in
 *      ID_PREFIX_REGISTRY;
 *   4. every cross-reference resolves: `variationIds` entries against the
 *      template catalogue, `StrengthBlock.exerciseId` against the exercise
 *      library in `src/data/strength/exercises/`;
 *   5. both language variants are present and non-empty, and the array-typed
 *      pairs (coachingTips / commonMistakes) have equal length;
 *   6. `typicalDuration.min <= typicalDuration.max`, both positive and finite;
 *   7. every zone spec parses through `parseZoneSpan` (the single zone parser);
 *   8. `scaling`, when present, has minValue <= maxValue and a positive stepSize;
 *   9. `*Structure` fields, when present, are well-formed WorkoutStep trees;
 *  10. the template agrees with the file holding it: the root `category` /
 *      `discipline` is itself a valid union member, and every template repeats
 *      the value its file declares, except in `src/data/strength/sessions/`,
 *      where a file may host a neighbouring category (see `checkFileBinding`).
 *
 * Which schema a template is held to is decided by the file's LOCATION, not by
 * the template's own `kind`: `src/data/strength/sessions/` is the strength
 * schema, `src/data/workouts/` the running one. Dispatching on `kind` would
 * make a session that simply forgot the discriminator fail as a malformed
 * running template: a page of unrelated violations instead of the one that
 * matters.
 *
 * Scope: this script reads nothing outside `src/data/`. It is strict by
 * design, which makes it the wrong tool for user-authored data: saved plans,
 * custom workouts and share-link payloads come from older releases and are
 * read through the tolerant normalisers in `src/lib`, never through a schema
 * gate. A `--file` argument resolving outside `src/data/` is rejected instead
 * of validated.
 *
 * Like qa-zone-audit.ts, this imports only from `src/types`, nothing that
 * pulls in i18n, which needs Vite.
 *
 * Usage:
 *   bun run scripts/qa-workout-schema.ts                                    # whole catalogue (CI gate)
 *   bun run scripts/qa-workout-schema.ts --file src/data/workouts/vma.json  # one file
 *   bun run scripts/qa-workout-schema.ts --json                             # machine-readable
 *
 * Exit codes: 0 clean · 1 violations found · 2 usage error.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import {
  CATEGORY_META,
  DIFFICULTY_META,
  DISCIPLINES,
  parseZoneSpan,
} from "../src/types";
import type {
  MuscleGroup,
  RelativeLoad,
  ScalingType,
  SessionType,
  StrengthCategory,
  StrengthEquipment,
  StrengthIntensity,
  TargetSystem,
  TerrainType,
  TrainingPhase,
  WeekPosition,
  WorkoutRepeatUnit,
  WorkoutStepRole,
} from "../src/types";

const REPO_ROOT = join(import.meta.dir, "..");
const DATA_DIR = join(REPO_ROOT, "src", "data");
const WORKOUT_DIR = join(DATA_DIR, "workouts");
const STRENGTH_SESSION_DIR = join(DATA_DIR, "strength", "sessions");
const EXERCISE_DIR = join(DATA_DIR, "strength", "exercises");

/**
 * What a catalogue file holds, derived from its repo-relative path. See the
 * header: location decides the schema, never the template's own `kind`.
 */
export type FileKind = "running" | "strength" | "exercises";

const STRENGTH_SESSION_PREFIX = "src/data/strength/sessions/";
const EXERCISE_PREFIX = "src/data/strength/exercises/";

export function fileKindOf(path: string): FileKind {
  if (path.startsWith(EXERCISE_PREFIX)) return "exercises";
  if (path.startsWith(STRENGTH_SESSION_PREFIX)) return "strength";
  return "running";
}

// ── Allowed values ────────────────────────────────────────────────
// Unions that ship a Record keyed by the union are read from it, so the set
// can never drift. Bare unions cannot be introspected at runtime, so they are
// mirrored through a Record<Union, true>: adding a member to the type without
// adding it here fails `tsc`.

function unionSet<T extends string>(members: Record<T, true>): ReadonlySet<string> {
  return new Set(Object.keys(members));
}

/** Derived from CATEGORY_META, which is Record<WorkoutCategory, …>. */
const WORKOUT_CATEGORIES: ReadonlySet<string> = new Set(Object.keys(CATEGORY_META));

/** Derived from DIFFICULTY_META, which is Record<Difficulty, …>. */
const DIFFICULTIES: ReadonlySet<string> = new Set(Object.keys(DIFFICULTY_META));

/** Derived from the exported DISCIPLINES tuple. */
const DISCIPLINE_VALUES: ReadonlySet<string> = new Set(DISCIPLINES);

/** Mirrors SessionType in src/types/index.ts. */
const SESSION_TYPES = unionSet<SessionType>({
  recovery: true,
  endurance: true,
  tempo: true,
  threshold: true,
  vo2max: true,
  speed: true,
  long_run: true,
  hills: true,
  fartlek: true,
  race_specific: true,
  strength: true,
  cycling: true,
  swimming: true,
  yoga: true,
  rest: true,
  rest_day: true,
  cross_training: true,
});

/** Mirrors TargetSystem in src/types/index.ts. */
const TARGET_SYSTEMS = unionSet<TargetSystem>({
  aerobic_base: true,
  aerobic_power: true,
  aerobic_threshold: true,
  lactate_threshold: true,
  lactate_tolerance: true,
  mixed: true,
  neuromuscular: true,
  vo2max: true,
  speed: true,
  strength: true,
  race_specific: true,
});

/** Mirrors TrainingPhase in src/types/index.ts. */
const TRAINING_PHASES = unionSet<TrainingPhase>({
  base: true,
  build: true,
  peak: true,
  taper: true,
  recovery: true,
});

/** Mirrors WeekPosition in src/types/index.ts. */
const WEEK_POSITIONS = unionSet<WeekPosition>({ early: true, mid: true, late: true });

/** Mirrors RelativeLoad in src/types/index.ts. */
const RELATIVE_LOADS = unionSet<RelativeLoad>({
  light: true,
  moderate: true,
  hard: true,
  key: true,
});

/** Mirrors ScalingType in src/types/index.ts. */
const SCALING_TYPES = unionSet<ScalingType>({
  reps: true,
  duration: true,
  distance: true,
  sets: true,
});

/** Mirrors WorkoutRepeatUnit in src/types/index.ts. */
const REPEAT_UNITS = unionSet<WorkoutRepeatUnit>({ reps: true, sets: true, blocks: true });

/** Mirrors WorkoutStepRole in src/types/index.ts. */
const STEP_ROLES = unionSet<WorkoutStepRole>({
  effort: true,
  recovery: true,
  transition: true,
});

/** Mirrors TerrainType in src/types/index.ts. */
const TERRAIN_TYPES = unionSet<TerrainType>({
  road: true,
  trail_runnable: true,
  trail_technical: true,
  mountain: true,
});

/** Mirrors the Daniels intensity union on WorkoutBlock / WorkoutStepSegment. */
const INTENSITY_TYPES: ReadonlySet<string> = new Set(["E", "M", "T", "I", "R"]);

/** Mirrors StrengthCategory in src/types/strength.ts. */
const STRENGTH_CATEGORIES = unionSet<StrengthCategory>({
  runner_full_body: true,
  runner_lower: true,
  runner_core: true,
  runner_upper: true,
  plyometrics: true,
  mobility: true,
  prehab: true,
});

/** Mirrors StrengthEquipment in src/types/strength.ts. */
const STRENGTH_EQUIPMENT = unionSet<StrengthEquipment>({
  none: true,
  resistance_band: true,
  dumbbells: true,
  kettlebell: true,
  barbell: true,
  pull_up_bar: true,
  box: true,
  foam_roller: true,
  medicine_ball: true,
});

/** Mirrors MuscleGroup in src/types/strength.ts. */
const MUSCLE_GROUPS = unionSet<MuscleGroup>({
  quadriceps: true,
  hamstrings: true,
  glutes: true,
  calves: true,
  hip_flexors: true,
  adductors: true,
  core_anterior: true,
  core_lateral: true,
  core_posterior: true,
  upper_back: true,
  shoulders: true,
  chest: true,
});

/** Mirrors StrengthIntensity in src/types/strength.ts. */
const STRENGTH_INTENSITIES = unionSet<StrengthIntensity>({
  mobility: true,
  endurance: true,
  hypertrophy: true,
  strength: true,
  power: true,
});

/**
 * Registered id prefixes, keyed by the bucket a template belongs to:
 *   · its WorkoutCategory for running templates;
 *   · its Discipline for cycling and swimming, whose files hold several
 *     categories under one prefix;
 *   · "strength" for the STR sessions.
 *
 * Measured from src/data; this table is the reference CONTRIBUTING.md cites.
 * `long_run` legitimately accepts two prefixes: LR and the older SL.
 */
export const ID_PREFIX_REGISTRY: Readonly<Record<string, readonly string[]>> = {
  assessment: ["ASS"],
  endurance: ["END"],
  fartlek: ["FAR"],
  hills: ["HIL"],
  long_run: ["LR", "SL"],
  mixed: ["MIX"],
  race_pace: ["RP"],
  recovery: ["REC"],
  tempo: ["TMP"],
  threshold: ["THR"],
  trail: ["TRL"],
  vma_intervals: ["VMA"],
  cycling: ["CYC"],
  swimming: ["SWM"],
  strength: ["STR"],
};

const ID_FORMAT = /^[A-Z]+-\d+$/;

// ── Reporting primitives ──────────────────────────────────────────

export interface Violation {
  /** Repo-relative path of the file the template lives in. */
  file: string;
  /** Template id, or "<no id>" when the template does not declare one. */
  id: string;
  /** Dotted path of the offending field, e.g. `mainSetTemplate[2].zone`. */
  field: string;
  /** What was expected, phrased so the JSON can be fixed without reading src. */
  message: string;
}

type Report = (id: string, field: string, message: string) => void;

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function typeName(value: unknown): string {
  if (value === undefined) return "nothing";
  if (value === null) return "null";
  if (Array.isArray(value)) return "an array";
  return `a ${typeof value}`;
}

function list(values: ReadonlySet<string> | readonly string[]): string {
  return [...values].join(", ");
}

// ── Field checkers ────────────────────────────────────────────────

function checkString(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  hint = "required",
): void {
  if (value === undefined || value === null) {
    report(id, field, `missing (${hint})`);
    return;
  }
  if (typeof value !== "string") {
    report(id, field, `expected a string, got ${typeName(value)}`);
    return;
  }
  if (value.trim() === "") report(id, field, `empty (${hint})`);
}

/** Returns the array when the field is one, so callers can compare lengths. */
function checkStringArray(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  hint = "required",
): unknown[] | null {
  if (value === undefined || value === null) {
    report(id, field, `missing (${hint})`);
    return null;
  }
  if (!Array.isArray(value)) {
    report(id, field, `expected an array of strings, got ${typeName(value)}`);
    return null;
  }
  value.forEach((entry, index) => {
    if (typeof entry !== "string") {
      report(id, `${field}[${index}]`, `expected a string, got ${typeName(entry)}`);
    } else if (entry.trim() === "") {
      report(id, `${field}[${index}]`, "empty string");
    }
  });
  return value;
}

function checkEnum(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  allowed: ReadonlySet<string>,
  unionName: string,
): void {
  if (value === undefined || value === null) {
    report(id, field, `missing (required ${unionName})`);
    return;
  }
  if (typeof value !== "string") {
    report(id, field, `expected a ${unionName} string, got ${typeName(value)}`);
    return;
  }
  if (!allowed.has(value)) {
    report(id, field, `"${value}" is not a valid ${unionName} (expected one of: ${list(allowed)})`);
  }
}

function checkOptionalEnum(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  allowed: ReadonlySet<string>,
  unionName: string,
): void {
  if (value === undefined || value === null) return;
  checkEnum(report, id, field, value, allowed, unionName);
}

/**
 * An empty array is accepted: the types say `TrainingPhase[]`, not "at least
 * one". REC-003 relies on that: `phases: []` plus the `manual` tag is how a
 * template opts out of automatic plan selection (see selector.ts).
 */
function checkEnumArray(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  allowed: ReadonlySet<string>,
  unionName: string,
): void {
  if (value === undefined || value === null) {
    report(id, field, `missing (required ${unionName}[])`);
    return;
  }
  if (!Array.isArray(value)) {
    report(id, field, `expected a ${unionName}[] array, got ${typeName(value)}`);
    return;
  }
  value.forEach((entry, index) =>
    checkEnum(report, id, `${field}[${index}]`, entry, allowed, unionName),
  );
}

interface NumberRule {
  required?: boolean;
  integer?: boolean;
  min?: number;
  max?: number;
  /** Value must be strictly greater than this. */
  exclusiveMin?: number;
}

function checkNumber(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  rule: NumberRule = {},
): void {
  const { required = false, integer = false, min, max, exclusiveMin } = rule;
  if (value === undefined || value === null) {
    if (required) report(id, field, "missing (required number)");
    return;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    report(id, field, `expected a finite number, got ${typeName(value)}`);
    return;
  }
  if (integer && !Number.isInteger(value)) {
    report(id, field, `expected a whole number, got ${value}`);
    return;
  }
  if (exclusiveMin !== undefined && value <= exclusiveMin) {
    report(id, field, `expected > ${exclusiveMin}, got ${value}`);
    return;
  }
  if (min !== undefined && value < min) {
    report(id, field, `expected >= ${min}, got ${value}`);
    return;
  }
  if (max !== undefined && value > max) report(id, field, `expected <= ${max}, got ${value}`);
}

/** `{ min, max }` pair: DurationRange, reused by estimatedDistanceKm. */
function checkRange(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  required: boolean,
): void {
  if (value === undefined || value === null) {
    if (required) report(id, field, "missing (required { min, max })");
    return;
  }
  if (!isRecord(value)) {
    report(id, field, `expected { min, max }, got ${typeName(value)}`);
    return;
  }
  checkNumber(report, id, `${field}.min`, value.min, { required: true, exclusiveMin: 0 });
  checkNumber(report, id, `${field}.max`, value.max, { required: true, exclusiveMin: 0 });
  const { min, max } = value;
  if (typeof min === "number" && typeof max === "number" && min > max) {
    report(id, field, `min ${min} > max ${max}`);
  }
}

/**
 * Zone specs go through parseZoneSpan, the single zone parser in src/types.
 * Never re-implement it here: a second parser is how the phase badge and the
 * zone breakdown started disagreeing.
 */
function checkZone(report: Report, id: string, field: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (typeof value !== "string") {
    report(id, field, `expected a zone spec string, got ${typeName(value)}`);
    return;
  }
  if (!parseZoneSpan(value)) {
    report(id, field, `"${value}" is not a parsable zone spec (expected e.g. "Z2", "Z4-Z5", "Z5+")`);
  }
}

/**
 * Bilingual scalar pair: `key` + `keyEn` on `source`. `path` is how the field
 * is named in the report, which differs from the key inside blocks and steps.
 *
 * The English twin is required everywhere in committed data, including where
 * the TS type marks it optional; the catalogue is French-first, never
 * French-only.
 */
function checkBilingual(report: Report, id: string, source: Json, key: string, path = key): void {
  checkString(report, id, path, source[key]);
  checkString(report, id, `${path}En`, source[`${key}En`], `required, bilingual twin of ${path}`);
}

/** Bilingual array pair: both required, and of equal length. */
function checkBilingualArray(report: Report, id: string, field: string, source: Json): void {
  const fr = checkStringArray(report, id, field, source[field]);
  const en = checkStringArray(
    report,
    id,
    `${field}En`,
    source[`${field}En`],
    `required, bilingual twin of ${field}`,
  );
  if (fr && en && fr.length !== en.length) {
    report(
      id,
      `${field}En`,
      `has ${en.length} ${en.length === 1 ? "entry" : "entries"} but ${field} has ${fr.length}; bilingual arrays must match one for one`,
    );
  }
}

function checkVariationIds(
  report: Report,
  id: string,
  value: unknown,
  knownIds: ReadonlySet<string>,
): void {
  const entries = checkStringArray(report, id, "variationIds", value);
  if (!entries) return;
  entries.forEach((entry, index) => {
    if (typeof entry !== "string") return; // already reported
    if (!knownIds.has(entry)) {
      report(
        id,
        `variationIds[${index}]`,
        `"${entry}" does not resolve to any template in the catalogue`,
      );
    }
  });
}

// ── Block / step checkers ─────────────────────────────────────────

function checkWorkoutBlocks(report: Report, id: string, field: string, value: unknown): void {
  if (!Array.isArray(value)) {
    report(id, field, `missing or not an array (required WorkoutBlock[], got ${typeName(value)})`);
    return;
  }
  value.forEach((block, index) => {
    const at = `${field}[${index}]`;
    if (!isRecord(block)) {
      report(id, at, `expected a WorkoutBlock object, got ${typeName(block)}`);
      return;
    }
    checkBilingual(report, id, block, "description", `${at}.description`);
    checkZone(report, id, `${at}.zone`, block.zone);
    checkNumber(report, id, `${at}.durationMin`, block.durationMin, { exclusiveMin: 0 });
    checkNumber(report, id, `${at}.repetitions`, block.repetitions, { integer: true, min: 1 });
    checkNumber(report, id, `${at}.sets`, block.sets, { integer: true, min: 1 });
    checkNumber(report, id, `${at}.distanceM`, block.distanceM, { exclusiveMin: 0 });
    checkNumber(report, id, `${at}.distanceKm`, block.distanceKm, { exclusiveMin: 0 });
    checkNumber(report, id, `${at}.vmaPercent`, block.vmaPercent, { exclusiveMin: 0 });
    checkOptionalEnum(report, id, `${at}.intensityType`, block.intensityType, INTENSITY_TYPES, "intensityType");
    checkOptionalEnum(report, id, `${at}.terrainType`, block.terrainType, TERRAIN_TYPES, "TerrainType");
  });
}

function checkWorkoutSteps(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  requireNonEmpty = false,
): void {
  if (!Array.isArray(value)) {
    report(id, field, `expected a WorkoutStep[] array, got ${typeName(value)}`);
    return;
  }
  if (requireNonEmpty && value.length === 0) {
    report(id, field, "empty (a repeat node needs at least one step)");
    return;
  }
  value.forEach((step, index) => {
    const at = `${field}[${index}]`;
    if (!isRecord(step)) {
      report(id, at, `expected a WorkoutStep object, got ${typeName(step)}`);
      return;
    }

    if (step.kind === "repeat") {
      checkNumber(report, id, `${at}.count`, step.count, { required: true, integer: true, min: 1 });
      checkOptionalEnum(report, id, `${at}.unit`, step.unit, REPEAT_UNITS, "WorkoutRepeatUnit");
      checkWorkoutSteps(report, id, `${at}.steps`, step.steps, true);
      if (step.between !== undefined) checkWorkoutSteps(report, id, `${at}.between`, step.between);
      return;
    }

    if (step.kind === "segment") {
      checkBilingual(report, id, step, "description", `${at}.description`);
      checkZone(report, id, `${at}.zone`, step.zone);
      checkOptionalEnum(report, id, `${at}.role`, step.role, STEP_ROLES, "WorkoutStepRole");
      checkOptionalEnum(report, id, `${at}.intensityType`, step.intensityType, INTENSITY_TYPES, "intensityType");
      checkOptionalEnum(report, id, `${at}.terrainType`, step.terrainType, TERRAIN_TYPES, "TerrainType");
      checkNumber(report, id, `${at}.durationSec`, step.durationSec, { exclusiveMin: 0 });
      checkNumber(report, id, `${at}.distanceM`, step.distanceM, { exclusiveMin: 0 });
      checkNumber(report, id, `${at}.distanceKm`, step.distanceKm, { exclusiveMin: 0 });
      checkNumber(report, id, `${at}.vmaPercent`, step.vmaPercent, { exclusiveMin: 0 });
      return;
    }

    report(
      id,
      `${at}.kind`,
      `"${String(step.kind)}" is not a valid WorkoutStep kind (expected "segment" or "repeat")`,
    );
  });
}

function checkStrengthBlocks(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  exerciseIds: ReadonlySet<string>,
): void {
  if (!Array.isArray(value)) {
    report(id, field, `missing or not an array (required StrengthBlock[], got ${typeName(value)})`);
    return;
  }
  value.forEach((block, index) => {
    const at = `${field}[${index}]`;
    if (!isRecord(block)) {
      report(id, at, `expected a StrengthBlock object, got ${typeName(block)}`);
      return;
    }
    checkString(report, id, `${at}.exerciseId`, block.exerciseId);
    // A dangling exerciseId renders as a nameless block with no form cues, so
    // it has to resolve, exactly like variationIds. docs/workout-format.md
    // names this script as the enforcer of that promise.
    if (typeof block.exerciseId === "string" && block.exerciseId.trim() !== "" && !exerciseIds.has(block.exerciseId)) {
      report(
        id,
        `${at}.exerciseId`,
        `"${block.exerciseId}" does not resolve to any exercise in src/data/strength/exercises/`,
      );
    }
    checkNumber(report, id, `${at}.sets`, block.sets, { required: true, integer: true, min: 1 });
    checkString(report, id, `${at}.restBetweenSets`, block.restBetweenSets);
    checkEnum(report, id, `${at}.intensity`, block.intensity, STRENGTH_INTENSITIES, "StrengthIntensity");
    checkNumber(report, id, `${at}.rpe`, block.rpe, { min: 1, max: 10 });
    checkNumber(report, id, `${at}.percentRM`, block.percentRM, { min: 0, max: 100 });

    // reps is `number | string`: a rep count or a timed hold like "30s".
    const reps = block.reps;
    if (typeof reps === "number") {
      checkNumber(report, id, `${at}.reps`, reps, { exclusiveMin: 0 });
    } else if (typeof reps === "string") {
      if (reps.trim() === "") report(id, `${at}.reps`, 'empty (expected a rep count or a hold like "30s")');
    } else {
      report(id, `${at}.reps`, `expected a number or a hold string like "30s", got ${typeName(reps)}`);
    }

    if (block.notes !== undefined) {
      checkString(report, id, `${at}.notes`, block.notes);
      checkString(report, id, `${at}.notesEn`, block.notesEn, "required, bilingual twin of notes");
    }
  });
}

// ── Template-level checkers ───────────────────────────────────────

function checkEnvironment(report: Report, id: string, value: unknown): void {
  if (!isRecord(value)) {
    report(id, "environment", `missing or not an object (required WorkoutEnvironment, got ${typeName(value)})`);
    return;
  }
  for (const key of ["requiresHills", "requiresTrack"] as const) {
    if (typeof value[key] !== "boolean") {
      report(id, `environment.${key}`, `expected a boolean, got ${typeName(value[key])}`);
    }
  }
  for (const key of ["prefersFlat", "prefersSoft"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "boolean") {
      report(id, `environment.${key}`, `expected a boolean, got ${typeName(value[key])}`);
    }
  }
}

function checkSelectionCriteria(report: Report, id: string, value: unknown): void {
  if (!isRecord(value)) {
    report(id, "selectionCriteria", `missing or not an object (required SelectionCriteria, got ${typeName(value)})`);
    return;
  }
  checkEnumArray(report, id, "selectionCriteria.phases", value.phases, TRAINING_PHASES, "TrainingPhase");
  checkEnumArray(report, id, "selectionCriteria.weekPositions", value.weekPositions, WEEK_POSITIONS, "WeekPosition");
  checkEnum(report, id, "selectionCriteria.relativeLoad", value.relativeLoad, RELATIVE_LOADS, "RelativeLoad");
  checkStringArray(report, id, "selectionCriteria.tags", value.tags);
  checkNumber(report, id, "selectionCriteria.priorityScore", value.priorityScore, { required: true, min: 0 });
}

function checkScaling(report: Report, id: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (!isRecord(value)) {
    report(id, "scaling", `expected a WorkoutScaling object, got ${typeName(value)}`);
    return;
  }
  checkEnum(report, id, "scaling.progressionType", value.progressionType, SCALING_TYPES, "ScalingType");
  checkNumber(report, id, "scaling.minValue", value.minValue, { required: true, min: 0 });
  checkNumber(report, id, "scaling.maxValue", value.maxValue, { required: true, min: 0 });
  checkNumber(report, id, "scaling.stepSize", value.stepSize, { exclusiveMin: 0 });
  const { minValue, maxValue } = value;
  if (typeof minValue === "number" && typeof maxValue === "number" && minValue > maxValue) {
    report(id, "scaling", `minValue ${minValue} > maxValue ${maxValue}`);
  }
}

/** Which ID_PREFIX_REGISTRY bucket a template belongs to, or null when undecidable. */
function bucketOf(template: Json, kind: FileKind): { bucket: string; label: string } | null {
  if (kind === "strength") return { bucket: "strength", label: "kind" };
  const discipline = template.discipline;
  if (typeof discipline === "string" && discipline !== "running") {
    return { bucket: discipline, label: "discipline" };
  }
  const category = template.category;
  if (typeof category === "string") return { bucket: category, label: "category" };
  return null;
}

function checkId(
  report: Report,
  rawId: unknown,
  template: Json,
  occurrences: ReadonlyMap<string, string[]>,
  kind: FileKind,
): void {
  if (typeof rawId !== "string" || rawId.trim() === "") return; // already reported

  const files = occurrences.get(rawId) ?? [];
  if (files.length > 1) {
    const perFile = new Map<string, number>();
    for (const seen of files) perFile.set(seen, (perFile.get(seen) ?? 0) + 1);
    const where = [...perFile].map(([path, count]) => (count > 1 ? `${path} ×${count}` : path)).join(", ");
    report(
      rawId,
      "id",
      `duplicate id: declared ${files.length} times (${where}); ids must be unique across the whole catalogue`,
    );
  }

  if (!ID_FORMAT.test(rawId)) {
    report(rawId, "id", `"${rawId}" does not match the PREFIX-NNN format (e.g. "VMA-001")`);
    return;
  }

  const bucket = bucketOf(template, kind);
  if (!bucket) return; // category/discipline already reported as invalid
  const registered = ID_PREFIX_REGISTRY[bucket.bucket];
  if (!registered) return; // unknown bucket already reported as an invalid enum

  const prefix = rawId.slice(0, rawId.indexOf("-"));
  if (!registered.includes(prefix)) {
    report(
      rawId,
      "id",
      `prefix "${prefix}" is not registered for ${bucket.label} "${bucket.bucket}" (expected ${registered.map((p) => `"${p}"`).join(" or ")})`,
    );
  }
}

function validateRunningTemplate(
  report: Report,
  template: Json,
  occurrences: ReadonlyMap<string, string[]>,
  knownIds: ReadonlySet<string>,
): void {
  const id = typeof template.id === "string" && template.id.trim() !== "" ? template.id : "<no id>";

  checkString(report, id, "id", template.id);
  checkId(report, template.id, template, occurrences, "running");

  // The mirror image of the missing-`kind` report below: a strength session
  // filed under src/data/workouts/ is one mistake, not a running template with
  // a dozen missing fields.
  if (template.kind !== undefined) {
    report(
      id,
      "kind",
      `unexpected ${JSON.stringify(template.kind)}: only strength sessions carry "kind", and they live in ${STRENGTH_SESSION_PREFIX}`,
    );
  }

  checkBilingual(report, id, template, "name");
  checkBilingual(report, id, template, "description");

  checkOptionalEnum(report, id, "discipline", template.discipline, DISCIPLINE_VALUES, "Discipline");
  checkEnum(report, id, "category", template.category, WORKOUT_CATEGORIES, "WorkoutCategory");
  checkEnum(report, id, "sessionType", template.sessionType, SESSION_TYPES, "SessionType");
  checkEnum(report, id, "targetSystem", template.targetSystem, TARGET_SYSTEMS, "TargetSystem");
  checkEnum(report, id, "difficulty", template.difficulty, DIFFICULTIES, "Difficulty");

  checkRange(report, id, "typicalDuration", template.typicalDuration, true);
  checkRange(report, id, "estimatedDistanceKm", template.estimatedDistanceKm, false);
  checkEnvironment(report, id, template.environment);

  checkWorkoutBlocks(report, id, "warmupTemplate", template.warmupTemplate);
  checkWorkoutBlocks(report, id, "mainSetTemplate", template.mainSetTemplate);
  checkWorkoutBlocks(report, id, "cooldownTemplate", template.cooldownTemplate);

  if (template.warmupStructure !== undefined) {
    checkWorkoutSteps(report, id, "warmupStructure", template.warmupStructure);
  }
  if (template.mainSetStructure !== undefined) {
    checkWorkoutSteps(report, id, "mainSetStructure", template.mainSetStructure);
  }
  if (template.cooldownStructure !== undefined) {
    checkWorkoutSteps(report, id, "cooldownStructure", template.cooldownStructure);
  }

  checkBilingualArray(report, id, "coachingTips", template);
  checkBilingualArray(report, id, "commonMistakes", template);
  checkVariationIds(report, id, template.variationIds, knownIds);
  checkSelectionCriteria(report, id, template.selectionCriteria);
  checkScaling(report, id, template.scaling);

  checkNumber(report, id, "weeklyFrequencyMax", template.weeklyFrequencyMax, { integer: true, min: 1 });
  checkNumber(report, id, "minimumRecoveryDays", template.minimumRecoveryDays, { integer: true, min: 0 });
}

function validateStrengthTemplate(
  report: Report,
  template: Json,
  occurrences: ReadonlyMap<string, string[]>,
  knownIds: ReadonlySet<string>,
  exerciseIds: ReadonlySet<string>,
): void {
  const id = typeof template.id === "string" && template.id.trim() !== "" ? template.id : "<no id>";

  checkString(report, id, "id", template.id);
  checkId(report, template.id, template, occurrences, "strength");

  // Reachable, because the caller dispatched on the file's location: a session
  // that omits the union discriminator is reported here, once, as the missing
  // `kind` it is.
  if (template.kind !== "strength") {
    report(
      id,
      "kind",
      `expected "strength", the AnyWorkoutTemplate discriminator that every session in ${STRENGTH_SESSION_PREFIX} carries, got ${JSON.stringify(template.kind) ?? "nothing"}`,
    );
  }

  checkBilingual(report, id, template, "name");
  checkBilingual(report, id, template, "description");

  checkEnum(report, id, "category", template.category, STRENGTH_CATEGORIES, "StrengthCategory");
  checkEnum(report, id, "difficulty", template.difficulty, DIFFICULTIES, "Difficulty");
  checkEnum(report, id, "intensity", template.intensity, STRENGTH_INTENSITIES, "StrengthIntensity");

  checkRange(report, id, "typicalDuration", template.typicalDuration, true);
  checkEnumArray(report, id, "equipment", template.equipment, STRENGTH_EQUIPMENT, "StrengthEquipment");
  checkEnumArray(report, id, "primaryMuscleGroups", template.primaryMuscleGroups, MUSCLE_GROUPS, "MuscleGroup");
  checkEnumArray(report, id, "suitablePhases", template.suitablePhases, TRAINING_PHASES, "TrainingPhase");

  checkStrengthBlocks(report, id, "warmupBlocks", template.warmupBlocks, exerciseIds);
  checkStrengthBlocks(report, id, "mainBlocks", template.mainBlocks, exerciseIds);
  checkStrengthBlocks(report, id, "cooldownBlocks", template.cooldownBlocks, exerciseIds);

  checkBilingualArray(report, id, "coachingTips", template);
  checkBilingualArray(report, id, "commonMistakes", template);
  checkVariationIds(report, id, template.variationIds, knownIds);

  checkNumber(report, id, "weeklyFrequencyMax", template.weeklyFrequencyMax, { required: true, integer: true, min: 1 });
  checkNumber(report, id, "minimumRecoveryDays", template.minimumRecoveryDays, { required: true, integer: true, min: 0 });
  if (template.references !== undefined) {
    checkStringArray(report, id, "references", template.references);
  }
}

/**
 * Root-level `category` / `discipline`: a real union member, not merely present.
 * The root is what the id-prefix registry and the binding below are read
 * against, so an unknown value there silently disables both.
 */
function checkFileRoot(report: Report, root: Json, kind: FileKind): void {
  if (root.category === undefined && root.discipline === undefined) {
    report("<file>", "root", 'missing "category" or "discipline" (every catalogue file declares one)');
  }
  if (root.category !== undefined) {
    const [allowed, unionName] =
      kind === "strength"
        ? ([STRENGTH_CATEGORIES, "StrengthCategory"] as const)
        : ([WORKOUT_CATEGORIES, "WorkoutCategory"] as const);
    checkEnum(report, "<file>", "root.category", root.category, allowed, unionName);
  }
  if (root.discipline !== undefined) {
    checkEnum(report, "<file>", "root.discipline", root.discipline, DISCIPLINE_VALUES, "Discipline");
  }
}

/**
 * Template ↔ file binding. A file declares the bucket it holds and every
 * template in it must repeat that bucket, otherwise the template is reachable
 * under a category no reader would look in, and the id prefix, which is keyed
 * on the same value, is checked against the wrong registry entry.
 *
 * Discipline files (cycling, swimming) bind on `discipline`, since they hold
 * several categories under one prefix. Running category files bind on
 * `category`.
 *
 * Strength session files are deliberately exempt: `mobility.json` also hosts
 * the `prehab` sessions, there being no `prehab.json`. Their `category` is
 * still validated as a StrengthCategory, and their id prefix comes from the
 * file's location rather than from the category, so nothing is lost.
 */
function checkFileBinding(report: Report, id: string, template: Json, root: Json, kind: FileKind): void {
  const rootDiscipline = root.discipline;
  if (typeof rootDiscipline === "string") {
    if (template.discipline === undefined) {
      report(id, "discipline", `missing "${rootDiscipline}": every template in a discipline file repeats its file's discipline`);
    } else if (typeof template.discipline === "string" && template.discipline !== rootDiscipline) {
      report(id, "discipline", `"${template.discipline}" contradicts the file, which declares discipline "${rootDiscipline}"`);
    }
    return;
  }
  if (kind !== "running") return;
  const rootCategory = root.category;
  if (typeof rootCategory !== "string" || typeof template.category !== "string") return; // already reported
  if (template.category !== rootCategory) {
    report(id, "category", `"${template.category}" contradicts the file, which declares category "${rootCategory}"`);
  }
}

// ── Catalogue orchestration ───────────────────────────────────────

export interface CatalogueFile {
  /** Repo-relative path, printed verbatim in the report, and what picks the schema. */
  path: string;
  /**
   * Parsed JSON root: `{ category, templates }` or `{ discipline, templates }`
   * for a template file, `{ category, exercises }` for an exercise library file.
   */
  root: unknown;
}

function templatesOf(root: unknown): Json[] | null {
  if (!isRecord(root) || !Array.isArray(root.templates)) return null;
  return root.templates.filter(isRecord);
}

/** Ids declared by an exercise library file, or null when it is not shaped like one. */
function exerciseIdsOf(root: unknown): string[] | null {
  if (!isRecord(root) || !Array.isArray(root.exercises)) return null;
  return root.exercises
    .filter(isRecord)
    .map((exercise) => exercise.id)
    .filter((id): id is string => typeof id === "string" && id.trim() !== "");
}

/**
 * Validates `files`, reporting only on the paths in `selected` (all of them
 * when omitted). Id uniqueness, variationIds and exerciseId resolution always
 * look at the whole catalogue, so a single-file run still catches a clash, or
 * a dangling reference, against another file.
 *
 * `files` therefore has to carry the exercise library too: without it every
 * `exerciseId` would resolve against an empty set. Pass the exercise files in
 * and they contribute their ids; they are not otherwise template-validated.
 */
export function validateCatalogue(
  files: readonly CatalogueFile[],
  selected?: ReadonlySet<string>,
): Violation[] {
  const occurrences = new Map<string, string[]>();
  const knownIds = new Set<string>();
  const exerciseIds = new Set<string>();
  for (const file of files) {
    if (fileKindOf(file.path) === "exercises") {
      for (const id of exerciseIdsOf(file.root) ?? []) exerciseIds.add(id);
      continue;
    }
    for (const template of templatesOf(file.root) ?? []) {
      if (typeof template.id !== "string" || template.id.trim() === "") continue;
      knownIds.add(template.id);
      const seen = occurrences.get(template.id);
      if (seen) seen.push(file.path);
      else occurrences.set(template.id, [file.path]);
    }
  }

  const violations: Violation[] = [];
  for (const file of files) {
    if (selected && !selected.has(file.path)) continue;
    const report: Report = (id, field, message) =>
      violations.push({ file: file.path, id, field, message });

    if (!isRecord(file.root)) {
      report("<file>", "root", `expected a JSON object, got ${typeName(file.root)}`);
      continue;
    }

    const kind = fileKindOf(file.path);

    // The exercise library is a reference target, not a template file. Only its
    // shape is checked here: a broken root would otherwise empty the id set
    // and make every exerciseId in the catalogue look dangling.
    if (kind === "exercises") {
      if (exerciseIdsOf(file.root) === null) {
        report("<file>", "exercises", `expected an array of exercises, got ${typeName(file.root.exercises)}`);
      }
      continue;
    }

    checkFileRoot(report, file.root, kind);

    const templates = templatesOf(file.root);
    if (!templates) {
      report("<file>", "templates", `expected an array of templates, got ${typeName(file.root.templates)}`);
      continue;
    }
    const root = file.root;
    const rawTemplates = root.templates as unknown[];
    rawTemplates.forEach((template, index) => {
      if (!isRecord(template)) {
        report("<file>", `templates[${index}]`, `expected a template object, got ${typeName(template)}`);
        return;
      }
      if (kind === "strength") {
        validateStrengthTemplate(report, template, occurrences, knownIds, exerciseIds);
      } else {
        validateRunningTemplate(report, template, occurrences, knownIds);
      }
      const id = typeof template.id === "string" && template.id.trim() !== "" ? template.id : "<no id>";
      checkFileBinding(report, id, template, root, kind);
    });
  }
  return violations;
}

// ── CLI ───────────────────────────────────────────────────────────

function fail(message: string): never {
  console.error(`qa-workout-schema: ${message}`);
  process.exit(2);
}

function toRepoRelative(absolutePath: string): string {
  return relative(REPO_ROOT, absolutePath).split(sep).join("/");
}

/**
 * Rejects any --file outside src/data/. This validator is strict, and strict
 * validation must never be pointed at user-authored data: saved plans, custom
 * workouts and share-link payloads predate current fields and are read through
 * the tolerant normalisers in src/lib instead.
 */
function resolveSelectedFile(candidate: string): string {
  const absolute = resolve(candidate);
  if (absolute !== DATA_DIR && !absolute.startsWith(DATA_DIR + sep)) {
    fail(
      `--file must point inside src/data/ (got "${candidate}").\n` +
        "  This validator is strict and only ever reads the committed catalogue.\n" +
        "  User data (saved plans, custom workouts, share links) goes through the\n" +
        "  tolerant normalisers in src/lib, never through a schema gate.",
    );
  }
  if (!existsSync(absolute) || !statSync(absolute).isFile()) {
    fail(`--file "${candidate}" is not a readable file.`);
  }
  return absolute;
}

function loadCatalogue(): CatalogueFile[] {
  const files: CatalogueFile[] = [];
  // The exercise library is read for its ids: StrengthBlock.exerciseId must
  // resolve into it, the same way variationIds must resolve into the templates.
  for (const dir of [WORKOUT_DIR, STRENGTH_SESSION_DIR, EXERCISE_DIR]) {
    for (const name of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      const absolute = join(dir, name);
      const path = toRepoRelative(absolute);
      let root: unknown;
      try {
        root = JSON.parse(readFileSync(absolute, "utf8"));
      } catch (error) {
        fail(`${path} is not readable as JSON: ${(error as Error).message}`);
      }
      files.push({ path, root });
    }
  }
  return files;
}

function readFileArg(argv: string[]): string | null {
  const index = argv.findIndex((arg) => arg === "--file" || arg.startsWith("--file="));
  if (index === -1) return null;
  const arg = argv[index];
  const value = arg.startsWith("--file=") ? arg.slice("--file=".length) : argv[index + 1];
  if (!value || value.startsWith("-")) {
    fail("--file needs a path, e.g. --file src/data/workouts/vma.json");
  }
  return value;
}

function main(): void {
  const argv = process.argv.slice(2);
  const asJson = argv.includes("--json");
  const unknown = argv.find(
    (arg) => arg.startsWith("-") && arg !== "--json" && arg !== "--file" && !arg.startsWith("--file="),
  );
  if (unknown) fail(`unknown option "${unknown}" (expected --file <path> and/or --json)`);

  const requested = readFileArg(argv);

  // A bare path is the easy typo for `--file <path>`. Silently ignoring it
  // would scan the whole catalogue and exit 0, letting a contributor believe
  // they had validated their file. The only positional the CLI accepts is the
  // value right after a bare `--file`.
  const flagIndex = argv.indexOf("--file");
  const valueIndex = flagIndex === -1 ? -1 : flagIndex + 1;
  const stray = argv.find((arg, index) => !arg.startsWith("-") && index !== valueIndex);
  if (stray) fail(`unexpected argument "${stray}" (pass a path as --file ${stray})`);

  const catalogue = loadCatalogue();

  let selected: Set<string> | undefined;
  let scanned = catalogue;
  if (requested) {
    const path = toRepoRelative(resolveSelectedFile(requested));
    if (!catalogue.some((file) => file.path === path)) {
      fail(
        `${path} is not a catalogue file.\n` +
          "  Covered directories: src/data/workouts/, src/data/strength/sessions/\n" +
          "  and src/data/strength/exercises/.",
      );
    }
    selected = new Set([path]);
    scanned = catalogue.filter((file) => file.path === path);
  }

  const violations = validateCatalogue(catalogue, selected);
  const templateCount = scanned.reduce((total, file) => total + (templatesOf(file.root)?.length ?? 0), 0);

  if (asJson) {
    console.log(JSON.stringify({ files: scanned.length, templates: templateCount, violations }, null, 2));
  } else {
    const byFile = new Map<string, Violation[]>();
    for (const violation of violations) {
      const bucket = byFile.get(violation.file);
      if (bucket) bucket.push(violation);
      else byFile.set(violation.file, [violation]);
    }
    for (const [file, entries] of byFile) {
      console.log(`\n--- ${file} ---`);
      for (const entry of entries) {
        console.log(`  ${entry.id.padEnd(9)} ${entry.field}: ${entry.message}`);
      }
    }
    const files = `${scanned.length} file${scanned.length === 1 ? "" : "s"}`;
    const found = `${violations.length} violation${violations.length === 1 ? "" : "s"}`;
    const where = byFile.size > 0 ? ` in ${byFile.size} file${byFile.size === 1 ? "" : "s"}` : "";
    console.log(`${byFile.size > 0 ? "\n" : ""}${templateCount} templates across ${files}, ${found}${where}`);
  }

  process.exit(violations.length > 0 ? 1 : 0);
}

if (import.meta.main) main();
