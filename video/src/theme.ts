/**
 * Design tokens for the marketing videos.
 *
 * Mirrors the app's design layer, `src/styles/design/` — `colors.css` for the
 * paper/ink/vermillon ground, `zones.css` for the effort ramp, `fonts.css` for
 * the three families. The video is a separate bundle and cannot import the
 * app's CSS variables, so the values are duplicated here.
 *
 * THE RAMP IS ALPHA IN THE APP, FLAT HEX HERE. `zones.css` states each zone as
 * ink at a given alpha over whatever surface it lands on; a film has one
 * surface, the page, so each stop is composited against `--paper-page` once and
 * written out. The formula is `round(a × ink + (1 − a) × paper)` per channel,
 * with ink #171614 and paper #F6F5F2. Recompute the stops rather than
 * re-rounding them by eye if the ramp or the paper ever moves —
 * `scripts/qa-zone-colors.ts` in the app does the same compositing and is the
 * side that must stay right.
 */

import { Easing, useVideoConfig } from "remotion";
import { textFamily } from "./fonts";
import type { Lang } from "./lang";

/**
 * Three families, never four — the app's rule (src/styles/design/fonts.css).
 * Bricolage Grotesque sets the display lines, Space Grotesk the interface text,
 * JetBrains Mono the data, the codes and the micro-labels. They are registered
 * and awaited in `./fonts`, from the app's own files.
 *
 * Neither grotesque ships a true italic; Chrome synthesises the oblique used
 * for accented words, which is what the site does too.
 *
 * `fontFamily` keeps its bare name because it is the default one, the one
 * `<Stage>` sets on the canvas and every leaf inherits.
 */
export { displayFamily, monoFamily } from "./fonts";
export const fontFamily = textFamily;

export const COLORS = {
  /** paper: the page, and the card raised off it */
  bg: "#F6F5F2",
  panel: "#FFFFFF",
  band: "#EFEEEA",

  /** ink */
  fg: "#171614",
  sub: "#4A4845",
  muted: "#6C6A65",
  /** disabled ink (0.38) composited on the page — the faintest legible step */
  faint: "#A1A09E",

  /** one accent, vermillon: the primary action, and danger */
  accent: "#E8452A",

  /**
   * Two line weights, and they are not interchangeable. `line` is the card's
   * own outline, full ink, the thing that makes the app read as printed.
   * `border` is the divider (0.18 ink, composited): rules between rows, dotted
   * grids, the chrome of a browser frame. Drawing a divider in `line` turns a
   * table into a cage; drawing a card in `border` makes it float away.
   */
  line: "#171614",
  border: "#CECDCA",

  /**
   * The ambient washes on the ground. The app's page is flat, but a film's is
   * not allowed to be: a still ground under moving content reads as a slide
   * deck, which is what `bun run qa:motion` catches. So the drift stays and
   * only its colours change — vermillon and ink, at alphas low enough that no
   * frame is ever anything but paper.
   */
  washAccent: "232, 69, 42",
  washInk: "23, 22, 20",
} as const;

/**
 * Outline, radius and shadow, from `src/styles/design/borders.css`.
 *
 * « Everything is drawn: an ink outline is the default, not the exception. »
 * 1.5px is the house rule, 1px is a hairline for dense data, 2.5px marks a
 * retained frame. Shadows are HARD OFFSETS — never blurred, never stacked. The
 * films had neither rule: hairline grey cards and a 110px blur under the
 * screenshots, which is the single thing that most dated them.
 */
export const STROKE = { hair: 1, rule: 1.5, heavy: 2.5 } as const;

export const RADIUS = {
  lg: 10,
  xl: 16,
  xxl: 20,
  xxxl: 22,
  card: 26,
  phone: 36,
  pill: 999,
} as const;

export const SHADOW = {
  block: "8px 8px 0 rgba(23, 22, 20, 0.09)",
  blockLg: "10px 10px 0 rgba(23, 22, 20, 0.09)",
} as const;

