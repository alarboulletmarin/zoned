import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, useLayout } from "../../theme";
import { useCopy } from "../../copy";
import { CURVE, useBreath, useRamp, useSpring } from "../../motion";
import { Reveal } from "../Type";
import { RACE } from "../../data/facts";

const PACES = RACE.splits.map((s) => s.pace);
const MIN = Math.min(...PACES);
const MAX = Math.max(...PACES);

const formatPace = (minPerKm: number) => {
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return s === 60 ? `${m + 1}:00` : `${m}:${String(s).padStart(2, "0")}`;
};

/**
 * The km-by-km pacing of a real 1 h 45 half, negative split.
 *
 * One bar per split, not a line: discrete bars say "kilometre by kilometre" at
 * a glance, where a continuous ramp reads as an elevation profile.
 *
 * The scale is zoomed to the actual spread — twelve seconds across the whole
 * race — so both ends carry their true pace. A 0-based axis would show a flat
 * comb and say nothing; an unlabelled zoomed one would overstate the effect.
 */
export const SplitLadder: React.FC<{
  at?: number;
  dur?: number;
  /** Grow the bars to the height their container offers, within bounds. */
  fill?: boolean;
  style?: CSSProperties;
}> = ({ at = 0, dur = 56, fill = false, style }) => {
  const l = useLayout();
  const copy = useCopy().visuals.splits;
  const frame = useCurrentFrame();
  const ends = useRamp(at + dur - 14, 24, CURVE.glide);
  const axis = useRamp(at, 26, CURVE.snap);

  // Cumulative clock, rounded to the split the sweep has reached.
  const reached = Math.min(
    RACE.splits.length - 1,
    Math.floor(
      interpolate(frame, [at, at + dur], [0, RACE.splits.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: CURVE.swell,
      }),
    ),
  );

  const each = dur / RACE.splits.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 18,
        minHeight: 0,
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: l.story ? 25 : 22, fontWeight: 600, color: COLORS.muted }}>
          {copy.km} {RACE.splits[reached].km}
        </div>
        <div
          style={{
            fontSize: l.story ? 50 : 44,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {RACE.splits[reached].cumulative}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: l.story ? 7 : 8,
          ...(fill
            ? { flex: 1, minHeight: 240, maxHeight: l.story ? 700 : 520 }
            : { height: l.story ? 320 : 300 }),
        }}
      >
        {RACE.splits.map((s, i) => (
          <SplitBar key={s.km} pace={s.pace} at={at + i * each} index={i} />
        ))}
      </div>

      <div
        style={{
          height: 2,
          background: COLORS.fg,
          transformOrigin: "left center",
          transform: `scaleX(${axis})`,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: l.story ? 27 : 24,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          opacity: ends,
        }}
      >
        <Reveal at={at + dur - 14} dur={24}>
          <span style={{ color: COLORS.muted }}>
            {copy.km} 1 · {formatPace(MAX)}/km
          </span>
        </Reveal>
        <Reveal at={at + dur - 10} dur={24}>
          <span style={{ color: COLORS.accent }}>
            {copy.finish} · {formatPace(MIN)}/km
          </span>
        </Reveal>
      </div>
    </div>
  );
};

/**
 * Bar height maps the zoomed pace range onto 22 % – 100 %, so the slowest
 * kilometre is still a bar rather than a stub.
 *
 * After landing, a shallow wave runs along the row — enough that the block
 * shimmers rather than sits, not enough to be read as a value changing.
 */
const SplitBar: React.FC<{ pace: number; at: number; index: number }> = ({ pace, at, index }) => {
  const grow = useSpring(at, { bounce: 0.34, speed: 1.15 });
  const wave = useBreath(3.4, 0.016, index * 0.42);
  const share = 0.22 + ((MAX - pace) / (MAX - MIN)) * 0.78;

  return (
    <div
      style={{
        flex: 1,
        height: `${share * 100}%`,
        minWidth: 0,
        borderRadius: "5px 5px 0 0",
        background: COLORS.accent,
        transformOrigin: "bottom center",
        transform: `scaleY(${grow * (1 + wave)})`,
      }}
    />
  );
};
