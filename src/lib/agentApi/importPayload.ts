/**
 * The `/plan/import` payload: what an AI agent writes, what Zoned accepts.
 *
 * Written for a language model, not for a byte budget, unlike the share
 * links in `lib/share/`: full English keys, no positional tuples, no codes.
 * Two variants, told apart by `kind`:
 *
 *  - `config`: the inputs of an assisted plan. Zoned runs its own generator
 *    on them, exactly as `/plan/shared` does.
 *  - `plan`: a plan the agent wrote week by week, every session a catalogue
 *    workout id.
 *
 * Validation is strict and exhaustive on purpose. The reader of an error is
 * the agent that has to fix its payload, so every issue says where it is
 * (`weeks[2].sessions[0].workoutId`, "week 3, session 1"), what was found and
 * what is allowed, and validation keeps going to report all of them at once.
 *
 * Pure: no React, no i18next, no storage. A future MCP server can import it.
 */

import type { Difficulty, TrainingPhase } from "@/types";
import type {
  AssistedPlanConfig,
  PhaseRange,
  PlanConfig,
  PlanSession,
  PlanWeek,
  RaceDistance,
  TrainingGoal,
  TrainingPlan,
} from "@/types/plan";
import { MAX_PLAN_WEEKS, MIN_PLAN_WEEKS } from "@/lib/planGenerator/constants";
import { calculateFreePhases } from "@/lib/createFreePlan";
import { MAX_WEEKS_PER_PLAN, preparePlanForStorage } from "@/lib/planSchema";
import { addDaysToDate, calculatePlanWeekCount, isoDayOfWeek, mondayOfDate } from "@/lib/planDates";
import { sessionFromWorkout } from "@/lib/weekToPlan";
import { PLAN_IMPORT_VERSION } from "./constants";
import type { CatalogueLookup } from "./catalogue";

// ── Vocabulary, shared with the JSON Schema (schema.ts) ─────────────

export const IMPORT_RACE_DISTANCES: readonly RaceDistance[] = [
  "5K",
  "10K",
  "semi",
  "marathon",
  "trail_short",
  "trail",
];
export const IMPORT_LEVELS: readonly Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];
export const IMPORT_GOALS: readonly TrainingGoal[] = ["finish", "time", "compete"];
export const IMPORT_PHASES: readonly TrainingPhase[] = ["base", "build", "peak", "taper", "recovery"];

export const IMPORT_LIMITS = {
  nameMax: 120,
  noteMax: 500,
  labelMax: 60,
  /** Two a day covers doubles (a run and a strength session). */
  sessionsPerDayMax: 2,
  vma: { min: 8, max: 30 },
  targetPaceMinKm: { min: 2.5, max: 12 },
  elevationGain: { min: 0, max: 20000 },
  weeklyKm: { min: 0, max: 300 },
  longRunKm: { min: 0, max: 150 },
  durationMin: { min: 5, max: 600 },
  daysPerWeek: { min: 3, max: 7 },
  configWeeks: { min: MIN_PLAN_WEEKS, max: MAX_PLAN_WEEKS },
  planWeeks: { min: 1, max: MAX_WEEKS_PER_PLAN },
} as const;

export const CONFIG_FIELDS = [
  "version",
  "kind",
  "raceDistance",
  "raceDate",
  "level",
  "daysPerWeek",
  "longRunDay",
  "startDate",
  "raceName",
  "goal",
  "vma",
  "targetPaceMinKm",
  "elevationGain",
  "currentWeeklyKm",
  "currentLongRunKm",
  "includeStrength",
  "strengthPerWeek",
] as const;

export const PLAN_FIELDS = [
  "version",
  "kind",
  "name",
  "startDate",
  "weeks",
  "raceDistance",
  "raceDate",
  "raceName",
  "level",
  "vma",
] as const;

/**
 * The one marker an agent may place: the race itself. Not a catalogue
 * workout; the plan views, stats and audit already read it by this id.
 */
export const RACE_DAY_WORKOUT_ID = "__race_day__";

export const WEEK_FIELDS = ["phase", "isRecoveryWeek", "label", "sessions"] as const;
export const SESSION_FIELDS = ["day", "workoutId", "note", "durationMin"] as const;

// ── Payload types ───────────────────────────────────────────────────

