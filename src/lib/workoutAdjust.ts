/**
 * Turning a catalogue workout into an adjustable one.
 *
 * A `WorkoutStep` tree already states every number a runner would want to move:
 * how many repetitions, how many sets, how long each effort lasts, how long the
 * recovery lasts. This module reads those numbers out as a flat list of bounded
 * parameters, writes new values back into a *copy* of the tree, and mints the
 * custom-namespace template that copy becomes.
 *
 * Nothing here mutates its input. `applyAdjustments` rebuilds only the branches
 * it touches and returns the original array reference for the rest, so an
 * unchanged phase stays reference-equal and the catalogue template a caller
 * passed in is never written to.
 */

import type {
  WorkoutPhaseKey,
  WorkoutRepeatUnit,
  WorkoutScaling,
  WorkoutStep,
  WorkoutStepSegment,
  WorkoutTemplate,
} from "@/types";
import { WORKOUT_PHASES } from "@/lib/workoutTemplate";
import { getWorkoutPhaseSteps, replaceWorkoutPhaseSteps } from "@/lib/workoutStructure";
import { createCustomWorkoutId } from "@/lib/customWorkoutStorage";

/**
 * What a parameter moves. The first three are counts, the next two are
 * seconds, the last one is metres — the kind is the unit.
 */
export type AdjustableParamKind =
  | "sets"
  | "reps"
  | "blocks"
  | "effortDuration"
  | "recoveryDuration"
  | "distance";

export interface AdjustableParam {
  /** Address of the value inside the phase tree — see `buildParamId`. */
  id: string;
  phase: WorkoutPhaseKey;
  kind: AdjustableParamKind;
  /** Prose from the step this parameter addresses, so the UI can name it. */
  label: string;
  labelEn?: string;
  value: number;
  /** Range of the slider. Widens to admit a value typed outside it. */
  min: number;
  max: number;
  step: number;
  /**
   * What the template itself suggests — its `scaling` range, or half to one and
   * a half times what it prescribes. Kept separately from `min`/`max` so the UI
   * can still say what the recommendation was once the slider has widened past
   * it.
   */
  recommendedMin: number;
  recommendedMax: number;
}

/** Suffix distinguishing the three fields a single step can expose. */
type ParamField = "count" | "dur" | "dist";

/** A parameter before its recommendation is pinned — see `getAdjustableParams`. */
type UnboundedParam = Omit<AdjustableParam, "recommendedMin" | "recommendedMax">;

/**
 * `main/0/0/b0#dur` — phase, then one token per level down the tree (`b` marks
 * a step living in a repeat's `between`), then the field. Stable as long as the
 * tree shape is: a parameter keeps its identity across value changes, and loses
 * it when the user adds or removes a step, which is the correct outcome.
 */
function buildParamId(phase: WorkoutPhaseKey, path: string, field: ParamField): string {
  return `${phase}/${path}#${field}`;
}

function joinPath(prefix: string, token: string): string {
  return prefix ? `${prefix}/${token}` : token;
}

// ── Reading parameters out of a workout ─────────────────────────────

/**
 * Every parameter the workout exposes, in tree order, across the three phases.
 * Bounds come from `scaling` for the one parameter it describes, and from the
 * prescribed value everywhere else.
 */
export function getAdjustableParams(workout: WorkoutTemplate): AdjustableParam[] {
  const params: UnboundedParam[] = [];

  for (const phase of WORKOUT_PHASES) {
    collectParams(getWorkoutPhaseSteps(workout, phase), phase, "", false, params);
  }

  // The recommendation is whatever the bounds are before anything widens them.
  return applyScalingBounds(params, workout.scaling).map((param) => ({
    ...param,
    recommendedMin: param.min,
    recommendedMax: param.max,
  }));
}

/** Whether the Adjust action has anything to offer on this workout. */
export function hasAdjustableParams(workout: WorkoutTemplate): boolean {
  return getAdjustableParams(workout).length > 0;
}

/**
 * Live values carried on bounds captured earlier, so a scale does not move
 * under the cursor as its own value changes.
 *
 * A value that has drifted outside the captured range widens it instead of
 * being pulled back: the step editor is free to go where the sliders cannot,
 * and a knob that silently refuses to show the value it holds is worse than a
 * wider range.
 */
