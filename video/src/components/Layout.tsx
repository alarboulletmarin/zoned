import type { CSSProperties, ReactNode } from "react";
import { useLayout } from "../theme";
import { Eyebrow, Headline, Sub } from "./Type";

/**
 * The one layout both cuts share: a lead column of type and a side column of
 * evidence. Landscape sets them beside each other, vertical stacks them.
 *
 * Every act is written once against this, which is why no composition ever
 * branches on format.
 */
export const Split: React.FC<{
  lead: ReactNode;
  side: ReactNode;
  /** Landscape column ratio for the side column. */
  ratio?: number;
  style?: CSSProperties;
}> = ({ lead, side, ratio = 1.06, style }) => {
  const l = useLayout();

  if (l.story) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 54,
          minHeight: 0,
          ...style,
        }}
      >
        <div style={{ flex: "0 0 auto" }}>{lead}</div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {side}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: `1fr ${ratio}fr`,
        columnGap: 104,
        alignItems: "stretch",
        minHeight: 0,
        ...style,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {lead}
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: 0, justifyContent: "center" }}
      >
        {side}
      </div>
    </div>
  );
};

/**
 * Eyebrow, headline, sub — the block that opens nearly every act, cascading.
 *
 * It carries the context rule: the viewer knows neither the product nor the
 * concept, so an act says what is being looked at before it animates anything.
 */
export const ActHeader: React.FC<{
  eyebrow?: string;
  /** Headline broken into its lines; two or three, never more. */
  lines: ReactNode[];
  sub?: ReactNode;
  at?: number;
  size?: number;
  style?: CSSProperties;
}> = ({ eyebrow, lines, sub, at = 0, size, style }) => {
  const l = useLayout();

  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      {eyebrow ? <Eyebrow at={at}>{eyebrow}</Eyebrow> : null}
      <Headline
        lines={lines}
        at={at + (eyebrow ? 7 : 0)}
        each={7}
        size={size}
        style={{ marginTop: eyebrow ? l.gap * 0.7 : 0 }}
      />
      {sub ? (
        <Sub at={at + 7 * lines.length + 6} style={{ marginTop: l.gap * 0.68 }}>
          {sub}
        </Sub>
      ) : null}
    </div>
  );
};
