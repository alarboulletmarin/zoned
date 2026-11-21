import type { PlanSession } from "@/types/plan";
import type { SessionRef } from "@/lib/cockpit";

/**
 * Le rail des séances du jour : ce qu'il choisit, ce qu'il mesure, et ce qui
 * vient de changer. Tout ce qui s'y décide sans DOM vit ici, pour être testé.
 */

type Status = PlanSession["status"];

/** Close, d'une façon ou d'une autre : faite, modifiée ou sautée. */
export function isResolved(status: Status): boolean {
  return status === "completed" || status === "modified" || status === "skipped";
}

/** Courue : faite ou modifiée. Une séance sautée est close sans être faite. */
export function isDone(status: Status): boolean {
  return status === "completed" || status === "modified";
}

/** Le passage qui mérite le tampon : d'ouverte à courue. */
export function becameDone(prev: Status, next: Status): boolean {
  return !isResolved(prev) && isDone(next);
}

/**
 * La séance montrée en arrivant sur un jour : la première qui reste à faire,
 * sinon la dernière, celle qui a fermé la journée.
 */
export function defaultSessionRank(statuses: readonly Status[]): number {
  const open = statuses.findIndex((status) => !isResolved(status));
  return open >= 0 ? open : Math.max(0, statuses.length - 1);
}

/**
 * Le poids de chaque onglet, proportionnel à la durée estimée. Une séance
 * sans durée pèse comme la plus courte du jour, pas zéro : elle reste un
 * onglet. Le plancher en pixels (44 px, une cible au doigt) est posé par le
 * CSS, pas ici, parce qu'il dépend de la largeur du rail.
 */
export function railWeights(minutes: readonly (number | undefined)[]): number[] {
  const known = minutes.filter((m): m is number => m != null && m > 0);
  const floor = known.length > 0 ? Math.min(...known) : 1;
  return minutes.map((m) => (m != null && m > 0 ? m : floor));
}

/** L'adresse d'une séance, celle que le cockpit emploie déjà pour ses clés. */
export function sessionKey(ref: SessionRef): string {
  return `${ref.planId}:${ref.weekNumber}:${ref.index}`;
}

export interface Closure {
  key: string;
  /** Faite ou modifiée : c'est elle qui porte le tampon. */
  done: boolean;
}

/**
 * Ce qui vient de se clore, entre deux lectures des mêmes séances.
 *
 * Seul le passage d'un statut ouvert à un statut clos compte. Une séance
 * absente de la lecture d'avant (premier rendu, autre jour, plans qui
 * arrivent de localStorage) n'a pas de passé : elle ne déclenche rien. Une
 * séance déjà close qui change de statut est une réouverture : rien non plus.
 */
export function closuresBetween(
  before: ReadonlyMap<string, Status>,
  after: Iterable<readonly [string, Status]>,
): Closure[] {
  const closures: Closure[] = [];
  for (const [key, status] of after) {
    if (!before.has(key)) continue;
    if (isResolved(before.get(key)) || !isResolved(status)) continue;
    closures.push({ key, done: isDone(status) });
  }
  return closures;
}

/**
 * Où va la sélection après la clôture de la séance `closed` : la prochaine
 * qui reste à faire après elle, sinon la première avant elle, sinon nulle
 * part, la journée est bouclée.
 */
export function advanceTarget(statuses: readonly Status[], closed: number): number | null {
  for (let step = 1; step < statuses.length; step++) {
    const rank = (closed + step) % statuses.length;
    if (!isResolved(statuses[rank])) return rank;
  }
  return null;
}
