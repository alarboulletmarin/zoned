/**
 * The flat form of the `/plan/import` link, for a standard race plan.
 *
 *   https://zoned.run/plan/import#distance=10K&date=2027-05-23&days=3&time=1:10:00
 *
 * An agent that cannot run code, or that simply should not have to, writes
 * the link by hand: no JSON, no base64, nothing to percent-encode beyond a
 * race name. It only ever means `kind: "config"`; a plan written session by
 * session still goes through `#d=` (`importLink.ts`).
 *
 * The parameters are turned into a `config` payload and checked by
 * `validateImportPayload`, the validator every other form goes through, so
 * there is one rule set. What this file adds is leniency where a person
 * would be lenient (`10k`, `half`, `sunday`, `6:45`, a decimal comma) and
 * defaults where the app itself has one, each default reported as a warning
 * so the preview says what was assumed. Every issue is then renamed to the
 * parameter the agent wrote, so `raceDate` never shows up in a report about
 * a link that said `date`.
 *
 * Read from the fragment first. The query is accepted too, for an agent
 * that writes `?distance=`: those values (a distance, a date, a pace) are not
 * the personal plan the fragment rule protects, and refusing them would only
 * break the link. `lang` stays a query parameter of the page, never a field.
 *
 * Pure: no React, no i18next, no storage.
 */

import type { RaceDistance } from "@/types/plan";
import { addDaysToDate, defaultPlanStart } from "@/lib/planDates";
import { PLAN_IMPORT_PATH, PLAN_IMPORT_VERSION, SITE_URL } from "./constants";
import type { CatalogueLookup } from "./catalogue";
import {
  IMPORT_LIMITS,
  validateImportPayload,
  type ImportIssue,
  type ValidateOptions,
  type ValidationResult,
} from "./importPayload";

// ── Vocabulary ──────────────────────────────────────────────────────

export interface ImportParamSpec {
  /** The parameter, as written in the link. Read case-insensitively. */
  key: string;
  /** The `config` field it fills, or `null` when it is derived (`time`). */
  field: string | null;
  required: boolean;
  /** What a value looks like, for the docs, the schema and the errors. */
  format: string;
  /** Used when the parameter is absent, and reported as a warning. */
  default?: string;
  /** What it is for, English then French: the docs page ships both. */
  note: string;
  noteFr: string;
}

/** Day names an agent may write for `longrun`, English and French. */
const DAY_NAMES: Record<string, number> = {
  mon: 0, monday: 0, lun: 0, lundi: 0,
  tue: 1, tuesday: 1, mar: 1, mardi: 1,
  wed: 2, wednesday: 2, mer: 2, mercredi: 2,
  thu: 3, thursday: 3, jeu: 3, jeudi: 3,
  fri: 4, friday: 4, ven: 4, vendredi: 4,
  sat: 5, saturday: 5, sam: 5, samedi: 5,
  sun: 6, sunday: 6, dim: 6, dimanche: 6,
};

/** Spellings of a race distance, once lowercased and stripped of `-`, `_`, spaces. */
const DISTANCE_ALIASES: Record<string, RaceDistance> = {
  "5k": "5K", "5km": "5K",
  "10k": "10K", "10km": "10K",
  semi: "semi", half: "semi", halfmarathon: "semi", semimarathon: "semi", "21k": "semi", "21km": "semi",
  marathon: "marathon", "42k": "marathon", "42km": "marathon",
  trailshort: "trail_short", shorttrail: "trail_short", trailcourt: "trail_short",
  trail: "trail", traillong: "trail", longtrail: "trail",
};

/** Race length in km, for `time`. Trail distances have none: a trail time says nothing about a pace. */
const DISTANCE_KM: Partial<Record<RaceDistance, number>> = {
  "5K": 5,
  "10K": 10,
  semi: 21.0975,
  marathon: 42.195,
};

export const DEFAULT_LEVEL = "intermediate";
/** Sunday, the long run day the plan wizard starts from. */
export const DEFAULT_LONG_RUN_DAY = 6;

