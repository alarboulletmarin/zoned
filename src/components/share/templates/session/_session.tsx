/**
 * A session's share images, in the house style: the same paper, ink, ruled
 * frame and wordmark as the week's sheets, with what a session has to say.
 * The name, the facts in mono, the profile on the ink ramp, the blocks as
 * ruled rows under their phase, the time in zones, and one tip.
 *
 * Four sheets share these parts. Inline styles with literal hex like every
 * share template: html-to-image rasterises the node and no CSS custom
 * property survives the capture. The figures come from the same helpers the
 * page reads (`getWorkoutHero`, `toZoneBarBlocks`), so the image shows the
 * session the page shows.
 */

import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { usePickLang, useIsEnglish, usePickLangArray } from "@/lib/i18n-utils";
import { CATEGORY_META, DIFFICULTY_META, type WorkoutBlock, type WorkoutTemplate } from "@/types";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero, type WorkoutHero } from "@/lib/export/workoutHero";
import { INK, INK_2, RULE, MONO, sessionTss } from "../_paper";
import { RULE_HAIR, zoneInk, ZoneDot } from "../week/_week";

export type Phase = "warmup" | "mainSet" | "cooldown";

/** One block as the sheets print it. */
export interface BlockLine {
  phase: Phase;
  /** First block of its phase: it carries the phase label in the gutter. */
  first: boolean;
  text: string;
  /** The zone as written on the block: Z2, Z1-Z2, or nothing. */
  zone: string;
  /** The zone the dot is inked at, the first one the spec names. */
  zoneNo: number | null;
  /** The mono figure on the right: 8 × 3min, 3 × 12, 20min. */
  figure: string;
}

/** The first zone a spec names: "Z1-Z2" reads Z1, "Z4" reads Z4. */
export function primaryZone(spec?: string): number | null {
  const m = spec?.match(/([1-6])/);
  return m ? Number(m[1]) : null;
}

/** 8 × 3min, 3 × 12, 20min, or nothing: the block's figure. */
function figureOf(block: WorkoutBlock): string {
  const duration = block.durationMin ? formatDurationMinutes(block.durationMin) : "";
  if (block.sets && block.repetitions) return `${block.sets} × ${block.repetitions}`;
  if (block.repetitions && block.repetitions > 1) {
    return duration ? `${block.repetitions} × ${duration}` : `${block.repetitions} ×`;
  }
  return duration;
}

/** The session's blocks in reading order, warm-up first. */
export function sessionLines(
  workout: WorkoutTemplate,
  pickLang: ReturnType<typeof usePickLang>,
): BlockLine[] {
  const phases: [Phase, WorkoutBlock[] | undefined][] = [
    ["warmup", workout.warmupTemplate],
    ["mainSet", workout.mainSetTemplate],
    ["cooldown", workout.cooldownTemplate],
  ];
  const lines: BlockLine[] = [];
  for (const [phase, blocks] of phases) {
    (blocks ?? []).forEach((block, i) => {
      lines.push({
        phase,
        first: i === 0,
        text: pickLang(block, "description"),
        zone: block.zone ?? "",
        zoneNo: primaryZone(block.zone),
        figure: figureOf(block),
      });
    });
  }
  return lines;
}

/** What the sheet is, on the right of the wordmark. */
export function useSessionLabel(): string {
  const isEn = useIsEnglish();
  return isEn ? "Session" : "Séance";
}

/**
 * The mono line under the name: category, difficulty, duration, dominant
 * zone, load. What the page's facts strip prints, at print size.
 */
export function SessionFacts({
  workout,
  hero,
  size = 22,
  style,
}: {
  workout: WorkoutTemplate;
  hero: WorkoutHero;
  size?: number;
  style?: CSSProperties;
}) {
  const pickLang = usePickLang();
  const parts = [
    pickLang(CATEGORY_META[workout.category], "label"),
    pickLang(DIFFICULTY_META[workout.difficulty], "label"),
    formatDurationMinutes(hero.durationMin),
    `Z${hero.dominantZone}`,
    `${sessionTss(hero.zoneBreakdown)} TSS`,
  ].filter(Boolean);
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: "0.06em",
        color: INK_2,
        ...style,
      }}
    >
      {parts.join("  ·  ")}
    </div>
  );
}

