/**
 * SessionStory, 1080×1920, the story format.
 *
 * The profile first and tall, the session's shape at arm's length; then
 * the three phases stacked full width, as the session page draws them on
 * a phone, a dense main set flowing into two columns; the time in zones;
 * the tip; and the two runners, in ink, on the ground rule of the footer.
 * A long session takes its room from the cards' type, in steps, and the
 * runners give way first.
 */

import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { toZoneBarBlocks } from "@/components/visualization";
import { AccentPatch, ZoneFrieze } from "../_paper";
import { Sheet, Head, Title, Foot, INK_PALE } from "../week/_week";
import { PhaseCard, SessionFacts, Tip, ZoneSplit, useSessionSheet } from "./_session";
import type { ShareTemplateProps } from "../../shareTemplates";

const W = 1080;
const H = 1920;

/** Type scale of the cards by how many rows the phases print. */
function fitRows(rows: number) {
  if (rows <= 4) return { s: 1.3, descLines: 3 };
  if (rows <= 8) return { s: 1.15, descLines: 2 };
  if (rows <= 12) return { s: 1.05, descLines: 2 };
  return { s: 0.95, descLines: 1 };
}

export function SessionStory({ workout, transparent }: ShareTemplateProps) {
  const { name, hero, phases, label } = useSessionSheet(workout);
  const rows = phases.reduce((n, p) => n + p.rows, 0);
  const scale = fitRows(rows);
  const titleSize = name.length > 22 ? 72 : 96;
  return (
    <Sheet width={W} height={H} padding="52px 56px 44px" transparent={transparent}>
      <AccentPatch />
      <Head scale={1.15} label={label} />
      <Title size={titleSize} style={{ marginTop: 44 }}>{name}</Title>
      <SessionFacts workout={workout} hero={hero} size={24} style={{ marginTop: 18 }} />
      <div style={{ marginTop: 40 }}>
        <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={150} />
      </div>
      <div style={{ marginTop: 36, flex: "0 1 auto", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 18 }}>
        {phases.map((phase) => (
          <PhaseCard key={phase.key} phase={phase} scale={scale} columns={phase.key === "main" && phase.steps.length > 3 ? 2 : 1} />
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <ZoneSplit hero={hero} size={18} height={26} />
      </div>
      <Tip workout={workout} size={22} labelSize={17} style={{ marginTop: 32 }} />
      {/* The two runners, muted, walking off the footer's rule, on the room
          the session leaves them; one that leaves none folds them away. */}
      <div
        data-doodle="mute"
        style={{
          flex: "1 1 0",
          minHeight: 0,
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          color: INK_PALE,
        }}
      >
        <RunnersDuo style={{ height: "100%", maxHeight: 220, width: "auto", display: "block" }} />
      </div>
      <Foot right={workout.id} size={21} style={{ paddingTop: 24 }} />
    </Sheet>
  );
}
