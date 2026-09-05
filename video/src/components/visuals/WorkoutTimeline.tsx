import type { CSSProperties } from "react";
import { COLORS, useLayout, zoneHex, zoneNumberOf } from "../../theme";
import { useCopy } from "../../copy";
import { CURVE, useBreath, useRamp, useTriangle } from "../../motion";
import { WORKOUT } from "../../data/facts";

const TOTAL_SEC = WORKOUT.segments.reduce((s, seg) => s + seg.sec, 0);

/** Where the warm-up ends and the main set begins, in seconds. */
const WARMUP_SEC = 1200;
const COOLDOWN_SEC = 600;

/** The three phases' widths, in percent. Same session in either language. */
const PHASE_SHARES = [
  (WARMUP_SEC / TOTAL_SEC) * 100,
  ((TOTAL_SEC - WARMUP_SEC - COOLDOWN_SEC) / TOTAL_SEC) * 100,
  (COOLDOWN_SEC / TOTAL_SEC) * 100,
];

/** Zone of a block, or null when it declares none. Spans take their upper bound. */
const zoneNumber = (spec: string, declared: boolean): number | null =>
  declared ? zoneNumberOf(spec) : null;

/**
 * Bar height as a share of the track — the app's own rule, from
 * `getHeightPercent` in `src/components/visualization/SessionTimeline.tsx`:
 * Z1 sits at 30 %, each zone adds 14, Z6 reaches 100. Blocks with no declared
 * zone sit at 40.
 *
 * This is the detail that makes the timeline read as the product rather than as
 * a decorative barcode: intensity is height, not just colour.
 */
const heightPercent = (zone: number | null) => (zone === null ? 40 : 30 + (zone - 1) * 14);

/**
 * A real session drawn the way the app draws it: "30/30 classique", warm-up
 * through cool-down, every interval at its true length and its true intensity.
 *
 * The 24 sprint blocks are 30 s each against a 56 minute session, so they read
 * as a comb of tall spikes over a low recovery floor — which is exactly what
 * the workout feels like.
 *
 * Deliberately no playhead and no running clock. Those would tell the story of
 * an interval player, and Zoned has no timer and no in-session guidance — the
 * ribbon breathes and drifts instead, which reads as a document rather than a
 * transport control.
 */
export const WorkoutTimeline: React.FC<{
  at?: number;
  dur?: number;
  /** Grow the block to the height its container offers, within bounds. */
  fill?: boolean;
  style?: CSSProperties;
}> = ({ at = 0, dur = 46, fill = false, style }) => {
  const l = useLayout();
  const names = useCopy().visuals.timeline;
  const phases = [names.warmup, names.main, names.cooldown].map((label, i) => ({
    label,
    share: PHASE_SHARES[i],
  }));
  const sweep = useRamp(at, dur, CURVE.swell);
  const labels = useRamp(at + dur - 12, 22, CURVE.glide);
  const rules = useRamp(at + dur - 10, 30, CURVE.snap);

  // A slow lateral drift and a shallow breath keep the ribbon alive once it has
  // finished drawing. The drift is a triangle, not a sine: for the twelve frames
  // between the act opening and the sweep starting, the empty track is the only
  // thing on screen, and a sine sitting at a turning point there reads as a
  // frozen shot — `bun run qa:motion` caught exactly that on the English cut.
  const driftX = useTriangle(10, 9);
  const swell = useBreath(6.5, 0.008, 1.1);

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
          position: "relative",
          borderRadius: 14,
          overflow: "hidden",
          background: `color-mix(in srgb, ${COLORS.border} 55%, transparent)`,
          // A session reads as a ribbon, so the block stays wider than it is
          // tall — given free rein on a 9:16 canvas it turns into a barcode.
          ...(fill
            ? { flex: 1, minHeight: 220, maxHeight: l.story ? 360 : 470 }
            : { height: l.story ? 320 : 280 }),
          transform: `translateX(${driftX}px) scaleY(${1 + swell})`,
        }}
      >
        {/* The clip sits on this inner layer, not on the track above it. Applied
            to the outer box it hid the empty track too, so the twelve frames
            between the act opening and the sweep starting were a blank canvas —
            a hole, and one with nothing in it moving. The track now holds the
            frame and drifts while the blocks are still uncovering. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            // The sweep is a clip, not an opacity ramp: blocks arrive by being
            // uncovered left to right, the way a session is read.
            clipPath: `inset(0 ${(1 - sweep) * 100}% 0 0)`,
          }}
        >
          {WORKOUT.segments.map((seg, i) => {
            const zone = zoneNumber(seg.zone, seg.declared);
            return (
              <div
                key={i}
                style={{
                  flexGrow: seg.sec,
                  flexBasis: 0,
                  minWidth: 0,
                  height: `${heightPercent(zone)}%`,
                  marginLeft: i > 0 ? 2 : undefined,
                  borderRadius: "4px 4px 0 0",
                  background: zone === null ? COLORS.muted : zoneHex(seg.zone),
                  opacity: seg.role === "recovery" ? 0.7 : 1,
                }}
              />
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 2, marginTop: 16 }}>
        {phases.map((p, i) => {
          // The cool-down band is narrower than its own label, so it is set
          // flush right and allowed to bleed left into the empty middle band
          // rather than being clipped to "Retour au c…".
          const last = i === phases.length - 1;
          return (
            <div key={p.label} style={{ width: `${p.share}%` }}>
              <div
                style={{
                  height: 2,
                  background: COLORS.fg,
                  transformOrigin: last ? "right center" : "left center",
                  transform: `scaleX(${rules})`,
                }}
              />
              <div
                style={{
                  paddingTop: 10,
                  fontSize: l.story ? 22 : 20,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: COLORS.sub,
                  whiteSpace: "nowrap",
                  textAlign: last ? "right" : "left",
                  opacity: labels,
                  transform: `translateY(${(1 - labels) * 10}px)`,
                }}
              >
                {p.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
