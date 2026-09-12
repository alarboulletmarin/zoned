import type { PlanSession, TrainingPlan } from "@/types/plan";
import { dateToWeekAndDay, getPlanMonday } from "@/lib/planDates";

/**
 * Ce que le cockpit reprend.
 *
 * La ligne « reprendre » est le seul primaire de l'écran, donc elle doit
 * répondre sans poser de question : pas de sélecteur de plan, pas de liste.
 * La règle tient en une phrase, et c'est volontaire — quelqu'un doit pouvoir
 * prédire ce qu'il va voir :
 *
 *   **le plan dans lequel on est aujourd'hui ; si on est dans plusieurs, le
 *   plus récemment créé ; sinon le prochain à commencer.**
 *
 * Une semaine seule est un plan d'une semaine (`config.isSingleWeek`, cf.
 * `lib/weekToPlan.ts`) et se reprend **comme une semaine** : `isWeek` le dit,
 * pour que l'écran ne la déguise pas en plan de 16 semaines.
 *
 * Un jour sans séance n'est pas un trou : c'est du repos, et le dire est une
 * information. D'où `state: "rest"` plutôt qu'une absence.
 */

export type TodayState = "session" | "rest" | "upcoming" | "none";

export interface TodayFocus {
  state: TodayState;
  plan: TrainingPlan | null;
  /** Vrai pour une semaine seule. L'écran n'annonce alors pas « ton plan ». */
  isWeek: boolean;
  /** 1-indexé, et 0 quand le plan n'a pas commencé. */
  weekNumber: number;
  /** 0 = lundi … 6 = dimanche, convention du dépôt. */
  dayOfWeek: number;
  /** Les séances du jour. Vide sur un jour de repos. */
  sessions: PlanSession[];
  /**
   * La semaine en cours, sept cases, lundi d'abord — ce que la bande des sept
   * jours consomme. Toujours de longueur 7 ; une case vide est un jour de
   * repos, pas une absence de donnée.
   *
   * Vide (longueur 0) quand il n'y a pas de semaine en cours à montrer : un
   * plan qui n'a pas commencé, ou pas de plan du tout. La bande ne s'affiche
   * alors pas — elle ne prétend pas connaître une semaine qui n'existe pas.
   */
  week: PlanSession[][];
  /** Jours restants avant le début, pour l'état `upcoming`. */
  daysUntilStart: number;
}

const NOTHING: TodayFocus = {
  state: "none",
  plan: null,
  isWeek: false,
  weekNumber: 0,
  dayOfWeek: 0,
  sessions: [],
  week: [],
  daysUntilStart: 0,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function createdAtMs(plan: TrainingPlan): number {
  const parsed = Date.parse(plan.config.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Le plus récemment créé d'abord — « ce sur quoi je travaille en ce moment ». */
function byNewest(a: TrainingPlan, b: TrainingPlan): number {
  return createdAtMs(b) - createdAtMs(a);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function pickTodayFocus(
  plans: readonly TrainingPlan[],
  today: Date = new Date(),
): TodayFocus {
  if (plans.length === 0) return NOTHING;

  const midnight = startOfDay(today);
  const inProgress: { plan: TrainingPlan; weekNumber: number; dayOfWeek: number }[] = [];
  const upcoming: { plan: TrainingPlan; days: number }[] = [];

  for (const plan of plans) {
    const monday = getPlanMonday(plan);
    const position = dateToWeekAndDay(monday, midnight);

    if (!position) {
      // Le plan commence plus tard : `dateToWeekAndDay` rend null avant la
      // semaine 1, ce qui est exactement l'information « pas encore commencé ».
      upcoming.push({
        plan,
        days: Math.ceil((monday.getTime() - midnight.getTime()) / DAY_MS),
      });
      continue;
    }
    // Un plan terminé ne se « reprend » pas : on ne le propose plus.
    if (position.weekNumber > plan.totalWeeks) continue;
    inProgress.push({ plan, ...position });
  }

  if (inProgress.length > 0) {
    inProgress.sort((a, b) => byNewest(a.plan, b.plan));
    const { plan, weekNumber, dayOfWeek } = inProgress[0];
    const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
    // Une seule traversée pour les sept jours : la journée courante n'est
    // qu'une case de la semaine, et la bande a besoin des six autres.
    const byDay: PlanSession[][] = [[], [], [], [], [], [], []];
    for (const session of week?.sessions ?? []) {
      byDay[session.dayOfWeek]?.push(session);
    }
    const sessions = byDay[dayOfWeek] ?? [];
    return {
      state: sessions.length > 0 ? "session" : "rest",
      plan,
      isWeek: plan.config.isSingleWeek === true,
      weekNumber,
      dayOfWeek,
      sessions,
      week: byDay,
      daysUntilStart: 0,
    };
  }

  if (upcoming.length > 0) {
    // Le plus proche de commencer, puis le plus récemment créé à égalité.
    upcoming.sort((a, b) => a.days - b.days || byNewest(a.plan, b.plan));
    const { plan, days } = upcoming[0];
    return {
      state: "upcoming",
      plan,
      isWeek: plan.config.isSingleWeek === true,
      weekNumber: 0,
      dayOfWeek: 0,
      sessions: [],
      week: [],
      daysUntilStart: days,
    };
  }

  return NOTHING;
}

/** Le plan (ou la semaine) dont vient la séance du jour. */
export function focusPlanHref(focus: TodayFocus): string | null {
  if (!focus.plan) return null;
  return focus.isWeek ? `/weeks/${focus.plan.id}` : `/plan/${focus.plan.id}`;
}

/**
 * Le chemin vers LA SÉANCE, pas vers le plan.
 *
 * Le bouton du cockpit pointait le plan, ce qui coûtait trois taps et une
 * recherche pour arriver à la séance du jour : ouvrir le plan, repérer
 * aujourd'hui dans le calendrier, toucher la séance. Sur un écran dont toute
 * la raison d'être est « qu'est-ce que je cours aujourd'hui », c'était deux
 * taps de trop.
 *
 * Quand la journée porte plusieurs séances il n'y a pas de destination unique :
 * on ouvre alors le plan à la bonne semaine, qui les montre toutes.
 */
export function focusSessionHref(focus: TodayFocus): string | null {
  if (focus.sessions.length === 1) return sessionHref(focus.sessions[0]);
  const plan = focusPlanHref(focus);
  if (!plan) return null;
  return focus.weekNumber > 0 ? `${plan}?week=${focus.weekNumber}` : plan;
}

/** Le chemin d'une séance de plan. */
export function sessionHref(session: PlanSession): string {
  return `/workout/${session.workoutId}`;
}
