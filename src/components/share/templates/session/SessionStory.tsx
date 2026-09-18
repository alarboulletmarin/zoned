/**
 * SessionStory, 1080×1920, the story format.
 *
 * The profile first and tall, the session's shape at arm's length; the
 * blocks as rows under it, large; the time in zones; the tip; and the two
 * runners, in ink, on the ground rule of the footer. A long session takes
 * its room from the rows' type, in steps, and the runners give way first.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { toZoneBarBlocks } from "@/components/visualization";
import { AccentPatch, ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot, INK_PALE } from "../week/_week";
import { BlockRows, SessionFacts, Tip, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1920;

/** Row sizes by how many blocks the list prints. */
function fitRows(rows: number) {
  if (rows <= 7) return { nameSize: 30, labelSize: 18, pad: 16, textLines: 2 };
  if (rows <= 11) return { nameSize: 26, labelSize: 17, pad: 12, textLines: 2 };
  if (rows <= 15) return { nameSize: 22, labelSize: 15, pad: 9, textLines: 1 };
  return { nameSize: 19, labelSize: 13, pad: 6, textLines: 1 };
}

export function SessionStory({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, lines, label } = useSessionSheet(workout);
  const fit = fitRows(lines.length);
  const titleSize = name.length > 22 ? 72 : 96;
  return (
    <Sheet width={W} height={H} padding="52px 56px 44px" transparent={transparent}>
      <AccentPatch />
      <Head scale={1.15} label={label} />
      <Title size={titleSize} style={{ marginTop: 44 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} size={24} style={{ marginTop: 18 }} />
      <div style={{ marginTop: 44 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={180} />
      </div>
      <div style={{ marginTop: 40, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <BlockRows
          lines={lines}
          nameSize={fit.nameSize}
          labelSize={fit.labelSize}
          rowPadding={fit.pad}
          textLines={fit.textLines}
          gutter={104}
        />
      </div>
      <div style={{ marginTop: 32 }}>
        <ZoneSplit hero={hero} size={18} height={26} />
      </div>
      <Tip workout={workout} size={22} labelSize={17} style={{ marginTop: 32 }} />
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