export interface ImportConfigPayload {
  version: typeof PLAN_IMPORT_VERSION;
  kind: "config";
  raceDistance: RaceDistance;
  raceDate: string;
  level: Difficulty;
  daysPerWeek: number;
  /** 0 = Monday ... 6 = Sunday. */
  longRunDay: number;
  startDate?: string;
  raceName?: string;
  goal?: TrainingGoal;
  vma?: number;
  targetPaceMinKm?: number;
  elevationGain?: number;
  currentWeeklyKm?: number;
  currentLongRunKm?: number;
  includeStrength?: boolean;
  strengthPerWeek?: 1 | 2 | 3;
}

export interface ImportSession {
  /** 0 = Monday ... 6 = Sunday. */
  day: number;
  workoutId: string;
  note?: string;
  durationMin?: number;
}

export interface ImportWeek {
  phase?: TrainingPhase;
  isRecoveryWeek?: boolean;
  label?: string;
  sessions: ImportSession[];
}

export interface ImportPlanPayload {
  version: typeof PLAN_IMPORT_VERSION;
  kind: "plan";
  name: string;
  /** A Monday. Another day is moved back to its week's Monday, with a warning. */
  startDate: string;
  weeks: ImportWeek[];
  raceDistance?: RaceDistance;
  raceDate?: string;
  raceName?: string;
  level?: Difficulty;
  vma?: number;
}

export type ImportPayload = ImportConfigPayload | ImportPlanPayload;

// ── Issues ──────────────────────────────────────────────────────────

export type ImportIssueCode =
  | "not_object"
  | "unsupported_version"
  | "unknown_kind"
  | "unknown_field"
  | "missing_field"
  | "invalid_type"
  | "invalid_enum"
  | "invalid_date"
  | "date_in_past"
  | "out_of_range"
  | "race_before_start"
  | "weeks_out_of_range"
  | "text_too_long"
  | "unknown_workout"
  | "custom_workout"
  | "too_many_sessions_day"
  | "empty_plan"
  | "start_moved_to_monday"
  | "empty_week";

export type IssueParams = Record<string, string | number>;

export interface ImportIssue {
  code: ImportIssueCode;
  /** JSON path into the payload, `weeks[2].sessions[0].workoutId`. Empty for the root. */
  path: string;
  params: IssueParams;
}

export type ValidationResult =
  | { ok: true; payload: ImportPayload; warnings: ImportIssue[] }
  | { ok: false; errors: ImportIssue[]; warnings: ImportIssue[] };

export interface ValidateOptions {
  /** Today, `YYYY-MM-DD`. Injected so validation is deterministic in tests. */
  today: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

const jsonType = (v: unknown): string => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
const join = (base: string, key: string | number): string =>
  typeof key === "number" ? `${base}[${key}]` : base ? `${base}.${key}` : key;

class Collector {
  errors: ImportIssue[] = [];
  warnings: ImportIssue[] = [];
  error(code: ImportIssueCode, path: string, params: IssueParams = {}) {
    this.errors.push({ code, path, params });
  }
  warn(code: ImportIssueCode, path: string, params: IssueParams = {}) {
    this.warnings.push({ code, path, params });
  }
}

function checkUnknownFields(obj: Raw, allowed: readonly string[], path: string, c: Collector) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      c.error("unknown_field", join(path, key), { field: key, allowed: allowed.join(", ") });
    }
  }
}

function readString(
  obj: Raw,
  key: string,
  path: string,
  c: Collector,
  opts: { required?: boolean; max?: number } = {},
): string | undefined {
  const value = obj[key];
  const at = join(path, key);
  if (value === undefined) {
    if (opts.required) c.error("missing_field", at, { field: key });
    return undefined;
  }
  if (typeof value !== "string") {
    c.error("invalid_type", at, { field: key, expected: "string", got: jsonType(value) });
    return undefined;
  }
  const trimmed = value.trim();
  if (opts.required && trimmed.length === 0) {
    c.error("missing_field", at, { field: key });
    return undefined;
  }
  if (opts.max !== undefined && trimmed.length > opts.max) {
    c.error("text_too_long", at, { field: key, max: opts.max, length: trimmed.length });
    return undefined;
  }
  return trimmed.length > 0 ? trimmed : undefined;
}

function readNumber(
  obj: Raw,
  key: string,
  path: string,
  c: Collector,
  range: { min: number; max: number },
  opts: { required?: boolean; integer?: boolean } = {},
): number | undefined {
  const value = obj[key];
  const at = join(path, key);
  if (value === undefined) {
    if (opts.required) c.error("missing_field", at, { field: key });
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    c.error("invalid_type", at, {
      field: key,
      expected: opts.integer ? "integer" : "number",
      got: jsonType(value),
    });
    return undefined;
  }
  if ((opts.integer && !Number.isInteger(value)) || value < range.min || value > range.max) {
    c.error("out_of_range", at, {
      field: key,
      value,
      min: range.min,
      max: range.max,
      ...(opts.integer && { integer: "yes" }),
    });
    return undefined;
  }
  return value;
}

