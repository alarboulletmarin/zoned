/**
 * JSON Schema (draft 2020-12) of the `/plan/import` payload.
 *
 * Built from the same constants `validateImportPayload` checks against, so
 * the schema an agent reads cannot drift from what Zoned accepts. It states
 * the shape; what a schema cannot say (an id exists in the catalogue, a date
 * is not in the past, a startDate is a Monday) is in each `description`, and
 * the validator remains the authority.
 */

import { AGENT_API_BASE, PLAN_IMPORT_VERSION } from "./constants";
import {
  CONFIG_FIELDS,
  IMPORT_GOALS,
  IMPORT_LEVELS,
  IMPORT_LIMITS,
  IMPORT_PHASES,
  IMPORT_RACE_DISTANCES,
  PLAN_FIELDS,
  RECOMMENDED_MIN_WEEKS_TEXT,
  SESSION_FIELDS,
  WEEK_FIELDS,
} from "./importPayload";

const date = (description: string) => ({ type: "string", format: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description });
const range = (r: { min: number; max: number }, description: string, integer = false) => ({
  type: integer ? "integer" : "number",
  minimum: r.min,
  maximum: r.max,
  description,
});
const day = (description: string) => range({ min: 0, max: 6 }, description, true);

export function buildPlanImportSchema() {
  const L = IMPORT_LIMITS;
  const common = {
    version: { const: PLAN_IMPORT_VERSION, description: "Payload version." },
    raceDistance: { enum: [...IMPORT_RACE_DISTANCES], description: "semi is the half marathon; trail_short ~30 km, trail ~60 km." },
    raceName: { type: "string", maxLength: L.nameMax },
    level: { enum: [...IMPORT_LEVELS] },
    vma: range(L.vma, "VMA (maximal aerobic speed) in km/h."),
  };

  const configProps = {
    ...common,
    kind: { const: "config" },
    raceDate: date("Race day, today or later."),
    daysPerWeek: range(L.daysPerWeek, "Training days per week.", true),
    longRunDay: day("Long run day, 0 = Monday ... 6 = Sunday."),
    startDate: date(
      `Optional plan start, defaults to today. The generator needs ${L.configWeeks.min} to ${L.configWeeks.max} weeks before raceDate; under the recommended minimum (${RECOMMENDED_MIN_WEEKS_TEXT} weeks) it still builds the plan, with a weeks_below_recommended warning.`,
    ),
    goal: { enum: [...IMPORT_GOALS], description: "finish: conservative, time: balanced (default), compete: ambitious." },
    targetPaceMinKm: range(L.targetPaceMinKm, "Target race pace, minutes per km (5.5 = 5:30/km)."),
    elevationGain: range(L.elevationGain, "Race elevation gain in metres, for trail."),
    currentWeeklyKm: range(L.weeklyKm, "Current weekly volume, km."),
    currentLongRunKm: range(L.longRunKm, "Current longest run, km."),
    includeStrength: { type: "boolean" },
    strengthPerWeek: range({ min: 1, max: 3 }, "Strength sessions per week when includeStrength is true.", true),
  };

  const sessionProps = {
    day: day("0 = Monday ... 6 = Sunday."),
    workoutId: {
      type: "string",
      pattern: "^([A-Z]+-\\d{3}|__race_day__)$",
      description: `Must exist in ${AGENT_API_BASE}/workouts.json, or be __race_day__ to mark the race. CUSTOM-* ids are rejected.`,
    },
    note: { type: "string", maxLength: L.noteMax, description: "Shown on the session, in the user's language." },
    durationMin: range(L.durationMin, "Optional fixed duration; defaults to the workout's typical duration."),
  };

  const weekProps = {
    phase: { enum: [...IMPORT_PHASES], description: "Defaults to a standard base/build/peak/taper split when omitted." },
    isRecoveryWeek: { type: "boolean" },
    label: { type: "string", maxLength: L.labelMax },
    sessions: {
      type: "array",
      description: `At most ${L.sessionsPerDayMax} sessions on the same day. An empty array is a rest week.`,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "workoutId"],
        properties: sessionProps,
      },
    },
  };

  const planProps = {
    ...common,
    kind: { const: "plan" },
    name: { type: "string", minLength: 1, maxLength: L.nameMax },
    startDate: date("A Monday. Any other day is moved back to the Monday of its week."),
    raceDate: date("Optional, on or after startDate."),
    weeks: {
      type: "array",
      minItems: L.planWeeks.min,
      maxItems: L.planWeeks.max,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sessions"],
        properties: weekProps,
      },
    },
  };

  // The property lists above and the validator's field lists must agree.
  const keys = (o: object) => Object.keys(o).sort().join(",");
  const same = (a: object, b: readonly string[]) => keys(a) === [...b].sort().join(",");
  if (!same(configProps, CONFIG_FIELDS) || !same(planProps, PLAN_FIELDS) || !same(weekProps, WEEK_FIELDS) || !same(sessionProps, SESSION_FIELDS)) {
    throw new Error("plan-import schema and validator field lists disagree");
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${AGENT_API_BASE}/schema/plan-import.schema.json`,
    title: "Zoned /plan/import payload",
    description:
      "JSON an agent encodes (base64url, UTF-8) into https://zoned.run/plan/import#d=... Two variants: kind config (Zoned generates the plan) and kind plan (the agent writes every week).",
    oneOf: [
      {
        title: "config",
        type: "object",
        additionalProperties: false,
        required: ["version", "kind", "raceDistance", "raceDate", "level", "daysPerWeek", "longRunDay"],
        properties: configProps,
      },
      {
        title: "plan",
        type: "object",
        additionalProperties: false,
        required: ["version", "kind", "name", "startDate", "weeks"],
        properties: planProps,
      },
    ],
  };
}
