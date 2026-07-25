/**
 * Session type → training zone, and the single colour mapping that follows.
 *
 * One source for the whole app: the dots on plan cards, the polarisation bar
 * and the week rhythm chart all resolve to the same `--zone-*` tokens, so a
 * colour carries the same meaning (intensity) wherever it shows up. Types with
 * no aerobic zone (strength, yoga, rest, cross-training) stay neutral, and the
 * cross-discipline sessions keep their discipline hue.
 */

import type { SessionType } from "@/types";

/** Dominant training zone per session type. Absent = no aerobic zone. */
export const SESSION_ZONE: Partial<Record<SessionType, number>> = {
  recovery: 1,
  endurance: 2,
  long_run: 2,
  tempo: 3,
  threshold: 4,
  race_specific: 4,
  fartlek: 4,
  hills: 5,
  vo2max: 5,
  speed: 6,
};

/** Accent colour per session type — zone token, discipline hue, or neutral. */
export const SESSION_COLORS: Record<string, string> = {
  recovery: "var(--zone-1)",
  endurance: "var(--zone-2)",
  long_run: "var(--zone-2)",
  tempo: "var(--zone-3)",
  threshold: "var(--zone-4)",
  race_specific: "var(--zone-4)",
  fartlek: "var(--zone-4)",
  hills: "var(--zone-5)",
  vo2max: "var(--zone-5)",
  speed: "var(--zone-6)",
  cycling: "var(--discipline-cycling)",
  swimming: "var(--discipline-swimming)",
  strength: "var(--muted-foreground)",
  yoga: "var(--muted-foreground)",
  rest_day: "var(--muted-foreground)",
  rest: "var(--muted-foreground)",
  cross_training: "var(--muted-foreground)",
};

/** Fallback for an unknown session type. */
export const SESSION_COLOR_FALLBACK = "var(--muted-foreground)";

export function sessionColor(type: string): string {
  return SESSION_COLORS[type] ?? SESSION_COLOR_FALLBACK;
}
