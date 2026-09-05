/**
 * Shared paper-and-ink bits for the two house-style share templates
 * (PaperSheet, ZonePlate). The other 38 templates are pastiches with their own
 * palettes; these two speak the redesign's language, so their three colours,
 * their rule width and their frieze live here rather than being retyped.
 *
 * Literal hex, like every share template: html-to-image rasterises the node
 * and no CSS custom property survives the capture.
 */

import type { CSSProperties } from "react";
import { ZONE_HEX_LIGHT, UNZONED_HEX } from "@/lib/zoneColors";
import { runTssFromZone } from "@/lib/planGenerator/tss";
import type { ZoneBarBlock, ZoneBreakdown } from "@/components/visualization";

/** `--paper-page` */
export const PAPER = "#F6F5F2";
/** `--ink-1` */
export const INK = "#171614";
/** `--ink-2` */
export const INK_2 = "#4A4845";
/** `--paper-sunken` */
export const SUNKEN = "#EFEEEA";
/** `--accent`, the vermillon. One flat per sheet. */
export const ACCENT = "#E8452A";
/** Ink at the zone-2 step of the ramp — the paled state of a drawing. */
export const INK_PALE = ZONE_HEX_LIGHT[2];

/** Everything is ruled at 1.5px. */
export const RULE = `1.5px solid ${INK}`;
export const RULE_PALE = `1.5px solid ${INK_PALE}`;

export const DISPLAY = "Bricolage Grotesque, Space Grotesk, system-ui, sans-serif";
export const MONO =
  "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace";

/**
 * The doodles carry their ground contact as `stroke="var(--accent)"` so they
 * follow the theme inside the app. Inside a share capture there is no `:root`
 * to resolve that variable against, and the drawings are validated artwork
 * that must not be edited. So the template ships the resolution with it, in a
 * `<style>` element that html-to-image clones along with the node:
 *
 *   data-doodle="accent" → the vermillon contact, one per sheet
 *   data-doodle="mute"   → the contact follows the paled ink of its figure
 */
export function AccentPatch() {
  return (
    <style>{
      `[data-doodle="accent"] [stroke="var(--accent)"]{stroke:${ACCENT}}` +
      `[data-doodle="mute"] [stroke="var(--accent)"]{stroke:currentColor}`
    }</style>
  );
}

/**
 * Session TSS, summed block by block off the zone breakdown rather than from
 * the dominant zone alone — a 10 min Z5 set inside an hour of Z2 is not an
 * hour of Z5. Time carrying no zone (drills, strides) scores nothing.
 */
export function sessionTss(breakdown: ZoneBreakdown[]): number {
  return Math.round(
    breakdown.reduce(
      (sum, z) => (z.zone == null ? sum : sum + runTssFromZone(z.durationMin, z.zone)),
      0,
    ),
  );
}

/** Block height per zone, mirroring `--zone-h-1..6`. Index 0 = unzoned. */
const ZONE_HEIGHT: Record<number, string> = {
  0: "26%",
  1: "30%",
  2: "44%",
  3: "58%",
  4: "72%",
  5: "86%",
  6: "100%",
};

interface ZoneFriezeProps {
  blocks: ZoneBarBlock[];
  /** Strip height in px. */
  height: number;
  style?: CSSProperties;
}

/**
 * The session profile, same reading as `<ZoneBar>` in the app: one block per
 * phase, width = time, intensity coded twice — by ink density and by height.
 *
 * A recovery block is drawn as sunken paper rather than the app's 45 degree
 * hatch: `zoneColors.ts` states that fallback for the flat-fill renderers.
 */
export function ZoneFrieze({ blocks, height, style }: ZoneFriezeProps) {
  const total = blocks.reduce((sum, b) => sum + b.seconds, 0) || 1;

  return (
    <div
      style={{
        boxSizing: "border-box",
        height,
        padding: 6,
        border: RULE,
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        ...style,
      }}
    >
      {blocks.map((block, i) => (
        <div
          key={i}
          style={{
            boxSizing: "border-box",
            flexGrow: block.seconds / total,
            flexBasis: 0,
            minWidth: 6,
            height: ZONE_HEIGHT[block.zone],
            background: block.zone === 0 ? UNZONED_HEX : ZONE_HEX_LIGHT[block.zone],
            border: RULE,
            borderBottom: "none",
          }}
        />
      ))}
    </div>
  );
}
