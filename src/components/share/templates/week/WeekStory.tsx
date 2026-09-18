/**
 * WeekStory, 1080×1920, the story format.
 *
 * The rhythm first and tall, the week's shape at arm's length; the sessions
 * as rows under it; the split; and the two runners, in ink, on the ground
 * rule of the footer. A phone screen is read from the top, so the object
 * that reads in a glance comes first and the text after.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { AccentPatch } from "../_paper";
import { Sheet, Head, Title, FactsLine, Foot, RhythmColumns, SessionRows, SplitBar, weekLines, INK_PALE } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1080;
const H = 1920;

export function WeekStory(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const titleSize = p.name.length > 20 ? 72 : 96;
  const dense = lines.length > 7;
  return (
    <Sheet width={W} height={H} padding="52px 56px 44px" transparent={p.transparent}>
      <AccentPatch />
      <Head scale={1.15} />
      <Title size={titleSize} style={{ marginTop: 44 }}>{p.name}</Title>
      <FactsLine plan={p.plan} stats={p.stats} size={24} style={{ marginTop: 18 }} />
      <div style={{ marginTop: 48 }}>
        <RhythmColumns slots={p.slots} height={340} gap={14} labelSize={19} />
      </div>
      <div style={{ marginTop: 40, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <SessionRows
          lines={lines}
          nameSize={dense ? 25 : 30}
          labelSize={18}
          rowPadding={dense ? 11 : 15}
          gutter={90}
        />
      </div>
      <div style={{ marginTop: 30 }}>
        <SplitBar stats={p.stats} size={18} height={26} />
      </div>
      {/* The two runners, muted, walking off the footer's rule. */}
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
