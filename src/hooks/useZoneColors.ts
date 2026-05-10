import { useMemo } from "react";
import type { Discipline, ZoneNumber } from "@/types";

/**
 * Zone colors per discipline, returned as CSS custom-property references so
 * theme switches (light/dark) and accessibility palettes apply automatically.
 *
 * Running uses the warm zone identity (slate → green → yellow → orange → red → purple).
 * Cycling uses a Bootstrap-inspired blue ramp.
 * Swimming uses a deep cyan ramp.
 *
 * The CSS variables are declared in `src/styles/themes.css` and adapted in
 * `src/styles/palettes-a11y.css` for color-blind accessible variants.
 */
export type ZoneColorMap = Record<ZoneNumber, string>;

const RUNNING: ZoneColorMap = {
  1: "var(--zone-1)",
  2: "var(--zone-2)",
  3: "var(--zone-3)",
  4: "var(--zone-4)",
  5: "var(--zone-5)",
  6: "var(--zone-6)",
};

const CYCLING: ZoneColorMap = {
  1: "var(--zone-cyclo-1)",
  2: "var(--zone-cyclo-2)",
  3: "var(--zone-cyclo-3)",
  4: "var(--zone-cyclo-4)",
  5: "var(--zone-cyclo-5)",
  6: "var(--zone-cyclo-6)",
};

const SWIMMING: ZoneColorMap = {
  1: "var(--zone-swim-1)",
  2: "var(--zone-swim-2)",
  3: "var(--zone-swim-3)",
  4: "var(--zone-swim-4)",
  5: "var(--zone-swim-5)",
  6: "var(--zone-swim-6)",
};

const ZONE_COLORS_BY_DISCIPLINE: Record<Discipline, ZoneColorMap> = {
  running: RUNNING,
  cycling: CYCLING,
  swimming: SWIMMING,
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
export function getZoneColors(discipline: Discipline = "running"): ZoneColorMap {
  return ZONE_COLORS_BY_DISCIPLINE[discipline];
}

/** Non-hook accessor for discipline accent color. */
export function getDisciplineAccent(discipline: Discipline = "running"): string {
  return DISCIPLINE_ACCENT[discipline];
}

/**
 * React hook variant — memoized so consumers can pass the result to dependency
 * arrays without re-rendering on every parent update. Discipline defaults to
 * "running" so legacy call sites keep working.
 */
export function useZoneColors(discipline: Discipline = "running"): ZoneColorMap {
  return useMemo(() => ZONE_COLORS_BY_DISCIPLINE[discipline], [discipline]);
}

/** React hook variant for discipline accent. */
export function useDisciplineAccent(discipline: Discipline = "running"): string {
  return useMemo(() => DISCIPLINE_ACCENT[discipline], [discipline]);
}
