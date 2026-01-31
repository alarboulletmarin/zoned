import { useState, useEffect, useCallback } from "react";

export type ViewMode = "grid" | "list";

const STORAGE_KEY = "zoned-viewMode";
const DEFAULT_VIEW_MODE: ViewMode = "grid";
const VALID_MODES: ViewMode[] = ["grid", "list"];

/**
 * Hook to manage library view mode preference with localStorage persistence
 */
export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_MODES.includes(stored as ViewMode)) {
        return stored as ViewMode;
      }
    } catch {
      // localStorage not available
    }
    return DEFAULT_VIEW_MODE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, viewMode);
    } catch {
      // localStorage not available
    }
  }, [viewMode]);

  const setViewMode = useCallback((mode: ViewMode) => {
    if (VALID_MODES.includes(mode)) {
      setViewModeState(mode);
    }
  }, []);

  return { viewMode, setViewMode };
}
