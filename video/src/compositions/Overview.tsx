import { COLORS, sec, useLayout } from "../theme";
import type { Lang } from "../lang";
import { useCopy } from "../copy";
import { Act } from "../components/Act";
import { Frame, Stage } from "../components/Stage";
import { Headline, PanelLabel, Sub } from "../components/Type";
import { Split, ActHeader } from "../components/Layout";
import { Screenshot } from "../components/Screenshot";
import { CountRow } from "../components/Counter";
import { EndCard } from "../components/EndCard";
import { Marquee } from "../components/Marquee";
import { ZoneSweep } from "../components/Brand";
import { FreedomList } from "../components/visuals/FreedomList";
import { ScienceGrid } from "../components/visuals/ScienceGrid";
import { AdjustDial } from "../components/visuals/AdjustDial";
import { VolumeBars } from "../components/visuals/VolumeBars";
import { useEnter } from "../motion";
import { STATS, useFacts } from "../data/facts";

export const OVERVIEW_FRAMES = sec(32);

/**
 * The long cut: what Zoned is, in seven acts.
 *
 * Liberté, contrôle, compréhension — that triad is the spine, and the two
 * product pillars, the library and the plans, sit in the middle of it.
 *
 * Two earlier cuts were wrong in opposite ways. The first sold a catalogue
 * (256 / 9 / 12), which any subscription app can out-count. The second opened
 * on a comparison table against Runna and Kiprun, which made the film about
 * other people's products. What Zoned costs and what it asks for is a property
 * of Zoned; no competitor is named anywhere.
 *
 * The seven acts and their timings were signed off and are not up for revision:
 * the English cut is the same film in another language, not another film. Only
 * the words change.
 */
export const Overview: React.FC<{ lang: Lang }> = ({ lang }) => (
  <Stage lang={lang}>
    <Act from={0} dur={138} fadeIn={0} fadeOut={20} handover="push" camera={{ scale: 0.05 }}>
      <Origin />
    </Act>

    <Act from={126} dur={150} fadeIn={20} fadeOut={20} handover="focus" camera={{ scale: -0.04 }}>
      <Liberte />
    </Act>

    <ZoneSweep at={122} dur={24} band={0.38} />

    <Act from={264} dur={150} fadeIn={20} fadeOut={20} handover="push" camera={{ scale: 0.04 }}>
      <Bibliotheque />
    </Act>

    <Act from={402} dur={150} fadeIn={20} fadeOut={20} handover="drift" camera={{ scale: 0.03, x: -18 }}>
      <Plans />
    </Act>

    <Act from={540} dur={150} fadeIn={20} fadeOut={20} handover="push" camera={{ scale: 0.045 }}>
      <Controle />
    </Act>

    <Act from={678} dur={150} fadeIn={20} fadeOut={20} handover="focus" camera={{ scale: -0.035 }}>
      <Comprehension />
    </Act>

    <Act
      from={816}
      dur={OVERVIEW_FRAMES - 816}
      fadeIn={20}
      fadeOut={0}
      handover="push"
      camera={{ scale: 0.03 }}
    >
      <EndCard at={0} />
    </Act>
  </Stage>
);

/**
 * Where it comes from, in the app's own words — the About page title and bio.
 * A film about a one-person open-source project should say so in its first
 * five seconds.
 */
const Origin: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().overview;
  const note = useEnter(32, { dur: 26, y: 18, blur: 4 });

  return (
    <Frame style={{ justifyContent: "center" }}>
      <Headline
        at={-20}
        each={8}
        size={l.display * 0.84}
        style={{ maxWidth: "17ch" }}
        lines={copy.origin}
      />
      <Sub at={16} style={{ marginTop: l.gap, fontSize: l.sub * 1.1, maxWidth: "34ch" }}>
        {copy.originSub}
      </Sub>
      <div
        style={{
          ...note,
          marginTop: l.gap * 1.3,
          fontSize: l.body,
          fontWeight: 600,
          color: COLORS.muted,
        }}
      >
        {copy.originNote}
      </div>
    </Frame>
  );
};

const Liberte: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().overview.freedom;

  return (
    <Frame>
      <Split
        ratio={1.15}
        lead={<ActHeader {...copy} size={l.head * 0.94} />}
        side={<FreedomList at={14} style={{ flex: 1, minHeight: 0 }} />}
      />
    </Frame>
  );
};

