/**
 * SessionSquare, 1080×1080 for a feed post.
 *
 * The same sheet as the portrait, with the room a square gives it: the
 * profile, the blocks as rows, and the time in zones pinned above the
 * footer. A long session takes its room from the rows' type, in steps.
 */

import { toZoneBarBlocks } from "@/components/visualization";
import { ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot } from "../week/_week";
import { BlockRows, SessionFacts, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1080;

/** Row sizes by how many blocks the list prints. */
function fitRows(rows: number) {
  if (rows <= 5) return { nameSize: 22, labelSize: 15, pad: 11, textLines: 2 };
  if (rows <= 8) return { nameSize: 19, labelSize: 14, pad: 8, textLines: 1 };
  if (rows <= 11) return { nameSize: 16, labelSize: 12, pad: 6, textLines: 1 };
  return { nameSize: 14, labelSize: 11, pad: 4, textLines: 1 };
}

export function SessionSquare({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, lines, label } = useSessionSheet(workout);
  const fit = fitRows(lines.length);
  const titleSize = name.length > 26 ? 52 : 68;
  return (
    <Sheet width={W} height={H} margin={40} padding="40px 44px 36px" transparent={transparent}>
      <Head label={label} />
      <Title size={titleSize} style={{ marginTop: 28 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} size={20} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 28 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={96} />
      </div>
      <div style={{ marginTop: 24, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <BlockRows
          lines={lines}
          nameSize={fit.nameSize}
          labelSize={fit.labelSize}
          rowPadding={fit.pad}
          textLines={fit.textLines}
          gutter={84}
        />
      </div>
      {/* Pinned above the footer: a short session leaves its air between
          the rows and the split, not under the split. */}
      <div style={{ marginTop: "auto", paddingTop: 22 }}>
        <ZoneSplit hero={hero} size={16} height={22} />
      </div>
      <Foot right={workout.id} size={17} style={{ marginTop: 26 }} />
    </Sheet>
  );
}
