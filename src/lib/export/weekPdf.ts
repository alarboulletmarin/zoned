/**
 * The standalone week as a PDF, in the house style.
 *
 * A week used to go out through the plan's PDF, a document drawn for a
 * multi-week programme: a slate banner, "Plan libre", a phase table reading
 * "S1-S1", blue stat tiles, superscripts to an appendix, and the activities
 * printed by their internal ids ("__activity_commute__"). None of it is what
 * a week is. This is the week's own sheet: the wordmark, the name, the facts,
 * the rhythm drawn as seven bars, the seven days as ruled rows with each
 * session's zone, duration and structure in one line, the 80/20 split, then
 * a second page with the structure of every catalogue session, for the coach
 * who reads it. The parts come from pdfHouse.ts, like every PDF here.
 */

import type { Content, TableCell } from "pdfmake/interfaces";
import i18n from "@/i18n";
import { activityKindOf, activitySessionZone } from "@/lib/activitySession";
import { planWeekToSlots } from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import { weekRhythm } from "@/lib/weekRhythm";
import { polarisationStatus } from "@/components/weekly/PolarizationGauge";
import { ZONE_HEX_LIGHT } from "@/lib/zoneColors";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { AnyWorkoutTemplate } from "@/types";
import type { PlanSession, TrainingPlan } from "@/types/plan";
import { isRunningWorkout } from "@/lib/workoutTemplate";
import { triggerDownload } from "./download";
import { buildCompactSummary, buildStrengthSummary, resolveExerciseNames, typeLabel } from "./planPdf";
import {
  COLUMN_W,
  HAIR,
  INK,
  INK_2,
  INK_PALE,
  createHouse,
  formatDuration,
  formatHours,
  preparePdfMake,
  zoneInk,
  type House,
} from "./pdfHouse";

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

function t(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`common:export.weekPdf.${key}`, opts);
}

function tLib(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`library:weekly.${key}`, opts);
}

/** The zone a session prints: the template's dominant zone, or the activity's planned effort. */
function sessionZone(session: PlanSession, template: AnyWorkoutTemplate | undefined): number | null {
  if (activityKindOf(session.workoutId)) return activitySessionZone(session);
  if (!template || isStrengthWorkout(template)) return null;
  return getDominantZone(template);
}

// ── The rhythm ───────────────────────────────────────────────────────

/**
 * Seven bars, the page's own chart at print size: height is the day's
 * minutes, ink is the zone, one segment per session, a rest day a flat pale
 * baseline. Drawn as rectangles, so it prints as vectors.
 */
export function rhythmBlock(h: House, slots: ReturnType<typeof planWeekToSlots>): Content[] {
  const { days, maxDuration } = weekRhythm(slots);
  const height = 96;
  const gap = 8;
  const barW = (COLUMN_W - gap * 6) / 7;
  const shapes: Record<string, unknown>[] = [];

  days.forEach((d, i) => {
    const x = i * (barW + gap);
    if (d.total === 0) {
      shapes.push({ type: "rect", x, y: height - 2, w: barW, h: 2, color: INK_PALE });
      return;
    }
    const barH = (0.08 + (d.total / maxDuration) * 0.92) * height;
    let y = height;
    d.sessions.forEach((s) => {
      const hh = (s.duration / d.total) * barH;
      y -= hh;
      shapes.push({ type: "rect", x, y, w: barW, h: hh, color: zoneInk(s.zone), lineColor: INK, lineWidth: 0.75 });
    });
  });

  return [
    h.kicker(tLib("rhythm.title"), { margin: [0, 0, 0, 6] }) as unknown as Content,
    { canvas: shapes as never },
    {
      columns: DAYS.map((d) => ({
        width: barW + gap,
        ...h.mono(tLib(`daysShort.${d}`).toUpperCase(), {
          bold: true,
          color: days[d].total > 0 ? INK : INK_PALE,
          margin: [0, 5, 0, 0],
        }),
      })),
      columnGap: 0,
    } as unknown as Content,
  ];
}

