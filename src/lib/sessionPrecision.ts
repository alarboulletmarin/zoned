/**
 * Souple ou fixée : comment une séance de la semaine COMPTE.
 *
 * Une semaine type n'est pas une semaine actée. Dans la première, un footing
 * est un footing, comme on le sent, 25 à 35 minutes selon les jambes ;
 * dans la seconde, la séance de mardi a duré 32 minutes sur 6,4 km, et c'est
 * ce chiffre-là qu'on partage. Le modèle figeait tout : chaque séance posée
 * gelait une durée, même celles que personne n'avait décidées. Deux
 * semaines à la forme différente portaient le même chiffre faux.
 *
 * Chaque séance porte donc une PRÉCISION :
 *
 * - `loose`, souple : la séance garde la fourchette de son gabarit
 *   (`typicalDuration`) et la semaine la compte AU MILIEU de cette
 *   fourchette. Les kilomètres sont une estimation à l'allure de la séance,
 *   jamais une donnée.
 * - `fixed`, fixée : la durée et les kilomètres posés sont ceux qui
 *   comptent. C'est la forme d'une semaine actée, ou d'une semaine partagée
 *   avec quelqu'un qui doit la suivre.
 *
 * Absente, la précision vaut `fixed` : c'est ce que chaque séance déjà
 * enregistrée était, sans le dire. Rien ne change pour elles.
 *
 * Le défaut à la pose suit ce qu'on décide vraiment : une séance de qualité
 * (Z4 et plus) se prévoit au chrono, elle naît fixée ; un footing ou une
 * sortie longue se court à la sensation, il naît souple. Le renforcement n'a
 * pas de fourchette qui ait un sens, il reste fixé.
 */

import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { PlanSession, SessionPrecision } from "@/types/plan";
import { getAnyWorkoutDuration, getAnyWorkoutTss } from "@/lib/workoutFilters";
import { plannedSessionKm, sessionDiscipline } from "@/lib/planStats";

export interface DurationRange {
  min: number;
  max: number;
}

export function sessionPrecision(session: PlanSession): SessionPrecision {
  return session.precision ?? "fixed";
}

export function isLooseSession(session: PlanSession): boolean {
  return sessionPrecision(session) === "loose";
}

/** La fourchette du gabarit, `null` quand il n'en a pas de lisible. */
export function catalogRange(workout: AnyWorkoutTemplate): DurationRange | null {
  const range = workout.typicalDuration;
  if (!range) return null;
  const min = Math.round(range.min);
  const max = Math.round(range.max);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= 0) return null;
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

export function rangeMidpoint(range: DurationRange): number {
  return Math.round((range.min + range.max) / 2);
}

/** Souple n'a de sens qu'avec une fourchette derrière, et pas pour le renfo. */
export function canBeLoose(workout: AnyWorkoutTemplate): boolean {
  if (isStrengthWorkout(workout)) return false;
  const range = catalogRange(workout);
  return range !== null && range.max > range.min;
}

/** Le défaut à la pose : la qualité au chrono, le reste à la sensation. */
export function defaultPrecisionFor(workout: AnyWorkoutTemplate): SessionPrecision {
  if (isStrengthWorkout(workout) || !canBeLoose(workout)) return "fixed";
  return getDominantZone(workout) >= 4 ? "fixed" : "loose";
}

/**
 * La durée avec laquelle une séance se pose : le milieu de sa fourchette
 * quand elle est souple, sa durée structurée sinon.
 */
export function initialDurationFor(
  workout: AnyWorkoutTemplate,
  precision: SessionPrecision,
): number {
  if (precision === "loose") {
    const range = catalogRange(workout);
    if (range) return rangeMidpoint(range);
  }
  return getAnyWorkoutDuration(workout);
}

/**
 * Rendue souple : la fourchette reprend la main, la semaine compte le milieu,
 * et les kilomètres posés partent, puisqu'ils redeviennent une estimation.
 */
export function looseSession(session: PlanSession, workout: AnyWorkoutTemplate): PlanSession {
  const range = catalogRange(workout);
  const next: PlanSession = {
    ...session,
    precision: "loose",
    estimatedDurationMin: range ? rangeMidpoint(range) : session.estimatedDurationMin,
  };
  delete next.targetDistanceKm;
  return next;
}

/** Rendue fixée : la durée posée compte, et les kilomètres s'ils sont là. */
export function fixedSession(
  session: PlanSession,
  durationMin: number,
  distanceKm?: number,
): PlanSession {
  const next: PlanSession = {
    ...session,
    precision: "fixed",
    estimatedDurationMin: Math.max(0, Math.round(durationMin)),
  };
  if (distanceKm !== undefined && Number.isFinite(distanceKm) && distanceKm > 0) {
    next.targetDistanceKm = Math.round(distanceKm * 10) / 10;
  } else {
    delete next.targetDistanceKm;
  }
  return next;
}

/**
 * Les kilomètres qu'une séance souple vaut à peu près, ou `null` quand on ne
 * sait pas les estimer : la table d'allures du dépôt est une table de COURSE,
 * l'appliquer au vélo inventerait un chiffre.
 */
export function looseKmEstimate(session: PlanSession): number | null {
  if (sessionDiscipline(session) !== "running") return null;
  const km = plannedSessionKm({ ...session, targetDistanceKm: undefined });
  if (!Number.isFinite(km) || km <= 0) return null;
  return Math.round(km * 2) / 2;
}

/**
 * La charge d'une séance du catalogue posée avec SA durée : le TSS du
 * gabarit, mis à l'échelle de la durée. Une séance fixée à 32 min ne pèse
 * pas ce que son gabarit de 45 pèse.
 */
export function sessionTssFor(workout: AnyWorkoutTemplate, durationMin: number): number | null {
  const base = getAnyWorkoutTss(workout);
  if (base === null) return null;
  const templateMin = getAnyWorkoutDuration(workout);
  if (templateMin <= 0 || durationMin <= 0) return base;
  return Math.round(base * (durationMin / templateMin));
}