interface BlockRowsProps {
  lines: BlockLine[];
  nameSize?: number;
  labelSize?: number;
  rowPadding?: number;
  /** Width of the phase gutter. */
  gutter?: number;
  /** Lines a description may take before it is cut. */
  textLines?: number;
  /** Open the list on a rule even when its first row is mid-phase. */
  openRule?: boolean;
}

/**
 * The blocks as rows: the phase in the gutter on its first row, the zone
 * dot, the description, and the figure on the right in mono. A phase opens
 * on a rule, a block inside it on a hairline, like the week's rows.
 */
export function BlockRows({
  lines,
  nameSize = 24,
  labelSize = 16,
  rowPadding = 14,
  gutter = 110,
  textLines = 2,
  openRule = false,
}: BlockRowsProps) {
  const { t } = useTranslation("common");
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 18,
            padding: `${rowPadding}px 0`,
            borderTop: l.first || (openRule && i === 0) ? RULE : RULE_HAIR,
            borderBottom: i === lines.length - 1 ? RULE : undefined,
          }}
        >
          <span
            style={{
              flex: "none",
              width: gutter,
              paddingTop: Math.round(nameSize * 0.2),
              fontFamily: MONO,
              fontSize: labelSize,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: INK_2,
            }}
          >
            {l.first ? t(`export.planPdf.${l.phase}`) : ""}
          </span>
          <ZoneDot zone={l.zoneNo} size={Math.round(nameSize * 0.5)} />
          <span
            style={{
              flex: 1,
              minWidth: 0,
              marginTop: -Math.round(nameSize * 0.1),
              fontSize: nameSize,
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
              display: "-webkit-box",
              WebkitLineClamp: textLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              overflowWrap: "anywhere",
            }}
          >
            {l.text}
          </span>
          <span
            style={{
              flex: "none",
              display: "flex",
              gap: 14,
              fontFamily: MONO,
              fontSize: labelSize + 2,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            {l.figure && <span>{l.figure}</span>}
            {l.zone && <span style={{ color: l.zoneNo ? INK : INK_2 }}>{l.zone}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Time in zones: the session's minutes on a ruled bar, each zone's share
 * at its ink, and the shares in words under it. The page's breakdown, at
 * print size.
 */
export function ZoneSplit({
  hero,
  size = 18,
  height = 26,
}: {
  hero: WorkoutHero;
  size?: number;
  height?: number;
}) {
  const isEn = useIsEnglish();
  const parts = hero.zoneBreakdown.filter((z) => z.zone != null && z.percent > 0);
  if (parts.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: MONO,
          fontSize: size,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ fontWeight: 700 }}>{isEn ? "Time in zones" : "Temps par zone"}</span>
        <span style={{ color: INK_2 }}>{formatDurationMinutes(hero.durationMin)}</span>
      </div>
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          height,
          border: RULE,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {parts.map((p, i) => (
          <div
            key={i}
            style={{
              flexGrow: p.percent,
              flexBasis: 0,
              background: zoneInk(p.zone),
              borderLeft: i > 0 ? `1.5px solid ${INK}` : undefined,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: `8px ${Math.round(size * 1.4)}px`,
          fontFamily: MONO,
          fontSize: size,
          letterSpacing: "0.04em",
          color: INK_2,
        }}
      >
        {parts.map((p, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ZoneDot zone={p.zone} size={Math.round(size * 0.7)} />
            Z{p.zone} {Math.round(p.percent)} %
          </span>
        ))}
      </div>
    </div>
  );
}

/** The first coaching tip, under a mono kicker; nothing when there is none. */
export function Tip({
  workout,
  size = 20,
  labelSize = 16,
  style,
}: {
  workout: WorkoutTemplate;
  size?: number;
  labelSize?: number;
  style?: CSSProperties;
}) {
  const isEn = useIsEnglish();
  const pickLangArray = usePickLangArray();
  const tip = pickLangArray<string>(workout, "coachingTips")[0];
  if (!tip) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: labelSize,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: INK_2,
        }}
      >
        {isEn ? "Tip" : "Conseil"}
      </span>
      <span
        style={{
          fontSize: size,
          lineHeight: 1.3,
          color: INK_2,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {tip}
      </span>
    </div>
  );
}

/** Everything a session sheet reads, computed once. */
export function useSessionSheet(workout: WorkoutTemplate) {
  const pickLang = usePickLang();
  return {
    name: pickLang(workout, "name"),
    hero: getWorkoutHero(workout),
    lines: sessionLines(workout, pickLang),
    label: useSessionLabel(),
  };
}
