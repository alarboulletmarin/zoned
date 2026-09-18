/**
 * SessionSheet, 1080×1350 (4:5), the portrait post, and the one to send to
 * someone who will run it: the name, the facts, the profile on the ramp,
 * every block as a row under its phase with its figure on the right, the
 * time in zones, and the first tip. The two runners take whatever room a
 * short session leaves before the footer.
 *
 * The rows shrink in steps as the session fills: a fourteen-block session
 * prints smaller type and tighter rows, so no block is cut off the sheet.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { toZoneBarBlocks } from "@/components/visualization";
import { AccentPatch, ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot, INK_PALE } from "../week/_week";
import { BlockRows, SessionFacts, Tip, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1350;

/** Row sizes by how many blocks the list prints. */
function fitRows(rows: number) {
  if (rows <= 6) return { nameSize: 26, labelSize: 16, pad: 14, textLines: 2, tip: true };
  if (rows <= 9) return { nameSize: 22, labelSize: 15, pad: 10, textLines: 2, tip: true };
  if (rows <= 13) return { nameSize: 19, labelSize: 14, pad: 7, textLines: 1, tip: false };
  return { nameSize: 16, labelSize: 12, pad: 5, textLines: 1, tip: false };
}

export function SessionSheet({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, lines, label } = useSessionSheet(workout);
  const fit = fitRows(lines.length);
  const titleSize = name.length > 26 ? 62 : 84;
  return (
    <Sheet width={W} height={H} transparent={transparent}>
      <AccentPatch />
      <Head label={label} />
      <Title size={titleSize} style={{ marginTop: 32 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} style={{ marginTop: 16 }} />
      <div style={{ marginTop: 32 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={110} />
      </div>
      <div style={{ marginTop: 30, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <BlockRows
          lines={lines}
          nameSize={fit.nameSize}
          labelSize={fit.labelSize}
          rowPadding={fit.pad}
          textLines={fit.textLines}
          gutter={96}
        />
      </div>
      <div style={{ marginTop: 26 }}>
        <ZoneSplit hero={hero} size={17} height={24} />
      </div>
      {/* The two runners, muted, on what is left; a session that leaves no
          room folds them away. The tip sits on the ground rule beside them,
          and a dense session, which leaves neither any room, prints neither. */}
      <div
        style={{
          flex: "1 1 0",
          minHeight: 0,
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 32,
          overflow: "hidden",
        }}
      >
        {fit.tip && <Tip workout={workout} size={19} labelSize={15} style={{ flex: 1, minWidth: 0, paddingBottom: 6 }} />}
        {fit.tip && (
          <div data-doodle="mute" style={{ height: "100%", maxHeight: 170, flex: "none", color: INK_PALE }}>
            <RunnersDuo style={{ height: "100%", width: "auto", display: "block" }} />
          </div>
        )}
      </div>
      <Foot right={workout.id} style={{ marginTop: 18 }} />
    </Sheet>
  );
}