/** A card: ink outline on white, and a hard offset instead of a blur. */
export const card = (radius: number = RADIUS.card) => ({
  background: COLORS.panel,
  border: `${STROKE.rule}px solid ${COLORS.line}`,
  borderRadius: radius,
  boxShadow: SHADOW.block,
});

export type ZoneToken = {
  n: 1 | 2 | 3 | 4 | 5 | 6;
  hex: string;
  label: string;
  /** `labelEn` from `ZONE_META` in src/types/index.ts, not a fresh translation. */
  labelEn: string;
  desc: string;
  descEn: string;
  /** Share of VMA, from `VMA_ZONE_PERCENTAGES` in src/lib/zones.ts. */
  pct: string;
  /** Pace at VMA 16 km/h, from `calculatePaceZones(16)`. */
  pace: string;
};

/**
 * The effort ramp, Z1 → Z6: one encoding, ink on paper. No hue, no six-colour
 * system, darker is harder — `src/styles/design/zones.css`, composited on the
 * page as the file header explains.
 *
 * The six colours it replaces (grey, green, yellow, orange, red, violet) said
 * "six categories"; the ramp says "one axis, and you are somewhere on it",
 * which is the claim the films actually make. It also survives greyscale by
 * construction, which was the argument for the change in the app.
 *
 * A ramp orders but does not name, so nothing here is ever shown without its
 * Z-code next to it. That rule is the app's and the films keep it.
 */
export const ZONES: ZoneToken[] = [
  { n: 1, hex: "#D7D6D3", label: "Récupération", labelEn: "Recovery", desc: "Effort très léger", descEn: "Very light effort", pct: "50–60 %", pace: "6:15 – 7:30" },
  { n: 2, hex: "#B3B2AF", label: "Endurance", labelEn: "Endurance", desc: "Base aérobie", descEn: "Aerobic base", pct: "60–75 %", pace: "5:00 – 6:15" },
  { n: 3, hex: "#8F8E8C", label: "Tempo", labelEn: "Tempo", desc: "Seuil aérobie", descEn: "Aerobic threshold", pct: "75–85 %", pace: "4:25 – 5:00" },
  { n: 4, hex: "#6C6B68", label: "Seuil", labelEn: "Threshold", desc: "Seuil lactique", descEn: "Lactate threshold", pct: "85–92 %", pace: "4:05 – 4:25" },
  { n: 5, hex: "#444340", label: "VO2max", labelEn: "VO2max", desc: "Puissance aérobie", descEn: "Aerobic power", pct: "92–100 %", pace: "3:45 – 4:05" },
  { n: 6, hex: "#171614", label: "Sprint", labelEn: "Sprint", desc: "Vitesse maximale", descEn: "Top speed", pct: "100–120 %", pace: "3:08 – 3:45" },
];

/**
 * The second, redundant channel the app pairs with the ramp: block height
 * inside a session profile (`--zone-h-*` in zones.css). On film it matters
 * more than in the app — a ramp read at a phone's arm length, in one pass,
 * needs the height to carry the ordering when the greys blur together.
 */
export const ZONE_HEIGHT: Record<number, number> = {
  1: 0.3,
  2: 0.44,
  3: 0.58,
  4: 0.72,
  5: 0.86,
  6: 1,
};

/** A zone's name and one-liner in the language being rendered. */
export const zoneText = (z: ZoneToken, lang: Lang) => ({
  label: lang === "en" ? z.labelEn : z.label,
  desc: lang === "en" ? z.descEn : z.desc,
});

/**
 * Zone number of a spec as written in the workout data: "Z5", or a span like
 * "Z1-Z2".
 *
 * A span resolves to its UPPER bound, matching `parseZoneSpan(zone)?.max` in
 * `src/components/visualization/transforms.ts` — the app prints a "Z1-Z2"
 * warm-up at the Z2 step of the ramp, not the Z1 one, and the films must agree
 * with it.
 */
export const zoneNumberOf = (spec: string | undefined): number | null => {
  if (!spec) return null;
  const found = [...String(spec).matchAll(/Z\s*(\d+)/gi)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 6);
  return found.length ? Math.max(...found) : null;
};

