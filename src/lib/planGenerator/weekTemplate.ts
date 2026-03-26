import type { SessionType, TrainingPhase } from "@/types";
import type { TrainingGoal } from "@/types/plan";
import { PHASE_SESSION_TYPES, KEY_SESSION_TYPES, getGoalModifiers } from "./constants";

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
  // Ideal spacing between sessions
  const idealSpacing = totalDays / daysPerWeek;

  const days: number[] = [longRunDay];

  // Generate candidate positions evenly spaced starting from longRunDay
  for (let i = 1; i < daysPerWeek; i++) {
    const candidate = Math.round(longRunDay + i * idealSpacing) % totalDays;
    // Avoid duplicates: nudge if collision
    let day = candidate;
    let offset = 0;
    while (days.includes(day)) {
      offset++;
      day = (candidate + offset) % totalDays;
    }
    days.push(day);
  }

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
  let bestMinDist = -1;

  // Search ALL available days (not just from startIndex)
  for (const day of availableDays) {
    if (usedDays.has(day)) continue;

    let minDist = totalDays;
    for (const hd of heavyDays) {
      const dist = Math.min(
        (day - hd + totalDays) % totalDays,
        (hd - day + totalDays) % totalDays,
      );
      minDist = Math.min(minDist, dist);
    }

    if (minDist > bestMinDist) {
      bestMinDist = minDist;
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
 */
export function buildWeekTemplate(
  daysPerWeek: number,
  longRunDay: number,
  phase: TrainingPhase,
  isRecoveryWeek: boolean,
  trainingGoal?: TrainingGoal,
): WeekSlot[] {
  // Determine slot distribution by days per week
  // Format: { key count, easy count, recovery count } — long_run is always 1
  // Designed to respect ~80/20 polarized distribution:
  //   3j: 1 key + 1 SL + 1 easy     = 33% hard (acceptable for low volume)
  //   4j: 1 key + 1 SL + 2 easy     = 25% hard (good 80/20)
  //   5j: 2 key + 1 SL + 2 easy     = 40% hard sessions but key≠all-out → ~25% hard time
  //   6j: 2 key + 1 SL + 2 easy + 1 recovery
  //   7j: 2 key + 1 SL + 3 easy + 1 recovery
  const slotDistribution: Record<number, { key: number; easy: number; recovery: number }> = {
    3: { key: 1, easy: 1, recovery: 0 },
    4: { key: 1, easy: 2, recovery: 0 },
    5: { key: 2, easy: 2, recovery: 0 },
    6: { key: 2, easy: 2, recovery: 1 },
    7: { key: 2, easy: 3, recovery: 1 },
  };

  const dist = slotDistribution[daysPerWeek] ?? slotDistribution[4];

  // Apply training goal modifier to key sessions
  const goalMods = getGoalModifiers(trainingGoal);
  let maxKey = dist.key;
  if (goalMods.maxQualitySessions > 0) {
    // Goal overrides: cap or boost quality sessions
    maxKey = Math.min(goalMods.maxQualitySessions, daysPerWeek - 1); // Always need at least 1 non-key day
  }
  const adjustedKey = Math.min(maxKey, dist.key + (goalMods.maxQualitySessions > dist.key ? 1 : 0));
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
  const keyTypes = KEY_SESSION_TYPES[phase];
  const easyTypes: SessionType[] =
    phase === "taper"
      ? ["recovery", "endurance"]
      : ["endurance", "recovery"];
  void PHASE_SESSION_TYPES[phase];

  const slots: WeekSlot[] = [];

  // 1. Long run slot (always first)
  slots.push({
    dayOfWeek: longRunDay,
    slotType: isRecoveryWeek ? "easy" : "long_run",
    sessionTypes: isRecoveryWeek ? easyTypes : ["long_run"],
  });

  // 2. Key quality sessions (spaced apart from long run and each other)
  for (let i = 0; i < keyCount; i++) {
    const day = pickBestDay(otherDays, longRunDay, slots);
    slots.push({
      dayOfWeek: day,
      slotType: "key_quality",
      sessionTypes: i === 0 ? keyTypes : [...keyTypes].reverse(),
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