// ── The seven days ───────────────────────────────────────────────────

/**
 * Monday to Sunday as ruled rows: the day in the gutter, the session with
 * its structure in one line under it, the zone, the duration. A day with
 * several sessions keeps its label on the first; a rest day says so, pale.
 * The plan's PDF prints its weeks the same way.
 */
export function daysTable(
  h: House,
  sessions: PlanSession[],
  names: Record<string, string>,
  templates: Record<string, AnyWorkoutTemplate>,
  exerciseNames: Record<string, string>,
): Content {
  const sorted = [...sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const body: TableCell[][] = [];
  const dayStarts = new Set<number>();

  for (const day of DAYS) {
    const own = sorted.filter((s) => s.dayOfWeek === day);
    dayStarts.add(body.length);
    const dayCell = (pale: boolean): TableCell =>
      ({
        ...h.mono(tLib(`daysShort.${day}`).toUpperCase(), {
          bold: true,
          color: pale ? INK_PALE : INK,
          margin: [0, 3, 0, 0],
        }),
        rowSpan: Math.max(1, own.length),
      }) as TableCell;

    if (own.length === 0) {
      body.push([
        dayCell(true),
        h.mono(tLib("kinds.rest"), { color: INK_PALE, margin: [0, 3, 0, 0] }) as TableCell,
        { text: "" },
        { text: "" },
      ]);
      continue;
    }

    own.forEach((session, i) => {
      const template = templates[session.workoutId];
      const name = names[session.workoutId] || session.workoutId;
      const zone = sessionZone(session, template);
      let summary = "";
      if (template && isStrengthWorkout(template)) summary = buildStrengthSummary(template, exerciseNames);
      else if (template && isRunningWorkout(template)) summary = buildCompactSummary(template, session.estimatedDurationMin);

      const nameLine: Content = {
        text: [
          { text: name, bold: true, fontSize: 10, color: INK },
          ...(session.isKeySession
            ? [{ text: `   ${t("key")}`, font: h.fonts.mono, fontSize: 7, characterSpacing: 0.6, color: INK_2 }]
            : []),
        ],
      };
      body.push([
        i === 0 ? dayCell(false) : ({} as TableCell),
        {
          stack: summary
            ? [nameLine, { text: summary, fontSize: 8, color: INK_2, margin: [0, 2, 0, 0] }]
            : [nameLine],
        },
        h.mono(zone ? `Z${zone}` : "", { bold: true, color: INK, alignment: "center", margin: [0, 3, 0, 0] }) as TableCell,
        h.mono(session.estimatedDurationMin > 0 ? formatDuration(session.estimatedDurationMin) : "", {
          color: INK,
          alignment: "right",
          margin: [0, 3, 0, 0],
        }) as TableCell,
      ]);
    });
  }

  return {
    table: { widths: [34, "*", 30, 44], body },
    layout: {
      hLineWidth: (i: number) => (i === 0 || i === body.length ? 0.75 : 0.5),
      hLineColor: (i: number) => (i === 0 || i === body.length || dayStarts.has(i) ? INK : HAIR),
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: (i: number) => (i === 3 ? 0 : 8),
      paddingTop: () => 7,
      paddingBottom: () => 7,
    },
  };
}

// ── The split ────────────────────────────────────────────────────────

/** Easy, tempo, intense on one ruled bar, and the 80/20 verdict in words. */
export function splitBlock(h: House, stats: ReturnType<typeof computeWeekStats>): Content[] {
  const { lowShare, midShare, highShare, zonedMinutes } = stats.polarised;
  if (zonedMinutes <= 0) return [];
  const status = polarisationStatus(midShare + highShare);
  const pct = (n: number) => Math.round(n * 100);
  const parts = [
    { share: lowShare, ink: ZONE_HEX_LIGHT[2], label: tLib("gauge.easy") },
    { share: midShare, ink: ZONE_HEX_LIGHT[3], label: tLib("gauge.tempo") },
    { share: highShare, ink: ZONE_HEX_LIGHT[5], label: tLib("gauge.intense") },
  ].filter((p) => p.share > 0);

  let x = 0;
  const shapes = parts.map((p) => {
    const w = p.share * COLUMN_W;
    const shape = { type: "rect", x, y: 0, w, h: 12, color: p.ink, lineColor: INK, lineWidth: 0.75 };
    x += w;
    return shape;
  });

  return [
    {
      columns: [
        h.kicker(tLib("gauge.title")) as unknown as Content,
        h.mono(tLib(`gauge.${status}`), { alignment: "right" }) as unknown as Content,
      ],
      margin: [0, 0, 0, 6],
    },
    { canvas: shapes as never },
    h.mono(parts.map((p) => `${p.label} ${pct(p.share)} %`).join("     "), {
      characterSpacing: 0.4,
      margin: [0, 5, 0, 0],
    }) as unknown as Content,
  ];
}

// ── The document ─────────────────────────────────────────────────────

/**
 * A standalone week as a PDF: page one the week, page two the structure of
 * its catalogue sessions. `names` names every session, activities included,
 * the way the board does; `templates` holds the catalogue sessions by id.
 */
export async function exportWeekToPDF(
  plan: TrainingPlan,
  names: Record<string, string>,
  templates: Record<string, AnyWorkoutTemplate>,
): Promise<void> {
  const { pdfMake, fonts } = await preparePdfMake();
  const h = createHouse(fonts);

  const week = plan.weeks[0];
  const slots = planWeekToSlots(week, new Map(Object.entries(templates)));
  const stats = computeWeekStats(slots);
  const exerciseNames = await resolveExerciseNames(templates);
  const name = plan.config.planName || plan.name;

  const facts = [
    plan.config.weekCategory ? tLib(`prebuilt.category.${plan.config.weekCategory}`) : null,
    tLib("prebuilt.sessions", { count: stats.sessions }),
    plan.config.targetVolumeH != null
      ? `${formatHours(stats.totalHours)} / ${plan.config.targetVolumeH} h`
      : `${formatHours(stats.totalHours)} h`,
    `${stats.totalTss} TSS`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  const content: Content[] = [
    { text: name, bold: true, fontSize: 26, color: INK, lineHeight: 1, margin: [0, 16, 0, 8] },
    h.mono(facts, { fontSize: 8.5 }) as unknown as Content,
    h.rule(0.75, INK, [0, 16, 0, 16]),
    ...rhythmBlock(h, slots),
    { text: "", margin: [0, 0, 0, 18] },
    daysTable(h, week.sessions, names, templates, exerciseNames),
    { text: "", margin: [0, 0, 0, 18] },
    ...splitBlock(h, stats),
  ];

  // Page two: one entry per catalogue session, first seen first.
  const seen = new Set<string>();
  const entries: Content[] = [];
  for (const session of [...week.sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek)) {
    const template = templates[session.workoutId];
    if (!template || seen.has(session.workoutId)) continue;
    seen.add(session.workoutId);
    const dur = template.typicalDuration ? `${template.typicalDuration.min}-${template.typicalDuration.max} min` : "";
    if (isStrengthWorkout(template)) {
      const facts = [typeLabel("strength", template), template.intensity, dur].filter(Boolean).join(" · ");
      entries.push(h.strengthStructure(template, exerciseNames, { facts }));
    } else {
      const facts = [typeLabel(template.sessionType, template), `Z${getDominantZone(template)}`, dur]
        .filter(Boolean)
        .join(" · ");
      entries.push(h.runningStructure(template, { facts }));
    }
  }
  if (entries.length) {
    content.push(
      { ...h.kicker(t("structures")), pageBreak: "before" } as unknown as Content,
      h.rule(0.75, INK, [0, 6, 0, 16]),
      ...entries,
    );
  }

  const blob = await pdfMake.createPdf(h.doc(content, { title: name, kicker: t("kicker") })).getBlob();
  const label = name.trim() || plan.id;
  triggerDownload(blob, `${t("filePrefix")}-${label}.pdf`);
}
