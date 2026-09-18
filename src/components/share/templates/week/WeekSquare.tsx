/**
 * WeekSquare, 1080×1080 for a feed post.
 *
 * The same fused object as the landscape sheet, bars over cards, with the
 * room a square gives it: taller bars, the split under the board. A day
 * holding several sessions takes its room from the bars first.
 */

import { Sheet, Head, Title, FactsLine, Foot, RhythmColumns, DayColumns, SplitBar, weekLines, weekDensity } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1080;
const H = 1080;

/** By the fullest day: 1, 2, or 3 and more sessions. */
const FIT = {
  1: { bars: 300, nameSize: 14, nameLines: 3, labelSize: 12, pad: "9px 9px 8px", gap: 8 },
  2: { bars: 180, nameSize: 13, nameLines: 2, labelSize: 11, pad: "8px 8px 7px", gap: 6 },
  3: { bars: 110, nameSize: 12, nameLines: 1, labelSize: 10, pad: "6px 7px 5px", gap: 5 },
} as const;

export function WeekSquare(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const { maxPerDay } = weekDensity(lines);
  const fit = FIT[Math.min(3, maxPerDay) as 1 | 2 | 3];
  const titleSize = p.name.length > 22 ? 52 : 68;
  return (
    <Sheet width={W} height={H} margin={40} padding="40px 44px 36px" transparent={p.transparent}>
      <Head />
      <Title size={titleSize} style={{ marginTop: 28 }}>{p.name}</Title>
      <FactsLine plan={p.plan} stats={p.stats} size={20} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 34 }}>
        <RhythmColumns slots={p.slots} height={fit.bars} gap={12} labels={false} />
      </div>
      <div style={{ marginTop: 10, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <DayColumns
          lines={lines}
          gap={12}
          nameSize={fit.nameSize}
          nameLines={fit.nameLines}
          labelSize={fit.labelSize}
          cardPadding={fit.pad}
          cardGap={fit.gap}
        />
      </div>
      {/* Pinned above the footer: a short week leaves its air between the
          board and the split, not under the split. */}
      <div style={{ marginTop: "auto", paddingTop: 22 }}>
        <SplitBar stats={p.stats} size={16} height={22} />
      </div>
      <Foot size={17} style={{ marginTop: 26 }} />
    </Sheet>
  );
}
