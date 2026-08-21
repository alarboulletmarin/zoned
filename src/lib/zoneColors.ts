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
 * The table below mirrors themes.css exactly. `bun run scripts/qa-zone-colors.ts`
 * fails if it ever diverges, so the duplication cannot rot silently.
 *
 * Zoned Brut unifies the Z1-Z6 ramp across running, cycling and swimming
 * ("la couleur ne dit qu'une chose : la zone") — the `discipline` parameter
 * is kept only so call sites don't need to change; it no longer selects a
 * different ramp. Cycling and swimming keep their own single-hue accent for
 * plan-level cues (see `getDisciplineAccent` in `useZoneColors.ts`).
 */

import type { Discipline, ZoneNumber } from "@/types";

export type ThemeMode = "light" | "dark";

type ZoneHexMap = Record<ZoneNumber, string>;

/** Unified Z1-Z6 ramp, light theme — mirrors themes.css `:root`. */
export const ZONE_HEX_LIGHT: ZoneHexMap = {
  1: "#8f8f86",
  2: "#2fa84a",
  3: "#e0b400",
  4: "#ff6a1f",
  5: "#e5261b",
  6: "#8a46e0",
};

/** Unified Z1-Z6 ramp, dark theme — mirrors themes.css `.dark`. */
export const ZONE_HEX_DARK: ZoneHexMap = {
  1: "#8f8f86",
  2: "#6ee07a",
  3: "#f2d53c",
  4: "#ff7a2f",
  5: "#ff3b30",
  6: "#b26bff",
};

const BY_THEME: Record<ThemeMode, ZoneHexMap> = {
  light: ZONE_HEX_LIGHT,
  dark: ZONE_HEX_DARK,
};

/** Literal hex for a zone. Use in exports; in the DOM prefer `var(--zone-N)`. */
export function getZoneHex(
  zone: ZoneNumber,
  { theme = "light" }: { theme?: ThemeMode; discipline?: Discipline } = {},
): string {
  return BY_THEME[theme][zone];
}

/** Whole ramp, for renderers that need to build their own lookup. */
export function getZoneHexMap(
  { theme = "light" }: { theme?: ThemeMode; discipline?: Discipline } = {},
): ZoneHexMap {
  return BY_THEME[theme];
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
