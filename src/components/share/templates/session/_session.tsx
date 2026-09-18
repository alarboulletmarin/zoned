/**
 * A session's share images, in the house style: the same paper, ink, ruled
 * frame and wordmark as the week's sheets, with what a session has to say.
 * The name, the facts in mono, the profile on the ink ramp, large, and the
 * three phases as three ruled lines, each block a chip on its zone's tint
 * (its duration and its code), repeats written the way the page's summary
 * writes them; then the time in zones, and one tip.
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
import {
  CATEGORY_META,
  DIFFICULTY_META,
  parseZoneSpan,
  type WorkoutStep,
  type WorkoutStepSegment,
  type WorkoutTemplate,
  type ZoneNumber,
} from "@/types";
import { formatDurationMinutes, transformSessionBlocks } from "@/components/visualization";
import { getWorkoutPhaseSteps } from "@/lib/workoutStructure";
import { getWorkoutHero, type WorkoutHero } from "@/lib/export/workoutHero";
import { UNZONED_HEX } from "@/lib/zoneColors";
import { PAPER, INK, INK_2, RULE, MONO, sessionTss } from "../_paper";
import { RULE_HAIR, zoneInk, ZoneDot } from "../week/_week";

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
  const { t } = useTranslation("session");
  return {
    name: pickLang(workout, "name"),
    hero: getWorkoutHero(workout),
    phases: sessionPhases(workout, t, pickLang),
    label: useSessionLabel(),
  };
}

// ── the phases, as three lines ───────────────────────────────────────────

export type PhaseKey = "warmup" | "main" | "cooldown";

/** One token of a phase line: a block as a chip, or a word between chips. */
export type PhaseToken =
  | { kind: "chip"; text: string; zone: string | undefined; recovery: boolean }
  | { kind: "text"; text: string };

/** One phase: its line of tokens, and what its row prints beside it. */
export interface PhaseSheet {
  key: PhaseKey;
  label: string;
  tokens: PhaseToken[];
  /** The blocks' descriptions, printed under the chips on a short phase. */
  descriptions: string[];
  /** Blocks the phase holds, repeats unrolled once: what decides the fit. */
  blocks: number;
  minutes: number;
}

/** 30", 1'30, 15', 100 m: the block's figure, the way the page's summary writes it. */
function chipText(step: WorkoutStepSegment): string {
  if (step.durationSec != null) {
    const sec = Math.round(step.durationSec);
    if (sec < 60) return `${sec}"`;
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    return r ? `${m}'${String(r).padStart(2, "0")}` : `${m}'`;
  }
  if (step.distanceKm != null) return `${step.distanceKm} km`;
  if (step.distanceM != null) return `${step.distanceM} m`;
  return "";
}

/** A block without a figure prints its words instead: "30/30 VMA", "Gammes". */
function chip(step: WorkoutStepSegment, pickLang: ReturnType<typeof usePickLang>, recovery = false): PhaseToken {
  return {
    kind: "chip",
    text: chipText(step) || pickLang(step, "description"),
    zone: step.zone,
    recovery: recovery || step.role === "recovery",
  };
}

/**
 * The steps as a line of tokens, in the grammar of the page's summary:
 * a repeat is its count, then its blocks, then `/` and the recovery between
 * them; sets of reps wrap the reps in parentheses and add `+` and the
 * recovery between sets.
 */
function tokensOf(
  steps: WorkoutStep[],
  pickLang: ReturnType<typeof usePickLang>,
  out: PhaseToken[] = [],
): PhaseToken[] {
  for (const step of steps) {
    if (step.kind === "segment") {
      out.push(chip(step, pickLang));
      continue;
    }
    out.push({ kind: "text", text: `${step.count} ×` });
    const nested = step.steps.length === 1 && step.steps[0]?.kind === "repeat";
    if (nested) out.push({ kind: "text", text: "(" });
    tokensOf(step.steps, pickLang, out);
    if (nested) out.push({ kind: "text", text: ")" });
    const between = step.between ?? [];
    if (between.length > 0) {
      out.push({ kind: "text", text: nested || step.unit === "sets" ? "+" : "/" });
      for (const b of between) {
        if (b.kind === "segment") out.push(chip(b, pickLang, true));
        else tokensOf([b], pickLang, out);
      }
    }
  }
  return out;
}

/** Every segment of the steps, repeats unrolled once, in reading order. */
function flatten(steps: WorkoutStep[], out: WorkoutStepSegment[] = []): WorkoutStepSegment[] {
  for (const step of steps) {
    if (step.kind === "segment") out.push(step);
    else {
      flatten(step.steps, out);
      flatten(step.between ?? [], out);
    }
  }
  return out;
}

