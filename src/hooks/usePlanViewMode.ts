import { useState, useEffect, useCallback } from "react";

export type PlanViewMode = "calendar" | "weekly" | "monthly" | "list";

const STORAGE_KEY = "zoned-planViewMode";
const DEFAULT_MODE: PlanViewMode = "calendar";
const VALID_MODES: PlanViewMode[] = ["calendar", "weekly", "monthly", "list"];

const MOBILE_MQ = "(max-width: 767px)";
const DESKTOP_ONLY_MODES: PlanViewMode[] = ["calendar", "monthly"];

function resolveMode(mode: PlanViewMode): PlanViewMode {
  if (typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches && DESKTOP_ONLY_MODES.includes(mode)) {
    return "weekly";
  }
  return mode;
}

export function usePlanViewMode() {
  const [planViewMode, setPlanViewModeState] = useState<PlanViewMode>(() => {
    let mode: PlanViewMode = DEFAULT_MODE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_MODES.includes(stored as PlanViewMode)) {
        mode = stored as PlanViewMode;
      }
    } catch {
      // localStorage not available
    }
    return resolveMode(mode);
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
