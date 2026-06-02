/**
 * Polarised week generator for the "Ma semaine" planner (Epic #83).
 *
 * Composes a realistic 80/20 training week from the workout catalog:
 *   - exactly one quality (hard) session, driven by the preferred intensity,
 *   - one long session on Saturday,
 *   - the remaining days easy, with rest days spread out and Sunday off.
 *
 * It generates a batch of variants and keeps the one whose real time-in-zone
 * best matches the 80/20 split and whose volume best matches the hour budget.
 * Locked slots are always preserved across (re)generation.
 */

import {
  DURATION_NO_LIMIT,
  getAnyWorkoutDuration,
  matchesFilters,
  type WorkoutFilterCriteria,
} from "@/lib/workoutFilters";
import { computeWeekStats } from "@/lib/weekStats";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type {
  DayIndex,
  GeneratedWeek,
  QualityType,
  SessionCount,
  SlotKind,
  WeekSettings,
  WeekSlot,
} from "@/types/week";

/** Number of candidate weeks generated; the best-scoring one is kept. */
const VARIANTS = 50;

/** A session of at least this many minutes at easy intensity is a "long" run. */
const LONG_MIN_DURATION = 70;

/** Target share of easy (Z1+Z2) time — the 80 in 80/20. */
export const POLAR_TARGET_LOW = 0.8;

/** Saturday is index 5 (Mon = 0). */
const SATURDAY: DayIndex = 5;

/** Placement template per session count: one SlotKind per weekday (Mon→Sun).
 *  Exactly one quality session, one long on Saturday, the rest easy, with rest
 *  days spread out and Sunday always off. */
const TEMPLATES: Record<SessionCount, SlotKind[]> = {
  3: ["rest", "quality", "rest", "easy", "rest", "long", "rest"],
  4: ["easy", "quality", "rest", "easy", "rest", "long", "rest"],
  5: ["easy", "quality", "rest", "easy", "easy", "long", "rest"],
  6: ["easy", "quality", "easy", "easy", "easy", "long", "rest"],
};

