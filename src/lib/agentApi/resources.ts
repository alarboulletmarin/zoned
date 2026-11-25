/**
 * The JSON resources of the agent API, built from the catalogue.
 *
 * Pure functions from data to plain objects. Nothing here is restated by
 * hand: zone bounds come from `lib/zones.ts`, zone copy from `ZONE_META`,
 * every count and list from the templates themselves. The build script only
 * writes what these functions return.
 *
 * Contract (docs/agent-api.md): inside v1, fields are only ever added. A
 * field is never renamed, retyped or removed without a v2 next to v1.
 */

import type {
  AnyWorkoutTemplate,
  DurationRange,
  StrengthWorkoutTemplate,
  WorkoutStep,
  WorkoutTemplate,
  ZoneNumber,
} from "@/types";
import { ZONE_META, getPeakZone, getWorkoutDiscipline, isStrengthWorkout } from "@/types";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";
import type { PlanWeek } from "@/types/plan";
import { HR_ZONE_PERCENTAGES, VMA_ZONE_PERCENTAGES } from "@/lib/zones";
import { getAnyWorkoutDuration, getAnyWorkoutZones } from "@/lib/workoutFilters";
import { getStructuredWorkoutDurationMinutes, getWorkoutPhaseSteps } from "@/lib/workoutStructure";
import {
  AGENT_API_BASE,
  AGENT_API_VERSION,
  CODE_LICENSE,
  CONTENT_LICENSE,
  PLAN_IMPORT_PATH,
  PLAN_IMPORT_VERSION,
  SITE_URL,
  prebuiltPlanJsonUrl,
  prebuiltPlanPageUrl,
  workoutJsonUrl,
  workoutPageUrl,
} from "./constants";
import type { CatalogueLookup } from "./catalogue";

const ZONES: ZoneNumber[] = [1, 2, 3, 4, 5, 6];

/** `running | cycling | swimming | strength`, the axis an agent filters on first. */
export type AgentDiscipline = "running" | "cycling" | "swimming" | "strength";

export function agentDiscipline(w: AnyWorkoutTemplate): AgentDiscipline {
  return isStrengthWorkout(w) ? "strength" : getWorkoutDiscipline(w);
}

/**
 * The shelf a session sits on, for grouping: the running category, except
 * that cycling, swimming and strength each form one family of their own.
 */
export function workoutFamily(w: AnyWorkoutTemplate): string {
  const d = agentDiscipline(w);
  return d === "running" ? w.category : d;
}

const zoneLabels = (zones: readonly ZoneNumber[]): string[] => zones.map((z) => `Z${z}`);

// ── zones.json ──────────────────────────────────────────────────────

export function buildZonesResource() {
  return {
    apiVersion: AGENT_API_VERSION,
    model: "6 zones, built from VMA (maximal aerobic speed, km/h) and HRmax (FCmax).",
    zones: ZONES.map((z) => {
      const meta = ZONE_META[z];
      const [vmaMin, vmaMax] = VMA_ZONE_PERCENTAGES[z];
      const [hrMin, hrMax] = HR_ZONE_PERCENTAGES[z];
      return {
        id: `Z${z}`,
        number: z,
        name: meta.label,
        nameEn: meta.labelEn,
        vmaPercent: { min: vmaMin, max: vmaMax },
        hrMaxPercent: { min: hrMin, max: hrMax },
        description: meta.description,
        descriptionEn: meta.descriptionEn,
        sensation: meta.sensation,
        sensationEn: meta.sensationEn,
        usage: meta.benefit,
        usageEn: meta.benefitEn,
        examples: meta.examples,
        examplesEn: meta.examplesEn,
      };
    }),
  };
}

// ── workouts.json ───────────────────────────────────────────────────

export interface WorkoutIndexEntry {
  id: string;
  name: string;
  nameEn: string;
  discipline: AgentDiscipline;
  family: string;
  category: string;
  sessionType: string;
  difficulty: string;
  typicalDuration: DurationRange;
  zones: string[];
  /** Training phases the generator would schedule it in. Empty: manual only. */
  phases: string[];
  environment: {
    requiresHills: boolean;
    requiresTrack: boolean;
    prefersFlat?: boolean;
    prefersSoft?: boolean;
  } | null;
  url: string;
  json: string;
}

export function toWorkoutIndexEntry(w: AnyWorkoutTemplate): WorkoutIndexEntry {
  const strength = isStrengthWorkout(w);
  return {
    id: w.id,
    name: w.name,
    nameEn: w.nameEn,
    discipline: agentDiscipline(w),
    family: workoutFamily(w),
    category: w.category,
    sessionType: strength ? "strength" : w.sessionType,
    difficulty: w.difficulty,
    typicalDuration: { min: w.typicalDuration.min, max: w.typicalDuration.max },
    zones: zoneLabels(getAnyWorkoutZones(w)),
    phases: strength ? [...w.suitablePhases] : [...w.selectionCriteria.phases],
    environment: strength ? null : { ...w.environment },
    url: workoutPageUrl(w.id),
    json: workoutJsonUrl(w.id),
  };
}

