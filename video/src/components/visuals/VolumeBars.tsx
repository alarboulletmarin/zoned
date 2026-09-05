import type { CSSProperties } from "react";
import { COLORS, PHASE_COLORS, useLayout } from "../../theme";
import { CURVE, beat, useBreath, useRamp, useSpring } from "../../motion";
import { PLAN } from "../../data/facts";

const PEAK = PLAN.peakKm;

/**
 * Weekly volume of a real 15-week marathon plan.
 *
 * Every bar is `targetKm` straight out of `src/lib/planGenerator` — which is
 * why the recovery weeks dip at 4, 8 and 12 and the last three taper. Drawing a
 * smooth ramp would have been prettier and would have promised the wrong thing.
 *
 * Bars land on springs, left to right, then keep an independent breath. The
 * peak weeks pulse on the accent so the eye is told where the plan tops out
 * without a label having to say it.
 */
export const VolumeBars: React.FC<{
  at?: number;
  each?: number;
  style?: CSSProperties;
}> = ({ at = 0, each = 3, style }) => {
  const l = useLayout();
  const rule = useRamp(at + 12, 30, CURVE.snap);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: 0,
        ...style,
      }}
    >
      <div
        style={{
          // Capped: given the full height of a 9:16 canvas the bars stretch into
          // 1400 px needles, which reads as a glitch rather than a chart.
          flex: 1,
          maxHeight: l.story ? 840 : 560,
          display: "flex",
          alignItems: "flex-end",
          gap: l.story ? 9 : 11,
          minHeight: 0,
        }}
      >
        {PLAN.weeks.map((w, i) => (
          <Bar key={w.n} week={w} at={beat(at, i, each)} index={i} />
        ))}
      </div>

      <div
        style={{
          height: 1,
          background: COLORS.border,
          transformOrigin: "left center",
          transform: `scaleX(${rule})`,
          marginTop: 14,
        }}
      />

      <div style={{ display: "flex", gap: l.story ? 9 : 11, paddingTop: 12 }}>
        {PLAN.weeks.map((w, i) => (
          <WeekNumber key={w.n} week={w} at={beat(at, i, each) + 8} />
        ))}
      </div>
    </div>
  );
};

const Bar: React.FC<{
  week: (typeof PLAN.weeks)[number];
  at: number;
  index: number;
}> = ({ week, at, index }) => {
  const l = useLayout();
  const grow = useSpring(at, { bounce: 0.3, speed: 0.9 });
  const label = useRamp(at + 8, 18, CURVE.glide);
  const idle = useBreath(3.6 + (index % 5) * 0.35, 0.018, index * 0.8);
  const isPeak = week.km === PEAK;
  const peakGlow = useBreath(2.4, 0.5, index) * 0.5 + 0.5;

  const hex = PHASE_COLORS[week.phase] ?? COLORS.faint;

  return (
    <div
      style={{
        flex: 1,
        height: `${(week.km / PEAK) * 100}%`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: l.story ? 19 : 17,
          fontWeight: 600,
          textAlign: "center",
          marginBottom: 8,
          color: week.recovery ? COLORS.muted : COLORS.fg,
          fontVariantNumeric: "tabular-nums",
          opacity: label,
          transform: `translateY(${(1 - label) * 8}px)`,
        }}
      >
        {week.km}
      </div>
      <div
        style={{
          height: "100%",
          borderRadius: "7px 7px 3px 3px",
          background: hex,
          // Recovery weeks read as a deliberate step back, not a smaller week.
          opacity: week.recovery ? 0.34 : 1,
          transformOrigin: "bottom center",
          transform: `scaleY(${grow * (1 + idle)})`,
          boxShadow: isPeak
            ? `0 0 ${18 + peakGlow * 22}px ${COLORS.accent}${peakGlow > 0.5 ? "66" : "33"}`
            : undefined,
        }}
      />
    </div>
  );
};

const WeekNumber: React.FC<{ week: (typeof PLAN.weeks)[number]; at: number }> = ({ week, at }) => {
  const l = useLayout();
  const p = useRamp(at, 16, CURVE.glide);
  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: l.story ? 18 : 16,
        fontWeight: 500,
        color: week.recovery ? COLORS.accent : COLORS.faint,
        fontVariantNumeric: "tabular-nums",
        opacity: p,
      }}
    >
      {week.n}
    </div>
  );
};
