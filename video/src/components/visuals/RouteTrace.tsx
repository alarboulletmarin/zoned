import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, useLayout } from "../../theme";
import { useCopy } from "../../copy";
import { decimal, useLang } from "../../lang";
import { CURVE, useBreath, useRamp, useSpring } from "../../motion";

const W = 1000;
const H = 620;

/**
 * A closed loop back to the start — the shape the generator's `loop` mode
 * produces. Hand-authored: the real geometry depends on the streets around
 * wherever the runner is standing, so no single trace would be truthful.
 */
const LOOP =
  "M 150 500 C 78 396, 108 250, 232 202 C 344 158, 402 226, 486 194 " +
  "C 604 150, 646 62, 768 92 C 888 122, 926 268, 856 358 " +
  "C 796 436, 668 404, 566 446 C 452 492, 338 570, 246 548 " +
  "C 190 534, 168 528, 150 500 Z";

/** Street grid as a CSS background so it fills the card at any size. */
const GRID_PX = 62;

/**
 * The route generator's output as a trace drawing itself over a street grid.
 *
 * `pathLength={1}` normalises the dash maths, so the reveal is exact without
 * measuring the path in the DOM — which a frame-by-frame renderer cannot do
 * cheaply anyway.
 *
 * A bright head runs at the tip while the line is being laid down, then fades
 * out. It stops on purpose: a marker that kept circling after the route was
 * drawn would suggest live tracking, which Zoned does not do.
 *
 * The distance counts up to whatever that language's `routes` capture says, so
 * this beat and the product beat two seconds later show one route rather than
 * two — the French shot routed 7.7 km and the English one 8.2, both against the
 * 8 km asked for.
 */
export const RouteTrace: React.FC<{
  at?: number;
  dur?: number;
  /** Defaults to the distance in the current language's capture. */
  km?: number;
  style?: CSSProperties;
}> = ({ at = 0, dur = 66, km, style }) => {
  const l = useLayout();
  const lang = useLang();
  const copy = useCopy().visuals.route;
  const distanceKm = km ?? copy.routedKm;
  const frame = useCurrentFrame();

  const draw = useRamp(at, dur, CURVE.swell);
  const grid = useRamp(at, 26, CURVE.glide);
  const pin = useSpring(at + 6, { bounce: 0.5 });
  const pinBeat = useBreath(2.1, 0.14);

  // The card sways slowly so the map never sits perfectly still.
  const swayX = useBreath(12, 6);
  const swayY = useBreath(9, 5, 1.7);

  const distance = interpolate(frame, [at, at + dur], [0, distanceKm], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CURVE.swell,
  });

  // The head is only visible while the line is being laid down.
  const head = interpolate(frame, [at + dur - 16, at + dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 20, minHeight: 0, ...style }}
    >
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          borderRadius: 20,
          overflow: "hidden",
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          backgroundImage: [
            `linear-gradient(${COLORS.border} 2px, transparent 2px)`,
            `linear-gradient(90deg, ${COLORS.border} 2px, transparent 2px)`,
          ].join(","),
          backgroundSize: `${GRID_PX}px ${GRID_PX}px, ${GRID_PX}px ${GRID_PX}px`,
          backgroundPosition: `${swayX}px ${swayY}px`,
          opacity: 0.4 + grid * 0.6,
          transform: `translate(${swayX * 0.4}px, ${swayY * 0.4}px)`,
        }}
      >
        {/* `meet` keeps the loop inside the card whichever way the card is
            constrained — width-bound in a vertical cut, height-bound in a
            landscape one, where sizing by width overflowed the canvas. */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <path
            d={LOOP}
            pathLength={1}
            fill="none"
            stroke={COLORS.accent}
            strokeOpacity={0.16}
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d={LOOP}
            pathLength={1}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={1 - draw}
          />
          {/* Glowing tip: a short dash chasing the end of the drawn length. */}
          <path
            d={LOOP}
            pathLength={1}
            fill="none"
            stroke="#ffffff"
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray="0.012 0.988"
            strokeDashoffset={1 - draw}
            opacity={head * 0.85}
          />

          <circle
            cx={150}
            cy={500}
            r={16 * pin * (1 + pinBeat)}
            fill={COLORS.panel}
            stroke={COLORS.fg}
            strokeWidth={6}
          />
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span
          style={{
            fontSize: l.story ? 76 : 64,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {decimal(distance, 1, lang)}
        </span>
        <span
          style={{
            fontSize: l.story ? 34 : 30,
            fontWeight: 500,
            fontStyle: "italic",
            color: COLORS.accent,
          }}
        >
          {copy.kilometre}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: l.story ? 26 : 23,
            fontWeight: 600,
            color: COLORS.muted,
          }}
        >
          {copy.shape}
        </span>
      </div>
    </div>
  );
};
