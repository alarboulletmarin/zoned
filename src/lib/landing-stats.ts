/**
 * Landing-page statistics — everything shown on the home page is
 * derived from the actual content shipped with the app, not hardcoded.
 *
 * Used by HomePage.tsx for the editorial "training journal" layout:
 *   - Fig.01 polarised distribution (Seiler-style) across all sessions
 *   - Discipline counts, school counts, calculator/plan/article totals
 *
 * Designed to be cheap: a single pass over the workouts array.
 */

import type {
  WorkoutTemplate,
  WorkoutBlock,
  WorkoutStep,
  ZoneNumber,
  Discipline,
} from "@/types";
import { getZoneNumber, getWorkoutDiscipline } from "@/types";

/** Coach/school identifiers we surface on the landing. Order matches the
 *  PDF mockup (§04 — quatre écoles). */
export const SCHOOLS = ["seiler", "daniels", "billat", "coggan"] as const;
export type School = (typeof SCHOOLS)[number];

/** Detection patterns for each school. Matched (case-insensitive) against
 *  the workout name, description and coaching tips. A workout can match
 *  several schools — we count it once per school it matches. */
const SCHOOL_PATTERNS: Record<School, RegExp> = {
  seiler: /\b(seiler|polaris|polariz|80\s*\/\s*20)\b/i,
  daniels: /\b(daniels|vdot|t-?pace|tempo pace|easy pace|m-?pace)\b/i,
  billat: /\b(billat|30\s*\/\s*30|vma|vvo2)\b/i,
  coggan: /\b(coggan|ftp|tss|if\b|normalized power)\b/i,
};

/** Native export formats supported by the app — kept here so the éthos
 *  block ("06 Exports locaux") stays in sync with src/lib/export/. */
export const EXPORT_FORMATS = [
  "fit",
  "gpx",
  "ics",
  "pdf",
  "png",
  "json",
] as const;

export interface ZoneDistribution {
  zone: ZoneNumber;
  minutes: number;
  /** Share of total minutes (0–1). */
  share: number;
}

export interface LandingStats {
  totalSessions: number;
  byDiscipline: Record<Discipline, number>;
  bySchool: Record<School, number>;
  /** Total weighted minutes across every workout's main set. */
  totalMinutes: number;
  /** Distribution across the 6 Zoned zones (sorted Z1 → Z6). */
  zones: ZoneDistribution[];
  /** Crude Seiler-style split — "low" = Z1+Z2, "mid" = Z3, "high" = Z4+Z5+Z6.
   *  Used as a one-liner under the chart ("80 % à basse intensité…"). */
  polarised: { low: number; mid: number; high: number };
}

/** Recursively gather (zone, minutes) pairs from a structured step tree.
 *  Falls back to "1 minute" when a segment has no duration so a zone is
 *  still counted (better than dropping it entirely). */
function collectFromSteps(
  steps: WorkoutStep[],
  out: Array<{ zone: ZoneNumber; minutes: number }>,
): void {
  for (const step of steps) {
    if (step.kind === "segment") {
      if (!step.zone) continue;
      const matches = step.zone.match(/[1-6]/g) ?? [];
      if (matches.length === 0) continue;
      const durationMin = step.durationSec ? step.durationSec / 60 : 1;
      const per = durationMin / matches.length;
      for (const m of matches) {
        out.push({ zone: getZoneNumber(`Z${m}`), minutes: per });
      }
      continue;
    }
    // Repeat step — multiply by count and recurse on inner steps + between
    const inner: Array<{ zone: ZoneNumber; minutes: number }> = [];
    collectFromSteps(step.steps, inner);
    if (step.between) collectFromSteps(step.between, inner);
    for (const item of inner) {
      out.push({ zone: item.zone, minutes: item.minutes * step.count });
    }
  }
}

function collectFromBlocks(
  blocks: WorkoutBlock[],
  out: Array<{ zone: ZoneNumber; minutes: number }>,
): void {
  for (const block of blocks) {
    if (!block.zone) continue;
    const reps = block.repetitions ?? 1;
    const sets = block.sets ?? 1;
    const minutes = (block.durationMin ?? 1) * reps * sets;
    out.push({ zone: getZoneNumber(block.zone), minutes });
  }
}

function detectSchools(workout: WorkoutTemplate): School[] {
  const haystack = [
    workout.name,
    workout.nameEn,
    workout.description,
    workout.descriptionEn,
    ...workout.coachingTips,
    ...workout.coachingTipsEn,
  ]
    .filter(Boolean)
    .join(" ");
  return SCHOOLS.filter((s) => SCHOOL_PATTERNS[s].test(haystack));
}

