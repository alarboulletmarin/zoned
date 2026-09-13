import type { PlanSession, TrainingPlan } from "@/types/plan";
import { dateToWeekAndDay, getPlanMonday, getSessionCalendarDate } from "@/lib/planDates";

/**
 * Ce que le cockpit reprend.
 *
 * La ligne reprendre est le seul primaire de l'écran, donc elle doit
 * répondre sans poser de question : pas de sélecteur de plan, pas de liste.
 * La règle tient en une phrase, et c'est volontaire, quelqu'un doit pouvoir
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

/**
 * Le statut d'une JOURNÉE, pas d'une séance.
 *
 * `"rest"` n'est pas un statut de séance : c'est l'absence de séance, et la
 * bande le dessine comme un filet, pas comme une barre écrasée.
 */
export type DayStatus = "rest" | "planned" | "completed" | "modified" | "skipped";

export interface TodayFocus {
  state: TodayState;
  plan: TrainingPlan | null;
  /** Vrai pour une semaine seule. L'écran n'annonce alors pas ton plan. */
  isWeek: boolean;
  /** 1-indexé, et 0 quand le plan n'a pas commencé. */
  weekNumber: number;
  /** 0 = lundi … 6 = dimanche, convention du dépôt. */
  dayOfWeek: number;
  /** Les séances du jour. Vide sur un jour de repos. */
  sessions: PlanSession[];
  /**
   * Les index de `sessions` dans `plan.weeks[n].sessions`, alignés un pour un.
   *
   * `updateSessionCompletion` adresse une séance par (planId, weekNumber,
   * INDEX) : il n'y a pas d'identifiant de séance dans le modèle. Le
   * regroupement par jour ci-dessous perdait cet index, ce qui rendait la
   * clôture impossible depuis le cockpit. On le garde, dans la même passe.
   */
  sessionIndexes: number[];
  /**
   * La semaine en cours, sept cases, lundi d'abord, ce que la bande des sept
   * jours consomme. Toujours de longueur 7 ; une case vide est un jour de
   * repos, pas une absence de donnée.
   *
   * Vide (longueur 0) quand il n'y a pas de semaine en cours à montrer : un
   * plan qui n'a pas commencé, ou pas de plan du tout. La bande ne s'affiche
   * alors pas, elle ne prétend pas connaître une semaine qui n'existe pas.
   */
  week: PlanSession[][];
  /** Les index de `week`, case par case. Même contrat que `sessionIndexes`. */
  weekIndexes: number[][];
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
  sessionIndexes: [],
  week: [],
  weekIndexes: [],
  daysUntilStart: 0,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function createdAtMs(plan: TrainingPlan): number {
  const parsed = Date.parse(plan.config.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Le plus récemment créé d'abord, ce sur quoi je travaille en ce moment. */
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
      // semaine 1, ce qui est exactement l'information pas encore commencé.
      upcoming.push({
        plan,
        days: Math.ceil((monday.getTime() - midnight.getTime()) / DAY_MS),
      });
      continue;
    }
    // Un plan terminé ne se reprend pas : on ne le propose plus.
    if (position.weekNumber > plan.totalWeeks) continue;
    inProgress.push({ plan, ...position });
  }

  if (inProgress.length > 0) {
    inProgress.sort((a, b) => byNewest(a.plan, b.plan));
    const { plan, weekNumber, dayOfWeek } = inProgress[0];
    const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
    // Une seule traversée pour les sept jours : la journée courante n'est
    // qu'une case de la semaine, et la bande a besoin des six autres. On range
    // l'INDEX en parallèle de la séance, il est la seule adresse qu'ait une
    // séance et la clôture en a besoin.
    const byDay: PlanSession[][] = [[], [], [], [], [], [], []];
    const byDayIndex: number[][] = [[], [], [], [], [], [], []];
    const weekSessions = week?.sessions ?? [];
    for (let i = 0; i < weekSessions.length; i++) {
      const session = weekSessions[i];
      const slot = byDay[session.dayOfWeek];
      if (!slot) continue;
      slot.push(session);
      byDayIndex[session.dayOfWeek].push(i);
    }
    const sessions = byDay[dayOfWeek] ?? [];
    return {
      state: sessions.length > 0 ? "session" : "rest",
      plan,
      isWeek: plan.config.isSingleWeek === true,
      weekNumber,
      dayOfWeek,
      sessions,
      sessionIndexes: byDayIndex[dayOfWeek] ?? [],
      week: byDay,
      weekIndexes: byDayIndex,
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
      sessionIndexes: [],
      week: [],
      weekIndexes: [],
      daysUntilStart: days,
    };
  }

  return NOTHING;
}

/**
 * Le statut d'une journée, pour la bande des sept jours.
 *
 * **Non résolu l'emporte.** Une journée qui porte deux séances dont une seule
 * est faite n'est pas une journée faite : la barre reste creuse. Dire fait
 * trop tôt est le seul mensonge que cette bande puisse commettre, et une bande
 * qui ment ne sert plus à rien.
 *
 * Trois statuts résolus, et ils ne se confondent pas : `completed` et
 * `modified` sont deux façons d'avoir couru, `skipped` est la façon de ne pas
 * l'avoir fait. À plusieurs séances résolues de statuts différents, le plus
 * fort est celui qui a demandé le plus de travail.
 */
