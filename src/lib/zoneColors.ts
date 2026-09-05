/**
 * Zone colours — the one place a zone becomes a colour.
 *
 * The redesign replaced the six-hue system (grey/green/yellow/orange/red/violet)
 * with a single ink ramp: Z1 is 14% ink on paper, Z6 is solid ink. Darker means
 * harder, the scale is learned once, and it survives greyscale — which is what
 * frees the vermillon accent for the primary action. Intensity is always coded
 * twice, by ink density and by block height; this file owns the first channel
 * only. Thresholds, zone numbers and every calculation are unchanged.
 *
 * `src/styles/design/zones.css` owns the values for anything the browser paints
 * (`var(--zone-N)`), because only CSS can composite an rgba ink over whatever
 * paper it lands on and follow the theme. But exports have no DOM: pdfmake and
 * the share-image renderers need literal hex, and each of them used to carry
 * its own copy. Those copies drifted — the PDF ramp was off by one zone,
 * colouring recovery green and endurance blue.
 *
 * The tables below are that ramp already composited over the card surface.
 * `bun run scripts/qa-zone-colors.ts` recomputes the compositing from the CSS
 * and fails if a single byte differs, so the duplication cannot rot silently.
 *
 * The three disciplines share one ramp. An effort in Z4 is an effort in Z4
 * whether you run, ride or swim, and the discipline is already named in words
 * next to every chart that shows one.
 */

import type { Discipline, ZoneNumber } from "@/types";

export type ThemeMode = "light" | "dark";

type ZoneHexMap = Record<ZoneNumber, string>;

/** The ink ramp, light theme — `--zone-1..6` composited over `--paper-raised`. */
export const ZONE_HEX_LIGHT: ZoneHexMap = {
  1: "#dedbd4",
  2: "#b9b6af",
  3: "#94918a",
  4: "#6f6c65",
  5: "#45423c",
  6: "#16130e",
};

/** The ink ramp, dark theme — the same alphas, cream over the dark card. */
export const ZONE_HEX_DARK: ZoneHexMap = {
  1: "#3e3931",
  2: "#5f5a51",
  3: "#807a70",
  4: "#a19b90",
  5: "#c6bfb3",
  6: "#efe8da",
};

const BY_THEME: Record<ThemeMode, ZoneHexMap> = {
  light: ZONE_HEX_LIGHT,
  dark: ZONE_HEX_DARK,
};

/**
 * Literal hex for a zone. Use in exports; in the DOM prefer `var(--zone-N)`.
 * `discipline` is accepted and ignored: the three disciplines share one ramp.
 * The parameter stays so no call site has to change.
 */
export function getZoneHex(
  zone: ZoneNumber,
  { theme = "light", discipline = "running" }: { theme?: ThemeMode; discipline?: Discipline } = {},
): string {
  void discipline;
  return BY_THEME[theme][zone];
}

/** Whole ramp, for renderers that need to build their own lookup. */
export function getZoneHexMap(
  { theme = "light", discipline = "running" }: { theme?: ThemeMode; discipline?: Discipline } = {},
): ZoneHexMap {
  void discipline;
  return BY_THEME[theme];
}

/**
 * Used wherever a step carries no zone (drills, rest, cross-training).
 * A recovery block is not a zone, so it never takes a ramp value: on screen it
 * is a 45 degree hatch, and where only a flat fill is possible — PDF, PNG — it
 * falls back to the sunken paper it would be cut out of.
 */
export const UNZONED_HEX = "#efe7d7";

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
