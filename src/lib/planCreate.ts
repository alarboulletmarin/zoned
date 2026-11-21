import type { Difficulty, TerrainType } from "@/types";
import type {
  AssistedPlanConfig,
  IntermediateGoal,
  PlanPurpose,
  RaceDistance,
  TrainingGoal,
} from "@/types/plan";
import type { Practice } from "@/types/practice";
import { practiceFromRaceDistance } from "@/types/practice";
import { getAllPrebuiltPlans, type PrebuiltPlan } from "@/data/prebuilt-plans";
import {
  addDaysToDate,
  calculatePlanWeekCount,
  defaultPlanStart,
  mondayOfDate,
} from "@/lib/planDates";
import { sortIntermediateGoals } from "@/lib/intermediateGoalValidation";
import { parseVma } from "@/lib/paceFields";

/**
 * Le parcours de création d'un plan, sans React.
 *
 * Les réponses (`PlanForm`) donnent UNE configuration (`buildAssistedConfig`),
 * qui sert à l'aperçu comme à la création : ce qu'on voit avant de créer est
 * ce qu'on enregistre. Le nombre de semaines affiché vient de la même source
 * (`planWeeksOf`), et la matrice de dates vérifie qu'il égale `totalWeeks`.
 */

export type OpenPurpose = Exclude<PlanPurpose, "race">;

export interface PlanForm {
  /** La pratique, déduite de la course ; posée seulement sans course. */
  practice: Practice | null;
  planPurpose: PlanPurpose;
  trainingGoal: TrainingGoal;
  raceDistance: RaceDistance | null;
  /** "YYYY-MM-DD", vide tant que la date n'est pas choisie. */
  raceDate: string;
  raceName: string;
  /** Commencer cette semaine plutôt que lundi prochain (Affiner). */
  startThisWeek: boolean;
  runnerLevel: Difficulty;
  /** La VMA telle que tapée (`14,5`). */
  vma: string;
  daysPerWeek: number;
  longRunDay: number;
  /** L'allure cible, "M:SS", route seulement. */
  targetPace: string;
  elevationGain: string;
  /** Semaines d'un plan sans course. */
  totalWeeksOverride: number;
  currentWeeklyKm: string;
  currentLongRunKm: string;
  includeStrength: boolean;
  strengthFrequency: 1 | 2 | 3;
  intermediateGoals: IntermediateGoal[];
  terrain: TerrainType;
  /** Le plan prêt choisi, ou null pour le sur mesure. */
  prebuiltSlug: string | null;
}

export const OPEN_WEEK_OPTIONS = [6, 8, 12, 16] as const;

/** Les réglages qu'un plan sans course prend d'office. */
export const PURPOSE_DEFAULTS: Record<
  OpenPurpose,
  Pick<PlanForm, "daysPerWeek" | "totalWeeksOverride" | "trainingGoal">
> = {
  beginner_start: { daysPerWeek: 3, totalWeeksOverride: 8, trainingGoal: "finish" },
  return_from_injury: { daysPerWeek: 3, totalWeeksOverride: 8, trainingGoal: "finish" },
  base_building: { daysPerWeek: 4, totalWeeksOverride: 12, trainingGoal: "time" },
};

export function emptyPlanForm(): PlanForm {
  return {
    practice: null,
    planPurpose: "race",
    trainingGoal: "time",
    raceDistance: null,
    raceDate: "",
    raceName: "",
    startThisWeek: false,
    runnerLevel: "intermediate",
    vma: "",
    daysPerWeek: 4,
    longRunDay: 6,
    targetPace: "",
    elevationGain: "",
    totalWeeksOverride: 12,
    currentWeeklyKm: "",
    currentLongRunKm: "",
    includeStrength: false,
    strengthFrequency: 1,
    intermediateGoals: [],
    terrain: "trail_runnable",
    prebuiltSlug: null,
  };
}

export const isRaceForm = (form: PlanForm) => form.planPurpose === "race";

/** Le premier jour du plan : lundi prochain, ou aujourd'hui avec commencer cette semaine. */
export function planStartOf(form: PlanForm, today: string): string {
  return form.startThisWeek ? today : defaultPlanStart(today);
}

/** Le lundi de la semaine 1. */
export function planMondayOf(form: PlanForm, today: string): string {
  return mondayOfDate(planStartOf(form, today));
}

