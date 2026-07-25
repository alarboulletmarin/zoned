/**
 * Share a custom workout as a URL — no backend involved.
 *
 * The builder only edits a name and a tree of `WorkoutStep`s, so that is all
 * we encode: everything else on a `WorkoutTemplate` (category, difficulty,
 * selection criteria…) is rebuilt from `createEmptyWorkout()` defaults on the
 * receiving side. Encoding the full template instead would cost ~1850 chars
 * against ~210 here, mostly in bilingual text the builder never fills in
 * (it mirrors `name` into `nameEn`).
 *
 * Steps are fixed-position tuples with trailing zeros trimmed, so a plain
 * "20min Z2" segment costs 5 slots while a trail segment carrying gradient and
 * terrain still round-trips without loss.
 */

import type { WorkoutStep, WorkoutStepSegment, WorkoutTemplate } from "@/types";
import { createEmptyWorkout } from "@/lib/customWorkoutStorage";
import { replaceWorkoutPhaseSteps } from "@/lib/workoutStructure";
import { decodePayload, encodePayload, shareUrl } from "./codec";
import {
  INTENSITY_CODES,
  REPEAT_UNIT_CODES,
  STEP_ROLE_CODES,
  TERRAIN_CODES,
  decodeZone,
  encodeZone,
  fromCode,
  toCode,
} from "./codes";

/** Guards against hand-crafted payloads nesting deep enough to blow the stack. */
const MAX_DEPTH = 6;
const MAX_STEPS_PER_PHASE = 60;

type StepTuple = unknown[];

export interface SharedWorkoutPayload {
  v: 1;
  /** Workout name, as shared (single string — custom workouts are single-language). */
  n: string;
  /** Warmup / main set / cooldown step trees. */
  w: StepTuple[];
  m: StepTuple[];
  cd: StepTuple[];
}

// ── Encoding ───────────────────────────────────────────────────────

/** Drop trailing empty slots — most segments only use the first few. */
function trimTuple(tuple: StepTuple): StepTuple {
  let end = tuple.length;
  while (end > 2 && !tuple[end - 1]) end--;
  return tuple.slice(0, end);
}

function encodeStep(step: WorkoutStep): StepTuple {
  if (step.kind === "repeat") {
    const between = step.between?.length ? step.between.map(encodeStep) : 0;
    return trimTuple([
      1,
      step.count,
      toCode(REPEAT_UNIT_CODES, step.unit),
      step.steps.map(encodeStep),
      between,
    ]);
  }

  return trimTuple([
    0,
    step.description ?? "",
    step.durationSec ?? 0,
    step.distanceM ?? 0,
    encodeZone(step.zone),
    toCode(STEP_ROLE_CODES, step.role),
    step.vmaPercent ?? 0,
    toCode(INTENSITY_CODES, step.intensityType),
    step.distanceKm ?? 0,
    step.elevationGainM ?? 0,
    step.gradientPercent ?? 0,
    toCode(TERRAIN_CODES, step.terrainType),
  ]);
}

export function encodeSharedWorkout(workout: WorkoutTemplate): string {
  const payload: SharedWorkoutPayload = {
    v: 1,
    n: workout.name,
    w: (workout.warmupStructure ?? []).map(encodeStep),
    m: (workout.mainSetStructure ?? []).map(encodeStep),
    cd: (workout.cooldownStructure ?? []).map(encodeStep),
  };
  return encodePayload(payload);
}

export function sharedWorkoutUrl(workout: WorkoutTemplate): string {
  return shareUrl("/workout/shared", encodeSharedWorkout(workout));
}

// ── Decoding ───────────────────────────────────────────────────────

function decodeStep(raw: unknown, depth: number): WorkoutStep | null {
  if (depth > MAX_DEPTH || !Array.isArray(raw) || raw.length < 2) return null;

  if (raw[0] === 1) {
    const [, count, unit, steps, between] = raw;
    if (typeof count !== "number" || !Number.isFinite(count) || count < 1) return null;
    const inner = decodeSteps(steps, depth + 1);
    if (!inner || inner.length === 0) return null;

    const step: WorkoutStep = { kind: "repeat", count: Math.round(count), steps: inner };
    const unitValue = fromCode(REPEAT_UNIT_CODES, unit);
    if (unitValue) step.unit = unitValue;
    if (between) {
      const decoded = decodeSteps(between, depth + 1);
      if (!decoded) return null;
      if (decoded.length > 0) step.between = decoded;
    }
    return step;
  }

  if (raw[0] !== 0) return null;
  const [, description, durationSec, distanceM, zone, role, vma, intensity, km, elev, gradient, terrain] = raw;
  if (typeof description !== "string") return null;

  const segment: WorkoutStepSegment = { kind: "segment", description };
  const num = (value: unknown): number | undefined =>
    typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;

  segment.durationSec = num(durationSec);
  segment.distanceM = num(distanceM);
  segment.distanceKm = num(km);
  segment.zone = decodeZone(zone);
  segment.role = fromCode(STEP_ROLE_CODES, role);
  segment.vmaPercent = num(vma);
  segment.intensityType = fromCode(INTENSITY_CODES, intensity);
  segment.elevationGainM = num(elev);
  segment.gradientPercent = num(gradient);
  segment.terrainType = fromCode(TERRAIN_CODES, terrain);

  // Strip the undefined slots so decoded steps compare equal to authored ones.
  for (const key of Object.keys(segment) as (keyof WorkoutStepSegment)[]) {
    if (segment[key] === undefined) delete segment[key];
  }
  return segment;
}

function decodeSteps(raw: unknown, depth: number): WorkoutStep[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_STEPS_PER_PHASE) return null;

  const steps: WorkoutStep[] = [];
  for (const item of raw) {
    const step = decodeStep(item, depth);
    if (!step) return null;
    steps.push(step);
  }
  return steps;
}

export function decodeSharedWorkout(encoded: string): SharedWorkoutPayload | null {
  const obj = decodePayload(encoded);
  if (!obj) return null;
  if (obj.v !== 1) return null;
  if (typeof obj.n !== "string" || obj.n.trim().length === 0) return null;

  // Validate every phase up front — a half-decodable workout is not importable.
  for (const phase of ["w", "m", "cd"] as const) {
    if (!decodeSteps(obj[phase] ?? [], 0)) return null;
  }
  if (!Array.isArray(obj.m) || obj.m.length === 0) return null;

  return {
    v: 1,
    n: obj.n,
    w: (obj.w ?? []) as StepTuple[],
    m: obj.m as StepTuple[],
    cd: (obj.cd ?? []) as StepTuple[],
  };
}

/** Payload → step tree for one phase. Callers already validated via decode. */
export function sharedWorkoutSteps(
  payload: SharedWorkoutPayload,
  phase: "w" | "m" | "cd",
): WorkoutStep[] {
  return decodeSteps(payload[phase], 0) ?? [];
}

/** Build an importable custom workout — defaults come from the builder. */
export function sharedWorkoutToTemplate(payload: SharedWorkoutPayload): WorkoutTemplate {
  let workout = createEmptyWorkout();
  workout = { ...workout, name: payload.n, nameEn: payload.n };
  workout = replaceWorkoutPhaseSteps(workout, "warmup", sharedWorkoutSteps(payload, "w"));
  workout = replaceWorkoutPhaseSteps(workout, "main", sharedWorkoutSteps(payload, "m"));
  workout = replaceWorkoutPhaseSteps(workout, "cooldown", sharedWorkoutSteps(payload, "cd"));
  return workout;
}
