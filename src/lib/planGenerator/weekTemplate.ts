import type { SessionType, TrainingPhase } from "@/types";
import type { TrainingGoal, RaceDistance } from "@/types/plan";
import { PHASE_SESSION_TYPES, getKeySessionTypes, getGoalModifiers } from "./constants";

// ── Types ──────────────────────────────────────────────────────────

export type SlotType = "long_run" | "key_quality" | "easy" | "recovery";

export interface WeekSlot {
  dayOfWeek: number; // 0=Mon ... 6=Sun
  slotType: SlotType;
  sessionTypes: SessionType[]; // Preferred types for this slot, in priority order
}

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Distribute N training days across the week, spacing them evenly,
 * ensuring longRunDay is always included.
 *
 * Strategy: place longRunDay first, then spread remaining days
 * as evenly as possible around the week (circular).
 */
function distributeDays(daysPerWeek: number, longRunDay: number): number[] {
  if (daysPerWeek <= 1) return [longRunDay];
  if (daysPerWeek >= 7) return [0, 1, 2, 3, 4, 5, 6];

  const totalDays = 7;

  // Offsets from the long run day. Even spacing looks right but leaves no pair
  // of days that is both 2+ days from the long run and 2+ days from each other
  // — on 5 days it produced Mon/Wed/Thu/Sat/Sun, where the only candidates for
  // the two key sessions were Wed and Thu, back to back. These patterns always
  // keep two such slots free.
  const OFFSETS: Record<number, number[]> = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
  };

  const offsets = OFFSETS[daysPerWeek] ?? OFFSETS[4];
  const days = offsets.map((o) => (longRunDay + o) % totalDays);

  return days.sort((a, b) => a - b);
}

/**
 * Pick the best day from availableDays starting at startIndex,
 * maximizing circular distance from the long run day and any
 * existing key_quality slots.
 */
/**
 * Pick the best available day that maximizes circular distance
 * from heavy days (long run + key sessions).
 * Searches ALL available days, not just from startIndex.
 */
function pickBestDay(
  availableDays: number[],
  longRunDay: number,
  existingSlots: WeekSlot[],
): number {
  const totalDays = 7;
  const usedDays = new Set(existingSlots.map(s => s.dayOfWeek));

  // Collect days that are "heavy" — long run + existing key sessions
  const heavyDays = [longRunDay];
  for (const slot of existingSlots) {
    if (slot.slotType === "key_quality" || slot.slotType === "long_run") {
      heavyDays.push(slot.dayOfWeek);
    }
  }

  let bestDay = availableDays.find(d => !usedDays.has(d)) ?? availableDays[0];
  let bestScore = -1;

  // Search ALL available days (not just from startIndex)
  for (const day of availableDays) {
    if (usedDays.has(day)) continue;

    let minDist = totalDays;
    let sumDist = 0;
    for (const hd of heavyDays) {
      const dist = Math.min(
        (day - hd + totalDays) % totalDays,
        (hd - day + totalDays) % totalDays,
      );
      minDist = Math.min(minDist, dist);
      sumDist += dist;
    }

    // Break ties on total spread instead of day order: picking the first day
    // of the week on a tie is what put a key session right after the long run.
    const score = minDist * 100 + sumDist;
    if (score > bestScore) {
      bestScore = score;
      bestDay = day;
    }
  }

  return bestDay;
}

// ── Main function ──────────────────────────────────────────────────

/**
 * Build a week template with session slots distributed across available days.
 *
 * Rules:
 * - Long run placed on user's preferred day
 * - For 3 days: long_run + 1 key + 1 easy
 * - For 4 days: long_run + 2 key + 1 easy
 * - For 5 days: long_run + 2 key + 2 easy
 * - For 6 days: long_run + 2 key + 2 easy + 1 recovery
 * - Key sessions spaced away from long run and each other
 * - Recovery weeks: key sessions replaced with easy
 *
 * @param daysPerWeek - Number of training days (3-7)
 * @param longRunDay - Day of week for long run (0=Mon...6=Sun)
 * @param phase - Current training phase
 * @param isRecoveryWeek - If true, replace key sessions with easy
 * @param trainingGoal - Optional: adjusts quality session count
 * @param raceDistance - Optional: weights key session types toward the distance
 * @param weekNumber - Optional: rotates key session types across weeks
 */
