/**
 * The week's share images, in the house style: paper, ink, every edge ruled
 * at 1.5px, the ramp for the zones, and the wordmark's one vermillon dot.
 *
 * Four sheets share these parts. They are inline styles with literal hex like
 * every share template: html-to-image rasterises the node and no CSS custom
 * property survives the capture. The figures come from the same helpers the
 * editor reads (`weekRhythm`, `computeWeekStats`), so the image shows the
 * week the board shows.
 */

import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useIsEnglish } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { activityKindOf, activitySessionZone } from "@/lib/activitySession";
import { weekRhythm, type RhythmDay } from "@/lib/weekRhythm";
import { polarisationStatus } from "@/components/weekly/PolarizationGauge";
import type { WeekStats } from "@/lib/weekStats";
import type { WorkoutCardMeta } from "@/components/domain/PlanWeeklyView";
import type { TrainingPlan } from "@/types/plan";
import type { DayIndex, WeekSlot } from "@/types/week";
import { ZONE_HEX_LIGHT } from "@/lib/zoneColors";
import type { ZoneNumber } from "@/types";
import { BrandMark, BgLayer } from "../_shared";
import { PAPER, INK, INK_2, SUNKEN, RULE, MONO, DISPLAY } from "../_paper";

/** What every week template receives. */
export interface WeekShareProps {
  plan: TrainingPlan;
  /** The week's own name, as edited on the page. */
  name: string;
  slots: WeekSlot[];
  stats: WeekStats;
  workoutNames: Record<string, string>;
  workoutMeta: Record<string, WorkoutCardMeta>;
  transparent: boolean;
}

/** One session as the sheets print it. */
export interface WeekLine {
  day: DayIndex;
  name: string;
  zone: number | null;
  durationMin: number;
  key: boolean;
}

/** Hairline between rows, the ink at the Z1 step of the ramp. */
export const RULE_HAIR = `1.5px solid ${ZONE_HEX_LIGHT[1]}`;
/** The paled ink the ramp starts at, for what is quiet: rest, a baseline. */
export const INK_PALE = ZONE_HEX_LIGHT[2];

const DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

/** The week's sessions, day by day, named and zoned the way the board is. */
export function weekLines(
  plan: TrainingPlan,
  names: Record<string, string>,
  meta: Record<string, WorkoutCardMeta>,
): WeekLine[] {
  const sessions = plan.weeks[0]?.sessions ?? [];
  return [...sessions]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((s) => ({
      day: s.dayOfWeek as DayIndex,
      name: names[s.workoutId] || s.workoutId,
      zone: activityKindOf(s.workoutId)
        ? activitySessionZone(s)
        : (meta[s.workoutId]?.zone ?? null),
      durationMin: s.estimatedDurationMin,
      key: s.isKeySession,
    }));
}

/** The ink of a zone, or the paled ink for work that has none. */
export function zoneInk(zone: number | null): string {
  return zone ? ZONE_HEX_LIGHT[zone as ZoneNumber] : INK_PALE;
}

/** Hours with one decimal, comma in French: 6,1. */
export function formatHours(hours: number, isEn: boolean): string {
  const s = hours.toFixed(1);
  return isEn ? s : s.replace(".", ",");
}

// ── the sheet ────────────────────────────────────────────────────────────

interface SheetProps {
  width: number;
  height: number;
  /** Space between the paper's edge and the ruled frame. */
  margin?: number;
  /** Space inside the frame. */
  padding?: string;
  transparent: boolean;
  children: ReactNode;
}

/** The paper, and the one ruled frame every house-style sheet wears. */
export function Sheet({
  width,
  height,
  margin = 40,
  padding = "44px 52px 40px",
  transparent,
  children,
}: SheetProps) {
  return (
    <div
      data-share-template
      data-transparent={transparent ? "true" : undefined}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        fontFamily: DISPLAY,
        color: INK,
      }}
    >
      <BgLayer background={PAPER} />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          padding: margin,
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            border: RULE,
            padding,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ── the chrome ───────────────────────────────────────────────────────────

