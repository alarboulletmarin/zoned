import type { CSSProperties } from "react";
import { COLORS, RADIUS, STROKE, ZONE_CHIP_BG, ZONES, useLayout, zoneInk, zoneText } from "../theme";
import { useLang } from "../lang";
import { CURVE, beat, useBreath, useRamp, useSpring } from "../motion";
import { Reveal } from "./Type";

/** Upper bound of each zone as a share of the widest one, for the bar length. */
const MAX_PCT = 120;
const UPPER_PCT = [60, 75, 85, 92, 100, 120];

const ZoneRow: React.FC<{
  index: number;
  at: number;
  each: number;
  showPace: boolean;
}> = ({ index, at, each, showPace }) => {
  const l = useLayout();
  const z = ZONES[index];
  const text = zoneText(z, useLang());
  const start = beat(at, index, each);

  // The bar lands on a spring; the chip follows a beat later on a stiffer one,
  // so the row arrives in two parts rather than as a block.
  const grow = useSpring(start, { bounce: 0.22, speed: 0.85 });
  const chip = useSpring(start + 3, { bounce: 0.5, speed: 1.2 });
  const paceFade = useRamp(start + 9, 20, CURVE.glide);

  // Each bar keeps a slow independent breath after it lands, phase-shifted down
  // the list so the block ripples instead of pulsing as one.
  const idle = useBreath(4.2 + index * 0.4, 0.012, index * 0.9);

  const barWidth = (UPPER_PCT[index] / MAX_PCT) * 100;

  return (
    <div
      style={{
        position: "relative",
        flex: "1 1 0",
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        gap: l.story ? 24 : 20,
        borderTop: `${STROKE.rule}px solid ${COLORS.border}`,
        ...(index === ZONES.length - 1
          ? { borderBottom: `${STROKE.rule}px solid ${COLORS.border}` }
          : {}),
      }}
    >
      {/* The level behind the text, anchored left.
          ONE surface for all six rows, not the zone's own fill: the row prints
          ink over it, and from Z4 up the fill is dark enough to swallow a name
          whole — the ramp's own rule is that anything printed on it above the
          threshold turns to cream, which a row of body text cannot do halfway
          across its width. What orders the rows here is the LENGTH, which is
          the zone's share of VMA; the ramp itself is carried by the chip. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: `${barWidth}%`,
          borderRadius: RADIUS.lg,
          background: COLORS.band,
          transformOrigin: "left center",
          transform: `scaleX(${grow * (1 + idle)})`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: "0 0 auto",
          width: l.story ? 82 : 72,
          fontSize: l.story ? 27 : 23,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          padding: "8px 0",
          textAlign: "center",
          borderRadius: RADIUS.lg,
          // The chip is the ramp's own rule: its tint from the scale, and the
          // ink that survives on it. Printing the Z-code IN the zone colour was
          // the six-hue idiom; on an ink ramp it prints pale grey on pale grey.
          color: zoneInk(z.n),
          background: ZONE_CHIP_BG[z.n],
          opacity: Math.min(1, chip * 2),
          transform: `scale(${0.7 + chip * 0.3})`,
        }}
      >
        Z{z.n}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal at={start + 2} dur={26}>
          <span
            style={{
              fontSize: l.story ? 42 : 34,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.06,
            }}
          >
            {text.label}
          </span>
        </Reveal>
        <Reveal at={start + 6} dur={26}>
          <span
            style={{
              fontSize: l.story ? 25 : 21,
              color: COLORS.muted,
              lineHeight: 1.2,
            }}
          >
            {text.desc}
          </span>
        </Reveal>
      </div>

      {showPace ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginLeft: "auto",
            fontSize: l.story ? 34 : 28,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
            color: COLORS.fg,
            opacity: paceFade,
            transform: `translateX(${(1 - paceFade) * 18}px)`,
          }}
        >
          {z.pace}
        </div>
      ) : null}
    </div>
  );
};

/**
 * The six zones as a stacked list — the one visual that says "this is a
 * method, not a list of workouts". Rows share the height left over by the
 * parent, so the block fills whatever space it is given in either format.
 *
 * A white sheen used to cross the block on a slow loop, so a panel that had
 * finished animating still had light moving over it. It is gone: a moving gloss
 * is exactly the effect the design system refuses — depth comes from an outline
 * and a hard offset, never from a highlight. The argument it was answering
 * still holds and is still answered, by each bar's own phase-shifted breath,
 * which is what keeps the block out of `qa:motion`'s freeze report.
 */
export const ZoneList: React.FC<{
  at?: number;
  each?: number;
  showPace?: boolean;
  style?: CSSProperties;
}> = ({ at = 0, each = 5, showPace = false, style }) => {
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        ...style,
      }}
    >
      {ZONES.map((z, i) => (
        <ZoneRow key={z.n} index={i} at={at} each={each} showPace={showPace} />
      ))}

    </div>
  );
};