export function buildWeekTemplate(
  daysPerWeek: number,
  longRunDay: number,
  phase: TrainingPhase,
  isRecoveryWeek: boolean,
  trainingGoal?: TrainingGoal,
  raceDistance?: RaceDistance,
  weekNumber: number = 0,
): WeekSlot[] {
  // Determine slot distribution by days per week
  // Format: { key count, easy count, recovery count } — long_run is always 1
  // Designed to respect ~80/20 polarized distribution:
  //   3j: 1 key + 1 SL + 1 easy     = 33% hard (acceptable for low volume)
  //   4j: 2 key + 1 SL + 1 easy     = Daniels' Q1/Q2 pair, ~15% hard *time*
  //   5j: 2 key + 1 SL + 2 easy     = 40% hard sessions but key≠all-out → ~25% hard time
  //   6j: 2 key + 1 SL + 2 easy + 1 recovery
  //   7j: 2 key + 1 SL + 3 easy + 1 recovery
  //
  // The 80/20 split is a share of *time*, not of sessions: a key session spends
  // most of its minutes warming up, recovering and cooling down. Budgeting a
  // single key session per week left 4-day plans under one quality session per
  // week once recovery weeks were removed, too little to develop VO2max and
  // threshold in the same cycle (Daniels prescribes a Q1/Q2 pair).
  const slotDistribution: Record<number, { key: number; easy: number; recovery: number }> = {
    3: { key: 1, easy: 1, recovery: 0 },
    4: { key: 2, easy: 1, recovery: 0 },
    5: { key: 2, easy: 2, recovery: 0 },
    6: { key: 2, easy: 2, recovery: 1 },
    7: { key: 2, easy: 3, recovery: 1 },
  };

  const dist = slotDistribution[daysPerWeek] ?? slotDistribution[4];

  // Apply training goal modifier to key sessions.
  // Hard cap: key sessions + long run must stay spaceable over 7 days. Four
  // hard days cannot be spread without two of them landing back to back, so
  // "compete" buys ambition through volume and long-run progression instead.
  const MAX_KEY_SESSIONS_BY_DAYS: Record<number, number> = { 3: 1, 4: 2, 5: 2, 6: 2, 7: 2 };
  const goalMods = getGoalModifiers(trainingGoal);
  const spacingCap = MAX_KEY_SESSIONS_BY_DAYS[daysPerWeek] ?? 2;
  const requestedKey = goalMods.maxQualitySessions > 0
    ? goalMods.maxQualitySessions
    : dist.key;
  const adjustedKey = Math.min(requestedKey, spacingCap, daysPerWeek - 1);
  const adjustedEasy = dist.easy + (dist.key - adjustedKey); // Reassign reduced key → easy
  const adjustedRecovery = dist.recovery;

  // Recovery weeks: replace key with easy
  const keyCount = isRecoveryWeek ? 0 : adjustedKey;
  const easyCount = isRecoveryWeek ? adjustedKey + adjustedEasy : adjustedEasy;
  const recoveryCount = adjustedRecovery;

  // Get available days (ensure long run day is included)
  const trainingDays = distributeDays(daysPerWeek, longRunDay);
  const otherDays = trainingDays.filter((d) => d !== longRunDay);

  // Session types based on phase
  const keyTypes = getKeySessionTypes(phase, raceDistance);
  const easyTypes: SessionType[] =
    phase === "taper"
      ? ["recovery", "endurance"]
      : ["endurance", "recovery"];
  void PHASE_SESSION_TYPES[phase];

  const slots: WeekSlot[] = [];

  // 1. Long run slot (always first).
  // Recovery weeks keep the long run — it is shortened by the caller
  // (RECOVERY_LONG_RUN_PCT), not removed. Dropping it entirely cost marathon
  // plans 4 to 5 long runs per cycle.
  slots.push({
    dayOfWeek: longRunDay,
    slotType: "long_run",
    sessionTypes: ["long_run"],
  });

  // 2. Key quality sessions (spaced apart from long run and each other).
  // Rotate the priority order week to week: the selector takes the first type
  // that matches, so a fixed order gave 3-day plans the same stimulus every
  // single week (VO2max only, never a threshold session in the whole plan).
  for (let i = 0; i < keyCount; i++) {
    const day = pickBestDay(otherDays, longRunDay, slots);
    const offset = (weekNumber + i) % keyTypes.length;
    slots.push({
      dayOfWeek: day,
      slotType: "key_quality",
      sessionTypes: [...keyTypes.slice(offset), ...keyTypes.slice(0, offset)],
    });
  }

  // 3. Easy sessions — pick from remaining unused days
  for (let i = 0; i < easyCount; i++) {
    const usedDays = new Set(slots.map(s => s.dayOfWeek));
    const available = otherDays.filter(d => !usedDays.has(d));
    if (available.length === 0) break;
    // Pick the day closest to midweek for easy runs (spread evenly)
    const day = available[0];
    slots.push({
      dayOfWeek: day,
      slotType: "easy",
      sessionTypes: easyTypes,
    });
  }

  // 4. Recovery sessions — fill remaining unused days
  for (let i = 0; i < recoveryCount; i++) {
    const usedDays = new Set(slots.map(s => s.dayOfWeek));
    const available = otherDays.filter(d => !usedDays.has(d));
    if (available.length === 0) break;
    const day = available[0];
    slots.push({
      dayOfWeek: day,
      slotType: "recovery",
      sessionTypes: ["recovery"],
    });
  }

  return slots.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}
