/**
 * SessionSheet, 1080×1350 (4:5), the portrait post, and the one to send to
 * someone who will run it: the name, the facts, the profile large on the
 * ramp with its axis, then three ruled lines, one per phase, each block a
 * chip on its zone's tint with its duration, the phase's duration on the
 * right, and the blocks' words under a short phase. The time in zones
 * follows, and the first tip with the two runners take what is left.
 *
 * The chips shrink in steps as the session fills, so no block is cut.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { toZoneBarBlocks } from "@/components/visualization";
import { AccentPatch, ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot, INK_PALE } from "../week/_week";
import { FriezeAxis, PhaseLines, SessionFacts, Tip, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1350;

/** Type scale of the lines by how many blocks the phases hold. */
function fit(blocks: number) {
  if (blocks <= 6) return 1.15;
  if (blocks <= 12) return 1;
  if (blocks <= 20) return 0.9;
  return 0.8;
}

export function SessionSheet({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const blocks = phases.reduce((n, p) => n + p.blocks, 0);
  const titleSize = name.length > 26 ? 62 : 84;
  return (
    <Sheet width={W} height={H} transparent={transparent}>
      <AccentPatch />
      <Head label={label} />
      <Title size={titleSize} style={{ marginTop: 32 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} style={{ marginTop: 16 }} />
      <div style={{ marginTop: 34 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={170} />
        <FriezeAxis minutes={hero.durationMin} />
      </div>
      <div style={{ marginTop: 30, flex: "0 1 auto", minHeight: 0, overflow: "hidden" }}>
        <PhaseLines phases={phases} s={fit(blocks)} gutter={150} />
      </div>
      <div style={{ marginTop: 28 }}>
        <ZoneSplit hero={hero} size={17} height={24} />
      </div>
      {/* The tip and the two runners, muted, on what is left; a session
          that leaves no room folds them away. */}
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
        {blocks <= 24 && <Tip workout={workout} size={19} labelSize={15} style={{ flex: 1, minWidth: 0, paddingBottom: 6 }} />}
        {blocks <= 24 && (
          <div data-doodle="mute" style={{ height: "100%", maxHeight: 170, flex: "none", color: INK_PALE }}>
            <RunnersDuo style={{ height: "100%", width: "auto", display: "block" }} />
          </div>
        )}
      </div>
      <Foot right={workout.id} style={{ marginTop: 18 }} />
    </Sheet>
  );
}