/**
 * How far a value may go when it is typed rather than dragged.
 *
 * The bounds a parameter carries are a *recommendation* — what the template
 * declares, or half to one and a half times what it prescribes. They belong on
 * a slider, which is a coarse gesture. They must not be a ceiling: a runner
 * who wants twenty repetitions is not making a mistake, and having to leave the
 * panel for the step editor to get there would defeat the point.
 *
 * These limits are the only hard ones, and they exist solely to keep a typo
 * from producing a session no human would run.
 */
const HARD_LIMITS: Record<AdjustableParamKind, { min: number; max: number }> = {
  sets: { min: 1, max: 60 },
  reps: { min: 1, max: 60 },
  blocks: { min: 1, max: 60 },
  effortDuration: { min: 5, max: 4 * 3600 },
  recoveryDuration: { min: 5, max: 4 * 3600 },
  distance: { min: 10, max: 100_000 },
};

/** What a hand-typed value is allowed to be, for this kind of parameter. */
export function getHardLimits(kind: AdjustableParamKind): { min: number; max: number } {
  return HARD_LIMITS[kind];
}

/**
 * A parameter whose range has been opened up to admit `value`, so a typed
 * figure outside the recommendation is kept rather than snapped back. The
 * recommended band still shows through: the slider simply extends to reach it.
 */
export function widenParamTo(param: AdjustableParam, value: number): AdjustableParam {
  const limits = HARD_LIMITS[param.kind];
  const admissible = Math.min(limits.max, Math.max(limits.min, Math.round(value)));

  return {
    ...param,
    min: Math.min(param.min, admissible),
    max: Math.max(param.max, admissible),
  };
}

export function mergeParamBounds(
  live: AdjustableParam[],
  captured: AdjustableParam[],
): AdjustableParam[] {
  const byId = new Map(captured.map((param) => [param.id, param]));

  return live.map((param) => {
    const base = byId.get(param.id);
    if (!base) return param;
    return {
      ...param,
      min: Math.min(base.min, param.value),
      max: Math.max(base.max, param.value),
      step: base.step,
      // The recommendation belongs to the template, so it comes from the
      // capture. Re-deriving it from the current value would let it follow the
      // user around and never disagree with them.
      recommendedMin: base.recommendedMin,
      recommendedMax: base.recommendedMax,
    };
  });
}

function collectParams(
  steps: WorkoutStep[],
  phase: WorkoutPhaseKey,
  prefix: string,
  isBetween: boolean,
  sink: UnboundedParam[],
): void {
  steps.forEach((step, index) => {
    const path = joinPath(prefix, isBetween ? `b${index}` : `${index}`);

    if (step.kind === "repeat") {
      sink.push({
        id: buildParamId(phase, path, "count"),
        phase,
        kind: countKind(step.unit),
        ...describeStep(step),
        value: step.count,
        ...countBounds(step.count),
      });
      collectParams(step.steps, phase, path, false, sink);
      if (step.between) collectParams(step.between, phase, path, true, sink);
      return;
    }

    // A segment carrying both a duration and a distance is driven by its
    // duration — that is the field `flattenWorkoutSegments` reads too, so
    // exposing the distance as well would offer a knob that moves nothing.
    if (step.durationSec != null) {
      sink.push({
        id: buildParamId(phase, path, "dur"),
        phase,
        kind: isBetween || step.role === "recovery" ? "recoveryDuration" : "effortDuration",
        ...describeStep(step),
        value: step.durationSec,
        ...durationBounds(step.durationSec),
      });
      return;
    }

    const distanceM = segmentDistanceMeters(step);
    if (distanceM != null) {
      sink.push({
        id: buildParamId(phase, path, "dist"),
        phase,
        kind: "distance",
        ...describeStep(step),
        value: distanceM,
        ...distanceBounds(distanceM),
      });
    }
  });
}

function countKind(unit: WorkoutRepeatUnit | undefined): AdjustableParamKind {
  if (unit === "sets") return "sets";
  if (unit === "blocks") return "blocks";
  return "reps";
}

