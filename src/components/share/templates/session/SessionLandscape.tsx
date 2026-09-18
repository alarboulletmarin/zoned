/**
 * SessionLandscape, 1200×675 (16:9) for X, LinkedIn, Discord, a coach's
 * inbox.
 *
 * The name and the facts on one line, the profile across the width, then
 * the blocks as rows on the left and the time in zones with the tip on the
 * right. The sheet cannot grow, so a session past six blocks prints its
 * rows in two columns, smaller, and the panel narrows: no block is cut.
 */

import { toZoneBarBlocks } from "@/components/visualization";
import { ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot } from "../week/_week";
import { BlockRows, SessionFacts, Tip, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1200;
const H = 675;

/** By how many blocks the list prints: one column, or two. */
function fitRows(rows: number) {
  if (rows <= 6) return { columns: 1, nameSize: 16, labelSize: 12, pad: 8, gutter: 68, panel: 330 };
  return { columns: 2, nameSize: 13, labelSize: 10, pad: 4, gutter: 56, panel: 250 };
}

export function SessionLandscape({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, lines, label } = useSessionSheet(workout);
  const fit = fitRows(lines.length);
  const titleSize = name.length > 28 ? 36 : 52;
  const half = Math.ceil(lines.length / 2);
  const columns = fit.columns === 1 ? [lines] : [lines.slice(0, half), lines.slice(half)];
  return (
    <Sheet width={W} height={H} margin={32} padding="30px 40px 28px" transparent={transparent}>
      <Head scale={0.9} label={label} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, marginTop: 20 }}>
        <Title size={titleSize} style={{ flex: 1, minWidth: 0 }}>{name}</Title>
        <SessionFacts workout={workout} hero={hero} size={16} style={{ flex: "none", paddingBottom: 8 }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={fit.columns === 1 ? 84 : 70} />
      </div>
      <div style={{ marginTop: 16, flex: "1 1 0", minHeight: 0, display: "flex", gap: 28 }}>
        {columns.map((col, i) => (
          <div key={i} style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden" }}>
            <BlockRows
              lines={col}
              nameSize={fit.nameSize}
              labelSize={fit.labelSize}
              rowPadding={fit.pad}
              textLines={1}
              gutter={fit.gutter}
              openRule
            />
          </div>
        ))}
        <div style={{ flex: `0 0 ${fit.panel}px`, display: "flex", flexDirection: "column", gap: 20 }}>
          <ZoneSplit hero={hero} size={13} height={20} />
          <Tip workout={workout} size={14} labelSize={12} />
        </div>
      </div>
      <Foot right={workout.id} size={15} style={{ marginTop: 14, paddingTop: 16 }} />
    </Sheet>
  );
}
