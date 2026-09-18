/**
 * WeekSheet, 1080×1350 (4:5), the portrait post, and the one to send to
 * someone who will read it: Monday to Sunday as rows, every name in full,
 * the duration on the right, and a ruled bar under each session so the
 * rhythm is read down the page. The split follows the rows, and the two
 * runners take whatever room a short week leaves before the footer.
 *
 * The rows shrink in steps as the week fills: a week of ten sessions
 * prints smaller type and thinner bars, and past fourteen rows the bars
 * go, so no session is ever cut off the sheet.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { AccentPatch } from "../_paper";
import { Sheet, Head, Title, FactsLine, Foot, SessionRows, SplitBar, weekLines, weekDensity, INK_PALE } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1080;
const H = 1350;

/** Row sizes by how many rows the list prints. */
function fitRows(rows: number) {
  if (rows <= 8) return { nameSize: 28, labelSize: 17, pad: 16, bars: true, barHeight: 14 };
  if (rows <= 11) return { nameSize: 23, labelSize: 15, pad: 10, bars: true, barHeight: 10 };
  if (rows <= 14) return { nameSize: 20, labelSize: 14, pad: 8, bars: false, barHeight: 0 };
  return { nameSize: 17, labelSize: 12, pad: 5, bars: false, barHeight: 0 };
}

export function WeekSheet(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const fit = fitRows(weekDensity(lines).rows);
  const titleSize = p.name.length > 22 ? 62 : 84;
  return (
    <Sheet width={W} height={H} transparent={p.transparent}>
      <AccentPatch />
      <Head />
      <Title size={titleSize} style={{ marginTop: 32 }}>{p.name}</Title>
      <FactsLine plan={p.plan} stats={p.stats} style={{ marginTop: 16 }} />
      <div style={{ marginTop: 36, flex: "0 0 auto" }}>
        <SessionRows
          lines={lines}
          bars={fit.bars}
          barHeight={fit.barHeight}
          nameSize={fit.nameSize}
          labelSize={fit.labelSize}
          rowPadding={fit.pad}
          gutter={84}
        />
      </div>
      <div style={{ marginTop: 28 }}>
        <SplitBar stats={p.stats} size={17} height={24} />
      </div>
      {/* The two runners, in ink, on what is left. Muted: the wordmark's dot
          is the sheet's one vermillon. They take the room a week leaves, and
          a week that leaves none folds them away. */}
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
