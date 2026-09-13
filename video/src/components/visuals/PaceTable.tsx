import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { card, COLORS, RADIUS, STROKE, useLayout } from "../../theme";
import { useCopy } from "../../copy";
import { decimal, useLang } from "../../lang";
import { CURVE, useBreath, useSpring } from "../../motion";
import { ZoneList } from "../ZoneList";

/**
 * One number in, six paces out.
 *
 * The paces are `calculatePaceZones(16)` from src/lib/zones.ts, baked into the
 * zone tokens — the same function the calculator page runs.
 *
 * The field lands first and keeps a faint glow, then the table cascades out of
 * it: cause visibly before effect.
 */
export const PaceTable: React.FC<{
  at?: number;
  vma?: number;
  style?: CSSProperties;
}> = ({ at = 0, vma = 16, style }) => {
  const l = useLayout();
  const lang = useLang();
  const copy = useCopy().visuals.pace;
  const frame = useCurrentFrame();

  const land = useSpring(at, { bounce: 0.42 });
  const glow = useBreath(3.1, 0.5) * 0.5 + 0.5;

  const value = interpolate(frame, [at + 4, at + 30], [0, vma], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CURVE.glide,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      <div
        style={{
          opacity: Math.min(1, land * 2),
          transform: `translateY(${(1 - land) * 26}px) scale(${0.92 + land * 0.08})`,
          display: "flex",
          alignItems: "center",
          gap: l.story ? 24 : 20,
          padding: l.story ? "22px 28px" : "18px 24px",
          ...card(RADIUS.xl),
          // The retained frame: 2.5px of accent is the app's own mark for
          // "this is the one you kept", and it replaces a glow the system has
          // no room for.
          border: `${STROKE.heavy}px solid ${COLORS.accent}`,
          boxShadow: `${6 + glow * 4}px ${6 + glow * 4}px 0 ${COLORS.accent}1f`,
          marginBottom: l.story ? 40 : 32,
          alignSelf: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: l.eyebrow,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: COLORS.muted,
          }}
        >
          {copy.field}
        </span>
        <span
          style={{
            fontSize: l.story ? 62 : 54,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {decimal(value, 1, lang)}
        </span>
        <span
          style={{
            fontSize: l.story ? 30 : 27,
            fontWeight: 500,
            fontStyle: "italic",
            color: COLORS.accent,
          }}
        >
          {copy.unit}
        </span>
      </div>

      <ZoneList at={at + 24} each={5} showPace />
    </div>
  );
};
