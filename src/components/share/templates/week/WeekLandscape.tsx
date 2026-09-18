/**
 * WeekLandscape, 1200×675 (16:9) for X, LinkedIn, Discord, a coach's inbox.
 *
 * The rhythm and the board are one object: seven bars, and under each bar
 * the day's cards. The bar says how much, the card says what, in the same
 * column, so the shape of the week and its content read in one pass.
 */

import { Sheet, Head, Title, FactsLine, Foot, RhythmColumns, DayColumns, weekLines } from "./_week";
import type { WeekShareProps } from "./_week";

const W = 1200;
const H = 675;

export function WeekLandscape(p: WeekShareProps) {
  const lines = weekLines(p.plan, p.workoutNames, p.workoutMeta);
  const titleSize = p.name.length > 24 ? 44 : 56;
  return (
    <Sheet width={W} height={H} margin={32} padding="30px 40px 28px" transparent={p.transparent}>
      <Head scale={0.9} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, marginTop: 22 }}>
        <Title size={titleSize} style={{ flex: 1, minWidth: 0 }}>{p.name}</Title>
        <FactsLine plan={p.plan} stats={p.stats} size={17} style={{ flex: "none", paddingBottom: 8 }} />
      </div>
      <div style={{ marginTop: 22 }}>
        <RhythmColumns slots={p.slots} height={190} gap={12} labels={false} />
      </div>
      <div style={{ marginTop: 10, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <DayColumns lines={lines} gap={12} nameSize={15} labelSize={12} cardPadding="9px 10px 8px" nameLines={2} />
      </div>
      <Foot size={15} style={{ marginTop: "auto", paddingTop: 16 }} />
    </Sheet>
  );
}
