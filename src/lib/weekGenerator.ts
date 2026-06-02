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

/** Preferred order for filling days: spreads sessions out across the week. */
const FILL_ORDER: DayIndex[] = [1, 3, 0, 4, 2, 6, 5];

/**
 * Build the per-day placement (one SlotKind for Mon→Sun) from the settings:
 * one long session on the chosen day, one quality session kept away from it,
 * the rest easy, honouring any explicit per-day pins. Exactly `sessions`
 * active days; the others rest.
 */
function buildPlacement(settings: WeekSettings): SlotKind[] {
  const placement: SlotKind[] = Array<SlotKind>(7).fill("rest");
  const pinned = settings.dayTypes ?? {};

  // 1. Explicit pins win.
  for (let d = 0 as DayIndex; d <= 6; d = (d + 1) as DayIndex) {
    const p = pinned[d];
    if (p) placement[d] = p;
  }

  // 2. Long session on the chosen day (unless that day is pinned otherwise).
  const longDay = settings.longRunDay;
  if (!pinned[longDay]) placement[longDay] = "long";

  let active = placement.filter((k) => k !== "rest").length;
  const target = settings.sessions;

  // 3. Ensure a quality day, away from the long day, if there's room.
  if (!placement.includes("quality") && active < target) {
    for (const d of FILL_ORDER) {
      if (placement[d] !== "rest" || pinned[d]) continue;
      if (Math.abs(d - longDay) <= 1) continue; // keep hard days off the long
      placement[d] = "quality";
      active++;
      break;
    }
  }

  // 4. Fill the remaining active days with easy sessions.
  for (const d of FILL_ORDER) {
    if (active >= target) break;
    if (placement[d] !== "rest" || pinned[d]) continue;
    placement[d] = "easy";
    active++;
  }

  return placement;
}

/** Per-kind share of the volume budget (long > quality > easy). */
function volumeWeight(kind: SlotKind): number {
  return kind === "long" ? 1.7 : kind === "quality" ? 1.15 : 0.85;
}

/** Pick the workout whose duration is closest to `targetMin`, with a little
 *  randomness among the nearest few so variants stay varied. */
function pickNearDuration(
  pool: AnyWorkoutTemplate[],
  targetMin: number,
): AnyWorkoutTemplate | null {
  if (pool.length === 0) return null;
  const sorted = [...pool].sort(
    (a, b) =>
      Math.abs(getAnyWorkoutDuration(a) - targetMin) -
      Math.abs(getAnyWorkoutDuration(b) - targetMin),
  );
  const k = Math.min(5, sorted.length);
  return sorted[Math.floor(Math.random() * k)];
}

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

/** Build one candidate week, honouring locked slots and the volume budget. */
function buildVariant(
  settings: WeekSettings,
  pools: Pools,
  lockedByDay: Map<DayIndex, WeekSlot>,
): WeekSlot[] {
  const placement = buildPlacement(settings);
  const used = new Set<string>();

  // Account for locked sessions, then share the remaining minutes across the
  // unlocked active days by kind weight, so total volume tracks the budget.
  let lockedMin = 0;
  for (const [, locked] of lockedByDay) {
    if (locked.workout) {
      lockedMin += getAnyWorkoutDuration(locked.workout);
      used.add(locked.workout.id);
    }
  }
  let sumWeights = 0;
  for (let d = 0 as DayIndex; d <= 6; d = (d + 1) as DayIndex) {
    if (lockedByDay.has(d) || placement[d] === "rest") continue;
    sumWeights += volumeWeight(placement[d]);
  }
  sumWeights = sumWeights || 1;
  const remaining = Math.max(0, settings.targetVolumeH * 60 - lockedMin);

  const slots: WeekSlot[] = [];
  for (let day = 0 as DayIndex; day <= 6; day = (day + 1) as DayIndex) {
    const locked = lockedByDay.get(day);
    if (locked) {
      slots.push({ ...locked });
      continue;
    }

    const kind = placement[day];
    if (kind === "rest") {
      slots.push({ day, kind, workout: null, locked: false });
      continue;
    }

    const slotTarget = remaining * (volumeWeight(kind) / sumWeights);
    const fresh = poolFor(kind, pools).filter((w) => !used.has(w.id));
    const picked =
      pickNearDuration(fresh, slotTarget) ??
      pickNearDuration(poolFor(kind, pools), slotTarget);
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