function readEnum<T extends string>(
  obj: Raw,
  key: string,
  path: string,
  c: Collector,
  allowed: readonly T[],
  opts: { required?: boolean } = {},
): T | undefined {
  const value = obj[key];
  const at = join(path, key);
  if (value === undefined) {
    if (opts.required) c.error("missing_field", at, { field: key });
    return undefined;
  }
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    c.error("invalid_enum", at, { field: key, value: String(value), allowed: allowed.join(", ") });
    return undefined;
  }
  return value as T;
}

function readBoolean(obj: Raw, key: string, path: string, c: Collector): boolean | undefined {
  const value = obj[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    c.error("invalid_type", join(path, key), { field: key, expected: "boolean", got: jsonType(value) });
    return undefined;
  }
  return value;
}

function readDate(
  obj: Raw,
  key: string,
  path: string,
  c: Collector,
  opts: { required?: boolean; notBefore?: string } = {},
): string | undefined {
  const value = readString(obj, key, path, c, { required: opts.required });
  if (value === undefined) return undefined;
  const at = join(path, key);
  if (!isRealIsoDate(value)) {
    c.error("invalid_date", at, { field: key, value });
    return undefined;
  }
  if (opts.notBefore && value < opts.notBefore) {
    c.error("date_in_past", at, { field: key, value, today: opts.notBefore });
    return undefined;
  }
  return value;
}

// ── Validation ──────────────────────────────────────────────────────

function validateConfig(obj: Raw, c: Collector, today: string): ImportConfigPayload | null {
  checkUnknownFields(obj, CONFIG_FIELDS, "", c);
  const L = IMPORT_LIMITS;

  const raceDistance = readEnum(obj, "raceDistance", "", c, IMPORT_RACE_DISTANCES, { required: true });
  const raceDate = readDate(obj, "raceDate", "", c, { required: true, notBefore: today });
  const level = readEnum(obj, "level", "", c, IMPORT_LEVELS, { required: true });
  const daysPerWeek = readNumber(obj, "daysPerWeek", "", c, L.daysPerWeek, { required: true, integer: true });
  const longRunDay = readNumber(obj, "longRunDay", "", c, { min: 0, max: 6 }, { required: true, integer: true });
  const startDate = readDate(obj, "startDate", "", c, { notBefore: today });
  const raceName = readString(obj, "raceName", "", c, { max: L.nameMax });
  const goal = readEnum(obj, "goal", "", c, IMPORT_GOALS);
  const vma = readNumber(obj, "vma", "", c, L.vma);
  const targetPaceMinKm = readNumber(obj, "targetPaceMinKm", "", c, L.targetPaceMinKm);
  const elevationGain = readNumber(obj, "elevationGain", "", c, L.elevationGain);
  const currentWeeklyKm = readNumber(obj, "currentWeeklyKm", "", c, L.weeklyKm);
  const currentLongRunKm = readNumber(obj, "currentLongRunKm", "", c, L.longRunKm);
  const includeStrength = readBoolean(obj, "includeStrength", "", c);
  const strengthPerWeek = readNumber(obj, "strengthPerWeek", "", c, { min: 1, max: 3 }, { integer: true });

  if (raceDate) {
    const from = startDate ?? today;
    if (raceDate <= from) {
      c.error("race_before_start", "raceDate", { raceDate, startDate: from });
    } else {
      const weeks = calculatePlanWeekCount(from, raceDate);
      if (weeks < L.configWeeks.min || weeks > L.configWeeks.max) {
        c.error("weeks_out_of_range", "raceDate", {
          count: weeks,
          min: L.configWeeks.min,
          max: L.configWeeks.max,
          from,
        });
      }
    }
  }

  if (c.errors.length > 0 || !raceDistance || !raceDate || !level || daysPerWeek === undefined || longRunDay === undefined) {
    return null;
  }
  return {
    version: PLAN_IMPORT_VERSION,
    kind: "config",
    raceDistance,
    raceDate,
    level,
    daysPerWeek,
    longRunDay,
    ...(startDate && { startDate }),
    ...(raceName && { raceName }),
    ...(goal && { goal }),
    ...(vma !== undefined && { vma }),
    ...(targetPaceMinKm !== undefined && { targetPaceMinKm }),
    ...(elevationGain !== undefined && { elevationGain }),
    ...(currentWeeklyKm !== undefined && { currentWeeklyKm }),
    ...(currentLongRunKm !== undefined && { currentLongRunKm }),
    ...(includeStrength !== undefined && { includeStrength }),
    ...(strengthPerWeek !== undefined && { strengthPerWeek: strengthPerWeek as 1 | 2 | 3 }),
  };
}

