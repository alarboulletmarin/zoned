/**
 * Wire codes shared by every URL share format.
 *
 * These arrays are APPEND ONLY — their indexes are baked into links people
 * have already sent. Inserting or reordering an entry silently rewrites the
 * meaning of every existing shared URL.
 */

import type {
  Difficulty,
  SessionType,
  TerrainType,
  WorkoutRepeatUnit,
  WorkoutStepRole,
  ZoneSpec,
} from "@/types";

export const SESSION_TYPE_CODES: SessionType[] = [
  "recovery",
  "endurance",
  "tempo",
  "threshold",
  "vo2max",
  "speed",
  "long_run",
  "hills",
  "fartlek",
  "race_specific",
  "strength",
  "cycling",
  "swimming",
  "yoga",
  "rest",
  "rest_day",
  "cross_training",
];

/** 1-based: 0 means "absent" in a tuple slot. */
export const STEP_ROLE_CODES: WorkoutStepRole[] = ["effort", "recovery", "transition"];
export const REPEAT_UNIT_CODES: WorkoutRepeatUnit[] = ["reps", "sets", "blocks"];
export const INTENSITY_CODES = ["E", "M", "T", "I", "R"] as const;
export const TERRAIN_CODES: TerrainType[] = [
  "road",
  "trail_runnable",
  "trail_technical",
  "mountain",
];
export const DIFFICULTY_CODES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
];

/** Look up `code` in a 1-based table (0 → undefined). */
export function fromCode<T>(table: readonly T[], code: unknown): T | undefined {
  return typeof code === "number" && code > 0 ? table[code - 1] : undefined;
}

/** `value` → 1-based code, 0 when absent or unknown. */
export function toCode<T>(table: readonly T[], value: T | undefined): number {
  if (value === undefined) return 0;
  const idx = table.indexOf(value);
  return idx < 0 ? 0 : idx + 1;
}

/**
 * `ZoneSpec` is a free-text field ("Z5", but also "80% VMA"). Plain "Z1".."Z6"
 * collapses to an int (1 char instead of 4); anything else rides as a string.
 */
export function encodeZone(zone: ZoneSpec | undefined): number | string {
  if (!zone) return 0;
  return /^Z[1-6]$/.test(zone) ? Number(zone[1]) : zone;
}

export function decodeZone(encoded: unknown): ZoneSpec | undefined {
  if (typeof encoded === "number") {
    return encoded >= 1 && encoded <= 6 ? `Z${encoded}` : undefined;
  }
  return typeof encoded === "string" && encoded.length > 0 ? encoded : undefined;
}
