/**
 * WeekSheet, 1080×1350 (4:5), the portrait post, and the one to send to
 * someone who will read it: Monday to Sunday as rows, every name in full,
 * the duration on the right, and a ruled bar under each session so the
 * rhythm is read down the page. The split follows the rows, and the two
 * runners take whatever room a short week leaves before the footer.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { AccentPatch } from "../_paper";
import { Sheet, Head, Title, FactsLine, Foot, SessionRows, SplitBar, weekLines, INK_PALE } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1080;
const H = 1350;

export function WeekSheet(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const titleSize = p.name.length > 22 ? 62 : 84;
  // Ten sessions need shorter rows than four.
  const dense = lines.length > 7;
  return (
    <Sheet width={W} height={H} transparent={p.transparent}>
      <AccentPatch />
      <Head />
      <Title size={titleSize} style={{ marginTop: 32 }}>{p.name}</Title>
      <FactsLine plan={p.plan} stats={p.stats} style={{ marginTop: 16 }} />
      <div style={{ marginTop: 36, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <SessionRows
          lines={lines}
          bars
          nameSize={dense ? 24 : 28}
          labelSize={17}
          rowPadding={dense ? 12 : 16}
          gutter={84}
        />
      </div>
      <div style={{ marginTop: 28 }}>
        <SplitBar stats={p.stats} size={17} height={24} />
      </div>
      {/* The two runners, in ink, on what is left. Muted: the wordmark's dot
          is the sheet's one vermillon. */}
      <div
        data-doodle="mute"
        style={{
          flex: "1 1 0",
          minHeight: 0,
          marginTop: 20,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          color: INK_PALE,
        }}
      >
        <RunnersDuo style={{ height: "100%", maxHeight: 180, width: "auto", display: "block" }} />
      </div>
      <Foot style={{ marginTop: 18 }} />
    </Sheet>
  );
}
