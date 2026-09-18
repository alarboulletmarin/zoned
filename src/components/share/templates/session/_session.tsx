/**
 * A session's share images, in the house style: the same paper, ink, ruled
 * frame and wordmark as the week's sheets, with what a session has to say.
 * The name, the facts in mono, the profile on the ink ramp, the three
 * phases as the cards the session page draws them (a zone chip, the
 * duration on the right, the description under, repeats grouped behind
 * their count), the time in zones, and one tip.
 *
 * Four sheets share these parts. Inline styles with literal hex like every
 * share template: html-to-image rasterises the node and no CSS custom
 * property survives the capture. The figures come from the same helpers the
 * page reads (`getWorkoutHero`, `toZoneBarBlocks`), so the image shows the
 * session the page shows.
 */

import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { usePickLang, useIsEnglish, usePickLangArray } from "@/lib/i18n-utils";
import {
  CATEGORY_META,
  DIFFICULTY_META,
  ZONE_META,
  parseZoneSpan,
  type WorkoutStep,
  type WorkoutStepSegment,
  type WorkoutTemplate,
  type ZoneNumber,
} from "@/types";
import {
  condenseBlocks,
  formatDurationMinutes,
  transformSessionBlocks,
  type ZoneBarBlock,
} from "@/components/visualization";
import { getWorkoutPhaseSteps, summarizeWorkoutSteps } from "@/lib/workoutStructure";
import { getWorkoutHero, type WorkoutHero } from "@/lib/export/workoutHero";
import { ZONE_HEX_LIGHT, UNZONED_HEX } from "@/lib/zoneColors";
import { PAPER, INK, INK_2, RULE, MONO, DISPLAY, sessionTss } from "../_paper";
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
  const isEn = useIsEnglish();
  return {
    name: pickLang(workout, "name"),
    hero: getWorkoutHero(workout),
    phases: sessionPhases(workout, t, isEn),
    label: useSessionLabel(),
  };
}

// ── the phases, as the page draws them ───────────────────────────────────

export type PhaseKey = "warmup" | "main" | "cooldown";

/** One phase: its steps, and what its head prints. */
export interface PhaseSheet {
  key: PhaseKey;
  label: string;
  /** The one-line shorthand, printed only when the phase nests a repeat. */
  summary: string | null;
  steps: WorkoutStep[];
  /** The phase's own profile, one block per segment, for the head's bar. */
  profile: ZoneBarBlock[];
  minutes: number;
  /** Segments the phase prints, repeats unrolled once: what decides the fit. */
  rows: number;
}

/** The three phases with steps, in running order, as `WorkoutStructure` reads them. */
export function sessionPhases(
  workout: WorkoutTemplate,
  t: (key: string, opts?: Record<string, unknown>) => string,
  isEn: boolean,
): PhaseSheet[] {
  const { segments } = transformSessionBlocks(workout);
  return (["warmup", "main", "cooldown"] as const)
    .map((key) => {
      const steps = getWorkoutPhaseSteps(workout, key);
      const own = segments.filter((seg) => seg.type === key);
      return {
        key,
        label: t(`structure.${key}`),
        summary: steps.some((s) => s.kind === "repeat") ? summarizeWorkoutSteps(steps, isEn) : null,
        steps,
        profile: own.map(
          (seg): ZoneBarBlock => ({
            seconds: Math.round(seg.durationMin * 60),
            zone: seg.isRecovery || seg.zoneNumber == null ? 0 : seg.zoneNumber,
          }),
        ),
        minutes: own.reduce((sum, seg) => sum + seg.durationMin, 0),
        rows: countRows(steps),
      };
    })
    .filter((phase) => phase.steps.length > 0);
}

/** Rows a list of steps prints, a repeat counting its children once. */
function countRows(steps: WorkoutStep[]): number {
  return steps.reduce(
    (n, s) => n + (s.kind === "segment" ? 1 : countRows(s.steps) + countRows(s.between ?? [])),
    0,
  );
}

/** The chip's fill and ink, `--zone-N-bg` and `--zone-N-text` on paper. */
const CHIP_FILL: Record<ZoneNumber, string> = {
  1: "rgba(23, 22, 20, 0.07)",
  2: "rgba(23, 22, 20, 0.12)",
  3: "rgba(23, 22, 20, 0.18)",
  4: "rgba(23, 22, 20, 0.62)",
  5: "rgba(23, 22, 20, 0.80)",
  6: INK,
};

