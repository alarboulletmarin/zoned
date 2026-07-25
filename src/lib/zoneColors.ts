/**
 * Zone colours — the one place a zone becomes a colour.
 *
 * `src/styles/themes.css` owns the values for anything the browser paints
 * (`var(--zone-N)`), because only CSS can follow the light/dark theme and the
 * colour-blind palettes. But exports have no DOM: pdfmake and the share-image
 * renderers need literal hex, and each of them used to carry its own copy.
 * Those copies drifted — the PDF ramp was off by one zone, colouring recovery
 * green and endurance blue.
 *
 * The tables below mirror themes.css exactly. `bun run scripts/qa-zone-colors.ts`
 * fails if they ever diverge, so the duplication cannot rot silently.
 */

import type { Discipline, ZoneNumber } from "@/types";

export type ThemeMode = "light" | "dark";

type ZoneHexMap = Record<ZoneNumber, string>;

/** Running ramp, light theme — mirrors themes.css `:root`. */
export const ZONE_HEX_LIGHT: ZoneHexMap = {
  1: "#94a3b8",
  2: "#16a34a",
  3: "#ca8a04",
  4: "#f97316",
  5: "#ef4444",
  6: "#7c3aed",
};

/** Running ramp, dark theme — mirrors themes.css `.dark`. */
export const ZONE_HEX_DARK: ZoneHexMap = {
  1: "#94a3b8",
  2: "#22c55e",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
  6: "#7c3aed",
};

const CYCLING_HEX: Record<ThemeMode, ZoneHexMap> = {
  light: { 1: "#cfe2ff", 2: "#9ec5fe", 3: "#6ea8fe", 4: "#3d8bfd", 5: "#0d6efd", 6: "#084298" },
  dark: { 1: "#1e3a5f", 2: "#2563eb", 3: "#3d8bfd", 4: "#60a5fa", 5: "#93c5fd", 6: "#bfdbfe" },
};

const SWIMMING_HEX: Record<ThemeMode, ZoneHexMap> = {
  light: { 1: "#d1f2f4", 2: "#a2e5e9", 3: "#63cbd1", 4: "#2eb0b9", 5: "#1b8a93", 6: "#0d5e66" },
  dark: { 1: "#134545", 2: "#1b8a93", 3: "#2eb0b9", 4: "#63cbd1", 5: "#a2e5e9", 6: "#d1f2f4" },
};

const BY_DISCIPLINE: Record<Discipline, Record<ThemeMode, ZoneHexMap>> = {
  running: { light: ZONE_HEX_LIGHT, dark: ZONE_HEX_DARK },
  cycling: CYCLING_HEX,
  swimming: SWIMMING_HEX,
};

/** Literal hex for a zone. Use in exports; in the DOM prefer `var(--zone-N)`. */
export function getZoneHex(
  zone: ZoneNumber,
  { theme = "light", discipline = "running" }: { theme?: ThemeMode; discipline?: Discipline } = {},
): string {
  return BY_DISCIPLINE[discipline][theme][zone];
}

/** Whole ramp, for renderers that need to build their own lookup. */
export function getZoneHexMap(
  { theme = "light", discipline = "running" }: { theme?: ThemeMode; discipline?: Discipline } = {},
): ZoneHexMap {
  return BY_DISCIPLINE[discipline][theme];
}

/** Neutral used wherever a step carries no zone (drills, rest, cross-training). */
export const UNZONED_HEX = "#9ca3af";

/**
 * Tailwind classes per zone, written out in full.
 *
 * `ZONE_META[n].color` holds the string "zone-3", and call sites interpolated
 * it: `bg-${meta.color}`, `border-${meta.color}`. Tailwind only generates the
 * classes it can find as literal text, so those never made it into the
 * stylesheet reliably — `border-zone-3` was missing from the production CSS
 * entirely, silently dropping the border it was meant to draw.
 */
const ZONE_CLASS_TABLE = {
  bg: { 1: "bg-zone-1", 2: "bg-zone-2", 3: "bg-zone-3", 4: "bg-zone-4", 5: "bg-zone-5", 6: "bg-zone-6" },
  bgSoft: {
    1: "bg-zone-1/10", 2: "bg-zone-2/10", 3: "bg-zone-3/10",
    4: "bg-zone-4/10", 5: "bg-zone-5/10", 6: "bg-zone-6/10",
  },
  text: { 1: "text-zone-1", 2: "text-zone-2", 3: "text-zone-3", 4: "text-zone-4", 5: "text-zone-5", 6: "text-zone-6" },
  border: {
    1: "border-zone-1", 2: "border-zone-2", 3: "border-zone-3",
    4: "border-zone-4", 5: "border-zone-5", 6: "border-zone-6",
  },
} as const satisfies Record<string, Record<ZoneNumber, string>>;

export type ZoneClassVariant = keyof typeof ZONE_CLASS_TABLE;

export function zoneClass(zone: ZoneNumber, variant: ZoneClassVariant): string {
  return ZONE_CLASS_TABLE[variant][zone];
}
