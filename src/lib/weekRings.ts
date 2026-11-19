import type { PlanSession } from "@/types/plan";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import { getPeakZone, getZoneNumber, isRunningWorkout, isStrengthWorkout } from "@/types";
import type { Practice } from "@/types/practice";
import type { RingMetric } from "@/types/settings";
import {
  defaultRpe,
  purposeLabelKey,
  type ActivityDiscipline,
  type ComplementaryActivity,
} from "@/types/activity";
import { addSessionZoneMinutes, plannedSessionKm, sessionDiscipline } from "@/lib/planStats";
import {
  catalogRange,
  isLooseSession,
  rangeMidpoint,
  sessionTssFor,
} from "@/lib/sessionPrecision";
import { computeTotalElevationGain } from "@/lib/workoutMetrics";
import { activitySessionTss, isActivitySession } from "@/lib/activitySession";
import { summarizeActivities } from "@/lib/activityStats";
import { zoneFromRpe } from "@/lib/periodIntensity";
import { runTssFromZone } from "@/lib/planGenerator/tss";
import type { DateRange } from "@/lib/weekReview";

/**
 * Les anneaux de la semaine : Endurance, Qualité, Renfo, prévu contre fait.
 *
 * ── Par intensité, pas par sport ─────────────────────────────────────────
 *
 * Zoned est une app de course. Un anneau par sport donnerait un anneau course
 * qui porte tout et deux anneaux vides : la question d'un coureur n'est pas
 * combien de sports, c'est combien de facile, combien de dur, et est-ce que
 * le renfo a eu lieu. Le découpage suit la frontière du 80/20 de l'app,
 * celle de `PolarizationGauge` et de `computeWeekStats` : Z1-Z2 est
 * l'endurance, Z3 et plus la qualité. Le tempo est du côté dur.
 *
 * Ce n'est pas `--zone-threshold: 4` du design system, et c'est voulu : avec
 * Z3 en Endurance, la même semaine se lisait trop dure sur la jauge 80/20 de
 * la page de la semaine et sous le prévu en Qualité sur le cockpit. Deux
 * écrans de la même app ne doivent pas classer la même minute de deux façons.
 *
 * ── Le prévu ─────────────────────────────────────────────────────────────
 *
 * Chaque séance du plan dans l'intervalle, jour de course exclu :
 *
 * - sa DURÉE est celle qui compte selon `lib/sessionPrecision.ts` : le milieu
 *   de la fourchette du gabarit pour une séance souple, la durée posée pour
 *   une séance fixée ;
 * - ses minutes se répartissent entre Endurance et Qualité BLOC PAR BLOC, par
 *   `addSessionZoneMinutes` (la logique de `planStats`) : l'échauffement et le
 *   retour au calme tombent en Endurance, les blocs de seuil en Qualité. Un
 *   gabarit sans blocs se rabat sur sa zone dominante (`getPeakZone`), un
 *   gabarit pas encore chargé compte en Endurance le temps d'arriver ;
 * - ses KM sont ceux de la séance, sinon l'estimation à l'allure de son type
 *   (`plannedSessionKm`, le gabarit ne porte pas de distance à lui) ; son D+
 *   est celui du gabarit (`computeTotalElevationGain`), une séance du plan
 *   n'en porte pas. Les deux se répartissent au prorata des minutes ;
 * - le RENFO (`isStrengthWorkout`) compte en séances et en minutes, jamais
 *   dans Endurance ni Qualité ;
 * - une séance de vélo, de natation ou une activité posée dans la semaine
 *   n'est ni de la course ni du renfo : elle sort des anneaux et du total,
 *   et ne compte que dans la charge du plan.
 *
 * ── Le fait, et l'hypothèse qu'il porte ──────────────────────────────────
 *
 * Seules les séances `completed` ou `modified` comptent. Une durée ou une
 * distance réelle saisie remplace la prévue ; le D+ reste celui du gabarit,
 * la clôture n'en saisit pas.
 *
 * **La répartition du fait garde les proportions du prévu.** Sans fichier
 * FIT, on ne sait pas combien de temps la séance a réellement passé au-dessus
 * du seuil : un seuil prévu à 40 % de Qualité et couru 10 minutes plus long
 * est compté 40 % de Qualité sur sa durée réelle. C'est une hypothèse, et le
 * seul endroit honnête pour la poser est ici, écrite.
 *
 * ── Le hors plan ─────────────────────────────────────────────────────────
 *
 * Le journal `zoned-activities` n'entre JAMAIS dans les anneaux : un anneau
 * compare un fait à un prévu, et un vélotaf n'a pas de prévu. Il est rendu à
 * part (`offPlan`), avec sa charge.
 *
 * ── Une seule unité de charge ────────────────────────────────────────────
 *
 * La charge du plan est en TSS ; celle du journal était en session-RPE
 * (durée fois effort perçu), une unité arbitraire qui ne se compare qu'à
 * elle-même. Côte à côte, `114 / 186` et `+270 charge` laissaient croire que
 * trois vélotafs pesaient plus que la semaine. Le hors plan est donc converti
 * ici en TSS, par le chemin qu'emprunte déjà une activité posée dans une
 * semaine : son effort perçu (saisi, ou déduit du motif) donne une zone
 * (`zoneFromRpe`), la zone donne le TSS (`runTssFromZone`).
 *
 * ── Sans plan ────────────────────────────────────────────────────────────
 *
 * Sans séance du plan dans la semaine, la référence d'un anneau devient la
 * moyenne du FAIT des quatre semaines calendaires précédentes
 * (`reference: "average"`) : un repère, pas un objectif, donc ni coche ni
 * alerte. Sans historique non plus, `null`, on ne dessine pas d'anneaux vides.
 */

