import type { TrainingPhase, AnyWorkoutTemplate } from "@/types";
import type { PlanSession, RaceDistance, TrainingPlan } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import { PRACTICE_META, practiceFromRaceDistance, type Practice } from "@/types/practice";
import { dateToWeekAndDay, getPlanMonday, getSessionCalendarDate, isoDateOnly } from "@/lib/planDates";
import { getCurrentWeek, isPlanEnded } from "@/lib/planUtils";
import { plannedMinutesOf } from "@/lib/weekRings";

/**
 * Ce que la carte d'un plan affiche, calculé une fois, sans texte.
 *
 * ── À date, pas au calendrier ────────────────────────────────────────────
 *
 * L'ancienne carte disait quatre fois la même chose : une sparkline, une
 * jauge, `Semaine 2 / 5` et `40 %` mesuraient tous les dates qui passent.
 * Aucun ne disait si les séances avaient eu lieu, et un plan terminé
 * affichait 100 % même vide. Les deux chiffres d'ici comparent le FAIT au
 * PRÉVU sur ce qui aurait déjà dû avoir lieu : les séances dont le jour est
 * antérieur ou égal à aujourd'hui. Une séance de demain n'est pas en retard.
 *
 * ── Les règles, empruntées et pas réécrites ──────────────────────────────
 *
 * - Le jour de course (`__race_day__`) et les jours de repos ne sont pas des
 *   séances : ils ne se comptent pas.
 * - Faite veut dire `completed` ou `modified`, comme dans `weekReview` et
 *   `weekRings`. Une séance non close n'est pas faite, sans être sautée.
 * - La durée PRÉVUE d'une séance suit sa précision (`plannedMinutesOf`, la
 *   fonction des anneaux) : le milieu de la fourchette pour une souple, la
 *   durée posée pour une fixée. Sans gabarit chargé, la durée posée, qui est
 *   déjà ce milieu quand la séance est née souple.
 * - La durée FAITE est la durée réelle saisie, sinon la prévue.
 * - Les dates viennent de `planDates`, la semaine en cours de
 *   `getCurrentWeek` et la fin de `isPlanEnded`, avec `today` passé en
 *   argument pour que le module reste pur.
 *
 * ── Ce qui n'est PAS ici ─────────────────────────────────────────────────
 *
 * Aucun mot, aucun format. Les pastilles sont des valeurs typées, le compte à
 * rebours un nombre de jours, la prochaine séance un identifiant de gabarit :
 * les libellés sont dans les traductions et les noms dans le catalogue.
 */

export type PlanWeekState = "past" | "current" | "future";

export interface PlanCardWeek {
  number: number;
  phase: TrainingPhase;
  state: PlanWeekState;
  plannedMin: number;
  doneMin: number;
  /** La semaine qui porte la course visée. */
  isRace: boolean;
}

export interface PlanCardPhase {
  phase: TrainingPhase;
  /** La colonne de sa première semaine dans la frise, 1-indexée. */
  start: number;
  weeks: number;
  current: boolean;
}

/** Fait sur prévu, en séances ou en minutes. */
export interface Tally {
  done: number;
  planned: number;
}

export type PlanChip =
  | { kind: "distance"; distance: RaceDistance }
  | { kind: "practice"; practice: Practice }
  | { kind: "target"; value: string }
  | { kind: "mode"; mode: "free" | "prebuilt" };

export interface PlanCountdown {
  /** `0` le jour même : Jour J. */
  days: number;
  kind: "race" | "end";
  /** `YYYY-MM-DD`. */
  date: string;
}

export interface PlanNextSession {
  date: string;
  weekNumber: number;
  dayOfWeek: number;
  workoutId: string;
  sessionType: PlanSession["sessionType"];
  durationMin: number;
}

