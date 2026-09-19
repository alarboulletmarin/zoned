import type { PlanSession, TrainingPlan } from "@/types/plan";
import {
  getSessionCalendarDate,
  isoDateOnly,
} from "@/lib/planDates";
import {
  EMPTY_COMPOSITION,
  byNewest,
  resolveTodaySources,
  sourcePosition,
  type TodayComposition,
  type TodaySource,
} from "@/lib/todayComposition";

/**
 * Ce que le cockpit reprend.
 *
 * La ligne reprendre est le seul primaire de l'écran, donc elle doit
 * répondre sans poser de question : pas de sélecteur de plan, pas de liste.
 * La règle tient en une phrase, et c'est volontaire, quelqu'un doit pouvoir
 * prédire ce qu'il va voir :
 *
 *   **tout ce que la composition suit et qui est en cours aujourd'hui,
 *   empilé jour par jour ; sinon la prochaine source à commencer.**
 *
 * Ce que la composition suit est décidé dans `lib/todayComposition.ts` : les
 * plans, tant qu'on ne les éteint pas, et les semaines seules qu'on a POSÉES
 * sur le calendrier. Le cockpit ne reprenait qu'un plan, le plus récent, et
 * une semaine composée pendant un plan faisait disparaître le plan : c'est
 * fini, les deux se lisent ensemble, séance par séance.
 *
 * Il reste UN plan primaire, `plan` : celui qui donne la ligne de position
 * (semaine 6 / 16 · J-70) et le chemin du lien. C'est le plan en cours le
 * plus récent, et une semaine posée seulement quand aucun plan ne l'est.
 * `isWeek` le dit, pour que l'écran ne déguise pas une semaine en plan de
 * 16 semaines.
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

/**
 * L'ADRESSE d'une séance : le plan, sa semaine, son index dans la semaine.
 *
 * `updateSessionCompletion` adresse une séance par ces trois-là, il n'y a pas
 * d'identifiant de séance dans le modèle. Le cockpit ne gardait que l'index,
 * le plan étant unique ; dès que deux sources s'empilent, chaque séance doit
 * dire de laquelle elle vient, sinon clore la séance de renforcement écrirait
 * dans le plan marathon.
 */
export interface SessionRef {
  planId: string;
  /** 1-indexé, dans le plan de `planId`. */
  weekNumber: number;
  /** L'index dans `plan.weeks[n].sessions`. */
  index: number;
}

export interface TodayFocus {
  state: TodayState;
  /** Le plan primaire : position, chemin. `null` sans rien à reprendre. */
  plan: TrainingPlan | null;
  /** Vrai quand le primaire est une semaine seule. */
  isWeek: boolean;
  /**
   * Les sources EN COURS que l'écran empile, primaire en tête. Vide sans
   * rien en cours ; pour `upcoming`, la seule source à venir.
   */
  sources: TodaySource[];
  /** 1-indexé dans le primaire, et 0 quand rien n'a commencé. */
  weekNumber: number;
  /** 0 = lundi … 6 = dimanche, convention du dépôt. */
  dayOfWeek: number;
  /** Les séances du jour, toutes sources confondues. Vide sur un jour de repos. */
  sessions: PlanSession[];
  /** L'adresse de chaque séance de `sessions`, alignée un pour un. */
  sessionRefs: SessionRef[];
  /**
   * La semaine en cours, sept cases, lundi d'abord, ce que la bande des sept
   * jours consomme. Toujours de longueur 7 ; une case vide est un jour de
   * repos, pas une absence de donnée.
   *
   * Vide (longueur 0) quand il n'y a pas de semaine en cours à montrer : rien
   * n'a commencé, ou pas de source du tout. La bande ne s'affiche alors pas,
   * elle ne prétend pas connaître une semaine qui n'existe pas.
   */
  week: PlanSession[][];
  /** Les adresses de `week`, case par case. Même contrat que `sessionRefs`. */
  weekRefs: SessionRef[][];
  /** Jours restants avant le début, pour l'état `upcoming`. */
  daysUntilStart: number;
}

