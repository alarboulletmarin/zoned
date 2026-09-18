/**
 * SessionSheet, 1080×1350 (4:5), the portrait post, and the one to send to
 * someone who will run it: the name, the facts, the profile on the ramp,
 * the three phases as the cards the session page draws them, side by
 * side, and the time in zones above the footer.
 *
 * The cards shrink in steps as the session fills, and a dense main set
 * takes two columns of steps and twice the width, so no step is cut. The
 * first tip and the two runners take whatever room a short session leaves
 * before the footer, and a dense one folds them away.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { toZoneBarBlocks } from "@/components/visualization";
import { AccentPatch, ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot, INK_PALE } from "../week/_week";
import { PhaseRow, SessionFacts, Tip, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1350;

/** Type scale of the cards by how many rows the phases print. */
function fitRows(rows: number) {
  if (rows <= 6) return { s: 1.25, descLines: 3 };
  if (rows <= 9) return { s: 1.1, descLines: 2 };
  if (rows <= 12) return { s: 1, descLines: 2 };
  return { s: 0.9, descLines: 1 };
}

export function SessionSheet({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const rows = phases.reduce((n, p) => n + p.rows, 0);
  const titleSize = name.length > 26 ? 62 : 84;
  return (
    <Sheet width={W} height={H} transparent={transparent}>
      <AccentPatch />
      <Head label={label} />
      <Title size={titleSize} style={{ marginTop: 32 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} style={{ marginTop: 16 }} />
      <div style={{ marginTop: 30 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={96} />
      </div>
      <div style={{ marginTop: 28, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <PhaseRow phases={phases} scale={fitRows(rows)} width={W - 80 - 104} gap={16} />
      </div>
      <div style={{ marginTop: 26 }}>
        <ZoneSplit hero={hero} size={17} height={24} />
      </div>
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
        {rows <= 8 && <Tip workout={workout} size={19} labelSize={15} style={{ flex: 1, minWidth: 0, paddingBottom: 6 }} />}
        {rows <= 8 && (
          <div data-doodle="mute" style={{ height: "100%", maxHeight: 170, flex: "none", color: INK_PALE }}>
            <RunnersDuo style={{ height: "100%", width: "auto", display: "block" }} />
          </div>
        )}
      </div>
      <Foot right={workout.id} style={{ marginTop: 18 }} />
    </Sheet>
  );
}