/** Distance in metres whichever field the segment used to state it. */
function segmentDistanceMeters(segment: WorkoutStepSegment): number | null {
  if (segment.distanceM != null) return segment.distanceM;
  if (segment.distanceKm != null) return segment.distanceKm * 1000;
  return null;
}

/**
 * The prose a parameter is named after. A repeat has none of its own, so it
 * borrows the first segment it contains — `2 × (12 × 30s VMA)` reads as
 * "sets of 30s VMA" rather than as an anonymous counter.
 */
function describeStep(step: WorkoutStep): { label: string; labelEn?: string } {
  if (step.kind === "segment") {
    return {
      label: step.description,
      ...(step.descriptionEn ? { labelEn: step.descriptionEn } : {}),
    };
  }

  const segment = findFirstSegment(step.steps);
  if (!segment) return { label: "" };
  return {
    label: segment.description,
    ...(segment.descriptionEn ? { labelEn: segment.descriptionEn } : {}),
  };
}

function findFirstSegment(steps: WorkoutStep[]): WorkoutStepSegment | null {
  for (const step of steps) {
    if (step.kind === "segment") return step;
    const nested = findFirstSegment(step.steps);
    if (nested) return nested;
  }
  return null;
}

// ── Bounds ──────────────────────────────────────────────────────────

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/** Half to one and a half times what the workout prescribes, never below one. */
function countBounds(value: number): { min: number; max: number; step: number } {
  const min = Math.max(1, Math.round(value * 0.5));
  const max = Math.max(min + 1, Math.round(value * 1.5));
  return { min, max, step: 1 };
}

/**
 * Same half-to-one-and-a-half band, snapped to a granularity that matches the
 * magnitude: a 30s effort moves in 5s, a 20min block in whole minutes.
 */
function durationBounds(seconds: number): { min: number; max: number; step: number } {
  const step = seconds < 60 ? 5 : seconds < 600 ? 15 : 60;
  const min = Math.max(step, roundToStep(seconds * 0.5, step));
  const max = Math.max(min + step, roundToStep(seconds * 1.5, step));
  return { min, max, step };
}

function distanceBounds(meters: number): { min: number; max: number; step: number } {
  const step = meters < 500 ? 50 : meters < 5000 ? 100 : 500;
  const min = Math.max(step, roundToStep(meters * 0.5, step));
  const max = Math.max(min + step, roundToStep(meters * 1.5, step));
  return { min, max, step };
}

/**
 * `WorkoutScaling` describes exactly one parameter of the main set — the one
 * the plan generator moves as a phase progresses. When we can identify it, its
 * declared range replaces the derived one.
 *
 * Identification is deliberately conservative: the declared range must contain
 * the prescribed value. A range that does not is describing something other
 * than the parameter we matched, and honouring it would bound the wrong knob.
 */
function applyScalingBounds(
  params: UnboundedParam[],
  scaling: WorkoutScaling | undefined,
): UnboundedParam[] {
  if (!scaling) return params;

  const target = findScalingTarget(params, scaling);
  if (!target) return params;

  const toSeconds = scaling.progressionType === "duration";
  const factor = toSeconds ? 60 : 1;
  const step = scaling.stepSize && scaling.stepSize > 0 ? scaling.stepSize * factor : toSeconds ? 15 : 1;

  return params.map((param) =>
    param.id === target.id
      ? { ...param, min: scaling.minValue * factor, max: scaling.maxValue * factor, step }
      : param,
  );
}

function findScalingTarget(
  params: UnboundedParam[],
  scaling: WorkoutScaling,
): UnboundedParam | undefined {
  const mainParams = params.filter((param) => param.phase === "main");

  // Durations are declared in minutes; the tree stores seconds.
  if (scaling.progressionType === "duration") {
    return mainParams.find(
      (param) =>
        param.kind === "effortDuration" &&
        param.value >= scaling.minValue * 60 &&
        param.value <= scaling.maxValue * 60,
    );
  }

  if (scaling.progressionType === "distance") {
    return mainParams.find(
      (param) =>
        param.kind === "distance" &&
        param.value >= scaling.minValue &&
        param.value <= scaling.maxValue,
    );
  }

  return mainParams.find(
    (param) =>
      param.kind === scaling.progressionType &&
      param.value >= scaling.minValue &&
      param.value <= scaling.maxValue,
  );
}