function suggestionFor(id: string, lookup: CatalogueLookup): string | undefined {
  const upper = id.trim().toUpperCase();
  if (upper !== id && lookup.has(upper)) return upper;
  // `END-1` for `END-001`: same prefix, same number, unpadded.
  const m = /^([A-Z]+)-?(\d+)$/.exec(upper);
  if (m) {
    const padded = `${m[1]}-${m[2].padStart(3, "0")}`;
    if (padded !== id && lookup.has(padded)) return padded;
  }
  return undefined;
}

function validateSession(
  raw: unknown,
  path: string,
  week: number,
  index: number,
  c: Collector,
  lookup: CatalogueLookup,
): ImportSession | null {
  if (!isObject(raw)) {
    c.error("invalid_type", path, { field: "session", expected: "object", got: jsonType(raw), week, session: index + 1 });
    return null;
  }
  checkUnknownFields(raw, SESSION_FIELDS, path, c);
  const day = readNumber(raw, "day", path, c, { min: 0, max: 6 }, { required: true, integer: true });
  const workoutId = readString(raw, "workoutId", path, c, { required: true });
  const note = readString(raw, "note", path, c, { max: IMPORT_LIMITS.noteMax });
  const durationMin = readNumber(raw, "durationMin", path, c, IMPORT_LIMITS.durationMin);

  let known = false;
  if (workoutId) {
    const at = join(path, "workoutId");
    if (workoutId === RACE_DAY_WORKOUT_ID) {
      known = true;
    } else if (workoutId.toUpperCase().startsWith("CUSTOM-")) {
      c.error("custom_workout", at, { workoutId, week, session: index + 1 });
    } else if (!lookup.has(workoutId)) {
      const suggestion = suggestionFor(workoutId, lookup);
      c.error("unknown_workout", at, {
        workoutId,
        week,
        session: index + 1,
        ...(suggestion && { suggestion }),
      });
    } else {
      known = true;
    }
  }

  if (day === undefined || !workoutId || !known) return null;
  return {
    day,
    workoutId,
    ...(note && { note }),
    ...(durationMin !== undefined && { durationMin }),
  };
}

