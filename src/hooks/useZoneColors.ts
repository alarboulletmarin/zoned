import { useMemo } from "react";
import type { Discipline, ZoneNumber } from "@/types";

/**
 * Zone colors, returned as CSS custom-property references so theme switches
 * (light/dark) and accessibility palettes apply automatically.
 *
 * Zoned Brut unifies Z1-Z6 across running, cycling and swimming — one ramp,
 * "la couleur ne dit qu'une chose : la zone". The `discipline` parameter is
 * kept so call sites don't need to change; it no longer selects a different
 * ramp. Disciplines that need their own identity outside the zone ramp use
 * `getDisciplineAccent`/`useDisciplineAccent` instead (plan calendar dots,
 * sparklines, badges).
 *
 * The CSS variables are declared in `src/styles/themes.css` and adapted in
 * `src/styles/palettes-a11y.css` for color-blind accessible variants.
 */
export type ZoneColorMap = Record<ZoneNumber, string>;

const ZONE_COLORS: ZoneColorMap = {
  1: "var(--zone-1)",
  2: "var(--zone-2)",
  3: "var(--zone-3)",
  4: "var(--zone-4)",
  5: "var(--zone-5)",
  6: "var(--zone-6)",
};

/**
 * Discipline accent — single hue for plan-level visual cues (calendar dots,
 * sparklines, badges) where the full zone ramp would be visual noise.
 */
const DISCIPLINE_ACCENT: Record<Discipline, string> = {
  running: "var(--primary)",
  cycling: "var(--discipline-cycling)",
  swimming: "var(--discipline-swimming)",
};

/** Non-hook accessor (use inside .ts utilities, not React components). */
export function getZoneColors(_discipline: Discipline = "running"): ZoneColorMap {
  return ZONE_COLORS;
}

/** Non-hook accessor for discipline accent color. */
export function getDisciplineAccent(discipline: Discipline = "running"): string {
  return DISCIPLINE_ACCENT[discipline];
}

/**
 * React hook variant. `ZONE_COLORS` is a module-level constant, so it is
 * already referentially stable across renders — the hook exists to keep the
 * call signature call sites already use. Discipline defaults to "running";
 * the ramp is unified regardless of the value passed.
 */
export function useZoneColors(_discipline: Discipline = "running"): ZoneColorMap {
  return ZONE_COLORS;
}

/** React hook variant for discipline accent. */
export function useDisciplineAccent(discipline: Discipline = "running"): string {
  return useMemo(() => DISCIPLINE_ACCENT[discipline], [discipline]);
}