/** Type sizes of the cards, `1` being the page's own. */
export interface PhaseScale {
  s: number;
  /** Lines a description may take before it is cut. */
  descLines?: number;
}

/**
 * The zone chip as the page draws it: the code in mono, the zone's name in
 * text, on the zone's tint; a range keeps both ends. Z4 and up take the
 * paper for ink.
 */
export function ZoneChip({ zone, s, label = true }: { zone: string; s: number; label?: boolean }) {
  const pickLang = usePickLang();
  const span = parseZoneSpan(zone);
  if (!span) return null;
  const isRange = span.min !== span.max;
  const code = isRange ? `Z${span.min}-Z${span.max}` : `Z${span.max}`;
  const name = isRange
    ? `${pickLang(ZONE_META[span.min], "label")} → ${pickLang(ZONE_META[span.max], "label")}`
    : pickLang(ZONE_META[span.max], "label");
  const dark = span.max >= 4;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8 * s,
        flex: "0 1 auto",
        minWidth: 0,
        whiteSpace: "nowrap",
        padding: `${4 * s}px ${9 * s}px`,
        border: RULE,
        borderRadius: 6 * s,
        background: CHIP_FILL[span.max],
        color: dark ? PAPER : INK,
        fontFamily: MONO,
        fontSize: 12.5 * s,
        fontWeight: 700,
        letterSpacing: "0.04em",
        lineHeight: 1.3,
      }}
    >
      {code}
      {label && (
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 13.5 * s,
            fontWeight: 500,
            letterSpacing: 0,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
      )}
    </span>
  );
}

/** Duration, distance, climb of a segment, as the page's meta. */
function segmentMeta(step: WorkoutStepSegment): string {
  const parts: string[] = [];
  if (step.durationSec != null) parts.push(formatDurationMinutes(step.durationSec / 60));
  if (step.distanceKm != null) parts.push(`${step.distanceKm} km`);
  if (step.distanceM != null) parts.push(`${step.distanceM} m`);
  if (step.elevationGainM != null && step.elevationGainM > 0) parts.push(`+${step.elevationGainM} m D+`);
  return parts.join(" · ");
}

/** One segment: the chip and the meta on a line, the description under. */
function StepRow({
  step,
  scale,
  first,
  recovery = false,
  muted = false,
}: {
  step: WorkoutStepSegment;
  scale: PhaseScale;
  first: boolean;
  recovery?: boolean;
  muted?: boolean;
}) {
  const pickLang = usePickLang();
  const { s, descLines = 3 } = scale;
  const meta = segmentMeta(step);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6 * s,
        padding: `${10 * s}px 0`,
        borderTop: first ? undefined : recovery ? `1.5px dashed ${INK_2}` : RULE_HAIR,
        color: muted ? INK_2 : INK,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 * s }}>
        {step.zone ? <ZoneChip zone={step.zone} s={s} /> : <span />}
        {meta && (
          <span
            style={{
              flex: "none",
              fontFamily: MONO,
              fontSize: 13 * s,
              letterSpacing: "0.04em",
              color: INK_2,
              whiteSpace: "nowrap",
            }}
          >
            {meta}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: 14.5 * s,
          lineHeight: 1.35,
          display: "-webkit-box",
          WebkitLineClamp: descLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {pickLang(step, "description")}
      </span>
    </div>
  );
}

/** The steps of a repeat, led by their count, ruled down their left. */
function RepeatGroup({
  count,
  s,
  children,
}: {
  count: number;
  s: number;
  children: ReactNode;
}) {
  return (
    <div style={{ paddingLeft: 12 * s, borderLeft: RULE }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 * s, marginBottom: 2 * s }}>
        <span style={{ fontFamily: MONO, fontSize: 13 * s, fontWeight: 700, letterSpacing: "0.04em" }}>
          {count} ×
        </span>
        <span style={{ flex: 1, height: 1.5, background: ZONE_HEX_LIGHT[1] }} />
      </div>
      {children}
    </div>
  );
}

function isSegments(steps: WorkoutStep[]): steps is WorkoutStepSegment[] {
  return steps.every((s) => s.kind === "segment");
}