function validatePlan(obj: Raw, c: Collector, lookup: CatalogueLookup): ImportPlanPayload | null {
  checkUnknownFields(obj, PLAN_FIELDS, "", c);
  const L = IMPORT_LIMITS;

  const name = readString(obj, "name", "", c, { required: true, max: L.nameMax });
  let startDate = readDate(obj, "startDate", "", c, { required: true });
  const raceDistance = readEnum(obj, "raceDistance", "", c, IMPORT_RACE_DISTANCES);
  const raceDate = readDate(obj, "raceDate", "", c);
  const raceName = readString(obj, "raceName", "", c, { max: L.nameMax });
  const level = readEnum(obj, "level", "", c, IMPORT_LEVELS);
  const vma = readNumber(obj, "vma", "", c, L.vma);

  if (startDate && isoDayOfWeek(startDate) !== 0) {
    const monday = mondayOfDate(startDate);
    c.warn("start_moved_to_monday", "startDate", { from: startDate, to: monday });
    startDate = monday;
  }
  if (startDate && raceDate && raceDate < startDate) {
    c.error("race_before_start", "raceDate", { raceDate, startDate });
  }

  const weeks: ImportWeek[] = [];
  const rawWeeks = obj.weeks;
  if (rawWeeks === undefined) {
    c.error("missing_field", "weeks", { field: "weeks" });
  } else if (!Array.isArray(rawWeeks)) {
    c.error("invalid_type", "weeks", { field: "weeks", expected: "array", got: jsonType(rawWeeks) });
  } else if (rawWeeks.length < L.planWeeks.min || rawWeeks.length > L.planWeeks.max) {
    c.error("weeks_out_of_range", "weeks", { count: rawWeeks.length, min: L.planWeeks.min, max: L.planWeeks.max });
  } else {
    rawWeeks.forEach((rawWeek, wi) => {
      const path = join("weeks", wi);
      const week = wi + 1;
      if (!isObject(rawWeek)) {
        c.error("invalid_type", path, { field: "week", expected: "object", got: jsonType(rawWeek), week });
        return;
      }
      checkUnknownFields(rawWeek, WEEK_FIELDS, path, c);
      const phase = readEnum(rawWeek, "phase", path, c, IMPORT_PHASES);
      const isRecoveryWeek = readBoolean(rawWeek, "isRecoveryWeek", path, c);
      const label = readString(rawWeek, "label", path, c, { max: L.labelMax });

      const sessions: ImportSession[] = [];
      const rawSessions = rawWeek.sessions;
      const sessionsPath = join(path, "sessions");
      if (rawSessions === undefined) {
        c.error("missing_field", sessionsPath, { field: "sessions", week });
      } else if (!Array.isArray(rawSessions)) {
        c.error("invalid_type", sessionsPath, { field: "sessions", expected: "array", got: jsonType(rawSessions), week });
      } else {
        rawSessions.forEach((rawSession, si) => {
          const session = validateSession(rawSession, join(sessionsPath, si), week, si, c, lookup);
          if (session) sessions.push(session);
        });
        if (rawSessions.length === 0) c.warn("empty_week", path, { week });

        const perDay = new Map<number, number>();
        for (const s of sessions) perDay.set(s.day, (perDay.get(s.day) ?? 0) + 1);
        for (const [day, count] of perDay) {
          if (count > L.sessionsPerDayMax) {
            c.error("too_many_sessions_day", sessionsPath, { week, day, count, max: L.sessionsPerDayMax });
          }
        }
      }

      weeks.push({
        ...(phase && { phase }),
        ...(isRecoveryWeek !== undefined && { isRecoveryWeek }),
        ...(label && { label }),
        sessions: sessions.sort((a, b) => a.day - b.day),
      });
    });
    if (Array.isArray(rawWeeks) && rawWeeks.every((w) => isObject(w) && Array.isArray(w.sessions) && w.sessions.length === 0)) {
      c.error("empty_plan", "weeks", {});
    }
  }

  if (c.errors.length > 0 || !name || !startDate) return null;
  return {
    version: PLAN_IMPORT_VERSION,
    kind: "plan",
    name,
    startDate,
    weeks,
    ...(raceDistance && { raceDistance }),
    ...(raceDate && { raceDate }),
    ...(raceName && { raceName }),
    ...(level && { level }),
    ...(vma !== undefined && { vma }),
  };
}

/** Validate a decoded payload against the catalogue. Reports every issue. */
export function validateImportPayload(
  raw: unknown,
  lookup: CatalogueLookup,
  options: ValidateOptions,
): ValidationResult {
  const c = new Collector();
  if (!isObject(raw)) {
    c.error("not_object", "", { got: jsonType(raw) });
    return { ok: false, errors: c.errors, warnings: c.warnings };
  }
  if (raw.version !== PLAN_IMPORT_VERSION) {
    c.error("unsupported_version", "version", {
      value: raw.version === undefined ? "missing" : String(raw.version),
      expected: PLAN_IMPORT_VERSION,
    });
  }
  let payload: ImportPayload | null = null;
  if (raw.kind === "config") payload = validateConfig(raw, c, options.today);
  else if (raw.kind === "plan") payload = validatePlan(raw, c, lookup);
  else c.error("unknown_kind", "kind", { value: raw.kind === undefined ? "missing" : String(raw.kind) });

  if (c.errors.length > 0 || !payload) return { ok: false, errors: c.errors, warnings: c.warnings };
  return { ok: true, payload, warnings: c.warnings };
}

// ── Payload to Zoned objects ────────────────────────────────────────

/** `config` payload to the input of `generatePlan()`, minus `id`/`createdAt`. */
export function importConfigToPlanConfig(
  p: ImportConfigPayload,
): Omit<AssistedPlanConfig, "id" | "createdAt"> {
  return {
    planMode: "assisted",
    raceDistance: p.raceDistance,
    raceDate: p.raceDate,
    runnerLevel: p.level,
    daysPerWeek: p.daysPerWeek,
    longRunDay: p.longRunDay,
    ...(p.startDate && { startDate: p.startDate }),
    ...(p.raceName && { raceName: p.raceName }),
    ...(p.goal && { trainingGoal: p.goal }),
    ...(p.vma !== undefined && { vma: p.vma }),
    ...(p.targetPaceMinKm !== undefined && { targetPaceMinKm: p.targetPaceMinKm }),
    ...(p.elevationGain !== undefined && { elevationGain: p.elevationGain }),
    ...(p.currentWeeklyKm !== undefined && { currentWeeklyKm: p.currentWeeklyKm }),
    ...(p.currentLongRunKm !== undefined && { currentLongRunKm: p.currentLongRunKm }),
    ...(p.includeStrength !== undefined && { includeStrength: p.includeStrength }),
    ...(p.strengthPerWeek !== undefined && { strengthFrequency: p.strengthPerWeek }),
  };
}