/** Single-pass aggregator. Pure — safe to memoise. */
export function computeLandingStats(
  workouts: WorkoutTemplate[],
): LandingStats {
  const byDiscipline: Record<Discipline, number> = {
    running: 0,
    cycling: 0,
    swimming: 0,
  };
  const bySchool: Record<School, number> = {
    seiler: 0,
    daniels: 0,
    billat: 0,
    coggan: 0,
  };
  const zoneMinutes: Record<ZoneNumber, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  const buffer: Array<{ zone: ZoneNumber; minutes: number }> = [];

  for (const w of workouts) {
    byDiscipline[getWorkoutDiscipline(w)]++;
    for (const s of detectSchools(w)) bySchool[s]++;

    buffer.length = 0;
    if (w.mainSetStructure?.length) {
      collectFromSteps(w.mainSetStructure, buffer);
    } else {
      collectFromBlocks(w.mainSetTemplate, buffer);
    }
    for (const item of buffer) zoneMinutes[item.zone] += item.minutes;
  }

  const totalMinutes =
    zoneMinutes[1] +
    zoneMinutes[2] +
    zoneMinutes[3] +
    zoneMinutes[4] +
    zoneMinutes[5] +
    zoneMinutes[6];

  const zones: ZoneDistribution[] = ([1, 2, 3, 4, 5, 6] as const).map((z) => ({
    zone: z,
    minutes: zoneMinutes[z],
    share: totalMinutes > 0 ? zoneMinutes[z] / totalMinutes : 0,
  }));

  const low = zones[0].share + zones[1].share;
  const mid = zones[2].share;
  const high = zones[3].share + zones[4].share + zones[5].share;

  return {
    totalSessions: workouts.length,
    byDiscipline,
    bySchool,
    totalMinutes,
    zones,
    polarised: { low, mid, high },
  };
}

/** ISO week number — used by deriveWeekIndex to pick a deterministic slot
 *  for the "session of the week" and the "three suggested" workouts. */
export function getISOWeek(d: Date = new Date()): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

/** Pick N workouts deterministically for the current ISO week, optionally
 *  filtering by discipline. Sorted by id so the order is stable across
 *  reloads, then sliced from a week-dependent offset. */
export function pickWeeklyWorkouts(
  workouts: WorkoutTemplate[],
  filter: (w: WorkoutTemplate) => boolean,
  count: number,
  weekOffset = 0,
): WorkoutTemplate[] {
  const pool = workouts.filter(filter).sort((a, b) => a.id.localeCompare(b.id));
  if (pool.length === 0) return [];
  const week = getISOWeek() + weekOffset;
  const out: WorkoutTemplate[] = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    out.push(pool[(week * 7 + i * 13) % pool.length]);
  }
  return out;
}

/** Estimate TSS for a workout — rough but consistent across the library.
 *  Uses Coggan-style IF² × duration_h × 100, with a zone→IF mapping. */
const ZONE_IF: Record<ZoneNumber, number> = {
  1: 0.55,
  2: 0.72,
  3: 0.85,
  4: 0.95,
  5: 1.05,
  6: 1.15,
};

export function estimateTSS(workout: WorkoutTemplate): number {
  const buffer: Array<{ zone: ZoneNumber; minutes: number }> = [];
  if (workout.warmupTemplate?.length) collectFromBlocks(workout.warmupTemplate, buffer);
  if (workout.mainSetStructure?.length) {
    collectFromSteps(workout.mainSetStructure, buffer);
  } else {
    collectFromBlocks(workout.mainSetTemplate, buffer);
  }
  if (workout.cooldownTemplate?.length) collectFromBlocks(workout.cooldownTemplate, buffer);

  let weightedHours = 0;
  for (const seg of buffer) {
    const ifVal = ZONE_IF[seg.zone];
    weightedHours += (seg.minutes / 60) * ifVal * ifVal;
  }
  return Math.round(weightedHours * 100);
}

/** Distinct zones touched by a workout's main set, sorted ascending. */
export function getWorkoutZones(workout: WorkoutTemplate): ZoneNumber[] {
  const set = new Set<ZoneNumber>();
  const buffer: Array<{ zone: ZoneNumber; minutes: number }> = [];
  if (workout.mainSetStructure?.length) {
    collectFromSteps(workout.mainSetStructure, buffer);
  } else {
    collectFromBlocks(workout.mainSetTemplate, buffer);
  }
  for (const seg of buffer) set.add(seg.zone);
  return [...set].sort((a, b) => a - b);
}