export function dayStatus(sessions: readonly PlanSession[]): DayStatus {
  if (sessions.length === 0) return "rest";

  let seenCompleted = false;
  let seenModified = false;
  let seenSkipped = false;

  for (const session of sessions) {
    const status = session.status;
    // `undefined` est le défaut historique : une séance écrite avant le suivi
    // de complétion est une séance prévue, pas une séance sans statut.
    if (status === undefined || status === "planned") return "planned";
    if (status === "completed") seenCompleted = true;
    else if (status === "modified") seenModified = true;
    else if (status === "skipped") seenSkipped = true;
  }

  if (seenCompleted) return "completed";
  if (seenModified) return "modified";
  if (seenSkipped) return "skipped";
  return "planned";
}

/** Où l'on en est du plan : le dénominateur, l'échéance, et ce qu'on vise. */
export interface PlanPosition {
  /** 1-indexé, la semaine courante. */
  weekNumber: number;
  /** Le dénominateur. `0` pour une semaine seule : 1 / 1 ne dit rien. */
  totalWeeks: number;
  /** Jours jusqu'à l'échéance, `null` si elle est passée ou qu'il n'y en a pas. */
  daysToGoal: number | null;
  /** Le nom de la course, quand le plan en connaît une. */
  goalName: string | null;
}

/**
 * Un plan ne tient que par sa fin.
 *
 * `semaine 1` sans dénominateur et un nom de plan sans échéance laissent la
 * sortie du jour flotter : on ne sait pas si 93 min est une grosse semaine ou
 * une reprise. Le dénominateur et le compte à rebours le disent en six
 * caractères.
 *
 * L'échéance vient de `config.raceDate` quand il existe. Sinon on retombe sur
 * le DERNIER JOUR DU PLAN, qui existe toujours : `prebuiltPlanConverter` jette
 * `raceDate` et `raceName`, donc un plan repris du catalogue n'a jamais que ce
 * repli, et c'est le cas le plus fréquent.
 */
export function planPosition(focus: TodayFocus, today: Date = new Date()): PlanPosition | null {
  const plan = focus.plan;
  if (!plan || focus.weekNumber <= 0) return null;

  const midnight = startOfDay(today);
  const raceDate = plan.config.raceDate;
  let goal: Date | null = null;

  if (raceDate) {
    const [y, m, d] = raceDate.split("T")[0].split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      goal = new Date(y, m - 1, d);
    }
  }
  if (!goal) {
    // Le dimanche de la dernière semaine, la fin du plan lui-même.
    goal = getSessionCalendarDate(getPlanMonday(plan), plan.totalWeeks, 6);
  }

  const days = Math.round((startOfDay(goal).getTime() - midnight.getTime()) / DAY_MS);

  return {
    weekNumber: focus.weekNumber,
    // Une semaine seule n'a pas de dénominateur : 1 / 1 est du bruit.
    totalWeeks: focus.isWeek ? 0 : plan.totalWeeks,
    // Le jour J compte : `J-0` est une information, pas une absence. Seule une
    // échéance PASSÉE disparaît, elle n'a plus rien à annoncer.
    daysToGoal: days >= 0 ? days : null,
    goalName: plan.config.raceName?.trim() || null,
  };
}

/** Le plan (ou la semaine) dont vient la séance du jour. */
export function focusPlanHref(focus: TodayFocus): string | null {
  if (!focus.plan) return null;
  return focus.isWeek ? `/weeks/${focus.plan.id}` : `/plan/${focus.plan.id}`;
}

/**
 * La semaine EN COURS, pas l'atelier qui en compose une.
 *
 * Le raccourci du cockpit s'appelait Ma semaine et menait à `/weeks/new`,
 * c'est-à-dire à l'écran qui CRÉE une semaine. Le mot promettait un lieu que
 * l'on possède, le lien ouvrait un formulaire vide : c'est le libellé qui
 * mentait, et il a menti dans le seul sens qui coûte, on croit retrouver son
 * plan et on tombe sur une page blanche.
 *
 * Il mène donc à la semaine où l'on se trouve quand il y en a une, et il ne
 * garde son atelier que lorsqu'il n'y a rien à retrouver. `mine` dit lequel
 * des deux, pour que le libellé suive la destination au lieu de la précéder.
 *
 * `weekNumber > 0` et pas `plan != null` : un plan qui n'a pas encore commencé
 * n'a pas de semaine en cours, et l'ouvrir à la semaine 0 ne veut rien dire.
 */
export function weekShortcut(focus: TodayFocus): { href: string; mine: boolean } {
  const plan = focusPlanHref(focus);
  if (plan && focus.weekNumber > 0) {
    return { href: `${plan}?week=${focus.weekNumber}`, mine: true };
  }
  return { href: "/weeks/new", mine: false };
}

/**
 * La date d'un jour de la bande, à partir de celle d'aujourd'hui.
 *
 * La bande choisit un jour, et la ligne de date en haut de l'écran doit le
 * suivre : sans elle, jeudi s'afficherait sous mardi 16 septembre. Le calcul
 * passe par `setDate`, qui est calendaire : il traverse les fins de mois et
 * les changements d'heure sans arithmétique de millisecondes.
 *
 * L'heure du jour est conservée : cette date ne sert qu'à être formatée.
 */
export function focusDayDate(focus: TodayFocus, day: number, today: Date): Date {
  const date = new Date(today);
  date.setDate(date.getDate() + (day - focus.dayOfWeek));
  return date;
}

/** Le chemin d'une séance de plan. */
export function sessionHref(session: PlanSession): string {
  return `/workout/${session.workoutId}`;
}
