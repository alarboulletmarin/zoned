/**
 * WeekStory, 1080×1920, the story format.
 *
 * The rhythm first and tall, the week's shape at arm's length; the sessions
 * as rows under it; the split; and the two runners, in ink, on the ground
 * rule of the footer. A phone screen is read from the top, so the object
 * that reads in a glance comes first and the text after.
 *
 * A full week takes its room from the bars and from the rows' type, in
 * steps, and the runners are the first to give way.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { AccentPatch } from "../_paper";
import { Sheet, Head, Title, FactsLine, Foot, RhythmColumns, SessionRows, SplitBar, weekLines, weekDensity, INK_PALE } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1080;
const H = 1920;

/** Sizes by how many rows the list prints. */
function fitRows(rows: number) {
  if (rows <= 8) return { bars: 340, nameSize: 30, labelSize: 18, pad: 15 };
  if (rows <= 11) return { bars: 300, nameSize: 26, labelSize: 17, pad: 11 };
  if (rows <= 14) return { bars: 260, nameSize: 23, labelSize: 15, pad: 9 };
  if (rows <= 18) return { bars: 220, nameSize: 20, labelSize: 14, pad: 7 };
  return { bars: 180, nameSize: 18, labelSize: 12, pad: 5 };
}

export function WeekStory(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const fit = fitRows(weekDensity(lines).rows);
  const titleSize = p.name.length > 20 ? 72 : 96;
  return (
    <Sheet width={W} height={H} padding="52px 56px 44px" transparent={p.transparent}>
      <AccentPatch />
      <Head scale={1.15} />
      <Title size={titleSize} style={{ marginTop: 44 }}>{p.name}</Title>
      <FactsLine plan={p.plan} stats={p.stats} size={24} style={{ marginTop: 18 }} />
      <div style={{ marginTop: 48 }}>
        <RhythmColumns slots={p.slots} height={fit.bars} gap={14} labelSize={19} />
      </div>
      <div style={{ marginTop: 40, flex: "0 0 auto" }}>
        <SessionRows
          lines={lines}
          nameSize={fit.nameSize}
          labelSize={fit.labelSize}
          rowPadding={fit.pad}
          gutter={90}
        />
      </div>
      <div style={{ marginTop: 30 }}>
        <SplitBar stats={p.stats} size={18} height={26} />
      </div>
      {/* The two runners, muted, walking off the footer's rule, on the room
          the week leaves them; a week that leaves none folds them away. */}
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
      <Foot size={21} style={{ paddingTop: 24 }} />
    </Sheet>
  );
}
