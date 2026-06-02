/**
 * Types for the "Ma semaine" (weekly planner) feature — a polarised 80/20
 * training week generated from the workout catalog. See Epic #83.
 */

import type { AnyWorkoutTemplate, Difficulty } from "@/types";
import type { DrawDiscipline } from "@/lib/workoutFilters";

/** 0 = Monday … 6 = Sunday. */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** The role a slot plays in the polarised week. */
export type SlotKind = "easy" | "quality" | "long" | "rest";

/** Preferred quality (intensity) session driving the hard day. */
export type QualityType = "random" | "tempo" | "threshold" | "vo2vma";

/** Allowed session counts for a week. */
export type SessionCount = 3 | 4 | 5 | 6;

/** One day of the generated week. `workout` is null on rest days. */
export interface WeekSlot {
  day: DayIndex;
  kind: SlotKind;
  workout: AnyWorkoutTemplate | null;
  /** User lock — locked slots survive partial regeneration. */
  locked: boolean;
}

/** Settings driving the generator (the left panel). */
export interface WeekSettings {
  sessions: SessionCount;
  /** Target weekly volume in hours (3 → 12). */
  targetVolumeH: number;
  quality: QualityType;
  disciplines: DrawDiscipline[];
  levels: Difficulty[];
  /** Day the long session is placed on (0 = Monday … 6 = Sunday). */
  longRunDay: DayIndex;
  /** Optional per-day kind pins. A pinned day keeps its kind across (re)generation. */
  dayTypes?: Partial<Record<DayIndex, SlotKind>>;
}

/** A fully generated week: exactly 7 slots, Monday → Sunday. */
export interface GeneratedWeek {
  slots: WeekSlot[];
  settings: WeekSettings;
}

export const DEFAULT_WEEK_SETTINGS: WeekSettings = {
  sessions: 4,
  targetVolumeH: 6,
  quality: "random",
  disciplines: [],
  levels: [],
  longRunDay: 5, // Saturday
};