/**
 * La première zone de la Qualité : Z3, la frontière du 80/20 (le tempo
 * compte du côté dur, comme dans `PolarizationGauge`).
 */
export const QUALITY_FROM_ZONE = 3;

export type { RingMetric };

/** Une quantité dans les trois mesures : minutes, kilomètres, mètres de D+. */
export interface Measure {
  time: number;
  km: number;
  dplus: number;
}

export type RingReference = "plan" | "average";

export interface ZoneRingData {
  kind: "endurance" | "quality";
  done: Measure;
  /** Le prévu, ou la moyenne des quatre semaines précédentes. */
  target: Measure;
}

export interface StrengthRingData {
  kind: "strength";
  doneSessions: number;
  targetSessions: number;
  doneMinutes: number;
  targetMinutes: number;
}

export type RingData = ZoneRingData | StrengthRingData;

/** Ce qu'un anneau dessine, dérivé de ses chiffres et de la mesure choisie. */
export interface RingState {
  done: number;
  target: number;
  /** Fait sur prévu, `0` sans prévu. */
  ratio: number;
  /** La progression dessinée, plafonnée à 1. */
  progress: number;
  /** L'excédent sur l'orbite extérieure, entre 0 et 1. Toujours 0 sur une moyenne. */
  excess: number;
  /** La coche. Jamais pour Qualité : dépasser l'intensité n'est pas un succès. */
  complete: boolean;
  /** Le triangle. Seulement pour Qualité, quand elle déborde. */
  warn: boolean;
}

export interface OffPlanSummary {
  count: number;
  minutes: number;
  /** Les km, seulement quand toutes les activités sont du même sport. */
  km: number | null;
  /** La charge en TSS, la même unité que celle du plan. */
  load: number;
  /** Le motif partagé par toutes les activités, la clé de `activity:purpose.*`. */
  purposeKey: ReturnType<typeof purposeLabelKey> | null;
}

export interface WeekRingsModel {
  range: DateRange;
  /** 0 = lundi, l'index du jour de référence dans la semaine. */
  dayIndex: number;
  reference: RingReference;
  endurance: ZoneRingData;
  quality: ZoneRingData;
  strength: StrengthRingData;
  /** En temps, Endurance + Qualité + Renfo ; en km et en D+, la course seule. */
  total: { done: Measure; target: Measure };
  /** La charge des séances du plan, en TSS. Sur une moyenne, `planned` est la moyenne. */
  load: { done: number; planned: number };
  offPlan: OffPlanSummary | null;
  /** Les mesures proposées : D+ absent quand la semaine n'en porte pas. */
  metrics: RingMetric[];
  defaultMetric: RingMetric;
}