/**
 * The catalogue act runs a band of real session names, full bleed, under the
 * columns. It never stops moving, so the one act whose subject is sheer volume
 * actually feels like volume.
 */
const Bibliotheque: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().overview;
  const names = useFacts().workoutNames;
  const half = Math.ceil(names.length / 2);

  return (
    <Frame>
      <Split
        ratio={1.3}
        style={{ flex: 1, minHeight: 0 }}
        lead={
          <div>
            <PanelLabel at={0}>{copy.libraryLabel}</PanelLabel>
            <div style={{ marginTop: l.gap * 0.7 }}>
              <CountRow to={STATS.workouts} unit={copy.libraryUnit} at={8} dur={36} />
            </div>
            <Sub at={22} style={{ marginTop: l.gap * 0.8 }}>
              {copy.librarySub}
            </Sub>
          </div>
        }
        side={
          <Screenshot
            shot="library"
            path="/library"
            at={12}
            dur={140}
            style={{ flex: 1, minHeight: 0, width: "100%" }}
          />
        }
      />

      <div
        style={{
          marginLeft: -l.padX,
          marginRight: -l.padX,
          marginTop: l.story ? 34 : 26,
          // Kept clear of the platform chrome in the vertical cut, which covers
          // roughly the bottom 250 px.
          marginBottom: l.story ? -Math.round(l.padBottom * 0.2) : -Math.round(l.padBottom * 0.3),
          display: "flex",
          flexDirection: "column",
          gap: l.story ? 12 : 10,
        }}
      >
        <Marquee items={names.slice(0, half)} speed={0.05} opacity={0.55} />
        <Marquee items={names.slice(half)} speed={0.038} reverse opacity={0.3} />
      </div>
    </Frame>
  );
};

/**
 * Ends on the audit, with a warning the generator raised about its own output.
 * A plan that admits where it is weak is a stronger claim than a plan that says
 * nothing — and it is the same promise as the rest: no black box.
 */
const Plans: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().overview;
  const audit = useFacts().audit;
  const finding = audit.find((f) => f.code === "VOLUME_JUMP_TOO_LARGE") ?? audit[0];
  const card = useEnter(56, { dur: 28, y: 20, blur: 5 });

  return (
    <Frame>
      <Split
        ratio={1.3}
        lead={<ActHeader {...copy.plans} size={l.head * 0.9} />}
        side={
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <VolumeBars at={20} each={4} style={{ flex: 1, minHeight: 0 }} />
            {finding ? (
              <div
                style={{
                  ...card,
                  marginTop: l.gap * 0.7,
                  padding: l.story ? "18px 22px" : "16px 20px",
                  borderRadius: 14,
                  background: `${COLORS.accent}0f`,
                  border: `1px solid ${COLORS.accent}33`,
                }}
              >
                <div
                  style={{
                    fontSize: l.story ? 18 : 16,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: COLORS.accent,
                    marginBottom: 8,
                  }}
                >
                  {copy.auditLabel}
                </div>
                <div style={{ fontSize: l.body, fontWeight: 500, color: COLORS.sub, lineHeight: 1.3 }}>
                  {finding.message}
                </div>
              </div>
            ) : null}
          </div>
        }
      />
    </Frame>
  );
};

const Controle: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().overview.control;

  return (
    <Frame>
      <Split
        ratio={1.15}
        lead={<ActHeader {...copy} size={l.head * 0.92} />}
        side={<AdjustDial at={14} style={{ flex: 1, minHeight: 0 }} />}
      />
    </Frame>
  );
};

const Comprehension: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().overview;
  const caption = useEnter(50, { dur: 26, y: 16, blur: 4 });

  return (
    <Frame>
      <Split
        ratio={1.25}
        lead={<ActHeader {...copy.understanding} size={l.head * 0.94} />}
        side={
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <ScienceGrid at={16} style={{ flex: 1, minHeight: 0 }} />
            <div
              style={{
                ...caption,
                marginTop: l.gap * 0.8,
                fontSize: l.body,
                fontWeight: 600,
                color: COLORS.muted,
              }}
            >
              {copy.understandingCaption}
            </div>
          </div>
        }
      />
    </Frame>
  );
};
