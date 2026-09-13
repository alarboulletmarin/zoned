import type { CSSProperties } from "react";
import { interpolate } from "remotion";
import { COLORS, useLayout } from "../../theme";
import { useCopy } from "../../copy";
import { CURVE, useBreath, useRamp, useSpring, useTriangle } from "../../motion";
import { Reveal } from "../Type";
import { ADJUST } from "../../data/facts";

/**
 * A catalogue session being turned down, and the session recomputing.
 *
 * Both durations come from the same block tree as the timeline — 12 repetitions
 * is 56 minutes, 8 is 48 — so the number that lands is arithmetic, not a
 * flourish. The slider travels across the range the workout itself declares
 * (`scaling.minValue` to `scaling.maxValue`).
 */
export const AdjustDial: React.FC<{
  at?: number;
  style?: CSSProperties;
}> = ({ at = 0, style }) => {
  const l = useLayout();
  const copy = useCopy().visuals.adjust;
  const enter = useSpring(at, { bounce: 0.3, speed: 0.95 });
  // The drag holds a beat on 12 before pulling down to 8.
  const drag = useRamp(at + 22, 34, CURVE.glide);
  const reps = Math.round(
    interpolate(drag, [0, 1], [ADJUST.defaultReps, ADJUST.adjustedReps]),
  );
  const minutes = Math.round(interpolate(drag, [0, 1], [ADJUST.defaultMin, ADJUST.adjustedMin]));

  const span = ADJUST.maxReps - ADJUST.minReps;
  const handlePct = ((reps - ADJUST.minReps) / span) * 100;
  const grip = useBreath(2.6, 0.09);
  // Triangles, not sines: the panel is the only thing left moving once the drag
  // has settled, and a sine's turning points made its velocity drop under a
  // pixel per frame — visually and to `bun run qa:motion`, a frozen shot.
  const floatY = useTriangle(5, 11);
  const floatX = useTriangle(7, 7, 0.3);

  const settled = useRamp(at + 54, 26, CURVE.glide);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: l.story ? 34 : 28,
        minHeight: 0,
        // Left to the full width of a landscape frame the control stretches into
        // a 1700 px strip with its handle marooned at one end.
        maxWidth: l.story ? "100%" : 1020,
        ...style,
      }}
    >
      <div
        style={{
          opacity: Math.min(1, enter * 2),
          transform: `translate(${floatX}px, ${(1 - enter) * 26 + floatY}px)`,
          padding: l.story ? "30px 32px" : "26px 30px",
          borderRadius: 20,
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 30px 60px -34px rgba(15,23,42,0.28)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: l.body, fontWeight: 600, color: COLORS.muted }}>
            {copy.repsLabel}
          </span>
          <span
            style={{
              fontSize: l.story ? 62 : 54,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: COLORS.accent,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {reps}
          </span>
        </div>

        <div
          style={{
            position: "relative",
            height: 10,
            marginTop: l.story ? 26 : 22,
            borderRadius: 999,
            background: COLORS.border,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${handlePct}%`,
              borderRadius: 999,
              background: COLORS.accent,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${handlePct}%`,
              width: l.story ? 40 : 36,
              height: l.story ? 40 : 36,
              marginLeft: l.story ? -20 : -18,
              marginTop: l.story ? -20 : -18,
              borderRadius: 999,
              background: COLORS.panel,
              border: `5px solid ${COLORS.accent}`,
              transform: `scale(${1 + grip})`,
              boxShadow: `0 0 0 ${8 + grip * 60}px ${COLORS.accent}14`,
            }}
          />
        </div>
      </div>

      {/* The consequence, in the session's own units. */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <span
          style={{
            fontSize: l.story ? 26 : 24,
            fontWeight: 600,
            color: COLORS.muted,
            textDecoration: "line-through",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {ADJUST.defaultMin} {copy.minute}
        </span>
        <span
          style={{
            fontSize: l.story ? 84 : 74,
            fontWeight: 700,
            letterSpacing: "-0.045em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {minutes}
        </span>
        <span
          style={{
            fontSize: l.story ? 34 : 30,
            fontWeight: 500,
            fontStyle: "italic",
            color: COLORS.accent,
          }}
        >
          {copy.minute}
        </span>
      </div>

      <div style={{ opacity: settled }}>
        <Reveal at={at + 54} dur={28}>
          <span style={{ fontSize: l.body, fontWeight: 600, color: COLORS.sub }}>
            {copy.footer}
          </span>
        </Reveal>
      </div>
    </div>
  );
};

export const ADJUST_META = ADJUST;
