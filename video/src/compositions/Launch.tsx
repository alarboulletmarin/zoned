/**
 * Launch: the frontier-model keynote treatment, applied with a straight face to
 * a free training library.
 *
 * The genre's grammar, kept on purpose: a quiet paper ground, one sentence at a
 * time, words that resolve out of a blur, a benchmark chart, a section called
 * Safety, a black card before the name, and two impacts. The joke is that every
 * claim is true and none of it is inflated: the counts are measured
 * (`scripts/site-stats.ts`, `src/data/science/data.ts`), the competitor is a
 * couch, and the footnotes say so.
 *
 * Square, 1080 x 1080, English. There is no French cut yet because the app
 * screenshots it shows are the English ones in `../assets/`; a French cut
 * showing English screens is the defect the README warns about.
 *
 * The cue sheet lives in `launch-cues.ts`, shared with the score.
 */

import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLORS, displayFamily, monoFamily, sec, ZONE_HEIGHT, ZONES } from "../theme";
import { CURVE, useRamp, useSpring } from "../motion";
import { LAUNCH_CUES as C, LAUNCH_SECONDS } from "./launch-cues";

export const LAUNCH_FRAMES = sec(LAUNCH_SECONDS);

/**
 * Measured on 2026-11-26. `scripts/site-stats.ts` for the catalogue, and the
 * `year:` entries of `src/data/science/data.ts` for the publications. Re-measure
 * rather than edit by hand when the catalogue moves.
 */
const MEASURED = { sessions: 267, plans: 10, calculators: 6, publications: 23 };

const INK = COLORS.fg;
const PAPER = COLORS.bg;
const ACCENT = COLORS.accent;

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * A scene: fades in, fades out, and pushes in slowly and linearly the whole
 * time it is on screen, so no frame of the film is ever a still.
 */
const Scene: React.FC<{
  from: number;
  to: number;
  children: ReactNode;
  bg?: string;
  fadeIn?: number;
  fadeOut?: number;
  push?: number;
}> = ({ from, to, children, bg, fadeIn = 0.5, fadeOut = 0.45, push = 0.035 }) => {
  const start = sec(from);
  const dur = sec(to) - start;
  return (
    <Sequence from={start} durationInFrames={dur}>
      <SceneBody dur={dur} bg={bg} fadeIn={sec(fadeIn)} fadeOut={sec(fadeOut)} push={push}>
        {children}
      </SceneBody>
    </Sequence>
  );
};

const SceneBody: React.FC<{
  dur: number;
  bg?: string;
  fadeIn: number;
  fadeOut: number;
  push: number;
  children: ReactNode;
}> = ({ dur, bg, fadeIn, fadeOut, push, children }) => {
  const f = useCurrentFrame();
  const opacity = Math.min(
    fadeIn === 0 ? 1 : interpolate(f, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" }),
    fadeOut === 0 ? 1 : interpolate(f, [dur - fadeOut, dur], [1, 0], { extrapolateLeft: "clamp" }),
  );
  const scale = 1 + push * (f / dur);
  return (
    <AbsoluteFill style={{ background: bg, opacity }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 96,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * A line that resolves word by word: each word arrives out of a blur, a few
 * pixels low, and settles. Slow on purpose.
 */
const Words: React.FC<{
  text: string;
  at?: number;
  each?: number;
  style?: CSSProperties;
  color?: string;
}> = ({ text, at = 0, each = 0.11, style, color }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", ...style }}>
    {text.split(" ").map((w, i) => (
      <Word key={i} at={sec(at + i * each)} color={color}>
        {w}
      </Word>
    ))}
  </div>
);

const Word: React.FC<{ at: number; children: ReactNode; color?: string }> = ({
  at,
  children,
  color,
}) => {
  const p = useRamp(at, sec(1.1), CURVE.lift);
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: "0.24em",
        opacity: p,
        filter: `blur(${(1 - p) * 10}px)`,
        transform: `translateY(${(1 - p) * 16}px)`,
        color,
      }}
    >
      {children}
    </span>
  );
};

const headline = (size: number, weight = 500): CSSProperties => ({
  fontFamily: displayFamily,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: "-0.035em",
  lineHeight: 1.06,
  textAlign: "center",
  color: INK,
});

const Eyebrow: React.FC<{ children: ReactNode; at?: number; color?: string }> = ({
  children,
  at = 0,
  color = COLORS.muted,
}) => {
  const p = useRamp(sec(at), sec(0.9));
  return (
    <div
      style={{
        fontFamily: monoFamily,
        fontSize: 22,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        opacity: p,
      }}
    >
      {children}
    </div>
  );
};

/** The fine print, bottom left, where the genre keeps its honesty. */
const Footnote: React.FC<{ children: ReactNode; at: number }> = ({ children, at }) => {
  const p = useRamp(sec(at), sec(0.8));
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        bottom: 54,
        fontFamily: monoFamily,
        fontSize: 19,
        lineHeight: 1.45,
        color: COLORS.muted,
        opacity: p,
      }}
    >
      {children}
    </div>
  );
};

