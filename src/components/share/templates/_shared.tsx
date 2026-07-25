/**
 * Shared chrome bits for share templates: logo + wordmark, footer
 * (zoned.run · workout id) and the transparent-aware background layer.
 */

import Logo from "@/assets/logo.svg?react";
import type { WorkoutTemplate } from "@/types";
import { ZONE_HEX_LIGHT } from "@/lib/zoneColors";

interface BrandStripProps {
  scale?: number;
  /** White wordmark for use over a dark/coloured background. */
  inverted?: boolean;
}

/** Brand bar with the gradient pulse logo + "Zoned" wordmark. */
export function BrandStrip({ scale = 1, inverted = false }: BrandStripProps) {
  const logoSize = 36 * scale;
  const wordmarkSize = 32 * scale;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
      <Logo style={{ width: logoSize * 2, height: logoSize, display: "block" }} />
      <span
        style={{
          fontSize: wordmarkSize,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: inverted ? "#ffffff" : "#0f172a",
          lineHeight: 1,
        }}
      >
        Zoned
      </span>
    </div>
  );
}

interface ShareFooterProps {
  workout: WorkoutTemplate;
  /** Font size in px (base ~ 18). */
  size?: number;
  /** Mute when laid over a coloured/zone-hero background. */
  inverted?: boolean;
}

/** Discreet "zoned.run · WORKOUT-ID" footer common to every template. */
export function ShareFooter({ workout, size = 18, inverted = false }: ShareFooterProps) {
  const color = inverted ? "rgba(255,255,255,0.85)" : "#64748b";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <span>zoned.run</span>
      <span>{workout.id}</span>
    </div>
  );
}

/**
 * `bg-zone-N/15` equivalents for use in inline styles. Mirrors the pattern
 * `bg-zone-N/15 + text-zone-N` used throughout the app (HomePage.tsx).
 */
export const ZONE_BG_TINT: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "rgba(148, 163, 184, 0.15)",
  2: "rgba(22, 163, 74, 0.13)",
  3: "rgba(202, 138, 4, 0.14)",
  4: "rgba(249, 115, 22, 0.13)",
  5: "rgba(239, 68, 68, 0.12)",
  6: "rgba(124, 58, 237, 0.13)",
};

/**
 * Public canonical URL for a workout. Used by QR codes on share templates.
 * Falls back to the prod host when window is unavailable (SSR/build).
 */
export function workoutShareUrl(workoutId: string): string {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://zoned.run";
  return `${origin}/workout/${workoutId}`;
}

/**
 * Share images render on their own light background regardless of the app
 * theme, so they pin the light ramp deliberately. What was not deliberate was
 * keeping a private copy of the values: this now tracks the shared table, and
 * scripts/qa-zone-colors.ts keeps that table honest against themes.css.
 */
export const ZONE_HEX = ZONE_HEX_LIGHT;

interface BgLayerProps {
  /** Inline background CSS (defaults to `#f8fafc`). */
  background?: string;
}

/**
 * Editorial background that fills its positioned parent. Hidden by the
 * wrapper's `data-transparent="true"` attribute so html-to-image captures
 * with alpha = 0 outside the painted content.
 */
export function BgLayer({ background = "#f8fafc" }: BgLayerProps) {
  return (
    <div
      data-bg-layer
      style={{
        position: "absolute",
        inset: 0,
        background,
        zIndex: 0,
      }}
    />
  );
}