const RECOVERY_VOLUME_PERCENT = 60;

/** Contiguous runs of one phase, the `PhaseRange[]` a plan carries. */
function phaseRanges(weeks: readonly PlanWeek[]): PhaseRange[] {
  const ranges: PhaseRange[] = [];
  for (const w of weeks) {
    const last = ranges[ranges.length - 1];
    if (last && last.phase === w.phase && last.endWeek === w.weekNumber - 1) last.endWeek = w.weekNumber;
    else ranges.push({ phase: w.phase, startWeek: w.weekNumber, endWeek: w.weekNumber });
  }
  return ranges;
}

/**
 * `plan` payload to a full `TrainingPlan`, ready for `savePlan()`. Sessions
 * are built by `sessionFromWorkout`, the path a session picked by hand in the
 * plan editor takes, so an imported session carries the same type, key flag,
 * duration and precision as one added in the app. A week without a phase
 * gets the one a free plan of that length would have.
 *
 * Expects a payload `validateImportPayload` accepted: an unknown id throws.
 */
export function importPlanToTrainingPlan(
  p: ImportPlanPayload,
  lookup: CatalogueLookup,
  meta: { id: string; createdAt: string },
): TrainingPlan {
  const defaults = calculateFreePhases(p.weeks.length);
  const defaultPhase = (n: number): TrainingPhase =>
    defaults.find((r) => n >= r.startWeek && n <= r.endWeek)?.phase ?? "base";

  const weeks: PlanWeek[] = p.weeks.map((w, i) => {
    const weekNumber = i + 1;
    const isRecoveryWeek = w.isRecoveryWeek ?? w.phase === "recovery";
    return {
      weekNumber,
      phase: w.phase ?? defaultPhase(weekNumber),
      isRecoveryWeek,
      volumePercent: isRecoveryWeek ? RECOVERY_VOLUME_PERCENT : 100,
      ...(w.label && { weekLabel: w.label, weekLabelEn: w.label }),
      sessions: w.sessions.map((s): PlanSession => {
        if (s.workoutId === RACE_DAY_WORKOUT_ID) {
          return {
            dayOfWeek: s.day,
            workoutId: RACE_DAY_WORKOUT_ID,
            sessionType: "race_specific",
            isKeySession: true,
            estimatedDurationMin: s.durationMin ?? 0,
            ...(s.note && { notes: s.note, notesEn: s.note }),
          };
        }
        const workout = lookup.get(s.workoutId);
        if (!workout) throw new Error(`Unknown workout ${s.workoutId}`);
        const session = sessionFromWorkout(s.day, workout);
        return {
          ...session,
          ...(s.note && { notes: s.note, notesEn: s.note }),
          // An explicit duration is a decision, not a range: it is fixed.
          ...(s.durationMin !== undefined && {
            estimatedDurationMin: s.durationMin,
            precision: "fixed" as const,
          }),
        };
      }),
    };
  });

  const daysUsed = new Set(weeks.flatMap((w) => w.sessions.map((s) => s.dayOfWeek)));
  const config: PlanConfig = {
    id: meta.id,
    planMode: "free",
    planName: p.name,
    daysPerWeek: Math.max(1, Math.min(7, daysUsed.size)),
    createdAt: meta.createdAt,
    startDate: p.startDate,
    // Same convention as createFreePlan: start + totalWeeks * 7.
    endDate: addDaysToDate(p.startDate, weeks.length * 7),
    ...(p.raceDistance && { raceDistance: p.raceDistance }),
    ...(p.raceDate && { raceDate: p.raceDate }),
    ...(p.raceName && { raceName: p.raceName }),
    ...(p.level && { runnerLevel: p.level }),
    ...(p.vma !== undefined && { vma: p.vma }),
  };

  return preparePlanForStorage({
    id: meta.id,
    config,
    weeks,
    totalWeeks: weeks.length,
    phases: phaseRanges(weeks),
    name: p.name,
    nameEn: p.name,
  });
}