export interface PlanCardModel {
  ended: boolean;
  chips: PlanChip[];
  /** `null` pour un plan terminé. */
  countdown: PlanCountdown | null;
  /** 1-indexée ; `0` avant le début du plan, au-delà de `weekTotal` après. */
  weekNow: number;
  weekTotal: number;
  phaseNow: TrainingPhase | null;
  weeks: PlanCardWeek[];
  phases: PlanCardPhase[];
  /** Le plus gros prévu d'une semaine, l'échelle des barres. */
  maxWeekMin: number;
  sessionsToDate: Tally;
  minutesToDate: Tally;
  /** Sur tout le plan, pour l'historique. */
  sessionsTotal: Tally;
  minutesTotal: Tally;
  span: { start: string; end: string };
  next: PlanNextSession | null;
}

export type WorkoutLookup = (id: string) => AnyWorkoutTemplate | undefined;

const RACE_DAY = "__race_day__";
const MAX_CHIPS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Les marqueurs et les jours de repos ne sont pas des séances. */
export function isCountedSession(session: PlanSession): boolean {
  if (session.workoutId === RACE_DAY) return false;
  return session.sessionType !== "rest" && session.sessionType !== "rest_day";
}

function isDone(session: PlanSession): boolean {
  return session.status === "completed" || session.status === "modified";
}

