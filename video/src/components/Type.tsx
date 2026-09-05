import type { CSSProperties, ReactNode } from "react";
import { COLORS, useLayout } from "../theme";
import { beat, useBreath, useEnter, useMask } from "../motion";

/**
 * Typographic primitives.
 *
 * House rules carried over from the still stories: no full stop on a title, no
 * em dashes, nothing under 25 px of body text — a vertical cut is read on a
 * 360 px wide phone.
 *
 * The motion rule is new and matters more: type is never faded in place. Each
 * line is clipped by its own box and slides up from behind its baseline, so the
 * words arrive rather than appear.
 */

/** One clipped line. The mask is the parent; the moving part is the child. */
export const Reveal: React.FC<{
  children: ReactNode;
  at?: number;
  dur?: number;
  skew?: number;
  style?: CSSProperties;
}> = ({ children, at = 0, dur = 30, skew = 0, style }) => {
  const inner = useMask(at, { dur, skew });
  return (
    <span
      style={{
        display: "block",
        overflow: "hidden",
        // Descenders and accents would be clipped by the mask otherwise; the
        // negative margin gives the box room without changing the layout.
        paddingBottom: "0.16em",
        marginBottom: "-0.16em",
        ...style,
      }}
    >
      <span style={inner}>{children}</span>
    </span>
  );
};

/**
 * A headline, written as lines rather than a paragraph.
 *
 * Forcing the caller to break the lines is the point: it keeps titles to two or
 * three, and it is what makes the staggered mask reveal possible at all.
 */
export const Headline: React.FC<{
  lines: ReactNode[];
  at?: number;
  each?: number;
  size?: number;
  style?: CSSProperties;
}> = ({ lines, at = 0, each = 6, size, style }) => {
  const l = useLayout();
  return (
    <div
      style={{
        fontSize: size ?? l.head,
        fontWeight: 700,
        lineHeight: 1.0,
        letterSpacing: "-0.042em",
        ...style,
      }}
    >
      {lines.map((line, i) => (
        <Reveal key={i} at={beat(at, i, each)} dur={32} skew={1.4}>
          {line}
        </Reveal>
      ))}
    </div>
  );
};

/** Accented, obliqued fragment inside a headline. */
export const Em: React.FC<{ children: ReactNode; color?: string }> = ({
  children,
  color = COLORS.accent,
}) => (
  <span style={{ fontStyle: "italic", fontWeight: 500, color }}>{children}</span>
);

export const Sub: React.FC<{
  children: ReactNode;
  at?: number;
  style?: CSSProperties;
}> = ({ children, at = 0, style }) => {
  const l = useLayout();
  const enter = useEnter(at, { dur: 30, y: 26, blur: 6 });
  return (
    <div
      style={{
        fontSize: l.sub,
        fontWeight: 400,
        lineHeight: 1.28,
        color: COLORS.sub,
        maxWidth: "26ch",
        ...enter,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Section label as a hairline pill with a live dot.
 *
 * The dot never stops breathing, which means even an act that is only type has
 * something moving in it.
 */
export const Eyebrow: React.FC<{
  children: ReactNode;
  at?: number;
  color?: string;
  style?: CSSProperties;
}> = ({ children, at = 0, color = COLORS.accent, style }) => {
  const l = useLayout();
  const enter = useEnter(at, { dur: 22, y: 14, blur: 4, x: -10 });
  const beatDot = useBreath(1.9, 0.32);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: l.story ? 12 : 10,
        padding: l.story ? "9px 20px 9px 16px" : "8px 18px 8px 14px",
        borderRadius: 999,
        border: `1px solid ${color}2e`,
        background: `${color}12`,
        fontSize: l.eyebrow,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        alignSelf: "flex-start",
        ...enter,
        ...style,
      }}
    >
      <span
        style={{
          width: l.story ? 9 : 8,
          height: l.story ? 9 : 8,
          borderRadius: 999,
          background: color,
          transform: `scale(${1 + beatDot})`,
          opacity: 0.75 + beatDot * 0.6,
        }}
      />
      {children}
    </div>
  );
};

/** Muted variant, used above lists and panels. */
export const PanelLabel: React.FC<{
  children: ReactNode;
  at?: number;
  style?: CSSProperties;
}> = ({ children, at = 0, style }) => (
  <Eyebrow at={at} color={COLORS.muted} style={style}>
    {children}
  </Eyebrow>
);