/** The three phases with steps, in running order, as `WorkoutStructure` reads them. */
export function sessionPhases(
  workout: WorkoutTemplate,
  t: (key: string, opts?: Record<string, unknown>) => string,
  pickLang: ReturnType<typeof usePickLang>,
): PhaseSheet[] {
  const { segments } = transformSessionBlocks(workout);
  return (["warmup", "main", "cooldown"] as const)
    .map((key) => {
      const steps = getWorkoutPhaseSteps(workout, key);
      const flat = flatten(steps);
      return {
        key,
        label: t(`structure.${key}`),
        tokens: tokensOf(steps, pickLang),
        descriptions: flat.map((seg) => pickLang(seg, "description")).filter(Boolean),
        blocks: flat.length,
        minutes: segments.filter((seg) => seg.type === key).reduce((sum, seg) => sum + seg.durationMin, 0),
      };
    })
    .filter((phase) => phase.tokens.length > 0);
}

/** The chip's fill, `--zone-N-bg` on paper; Z4 and up take the paper for ink. */
const CHIP_FILL: Record<ZoneNumber, string> = {
  1: "rgba(23, 22, 20, 0.07)",
  2: "rgba(23, 22, 20, 0.12)",
  3: "rgba(23, 22, 20, 0.18)",
  4: "rgba(23, 22, 20, 0.62)",
  5: "rgba(23, 22, 20, 0.80)",
  6: INK,
};

/**
 * One block as a chip: its figure and its zone code on the zone's tint,
 * the page's zone badge with the duration in it. A recovery block is
 * dashed, the gap rather than the work; a block without a zone sits on
 * sunken paper.
 */
function Chip({ token, s }: { token: Extract<PhaseToken, { kind: "chip" }>; s: number }) {
  const span = parseZoneSpan(token.zone);
  const code = span ? (span.min === span.max ? `Z${span.max}` : `Z${span.min}-Z${span.max}`) : "";
  const dark = span != null && span.max >= 4 && !token.recovery;
  const fill = token.recovery ? PAPER : span ? CHIP_FILL[span.max] : UNZONED_HEX;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 7 * s,
        padding: `${5 * s}px ${11 * s}px`,
        border: token.recovery ? `1.5px dashed ${INK_2}` : RULE,
        borderRadius: 8 * s,
        background: fill,
        color: dark ? PAPER : INK,
        fontFamily: MONO,
        fontSize: 20 * s,
        fontWeight: 700,
        letterSpacing: "0.02em",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      {token.text && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{token.text}</span>}
      {code && <span style={{ fontSize: 16 * s, fontWeight: 700, opacity: token.text ? 0.85 : 1 }}>{code}</span>}
    </span>
  );
}

interface PhaseLinesProps {
  phases: PhaseSheet[];
  /** Type scale, `1` being the sheet at 1080 wide. */
  s: number;
  /** Print the blocks' descriptions under the chips of a phase of few blocks. */
  descriptions?: boolean;
  /** Width of the phase gutter. */
  gutter?: number;
}

/**
 * The three phases as ruled rows: the phase in the gutter, its blocks as
 * chips flowing across the row, its duration on the right. A phase of
 * three blocks at most prints their descriptions under the chips; a
 * fartlek of eleven says what it is through its chips alone.
 */
export function PhaseLines({ phases, s, descriptions = true, gutter = 150 }: PhaseLinesProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {phases.map((phase, i) => (
        <div
          key={phase.key}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 18 * s,
            padding: `${16 * s}px 0`,
            borderTop: i === 0 ? RULE : RULE_HAIR,
            borderBottom: i === phases.length - 1 ? RULE : undefined,
          }}
        >
          <span
            style={{
              flex: "none",
              width: gutter,
              paddingTop: 9 * s,
              fontFamily: MONO,
              fontSize: 14 * s,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: INK_2,
            }}
          >
            {phase.label}
          </span>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 * s }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: `${8 * s}px ${8 * s}px` }}>
              {phase.tokens.map((token, j) =>
                token.kind === "chip" ? (
                  <Chip key={j} token={token} s={s} />
                ) : (
                  <span
                    key={j}
                    style={{
                      fontFamily: MONO,
                      fontSize: 20 * s,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      padding: `0 ${2 * s}px`,
                    }}
                  >
                    {token.text}
                  </span>
                ),
              )}
            </div>
            {descriptions && phase.blocks <= 3 && phase.descriptions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 * s }}>
                {phase.descriptions.map((d, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 18 * s,
                      lineHeight: 1.3,
                      color: INK_2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span
            style={{
              flex: "none",
              paddingTop: 8 * s,
              fontFamily: MONO,
              fontSize: 17 * s,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            {formatDurationMinutes(phase.minutes)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The axis under the frieze, as the page prints it: start on the left, the end on the right. */
export function FriezeAxis({ minutes, size = 15 }: { minutes: number; size?: number }) {
  const { t } = useTranslation("session");
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 8,
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: INK_2,
      }}
    >
      <span>{t("screen.axisStart")}</span>
      <span>{t("screen.axisEnd", { duration: formatDurationMinutes(minutes) })}</span>
    </div>
  );
}
