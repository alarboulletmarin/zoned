/**
 * Shared workout filtering helpers.
 *
 * Extracted from DrawSessionPage so both the "tirage" (draw) page and the
 * "Ma semaine" (weekly planner) generator filter the catalog the same way:
 * a single source of truth for discipline resolution, duration/zone/TSS
 * lookups and the multi-select filter matching used across the app.
 */

import {
  getWorkoutDuration,
} from "@/components/visualization";
import { estimateTSS, getWorkoutZones } from "@/lib/landing-stats";
import type { AnyWorkoutTemplate, Difficulty, ZoneNumber } from "@/types";
import { getWorkoutDiscipline, isStrengthWorkout } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";

/** The four disciplines surfaced in the filters — strength sits alongside the
 *  three endurance sports. */
export const DISCIPLINES = [
  "running",
  "cycling",
  "swimming",
  "strength",
] as const;
export type DrawDiscipline = (typeof DISCIPLINES)[number];

/** Sentinel for "no upper limit" on duration. A finite value so it serialises
 *  cleanly to sessionStorage, unlike Infinity. */
export const DURATION_NO_LIMIT = Number.MAX_SAFE_INTEGER;

/** Resolve the filter-level discipline (strength sits alongside the 3 sports). */
export function getDrawDiscipline(w: AnyWorkoutTemplate): DrawDiscipline {
  if (isStrengthWorkout(w)) return "strength";
  return getWorkoutDiscipline(w) as DrawDiscipline;
}

export function getStrengthDuration(w: StrengthWorkoutTemplate): number {
  return Math.round((w.typicalDuration.min + w.typicalDuration.max) / 2);
}

export function getAnyWorkoutDuration(w: AnyWorkoutTemplate): number {
  if (isStrengthWorkout(w)) return getStrengthDuration(w);
  return getWorkoutDuration(w);
}

/** Zones touched by a workout. Strength sessions have no aerobic zones. */
export function getAnyWorkoutZones(w: AnyWorkoutTemplate): ZoneNumber[] {
  if (isStrengthWorkout(w)) return [];
  return getWorkoutZones(w);
}

export function getAnyWorkoutTss(w: AnyWorkoutTemplate): number | null {
  if (isStrengthWorkout(w)) return null;
  return estimateTSS(w);
}

/** Multi-select filter criteria shared by the draw page and the week generator. */
export interface WorkoutFilterCriteria {
  disciplines: DrawDiscipline[];
  zones: ZoneNumber[];
  maxDuration: number;
  levels: Difficulty[];
}

export const defaultFilterCriteria: WorkoutFilterCriteria = {
  disciplines: [],
  zones: [],
  maxDuration: DURATION_NO_LIMIT, // no cap by default (the "+300" preset)
  levels: [],
};

export function isFilterActive(f: WorkoutFilterCriteria): boolean {
  return (
    f.disciplines.length > 0 ||
    f.zones.length > 0 ||
    f.levels.length > 0 ||
    f.maxDuration !== DURATION_NO_LIMIT
  );
}

export function matchesFilters(
  w: AnyWorkoutTemplate,
  f: WorkoutFilterCriteria,
): boolean {
  // Discipline (multi-select)
  if (
    f.disciplines.length > 0 &&
    !f.disciplines.includes(getDrawDiscipline(w))
  ) {
    return false;
  }
  // Duration ceiling
  if (getAnyWorkoutDuration(w) > f.maxDuration) {
    return false;
  }
  // Level (multi-select)
  if (f.levels.length > 0 && !f.levels.includes(w.difficulty)) {
    return false;
  }
  // Zones (multi-select). Strength has no zones → excluded once a zone is picked.
  if (f.zones.length > 0) {
    const zones = getAnyWorkoutZones(w);
    if (!zones.some((z) => f.zones.includes(z))) return false;
  }
  return true;
}