const NOTHING: TodayFocus = {
  state: "none",
  plan: null,
  isWeek: false,
  sources: [],
  weekNumber: 0,
  dayOfWeek: 0,
  sessions: [],
  sessionRefs: [],
  week: [],
  weekRefs: [],
  daysUntilStart: 0,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Le primaire parmi des sources en cours : un plan avant une semaine, le plus
 * récent à égalité. `resolveTodaySources` les rend déjà dans cet ordre.
 */
function primaryOf(sources: readonly TodaySource[]): TodaySource | null {
  return sources.find((s) => !s.isWeek) ?? sources[0] ?? null;
}

/**
 * Les séances d'un JOUR d'une source, avec leur adresse. `null` hors de la
 * source. L'ordre est celui de la semaine stockée, l'index en dépend.
 */
function sourceDay(
  source: TodaySource,
  date: Date,
): { weekNumber: number; dayOfWeek: number; sessions: PlanSession[]; refs: SessionRef[] } | null {
  const position = sourcePosition(source, date);
  if (!position) return null;
  const week = source.plan.weeks.find((w) => w.weekNumber === position.weekNumber);
  const sessions: PlanSession[] = [];
  const refs: SessionRef[] = [];
  const all = week?.sessions ?? [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].dayOfWeek !== position.dayOfWeek) continue;
    sessions.push(all[i]);
    refs.push({ planId: source.plan.id, weekNumber: position.weekNumber, index: i });
  }
  return { ...position, sessions, refs };
}

