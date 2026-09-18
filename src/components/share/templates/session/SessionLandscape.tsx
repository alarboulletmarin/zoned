/**
 * SessionLandscape, 1200×675 (16:9) for X, LinkedIn, Discord, a coach's
 * inbox.
 *
 * The name and the facts on one line, the profile across the width, then
 * the three phase lines, chips only: the words of the blocks would not fit
 * and the chips say the session. The time in zones sits above the footer
 * as a bar and its legend.
 */

import { toZoneBarBlocks } from "@/components/visualization";
import { ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot } from "../week/_week";
import { PhaseLines, SessionFacts, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1200;
const H = 675;

/** Type scale of the lines by how many blocks the phases hold. */
function fit(blocks: number) {
  if (blocks <= 6) return 0.8;
  if (blocks <= 12) return 0.72;
  return 0.65;
}

export function SessionLandscape({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const blocks = phases.reduce((n, p) => n + p.blocks, 0);
  const titleSize = name.length > 28 ? 36 : 52;
  return (
    <Sheet width={W} height={H} margin={32} padding="30px 40px 28px" transparent={transparent}>
      <Head scale={0.9} label={label} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, marginTop: 18 }}>
        <Title size={titleSize} style={{ flex: 1, minWidth: 0 }}>{name}</Title>
        <SessionFacts workout={workout} hero={hero} size={16} style={{ flex: "none", paddingBottom: 8 }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={76} />
      </div>
      <div style={{ marginTop: 14, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <PhaseLines phases={phases} s={fit(blocks)} gutter={120} descriptions={false} />
      </div>
      <div style={{ marginTop: "auto", paddingTop: 14 }}>
        <ZoneSplit hero={hero} size={12} height={16} />
      </div>
      <Foot right={workout.id} size={15} style={{ marginTop: 14, paddingTop: 12 }} />
    </Sheet>
  );
}
