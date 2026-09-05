import type { CSSProperties } from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, ZONES } from "../theme";
import { CURVE, useBreath, useRamp } from "../motion";

/** Measured length of the pulse path below, for the draw-on animation. */
const PATH_LENGTH = 168;

const PULSE_D =
  "M 4 32 L 12 32 L 15 38 L 20 20 L 25 44 L 30 12 L 35 40 L 40 16 L 45 32 L 52 32";

/**
 * The Zoned mark: one pulse traced through the six zone colours.
 *
 * Same path as `public/favicon.svg`. It draws left to right, then keeps a slow
 * amplitude beat — the waveform never flatlines, which is both on-brand and one
 * more thing in frame that refuses to sit still.
 */
export const PulseMark: React.FC<{
  size: number;
  draw?: number;
  strokeWidth?: number;
  /** Amplitude of the idle beat, 0 to switch it off. */
  beat?: number;
  style?: CSSProperties;
}> = ({ size, draw = 1, strokeWidth = 4, beat = 0.09, style }) => {
  const pulse = useBreath(1.7, beat);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id="zonedPulse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="20%" stopColor="#22c55e" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="80%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d={PULSE_D}
        stroke="url(#zonedPulse)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={PATH_LENGTH}
        strokeDashoffset={PATH_LENGTH * (1 - draw)}
        style={{
          transformOrigin: "32px 32px",
          transform: `scaleY(${1 + pulse})`,
        }}
      />
    </svg>
  );
};

export const Wordmark: React.FC<{ size: number; style?: CSSProperties }> = ({ size, style }) => (
  <span
    style={{
      fontSize: size,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1,
      color: COLORS.fg,
      ...style,
    }}
  >
    Zoned
  </span>
);

export const BrandBar: React.FC<{
  size?: number;
  draw?: number;
  style?: CSSProperties;
}> = ({ size = 62, draw = 1, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.29, ...style }}>
    <PulseMark size={size} draw={draw} />
    <Wordmark size={size * 0.65} />
  </div>
);

/**
 * The house transition: a band of the six zone colours wipes across the frame.
 *
 * Uses the product's own palette as the cut, so the film's punctuation is
 * branded rather than generic. Sparingly — twice in a film at most.
 */
export const ZoneSweep: React.FC<{
  at: number;
  dur?: number;
  /** Thickness of the band as a share of the travel axis. */
  band?: number;
  vertical?: boolean;
}> = ({ at, dur = 26, band = 0.34, vertical = false }) => {
  // An ease-in-out, not the house snap curve: a front-loaded sweep crosses the
  // frame in its first few frames and is gone before the eye finds it.
  const p = useRamp(at, dur, CURVE.swell);
  if (p <= 0 || p >= 1) return null;

  // Travels from fully off one edge to fully off the other.
  const offset = -band + p * (1 + band * 2);
  const axis = vertical ? "180deg" : "90deg";
  // Blended, not banded: the same six stops as the mark's own gradient, so the
  // wipe reads as the logo passing through rather than a colour test card.
  const stops = ZONES.map((z, i) => `${z.hex} ${(i / (ZONES.length - 1)) * 100}%`).join(",");
  const fade = `linear-gradient(${axis}, transparent, black 14%, black 86%, transparent)`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...(vertical
            ? { left: 0, right: 0, top: `${offset * 100}%`, height: `${band * 100}%` }
            : { top: 0, bottom: 0, left: `${offset * 100}%`, width: `${band * 100}%` }),
          backgroundImage: `linear-gradient(${axis}, ${stops})`,
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />
    </AbsoluteFill>
  );
};
