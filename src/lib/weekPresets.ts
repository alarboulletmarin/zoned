/**
 * Pre-built "template weeks" for "Ma semaine" (Epic #83).
 *
 * Each preset seeds the generator's WeekSettings in one click; the generator
 * then composes a concrete polarised week from it. Five presets cover the
 * common training intents without overwhelming the user.
 */

import type { WeekSettings } from "@/types/week";

export type WeekPresetId =
  | "recovery"
  | "base"
  | "build"
  | "volume"
  | "sharpening";

export interface WeekPreset {
  id: WeekPresetId;
  settings: WeekSettings;
}

export const WEEK_PRESETS: WeekPreset[] = [
  {
    // Light week — few short easy sessions, gentle quality.
    id: "recovery",
    settings: {
      sessions: 3,
      targetVolumeH: 4,
      quality: "tempo",
      disciplines: [],
      levels: [],
      longRunDay: 5,
    },
  },
  {
    // Aerobic base — moderate volume, tempo quality.
    id: "base",
    settings: {
      sessions: 4,
      targetVolumeH: 6,
      quality: "tempo",
      disciplines: [],
      levels: [],
      longRunDay: 5,
    },
  },
  {
    // Build block — more sessions and load, threshold quality.
    id: "build",
    settings: {
      sessions: 5,
      targetVolumeH: 8,
      quality: "threshold",
      disciplines: [],
      levels: [],
      longRunDay: 6,
    },
  },
  {
    // High volume — six sessions, big aerobic load.
    id: "volume",
    settings: {
      sessions: 6,
      targetVolumeH: 10,
      quality: "threshold",
      disciplines: [],
      levels: [],
      longRunDay: 6,
    },
  },
  {
    // Sharpening / taper — lower volume, sharp VO₂·VMA quality.
    id: "sharpening",
    settings: {
      sessions: 4,
      targetVolumeH: 5,
      quality: "vo2vma",
      disciplines: [],
      levels: [],
      longRunDay: 5,
    },
  },
];