// ── Writing parameters back ─────────────────────────────────────────

function clamp(value: number, param: AdjustableParam): number {
  return Math.min(param.max, Math.max(param.min, Math.round(value)));
}

/**
 * A copy of `workout` with the given parameters set to the given values,
 * each clamped to its own bounds. Values addressing a parameter the workout
 * does not expose are ignored.
 *
 * `params` defaults to this workout's own parameters. Callers holding bounds
 * captured earlier — a UI keeps them fixed while the user drags, so the scale
 * under the cursor does not move — pass theirs instead.
 */
export function applyAdjustments(
  workout: WorkoutTemplate,
  values: Record<string, number>,
  params: AdjustableParam[] = getAdjustableParams(workout),
): WorkoutTemplate {
  const byId = new Map(params.map((param) => [param.id, param]));
  let next = workout;

  for (const phase of WORKOUT_PHASES) {
    const steps = getWorkoutPhaseSteps(next, phase);
    const rewritten = rewriteSteps(steps, phase, "", false, values, byId);
    if (rewritten !== steps) {
      next = replaceWorkoutPhaseSteps(next, phase, rewritten);
    }
  }

  return next;
}

function rewriteSteps(
  steps: WorkoutStep[],
  phase: WorkoutPhaseKey,
  prefix: string,
  isBetween: boolean,
  values: Record<string, number>,
  params: Map<string, AdjustableParam>,
): WorkoutStep[] {
  let changed = false;

  const next = steps.map((step, index) => {
    const path = joinPath(prefix, isBetween ? `b${index}` : `${index}`);
    const rewritten = rewriteStep(step, phase, path, values, params);
    if (rewritten !== step) changed = true;
    return rewritten;
  });

  return changed ? next : steps;
}

function rewriteStep(
  step: WorkoutStep,
  phase: WorkoutPhaseKey,
  path: string,
  values: Record<string, number>,
  params: Map<string, AdjustableParam>,
): WorkoutStep {
  if (step.kind === "repeat") {
    const count = resolveValue(buildParamId(phase, path, "count"), step.count, values, params);
    const nested = rewriteSteps(step.steps, phase, path, false, values, params);
    const between = step.between
      ? rewriteSteps(step.between, phase, path, true, values, params)
      : undefined;

    if (count === step.count && nested === step.steps && between === step.between) return step;

    return {
      ...step,
      count,
      steps: nested,
      ...(between ? { between } : {}),
    };
  }

  if (step.durationSec != null) {
    const seconds = resolveValue(buildParamId(phase, path, "dur"), step.durationSec, values, params);
    return seconds === step.durationSec ? step : retimeSegment(step, seconds);
  }

  const distanceM = segmentDistanceMeters(step);
  if (distanceM != null) {
    const meters = resolveValue(buildParamId(phase, path, "dist"), distanceM, values, params);
    return meters === distanceM ? step : redistanceSegment(step, meters);
  }

  return step;
}

function resolveValue(
  id: string,
  current: number,
  values: Record<string, number>,
  params: Map<string, AdjustableParam>,
): number {
  const param = params.get(id);
  const requested = values[id];
  if (!param || requested == null || !Number.isFinite(requested)) return current;
  return clamp(requested, param);
}

// ── Keeping the prose honest ────────────────────────────────────────

/**
 * `30s VMA` must not survive being retimed to 45 seconds: the description is
 * what the timeline, the FIT export and the PDF print. The first duration in
 * the sentence is the one the segment states, so that is the one we rewrite —
 * in the unit the author used, so `3min` stays minutes and `30s` stays seconds.
 *
 * The optional trailing digits catch the compound form (`1min30`). They must
 * touch the unit, otherwise `2min 5% de pente` would read its gradient as
 * seconds.
 */
