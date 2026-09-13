/**
 * Design tokens for the marketing videos.
 *
 * Mirrors `src/styles/themes.css` (light theme) and `src/lib/zoneColors.ts`.
 * The video is a separate bundle and cannot import the app's CSS variables, so
 * the values are duplicated here — keep them in sync with `qa-zone-colors.ts`'s
 * source of truth if the ramp ever moves.
 */

import { Easing, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import type { Lang } from "./lang";

// Space Grotesk ships no true italic; Chrome synthesises the oblique used for
// accented words, which is what the site does too.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const COLORS = {
  bg: "#f8fafc",
  fg: "#0f172a",
  sub: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  accent: "#f97316",
  border: "#e2e8f0",
  panel: "#ffffff",
} as const;

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

/** Running ramp, light theme — mirrors `ZONE_HEX_LIGHT` and `ZONE_META`. */
export const ZONES: ZoneToken[] = [
  { n: 1, hex: "#94a3b8", label: "Récupération", labelEn: "Recovery", desc: "Effort très léger", descEn: "Very light effort", pct: "50–60 %", pace: "6:15 – 7:30" },
  { n: 2, hex: "#16a34a", label: "Endurance", labelEn: "Endurance", desc: "Base aérobie", descEn: "Aerobic base", pct: "60–75 %", pace: "5:00 – 6:15" },
  { n: 3, hex: "#ca8a04", label: "Tempo", labelEn: "Tempo", desc: "Seuil aérobie", descEn: "Aerobic threshold", pct: "75–85 %", pace: "4:25 – 5:00" },
  { n: 4, hex: "#f97316", label: "Seuil", labelEn: "Threshold", desc: "Seuil lactique", descEn: "Lactate threshold", pct: "85–92 %", pace: "4:05 – 4:25" },
  { n: 5, hex: "#ef4444", label: "VO2max", labelEn: "VO2max", desc: "Puissance aérobie", descEn: "Aerobic power", pct: "92–100 %", pace: "3:45 – 4:05" },
  { n: 6, hex: "#7c3aed", label: "Sprint", labelEn: "Sprint", desc: "Vitesse maximale", descEn: "Top speed", pct: "100–120 %", pace: "3:08 – 3:45" },
];

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
 * `src/components/visualization/transforms.ts` — the app colours a "Z1-Z2"
 * warm-up green, not grey, and the films must agree with it.
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
 * Plan phase colours.
 *
 * The app has no single source for these yet (eight tables disagree — see
 * issue #114), so the video picks its own consistent ramp: the training load
 * climbing from endurance green through to the orange peak, then greying off
 * into the taper.
 */
export const PHASE_COLORS: Record<string, string> = {
  base: "#16a34a",
  build: "#ca8a04",
  peak: "#f97316",
  taper: "#94a3b8",
  race: "#7c3aed",
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
