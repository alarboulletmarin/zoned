import type { AnyWorkoutTemplate, TrainingPhase } from "@/types";
import { isStrengthWorkout } from "@/types";
import type { ComplementaryActivity } from "@/types/activity";
import type { PlanSession, PlanWeek, TrainingPlan } from "@/types/plan";
import { getPlanMonday, getSessionCalendarDate, isoDateOnly } from "@/lib/planDates";
import { plannedMinutesOf } from "@/lib/weekRings";
import { isActivitySession } from "@/lib/activitySession";

/**
 * Une semaine d'un plan, lue jour par jour : ce que la page d'un plan
 * dessine (les barres des sept jours, la liste des jours) et rien d'autre.
 *
 * ── Les règles, empruntées ───────────────────────────────────────────────
 *
 * - Les dates viennent de `getPlanMonday` et `getSessionCalendarDate`, le
 *   lundi du départ, ou de la création pour un plan sans date de départ.
 * - Faite veut dire `completed` ou `modified` ; sautée, `skipped` ; le reste
 *   est à faire. Ce sont les statuts de `planCardModel` et des anneaux.
 * - La durée prévue suit la précision de la séance (`plannedMinutesOf`) ; la
 *   durée faite est la durée réelle saisie, sinon la prévue.
 * - Le jour de course (`__race_day__`) n'a pas de durée : il ne pèse ni sur
 *   les barres ni sur le total de la semaine, comme sur la frise du plan.
 * - Les activités du journal (`zoned-activities`) tombées ce jour-là sont
 *   rendues à part, HORS PLAN : elles ne sont pas un prévu, elles ne gonflent
 *   donc pas les barres, comme elles n'entrent pas dans les anneaux.
 *
 * Aucun mot, aucun format : des valeurs typées, les libellés sont ailleurs.
 */

export type PlanDayState = "past" | "current" | "future";
export type PlanSessionStatus = "done" | "skipped" | "todo";
export type PlanSessionKind = "workout" | "race" | "intermediate" | "activity";
/** L'étiquette posée au-dessus d'une carte. Jamais deux : la sortie longue l'emporte. */
export type PlanSessionTag = "long_run" | "key" | null;

export interface PlanWeekSession {
  /** L'index dans `week.sessions`, l'adresse que les fonctions de stockage attendent. */
  index: number;
  session: PlanSession;
  kind: PlanSessionKind;
  status: PlanSessionStatus;
  /** Prévue, ou réelle quand la séance est faite et qu'une durée a été saisie. */
  durationMin: number;
  plannedMin: number;
  distanceKm: number | null;
  tag: PlanSessionTag;
  strength: boolean;
}

export interface PlanWeekDay {
  /** 0 = lundi ... 6 = dimanche. */
  dayOfWeek: number;
  /** `YYYY-MM-DD`. */
  date: string;
  state: PlanDayState;
  isToday: boolean;
  /** Ni séance du plan ni activité hors plan. */
  rest: boolean;
  sessions: PlanWeekSession[];
  offPlan: ComplementaryActivity[];
  plannedMin: number;
  doneMin: number;
  /** Un jour passé (ou aujourd'hui) dont une séance a été sautée et rien n'a été fait. */
  missed: boolean;
}

export interface PlanWeekModel {
  weekNumber: number;
  totalWeeks: number;
  phase: TrainingPhase;
  isRecoveryWeek: boolean;
  from: string;
  to: string;
  state: PlanDayState;
  days: PlanWeekDay[];
  plannedMin: number;
  doneMin: number;
}

const RACE_DAY = "__race_day__";
const INTERMEDIATE_RACE = "__intermediate_race__";

function statusOf(session: PlanSession): PlanSessionStatus {
  if (session.status === "completed" || session.status === "modified") return "done";
  if (session.status === "skipped") return "skipped";
  return "todo";
}

function kindOf(session: PlanSession): PlanSessionKind {
  if (session.workoutId === RACE_DAY) return "race";
  if (session.workoutId === INTERMEDIATE_RACE) return "intermediate";
  if (isActivitySession(session.workoutId)) return "activity";
  return "workout";
}

