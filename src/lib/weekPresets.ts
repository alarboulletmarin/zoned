/**
 * Pre-built "template weeks" for "Ma semaine" (Epic #83, issue #94).
 *
 * Each preset is just a WeekSettings starting point the user can load in one
 * click; the generator then composes a concrete polarised week from it. This
 * delivers the "semaines type pré-générées" idea (base / build / affûtage)
 * without hard-coding sessions, so presets stay catalog-driven and bilingual.
 */

import type { WeekSettings } from "@/types/week";

export interface WeekPreset {
  id: "base" | "build" | "sharpening";
  /** i18n key suffix under library.weekly.presets.options.<id>. */
  settings: WeekSettings;
}

export const WEEK_PRESETS: WeekPreset[] = [
  {
    // High aerobic volume, gentle quality — classic base block.
    id: "base",
    settings: {
      sessions: 4,
      targetVolumeH: 6,
      quality: "tempo",
      disciplines: [],
      levels: [],
    },
  },
  {
    // More sessions and load, threshold-focused quality — build block.
    id: "build",
    settings: {
      sessions: 5,
      targetVolumeH: 8,
      quality: "threshold",
      disciplines: [],
      levels: [],
    },
  },
  {
    // Lower volume, sharp VO₂/VMA quality — taper / sharpening block.
    id: "sharpening",
    settings: {
      sessions: 4,
      targetVolumeH: 5,
      quality: "vo2vma",
      disciplines: [],
      levels: [],
    },
  },
];
