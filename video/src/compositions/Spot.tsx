import { COLORS, sec, useLayout } from "../theme";
import type { Lang } from "../lang";
import { useCopy } from "../copy";
import { Act } from "../components/Act";
import { Frame, Stage } from "../components/Stage";
import { Headline, PanelLabel, Sub } from "../components/Type";
import { Split } from "../components/Layout";
import { NoiseField } from "../components/NoiseField";
import { EndCard } from "../components/EndCard";
import { ZoneSweep } from "../components/Brand";
import { ScienceGrid, ScienceCounts } from "../components/visuals/ScienceGrid";
import { FreedomList } from "../components/visuals/FreedomList";
import { useEnter } from "../motion";

export const SPOT_FRAMES = sec(14);

/**
 * Fourteen seconds, five beats: the noise, the promise, what backs it, what it
 * costs, the address.
 *
 * The third beat is the one that changed. It used to be the zone table — true
 * but decorative. It is now the reference list, because "who says so" is the
 * question a sceptical viewer actually has at that moment.
 */
export const Spot: React.FC<{ lang: Lang }> = ({ lang }) => (
  <Stage lang={lang}>
    <Act from={0} dur={112} fadeIn={0} fadeOut={20} handover="drift" camera={{ scale: 0.05 }}>
      <TheNoise />
    </Act>

    <Act from={96} dur={100} fadeIn={20} fadeOut={18} handover="focus" camera={{ scale: -0.05 }}>
      <ThePromise />
    </Act>

    <ZoneSweep at={92} dur={24} band={0.42} />

    <Act from={182} dur={124} fadeIn={18} fadeOut={18} handover="push" camera={{ scale: 0.03 }}>
      <TheProof />
    </Act>

    <Act from={292} dur={94} fadeIn={18} fadeOut={18} handover="push" camera={{ scale: 0.04, y: -14 }}>
      <ThePrice />
    </Act>

    <Act
      from={374}
      dur={SPOT_FRAMES - 374}
      fadeIn={18}
      fadeOut={0}
      handover="focus"
      camera={{ scale: 0.03 }}
    >
      <EndCard at={0} />
    </Act>
  </Stage>
);

const TheNoise: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().spot;

  return (
    <>
      <NoiseField clearAt={74} clearDur={28} />
      <Frame style={{ justifyContent: "center" }}>
        <Headline
          at={-18}
          each={8}
          size={l.display * 0.78}
          style={{ maxWidth: "14ch" }}
          lines={copy.noise}
        />
      </Frame>
    </>
  );
};

/**
 * "Zoned décide" was the wrong promise. The whole point is that the runner
 * keeps the decision and Zoned supplies what it takes to make it — an app that
 * decides for you is the black box this one exists against.
 */
const ThePromise: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().spot;

  return (
    <Frame style={{ justifyContent: "center" }}>
      <Headline
        at={2}
        each={8}
        size={l.display * 0.8}
        style={{ maxWidth: "12ch" }}
        lines={copy.promise}
      />
      <Sub at={16} style={{ marginTop: l.gap, fontSize: l.sub * 1.15, maxWidth: "28ch" }}>
        {copy.promiseSub}
      </Sub>
    </Frame>
  );
};

const TheProof: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().spot;

  return (
    <Frame>
      <Split
        ratio={1.25}
        lead={
          <div>
            <PanelLabel at={0}>{copy.methodLabel}</PanelLabel>
            <Headline
              at={8}
              each={7}
              size={l.head * 0.9}
              style={{ marginTop: l.gap * 0.7 }}
              lines={copy.proof}
            />
            <ScienceCounts at={22} style={{ marginTop: l.gap }} />
          </div>
        }
        side={<ScienceGrid at={16} count={l.story ? 4 : 6} style={{ flex: 1, minHeight: 0 }} />}
      />
    </Frame>
  );
};

const ThePrice: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().spot;
  const tail = useEnter(26, { dur: 24, y: 18, blur: 4 });

  return (
    <Frame>
      <Split
        ratio={1.2}
        lead={
          <div>
            <Headline at={2} each={8} size={l.head} lines={copy.price} />
            <Sub at={16} style={{ marginTop: l.gap * 0.8 }}>
              {copy.priceSub}
            </Sub>
            <div
              style={{
                ...tail,
                marginTop: l.gap,
                fontSize: l.body,
                fontWeight: 600,
                color: COLORS.muted,
              }}
            >
              {copy.priceTail}
            </div>
          </div>
        }
        side={<FreedomList at={10} style={{ flex: 1, minHeight: 0 }} />}
      />
    </Frame>
  );
};