// ── Le tri d'une séance ─────────────────────────────────────────────

const zeroMeasure = (): Measure => ({ time: 0, km: 0, dplus: 0 });

function addMeasure(into: Measure, m: Measure, share = 1): void {
  into.time += m.time * share;
  into.km += m.km * share;
  into.dplus += m.dplus * share;
}

interface Tally {
  endurance: Measure;
  quality: Measure;
  strengthSessions: number;
  strengthMinutes: number;
  load: number;
}

const emptyTally = (): Tally => ({
  endurance: zeroMeasure(),
  quality: zeroMeasure(),
  strengthSessions: 0,
  strengthMinutes: 0,
  load: 0,
});

function isDone(session: PlanSession): boolean {
  return session.status === "completed" || session.status === "modified";
}

function isStrengthSession(session: PlanSession, workout: AnyWorkoutTemplate | undefined): boolean {
  if (workout) return isStrengthWorkout(workout);
  return session.sessionType === "strength" || session.workoutId.startsWith("STR-");
}

function hasBlocks(workout: WorkoutTemplate): boolean {
  return (
    Array.isArray(workout.warmupTemplate) &&
    Array.isArray(workout.mainSetTemplate) &&
    Array.isArray(workout.cooldownTemplate)
  );
}

/**
 * La durée qui COMPTE au prévu : le milieu de la fourchette d'une séance
 * souple, la durée posée d'une séance fixée. Les fonctions sont celles de
 * `sessionPrecision`, la règle n'est pas réécrite.
 */
export function plannedMinutesOf(
  session: PlanSession,
  workout: AnyWorkoutTemplate | undefined,
): number {
  if (workout && isLooseSession(session)) {
    const range = catalogRange(workout);
    if (range) return rangeMidpoint(range);
  }
  return Math.max(0, session.estimatedDurationMin ?? 0);
}

/**
 * Les minutes d'une séance de course, Endurance d'un côté, Qualité de
 * l'autre, BLOC PAR BLOC (`addSessionZoneMinutes`), ramenées à `minutes`.
 * C'est la règle des anneaux, et la barre d'intensité de la page de séance
 * la lit aussi : les deux écrans classent la même minute de la même façon.
 */
export function enduranceQualityMinutes(
  workout: WorkoutTemplate,
  minutes: number,
): { endurance: number; quality: number } {
  const zones: Record<string, number> = {};
  addSessionZoneMinutes(workout, minutes, zones);
  let endurance = 0;
  let quality = 0;
  for (const [code, value] of Object.entries(zones)) {
    if (getZoneNumber(code) >= QUALITY_FROM_ZONE) quality += value;
    else endurance += value;
  }
  return { endurance, quality };
}

/**
 * La part de Qualité d'une séance de course, entre 0 et 1, bloc par bloc.
 * Un gabarit sans blocs prend sa zone dominante, un gabarit absent compte
 * en Endurance.
 */
export function qualityShareOf(
  session: PlanSession,
  workout: AnyWorkoutTemplate | undefined,
  minutes: number,
): number {
  // Une course intermédiaire se court à l'allure de course : c'est de la qualité.
  if (session.workoutId === "__intermediate_race__") return 1;
  if (!workout || !isRunningWorkout(workout)) return 0;
  if (hasBlocks(workout)) {
    const split = enduranceQualityMinutes(workout, minutes > 0 ? minutes : 60);
    const total = split.endurance + split.quality;
    if (total > 0) return split.quality / total;
  }
  return getPeakZone(workout) >= QUALITY_FROM_ZONE ? 1 : 0;
}