export function buildWorkoutsIndex(templates: readonly AnyWorkoutTemplate[]) {
  const entries = templates.map(toWorkoutIndexEntry);
  const byDiscipline: Record<string, number> = {};
  const byFamily: Record<string, number> = {};
  for (const e of entries) {
    byDiscipline[e.discipline] = (byDiscipline[e.discipline] ?? 0) + 1;
    byFamily[e.family] = (byFamily[e.family] ?? 0) + 1;
  }
  return {
    apiVersion: AGENT_API_VERSION,
    count: entries.length,
    byDiscipline,
    byFamily,
    workouts: entries,
  };
}

// ── workouts/{id}.json ──────────────────────────────────────────────

type PhaseKey = "warmup" | "main" | "cooldown";
const PHASES: PhaseKey[] = ["warmup", "main", "cooldown"];
const STRUCTURE_FIELD = {
  warmup: "warmupStructure",
  main: "mainSetStructure",
  cooldown: "cooldownStructure",
} as const;

function runningDetail(w: WorkoutTemplate) {
  const structure = {} as Record<PhaseKey, WorkoutStep[]>;
  const structureSource = {} as Record<PhaseKey, "authored" | "derived">;
  for (const phase of PHASES) {
    structure[phase] = getWorkoutPhaseSteps(w, phase);
    structureSource[phase] = w[STRUCTURE_FIELD[phase]]?.length ? "authored" : "derived";
  }
  return {
    targetSystem: w.targetSystem,
    peakZone: `Z${getPeakZone(w)}`,
    estimatedDurationMin: Math.round(getStructuredWorkoutDurationMinutes(w)),
    ...(w.estimatedDistanceKm && { estimatedDistanceKm: w.estimatedDistanceKm }),
    environment: w.environment,
    selection: w.selectionCriteria,
    ...(w.scaling && { scaling: w.scaling }),
    ...(w.weeklyFrequencyMax !== undefined && { weeklyFrequencyMax: w.weeklyFrequencyMax }),
    ...(w.minimumRecoveryDays !== undefined && { minimumRecoveryDays: w.minimumRecoveryDays }),
    // Canonical, machine-readable: one step tree per phase. Authored when the
    // template carries a *Structure, derived from the display blocks otherwise,
    // by the same `getWorkoutPhaseSteps` the timeline and the exports use.
    structure,
    structureSource,
    // Display copy, as the athlete reads it on the session page.
    blocks: {
      warmup: w.warmupTemplate,
      main: w.mainSetTemplate,
      cooldown: w.cooldownTemplate,
    },
  };
}

function strengthDetail(w: StrengthWorkoutTemplate) {
  return {
    intensity: w.intensity,
    estimatedDurationMin: Math.round(getAnyWorkoutDuration(w)),
    equipment: w.equipment,
    primaryMuscleGroups: w.primaryMuscleGroups,
    selection: { phases: w.suitablePhases },
    weeklyFrequencyMax: w.weeklyFrequencyMax,
    minimumRecoveryDays: w.minimumRecoveryDays,
    // Strength sessions have no step tree: blocks reference exercises by id.
    blocks: {
      warmup: w.warmupBlocks,
      main: w.mainBlocks,
      cooldown: w.cooldownBlocks,
    },
    ...(w.references && { references: w.references }),
  };
}

export function buildWorkoutDetail(w: AnyWorkoutTemplate) {
  const base = toWorkoutIndexEntry(w);
  return {
    apiVersion: AGENT_API_VERSION,
    ...base,
    description: w.description,
    descriptionEn: w.descriptionEn,
    ...(isStrengthWorkout(w) ? strengthDetail(w) : runningDetail(w)),
    coachingTips: w.coachingTips,
    coachingTipsEn: w.coachingTipsEn,
    commonMistakes: w.commonMistakes,
    commonMistakesEn: w.commonMistakesEn,
    variationIds: w.variationIds,
    license: CONTENT_LICENSE.id,
  };
}

// ── plans/prebuilt/{slug}.json ──────────────────────────────────────

