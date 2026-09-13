import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "./useIsMobile";

export type PlanViewMode = "calendar" | "weekly" | "monthly" | "list";

const STORAGE_KEY = "zoned-planViewMode";
const DEFAULT_MODE: PlanViewMode = "calendar";
const VALID_MODES: PlanViewMode[] = ["calendar", "weekly", "monthly", "list"];

/* Le tableau du mois et le calendrier complet demandent une grille large et un
   pointeur. Le point de rupture n'est plus écrit ici : useIsMobile le porte
   (768px), et c'est désormais son unique propriétaire, le CSS ne masque plus
   rien de son côté. */
const DESKTOP_ONLY_MODES: PlanViewMode[] = ["calendar", "monthly"];

export function usePlanViewMode() {
  const isMobile = useIsMobile();

  /* Ce que l'utilisateur a demandé, sur l'écran où il l'a demandé. */
  const [preferred, setPreferred] = useState<PlanViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_MODES.includes(stored as PlanViewMode)) {
        return stored as PlanViewMode;
      }
    } catch {
      // localStorage not available
    }
    return DEFAULT_MODE;
  });

  /* Ce que l'écran sait dessiner. Dérivé, jamais stocké : une fenêtre qui se
     rétrécit retombe sur la semaine, et une fenêtre qui s'élargit rend le
     calendrier. L'ancien resolveMode() ne tournait que dans l'initialiseur du
     useState : une tablette passée en portrait restait bloquée sur la grille
     mensuelle, avec un radiogroup dont plus aucun segment n'était coché et
     plus aucun contrôle pour en sortir. */
  const planViewMode: PlanViewMode =
    isMobile && DESKTOP_ONLY_MODES.includes(preferred) ? "weekly" : preferred;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preferred);
    } catch {
      // localStorage not available
    }
  }, [preferred]);

  const setPlanViewMode = useCallback((mode: PlanViewMode) => {
    if (VALID_MODES.includes(mode)) {
      setPreferred(mode);
    }
  }, []);

  return { planViewMode, setPlanViewMode };
}
