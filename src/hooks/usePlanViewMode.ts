import { useState, useEffect, useCallback } from "react";

export type PlanViewMode = "calendar" | "weekly" | "monthly" | "list";

const STORAGE_KEY = "zoned-planViewMode";
const DEFAULT_MODE: PlanViewMode = "calendar";
const VALID_MODES: PlanViewMode[] = ["calendar", "weekly", "monthly", "list"];

export function usePlanViewMode() {
  const [planViewMode, setPlanViewModeState] = useState<PlanViewMode>(() => {
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, planViewMode);
    } catch {
      // localStorage not available
    }
  }, [planViewMode]);

  const setPlanViewMode = useCallback((mode: PlanViewMode) => {
    if (VALID_MODES.includes(mode)) {
      setPlanViewModeState(mode);
    }
  }, []);

  return { planViewMode, setPlanViewMode };
}