/**
 * One step, segment or repeat, as `WorkoutStructure` renders it: a compact
 * repeat (segments only) is its group with the recovery rows dashed, a
 * nested one (sets of reps) is the inner group and the between-sets row
 * muted under it, anything else is its count over its children.
 */
function StepItem({
  step,
  scale,
  first,
  t,
  isEn,
}: {
  step: WorkoutStep;
  scale: PhaseScale;
  first: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
  isEn: boolean;
}) {
  const { s } = scale;
  if (step.kind === "segment") return <StepRow step={step} scale={scale} first={first} />;

  const between = step.between ?? [];
  const wrap = (children: ReactNode) => (
    <div style={{ padding: `${10 * s}px 0`, borderTop: first ? undefined : RULE_HAIR }}>{children}</div>
  );

  // Sets of reps: the inner group leads, the between-sets recovery follows.
  const inner = step.steps[0];
  if (step.steps.length === 1 && inner?.kind === "repeat" && isSegments(inner.steps) && isSegments(between)) {
    const innerBetween = inner.between ?? [];
    if (isSegments(innerBetween)) return wrap(
      <>
        <RepeatGroup count={inner.count} s={s}>
          {inner.steps.map((seg, i) => <StepRow key={`i${i}`} step={seg} scale={scale} first={i === 0} />)}
          {innerBetween.map((seg, i) => <StepRow key={`b${i}`} step={seg} scale={scale} first={false} recovery />)}
        </RepeatGroup>
        {between.length > 0 && (
          <div style={{ marginTop: 8 * s, padding: `0 ${12 * s}px`, border: `1.5px dashed ${INK_2}`, borderRadius: 10 * s }}>
            <span style={{ display: "block", paddingTop: 8 * s, fontFamily: MONO, fontSize: 11 * s, letterSpacing: "0.12em", textTransform: "uppercase", color: INK_2 }}>
              {t(`structure.between.${step.unit ?? "blocks"}`)}
            </span>
            {between.map((seg, i) => <StepRow key={`s${i}`} step={seg} scale={scale} first={i === 0} muted />)}
          </div>
        )}
      </>,
    );
  }

  if (isSegments(step.steps) && isSegments(between)) {
    const note = between.length > 0 && (step.unit === "sets" || step.unit === "blocks")
      ? t(`structure.chips.${step.unit === "sets" ? "seriesRecovery" : "blocksRecovery"}`, { value: summarizeWorkoutSteps(between, isEn) })
      : null;
    return wrap(
      <>
        <RepeatGroup count={step.count} s={s}>
          {step.steps.map((seg, i) => <StepRow key={`i${i}`} step={seg} scale={scale} first={i === 0} />)}
          {between.map((seg, i) => <StepRow key={`b${i}`} step={seg} scale={scale} first={false} recovery />)}
        </RepeatGroup>
        {note && <span style={{ display: "block", marginTop: 6 * s, fontSize: 12.5 * s, color: INK_2 }}>{note}</span>}
      </>,
    );
  }

  return wrap(
    <>
      <span style={{ display: "block", marginBottom: 4 * s, fontFamily: MONO, fontSize: 13 * s, fontWeight: 700, letterSpacing: "0.04em" }}>
        {t(`structure.repeatUnits.${step.unit ?? "blocks"}`, { count: step.count })}
      </span>
      <div style={{ paddingLeft: 12 * s, borderLeft: RULE }}>
        {step.steps.map((child, i) => <StepItem key={i} step={child} scale={scale} first={i === 0} t={t} isEn={isEn} />)}
        {between.length > 0 && (
          <>
            <span style={{ display: "block", marginTop: 8 * s, fontFamily: MONO, fontSize: 11 * s, letterSpacing: "0.12em", textTransform: "uppercase", color: INK_2 }}>
              {t(`structure.between.${step.unit ?? "blocks"}`)}
            </span>
            {between.map((child, i) => <StepItem key={`b${i}`} step={child} scale={scale} first={i === 0} t={t} isEn={isEn} />)}
          </>
        )}
      </div>
    </>,
  );
}

