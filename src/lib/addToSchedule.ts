/**
 * Ajouter à… : poser une séance du catalogue dans ce que l'athlète suit.
 *
 * Aucun nouveau format : la séance est composée par `sessionFromWorkout`,
 * comme depuis le cockpit et la page de la semaine, écrite dans `zoned-plans`
 * sous `withUndoSnapshot` (donc annulable par `undoLastChange`), et une
 * semaine neuve est posée dans `zoned-today` par `placeWeek`, exactement
 * comme le fait Une nouvelle semaine, posée ici dans le cockpit.
 *
 * Trois destinations, voir `docs/seance.md` :
 *
 * - **un jour du calendrier** (aujourd'hui, ou un autre jour de cette
 *   semaine) : la séance va dans la source PRINCIPALE qui couvre ce jour,
 *   dans l'ordre du cockpit (les plans du plus récent au plus ancien, puis
 *   les semaines posées). Sans source ce jour-là, une semaine neuve est
 *   créée, nommée par son lundi et posée sur ce lundi ;
 * - **dans mon plan** : un plan suivi, une semaine et un jour choisis ;
 * - **dans une semaine type** : une semaine de Mes semaines et un jour. La
 *   semaine est un gabarit, on y écrit sans la poser.
 */

import type { AnyWorkoutTemplate } from "@/types";
import type { TrainingPlan } from "@/types/plan";
import {
  deletePlan,
  getAllPlans,
  savePlan,
  undoLastChange,
  withUndoSnapshot,
} from "@/lib/planStorage";
import {
  loadTodayComposition,
  mondayOf,
  placeWeek,
  removeLayer,
  resolveTodaySources,
  saveTodayComposition,
  sourcePosition,
  type TodayComposition,
  type TodaySource,
} from "@/lib/todayComposition";
import { createEmptyWeekPlan, sessionFromWorkout } from "@/lib/weekToPlan";

/** Le jour de la semaine d'une date, lundi = 0, comme `PlanSession.dayOfWeek`. */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** La date du jour `day` (lundi = 0) de la semaine de `date`. */
export function dateInWeek(date: Date, day: number): Date {
  const monday = mondayOf(date);
  const result = new Date(monday);
  result.setDate(monday.getDate() + day);
  return result;
}

/** Où une séance posée sur une date atterrit. */
export type DayDestination =
  | { kind: "source"; planId: string; weekNumber: number; dayOfWeek: number; name: string; isWeek: boolean }
  | { kind: "fresh"; monday: Date; dayOfWeek: number };

function sourceLabel(source: TodaySource, isEn: boolean): string {
  return (isEn && source.plan.nameEn) || source.plan.name;
}

/**
 * La source principale qui couvre `date`, dans l'ordre du cockpit, sinon une
 * semaine neuve à poser sur le lundi de `date`.
 */
export function destinationForDate(
  plans: readonly TrainingPlan[],
  composition: TodayComposition,
  date: Date,
  today: Date,
  isEn = false,
): DayDestination {
  for (const source of resolveTodaySources(plans, composition, today)) {
    const position = sourcePosition(source, date);
    if (position) {
      return {
        kind: "source",
        planId: source.plan.id,
        weekNumber: position.weekNumber,
        dayOfWeek: position.dayOfWeek,
        name: sourceLabel(source, isEn),
        isWeek: source.isWeek,
      };
    }
  }
  return { kind: "fresh", monday: mondayOf(date), dayOfWeek: weekdayIndex(date) };
}

/** Un plan suivi, et la semaine où l'on est (ou la première, s'il commence plus tard). */
export interface FollowedPlan {
  plan: TrainingPlan;
  name: string;
  currentWeek: number;
}

/**
 * Les plans suivis qui ne sont pas finis : ceux que le cockpit suit, en cours
 * ou à venir. Vide, le choix Dans mon plan n'est pas proposé.
 */