const DURATION_TOKEN = /(\d+(?:[.,]\d+)?)\s*(heures?|h|min|mn|sec|s|'|")(\d{1,2})?/i;
const DISTANCE_TOKEN = /(\d+(?:[.,]\d+)?)\s*(km|m)\b/i;

function retimeSegment(segment: WorkoutStepSegment, seconds: number): WorkoutStepSegment {
  return {
    ...segment,
    durationSec: seconds,
    ...scaleElevation(segment, seconds / segment.durationSec!),
    description: retimeText(segment.description, seconds),
    ...(segment.descriptionEn ? { descriptionEn: retimeText(segment.descriptionEn, seconds) } : {}),
  };
}

function redistanceSegment(segment: WorkoutStepSegment, meters: number): WorkoutStepSegment {
  const rewritten = {
    ...segment,
    ...scaleElevation(segment, meters / segmentDistanceMeters(segment)!),
    description: redistanceText(segment.description, meters),
    ...(segment.descriptionEn ? { descriptionEn: redistanceText(segment.descriptionEn, meters) } : {}),
  };

  return segment.distanceM != null
    ? { ...rewritten, distanceM: meters }
    : { ...rewritten, distanceKm: meters / 1000 };
}

/**
 * Elevation follows the effort; the hill does not move.
 *
 * A trail segment states both a climb (`elevationGainM`) and the slope it is
 * climbed at (`gradientPercent`). Stretching a 60s hill effort to 120s means
 * running further up the same hill, so the gain doubles and the gradient holds.
 * Leaving the gain fixed would have said the opposite — same climb, half the
 * slope — while still printing 7 %, and `computeTrailMetrics`, the elevation
 * profile and the hero export all read that number.
 */
function scaleElevation(segment: WorkoutStepSegment, factor: number): Partial<WorkoutStepSegment> {
  if (segment.elevationGainM == null || !Number.isFinite(factor) || factor <= 0) return {};
  return { elevationGainM: Math.round(segment.elevationGainM * factor) };
}

/** A description with no number in it — `Footing progressif` — is left alone. */
function retimeText(text: string, seconds: number): string {
  const match = text.match(DURATION_TOKEN);
  if (!match) return text;
  return text.replace(match[0], formatDurationInUnit(seconds, match[2]));
}

function redistanceText(text: string, meters: number): string {
  const match = text.match(DISTANCE_TOKEN);
  if (!match) return text;

  const replacement = match[2].toLowerCase() === "km"
    ? `${formatNumber(meters / 1000)}${match[2]}`
    : `${Math.round(meters)}${match[2]}`;
  return text.replace(match[0], replacement);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

function formatDurationInUnit(seconds: number, unit: string): string {
  const normalized = unit.toLowerCase();

  if (normalized === "h" || normalized.startsWith("heure")) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return minutes === 0
      ? `${hours}${unit}`
      : `${hours}${unit}${String(minutes).padStart(2, "0")}`;
  }

  // Written in seconds and still under a minute: keep it in seconds. Past a
  // minute, `90s` reads worse than `1min30`.
  if (normalized === "s" || normalized === "sec" || normalized === '"') {
    if (seconds < 60) return `${seconds}${unit}`;
    return formatMinuteForm(seconds, normalized === '"' ? "'" : "min");
  }

  return formatMinuteForm(seconds, unit);
}

function formatMinuteForm(seconds: number, unit: string): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (minutes === 0) return `${seconds}${unit === "'" ? '"' : "s"}`;
  return rest === 0 ? `${minutes}${unit}` : `${minutes}${unit}${String(rest).padStart(2, "0")}`;
}

// ── The copy ────────────────────────────────────────────────────────

/**
 * The custom-namespace copy an adjustment saves into. The catalogue template is
 * only read: everything below builds a new object.
 *
 * Both languages are carried over — a copy that lost its English half would
 * regress the bilingual contract the catalogue holds.
 *
 * `scaling` is kept: it describes how this session is meant to progress, which
 * stays true of a copy, and it is what gives the copy's own bounds a source.
 */
export function createAdjustedCopy(source: WorkoutTemplate, id = createCustomWorkoutId()): WorkoutTemplate {
  return {
    ...structuredClone(source),
    id,
    name: `${source.name} (ajusté)`,
    nameEn: `${source.nameEn} (adjusted)`,
    sourceWorkoutId: source.id,
  };
}
