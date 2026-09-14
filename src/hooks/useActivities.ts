import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  activitiesBetween,
  addActivity,
  deleteActivity,
  getAllActivities,
  updateActivity,
} from "@/lib/activityStorage";
import type { ActivityDraft, ComplementaryActivity } from "@/types/activity";

/**
 * Le journal des activités complémentaires, côté écran.
 *
 * ── Une seule copie en mémoire, et c'est nécessaire ──────────────────────
 *
 * Le hameçon tenait son propre `useState` et relisait `localStorage` à chaque
 * montage. Tant qu'un seul composant par écran s'en servait, ça marchait ;
 * dès qu'il y en a deux, ils divergent silencieusement. La page d'un plan en
 * porte deux, le bloc de la semaine en cours qui SAISIT et le bloc de
 * statistiques qui AFFICHE : noter un trajet depuis le premier n'aurait pas
 * bougé le second, et l'écran aurait dit à la fois 1 h 25 et rien du tout.
 *
 * D'où un magasin de module, une seule liste, et `useSyncExternalStore` qui
 * réveille TOUS les abonnés à chaque écriture. C'est la forme que React donne
 * à ce problème, et elle rend en prime impossible le rendu déchiré : deux
 * composants d'un même rendu lisent forcément la même liste.
 *
 * Pas d'écoute de l'événement `storage` pour autant : l'app est locale, un
 * seul onglet écrit à la fois, et un écouteur ferait rejouer la lecture à
 * chaque changement de thème.
 */

/* ── le magasin ──────────────────────────────────────────────────────── */

/**
 * La liste, lue paresseusement et relue à chaque écriture.
 *
 * L'identité du tableau NE CHANGE QUE si une écriture a eu lieu : c'est le
 * contrat de `getSnapshot`, et c'est ce qui permet aux `useMemo` des appelants
 * (le bilan de semaine, les statistiques d'un plan) de ne pas se recalculer à
 * chaque rendu.
 */
let cache: ComplementaryActivity[] | null = null;

const listeners = new Set<() => void>();

/** Le tableau rendu avant toute lecture du stockage, d'identité stable. */
const EMPTY: ComplementaryActivity[] = [];

function getSnapshot(): ComplementaryActivity[] {
  if (cache === null) cache = getAllActivities();
  return cache;
}

/** Pas de `localStorage` au pré-rendu : un journal vide, jamais une exception. */
function getServerSnapshot(): ComplementaryActivity[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Relire le stockage et réveiller tout le monde. Appelé après chaque écriture. */
function refresh(): void {
  cache = getAllActivities();
  for (const listener of listeners) listener();
}

/* ── le hameçon ──────────────────────────────────────────────────────── */

export function useActivities() {
  const activities = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((draft: ActivityDraft) => {
    const created = addActivity(draft);
    if (created) refresh();
    return created;
  }, []);

  const update = useCallback((id: string, draft: ActivityDraft) => {
    const updated = updateActivity(id, draft);
    if (updated) refresh();
    return updated;
  }, []);

  const remove = useCallback((id: string) => {
    const ok = deleteActivity(id);
    if (ok) refresh();
    return ok;
  }, []);

  /* Relire sans écrire. Une restauration de sauvegarde remplace la clé sous
     les pieds de l'app, et c'est le seul cas où le magasin ne peut pas savoir
     tout seul qu'il est périmé. */
  const reload = useCallback(() => refresh(), []);

  return { activities, add, update, remove, reload };
}

/**
 * Les activités d'un intervalle, mémoïsées.
 *
 * Le bilan de semaine et les statistiques d'un plan filtrent tous les deux sur
 * des dates ; sans mémoïsation le tableau change d'identité à chaque rendu et
 * le `useMemo` du bilan derrière ne sert plus à rien.
 */
export function useActivitiesBetween(
  activities: readonly ComplementaryActivity[],
  from: string | null,
  to: string | null,
): ComplementaryActivity[] {
  return useMemo(() => {
    if (!from || !to) return [];
    return activitiesBetween(activities, from, to);
  }, [activities, from, to]);
}