function tallySessions(
  sessions: readonly PlanSession[],
  workoutOf: (id: string) => AnyWorkoutTemplate | undefined,
): { planned: Tally; done: Tally; countable: number } {
  const planned = emptyTally();
  const done = emptyTally();
  let countable = 0;

  for (const session of sessions) {
    if (session.workoutId === "__race_day__") continue;
    countable += 1;
    const workout = workoutOf(session.workoutId);
    const finished = isDone(session);
    const plannedMin = plannedMinutesOf(session, workout);
    const doneMin =
      session.actualDurationMin && session.actualDurationMin > 0
        ? session.actualDurationMin
        : plannedMin;

    // La charge, en TSS : toutes les séances du plan, anneaux ou non.
    if (isActivitySession(session.workoutId)) {
      planned.load += activitySessionTss({ ...session, estimatedDurationMin: plannedMin });
      if (finished) done.load += activitySessionTss({ ...session, estimatedDurationMin: doneMin });
    } else if (workout) {
      planned.load += sessionTssFor(workout, plannedMin) ?? 0;
      if (finished) done.load += sessionTssFor(workout, doneMin) ?? 0;
    }

    if (isStrengthSession(session, workout)) {
      planned.strengthSessions += 1;
      planned.strengthMinutes += plannedMin;
      if (finished) {
        done.strengthSessions += 1;
        done.strengthMinutes += doneMin;
      }
      continue;
    }

    if (isActivitySession(session.workoutId) || sessionDiscipline(session) !== "running") continue;

    const share = qualityShareOf(session, workout, plannedMin);
    const plannedKm = plannedSessionKm({ ...session, estimatedDurationMin: plannedMin });
    const dplus = workout && isRunningWorkout(workout) ? computeTotalElevationGain(workout) : 0;
    const p: Measure = { time: plannedMin, km: plannedKm, dplus };
    addMeasure(planned.endurance, p, 1 - share);
    addMeasure(planned.quality, p, share);

    if (finished) {
      const d: Measure = {
        time: doneMin,
        km: session.actualDistanceKm && session.actualDistanceKm > 0 ? session.actualDistanceKm : plannedKm,
        dplus,
      };
      addMeasure(done.endurance, d, 1 - share);
      addMeasure(done.quality, d, share);
    }
  }

  return { planned, done, countable };
}

// ── Le hors plan ─────────────────────────────────────────────────────

/** Le TSS d'une activité du journal : son effort perçu donne une zone, la zone le TSS. */
export function offPlanTss(activity: ComplementaryActivity): number {
  const rpe = activity.rpe ?? defaultRpe(activity.purpose);
  return runTssFromZone(activity.durationMin, zoneFromRpe(rpe));
}

export function summarizeOffPlan(
  activities: readonly ComplementaryActivity[],
): OffPlanSummary | null {
  if (activities.length === 0) return null;
  const summary = summarizeActivities(activities);
  const disciplines = new Set<ActivityDiscipline>(activities.map((a) => a.discipline));
  const purposes = new Set(activities.map((a) => a.purpose));
  // Un seul sport : ses km ont un sens. Plusieurs : aucun total, la règle du dépôt.
  const km =
    disciplines.size === 1
      ? activities.reduce((sum, a) => sum + (a.distanceKm ?? 0), 0)
      : null;
  const [purpose] = purposes;
  const [discipline] = disciplines;
  return {
    count: summary.count,
    minutes: summary.minutes,
    km: km !== null && km > 0 ? Math.round(km * 10) / 10 : null,
    load: Math.round(activities.reduce((sum, a) => sum + offPlanTss(a), 0)),
    purposeKey:
      purposes.size === 1 && purpose
        ? purposeLabelKey(disciplines.size === 1 && discipline ? discipline : "other", purpose)
        : null,
  };
}

// ── Les états dérivés ────────────────────────────────────────────────

export function ringState(ring: RingData, metric: RingMetric, reference: RingReference): RingState {
  const done = ring.kind === "strength" ? ring.doneSessions : ring.done[metric];
  const target = ring.kind === "strength" ? ring.targetSessions : ring.target[metric];
  const ratio = target > 0 ? done / target : 0;
  const excess = reference === "average" ? 0 : Math.min(Math.max(ratio - 1, 0), 1);
  return {
    done,
    target,
    ratio,
    progress: Math.min(ratio, 1),
    excess,
    complete: reference === "plan" && ring.kind !== "quality" && target > 0 && ratio >= 1,
    warn: ring.kind === "quality" && excess > 0,
  };
}

