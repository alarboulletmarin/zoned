import { sec, useLayout } from "../theme";
import type { Lang } from "../lang";
import { useCopy, type FeatureId } from "../copy";
import { Act } from "../components/Act";
import { Frame, Stage } from "../components/Stage";
import { Eyebrow, Headline, PanelLabel, Sub } from "../components/Type";
import { Split } from "../components/Layout";
import { Screenshot, type Device } from "../components/Screenshot";
import { EndCard } from "../components/EndCard";
import { ZoneSweep } from "../components/Brand";
import { VolumeBars } from "../components/visuals/VolumeBars";
import { WorkoutTimeline } from "../components/visuals/WorkoutTimeline";
import { PaceTable } from "../components/visuals/PaceTable";
import { SplitLadder } from "../components/visuals/SplitLadder";
import { RouteTrace } from "../components/visuals/RouteTrace";
import { ScienceGrid } from "../components/visuals/ScienceGrid";
import { PolarModel } from "../components/visuals/PolarModel";
import { AdjustDial } from "../components/visuals/AdjustDial";
import { FreedomList } from "../components/visuals/FreedomList";
import { useEnter } from "../motion";

export { FEATURE_IDS, type FeatureId } from "../copy";

export const FEATURE_FRAMES = sec(13);

/**
 * What each feature film SHOWS — its animated visual and its product capture.
 *
 * What each film SAYS lives in `src/copy.tsx`, keyed by the same id. Splitting
 * them that way is what keeps 48 compositions manageable: the middle beat, the
 * screenshot and the device are properties of the feature and identical in both
 * languages, so only the words are written twice.
 */
type FeatureShots = {
  /** Label above the animated visual comes from the copy; this is the visual. */
  visual: React.FC<{ at: number }>;
  shot: string;
  path: string;
  /** Force a device when a surface has no usable phone capture. */
  device?: Device;
};

export const FEATURES: Record<FeatureId, FeatureShots> = {
  science: {
    visual: ({ at }) => <ScienceGrid at={at} style={{ flex: 1, minHeight: 0 }} />,
    shot: "science",
    path: "/workout/VMA-001",
  },

  polarise: {
    visual: ({ at }) => <PolarModel at={at} style={{ flex: 1, minHeight: 0 }} />,
    shot: "methodology",
    path: "/methodology",
  },

  adapt: {
    visual: ({ at }) => <AdjustDial at={at} style={{ flex: 1, minHeight: 0 }} />,
    shot: "adjust",
    path: "/workout/VMA-001",
  },

  liberte: {
    visual: ({ at }) => <FreedomList at={at} style={{ flex: 1, minHeight: 0 }} />,
    shot: "about",
    path: "/about",
  },

  plans: {
    visual: ({ at }) => <VolumeBars at={at} each={4} style={{ flex: 1, minHeight: 0 }} />,
    shot: "plans",
    path: "/plan/new/prebuilt",
  },

  library: {
    visual: ({ at }) => <WorkoutTimeline at={at} dur={64} fill style={{ flex: 1, minHeight: 0 }} />,
    shot: "library",
    path: "/library",
  },

  zones: {
    visual: ({ at }) => <PaceTable at={at} style={{ flex: 1, minHeight: 0 }} />,
    shot: "zones",
    path: "/calculators/zones",
  },

  racesim: {
    visual: ({ at }) => <SplitLadder at={at} dur={86} fill style={{ flex: 1, minHeight: 0 }} />,
    shot: "racesim",
    path: "/race-simulator",
  },

  routes: {
    visual: ({ at }) => <RouteTrace at={at} dur={78} style={{ flex: 1, minHeight: 0 }} />,
    shot: "routes",
    path: "/routes",
    // The routes page has no usable phone capture — the browser frame is used
    // in both cuts. See scripts/capture-shots.ts.
    device: "desktop",
  },
};

/**
 * One feature in thirteen seconds: name it, show it working, show it in the
 * app, sign it.
 *
 * All nine share this scaffold and differ only in their middle beat, so the set
 * reads as a series rather than nine unrelated clips. The handovers alternate
 * push and focus so even a thirteen second film changes gear twice.
 */
export const FeatureDemo: React.FC<{ feature: FeatureId; lang: Lang }> = ({ feature, lang }) => (
  <Stage lang={lang}>
    <Act from={0} dur={96} fadeIn={0} fadeOut={18} handover="push" camera={{ scale: 0.06 }}>
      <TitleCard feature={feature} />
    </Act>

    <Act from={84} dur={162} fadeIn={18} fadeOut={18} handover="focus" camera={{ scale: -0.035 }}>
      <VisualBeat feature={feature} />
    </Act>

    <ZoneSweep at={80} dur={22} band={0.36} />

    <Act from={234} dur={108} fadeIn={18} fadeOut={18} handover="push" camera={{ scale: 0.04 }}>
      <ProofBeat feature={feature} />
    </Act>

    <Act
      from={330}
      dur={FEATURE_FRAMES - 330}
      fadeIn={18}
      fadeOut={0}
      handover="focus"
      camera={{ scale: 0.03 }}
    >
      <EndCard at={0} />
    </Act>
  </Stage>
);

/** Copy and visuals for one feature, falling back the way the old lookup did. */
const useFeature = (feature: FeatureId) => {
  const copy = useCopy();
  return {
    copy: copy.features[feature] ?? copy.features.library,
    shots: FEATURES[feature] ?? FEATURES.library,
    inApp: copy.inApp,
  };
};

const TitleCard: React.FC<{ feature: FeatureId }> = ({ feature }) => {
  const l = useLayout();
  const { copy } = useFeature(feature);

  return (
    <Frame style={{ justifyContent: "center" }}>
      <Eyebrow at={-14}>{copy.eyebrow}</Eyebrow>
      <Headline
        at={-8}
        each={8}
        size={l.display * 0.8}
        style={{ marginTop: l.gap * 0.8, maxWidth: "14ch" }}
        lines={copy.lines}
      />
      <Sub at={12} style={{ marginTop: l.gap, maxWidth: "28ch" }}>
        {copy.sub}
      </Sub>
    </Frame>
  );
};

const VisualBeat: React.FC<{ feature: FeatureId }> = ({ feature }) => {
  const l = useLayout();
  const { copy, shots } = useFeature(feature);
  const Visual = shots.visual;

  return (
    <Frame>
      <PanelLabel at={0} style={{ marginBottom: l.story ? 32 : 26 }}>
        {copy.visualLabel}
      </PanelLabel>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Visual at={14} />
      </div>
    </Frame>
  );
};

const ProofBeat: React.FC<{ feature: FeatureId }> = ({ feature }) => {
  const l = useLayout();
  const { copy, shots, inApp } = useFeature(feature);
  const claim = useEnter(14, { dur: 28, y: 22, blur: 5 });

  return (
    <Frame>
      <Split
        ratio={1.35}
        lead={
          <div>
            <PanelLabel at={0}>{inApp}</PanelLabel>
            <div
              style={{
                ...claim,
                marginTop: l.gap * 0.7,
                fontSize: l.story ? 42 : 38,
                fontWeight: 600,
                lineHeight: 1.14,
                letterSpacing: "-0.025em",
                maxWidth: "20ch",
              }}
            >
              {copy.claim}
            </div>
          </div>
        }
        side={
          <Screenshot
            shot={shots.shot}
            path={shots.path}
            device={shots.device}
            at={6}
            dur={104}
            style={{ flex: 1, minHeight: 0, width: "100%" }}
          />
        }
      />
    </Frame>
  );
};
