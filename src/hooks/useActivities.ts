import { useCallback, useEffect, useMemo, useState } from "react";

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
 * Même forme que `usePlans` : une lecture synchrone de `localStorage` au
 * montage, et un `reload` explicite après chaque écriture. Pas d'écoute de
 * `storage` : l'app est locale, un seul onglet écrit à la fois, et un écouteur
 * ferait rejouer la lecture à chaque changement de thème.
 */
export function useActivities() {
  const [activities, setActivities] = useState<ComplementaryActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setActivities(getAllActivities());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    (draft: ActivityDraft) => {
      const created = addActivity(draft);
      if (created) reload();
      return created;
    },
    [reload],
  );

  const update = useCallback(
    (id: string, draft: ActivityDraft) => {
      const updated = updateActivity(id, draft);
      if (updated) reload();
      return updated;
    },
    [reload],
  );

  const remove = useCallback(
    (id: string) => {
      const ok = deleteActivity(id);
      if (ok) reload();
      return ok;
    },
    [reload],
  );

  return { activities, isLoading, add, update, remove, reload };
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