export function pickTodayFocus(
  plans: readonly TrainingPlan[],
  today: Date = new Date(),
  composition: TodayComposition = EMPTY_COMPOSITION,
): TodayFocus {
  if (plans.length === 0) return NOTHING;

  const midnight = startOfDay(today);
  const sources = resolveTodaySources(plans, composition, midnight);
  const underWay = sources.filter((s) => sourcePosition(s, midnight) !== null);

  if (underWay.length > 0) {
    const primary = primaryOf(underWay)!;
    const ordered = [primary, ...underWay.filter((s) => s !== primary)];
    const position = sourcePosition(primary, midnight)!;

    // Une seule traversée pour les sept jours : la journée courante n'est
    // qu'une case de la semaine, et la bande a besoin des six autres. Toutes
    // les sources partagent le même lundi calendaire (chaque lundi de source
    // est normalisé), donc la case d'un jour est la concaténation, primaire
    // en tête, de ce que chaque source y porte.
    const byDay: PlanSession[][] = [[], [], [], [], [], [], []];
    const byDayRefs: SessionRef[][] = [[], [], [], [], [], [], []];
    for (let day = 0; day < 7; day++) {
      const date = new Date(midnight);
      date.setDate(date.getDate() + (day - position.dayOfWeek));
      for (const source of ordered) {
        const found = sourceDay(source, date);
        if (!found) continue;
        byDay[day].push(...found.sessions);
        byDayRefs[day].push(...found.refs);
      }
    }
    const sessions = byDay[position.dayOfWeek];
    return {
      state: sessions.length > 0 ? "session" : "rest",
      plan: primary.plan,
      isWeek: primary.isWeek,
      sources: ordered,
      weekNumber: position.weekNumber,
      dayOfWeek: position.dayOfWeek,
      sessions,
      sessionRefs: byDayRefs[position.dayOfWeek],
      week: byDay,
      weekRefs: byDayRefs,
      daysUntilStart: 0,
    };
  }

  // Rien en cours : la source la plus proche de commencer, la plus récemment
  // créée à égalité. Une source déjà terminée n'a rien à annoncer.
  const upcoming = sources
    .filter((s) => s.monday.getTime() > midnight.getTime())
    .map((s) => ({
      source: s,
      days: Math.ceil((s.monday.getTime() - midnight.getTime()) / DAY_MS),
    }))
    .sort((a, b) => a.days - b.days || byNewest(a.source.plan, b.source.plan));

  if (upcoming.length > 0) {
    const { source, days } = upcoming[0];
    return {
      state: "upcoming",
      plan: source.plan,
      isWeek: source.isWeek,
      sources: [source],
      weekNumber: 0,
      dayOfWeek: 0,
      sessions: [],
      sessionRefs: [],
      week: [],
      weekRefs: [],
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
    // Le dimanche de la dernière semaine, la fin du plan lui-même, compté
    // depuis le lundi de la SOURCE : une semaine posée finit là où on l'a posée.
    const monday = focus.sources[0]?.monday ?? startOfDay(today);
    goal = getSessionCalendarDate(monday, plan.totalWeeks, 6);
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

/**
 * La bande des sept jours : UN BLOC PAR SÉANCE, et la géométrie qui va avec.
 *
 * La barre d'un jour était unique et ne portait que son total : une heure de
 * natation, deux de vélo et trois de course faisaient une barre de six heures,
 * et rien à l'écran ne disait qu'il fallait sortir trois fois. Le nombre de
 * séances était la seule chose que la bande taisait, alors que c'est la
 * première à changer une journée.
 *
 * Trois règles, et elles se tiennent :
 *
 * 1. **La colonne garde la hauteur de sa journée.** Les blocs se partagent ce
 *    budget, filets compris. Sans ça une journée découpée paraîtrait plus
 *    longue qu'une journée d'un seul bloc de même durée, et la bande dirait le
 *    nombre de séances à la place des minutes, c'est-à-dire l'erreur inverse
 *    de celle qu'on corrige.
 * 2. **Chaque bloc vaut sa séance**, au prorata des minutes, avec un plancher :
 *    sous 3 px un bloc n'est plus un bloc, c'est l'épaisseur d'un trait.
 * 3. **Rien ne dépasse le créneau**, qui vaut `BAR_MAX`. C'est ce qui permet
 *    au créneau d'être de hauteur FIXE dans le CSS, donc à la bande de ne pas
 *    bouger d'un pixel quand on choisit un autre jour. La règle tient jusqu'à
 *    huit séances dans la même journée : au-delà, les planchers et les filets
 *    valent à eux seuls plus que le créneau. Un plan qui en écrirait neuf le
 *    même jour aurait un autre problème.
 *
 * `longest` est le total du jour le plus long de la semaine : c'est l'échelle,
 * et elle est commune aux sept colonnes, sinon deux hauteurs ne se comparent
 * pas.
 */
export const BAR_MIN = 8;
export const BAR_MAX = 40;
/** Le filet entre deux séances du même jour. C'est lui qui les fait deux. */
export const BAR_GAP = 2;
/** Sous 3 px, un bloc n'est plus un bloc, c'est l'épaisseur d'un trait. */
export const BLOCK_MIN = 3;

export function dayBarBlocks(
  day: readonly PlanSession[],
  longest: number,
): { shape: DayStatus; height: number }[] {
  if (day.length === 0) return [];

  const mins = day.map((s) => s.actualDurationMin ?? s.estimatedDurationMin ?? 0);
  const total = mins.reduce((n, m) => n + m, 0);
  // Le `min` est la ceinture : `longest` est le total du jour le plus long, donc
  // le rapport ne dépasse jamais 1 quand l'appelant passe la bonne échelle. Il
  // coûte une comparaison et garantit la règle 3 même s'il se trompe.
  const column =
    total === 0
      ? BAR_MIN
      : Math.min(
          BAR_MAX,
          BAR_MIN + Math.round((total / Math.max(1, longest)) * (BAR_MAX - BAR_MIN)),
        );
  const budget = column - BAR_GAP * (day.length - 1);

  /* Arrondi CUMULÉ, et c'est ce qui garde la somme exacte : arrondir chaque
     bloc pour lui-même fait gagner un demi-pixel à chacun, et quatre séances
     d'une heure rendaient 42 px là où la colonne en vaut 40. On arrondit donc
     la somme courante, et chaque bloc prend ce qui lui reste. */
  const heights: number[] = [];
  let used = 0;
  let cumulative = 0;
  for (let i = 0; i < day.length; i++) {
    cumulative += total > 0 ? mins[i] / total : 1 / day.length;
    const upTo = Math.round(budget * cumulative);
    // Des séances sans durée se partagent le budget à parts égales : elles
    // existent, elles doivent se voir, et rien ne permet de les ordonner.
    heights.push(Math.max(BLOCK_MIN, upTo - used));
    used = upTo;
  }

  /* Les planchers, eux, ne s'arrondissent pas : une séance d'une minute à côté
     d'une sortie longue prend ses 3 px quoi qu'il arrive, et la colonne les
     rend. On les reprend au plus GRAND bloc, qui est celui qui les remarque le
     moins, et jamais sous le plancher. */
  let excess = heights.reduce((n, h) => n + h, 0) + BAR_GAP * (day.length - 1) - column;
  while (excess > 0) {
    let tallest = 0;
    for (let i = 1; i < heights.length; i++) if (heights[i] > heights[tallest]) tallest = i;
    if (heights[tallest] <= BLOCK_MIN) break;
    heights[tallest] -= 1;
    excess -= 1;
  }

  return day.map((session, i) => ({
    // Le statut est pris SÉANCE PAR SÉANCE : la première sortie peut être
    // faite quand la seconde ne l'est pas, et deux blocs savent le dire là où
    // une barre unique devait trancher.
    shape: dayStatus([session]),
    height: heights[i],
  }));
}

/**
 * LA FAMILLE d'une séance : course, vélo, natation, renforcement.
 *
 * Le cockpit nommait la séance sans jamais dire de quel SPORT elle est. Sur un
 * plan qui ne court pas, c'est l'information qu'on cherche en premier le
 * matin, on ne prépare pas le même sac, et elle était la seule à ne se lire
 * nulle part, ni dans la bande, ni sur la pile.
 *
 * Deux sources, parce que le modèle en a deux, et c'est assumé :
 *
 * - `discipline` est un champ de la séance, `running | cycling | swimming`, et
 *   son absence vaut course à pied (c'est le défaut historique, aucun plan
 *   écrit avant ce champ ne le porte) ;
 * - le RENFORCEMENT n'est pas une discipline au sens du modèle, c'est un
 *   `sessionType`. Le préfixe `STR-` le double, parce que les séances du
 *   catalogue de renforcement le portent sans toujours porter le type.
 *   `PlanCalendar` fait déjà ce test, mot pour mot ; le jour où il voudra
 *   cette fonction, elle est ici.
 *
 * Pour l'œil, les quatre sont au même rang : ce sont quatre sacs différents.
 */
export type SessionKind = "running" | "cycling" | "swimming" | "strength";

export function sessionKind(session: PlanSession): SessionKind {
  if (session.sessionType === "strength" || session.workoutId?.startsWith("STR-")) {
    return "strength";
  }
  return session.discipline ?? "running";
}

/**
 * Les familles PRÉSENTES dans une journée, une seule fois chacune et dans
 * l'ordre où elles arrivent.
 *
 * Une fois chacune, parce que la bande dit déjà COMBIEN de séances il y a, par
 * ses blocs : répéter l'icône de course pour deux footings dirait deux fois la
 * même chose et laisserait croire que le nombre se compte là. Cette ligne-là
 * répond à quoi, pas à combien.
 */
export function dayKinds(day: readonly PlanSession[]): SessionKind[] {
  const kinds: SessionKind[] = [];
  for (const session of day) {
    const kind = sessionKind(session);
    if (!kinds.includes(kind)) kinds.push(kind);
  }
  return kinds;
}

/**
 * LE SECOND CANAL de la bande : ce qui a eu lieu HORS du plan, sous le sol.
 *
 * La bande ne dessinait que le plan, donc une journée passée à pédaler
 * jusqu'au bureau s'y lisait repos. C'est le seul mensonge qu'une bande de sept
 * jours puisse commettre, et une bande qui ment ne sert plus à rien.
 *
 * Le complément ne s'ajoute pas à la pile : il descend SOUS le filet du sol.
 * Deux raisons, et la seconde est la vraie.
 *
 * 1. Le partager le budget de la colonne ferait rétrécir les blocs du plan les
 *    jours de vélotaf, et sept hauteurs qui ne mesurent plus la même chose
 *    d'un jour à l'autre ne se comparent plus.
 * 2. Ce n'est pas la même grandeur. Une heure de vélotaf n'est pas une heure
 *    de séance, et les empiler dirait qu'elles le sont. Au-dessus du sol, ce
 *    que le plan demande ; en dessous, ce que la vie a ajouté.
 *
 * L'échelle est donc PROPRE au canal, `longestExtra` et non le jour le plus
 * long : les compléments se comparent entre eux, et jamais à une séance. Le
 * plancher de `BLOCK_MIN` vaut ici comme ailleurs, un trajet de dix minutes
 * doit se voir.
 */
export const EXTRA_MAX = 12;

export function extraBlockHeight(minutes: number, longestExtra: number): number {
  if (minutes <= 0) return 0;
  const share = Math.min(1, minutes / Math.max(1, longestExtra));
  return Math.max(BLOCK_MIN, Math.round(share * EXTRA_MAX));
}

/** Le chemin d'une séance de plan. */
export function sessionHref(session: PlanSession): string {
  return `/workout/${session.workoutId}`;
}

/* ── LE MOIS ──────────────────────────────────────────────────────────────
 *
 * La bande des sept jours répond à la question de demain. Elle ne répond pas
 * à celle de dans trois semaines, ni à ce que ce mois a pesé. Le mois est le
 * même instrument, un cran plus loin : une grille de dates, où
 * chaque case porte ce que la colonne de la bande porte déjà (les familles,
 * le statut séance par séance, le complément), et dont le choix recharge la
 * pile en dessous, exactement comme la bande.
 *
 * Tout ici s'adresse par DATE, pas par index de semaine : une case de mars
 * appartient à une autre semaine du plan que celle qu'on vit, et la clôture
 * comme la pile ont besoin de savoir laquelle.
 */

/** Un mois du calendrier. `month` est 0-indexé, comme `Date`. */
export interface MonthRef {
  year: number;
  month: number;
}

export function monthOf(date: Date): MonthRef {
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
  const d = new Date(ref.year, ref.month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function sameMonth(a: MonthRef, b: MonthRef): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Avant, égal, après : pour borner la navigation. */
export function compareMonth(a: MonthRef, b: MonthRef): number {
  return a.year !== b.year ? a.year - b.year : a.month - b.month;
}

/** Une date "YYYY-MM-DD" lue à minuit LOCAL, jamais en UTC. */
export function dateFromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Le premier et le dernier jour du mois, en dates seules. */
export function monthRange(ref: MonthRef): { from: string; to: string } {
  return {
    from: isoDateOnly(new Date(ref.year, ref.month, 1)),
    to: isoDateOnly(new Date(ref.year, ref.month + 1, 0)),
  };
}

/**
 * Une journée du cockpit, adressée par sa date.
 *
 * `weekNumber` est la semaine du plan PRIMAIRE qui contient cette date, `0`
 * quand la date est hors de lui. `refs` garde la seule adresse qu'ait une
 * séance, comme `weekRefs` : c'est ce qui permet de clore une séance de
 * n'importe quelle semaine, de n'importe quelle source, depuis la grille.
 * `inPlan` est vrai dès qu'UNE source couvre la date : une semaine posée
 * après la fin du plan est une journée du cockpit comme une autre.
 */
export interface PlanDay {
  /** "YYYY-MM-DD". */
  date: string;
  /** 1-indexé dans le primaire, `0` hors de lui. */
  weekNumber: number;
  /** 0 = lundi … 6 = dimanche. */
  dayOfWeek: number;
  sessions: PlanSession[];
  refs: SessionRef[];
  /** Vrai quand la date tombe dans une semaine d'une source. */
  inPlan: boolean;
}

export function planDay(focus: TodayFocus, date: Date): PlanDay {
  const midnight = startOfDay(date);
  const iso = isoDateOnly(midnight);
  // `getDay` rend 0 le dimanche, la convention du dépôt est lundi = 0.
  const dayOfWeek = (midnight.getDay() + 6) % 7;
  const day: PlanDay = { date: iso, weekNumber: 0, dayOfWeek, sessions: [], refs: [], inPlan: false };

  for (const source of focus.sources) {
    const found = sourceDay(source, midnight);
    if (!found) continue;
    day.inPlan = true;
    if (source.plan === focus.plan) day.weekNumber = found.weekNumber;
    day.sessions.push(...found.sessions);
    day.refs.push(...found.refs);
  }
  return day;
}

/**
 * Les séances de toutes les sources dont la DATE tombe dans l'intervalle,
 * bornes comprises. C'est `planSessionsBetween` (`lib/weekReview.ts`) porté
 * à plusieurs sources, chacune datée depuis SON lundi : le bilan du mois et
 * celui de la semaine en ont besoin, et ils ne peuvent plus lire un seul plan.
 */
export function focusSessionsBetween(focus: TodayFocus, from: string, to: string): PlanSession[] {
  const out: PlanSession[] = [];
  for (const source of focus.sources) {
    for (const week of source.plan.weeks) {
      // Une semaine entièrement hors de l'intervalle ne se parcourt pas.
      const weekFrom = isoDateOnly(getSessionCalendarDate(source.monday, week.weekNumber, 0));
      const weekTo = isoDateOnly(getSessionCalendarDate(source.monday, week.weekNumber, 6));
      if (weekTo < from || weekFrom > to) continue;
      for (const session of week.sessions) {
        const date = isoDateOnly(
          getSessionCalendarDate(source.monday, week.weekNumber, session.dayOfWeek),
        );
        if (date >= from && date <= to) out.push(session);
      }
    }
  }
  return out;
}

/**
 * Les CONFLITS de la semaine en cours : deux sources qui posent chacune une
 * séance CLÉ le même jour. Deux séances le même jour ne sont pas un conflit,
 * c'est le cas nominal, course le matin et renforcement le soir ; deux
 * séances clés le sont, parce qu'une séance clé demande d'arriver frais, et
 * qu'aucune des deux sources ne sait que l'autre existe.
 *
 * Rend un élément par jour en conflit, avec les sources en cause, dans
 * l'ordre de la bande. Rien à dire quand une seule source est en cours.
 */
export function weekConflicts(focus: TodayFocus): { dayOfWeek: number; planIds: string[] }[] {
  if (focus.sources.length < 2) return [];
  const out: { dayOfWeek: number; planIds: string[] }[] = [];
  for (let day = 0; day < focus.week.length; day++) {
    const keyBy = new Set<string>();
    focus.week[day].forEach((session, k) => {
      if (session.isKeySession) keyBy.add(focus.weekRefs[day][k].planId);
    });
    if (keyBy.size >= 2) out.push({ dayOfWeek: day, planIds: [...keyBy] });
  }
  return out;
}

/** Le nom d'une source, dans la langue. Une semaine seule porte son nom donné. */
export function sourceName(source: TodaySource, isEn: boolean): string {
  return isEn ? source.plan.nameEn : source.plan.name;
}

/** Le chemin d'une source : la semaine seule sous /weeks, le plan sous /plan. */
export function sourceHref(source: TodaySource): string {
  return source.isWeek ? `/weeks/${source.plan.id}` : `/plan/${source.plan.id}`;
}

/** Une case de la grille du mois. */
export interface MonthCell extends PlanDay {
  dayOfMonth: number;
  /** Faux pour les cases de remplissage, qui appartiennent au mois voisin. */
  inMonth: boolean;
  isToday: boolean;
}

/** Six rangées de sept, toujours : la grille ne change pas de hauteur. */
export const MONTH_ROWS = 6;

/**
 * Les 42 cases d'un mois, du lundi de la première rangée au dimanche de la
 * sixième. Toujours 42, même pour un février qui tient en quatre rangées :
 * une grille qui change de hauteur d'un mois à l'autre déplace la pile sous
 * le doigt, et c'est la règle de tout cet écran.
 */
export function monthCells(focus: TodayFocus, ref: MonthRef, today: Date): MonthCell[] {
  const first = new Date(ref.year, ref.month, 1);
  const lead = (first.getDay() + 6) % 7;
  const todayIso = planDay(focus, today).date;
  const cells: MonthCell[] = [];
  for (let i = 0; i < MONTH_ROWS * 7; i++) {
    const date = new Date(ref.year, ref.month, 1 - lead + i);
    const day = planDay(focus, date);
    cells.push({
      ...day,
      dayOfMonth: date.getDate(),
      inMonth: date.getMonth() === ref.month,
      isToday: day.date === todayIso,
    });
  }
  return cells;
}

/**
 * Les mois que la grille peut montrer : du mois du premier lundi d'une source
 * à celui du dernier dimanche d'une source, toutes sources confondues. Hors
 * de tout il n'y a rien à choisir, donc rien à feuilleter. `null` sans source.
 */
export function monthBounds(focus: TodayFocus): { min: MonthRef; max: MonthRef } | null {
  let min: MonthRef | null = null;
  let max: MonthRef | null = null;
  for (const source of focus.sources) {
    const first = monthOf(source.monday);
    const last = monthOf(getSessionCalendarDate(source.monday, source.plan.totalWeeks, 6));
    if (!min || compareMonth(first, min) < 0) min = first;
    if (!max || compareMonth(last, max) > 0) max = last;
  }
  return min && max ? { min, max } : null;
}

/** La cellule ramenée dans les bornes, pour que le mois d'arrivée soit toujours feuilletable. */
export function clampMonth(ref: MonthRef, bounds: { min: MonthRef; max: MonthRef }): MonthRef {
  if (compareMonth(ref, bounds.min) < 0) return bounds.min;
  if (compareMonth(ref, bounds.max) > 0) return bounds.max;
  return ref;
}
