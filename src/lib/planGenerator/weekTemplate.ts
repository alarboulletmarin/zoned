import type { SessionType, TrainingPhase } from "@/types";
import { PHASE_SESSION_TYPES, KEY_SESSION_TYPES } from "./constants";

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
function pickBestDay(
  availableDays: number[],
  startIndex: number,
  longRunDay: number,
  existingSlots: WeekSlot[],
): number {
  const totalDays = 7;

  // Collect days that are "heavy" — long run + existing key sessions
  const heavyDays = [longRunDay];
  for (const slot of existingSlots) {
    if (slot.slotType === "key_quality" || slot.slotType === "long_run") {
      heavyDays.push(slot.dayOfWeek);
    }
  }

  let bestDay = availableDays[startIndex] ?? availableDays[0];
  let bestMinDist = -1;

  // Search from startIndex onwards for the day that maximizes
  // minimum circular distance to any heavy day
  for (let i = startIndex; i < availableDays.length; i++) {
    const day = availableDays[i];
    // Already used in a slot?
    if (existingSlots.some((s) => s.dayOfWeek === day)) continue;

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
 * @param daysPerWeek - Number of training days (3-6)
 * @param longRunDay - Day of week for long run (0=Mon...6=Sun)
 * @param phase - Current training phase
 * @param isRecoveryWeek - If true, replace key sessions with easy
 */
export function buildWeekTemplate(
  daysPerWeek: number,
  longRunDay: number,
  phase: TrainingPhase,
  isRecoveryWeek: boolean,
): WeekSlot[] {
  // Determine slot distribution by days per week
  // Format: { key count, easy count, recovery count } — long_run is always 1
  const slotDistribution: Record<number, { key: number; easy: number; recovery: number }> = {
    3: { key: 1, easy: 1, recovery: 0 },
    4: { key: 2, easy: 1, recovery: 0 },
    5: { key: 2, easy: 2, recovery: 0 },
    6: { key: 2, easy: 2, recovery: 1 },
  };

  const dist = slotDistribution[daysPerWeek] ?? slotDistribution[4];

  // Recovery weeks: replace key with easy
  const keyCount = isRecoveryWeek ? 0 : dist.key;
  const easyCount = isRecoveryWeek ? dist.key + dist.easy : dist.easy;
  const recoveryCount = dist.recovery;

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
  let dayIndex = 0;
  for (let i = 0; i < keyCount && dayIndex < otherDays.length; i++) {
    // Pick the day that maximizes distance from long run and other key sessions
    const day = pickBestDay(otherDays, dayIndex, longRunDay, slots);
    slots.push({
      dayOfWeek: day,
      slotType: "key_quality",
      // Rotate through key types so variety emerges across the week
      sessionTypes: i === 0 ? keyTypes : [...keyTypes].reverse(),
    });
    dayIndex++;
  }

  // 3. Easy sessions
  for (let i = 0; i < easyCount && dayIndex < otherDays.length; i++) {
    const day = otherDays[dayIndex] ?? otherDays[dayIndex % otherDays.length];
    slots.push({
      dayOfWeek: day,
      slotType: "easy",
      sessionTypes: easyTypes,
    });
    dayIndex++;
  }

  // 4. Recovery sessions
  for (let i = 0; i < recoveryCount && dayIndex < otherDays.length; i++) {
    const day = otherDays[dayIndex] ?? otherDays[dayIndex % otherDays.length];
    slots.push({
      dayOfWeek: day,
      slotType: "recovery",
      sessionTypes: ["recovery"],
    });
    dayIndex++;
  }

  return slots.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}