export function sessionTagOf(session: PlanSession): PlanSessionTag {
  if (session.workoutId.startsWith("__")) return null;
  if (session.sessionType === "long_run") return "long_run";
  if (session.isKeySession) return "key";
  return null;
}

/** L'ordre dans une journée : la course d'abord, puis la course à pied, le renfo, les activités. */
function rankOf(s: PlanWeekSession): number {
  if (s.kind === "race" || s.kind === "intermediate") return 0;
  if (s.kind === "activity") return 3;
  return s.strength ? 2 : 1;
}

function stateOf(date: string, today: string): PlanDayState {
  if (date < today) return "past";
  if (date === today) return "current";
  return "future";
}

export function buildPlanWeekModel(
  plan: TrainingPlan,
  weekNumber: number,
  today: Date,
  workoutOf: (workoutId: string) => AnyWorkoutTemplate | undefined = () => undefined,
  activities: readonly ComplementaryActivity[] = [],
): PlanWeekModel | null {
  const week: PlanWeek | undefined = plan.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week) return null;

  const monday = getPlanMonday(plan);
  const todayIso = isoDateOnly(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  const days: PlanWeekDay[] = [];
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const date = isoDateOnly(getSessionCalendarDate(monday, weekNumber, dayOfWeek));
    const state = stateOf(date, todayIso);

    const sessions: PlanWeekSession[] = [];
    week.sessions.forEach((session, index) => {
      if (session.dayOfWeek !== dayOfWeek) return;
      const workout = workoutOf(session.workoutId);
      const kind = kindOf(session);
      const status = statusOf(session);
      const plannedMin = kind === "race" ? 0 : plannedMinutesOf(session, workout);
      const actual =
        status === "done" && session.actualDurationMin && session.actualDurationMin > 0
          ? session.actualDurationMin
          : plannedMin;
      const distance =
        status === "done" && session.actualDistanceKm && session.actualDistanceKm > 0
          ? session.actualDistanceKm
          : session.targetDistanceKm;
      sessions.push({
        index,
        session,
        kind,
        status,
        durationMin: Math.round(actual),
        plannedMin: Math.round(plannedMin),
        distanceKm: distance && distance > 0 ? distance : null,
        tag: sessionTagOf(session),
        strength:
          session.sessionType === "strength" || (workout ? isStrengthWorkout(workout) : false),
      });
    });
    sessions.sort((a, b) => rankOf(a) - rankOf(b) || a.index - b.index);

    const offPlan = activities.filter((a) => a.date === date);
    const plannedMin = sessions.reduce((sum, s) => sum + s.plannedMin, 0);
    const doneMin = sessions
      .filter((s) => s.status === "done")
      .reduce((sum, s) => sum + s.durationMin, 0);
    const missed =
      state !== "future" &&
      sessions.some((s) => s.status === "skipped") &&
      !sessions.some((s) => s.status === "done");

    days.push({
      dayOfWeek,
      date,
      state,
      isToday: state === "current",
      rest: sessions.length === 0 && offPlan.length === 0,
      sessions,
      offPlan,
      plannedMin,
      doneMin,
      missed,
    });
  }

  const from = days[0].date;
  const to = days[6].date;
  const weekState: PlanDayState = to < todayIso ? "past" : from > todayIso ? "future" : "current";

  return {
    weekNumber,
    totalWeeks: plan.totalWeeks,
    phase: week.phase,
    isRecoveryWeek: week.isRecoveryWeek,
    from,
    to,
    state: weekState,
    days,
    plannedMin: days.reduce((sum, d) => sum + d.plannedMin, 0),
    doneMin: days.reduce((sum, d) => sum + d.doneMin, 0),
  };
}

/**
 * La semaine qu'une page de plan ouvre : celle de l'URL, bornée ; sinon la
 * semaine en cours ; la première si le plan n'a pas commencé, la dernière
 * s'il est fini.
 */
export function defaultPlanWeek(
  totalWeeks: number,
  currentWeek: number,
  fromUrl: number | null,
): number {
  const clamp = (n: number) => Math.max(1, Math.min(n, Math.max(1, totalWeeks)));
  if (fromUrl != null && Number.isFinite(fromUrl)) return clamp(fromUrl);
  return clamp(currentWeek);
}
