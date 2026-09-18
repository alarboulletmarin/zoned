/**
 * SessionSquare, 1080×1080 for a feed post.
 *
 * The same sheet as the portrait, with the room a square gives it: the
 * profile, the three phase cards side by side, the time in zones pinned
 * above the footer. A long session takes its room from the cards' type,
 * in steps.
 */

import { toZoneBarBlocks } from "@/components/visualization";
import { ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot } from "../week/_week";
import { PhaseRow, SessionFacts, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1080;

/** Type scale of the cards by how many rows the phases print. */
function fitRows(rows: number) {
  if (rows <= 6) return { s: 1.05, descLines: 3 };
  if (rows <= 10) return { s: 0.95, descLines: 2 };
  if (rows <= 14) return { s: 0.85, descLines: 2 };
  return { s: 0.78, descLines: 1 };
}

export function SessionSquare({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const rows = phases.reduce((n, p) => n + p.rows, 0);
  const titleSize = name.length > 26 ? 52 : 68;
  return (
    <Sheet width={W} height={H} margin={40} padding="40px 44px 36px" transparent={transparent}>
      <Head label={label} />
      <Title size={titleSize} style={{ marginTop: 28 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} size={20} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 26 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={72} />
      </div>
      <div style={{ marginTop: 22, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <PhaseRow phases={phases} scale={fitRows(rows)} width={W - 80 - 88} gap={14} />
      </div>
      <div style={{ marginTop: "auto", paddingTop: 22 }}>
        <ZoneSplit hero={hero} size={16} height={22} />
      </div>
      <Foot right={workout.id} size={17} style={{ marginTop: 24 }} />
    </Sheet>
  );
}
