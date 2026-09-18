/**
 * WeekSquare, 1080×1080 for a feed post.
 *
 * The same fused object as the landscape sheet, bars over cards, with the
 * room a square gives it: taller bars, the split under the board.
 */

import { Sheet, Head, Title, FactsLine, Foot, RhythmColumns, DayColumns, SplitBar, weekLines } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1080;
const H = 1080;

export function WeekSquare(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const titleSize = p.name.length > 22 ? 52 : 68;
  return (
    <Sheet width={W} height={H} margin={40} padding="40px 44px 36px" transparent={p.transparent}>
      <Head />
      <Title size={titleSize} style={{ marginTop: 28 }}>{p.name}</Title>
      <FactsLine plan={p.plan} stats={p.stats} size={20} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 34 }}>
        <RhythmColumns slots={p.slots} height={300} gap={12} labels={false} />
      </div>
      <div style={{ marginTop: 10, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <DayColumns lines={lines} gap={12} nameSize={14} labelSize={12} cardPadding="9px 9px 8px" nameLines={3} />
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
