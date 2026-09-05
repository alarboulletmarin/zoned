import { sec, useLayout } from "../theme";
import type { Lang } from "../lang";
import { useCopy } from "../copy";
import { Act } from "../components/Act";
import { Frame, Stage } from "../components/Stage";
import { Headline, Sub } from "../components/Type";
import { EndCard } from "../components/EndCard";
import { ZoneSweep } from "../components/Brand";
import { ScienceCounts } from "../components/visuals/ScienceGrid";

export const TEASER_FRAMES = sec(6);

/**
 * Six seconds: the question, what answers it, the address.
 *
 * The middle beat used to be the catalogue counts. Three numbers about how much
 * there is say nothing about whether any of it is any good — so it is now the
 * reference count, which is the only figure a stranger has reason to care about
 * in six seconds.
 *
 * The opening act is already on screen at frame 0: its masked lines start at a
 * negative frame, so most of their travel has played out before the first frame
 * renders. A teaser that opens on an empty canvas has lost the viewer before it
 * says anything.
 */
export const Teaser: React.FC<{ lang: Lang }> = ({ lang }) => (
  <Stage lang={lang}>
    <Act from={0} dur={76} fadeIn={0} fadeOut={18} handover="push" camera={{ scale: 0.06 }}>
      <Question />
    </Act>

    <Act from={62} dur={74} fadeIn={18} fadeOut={18} handover="focus" camera={{ scale: -0.04 }}>
      <Answer />
    </Act>

    {/* The brand's own palette does the cut. */}
    <ZoneSweep at={58} dur={22} band={0.4} />

    <Act
      from={122}
      dur={TEASER_FRAMES - 122}
      fadeIn={18}
      fadeOut={0}
      handover="push"
      camera={{ scale: 0.03 }}
    >
      <EndCard at={0} />
    </Act>
  </Stage>
);

const Question: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().teaser;

  return (
    <Frame style={{ justifyContent: "center" }}>
      <Headline at={-22} each={8} size={l.display} style={{ maxWidth: "12ch" }} lines={copy.question} />
      <Sub at={6} style={{ marginTop: l.gap }}>
        {copy.questionSub}
      </Sub>
    </Frame>
  );
};

const Answer: React.FC = () => {
  const l = useLayout();
  const copy = useCopy().teaser;

  return (
    <Frame style={{ justifyContent: "center" }}>
      <Headline at={0} each={8} size={l.head} style={{ maxWidth: "14ch" }} lines={copy.answer} />
      <ScienceCounts at={14} style={{ marginTop: l.gap * 1.2 }} />
    </Frame>
  );
};