/** The wordmark on the left, what the sheet is on the right. */
export function Head({ scale = 1 }: { scale?: number }) {
  const isEn = useIsEnglish();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <BrandMark height={30 * scale} color={INK} />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 19 * scale,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: INK_2,
        }}
      >
        {isEn ? "Training week" : "Semaine d'entraînement"}
      </span>
    </div>
  );
}

/** The week's name. */
export function Title({
  children,
  size,
  style,
}: {
  children: ReactNode;
  size: number;
  style?: CSSProperties;
}) {
  return (
    <h1
      style={{
        margin: 0,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.02,
        letterSpacing: "-0.035em",
        overflowWrap: "anywhere",
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

/**
 * The mono line under the title: category, count, hours, load. What the
 * folded strip prints on the page, at print size.
 */
export function FactsLine({
  plan,
  stats,
  size = 22,
  style,
}: {
  plan: TrainingPlan;
  stats: WeekStats;
  size?: number;
  style?: CSSProperties;
}) {
  const { t } = useTranslation("library");
  const isEn = useIsEnglish();
  const parts = [
    plan.config.weekCategory
      ? t(`weekly.prebuilt.category.${plan.config.weekCategory}`)
      : null,
    t("weekly.prebuilt.sessions", { count: stats.sessions }),
    plan.config.targetVolumeH != null
      ? `${formatHours(stats.totalHours, isEn)} / ${plan.config.targetVolumeH} h`
      : `${formatHours(stats.totalHours, isEn)} h`,
    `${stats.totalTss} TSS`,
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

/** zoned.run on the left, a word on the right. */
export function Foot({
  right,
  size = 19,
  style,
}: {
  right?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        paddingTop: 22,
        borderTop: RULE,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: "0.1em",
        color: INK_2,
        ...style,
      }}
    >
      <span>zoned.run</span>
      <span>{right}</span>
    </div>
  );
}

// ── the marks ────────────────────────────────────────────────────────────

/** The zone's dot, filled at its ink, hollow for work that has none. */
export function ZoneDot({ zone, size = 14 }: { zone: number | null; size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        flex: "none",
        width: size,
        height: size,
        borderRadius: 999,
        background: zone ? zoneInk(zone) : SUNKEN,
        border: `1.5px solid ${INK}`,
        boxSizing: "border-box",
      }}
    />
  );
}

/** The star of a key session, ink. */
export function KeyStar({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={INK}
      style={{ display: "block", flex: "none" }}
      aria-hidden="true"
    >
      <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z" />
    </svg>
  );
}

// ── the rhythm, as columns ───────────────────────────────────────────────

interface RhythmColumnsProps {
  slots: WeekSlot[];
  /** Height of the bar area, in px. */
  height: number;
  gap?: number;
  /** Day labels under the bars; off when the columns below name the days. */
  labels?: boolean;
  labelSize?: number;
}

/**
 * Seven bars, the same reading as the page's rhythm chart: height is the
 * day's minutes, ink is the zone, one segment per session, a rest day is
 * a flat pale baseline. Each bar is ruled, like the session frieze.
 */
export function RhythmColumns({
  slots,
  height,
  gap = 12,
  labels = true,
  labelSize = 17,
}: RhythmColumnsProps) {
  const { t } = useTranslation("library");
  const { days, maxDuration } = weekRhythm(slots);
  return (
    <div style={{ display: "flex", gap, alignItems: "flex-end" }}>
      {days.map((d) => (
        <div
          key={d.day}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 10,
          }}
        >
          <Bar day={d} height={height} maxDuration={maxDuration} />
          {labels && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: labelSize,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textAlign: "center",
                color: d.total > 0 ? INK : INK_PALE,
              }}
            >
              {t(`weekly.daysShort.${d.day}`)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** One day's bar: stacked segments, bottom first, on a ruled outline. */
export function Bar({
  day,
  height,
  maxDuration,
}: {
  day: RhythmDay;
  height: number;
  maxDuration: number;
}) {
  if (day.total === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div style={{ width: "100%", height: 4, background: INK_PALE, borderRadius: 999 }} />
      </div>
    );
  }
  // The bottom 8% is reserved so the shortest day is still a bar, not a line.
  const pct = 8 + (day.total / maxDuration) * 92;
  return (
    <div style={{ height, display: "flex", alignItems: "flex-end" }}>
      <div
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: `${pct}%`,
          border: RULE,
          borderRadius: "8px 8px 0 0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {day.sessions.map((s, i) => (
          <div
            key={i}
            style={{
              flexGrow: s.duration,
              flexBasis: 0,
              background: zoneInk(s.zone),
              borderTop: i > 0 ? `1.5px solid ${PAPER}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── the board, as columns ────────────────────────────────────────────────

interface DayColumnsProps {
  lines: WeekLine[];
  gap?: number;
  /** Type size of a card's name. */
  nameSize?: number;
  /** Type size of the day label. */
  labelSize?: number;
  cardPadding?: string;
  /** Lines a name may take before it is cut. */
  nameLines?: number;
}

/**
 * The seven days as the board draws them: a day label, then one ruled card
 * per session with its zone dot, its name and its duration. A day without
 * a session says so, quietly.
 */
export function DayColumns({
  lines,
  gap = 12,
  nameSize = 17,
  labelSize = 15,
  cardPadding = "12px 12px 11px",
  nameLines = 3,
}: DayColumnsProps) {
  const { t } = useTranslation("library");
  return (
    <div style={{ display: "flex", gap, alignItems: "stretch" }}>
      {DAYS.map((day) => {
        const own = lines.filter((l) => l.day === day);
        return (
          <div
            key={day}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingTop: 10,
              borderTop: RULE,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: labelSize,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: own.length ? INK : INK_PALE,
                marginBottom: 2,
              }}
            >
              {t(`weekly.days.${day}`)}
            </span>
            {own.length === 0 ? (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: labelSize,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: INK_PALE,
                  padding: "10px 0",
                }}
              >
                {t("weekly.kinds.rest")}
              </span>
            ) : (
              own.map((l, i) => (
                <div
                  key={i}
                  style={{
                    boxSizing: "border-box",
                    border: RULE,
                    borderRadius: 10,
                    padding: cardPadding,
                    background: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ZoneDot zone={l.zone} size={12} />
                    {l.zone && (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: labelSize - 1,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                        }}
                      >
                        Z{l.zone}
                      </span>
                    )}
                    {l.key && <KeyStar size={labelSize - 1} />}
                  </span>
                  <span
                    style={{
                      fontSize: nameSize,
                      fontWeight: 600,
                      lineHeight: 1.22,
                      letterSpacing: "-0.01em",
                      display: "-webkit-box",
                      WebkitLineClamp: nameLines,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      // Hyphenate first; break anywhere only as the last
                      // resort a 100px column sometimes needs.
                      hyphens: "auto",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {l.name}
                  </span>
                  {l.durationMin > 0 && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: labelSize - 1,
                        letterSpacing: "0.04em",
                        color: INK_2,
                      }}
                    >
                      {formatDurationMinutes(l.durationMin)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── the week, as rows ────────────────────────────────────────────────────

interface SessionRowsProps {
  lines: WeekLine[];
  /** Draw each row's duration as a bar too, the rhythm read sideways. */
  bars?: boolean;
  nameSize?: number;
  labelSize?: number;
  rowPadding?: number;
  /** Width of the day gutter. */
  gutter?: number;
}

/**
 * Monday to Sunday as rows: the day in the gutter, the session with its
 * dot and its name, the duration on the right. With `bars`, a ruled bar
 * runs under each name, its length the session's minutes: the rhythm,
 * read down the page instead of across it.
 */
export function SessionRows({
  lines,
  bars = false,
  nameSize = 30,
  labelSize = 18,
  rowPadding = 18,
  gutter = 96,
}: SessionRowsProps) {
  const { t } = useTranslation("library");
  const isEn = useIsEnglish();
  const maxMin = Math.max(1, ...lines.map((l) => l.durationMin));
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {DAYS.map((day) => {
        const own = lines.filter((l) => l.day === day);
        return (
          <div
            key={day}
            style={{
              display: "flex",
              gap: 20,
              padding: `${rowPadding}px 0`,
              borderTop: day === 0 ? RULE : RULE_HAIR,
            }}
          >
            <span
              style={{
                flex: "none",
                width: gutter,
                paddingTop: 6,
                fontFamily: MONO,
                fontSize: labelSize,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: own.length ? INK : INK_PALE,
              }}
            >
              {t(`weekly.daysShort.${day}`)}
            </span>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {own.length === 0 ? (
                <span
                  style={{
                    paddingTop: 4,
                    fontFamily: MONO,
                    fontSize: labelSize,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: INK_PALE,
                  }}
                >
                  {isEn ? "Rest" : "Repos"}
                </span>
              ) : (
                own.map((l, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <ZoneDot zone={l.zone} size={Math.round(nameSize * 0.5)} />
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: nameSize,
                          fontWeight: 600,
                          lineHeight: 1.15,
                          letterSpacing: "-0.015em",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {l.name}
                      </span>
                      {l.key && <KeyStar size={Math.round(nameSize * 0.6)} />}
                      <span
                        style={{
                          flex: "none",
                          fontFamily: MONO,
                          fontSize: labelSize + 2,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          color: INK,
                        }}
                      >
                        {l.zone ? `Z${l.zone} · ` : ""}
                        {l.durationMin > 0 ? formatDurationMinutes(l.durationMin) : ""}
                      </span>
                    </div>
                    {bars && l.durationMin > 0 && (
                      <div
                        style={{
                          boxSizing: "border-box",
                          height: 14,
                          width: `${Math.max(4, (l.durationMin / maxMin) * 100)}%`,
                          background: zoneInk(l.zone),
                          border: RULE,
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── the intensity split ──────────────────────────────────────────────────

/**
 * Easy, tempo, intense: the week's minutes on a ruled bar, each share at
 * its ink, and the 80/20 verdict in words. The page's gauge, at print
 * size and without its advice line.
 */
export function SplitBar({
  stats,
  size = 18,
  height = 26,
}: {
  stats: WeekStats;
  size?: number;
  height?: number;
}) {
  const { t } = useTranslation("library");
  const { lowShare, midShare, highShare, zonedMinutes } = stats.polarised;
  if (zonedMinutes <= 0) return null;
  const status = polarisationStatus(midShare + highShare);
  const pct = (n: number) => Math.round(n * 100);
  const parts = [
    { share: lowShare, ink: ZONE_HEX_LIGHT[2], label: t("weekly.gauge.easy") },
    { share: midShare, ink: ZONE_HEX_LIGHT[3], label: t("weekly.gauge.tempo") },
    { share: highShare, ink: ZONE_HEX_LIGHT[5], label: t("weekly.gauge.intense") },
  ].filter((p) => p.share > 0);
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
        <span style={{ fontWeight: 700 }}>{t("weekly.gauge.title")}</span>
        <span style={{ color: INK_2 }}>{t(`weekly.gauge.${status}`)}</span>
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
              flexGrow: p.share,
              flexBasis: 0,
              background: p.ink,
              borderLeft: i > 0 ? `1.5px solid ${INK}` : undefined,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 26,
          fontFamily: MONO,
          fontSize: size,
          letterSpacing: "0.04em",
          color: INK_2,
        }}
      >
        {parts.map((p, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: size * 0.7,
                height: size * 0.7,
                borderRadius: 999,
                background: p.ink,
                border: `1.5px solid ${INK}`,
                boxSizing: "border-box",
              }}
            />
            {p.label} {pct(p.share)} %
          </span>
        ))}
      </div>
    </div>
  );
}
