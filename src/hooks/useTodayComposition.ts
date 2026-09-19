import { useCallback, useEffect, useRef, useState } from "react";
import type { TrainingPlan } from "@/types/plan";
import {
  loadTodayComposition,
  pruneComposition,
  saveTodayComposition,
  type TodayComposition,
} from "@/lib/todayComposition";

/**
 * La composition du cockpit, lue une fois et réécrite à chaque changement.
 *
 * `ready` dit que la liste des plans est celle du stockage, et non le tableau
 * vide du premier rendu : c'est la condition pour retirer les couches
 * orphelines sans effacer la composition entière pendant le chargement.
 */
export function useTodayComposition(plans: readonly TrainingPlan[], ready: boolean) {
  const [composition, setComposition] = useState<TodayComposition>(() => loadTodayComposition());
  const dirty = useRef(false);

  const update = useCallback((next: TodayComposition) => {
    dirty.current = true;
    setComposition(next);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const pruned = pruneComposition(composition, plans);
    if (pruned !== composition) update(pruned);
  }, [ready, plans, composition, update]);

  useEffect(() => {
    if (!dirty.current) return;
    saveTodayComposition(composition);
  }, [composition]);

  return { composition, update };
}