const L = IMPORT_LIMITS;

export const IMPORT_PARAMS: readonly ImportParamSpec[] = [
  {
    key: "distance",
    field: "raceDistance",
    required: true,
    format: "5K | 10K | semi | marathon | trail_short | trail",
    note: "half and 21k mean semi, 42k means marathon",
    noteFr: "half et 21k valent semi, 42k vaut marathon",
  },
  {
    key: "date",
    field: "raceDate",
    required: true,
    format: "YYYY-MM-DD",
    note: `race day, ${L.configWeeks.min} to ${L.configWeeks.max} weeks after the start`,
    noteFr: `jour de la course, ${L.configWeeks.min} à ${L.configWeeks.max} semaines après le début`,
  },
  {
    key: "days",
    field: "daysPerWeek",
    required: true,
    format: `integer ${L.daysPerWeek.min}-${L.daysPerWeek.max}`,
    note: "runs per week",
    noteFr: "séances par semaine",
  },
  {
    key: "level",
    field: "level",
    required: false,
    format: "beginner | intermediate | advanced | elite",
    default: DEFAULT_LEVEL,
    note: "the runner, not the goal",
    noteFr: "le niveau du coureur, pas l'objectif",
  },
  {
    key: "longrun",
    field: "longRunDay",
    required: false,
    format: "mon ... sun, or 0-6 with 0 = Monday",
    default: "sun",
    note: "day of the long run",
    noteFr: "jour de la sortie longue",
  },
  {
    key: "time",
    field: null,
    required: false,
    format: "H:MM:SS",
    note: "target finish time, road distances only; Zoned derives the pace. Implies goal=time",
    noteFr: "temps visé, distances sur route seulement, Zoned en déduit l'allure. Implique goal=time",
  },
  {
    key: "pace",
    field: "targetPaceMinKm",
    required: false,
    format: "M:SS per km",
    note: `target race pace, ${L.targetPaceMinKm.min}-${L.targetPaceMinKm.max} min/km; give time or pace, not both. Implies goal=time`,
    noteFr: `allure de course visée, ${L.targetPaceMinKm.min}-${L.targetPaceMinKm.max} min/km, time ou pace mais pas les deux. Implique goal=time`,
  },
  {
    key: "goal",
    field: "goal",
    required: false,
    format: "finish | time | compete",
    note: "finish when there is no target",
    noteFr: "finish quand il n'y a pas d'objectif chiffré",
  },
  {
    key: "vma",
    field: "vma",
    required: false,
    format: `km/h, ${L.vma.min}-${L.vma.max}`,
    note: "maximal aerobic speed, if known",
    noteFr: "vitesse maximale aérobie, si elle est connue",
  },
  {
    key: "start",
    field: "startDate",
    required: false,
    format: "YYYY-MM-DD",
    note: "first day of the plan, defaults to today",
    noteFr: "premier jour du plan, par défaut aujourd'hui",
  },
  {
    key: "name",
    field: "raceName",
    required: false,
    format: `text, ${L.nameMax} characters max`,
    note: "percent-encode spaces as %20",
    noteFr: "espaces encodées en %20",
  },
  {
    key: "elevation",
    field: "elevationGain",
    required: false,
    format: `metres, ${L.elevationGain.min}-${L.elevationGain.max}`,
    note: "race elevation gain, for trail",
    noteFr: "dénivelé positif de la course, pour le trail",
  },
  {
    key: "weeklykm",
    field: "currentWeeklyKm",
    required: false,
    format: `km, ${L.weeklyKm.min}-${L.weeklyKm.max}`,
    note: "current weekly volume",
    noteFr: "volume hebdomadaire actuel",
  },
  {
    key: "longrunkm",
    field: "currentLongRunKm",
    required: false,
    format: `km, ${L.longRunKm.min}-${L.longRunKm.max}`,
    note: "current longest run",
    noteFr: "plus longue sortie actuelle",
  },
  {
    key: "strength",
    field: "strengthPerWeek",
    required: false,
    format: "integer 0-3",
    note: "strength sessions per week, 0 for none",
    noteFr: "séances de renforcement par semaine, 0 pour aucune",
  },
];

