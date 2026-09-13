import type { CSSProperties } from "react";
import { COLORS, useLayout } from "../theme";
import { useCopy } from "../copy";
import { CURVE, beat, useRamp } from "../motion";
import { Counter } from "./Counter";
import { Reveal } from "./Type";
import { STATS } from "../data/facts";

/**
 * The three catalogue counters, read from the app's own data via facts.json.
 * Landscape sets them in a row, vertical in a column.
 */
export const StatTrio: React.FC<{ at?: number; style?: CSSProperties }> = ({
  at = 0,
  style,
}) => {
  const l = useLayout();
  const units = useCopy().stats;

  const items = [
    { to: STATS.workouts, label: units.workouts },
    { to: STATS.plans, label: units.plans },
    { to: STATS.calculators, label: units.calculators },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: l.story ? "column" : "row",
        gap: l.story ? 30 : 44,
        ...style,
      }}
    >
      {items.map((item, i) => (
        <Stat key={item.label} {...item} at={beat(at, i, 9)} />
      ))}
    </div>
  );
};

const Stat: React.FC<{ to: number; label: string; at: number }> = ({ to, label, at }) => {
  const l = useLayout();
  // The rule draws itself before its number arrives, so the eye is led to where
  // the figure is about to land.
  const rule = useRamp(at, 24, CURVE.snap);

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          height: 2,
          background: COLORS.fg,
          transformOrigin: "left center",
          transform: `scaleX(${rule})`,
          marginBottom: l.story ? 20 : 18,
        }}
      />
      <Counter to={to} at={at + 5} dur={32} size={l.story ? 108 : 96} />
      <Reveal at={at + 12} dur={26} style={{ marginTop: 12 }}>
        <span
          style={{
            fontSize: l.story ? 28 : 24,
            fontWeight: 500,
            fontStyle: "italic",
            color: COLORS.accent,
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </span>
      </Reveal>
    </div>
  );
};