const Wordmark: React.FC<{ size: number; color?: string }> = ({ size, color = INK }) => (
  <span
    style={{
      fontFamily: displayFamily,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: "-0.04em",
      lineHeight: 1,
      color,
    }}
  >
    zoned<span style={{ color: ACCENT }}>.</span>
  </span>
);

const Column: React.FC<{ children: ReactNode; gap?: number; style?: CSSProperties }> = ({
  children,
  gap = 36,
  style,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap,
      width: "100%",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const Counter: React.FC<{ value: number; label: string; at: number }> = ({ value, label, at }) => {
  const f = useCurrentFrame();
  const p = useRamp(sec(at), sec(1.8), CURVE.glide);
  const s = useSpring(sec(at), { bounce: 0.2 });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 24}px)`,
        width: 270,
      }}
    >
      <div
        style={{
          fontFamily: displayFamily,
          fontSize: 132,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          // A hair of drift after landing, so the hold is not a freeze.
          transform: `translateY(${Math.sin(f / 40) * 2}px)`,
        }}
      >
        {Math.round(value * p)}
      </div>
      <div
        style={{
          fontFamily: monoFamily,
          fontSize: 20,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const ZoneBar: React.FC<{ i: number; at: number }> = ({ i, at }) => {
  const z = ZONES[i];
  const f = useCurrentFrame();
  const s = useSpring(sec(at + i * 0.18), { bounce: 0.25 });
  const h = 330 * ZONE_HEIGHT[z.n] * s * (1 + 0.025 * Math.sin(f / 18 + i));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ height: 340, display: "flex", alignItems: "flex-end" }}>
        <div
          style={{
            width: 104,
            height: h,
            background: z.hex,
            border: `1.5px solid ${INK}`,
            borderRadius: 10,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: monoFamily,
          fontSize: 22,
          fontWeight: 700,
          opacity: s,
        }}
      >
        Z{z.n}
      </div>
      <div style={{ fontSize: 17, color: COLORS.muted, opacity: s, height: 20 }}>{z.labelEn}</div>
    </div>
  );
};

type Bench = {
  label: string;
  note?: string;
  zoned: number;
  couch: number;
  max: number;
  fmt: (n: number) => string;
  verdict?: string;
};

const BENCHES: Bench[] = [
  {
    label: "Structured sessions",
    zoned: MEASURED.sessions,
    couch: 0,
    max: MEASURED.sessions,
    fmt: (n) => String(Math.round(n)),
  },
  {
    label: "Peer-reviewed publications cited",
    zoned: MEASURED.publications,
    couch: 0,
    max: MEASURED.publications,
    fmt: (n) => String(Math.round(n)),
  },
  {
    label: "Price",
    note: "lower is better",
    zoned: 0,
    couch: 0,
    max: 1,
    fmt: (n) => `$${Math.round(n)}`,
    verdict: "Tie. Under investigation.",
  },
];

const BenchRow: React.FC<{ b: Bench; at: number }> = ({ b, at }) => {
  const enter = useRamp(sec(at), sec(0.7));
  const grow = useRamp(sec(at + 0.4), sec(1.6), CURVE.glide);
  const verdict = useRamp(sec(at + 1.6), sec(0.6));
  const W = 640;
  const bar = (value: number, color: string, name: string, strong: boolean) => {
    const w = Math.max(6, (value / b.max) * W * grow);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 18, height: 40 }}>
        <div
          style={{
            width: 150,
            fontFamily: monoFamily,
            fontSize: 18,
            color: strong ? INK : COLORS.muted,
            textAlign: "right",
          }}
        >
          {name}
        </div>
        <div
          style={{
            width: w,
            height: 34,
            background: color,
            borderRadius: 6,
            border: strong ? `1.5px solid ${INK}` : `1.5px solid ${COLORS.border}`,
          }}
        />
        <div
          style={{
            fontFamily: displayFamily,
            fontSize: 30,
            fontWeight: strong ? 700 : 500,
            color: strong ? INK : COLORS.muted,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {b.fmt(value * grow)}
        </div>
      </div>
    );
  };
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${(1 - enter) * 18}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: 900,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginLeft: 168 }}>
        <span style={{ fontSize: 25, fontWeight: 600 }}>{b.label}</span>
        {b.note ? (
          <span style={{ fontFamily: monoFamily, fontSize: 17, color: COLORS.muted }}>
            {b.note}
          </span>
        ) : null}
        {b.verdict ? (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: monoFamily,
              fontSize: 17,
              color: ACCENT,
              opacity: verdict,
            }}
          >
            {b.verdict}
          </span>
        ) : null}
      </div>
      {bar(b.zoned, ACCENT, "Zoned 1.2", true)}
      {bar(b.couch, COLORS.band, "Your couch", false)}
    </div>
  );
};

/** One app screen in a printed card, drifting across the square. */
const Shot: React.FC<{
  file: string;
  caption: string;
  from: number;
  dur: number;
  focus: number;
}> = ({ file, caption, from, dur, focus }) => {
  const f = useCurrentFrame() - sec(from);
  const d = sec(dur);
  if (f < 0 || f > d) return null;
  const fade = Math.min(
    interpolate(f, [0, sec(0.5)], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(f, [d - sec(0.5), d], [1, 0], { extrapolateLeft: "clamp" }),
  );
  const p = f / d;
  return (
    <AbsoluteFill style={{ opacity: fade, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 900,
          height: 700,
          overflow: "hidden",
          borderRadius: 22,
          border: `1.5px solid ${INK}`,
          boxShadow: "10px 10px 0 rgba(23, 22, 20, 0.09)",
          background: COLORS.panel,
          transform: `translateY(${-30 + p * 10}px) scale(${0.97 + p * 0.03})`,
        }}
      >
        <Img
          src={staticFile(`launch/${file}`)}
          style={{
            width: 1560,
            position: "relative",
            left: -6 - p * 22,
            top: -focus - p * 50,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 70,
          fontFamily: monoFamily,
          fontSize: 22,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The film
// ---------------------------------------------------------------------------

export const Launch: React.FC = () => (
  <AbsoluteFill
    style={{
      background: PAPER,
      color: INK,
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased",
    }}
  >
    <Audio src={staticFile("launch/score.wav")} />

    {/* 1. The question nobody asked out loud. */}
    <Scene from={C.question} to={C.answer} fadeIn={0}>
      <Words text="Every runner has asked the same question." at={0} style={headline(66, 450)} />
    </Scene>

    <Scene from={C.answer} to={C.research}>
      <Words text="How hard should today be?" at={0.3} each={0.16} style={headline(104, 650)} />
    </Scene>

    <Scene from={C.research} to={C.introducing}>
      <Column gap={8}>
        <Words text="After extensive research¹," at={0.2} style={headline(68, 450)} />
        <Words text="we have an answer." at={1.4} style={headline(68, 450)} />
      </Column>
      <Footnote at={2.6}>1. {MEASURED.publications} peer-reviewed publications. We read all of them.</Footnote>
    </Scene>

    {/* 2. The black card. */}
    <Scene from={C.introducing} to={C.title} bg={INK} fadeIn={0.25} fadeOut={0} push={0.06}>
      <Words text="Introducing" at={0.35} each={0} style={{ ...headline(56, 400), color: PAPER }} />
    </Scene>

    <Scene from={C.title} to={C.capable} fadeIn={0} push={0.05}>
      <Column gap={30}>
        <TitleMark />
        <Words
          text="Free, open-source endurance training"
          at={1.2}
          each={0.09}
          style={{ ...headline(38, 400), color: COLORS.sub }}
        />
      </Column>
    </Scene>

    {/* 3. Capability. */}
    <Scene from={C.capable} to={C.zones}>
      <Column gap={80}>
        <Column gap={0}>
          <Words text="Our most capable" at={0.2} style={headline(64, 500)} />
          <Words text="training library yet." at={0.6} style={headline(64, 500)} />
        </Column>
        <div style={{ display: "flex", gap: 10 }}>
          <Counter value={MEASURED.sessions} label="Sessions" at={1.4} />
          <Counter value={MEASURED.plans} label="Plans" at={1.7} />
          <Counter value={MEASURED.calculators} label="Calculators" at={2.0} />
        </div>
      </Column>
    </Scene>

    <Scene from={C.zones} to={C.benchmarks}>
      <Column gap={56}>
        <div style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
          <Words text="It speaks one language." at={0.2} style={headline(60, 500)} />
          <Words text="Effort." at={1.3} style={headline(60, 700)} color={ACCENT} />
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {ZONES.map((_, i) => (
            <ZoneBar key={i} i={i} at={1.8} />
          ))}
        </div>
      </Column>
    </Scene>

    {/* 4. Benchmarks. The heartbeat enters here. */}
    <Scene from={C.benchmarks} to={C.safety} push={0.02}>
      <Column gap={44} style={{ alignItems: "flex-start", width: 900 }}>
        <div>
          <Eyebrow at={0.1}>Benchmarks</Eyebrow>
          <Words
            text="State of the art.¹"
            at={0.4}
            style={{ ...headline(64, 600), justifyContent: "flex-start", marginTop: 14 }}
          />
        </div>
        {BENCHES.map((b, i) => (
          <BenchRow key={b.label} b={b} at={1.6 + i * 2.4} />
        ))}
      </Column>
      <Footnote at={8.4}>1. On benchmarks we designed. The couch was not consulted.</Footnote>
    </Scene>

    {/* 5. Safety. Every launch has one. */}
    <Scene from={C.safety} to={C.privacy}>
      <Column gap={40}>
        <Eyebrow at={0.1}>Safety</Eyebrow>
        <Words text="We take safety seriously." at={0.4} style={headline(76, 600)} />
        <Column gap={2}>
          <Words
            text="Every plan audits itself,"
            at={2.0}
            each={0.08}
            style={{ ...headline(42, 400), color: COLORS.sub }}
          />
          <Words
            text="and tells you where it is weak."
            at={2.5}
            each={0.08}
            style={{ ...headline(42, 400), color: COLORS.sub }}
          />
        </Column>
      </Column>
    </Scene>

    <Scene from={C.privacy} to={C.montage}>
      <Column gap={48}>
        <Column gap={6}>
          <Words text="No account." at={0.2} style={headline(84, 650)} />
          <Words text="No tracking." at={0.9} style={headline(84, 650)} />
          <Words text="No server." at={1.6} style={headline(84, 650)} />
        </Column>
        <Column gap={4}>
          <Words
            text="Your data never leaves your browser."
            at={2.8}
            each={0.07}
            style={{ ...headline(36, 400), color: COLORS.sub }}
          />
          <Words
            text="We could not read it if we wanted to."
            at={3.6}
            each={0.07}
            style={{ ...headline(36, 400), color: COLORS.sub }}
          />
        </Column>
      </Column>
    </Scene>

    {/* 6. The product, at last. */}
    <Sequence from={sec(C.montage)} durationInFrames={sec(C.hit - C.montage)}>
      <Shot file="workout.png" caption="Every session, explained" from={0} dur={1.8} focus={130} />
      <Shot file="plan.png" caption="Plans, built and audited" from={1.5} dur={1.8} focus={150} />
      <Shot file="library.png" caption={`${MEASURED.sessions} sessions`} from={3.0} dur={1.8} focus={120} />
      <Shot file="zones.png" caption="Six zones. One axis." from={4.5} dur={1.5} focus={150} />
    </Sequence>

    {/* 7. The hit. */}
    <Scene from={C.hit} to={C.signature} fadeIn={0} push={0.05}>
      <Column gap={34}>
        <Words text="Free. Open source. MIT licensed." at={0.15} each={0.2} style={headline(60, 500)} />
        <Words text="Available today." at={1.9} each={0.2} style={headline(108, 700)} />
      </Column>
    </Scene>

    <Scene from={C.signature} to={LAUNCH_SECONDS} fadeIn={0} fadeOut={1.2} push={0.04}>
      <Column gap={34}>
        <Wordmark size={200} />
        <Eyebrow at={1}>zoned.run</Eyebrow>
      </Column>
    </Scene>
  </AbsoluteFill>
);

/** The name, landing on the first impact: a spring, a blur that clears. */
const TitleMark: React.FC = () => {
  const s = useSpring(0, { bounce: 0.15, speed: 0.7 });
  const clear = useRamp(0, sec(0.9));
  return (
    <div
      style={{
        transform: `scale(${0.9 + 0.1 * s})`,
        filter: `blur(${(1 - clear) * 14}px)`,
        opacity: clear,
        display: "flex",
        alignItems: "flex-start",
        gap: 18,
      }}
    >
      <Wordmark size={230} />
      <span
        style={{
          fontFamily: monoFamily,
          fontSize: 34,
          fontWeight: 700,
          marginTop: 22,
          padding: "6px 14px",
          border: `1.5px solid ${INK}`,
          borderRadius: 10,
        }}
      >
        1.2
      </span>
    </div>
  );
};
