import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, useLayout } from "../theme";
import { CURVE, useSpring } from "../motion";
import { Reveal } from "./Type";

/**
 * A number that climbs to its value and lands with weight.
 *
 * Two motions compose: the digits count on a long-tailed curve, and the block
 * itself arrives on a spring that overshoots slightly before settling. The
 * overshoot is on the scale, never on the value — a counter that runs past 256
 * and comes back reads as a bug, not as physics.
 *
 * Tabular figures are mandatory: proportional digits make the number jitter
 * sideways while it climbs.
 */
export const Counter: React.FC<{
  to: number;
  at?: number;
  dur?: number;
  from?: number;
  size?: number;
  style?: CSSProperties;
}> = ({ to, at = 0, dur = 36, from = 0, size, style }) => {
  const l = useLayout();
  const frame = useCurrentFrame();
  const land = useSpring(at, { bounce: 0.42 });

  const value = interpolate(frame, [at, at + dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CURVE.glide,
  });

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: size ?? l.num,
        fontWeight: 700,
        lineHeight: 0.82,
        letterSpacing: "-0.055em",
        fontVariantNumeric: "tabular-nums",
        transform: `scale(${0.82 + land * 0.18})`,
        transformOrigin: "left bottom",
        opacity: Math.min(1, land * 2),
        ...style,
      }}
    >
      {Math.round(value)}
    </span>
  );
};

/** Counter plus its italic unit, the layout used on every stat beat. */
export const CountRow: React.FC<{
  to: number;
  unit: string;
  at?: number;
  dur?: number;
  size?: number;
  unitSize?: number;
}> = ({ to, unit, at = 0, dur = 36, size, unitSize }) => {
  const l = useLayout();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
      <Counter to={to} at={at} dur={dur} size={size} />
      <Reveal at={at + 10} dur={26}>
        <span
          style={{
            fontSize: unitSize ?? l.unit,
            fontWeight: 500,
            fontStyle: "italic",
            color: COLORS.accent,
            letterSpacing: "-0.02em",
          }}
        >
          {unit}
        </span>
      </Reveal>
    </div>
  );
};