const SPEC_BY_KEY = new Map(IMPORT_PARAMS.map((p) => [p.key, p]));
const PARAM_KEYS = IMPORT_PARAMS.map((p) => p.key);
/** Query keys the page owns, never read as plan fields. */
const PAGE_KEYS = new Set(["lang"]);
/** The encoded forms, handled by `readImportFragment`. */
const ENCODED_KEYS = new Set(["d", "j"]);

// ── Reading the link ────────────────────────────────────────────────

export type ImportParams = Record<string, string>;

function collect(search: URLSearchParams): ImportParams {
  const out: ImportParams = {};
  for (const [rawKey, value] of search) {
    const key = rawKey.trim().toLowerCase();
    if (!key || PAGE_KEYS.has(key) || ENCODED_KEYS.has(key)) continue;
    // A repeated key keeps its first value, as URLSearchParams.get would.
    if (!(key in out)) out[key] = value.trim();
  }
  return out;
}

/**
 * The flat parameters of a `/plan/import` URL, or `null` when it carries
 * none (an encoded `#d=` / `#j=` link, or nothing at all). The fragment wins;
 * the query is read only when the fragment holds no parameter.
 */
export function readImportParams(hash: string, search = ""): ImportParams | null {
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  if (fragment.has("d") || fragment.has("j")) return null;
  const fromHash = collect(fragment);
  if (Object.keys(fromHash).length > 0) return fromHash;
  const fromQuery = collect(new URLSearchParams(search.replace(/^\?/, "")));
  return Object.keys(fromQuery).length > 0 ? fromQuery : null;
}

// ── Values ──────────────────────────────────────────────────────────