// ── Le modèle ────────────────────────────────────────────────────────

function dayIndexIn(range: DateRange, today: Date): number {
  const monday = new Date(`${range.from}T00:00:00`);
  const day = new Date(today);
  day.setHours(0, 0, 0, 0);
  const index = Math.round((day.getTime() - monday.getTime()) / 86_400_000);
  return Math.min(Math.max(index, 0), 6);
}

function averageOf(tallies: readonly Tally[]): Tally {
  const out = emptyTally();
  const n = tallies.length;
  if (n === 0) return out;
  for (const t of tallies) {
    addMeasure(out.endurance, t.endurance, 1 / n);
    addMeasure(out.quality, t.quality, 1 / n);
    out.strengthSessions += t.strengthSessions / n;
    out.strengthMinutes += t.strengthMinutes / n;
    out.load += t.load / n;
  }
  out.strengthSessions = Math.round(out.strengthSessions);
  return out;
}

function hasVolume(t: Tally): boolean {
  return t.endurance.time + t.quality.time + t.strengthMinutes > 0 || t.strengthSessions > 0;
}

function totalOf(t: Tally): Measure {
  return {
    time: t.endurance.time + t.quality.time + t.strengthMinutes,
    km: t.endurance.km + t.quality.km,
    dplus: t.endurance.dplus + t.quality.dplus,
  };
}

/**
 * Les anneaux d'une semaine, ou `null` quand il n'y a rien à montrer.
 *
 * `sessions` et `activities` arrivent DÉJÀ bornés à `range`, comme pour
 * `buildWeekReview`. `history` porte les séances des quatre semaines
 * calendaires précédentes, une entrée par semaine : il ne sert qu'à la
 * référence sans plan.
 */
export function buildWeekRings(input: {
  sessions: readonly PlanSession[];
  activities: readonly ComplementaryActivity[];
  range: DateRange;
  today: Date;
  workoutOf: (workoutId: string) => AnyWorkoutTemplate | undefined;
  history?: readonly (readonly PlanSession[])[];
  practice?: Practice | null;
}): WeekRingsModel | null {
  const week = tallySessions(input.sessions, input.workoutOf);

  let reference: RingReference;
  let target: Tally;
  if (week.countable > 0) {
    reference = "plan";
    target = week.planned;
    // Un plan qui ne porte que du vélo ou de la natation cette semaine n'a
    // rien à mettre dans des anneaux de course et de renfo.
    if (!hasVolume(target)) return null;
  } else {
    const past = (input.history ?? []).map((sessions) => tallySessions(sessions, input.workoutOf).done);
    if (!past.some(hasVolume)) return null;
    reference = "average";
    target = averageOf(past);
  }

  const done = week.done;
  const endurance: ZoneRingData = { kind: "endurance", done: done.endurance, target: target.endurance };
  const quality: ZoneRingData = { kind: "quality", done: done.quality, target: target.quality };
  const strength: StrengthRingData = {
    kind: "strength",
    doneSessions: done.strengthSessions,
    targetSessions: target.strengthSessions,
    doneMinutes: done.strengthMinutes,
    targetMinutes: target.strengthMinutes,
  };

  const total = { done: totalOf(done), target: totalOf(target) };
  const hasElevation = total.done.dplus > 0 || total.target.dplus > 0;
  const metrics: RingMetric[] = hasElevation ? ["time", "km", "dplus"] : ["time", "km"];
  const mountain = input.practice === "trail" || input.practice === "ultra";

  return {
    range: input.range,
    dayIndex: dayIndexIn(input.range, input.today),
    reference,
    endurance,
    quality,
    strength,
    total,
    load: { done: Math.round(done.load), planned: Math.round(target.load) },
    offPlan: summarizeOffPlan(input.activities),
    metrics,
    defaultMetric: mountain && hasElevation ? "dplus" : "time",
  };
}

/** La mesure affichée : le choix retenu s'il est proposé cette semaine, le défaut sinon. */
export function resolveRingMetric(model: WeekRingsModel, stored: RingMetric | undefined): RingMetric {
  return stored && model.metrics.includes(stored) ? stored : model.defaultMetric;
}
