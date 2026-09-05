import type { CSSProperties } from "react";
import { COLORS, useLayout } from "../../theme";
import { useCopy } from "../../copy";
import { beat, useBreath, useEnter, useSpring } from "../../motion";
import { Reveal } from "../Type";
import { SCIENCE, useFacts } from "../../data/facts";

/**
 * The researchers the catalogue is built on.
 *
 * Name, the physiological system they are cited under and the year of the
 * paper — all three read out of `src/data/science/data.ts` by `bun run sync`.
 * This is the claim the rest of the film rests on, so nothing here is written
 * by hand.
 */
export const ScienceGrid: React.FC<{
  at?: number;
  /** How many cards to show; the rest of the table is summarised by the counts. */
  count?: number;
  style?: CSSProperties;
}> = ({ at = 0, count, style }) => {
  const l = useLayout();
  const cards = useFacts().science.cards.slice(0, count ?? (l.story ? 6 : 8));
  const cols = l.story ? 2 : 4;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: l.story ? 16 : 18,
        alignContent: "center",
        minHeight: 0,
        ...style,
      }}
    >
      {cards.map((c, i) => (
        <Card key={c.name} {...c} at={beat(at, i, 5)} index={i} />
      ))}
    </div>
  );
};

const Card: React.FC<{
  name: string;
  system: string;
  year: number;
  at: number;
  index: number;
}> = ({ name, system, year, at, index }) => {
  const l = useLayout();
  const land = useSpring(at, { bounce: 0.3, speed: 1.05 });
  // Each card keeps floating on its own period once it has landed. Without it
  // the grid freezes the moment the last one arrives, and `bun run qa:motion`
  // catches exactly that.
  const floatY = useBreath(4.4 + (index % 5) * 0.5, 5, index * 1.1);
  const floatX = useBreath(6.2 + (index % 4) * 0.6, 3, index * 0.7);

  return (
    <div
      style={{
        opacity: Math.min(1, land * 2),
        transform: `translate(${floatX}px, ${(1 - land) * 26 + floatY}px) scale(${0.94 + land * 0.06})`,
        padding: l.story ? "20px 22px" : "18px 20px",
        borderRadius: 16,
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 18px 34px -22px rgba(15,23,42,0.22)",
      }}
    >
      <div
        style={{
          fontSize: l.story ? 17 : 15,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: COLORS.accent,
          marginBottom: 10,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {system}
      </div>
      <div
        style={{
          fontSize: l.story ? 34 : 30,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: l.story ? 22 : 20,
          fontWeight: 500,
          color: COLORS.muted,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {year}
      </div>
    </div>
  );
};

/** The three counts, for an act that wants the scale rather than the names. */
export const ScienceCounts: React.FC<{ at?: number; style?: CSSProperties }> = ({
  at = 0,
  style,
}) => {
  const l = useLayout();
  const labels = useCopy().visuals.science;
  const items = [
    { n: SCIENCE.authors, label: labels.authors },
    { n: SCIENCE.references, label: labels.references },
    { n: SCIENCE.systems, label: labels.systems },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: l.story ? "column" : "row",
        gap: l.story ? 22 : 40,
        ...style,
      }}
    >
      {items.map((item, i) => (
        <CountLine key={item.label} {...item} at={beat(at, i, 8)} />
      ))}
    </div>
  );
};

const CountLine: React.FC<{ n: number; label: string; at: number }> = ({ n, label, at }) => {
  const l = useLayout();
  const enter = useEnter(at, { dur: 24, y: 18, blur: 4 });

  return (
    <div style={{ ...enter, display: "flex", alignItems: "baseline", gap: 12 }}>
      <span
        style={{
          fontSize: l.story ? 58 : 52,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {n}
      </span>
      <Reveal at={at + 6} dur={24}>
        <span style={{ fontSize: l.body, fontWeight: 500, color: COLORS.muted }}>{label}</span>
      </Reveal>
    </div>
  );
};

export const SCIENCE_META = SCIENCE;
