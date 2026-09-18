/**
 * WeekLandscape, 1200×675 (16:9) for X, LinkedIn, Discord, a coach's inbox.
 *
 * The rhythm and the board are one object: seven bars, and under each bar
 * the day's cards. The bar says how much, the card says what, in the same
 * column, so the shape of the week and its content read in one pass.
 *
 * The sheet cannot grow, so a day holding two or three sessions takes its
 * room from the bars and from the type: the cards get shorter, never cut.
 */

import { Sheet, Head, Title, FactsLine, Foot, RhythmColumns, DayColumns, weekLines, weekDensity } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1200;
const H = 675;

/** By the fullest day: 1, 2, or 3 and more sessions. */
const FIT = {
  1: { bars: 190, nameSize: 15, nameLines: 2, labelSize: 12, pad: "9px 10px 8px", gap: 8 },
  2: { bars: 96, nameSize: 13, nameLines: 2, labelSize: 11, pad: "7px 9px 6px", gap: 6 },
  3: { bars: 70, nameSize: 12, nameLines: 1, labelSize: 10, pad: "6px 8px 5px", gap: 5 },
} as const;

export function WeekLandscape(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const { maxPerDay } = weekDensity(lines);
  const fit = FIT[Math.min(3, maxPerDay) as 1 | 2 | 3];
  const titleSize = p.name.length > 24 ? 44 : 56;
  return (
    <Sheet width={W} height={H} margin={32} padding="30px 40px 28px" transparent={p.transparent}>
      <Head scale={0.9} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, marginTop: 22 }}>
        <Title size={titleSize} style={{ flex: 1, minWidth: 0 }}>{p.name}</Title>
        <FactsLine plan={p.plan} stats={p.stats} size={17} style={{ flex: "none", paddingBottom: 8 }} />
      </div>
      <div style={{ marginTop: 22 }}>
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
      <Foot size={15} style={{ marginTop: "auto", paddingTop: 16 }} />
    </Sheet>
  );
}
