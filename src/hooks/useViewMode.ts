import { useState, useEffect, useCallback } from "react";

export type ViewMode = "grid" | "list" | "compact";

const STORAGE_KEY = "zoned-viewMode";
// Un "focus" mémorisé ne passe plus le test et retombe sur le mode par
// défaut : la migration ne coûte pas une ligne de plus.
const VALID_MODES: ViewMode[] = ["grid", "list", "compact"];

function getDefaultViewMode(): ViewMode {
  // sm breakpoint = 640px
  return window.matchMedia("(min-width: 640px)").matches ? "grid" : "compact";
}

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
    return getDefaultViewMode();
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
