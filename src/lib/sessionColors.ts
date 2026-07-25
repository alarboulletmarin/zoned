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

/**
 * Tailwind background class per session type, for the dots and bars on plan
 * and week views.
 *
 * Four pages used to keep their own copy of this table, and they had drifted
 * away from the zone scale: `hills` was green while the same session is red Z5
 * in the rhythm chart, and `speed` was red while it is violet Z6 everywhere
 * else. Same intensity, different colour depending on the screen.
 */
const NEUTRAL_CLASS = "bg-muted-foreground";

/**
 * Written out in full rather than built as `bg-zone-${n}`: Tailwind scans
 * source text, so an interpolated class name is never generated.
 */
const ZONE_CLASSES: Record<number, string> = {
  1: "bg-zone-1",
  2: "bg-zone-2",
  3: "bg-zone-3",
  4: "bg-zone-4",
  5: "bg-zone-5",
  6: "bg-zone-6",
};

const SESSION_CLASSES: Record<string, string> = {
  cycling: "bg-discipline-cycling",
  swimming: "bg-discipline-swimming",
  strength: NEUTRAL_CLASS,
  yoga: NEUTRAL_CLASS,
  rest_day: NEUTRAL_CLASS,
  rest: NEUTRAL_CLASS,
  cross_training: NEUTRAL_CLASS,
};

export function sessionColorClass(type: string): string {
  const zone = SESSION_ZONE[type as SessionType];
  if (zone) return ZONE_CLASSES[zone] ?? NEUTRAL_CLASS;
  return SESSION_CLASSES[type] ?? NEUTRAL_CLASS;
}

/**
 * Perceived effort (RPE 1-10) on the same zone ramp, so "how hard it felt"
 * and "how hard it was planned" are read with one colour language.
 */
export function rpeColor(value: number): string {
  if (value <= 2) return "var(--zone-1)";
  if (value <= 4) return "var(--zone-2)";
  if (value <= 6) return "var(--zone-3)";
  if (value <= 8) return "var(--zone-4)";
  if (value === 9) return "var(--zone-5)";
  return "var(--zone-6)";
}
