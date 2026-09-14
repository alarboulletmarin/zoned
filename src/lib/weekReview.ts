import type { PlanSession, TrainingPlan } from "@/types/plan";
import type { ComplementaryActivity } from "@/types/activity";
import { getPlanMonday, getSessionCalendarDate, isoDateOnly } from "@/lib/planDates";
import { estimateSessionKm, plannedSessionKm } from "@/lib/planStats";
import {
  EMPTY_ACTIVITY_SUMMARY,
  summarizeActivities,
  type ActivitySummary,
} from "@/lib/activityStats";

/**
 * Le bilan de la semaine.
 *
 * Il répond à quatre questions, dans cet ordre, et à rien d'autre :
 * qu'est-ce qui était prévu, qu'est-ce que j'ai fait, qu'est-ce que j'ai fait
 * EN PLUS, et est-ce que ça tient.
 *
 * ── Deux honnêtetés qui coûtent, et qu'on paie ───────────────────────────
 *
 * 1. **Une séance non close n'est pas une séance sautée.** C'est la faute
 *    facile : compter tout ce qui n'est pas coché comme raté donnerait une
 *    observance de 0 % à quelqu'un qui a tout couru sans rien cocher, et un
 *    bilan qui accuse à tort ne se relit pas deux fois. Les non closes sont
 *    donc comptées à part (`pending`), et tant qu'aucune séance n'a été
 *    tranchée le bilan REFUSE de juger, verdict `pending`.
 * 2. **L'observance se mesure sur ce qui était prévu**, pas sur ce qui a été
 *    tranché. Clore une seule séance sur cinq et l'avoir faite ne fait pas
 *    une semaine à 100 %.
 *
 * ── Ce qui n'est PAS ici ─────────────────────────────────────────────────
 *
 * Aucune phrase. Ce module rend des nombres et un verdict ; les mots sont
 * dans les traductions, qui sont le seul endroit où ils peuvent exister en
 * deux langues. Un module qui rend du texte français est un module qui rend
 * du texte français.
 */

/** Les bornes d'une semaine, dates seules, comme le journal d'activités. */
export interface DateRange {
  from: string;
  to: string;
}

/**
 * Ce que le bilan dit de la semaine, en un mot.
 *
 * - `empty`, rien de prévu et rien de fait, il n'y a pas de bilan à faire ;
 * - `extras`, rien n'était prévu mais quelque chose a eu lieu. C'est la
 *   semaine de quelqu'un qui n'a pas de plan et qui fait du vélotaf : elle ne
 *   s'observe pas contre un prévu, elle se raconte ;
 * - `pending`, des séances étaient prévues et aucune n'a été tranchée, le
 *   bilan ne sait pas et le dit plutôt que d'inventer ;
 * - `missed`, moins de la moitié ;
 * - `partial`, la moitié ou plus ;
 * - `solid`, 80 % ou plus, le seuil au-delà duquel une semaine a fait son
 *   travail, les deux séances clés comprises ;
 * - `perfect`, tout.
 */
export type WeekVerdict =
  | "empty"
  | "extras"
  | "pending"
  | "missed"
  | "partial"
  | "solid"
  | "perfect";

export interface WeekReview {
  range: DateRange;
  /** 1-indexé, `0` quand le bilan ne porte sur aucun plan. */
  weekNumber: number;
  /** Les séances prévues cette semaine, jour de course exclu. */
  planned: number;
  /** Faites, telles quelles ou modifiées. Les deux sont des façons d'avoir couru. */
  completed: number;
  skipped: number;
  /** Ni faites ni sautées : personne ne les a closes. Ce n'est pas un échec. */
  pending: number;
  keyPlanned: number;
  keyCompleted: number;
  plannedMinutes: number;
  doneMinutes: number;
  plannedKm: number;
  doneKm: number;
  /** RPE moyen des séances closes, `null` si aucune ne l'a porté. */
  avgRpe: number | null;
  /** Le complément de la semaine, activités hors plan. */
  activities: ActivitySummary;
  /** Séances faites plus activités. C'est le temps réellement passé. */
  totalMinutes: number;
  /** Faites sur prévues, entre 0 et 1. `null` quand rien n'était prévu. */
  adherence: number | null;
  verdict: WeekVerdict;
}

/** Les marqueurs du plan ne sont pas des séances : ils ne se comptent pas. */
function isCountableSession(session: PlanSession): boolean {
  return session.workoutId !== "__race_day__";
}

