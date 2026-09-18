/**
 * SessionSquare, 1080×1080 for a feed post.
 *
 * The same sheet as the portrait with the room a square gives it: the
 * profile, the three phase lines, the time in zones pinned above the
 * footer. A long session takes its room from the chips' type, in steps.
 */

import { toZoneBarBlocks } from "@/components/visualization";
import { ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot } from "../week/_week";
import { FriezeAxis, PhaseLines, SessionFacts, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1080;

/** Type scale of the lines by how many blocks the phases hold. */
function fit(blocks: number) {
  if (blocks <= 6) return 1;
  if (blocks <= 12) return 0.9;
  if (blocks <= 20) return 0.8;
  return 0.72;
}

export function SessionSquare({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const blocks = phases.reduce((n, p) => n + p.blocks, 0);
  const titleSize = name.length > 26 ? 52 : 68;
  return (
    <Sheet width={W} height={H} margin={40} padding="40px 44px 36px" transparent={transparent}>
      <Head label={label} />
      <Title size={titleSize} style={{ marginTop: 28 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} size={20} style={{ marginTop: 14 }} />
      <div style={{ marginTop: 28 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={130} />
        <FriezeAxis minutes={hero.durationMin} size={14} />
      </div>
      <div style={{ marginTop: 24, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <PhaseLines phases={phases} s={fit(blocks)} gutter={140} descriptions={blocks <= 6} />
      </div>
      {/* Pinned above the footer: a short session leaves its air between
          the lines and the split, not under the split. */}
      <div style={{ marginTop: "auto", paddingTop: 22 }}>
        <ZoneSplit hero={hero} size={16} height={22} />
      </div>
      <Foot right={workout.id} size={17} style={{ marginTop: 24 }} />
    </Sheet>
  );
}
