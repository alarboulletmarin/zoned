import type { WorkoutCategory, ZoneNumber } from "@/types";
import { tips } from "./data";
import type { Tip, TipCategory } from "./types";

export type { Tip, TipCategory };
export { tips };

/**
 * Get a tip by its ID
 */
export function getTipById(id: string): Tip | undefined {
  return tips.find((tip) => tip.id === id);
}

/**
 * Get tips related to a specific zone
 */
export function getTipsByZone(zone: ZoneNumber): Tip[] {
  return tips.filter((tip) => tip.relatedZones?.includes(zone));
}

/**
 * Get tips related to a specific workout category
 */
export function getTipsByCategory(category: WorkoutCategory): Tip[] {
  return tips.filter((tip) => tip.relatedCategories?.includes(category));
}

/**
 * Get tips by tip category (training, physiology, nutrition, recovery)
 */
export function getTipsByTipCategory(tipCategory: TipCategory): Tip[] {
  return tips.filter((tip) => tip.category === tipCategory);
}

export interface RandomTipFilters {
  zones?: ZoneNumber[];
  categories?: WorkoutCategory[];
  tipCategories?: TipCategory[];
  excludeIds?: string[];
}

/**
 * Get a random tip, optionally filtered
 */
export function getRandomTip(filters?: RandomTipFilters): Tip | null {
  let filteredTips = [...tips];

  if (filters?.excludeIds?.length) {
    filteredTips = filteredTips.filter(
      (tip) => !filters.excludeIds!.includes(tip.id)
    );
  }

  if (filters?.zones?.length) {
    filteredTips = filteredTips.filter((tip) =>
      tip.relatedZones?.some((z) => filters.zones!.includes(z))
    );
  }

  if (filters?.categories?.length) {
    filteredTips = filteredTips.filter((tip) =>
      tip.relatedCategories?.some((c) => filters.categories!.includes(c))
    );
  }

  if (filters?.tipCategories?.length) {
    filteredTips = filteredTips.filter((tip) =>
      filters.tipCategories!.includes(tip.category)
    );
  }

  if (filteredTips.length === 0) {
    // Fallback: return any tip not in excludeIds
    const fallback = tips.filter(
      (tip) => !filters?.excludeIds?.includes(tip.id)
    );
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return filteredTips[Math.floor(Math.random() * filteredTips.length)];
}