/** Faite, telle quelle ou modifiée. */
function isDone(session: PlanSession): boolean {
  return session.status === "completed" || session.status === "modified";
}

/** Les bornes de la semaine `weekNumber` d'un plan, du lundi au dimanche. */
export function planWeekRange(plan: TrainingPlan, weekNumber: number): DateRange {
  const monday = getPlanMonday(plan);
  return {
    from: isoDateOnly(getSessionCalendarDate(monday, weekNumber, 0)),
    to: isoDateOnly(getSessionCalendarDate(monday, weekNumber, 6)),
  };
}

/**
 * Les bornes de la semaine CALENDAIRE qui contient `date`, lundi au dimanche.
 *
 * C'est le repli de quelqu'un qui n'a pas de plan : il fait du vélotaf, il
 * veut son bilan du dimanche, et il n'a aucune raison d'avoir un plan pour ça.
 */
export function calendarWeekRange(date: Date): DateRange {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  // `getDay` rend 0 le dimanche : la convention du dépôt est lundi = 0.
  const shift = monday.getDay() === 0 ? 6 : monday.getDay() - 1;
  monday.setDate(monday.getDate() - shift);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { from: isoDateOnly(monday), to: isoDateOnly(sunday) };
}

function verdictOf(planned: number, completed: number, resolved: number, extras: number): WeekVerdict {
  if (planned === 0) return extras > 0 ? "extras" : "empty";
  if (resolved === 0) return "pending";
  const ratio = completed / planned;
  if (ratio >= 1) return "perfect";
  if (ratio >= 0.8) return "solid";
  if (ratio >= 0.5) return "partial";
  return "missed";
}

/**
 * Le bilan, à partir des séances d'une semaine et des activités de ses dates.
 *
 * Les activités arrivent DÉJÀ filtrées sur l'intervalle (`activitiesBetween`) :
 * ce module ne relit pas le stockage, ce qui le rend testable sans
 * `localStorage` et permet au même calcul de servir au bilan d'une semaine de
 * plan et à celui d'une semaine calendaire sans plan.
 */
export function buildWeekReview(params: {
  sessions: readonly PlanSession[];
  activities: readonly ComplementaryActivity[];
  range: DateRange;
  weekNumber?: number;
}): WeekReview {
  const { activities, range } = params;
  const sessions = params.sessions.filter(isCountableSession);

  let completed = 0;
  let skipped = 0;
  let keyPlanned = 0;
  let keyCompleted = 0;
  let plannedMinutes = 0;
  let doneMinutes = 0;
  let plannedKm = 0;
  let doneKm = 0;
  const rpes: number[] = [];

  for (const session of sessions) {
    plannedMinutes += session.estimatedDurationMin ?? 0;
    plannedKm += plannedSessionKm(session);
    if (session.isKeySession) keyPlanned += 1;

    if (isDone(session)) {
      completed += 1;
      if (session.isKeySession) keyCompleted += 1;
      doneMinutes += session.actualDurationMin ?? session.estimatedDurationMin ?? 0;
      doneKm += estimateSessionKm(session);
      if (session.rpe) rpes.push(session.rpe);
    } else if (session.status === "skipped") {
      skipped += 1;
    }
  }

  const planned = sessions.length;
  const pending = planned - completed - skipped;
  const summary = activities.length > 0 ? summarizeActivities(activities) : EMPTY_ACTIVITY_SUMMARY;

  return {
    range,
    weekNumber: params.weekNumber ?? 0,
    planned,
    completed,
    skipped,
    pending,
    keyPlanned,
    keyCompleted,
    plannedMinutes: Math.round(plannedMinutes),
    doneMinutes: Math.round(doneMinutes),
    plannedKm: Math.round(plannedKm * 10) / 10,
    doneKm: Math.round(doneKm * 10) / 10,
    avgRpe: rpes.length > 0 ? Math.round((rpes.reduce((a, b) => a + b, 0) / rpes.length) * 10) / 10 : null,
    activities: summary,
    totalMinutes: Math.round(doneMinutes) + summary.minutes,
    adherence: planned > 0 ? completed / planned : null,
    verdict: verdictOf(planned, completed, completed + skipped, summary.count),
  };
}

/** Le bilan a-t-il quelque chose à dire ? Un écran ne montre pas un bilan vide. */
export function hasSomethingToReview(review: WeekReview): boolean {
  return review.planned > 0 || review.activities.count > 0;
}
