import type { CSSProperties } from "react";
import { COLORS, useLayout } from "../../theme";
import { useCopy } from "../../copy";
import { beat, useBreath, useEnter, useSpring } from "../../motion";
import { Reveal } from "../Type";

/**
 * The four promises, stated flatly.
 *
 * No competitor named, no price compared. What Zoned costs and what it asks for
 * is a property of Zoned, not a scoreboard — an earlier cut ran a comparison
 * table here and it made the film about other people's products.
 *
 * Every line is verifiable: the licence is MIT, the code is public, there is no
 * server to hold an account and nothing to track.
 */
export const FreedomList: React.FC<{ at?: number; style?: CSSProperties }> = ({
  at = 0,
  style,
}) => {
  const l = useLayout();
  const copy = useCopy().visuals.freedom;
  const closing = useEnter(at + 38, { dur: 26, y: 18, blur: 4 });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: l.story ? 14 : 12,
        minHeight: 0,
        ...style,
      }}
    >
      {copy.promises.map((p, i) => (
        <Row key={p.title} {...p} at={beat(at, i, 7)} index={i} />
      ))}

      <div
        style={{
          ...closing,
          marginTop: l.story ? 22 : 18,
          fontSize: l.body,
          fontWeight: 600,
          color: COLORS.muted,
        }}
      >
        {copy.closing}
      </div>
    </div>
  );
};

const Row: React.FC<{ title: string; detail: string; at: number; index: number }> = ({
  title,
  detail,
  at,
  index,
}) => {
  const l = useLayout();
  const land = useSpring(at, { bounce: 0.32, speed: 1 });
  const drift = useBreath(5.6 + index * 0.7, 4, index * 1.3);
  const mark = useBreath(3.2 + index * 0.4, 0.08, index);

  return (
    <div
      style={{
        opacity: Math.min(1, land * 2),
        transform: `translate(${(1 - land) * -20 + drift}px, 0)`,
        display: "flex",
        alignItems: "center",
        gap: l.story ? 22 : 20,
        padding: l.story ? "20px 24px" : "18px 22px",
        borderRadius: 16,
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 16px 30px -24px rgba(15,23,42,0.2)",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          width: l.story ? 14 : 12,
          height: l.story ? 14 : 12,
          borderRadius: 999,
          background: COLORS.accent,
          transform: `scale(${1 + mark})`,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <Reveal at={at + 3} dur={26}>
          <span
            style={{
              fontSize: l.story ? 36 : 31,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.06,
            }}
          >
            {title}
          </span>
        </Reveal>
        <Reveal at={at + 7} dur={26}>
          <span
            style={{
              fontSize: l.story ? 24 : 21,
              fontWeight: 500,
              color: COLORS.muted,
              lineHeight: 1.25,
            }}
          >
            {detail}
          </span>
        </Reveal>
      </div>
    </div>
  );
};