/** Hex for a zone spec, resolving spans the way the app does. */
export const zoneHex = (spec: string | undefined): string => {
  const n = zoneNumberOf(spec);
  return ZONES.find((z) => z.n === n)?.hex ?? COLORS.faint;
};

/**
 * The ink that stays legible ON a zone fill. Z1-Z3 are light enough for the
 * dark text; Z4-Z6 need the cream — `--zone-threshold: 4` in zones.css, which
 * is also the line between "easy" and "above threshold".
 *
 * The six-colour ramp never needed this: every hue was dark enough for white.
 * The ink ramp does, and getting it wrong prints white on pale grey.
 */
export const ZONE_THRESHOLD = 4;

export const zoneInk = (n: number): string =>
  n >= ZONE_THRESHOLD ? COLORS.bg : COLORS.fg;

/**
 * The tinted ground a zone CHIP sits on — `--zone-*-bg` in zones.css, again
 * composited on the page.
 *
 * It is not the fill: below the threshold the chip is deliberately lighter than
 * the bar (0.07 / 0.12 / 0.18 against 0.14 / 0.30 / 0.46) so a Z-code stays a
 * label and does not compete with the profile next to it. From Z4 up the two
 * are the same, because the chip is already dark enough to carry cream type.
 */
export const ZONE_CHIP_BG: Record<number, string> = {
  1: "#E6E5E2",
  2: "#DBDAD7",
  3: "#CECDCA",
  4: "#6C6B68",
  5: "#444340",
  6: "#171614",
};

/**
 * Plan phase colours.
 *
 * The app has no single source for these yet (eight tables disagree — see
 * issue #114), so the video picks its own. It now picks it from the ramp
 * instead of inventing a fourth palette: the load darkens from base to peak,
 * steps back down for the taper, and the race — the one thing the whole plan
 * points at — is the accent. That is the system's rule, one accent for the
 * thing that matters, applied to a chart.
 */
export const PHASE_COLORS: Record<string, string> = {
  base: "#B3B2AF",
  build: "#8F8E8C",
  peak: "#444340",
  taper: "#D7D6D3",
  race: "#E8452A",
};

export const PHASE_LABELS: Record<Lang, Record<string, string>> = {
  fr: {
    base: "Base",
    build: "Développement",
    peak: "Pic",
    taper: "Affûtage",
    race: "Course",
  },
  en: {
    base: "Base",
    build: "Build",
    peak: "Peak",
    taper: "Taper",
    race: "Race",
  },
};

export type Format = "wide" | "story";

export const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  wide: { width: 1920, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export const FPS = 30;

/** Seconds → frames. Beats are written in seconds; the timeline needs frames. */
export const sec = (s: number) => Math.round(s * FPS);

export type Layout = ReturnType<typeof useLayout>;

/**
 * Format-dependent metrics, derived from the composition size rather than a
 * prop so leaf components never have to be told which cut they are in.
 *
 * Story padding keeps the content clear of the Instagram/TikTok chrome, which
 * covers roughly the top 150 px and the bottom 250 px of a 1920 px canvas.
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const story = height > width;

  return {
    story,
    format: (story ? "story" : "wide") as Format,
    width,
    height,

    padX: story ? 84 : 128,
    padTop: story ? 168 : 92,
    padBottom: story ? 232 : 92,

    // Type scale
    display: story ? 132 : 152,
    head: story ? 88 : 82,
    title: story ? 56 : 54,
    sub: story ? 34 : 31,
    body: story ? 27 : 25,
    eyebrow: story ? 21 : 19,
    num: story ? 268 : 232,
    unit: story ? 58 : 50,

    gap: story ? 40 : 34,
  };
};

export const EASE = {
  outQuint: Easing.bezier(0.22, 1, 0.36, 1),
  outQuart: Easing.bezier(0.25, 1, 0.5, 1),
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  inOutQuart: Easing.bezier(0.76, 0, 0.24, 1),
  inQuart: Easing.bezier(0.5, 0, 0.75, 0),
} as const;

export const URL_LABEL = "zoned.run";
