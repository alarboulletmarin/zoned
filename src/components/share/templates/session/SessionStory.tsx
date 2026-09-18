/**
 * SessionStory, 1080×1920, the story format.
 *
 * The profile first and tall, the session's shape at arm's length; the
 * three phase lines under it, large, with the blocks' words; the time in
 * zones; the tip; and the two runners, in ink, on the ground rule of the
 * footer. A long session takes its room from the chips' type, in steps,
 * and the runners give way first.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { toZoneBarBlocks } from "@/components/visualization";
import { AccentPatch, ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot, INK_PALE } from "../week/_week";
import { FriezeAxis, PhaseLines, SessionFacts, Tip, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1920;

/** Type scale of the lines by how many blocks the phases hold. */
function fit(blocks: number) {
  if (blocks <= 6) return 1.3;
  if (blocks <= 12) return 1.15;
  if (blocks <= 20) return 1;
  return 0.9;
}

export function SessionStory({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const blocks = phases.reduce((n, p) => n + p.blocks, 0);
  const titleSize = name.length > 22 ? 72 : 96;
  return (
    <Sheet width={W} height={H} padding="52px 56px 44px" transparent={transparent}>
      <AccentPatch />
      <Head scale={1.15} label={label} />
      <Title size={titleSize} style={{ marginTop: 44 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} size={24} style={{ marginTop: 18 }} />
      <div style={{ marginTop: 44 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={260} />
        <FriezeAxis minutes={hero.durationMin} size={17} />
      </div>
      <div style={{ marginTop: 40, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <PhaseLines phases={phases} s={fit(blocks)} gutter={170} />
      </div>
      <div style={{ marginTop: 36 }}>
        <ZoneSplit hero={hero} size={18} height={26} />
      </div>
      <Tip workout={workout} size={22} labelSize={17} style={{ marginTop: 36 }} />
      {/* The two runners, muted, walking off the footer's rule, on the room
          the session leaves them; one that leaves none folds them away. */}
      <div
        data-doodle="mute"
        style={{
          flex: "1 1 0",
          minHeight: 0,
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          color: INK_PALE,
        }}
      >
        <RunnersDuo style={{ height: "100%", maxHeight: 220, width: "auto", display: "block" }} />
      </div>
      <Foot right={workout.id} size={21} style={{ paddingTop: 24 }} />
    </Sheet>
  );
}