/** Pick a uniformly random element. */
function sample<T>(arr: readonly T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Highest zone reached — strength has none, treated as 0. */
function topZone(w: AnyWorkoutTemplate): number {
  if (isStrengthWorkout(w)) return 0;
  return getDominantZone(w);
}

/** Does this workout's top intensity match the requested quality type? */
function matchesQuality(w: AnyWorkoutTemplate, quality: QualityType): boolean {
  const z = topZone(w);
  switch (quality) {
    case "tempo":
      return z === 3;
    case "threshold":
      return z === 4;
    case "vo2vma":
      return z >= 5;
    case "random":
    default:
      return z >= 3;
  }
}

interface Pools {
  easy: AnyWorkoutTemplate[];
  quality: AnyWorkoutTemplate[];
  long: AnyWorkoutTemplate[];
}

/** Split the filtered catalog into easy / quality / long candidate pools. */
function buildPools(
  catalog: AnyWorkoutTemplate[],
  settings: WeekSettings,
): Pools {
  const criteria: WorkoutFilterCriteria = {
    disciplines: settings.disciplines,
    levels: settings.levels,
    zones: [],
    maxDuration: DURATION_NO_LIMIT,
  };
  const pool = catalog.filter((w) => matchesFilters(w, criteria));

  const easy: AnyWorkoutTemplate[] = [];
  const quality: AnyWorkoutTemplate[] = [];
  const long: AnyWorkoutTemplate[] = [];

  for (const w of pool) {
    const z = topZone(w);
    const duration = getAnyWorkoutDuration(w);
    const isEndurance = !isStrengthWorkout(w);

    if (isEndurance && z <= 2 && duration >= LONG_MIN_DURATION) {
      long.push(w);
    }
    if (z <= 2) {
      // Easy-intensity (incl. strength, which has no aerobic zone).
      easy.push(w);
    }
    if (matchesQuality(w, settings.quality)) {
      quality.push(w);
    }
  }

  // Fallbacks so a week can always be filled even with a thin catalog.
  if (long.length === 0) {
    const endurance = pool
      .filter((w) => !isStrengthWorkout(w) && topZone(w) <= 2)
      .sort((a, b) => getAnyWorkoutDuration(b) - getAnyWorkoutDuration(a));
    if (endurance.length > 0) long.push(...endurance.slice(0, 5));
    else long.push(...easy);
  }
  if (quality.length === 0) {
    // Loosen to any session touching Z3+ when the exact intensity is missing.
    quality.push(...pool.filter((w) => topZone(w) >= 3));
  }

  return { easy, quality, long };
}

function poolFor(kind: SlotKind, pools: Pools): AnyWorkoutTemplate[] {
  switch (kind) {
    case "easy":
      return pools.easy;
    case "quality":
      return pools.quality;
    case "long":
      return pools.long;
    case "rest":
    default:
      return [];
  }
}

/** Score a candidate week — lower is better. */
function scoreWeek(slots: WeekSlot[], settings: WeekSettings): number {
  const stats = computeWeekStats(slots);

  // 1. Polarisation: distance of the easy share from 80 %.
  const polar =
    stats.polarised.zonedMinutes > 0
      ? Math.abs(stats.polarised.lowShare - POLAR_TARGET_LOW)
      : 1; // no zoned time at all → maximally off

  // 2. Volume: relative distance from the hour budget.
  const target = Math.max(settings.targetVolumeH, 0.1);
  const volume = Math.abs(stats.totalHours - target) / target;

  // 3. Adjacent hard days (defensive — templates use a single quality day).
  let adjHard = 0;
  for (let i = 0; i < slots.length - 1; i++) {
    const a = slots[i].workout;
    const b = slots[i + 1].workout;
    if (a && b && topZone(a) >= 4 && topZone(b) >= 4) adjHard++;
  }

  // 4. Duplicate workouts within the week.
  const ids = slots.map((s) => s.workout?.id).filter(Boolean) as string[];
  const dup = ids.length - new Set(ids).size;

  // 5. Unfilled active slots (a pool ran dry).
  const unfilled = slots.filter(
    (s) => s.kind !== "rest" && !s.workout,
  ).length;

  return 3 * polar + 1 * volume + 2 * adjHard + 1 * dup + 5 * unfilled;
}

export interface GenerateOptions {
  /** Slots to preserve verbatim (their workout and locked flag are kept). */
  locked?: WeekSlot[];
}

/** Build one candidate week from the template, honouring locked slots. */
function buildVariant(
  settings: WeekSettings,
  pools: Pools,
  lockedByDay: Map<DayIndex, WeekSlot>,
): WeekSlot[] {
  const template = TEMPLATES[settings.sessions];
  const used = new Set<string>();
  const slots: WeekSlot[] = [];

  for (let day = 0 as DayIndex; day <= 6; day = (day + 1) as DayIndex) {
    const locked = lockedByDay.get(day);
    if (locked) {
      if (locked.workout) used.add(locked.workout.id);
      slots.push({ ...locked });
      continue;
    }

    const kind = template[day];
    if (kind === "rest") {
      slots.push({ day, kind, workout: null, locked: false });
      continue;
    }

    const candidates = poolFor(kind, pools).filter((w) => !used.has(w.id));
    // Fall back to the full pool (allowing a repeat) rather than leave it empty.
    const picked =
      sample(candidates) ?? sample(poolFor(kind, pools)) ?? null;
    if (picked) used.add(picked.id);
    slots.push({ day, kind, workout: picked, locked: false });
  }

  return slots;
}

/**
 * Generate a polarised week. Runs VARIANTS candidates and keeps the best.
 * Locked slots (from `options.locked`) are preserved on every variant.
 */
export function generateWeek(
  settings: WeekSettings,
  catalog: AnyWorkoutTemplate[],
  options: GenerateOptions = {},
): GeneratedWeek {
  const pools = buildPools(catalog, settings);
  const lockedByDay = new Map<DayIndex, WeekSlot>();
  for (const slot of options.locked ?? []) {
    if (slot.locked) lockedByDay.set(slot.day, slot);
  }

  let best: WeekSlot[] | null = null;
  let bestScore = Infinity;
  for (let i = 0; i < VARIANTS; i++) {
    const variant = buildVariant(settings, pools, lockedByDay);
    const score = scoreWeek(variant, settings);
    if (score < bestScore) {
      bestScore = score;
      best = variant;
    }
  }

  return { slots: best ?? buildVariant(settings, pools, lockedByDay), settings };
}

/** Regenerate every unlocked slot, preserving the locked ones. */
export function regenerateUnlocked(
  week: GeneratedWeek,
  catalog: AnyWorkoutTemplate[],
): GeneratedWeek {
  return generateWeek(week.settings, catalog, { locked: week.slots });
}

/** Re-roll a single day, keeping every other slot exactly as-is. */
export function rerollSlot(
  week: GeneratedWeek,
  day: DayIndex,
  catalog: AnyWorkoutTemplate[],
): GeneratedWeek {
  const pools = buildPools(catalog, week.settings);
  const target = week.slots.find((s) => s.day === day);
  if (!target || target.kind === "rest") return week;

  const usedElsewhere = new Set(
    week.slots
      .filter((s) => s.day !== day && s.workout)
      .map((s) => s.workout!.id),
  );
  const candidates = poolFor(target.kind, pools).filter(
    (w) => !usedElsewhere.has(w.id) && w.id !== target.workout?.id,
  );
  const picked =
    sample(candidates) ??
    sample(poolFor(target.kind, pools)) ??
    target.workout;

  const slots = week.slots.map((s) =>
    s.day === day ? { ...s, workout: picked } : s,
  );
  return { ...week, slots };
}

/** Convenience helper used by Saturday-aware UI copy. */
export function isLongDay(day: DayIndex): boolean {
  return day === SATURDAY;
}
