import type { CSSProperties } from "react";
import { COLORS, ZONES, useLayout } from "../../theme";
import { modelBounds, useCopy } from "../../copy";
import { useFacts } from "../../data/facts";
import { useLang } from "../../lang";
import { CURVE, useRamp, useSpring, useTriangle } from "../../motion";
import { Reveal } from "../Type";
import { POLARISED } from "../../data/facts";

/**
 * The polarised model, as Zoned documents it.
 *
 * Read the long comment in `scripts/sync-data.ts` before touching this: the
 * generator does NOT enforce an intensity split — `hardFraction` and
 * `POLARIZED_EASY_MIN_FRACTION` are declared and never used, and a real
 * generated plan measures around 77 % Z1-Z2, 18 % Z3 and 5 % Z4+, which is
 * pyramidal rather than polarised.
 *
 * So this block shows the *principle* — Seiler's model, the threshold the app's
 * own constants encode — and never says "your plan looks like this". The label
 * says "modèle", which is the whole difference between a claim and a lie.
 */
export const PolarModel: React.FC<{
  at?: number;
  style?: CSSProperties;
}> = ({ at = 0, style }) => {
  const l = useLayout();
  const lang = useLang();
  const copy = useCopy().visuals.polar;
  const bounds = modelBounds(useFacts(), lang);
  // Bar proportions are the model's shape; the figures below are the app's own
  // two constants. The headline calls it 80/20 because that is the model's
  // common name — the bounds are what the code actually holds, and the two must
  // never contradict each other on screen.
  const easyBand = POLARISED.model.easyMinPct;
  const middleBand = 5;
  const hardBand = 100 - easyBand - middleBand;

  const grow = useRamp(at, 34, CURVE.glide);
  const split = useSpring(at + 14, { bounce: 0.28, speed: 0.9 });
  // Triangles with visible amplitude: at 0.01 on a sine the bands were
  // technically moving and still read as a frozen frame, both to the eye and to
  // `bun run qa:motion`.
  const pulseEasy = useTriangle(5, 0.035);
  const pulseHard = useTriangle(3.6, 0.05, 0.4);
  // Those two alone were still not enough in the vertical cut: 3.5 % of a 128 px
  // band is four pixels of travel spread over five seconds, under the detector's
  // noise floor once everything else had landed. The whole block now drifts as
  // well, the way `AdjustDial` does — pixels of travel rather than percent of a
  // short bar, which is what actually keeps a settled panel alive.
  const floatX = useTriangle(6, 9);
  const floatY = useTriangle(8.5, 6, 0.35);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: l.story ? 34 : 28,
        minHeight: 0,
        ...style,
        // After the spread on purpose: a caller's `style` must not silently drop
        // the drift, which is the only thing keeping this panel out of
        // `qa:motion`'s freeze report once it has settled.
        transform: `translate(${floatX}px, ${floatY}px)`,
      }}
    >
      {/* The bar: easy, the thin middle to avoid, and the hard end. */}
      <div
        style={{
          display: "flex",
          gap: 6,
          height: l.story ? 128 : 108,
          transformOrigin: "left center",
          transform: `scaleX(${grow})`,
        }}
      >
        <Band
          share={easyBand}
          color={ZONES[1].hex}
          label={copy.easy}
          detail={copy.easyRange}
          swell={pulseEasy}
        />
        <Band share={middleBand} color={ZONES[2].hex} label="" detail="" swell={0} faded />
        <Band
          share={hardBand}
          color={ZONES[4].hex}
          label={copy.hard}
          detail={copy.hardRange}
          swell={pulseHard}
        />
      </div>

      <div style={{ display: "flex", gap: l.story ? 20 : 28 }}>
        <Figure
          value={bounds.easy}
          caption={copy.easyCaption}
          color={ZONES[1].hex}
          p={split}
        />
        <Figure
          value={bounds.hard}
          caption={copy.hardCaption}
          color={ZONES[4].hex}
          p={split}
          delay
        />
      </div>

      <Reveal at={at + 34} dur={28}>
        <span style={{ fontSize: l.body, fontWeight: 600, color: COLORS.muted }}>
          {copy.footer}
        </span>
      </Reveal>
    </div>
  );
};

const Band: React.FC<{
  share: number;
  color: string;
  label: string;
  detail: string;
  swell: number;
  faded?: boolean;
}> = ({ share, color, label, detail, swell, faded = false }) => {
  const l = useLayout();
  return (
    <div
      style={{
        width: `${share}%`,
        borderRadius: 12,
        background: color,
        opacity: faded ? 0.18 : 1,
        transform: `scaleY(${1 + swell})`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `0 ${l.story ? 22 : 20}px`,
        color: "#ffffff",
        overflow: "hidden",
      }}
    >
      {label ? (
        <>
          <span
            style={{
              fontSize: l.story ? 34 : 30,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: l.story ? 21 : 19, fontWeight: 500, opacity: 0.85 }}>
            {detail}
          </span>
        </>
      ) : null}
    </div>
  );
};

const Figure: React.FC<{
  value: string;
  caption: string;
  color: string;
  p: number;
  delay?: boolean;
}> = ({ value, caption, color, p, delay = false }) => {
  const l = useLayout();
  const k = delay ? Math.max(0, p * 1.25 - 0.25) : p;

  return (
    <div
      style={{
        flex: 1,
        opacity: Math.min(1, k * 2),
        transform: `translateY(${(1 - k) * 20}px)`,
        borderTop: `2px solid ${color}`,
        paddingTop: l.story ? 18 : 16,
      }}
    >
      <div
        style={{
          fontSize: l.story ? 72 : 64,
          fontWeight: 700,
          letterSpacing: "-0.045em",
          color,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 8, fontSize: l.body, fontWeight: 500, color: COLORS.muted }}>
        {caption}
      </div>
    </div>
  );
};
