import { useState, useEffect, useCallback, useMemo } from "react";
import type { Tip, RandomTipFilters } from "@/data/tips";
import { getRandomTip } from "@/data/tips";

const STORAGE_KEY = "zoned-dismissed-tips";

interface UseTipsOptions {
  filters?: RandomTipFilters;
  autoLoad?: boolean;
}

interface UseTipsReturn {
  tip: Tip | null;
  refreshTip: () => void;
  dismissTip: () => void;
  isDismissed: (id: string) => boolean;
}

function getDismissedIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDismissedIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/**
 * Hook to manage tips with localStorage persistence for dismissed tips
 */
export function useTips(options: UseTipsOptions = {}): UseTipsReturn {
  const { filters, autoLoad = true } = options;

  const [dismissedIds, setDismissedIds] = useState<string[]>(getDismissedIds);
  const [tip, setTip] = useState<Tip | null>(null);
  const [loadCounter, setLoadCounter] = useState(0);

  // Stable filter key for dependency
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        zones: filters?.zones,
        categories: filters?.categories,
        tipCategories: filters?.tipCategories,
      }),
    [filters?.zones, filters?.categories, filters?.tipCategories]
  );

  // Load tip when autoLoad is true or filters change
  useEffect(() => {
    if (autoLoad) {
      const currentDismissed = getDismissedIds();
      const newTip = getRandomTip({
        ...filters,
        excludeIds: currentDismissed,
      });
      setTip(newTip);
    }
  }, [autoLoad, filterKey, loadCounter]);

  const refreshTip = useCallback(() => {
    setLoadCounter((c) => c + 1);
  }, []);

  const dismissTip = useCallback(() => {
    if (!tip) return;

    const newIds = [...getDismissedIds(), tip.id];
    saveDismissedIds(newIds);
    setDismissedIds(newIds);
    setTip(null); // Hide immediately
  }, [tip]);

  const isDismissed = useCallback(
    (id: string) => dismissedIds.includes(id),
    [dismissedIds]
  );

  return {
    tip,
    refreshTip,
    dismissTip,
    isDismissed,
  };
}