/** The phase's profile beside its duration, the page's 96 × 18 bar. */
function MiniProfile({ blocks, s }: { blocks: ZoneBarBlock[]; s: number }) {
  const list = condenseBlocks(blocks);
  const total = list.reduce((sum, b) => sum + b.seconds, 0) || 1;
  const HEIGHT: Record<number, string> = { 0: "26%", 1: "30%", 2: "44%", 3: "58%", 4: "72%", 5: "86%", 6: "100%" };
  return (
    <span
      style={{
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "flex-end",
        gap: 2,
        width: 96 * s,
        height: 20 * s,
        padding: `0 3px`,
        border: RULE,
        borderRadius: 6 * s,
        background: "#FFFFFF",
        flex: "none",
      }}
    >
      {list.map((b, i) => (
        <span
          key={i}
          style={{
            flexGrow: b.seconds / total,
            flexBasis: 0,
            minWidth: 2,
            height: HEIGHT[b.zone],
            background: b.zone === 0 ? UNZONED_HEX : ZONE_HEX_LIGHT[b.zone],
            borderTop: `1px solid ${INK}`,
          }}
        />
      ))}
    </span>
  );
}

/**
 * One phase as the page's card: ruled, rounded, the label and its summary,
 * the profile and the duration on the right, then the steps. With
 * `columns`, the steps flow into that many columns, a dense main set
 * reading across the card rather than down the sheet.
 */
export function PhaseCard({
  phase,
  scale,
  columns = 1,
  profile = true,
  style,
}: {
  phase: PhaseSheet;
  scale: PhaseScale;
  columns?: number;
  /** Draw the phase's own profile in the head; off on a narrow card. */
  profile?: boolean;
  style?: CSSProperties;
}) {
  const { t } = useTranslation("session");
  const isEn = useIsEnglish();
  const { s } = scale;
  const cols: WorkoutStep[][] = Array.from({ length: columns }, () => []);
  // Fill the columns by rows, so each column holds about the same number.
  const per = Math.ceil(phase.steps.length / columns);
  phase.steps.forEach((step, i) => cols[Math.min(columns - 1, Math.floor(i / per))].push(step));
  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: `${16 * s}px ${18 * s}px ${12 * s}px`,
        border: RULE,
        borderRadius: 22 * s,
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12 * s,
          paddingBottom: 8 * s,
          borderBottom: RULE_HAIR,
        }}
      >
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 16 * s, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            {phase.label}
          </span>
          {phase.summary && (
            <span style={{ display: "block", marginTop: 2 * s, fontSize: 12.5 * s, lineHeight: 1.3, color: INK_2 }}>
              {phase.summary}
            </span>
          )}
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * s, flex: "none" }}>
          {profile && phase.profile.length > 0 && <MiniProfile blocks={phase.profile} s={s} />}
          <span style={{ fontFamily: MONO, fontSize: 13 * s, letterSpacing: "0.04em", color: INK_2 }}>
            {formatDurationMinutes(phase.minutes)}
          </span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 24 * s, alignItems: "flex-start" }}>
        {cols.map((col, c) => (
          <div key={c} style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column" }}>
            {col.map((step, i) => (
              <StepItem key={i} step={step} scale={scale} first={i === 0} t={t} isEn={isEn} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The three cards side by side, as the page lays them out on a wide screen.
 * A main set past `split` rows takes two columns of steps and twice the
 * width, so the sheet reads across rather than down.
 */
export function PhaseRow({
  phases,
  scale,
  width,
  split = 5,
  gap = 16,
}: {
  phases: PhaseSheet[];
  scale: PhaseScale;
  /** Width the row has, so a card knows whether its head has room for a profile. */
  width: number;
  split?: number;
  gap?: number;
}) {
  const columnsOf = (phase: PhaseSheet) => (phase.key === "main" && phase.rows > split ? 2 : 1);
  const shares = phases.reduce((n, p) => n + columnsOf(p), 0);
  const unit = (width - gap * (phases.length - 1)) / shares;
  return (
    <div style={{ display: "flex", gap, alignItems: "flex-start" }}>
      {phases.map((phase) => {
        const columns = columnsOf(phase);
        return (
          <PhaseCard
            key={phase.key}
            phase={phase}
            scale={scale}
            columns={columns}
            profile={unit * columns >= 300 * scale.s}
            style={{ flex: `${columns} 1 0` }}
          />
        );
      })}
    </div>
  );
}