/** `6:45`, `6'45`, `6:45/km`, `6.75`, `6,75`, `7` to minutes per km. */
export function parsePace(value: string): number | null {
  const v = value
    .trim()
    .toLowerCase()
    .replace(/\s*(min)?\s*\/\s*km$/, "")
    .replace(/\s*min$/, "")
    .replace(/(''|"|\u201d)$/, "")
    .replace(/['\u2019]/, ":");
  const clock = /^(\d{1,2}):([0-5]\d)$/.exec(v);
  if (clock) return Number(clock[1]) + Number(clock[2]) / 60;
  const decimal = /^\d{1,2}([.,]\d+)?$/.exec(v);
  return decimal ? Number(v.replace(",", ".")) : null;
}

/** `1:10:00`, `45:30`, `1h10`, `1h10m30s`, `45min` to minutes. */
export function parseDuration(value: string): number | null {
  const v = value.trim().toLowerCase().replace(/\s+/g, "");
  const hms = /^(\d{1,2}):([0-5]\d):([0-5]\d)$/.exec(v);
  if (hms) return Number(hms[1]) * 60 + Number(hms[2]) + Number(hms[3]) / 60;
  const ms = /^(\d{1,3}):([0-5]\d)$/.exec(v);
  if (ms) return Number(ms[1]) + Number(ms[2]) / 60;
  const units = /^(?:(\d{1,2})h)?(?:(\d{1,3})(?:m|min|mn)?)?(?:(\d{1,2})s)?$/.exec(v);
  if (units && (units[1] || units[2] || units[3]) && /[hms]/.test(v)) {
    return Number(units[1] ?? 0) * 60 + Number(units[2] ?? 0) + Number(units[3] ?? 0) / 60;
  }
  return null;
}

/** Minutes to `H:MM:SS`, the format the errors quote back. */
export function formatDuration(minutes: number): string {
  const total = Math.round(minutes * 60);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * A number when the text is one, the text otherwise: the validator then says
 * "must be number, got string", at the parameter's name.
 */
function numberOr(value: string): number | string {
  const v = value.replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : value;
}

function distanceOf(value: string): string {
  return DISTANCE_ALIASES[value.toLowerCase().replace(/[\s_-]/g, "")] ?? value;
}

function dayOf(value: string): number | string {
  const named = DAY_NAMES[value.toLowerCase().replace(/\.$/, "")];
  return named ?? numberOr(value);
}

// ── Params to payload ───────────────────────────────────────────────

interface Conversion {
  raw: Record<string, unknown>;
  errors: ImportIssue[];
  warnings: ImportIssue[];
  /** `config` field to the parameter that filled it, for renaming issues. */
  source: Map<string, string>;
}

function toConfig(params: ImportParams): Conversion {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const source = new Map<string, string>();
  const raw: Record<string, unknown> = { version: PLAN_IMPORT_VERSION, kind: "config" };
  const set = (field: string, key: string, value: unknown) => {
    raw[field] = value;
    source.set(field, key);
  };

  for (const key of Object.keys(params)) {
    if (!SPEC_BY_KEY.has(key)) {
      errors.push({ code: "unknown_field", path: key, params: { field: key, allowed: PARAM_KEYS.join(", ") } });
    }
  }

  const p = (key: string): string | undefined => {
    const v = params[key];
    return v === undefined || v === "" ? undefined : v;
  };

  const distance = p("distance");
  if (distance !== undefined) set("raceDistance", "distance", distanceOf(distance));
  const date = p("date");
  if (date !== undefined) set("raceDate", "date", date);
  const days = p("days");
  if (days !== undefined) set("daysPerWeek", "days", numberOr(days));

  const level = p("level");
  if (level !== undefined) set("level", "level", level.toLowerCase());
  else {
    set("level", "level", DEFAULT_LEVEL);
    warnings.push({ code: "default_applied", path: "level", params: { field: "level", value: DEFAULT_LEVEL } });
  }

  const longrun = p("longrun");
  if (longrun !== undefined) set("longRunDay", "longrun", dayOf(longrun));
  else {
    set("longRunDay", "longrun", DEFAULT_LONG_RUN_DAY);
    warnings.push({ code: "default_applied", path: "longrun", params: { field: "longrun", value: "sun" } });
  }

  const time = p("time");
  const pace = p("pace");
  if (time !== undefined && pace !== undefined) {
    errors.push({ code: "conflicting_fields", path: "time", params: { field: "time", other: "pace" } });
  } else if (pace !== undefined) {
    const minKm = parsePace(pace);
    if (minKm === null) {
      errors.push({ code: "invalid_format", path: "pace", params: { field: "pace", value: pace, expected: "M:SS per km, e.g. 6:45" } });
    } else {
      set("targetPaceMinKm", "pace", Math.round(minKm * 1000) / 1000);
    }
  } else if (time !== undefined) {
    const minutes = parseDuration(time);
    const km = DISTANCE_KM[raw.raceDistance as RaceDistance];
    if (minutes === null) {
      errors.push({ code: "invalid_format", path: "time", params: { field: "time", value: time, expected: "H:MM:SS, e.g. 1:10:00" } });
    } else if (typeof raw.raceDistance === "string" && km === undefined) {
      // An unknown distance is reported on `distance`; a trail one has no pace.
      if (Object.values(DISTANCE_ALIASES).includes(raw.raceDistance as RaceDistance)) {
        errors.push({ code: "time_needs_road_distance", path: "time", params: { field: "time", distance: raw.raceDistance } });
      }
    } else if (km !== undefined) {
      const minKm = minutes / km;
      if (minKm < L.targetPaceMinKm.min || minKm > L.targetPaceMinKm.max) {
        errors.push({
          code: "out_of_range",
          path: "time",
          params: {
            field: "time",
            value: time,
            min: formatDuration(L.targetPaceMinKm.min * km),
            max: formatDuration(L.targetPaceMinKm.max * km),
          },
        });
      } else {
        set("targetPaceMinKm", "time", Math.round(minKm * 1000) / 1000);
      }
    }
  }

  const goal = p("goal");
  if (goal !== undefined) set("goal", "goal", goal.toLowerCase());
  else if (time !== undefined || pace !== undefined) set("goal", "goal", "time");

  const vma = p("vma");
  if (vma !== undefined) set("vma", "vma", numberOr(vma));
  const start = p("start");
  if (start !== undefined) set("startDate", "start", start);
  const name = p("name");
  if (name !== undefined) set("raceName", "name", name);
  const elevation = p("elevation");
  if (elevation !== undefined) set("elevationGain", "elevation", numberOr(elevation));
  const weeklykm = p("weeklykm");
  if (weeklykm !== undefined) set("currentWeeklyKm", "weeklykm", numberOr(weeklykm));
  const longrunkm = p("longrunkm");
  if (longrunkm !== undefined) set("currentLongRunKm", "longrunkm", numberOr(longrunkm));

  const strength = p("strength");
  if (strength !== undefined) {
    const n = numberOr(strength);
    if (n === 0) {
      set("includeStrength", "strength", false);
    } else {
      set("includeStrength", "strength", true);
      set("strengthPerWeek", "strength", n);
    }
  }

  return { raw, errors, warnings, source };
}

/** Rename an issue raised on a `config` field to the parameter the link used. */
function renamed(issue: ImportIssue, source: Map<string, string>): ImportIssue {
  const key = source.get(issue.path);
  if (!key) {
    const spec = IMPORT_PARAMS.find((p) => p.field === issue.path);
    return spec ? { ...issue, path: spec.key, params: { ...issue.params, field: spec.key } } : issue;
  }
  return { ...issue, path: key, params: { ...issue.params, field: key } };
}

/**
 * Validate a flat link: parameters to a `config` payload, the shared
 * validator, then every issue under the parameter's own name.
 */
export function validateImportParams(
  params: ImportParams,
  lookup: CatalogueLookup,
  options: ValidateOptions,
): ValidationResult {
  const conv = toConfig(params);
  const result = validateImportPayload(conv.raw, lookup, options);
  const errors = [...conv.errors, ...(result.ok ? [] : result.errors.map((e) => renamed(e, conv.source)))];
  const warnings = [...conv.warnings, ...result.warnings.map((w) => renamed(w, conv.source))];
  if (result.ok && errors.length === 0) return { ok: true, payload: result.payload, warnings };
  return { ok: false, errors, warnings };
}

// ── Writing the link ────────────────────────────────────────────────

/** Characters a fragment keeps readable; everything else is percent-encoded. */
const encodeValue = (v: string) => encodeURIComponent(v).replace(/%3A/gi, ":");

/** A flat import link, parameters in the order given. */
export function planImportParamsUrl(params: Record<string, string | number>, lang: "fr" | "en" = "fr"): string {
  const pairs = Object.entries(params).map(([k, v]) => `${k}=${encodeValue(String(v))}`);
  return `${SITE_URL}${PLAN_IMPORT_PATH}${lang === "en" ? "?lang=en" : ""}#${pairs.join("&")}`;
}

// ── Examples ────────────────────────────────────────────────────────

/**
 * A Sunday about six months after the next Monday, so an example link written
 * at build time stays valid between deploys. Shared by llms.txt and /agents.
 */
export function exampleRaceDate(today: string): string {
  return addDaysToDate(defaultPlanStart(today), 26 * 7 - 1);
}

/** The flat links the docs show, valid on `today`. */
export function exampleImportParams(today: string) {
  const date = exampleRaceDate(today);
  return {
    minimal: { distance: "10K", date, days: 3, time: "1:10:00" },
    full: {
      distance: "semi",
      date,
      days: 4,
      level: "beginner",
      longrun: "sun",
      pace: "6:30",
      weeklykm: 20,
      strength: 1,
      name: "Semi de printemps",
    },
  } as const;
}