function resolveWeek(week: PlanWeek, lookup: CatalogueLookup) {
  return {
    weekNumber: week.weekNumber,
    phase: week.phase,
    isRecoveryWeek: week.isRecoveryWeek,
    volumePercent: week.volumePercent,
    ...(week.targetKm !== undefined && { targetKm: week.targetKm }),
    ...(week.targetLongRunKm !== undefined && { targetLongRunKm: week.targetLongRunKm }),
    sessions: week.sessions.map((s) => {
      // `__race_day__` and friends are markers the app reads, not catalogue
      // workouts: published as such, without a name or a JSON link.
      if (s.workoutId.startsWith("__")) {
        return {
          day: s.dayOfWeek,
          workoutId: s.workoutId,
          marker: s.workoutId.replace(/^_+|_+$/g, ""),
          sessionType: s.sessionType,
          isKeySession: s.isKeySession,
          estimatedDurationMin: s.estimatedDurationMin,
          ...(s.notes && { notes: s.notes }),
          ...(s.notesEn && { notesEn: s.notesEn }),
        };
      }
      const w = lookup.get(s.workoutId);
      if (!w) {
        throw new Error(`Prebuilt plan references unknown workout ${s.workoutId}, week ${week.weekNumber}`);
      }
      return {
        day: s.dayOfWeek,
        workoutId: s.workoutId,
        workoutName: w.name,
        workoutNameEn: w.nameEn,
        sessionType: s.sessionType,
        isKeySession: s.isKeySession,
        estimatedDurationMin: s.estimatedDurationMin,
        ...(s.targetDistanceKm !== undefined && { targetDistanceKm: s.targetDistanceKm }),
        ...(s.notes && { notes: s.notes }),
        ...(s.notesEn && { notesEn: s.notesEn }),
        json: workoutJsonUrl(s.workoutId),
      };
    }),
  };
}

export function toPrebuiltPlanSummary(p: PrebuiltPlan) {
  return {
    slug: p.slug,
    name: p.name,
    nameEn: p.nameEn,
    difficulty: p.difficulty,
    ...(p.raceDistance && { raceDistance: p.raceDistance }),
    sessionsPerWeek: p.sessionsPerWeek,
    totalWeeks: p.totalWeeks,
    url: prebuiltPlanPageUrl(p.slug),
    json: prebuiltPlanJsonUrl(p.slug),
  };
}

export function buildPrebuiltPlanResource(p: PrebuiltPlan, lookup: CatalogueLookup) {
  return {
    apiVersion: AGENT_API_VERSION,
    ...toPrebuiltPlanSummary(p),
    description: p.description,
    descriptionEn: p.descriptionEn,
    ...(p.planPurpose && { planPurpose: p.planPurpose }),
    ...(p.trainingGoal && { trainingGoal: p.trainingGoal }),
    ...(p.peakWeeklyKm !== undefined && { peakWeeklyKm: p.peakWeeklyKm }),
    ...(p.peakLongRunKm !== undefined && { peakLongRunKm: p.peakLongRunKm }),
    tags: p.tags,
    phases: p.phases,
    weeks: p.weeks.map((w) => resolveWeek(w, lookup)),
    license: CONTENT_LICENSE.id,
  };
}

// ── index.json ──────────────────────────────────────────────────────

export function buildApiIndex(input: {
  generatedAt: string;
  templates: readonly AnyWorkoutTemplate[];
  prebuiltPlans: readonly PrebuiltPlan[];
}) {
  return {
    name: "Zoned agent API",
    apiVersion: AGENT_API_VERSION,
    generatedAt: input.generatedAt,
    description:
      "Static, read-only JSON describing the Zoned workout catalogue and prebuilt plans, " +
      "for AI agents that build a training plan and hand it back to the user through a /plan/import link.",
    stability:
      "Within v1, fields are only ever added. Nothing is renamed, retyped or removed; a breaking change ships as v2 alongside v1.",
    docs: `${SITE_URL}/llms.txt`,
    docsFull: `${SITE_URL}/llms-full.txt`,
    contract: "https://github.com/alarboulletmarin/zoned/blob/develop/docs/agent-api.md",
    license: {
      content: CONTENT_LICENSE,
      code: CODE_LICENSE,
    },
    resources: {
      zones: `${AGENT_API_BASE}/zones.json`,
      workouts: `${AGENT_API_BASE}/workouts.json`,
      workout: `${AGENT_API_BASE}/workouts/{id}.json`,
      prebuiltPlan: `${AGENT_API_BASE}/plans/prebuilt/{slug}.json`,
      planImportSchema: `${AGENT_API_BASE}/schema/plan-import.schema.json`,
    },
    counts: {
      workouts: input.templates.length,
      prebuiltPlans: input.prebuiltPlans.length,
    },
    prebuiltPlans: input.prebuiltPlans.map(toPrebuiltPlanSummary),
    planImport: {
      url: `${SITE_URL}${PLAN_IMPORT_PATH}#d={payload}`,
      urlEnglish: `${SITE_URL}${PLAN_IMPORT_PATH}?lang=en#d={payload}`,
      payloadVersion: PLAN_IMPORT_VERSION,
      encoding: "base64url of the UTF-8 JSON payload, no padding, in the URL fragment",
      schema: `${AGENT_API_BASE}/schema/plan-import.schema.json`,
    },
  };
}
