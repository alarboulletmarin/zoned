/**
 * SessionLandscape, 1200×675 (16:9) for X, LinkedIn, Discord, a coach's
 * inbox.
 *
 * The name and the facts on one line, then the three phase cards side by
 * side, as the session page lays them out on a wide screen; each card's
 * head carries the phase's own profile, so the sheet needs no frieze of
 * its own. A dense main set takes two columns of steps and twice the
 * width, and the cards' type shrinks in steps.
 */

import { Sheet, Head, Title, Foot } from "../week/_week";
import { PhaseRow, SessionFacts, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1200;
const H = 675;

/** Type scale of the cards by how many rows the phases print. */
function fitRows(rows: number) {
  if (rows <= 6) return { s: 0.95, descLines: 3 };
  if (rows <= 10) return { s: 0.85, descLines: 2 };
  return { s: 0.75, descLines: 1 };
}

export function SessionLandscape({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const rows = phases.reduce((n, p) => n + p.rows, 0);
  const titleSize = name.length > 28 ? 36 : 52;
  return (
    <Sheet width={W} height={H} margin={32} padding="30px 40px 28px" transparent={transparent}>
      <Head scale={0.9} label={label} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, marginTop: 18 }}>
        <Title size={titleSize} style={{ flex: 1, minWidth: 0 }}>{name}</Title>
        <SessionFacts workout={workout} hero={hero} size={16} style={{ flex: "none", paddingBottom: 8 }} />
      </div>
      <div style={{ marginTop: 20, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <PhaseRow phases={phases} scale={fitRows(rows)} width={W - 64 - 80} gap={14} />
      </div>
      <Foot right={workout.id} size={15} style={{ marginTop: "auto", paddingTop: 16 }} />
    </Sheet>
  );
}
