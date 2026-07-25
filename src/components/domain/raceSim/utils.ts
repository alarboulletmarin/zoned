import type { Exercise } from "@/data/guides/warmup/types";

/**
 * Parses the target-time field. One text input replaces the three native
 * steppers (h / min / s), whose targets were tiny and two of which are dead
 * weight on a 10K. Accepted, deterministically:
 *   "45"        -> 45 min
 *   "45:00"     -> mm:ss
 *   "3:30:00"   -> h:mm:ss
 * Returns null when the string can't be read, so the caller can show an error
 * instead of silently computing a plan from garbage.
 */
export function parseTargetTime(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":");
  if (parts.length > 3) return null;
  if (parts.some((p) => p === "" || !/^\d+$/.test(p.trim()))) return null;

  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.some(Number.isNaN)) return null;

  if (nums.length === 1) return nums[0] * 60;
  if (nums.length === 2) {
    const [m, s] = nums;
    if (s > 59) return null;
    return m * 60 + s;
  }
  const [h, m, s] = nums;
  if (m > 59 || s > 59) return null;
  return h * 3600 + m * 60 + s;
}

/** Wall-clock seconds an exercise occupies, recovery included. */
export function exerciseSeconds(ex: Exercise): number | null {
  if (!ex.durationSeconds) return null;
  return ex.durationSeconds * (ex.sets ?? ex.repetitions ?? 1);
}

/** "10 min" / "45 s" / "2 min 30" — compact enough for a chip. */
export function formatShortDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const min = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${min} min` : `${min} min ${rest}`;
}

/** "HH:mm" -> minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minutes since midnight -> "HH:mm" (wraps over 24 h). */
export function minutesToTime(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
