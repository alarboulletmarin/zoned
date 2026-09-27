import type { Exercise } from "@/data/guides/warmup/types";

/**
 * A finish time spelled out, "3 h 30 min" / "45 min 30 s". Under the masked
 * field it states which reading was taken, "3:30" alone could still be read
 * either way, words cannot.
 */
export function formatReadableTime(totalSeconds: number): string {
  const total = Math.round(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const sec = s > 0 ? ` ${s.toString().padStart(2, "0")} s` : "";
  if (h > 0) return `${h} h ${m.toString().padStart(2, "0")} min${sec}`;
  return `${m} min${sec}`;
}

/** Wall-clock seconds an exercise occupies, recovery included. */
export function exerciseSeconds(ex: Exercise): number | null {
  if (!ex.durationSeconds) return null;
  return ex.durationSeconds * (ex.sets ?? ex.repetitions ?? 1);
}

/** "10 min" / "45 s" / "2 min 30", compact enough for a chip. */
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