/**
 * Le nombre de semaines du plan sur mesure : du lundi de départ au lundi de
 * la semaine de course, plus un ; sans course, la durée choisie. 0 sans date.
 */
export function planWeeksOf(form: PlanForm, today: string): number {
  if (!isRaceForm(form)) return form.totalWeeksOverride;
  if (!form.raceDate) return 0;
  return calculatePlanWeekCount(planStartOf(form, today), form.raceDate);
}

/** Le dernier jour du plan : la course, ou le dimanche de la dernière semaine. */
export function planEndOf(form: PlanForm, today: string): string {
  if (isRaceForm(form) && form.raceDate) return form.raceDate;
  return addDaysToDate(planMondayOf(form, today), planWeeksOf(form, today) * 7 - 1);
}

/** La première date de course permise : la fin de la plus courte préparation. */
export function earliestRaceDate(minWeeks: number, today: string, startThisWeek = false): string {
  const monday = mondayOfDate(startThisWeek ? today : defaultPlanStart(today));
  return addDaysToDate(monday, (minWeeks - 1) * 7);
}

/** L'allure "M:SS" en secondes, ou null. */
export function parsePace(pace: string): number | null {
  const match = pace.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const sec = Number(match[2]);
  return sec < 60 ? Number(match[1]) * 60 + sec : null;
}

const toInt = (raw: string) => {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/**
 * La configuration du générateur, à partir des réponses. Une seule source
 * pour l'aperçu et la création. `id` et `createdAt` n'entrent pas dans la
 * graine du générateur : l'aperçu et le plan créé sont le même plan.
 */
export function buildAssistedConfig(
  form: PlanForm,
  today: string,
  meta: { id: string; createdAt: string } = { id: "preview", createdAt: `${today}T00:00:00.000Z` },
): AssistedPlanConfig {
  const race = isRaceForm(form);
  const startDate = planStartOf(form, today);
  const endDate = planEndOf(form, today);
  const isTrail =
    !!form.raceDistance && practiceFromRaceDistance(form.raceDistance) !== "road";
  const pace = race && !isTrail ? parsePace(form.targetPace) : null;

  return {
    id: meta.id,
    createdAt: meta.createdAt,
    raceDistance: form.raceDistance ?? "10K",
    raceDate: endDate,
    raceName: race ? form.raceName.trim() || undefined : undefined,
    runnerLevel: form.runnerLevel,
    daysPerWeek: form.daysPerWeek,
    longRunDay: form.longRunDay,
    vma: parseVma(form.vma),
    targetPaceMinKm: pace ? pace / 60 : undefined,
    elevationGain: race && isTrail ? toInt(form.elevationGain) : undefined,
    startDate,
    endDate,
    /* La pratique n'est stockée QUE pour un plan sans course : sinon elle se
       déduit de `raceDistance`, ce qui évite toute migration de `zoned-plans`. */
    practice: race ? undefined : (form.practice ?? "road"),
    planPurpose: form.planPurpose,
    trainingGoal: form.trainingGoal,
    totalWeeksOverride: race ? undefined : form.totalWeeksOverride,
    currentWeeklyKm: toInt(form.currentWeeklyKm),
    currentLongRunKm: toInt(form.currentLongRunKm),
    includeStrength: form.includeStrength || undefined,
    strengthFrequency: form.includeStrength ? form.strengthFrequency : undefined,
    intermediateGoals:
      race && form.intermediateGoals.length > 0
        ? sortIntermediateGoals(form.intermediateGoals)
        : undefined,
  };
}

/** L'objectif d'un plan : une distance de course, ou un plan sans course. */
export type PlanGoal =
  | { kind: "race"; distance: RaceDistance }
  | { kind: "open"; purpose: OpenPurpose };

export function goalOf(form: PlanForm): PlanGoal | null {
  if (form.planPurpose !== "race") return { kind: "open", purpose: form.planPurpose };
  return form.raceDistance ? { kind: "race", distance: form.raceDistance } : null;
}

/** Les plans prêts qui répondent à cet objectif. Sans `planPurpose`, c'est un plan de course. */
export function matchingPrebuilts(
  goal: PlanGoal,
  plans: readonly PrebuiltPlan[] = getAllPrebuiltPlans(),
): PrebuiltPlan[] {
  return plans.filter((p) =>
    goal.kind === "race"
      ? (p.planPurpose ?? "race") === "race" && p.raceDistance === goal.distance
      : p.planPurpose === goal.purpose,
  );
}