export function followedPlans(
  plans: readonly TrainingPlan[],
  composition: TodayComposition,
  today: Date,
  isEn = false,
): FollowedPlan[] {
  const midnight = new Date(today);
  midnight.setHours(0, 0, 0, 0);
  const result: FollowedPlan[] = [];
  for (const source of resolveTodaySources(plans, composition, today)) {
    if (source.isWeek) continue;
    const position = sourcePosition(source, midnight);
    if (position) {
      result.push({ plan: source.plan, name: sourceLabel(source, isEn), currentWeek: position.weekNumber });
    } else if (source.monday > midnight) {
      result.push({ plan: source.plan, name: sourceLabel(source, isEn), currentWeek: 1 });
    }
  }
  return result;
}

/** Les semaines de Mes semaines, la plus récente en tête. */
export function savedWeeks(plans: readonly TrainingPlan[]): TrainingPlan[] {
  return plans
    .filter((p) => p.config.isSingleWeek === true)
    .sort((a, b) => Date.parse(b.config.createdAt) - Date.parse(a.config.createdAt));
}

/** Une séance ajoutée, et de quoi la défaire. */
export interface AddResult {
  planId: string;
  weekNumber: number;
  dayOfWeek: number;
  /** Une semaine créée pour l'occasion : l'annulation la supprime. */
  createdWeekId?: string;
}

export interface AddLabels {
  /** Le libellé de l'instantané d'annulation, FR et EN. */
  label: string;
  labelEn: string;
  /** Le nom d'une semaine neuve, si elle doit être créée. */
  freshWeekName: string;
}

/** Écrire la séance dans la semaine `weekNumber` du plan, sous instantané. */
function pushUnderSnapshot(
  planId: string,
  weekNumber: number,
  dayOfWeek: number,
  workout: AnyWorkoutTemplate,
  labels: AddLabels,
): boolean {
  const session = sessionFromWorkout(dayOfWeek, workout);
  return withUndoSnapshot(planId, "add_session", labels.label, labels.labelEn, (plan) => {
    const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
    if (!week) throw new Error("week not in plan");
    week.sessions.push(session);
    week.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    return [];
  });
}

/** Poser la séance sur une date, dans la source qui la couvre ou une semaine neuve. */
export function addToDate(
  workout: AnyWorkoutTemplate,
  date: Date,
  labels: AddLabels,
  today: Date = new Date(),
): AddResult | null {
  const plans = getAllPlans();
  const composition = loadTodayComposition();
  const destination = destinationForDate(plans, composition, date, today);

  if (destination.kind === "source") {
    const ok = pushUnderSnapshot(destination.planId, destination.weekNumber, destination.dayOfWeek, workout, labels);
    return ok
      ? { planId: destination.planId, weekNumber: destination.weekNumber, dayOfWeek: destination.dayOfWeek }
      : null;
  }

  const week = createEmptyWeekPlan(labels.freshWeekName);
  if (!savePlan(week).ok) return null;
  if (!saveTodayComposition(placeWeek(composition, week.id, destination.monday))) {
    deletePlan(week.id);
    return null;
  }
  if (!pushUnderSnapshot(week.id, 1, destination.dayOfWeek, workout, labels)) {
    deletePlan(week.id);
    saveTodayComposition(removeLayer(loadTodayComposition(), week.id));
    return null;
  }
  return { planId: week.id, weekNumber: 1, dayOfWeek: destination.dayOfWeek, createdWeekId: week.id };
}

/** Poser la séance dans un plan ou une semaine type, sur une semaine et un jour choisis. */
export function addToPlanWeek(
  workout: AnyWorkoutTemplate,
  planId: string,
  weekNumber: number,
  dayOfWeek: number,
  labels: AddLabels,
): AddResult | null {
  return pushUnderSnapshot(planId, weekNumber, dayOfWeek, workout, labels)
    ? { planId, weekNumber, dayOfWeek }
    : null;
}

/**
 * Défaire un ajout. La semaine créée pour l'occasion part avec sa couche ;
 * sinon, l'instantané rend le plan tel qu'il était (`undoLastChange`).
 */
export function undoAdd(result: AddResult): boolean {
  if (result.createdWeekId) {
    const removed = deletePlan(result.createdWeekId);
    const saved = saveTodayComposition(removeLayer(loadTodayComposition(), result.createdWeekId));
    return removed && saved;
  }
  return undoLastChange(result.planId);
}