/** Une date `YYYY-MM-DD` en minuit local, comme `planDates`. */
function localDate(iso: string): Date {
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(from: Date, to: Date): number {
  // Math.round absorbe les changements d'heure, comme getCurrentWeek.
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

function chipsOf(plan: TrainingPlan): PlanChip[] {
  const { raceDistance, planMode, practice: storedPractice } = plan.config;
  const chips: PlanChip[] = [];
  if (raceDistance) chips.push({ kind: "distance", distance: raceDistance });
  const practice = raceDistance ? practiceFromRaceDistance(raceDistance) : storedPractice;
  // `Trail` pour la distance et `Trail` pour la pratique : une pastille suffit.
  if (
    practice &&
    !(raceDistance && PRACTICE_META[practice].label === RACE_DISTANCE_META[raceDistance].label)
  ) {
    chips.push({ kind: "practice", practice });
  }
  if (plan.raceTimePrediction) chips.push({ kind: "target", value: plan.raceTimePrediction });
  if (planMode === "free" || planMode === "prebuilt") chips.push({ kind: "mode", mode: planMode });
  return chips.slice(0, MAX_CHIPS);
}

export function buildPlanCardModel(
  plan: TrainingPlan,
  today: Date,
  workoutOf: WorkoutLookup = () => undefined,
): PlanCardModel {
  const monday = getPlanMonday(plan);
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayIso = isoDateOnly(today0);
  const ended = isPlanEnded(plan, today);
  const weekTotal = plan.totalWeeks;
  const weekNow = getCurrentWeek(plan.config.startDate || plan.config.createdAt, today);

  // La semaine de course : celle qui porte le marqueur, sinon celle de la date.
  let raceWeek: number | null = null;
  for (const week of plan.weeks) {
    if (week.sessions.some((s) => s.workoutId === RACE_DAY)) raceWeek = week.weekNumber;
  }
  if (raceWeek === null && plan.config.raceDate) {
    raceWeek = dateToWeekAndDay(monday, localDate(plan.config.raceDate))?.weekNumber ?? null;
  }
  // Le générateur peut poser la course au-delà de la dernière semaine du
  // plan : le drapeau va alors sur la dernière, celle qui y mène.
  const lastWeek = Math.max(0, ...plan.weeks.map((w) => w.weekNumber));
  if (raceWeek !== null && raceWeek > lastWeek) raceWeek = lastWeek;

  const sessionsToDate: Tally = { done: 0, planned: 0 };
  const minutesToDate: Tally = { done: 0, planned: 0 };
  const sessionsTotal: Tally = { done: 0, planned: 0 };
  const minutesTotal: Tally = { done: 0, planned: 0 };
  let next: PlanNextSession | null = null;

  const weeks: PlanCardWeek[] = [...plan.weeks]
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map((week) => {
      let plannedMin = 0;
      let doneMin = 0;
      // L'ordre du tableau est l'ordre du jour : la première rencontrée gagne.
      const sessions = [...week.sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      for (const session of sessions) {
        if (!isCountedSession(session)) continue;
        const date = isoDateOnly(getSessionCalendarDate(monday, week.weekNumber, session.dayOfWeek));
        const planned = plannedMinutesOf(session, workoutOf(session.workoutId));
        const done = isDone(session);
        const actual =
          session.actualDurationMin && session.actualDurationMin > 0
            ? session.actualDurationMin
            : planned;

        plannedMin += planned;
        sessionsTotal.planned += 1;
        minutesTotal.planned += planned;
        if (done) {
          doneMin += actual;
          sessionsTotal.done += 1;
          minutesTotal.done += actual;
        }

        if (date <= todayIso) {
          sessionsToDate.planned += 1;
          minutesToDate.planned += planned;
          if (done) {
            sessionsToDate.done += 1;
            minutesToDate.done += actual;
          }
        }
        // Aujourd'hui compte à date ET peut être la prochaine séance. Une
        // séance close, faite ou sautée, n'est plus à venir.
        if (date >= todayIso && !next && !done && session.status !== "skipped") {
          next = nextOf(session, date, week.weekNumber, planned);
        }
      }
      const state: PlanWeekState =
        week.weekNumber < weekNow ? "past" : week.weekNumber === weekNow ? "current" : "future";
      return {
        number: week.weekNumber,
        phase: week.phase,
        state,
        plannedMin: Math.round(plannedMin),
        doneMin: Math.round(doneMin),
        isRace: raceWeek === week.weekNumber,
      };
    });

  // Les phases se rangent sur les colonnes des semaines : une phase couvre
  // exactement les barres de ses semaines, bornée à la frise.
  const firstWeek = weeks[0]?.number ?? 1;
  const columns = weeks.length;
  const phases: PlanCardPhase[] = plan.phases
    .map((range) => {
      const start = Math.max(1, range.startWeek - firstWeek + 1);
      const end = Math.min(columns, range.endWeek - firstWeek + 1);
      return {
        phase: range.phase,
        start,
        weeks: end - start + 1,
        current: weekNow >= range.startWeek && weekNow <= range.endWeek,
      };
    })
    .filter((p) => p.weeks > 0);
  const phaseNow =
    plan.phases.find((r) => weekNow >= r.startWeek && weekNow <= r.endWeek)?.phase ??
    weeks.find((w) => w.number === weekNow)?.phase ??
    null;

  const lastSunday = isoDateOnly(getSessionCalendarDate(monday, Math.max(1, weekTotal), 6));
  const start = (plan.config.startDate || plan.config.createdAt).split("T")[0];
  const end = (plan.config.endDate || plan.config.raceDate || lastSunday).split("T")[0];

  let countdown: PlanCountdown | null = null;
  if (!ended) {
    const raceDate = plan.config.raceDate?.split("T")[0];
    const endDate = plan.config.endDate?.split("T")[0];
    const target = raceDate
      ? { kind: "race" as const, date: raceDate }
      : { kind: "end" as const, date: endDate || lastSunday };
    const days = daysBetween(today0, localDate(target.date));
    if (days >= 0) countdown = { ...target, days };
  }

  const round = (t: Tally): Tally => ({ done: Math.round(t.done), planned: Math.round(t.planned) });

  return {
    ended,
    chips: chipsOf(plan),
    countdown,
    weekNow,
    weekTotal,
    phaseNow,
    weeks,
    phases,
    maxWeekMin: Math.max(0, ...weeks.map((w) => w.plannedMin)),
    sessionsToDate,
    minutesToDate: round(minutesToDate),
    sessionsTotal,
    minutesTotal: round(minutesTotal),
    span: { start, end },
    next,
  };
}

function nextOf(
  session: PlanSession,
  date: string,
  weekNumber: number,
  durationMin: number,
): PlanNextSession {
  return {
    date,
    weekNumber,
    dayOfWeek: session.dayOfWeek,
    workoutId: session.workoutId,
    sessionType: session.sessionType,
    durationMin: Math.round(durationMin),
  };
}
