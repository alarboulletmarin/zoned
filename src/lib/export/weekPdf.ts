/**
 * The standalone week as a PDF, in the house style.
 *
 * A week used to go out through the plan's PDF, a document drawn for a
 * multi-week programme: a slate banner, "Plan libre", a phase table reading
 * "S1-S1", blue stat tiles, superscripts to an appendix, and the activities
 * printed by their internal ids ("__activity_commute__"). None of it is what
 * a week is. This is the week's own sheet: paper and ink, the wordmark, the
 * name, the facts, the rhythm drawn as seven bars, the seven days as ruled
 * rows with each session's zone, duration and structure in one line, the
 * 80/20 split, then a second page with the structure of every catalogue
 * session, for the coach who reads it.
 *
 * The type is the app's own, Bricolage Grotesque and JetBrains Mono, served
 * from public/fonts/pdf as TTF (pdfmake embeds TrueType, not woff2) and
 * fetched only when a PDF is asked for. The strings still pass through
 * `pdfSafeDocument`, which knows Roboto's glyphs: a conservative filter, the
 * two house fonts cover the same Latin, and the one glyph it does not vouch
 * for, the summary's "›", is replaced before it is set.
 */

import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import logoSvg from "@/assets/logo.svg?raw";
import i18n from "@/i18n";
import { formatDateMedium, pickLang } from "@/lib/i18n-utils";
import { activityKindOf, activitySessionZone } from "@/lib/activitySession";
import { planWeekToSlots } from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import { weekRhythm } from "@/lib/weekRhythm";
import { polarisationStatus } from "@/components/weekly/PolarizationGauge";
import { ZONE_HEX_LIGHT } from "@/lib/zoneColors";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { AnyWorkoutTemplate, WorkoutBlock, WorkoutTemplate, ZoneNumber } from "@/types";
import type { StrengthBlock, StrengthWorkoutTemplate } from "@/types/strength";
import type { PlanSession, TrainingPlan } from "@/types/plan";
import { isRunningWorkout } from "@/lib/workoutTemplate";
import { triggerDownload } from "./download";
import { pdfSafeDocument } from "./pdfText";
import {
  buildCompactSummary,
  buildStrengthSummary,
  resolveExerciseNames,
  typeLabel,
} from "./planPdf";

// ── The ink ──────────────────────────────────────────────────────────

/** `--ink-1` */
const INK = "#171614";
/** `--ink-2` */
const INK_2 = "#4A4845";
/** The ramp's Z2 step: what is quiet, a rest day, a baseline. */
const INK_PALE = ZONE_HEX_LIGHT[2];
/** The ramp's Z1 step: the hairline between rows. */
const HAIR = ZONE_HEX_LIGHT[1];
/** The vermillon, the wordmark's dot and nothing else. */
const ACCENT = "#E8452A";

const DISPLAY = "Bricolage";
const MONO = "Mono";

/** A4 portrait, and the column the margins leave. */
const PAGE_W = 595.28;
const MARGIN_X = 40;
const COLUMN_W = PAGE_W - 2 * MARGIN_X;

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

// ── The fonts ────────────────────────────────────────────────────────

const FONT_FILES = {
  "BricolageGrotesque-Regular.ttf": "BricolageGrotesque-Regular.ttf",
  "BricolageGrotesque-Bold.ttf": "BricolageGrotesque-Bold.ttf",
  "JetBrainsMono-Regular.ttf": "JetBrainsMono-Regular.ttf",
  "JetBrainsMono-Bold.ttf": "JetBrainsMono-Bold.ttf",
} as const;

let fontVfs: Promise<Record<string, string>> | null = null;

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** The four files, fetched once per session and kept as base64 for pdfmake. */
function loadFonts(): Promise<Record<string, string>> {
  if (!fontVfs) {
    fontVfs = Promise.all(
      Object.entries(FONT_FILES).map(async ([key, file]) => {
        const res = await fetch(`${import.meta.env.BASE_URL}fonts/pdf/${file}`);
        if (!res.ok) throw new Error(`Font ${file} unavailable (${res.status})`);
        return [key, toBase64(await res.arrayBuffer())] as const;
      }),
    ).then((entries) => Object.fromEntries(entries));
    fontVfs.catch(() => {
      fontVfs = null;
    });
  }
  return fontVfs;
}

// ── Helpers ──────────────────────────────────────────────────────────

function isEn(): boolean {
  return i18n.language?.startsWith("en") ?? false;
}

function t(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`common:export.weekPdf.${key}`, opts);
}

function tLib(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`library:weekly.${key}`, opts);
}

function formatDuration(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
  }
  return `${Math.round(min)}min`;
}

/** Hours with one decimal, comma in French: 6,1. */
function formatHours(hours: number): string {
  const s = hours.toFixed(1);
  return isEn() ? s : s.replace(".", ",");
}

function zoneInk(zone: number | null): string {
  return zone ? ZONE_HEX_LIGHT[zone as ZoneNumber] : INK_PALE;
}

/** The zone a session prints: the template's dominant zone, or the activity's planned effort. */
function sessionZone(session: PlanSession, template: AnyWorkoutTemplate | undefined): number | null {
  if (activityKindOf(session.workoutId)) return activitySessionZone(session);
  if (!template || isStrengthWorkout(template)) return null;
  return getDominantZone(template);
}

/** A pdfmake node before it is typed: what `mono` and `kicker` build. */
type Node = Record<string, unknown>;

/** A mono label: small capitals, tracked. */
function mono(text: string, extra: Node = {}): Node {
  return {
    text,
    font: MONO,
    fontSize: 7.5,
    characterSpacing: 0.6,
    color: INK_2,
    ...extra,
  };
}

/** The mono kicker over a block: bold, upper case. */
function kicker(text: string, extra: Node = {}): Node {
  return mono(text.toUpperCase(), { bold: true, color: INK, characterSpacing: 1, ...extra });
}

/** One ruled line across the column. */
function rule(width = 0.75, color = INK, margin: [number, number, number, number] = [0, 0, 0, 0]): Content {
  return {
    canvas: [{ type: "line", x1: 0, y1: 0, x2: COLUMN_W, y2: 0, lineWidth: width, lineColor: color }],
    margin,
  };
}

// ── The rhythm ───────────────────────────────────────────────────────

/**
 * Seven bars, the page's own chart at print size: height is the day's
 * minutes, ink is the zone, one segment per session, a rest day a flat pale
 * baseline. Drawn as rectangles, so it prints as vectors.
 */
function rhythmBlock(slots: ReturnType<typeof planWeekToSlots>): Content[] {
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
      const h = (s.duration / d.total) * barH;
      y -= h;
      shapes.push({
        type: "rect",
        x,
        y,
        w: barW,
        h,
        color: zoneInk(s.zone),
        lineColor: INK,
        lineWidth: 0.75,
      });
    });
  });

  return [
    kicker(tLib("rhythm.title"), { margin: [0, 0, 0, 6] }) as unknown as Content,
    { canvas: shapes as never },
    {
      columns: DAYS.map((d) => ({
        width: barW + gap,
        ...mono(tLib(`daysShort.${d}`).toUpperCase(), {
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

function daysTable(
  plan: TrainingPlan,
  names: Record<string, string>,
  templates: Record<string, AnyWorkoutTemplate>,
  exerciseNames: Record<string, string>,
): Content {
  const sessions = [...(plan.weeks[0]?.sessions ?? [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const body: TableCell[][] = [];
  // Rows where a day starts: the hairline above them is drawn in ink.
  const dayStarts = new Set<number>();

  for (const day of DAYS) {
    const own = sessions.filter((s) => s.dayOfWeek === day);
    dayStarts.add(body.length);
    const dayCell = (pale: boolean): TableCell => ({
      ...mono(tLib(`daysShort.${day}`).toUpperCase(), {
        bold: true,
        color: pale ? INK_PALE : INK,
        margin: [0, 3, 0, 0],
      }),
      rowSpan: Math.max(1, own.length),
    } as TableCell);

    if (own.length === 0) {
      body.push([
        dayCell(true),
        mono(tLib("kinds.rest"), { color: INK_PALE, margin: [0, 3, 0, 0] }) as TableCell,
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
      if (template && isStrengthWorkout(template)) {
        summary = buildStrengthSummary(template, exerciseNames);
      } else if (template && isRunningWorkout(template)) {
        summary = buildCompactSummary(template, session.estimatedDurationMin);
      }
      // "›" is not vouched for by every font; the middle dot is.
      summary = summary.replace(/›/g, "·");

      const nameLine: Content = {
        text: [
          { text: name, bold: true, fontSize: 10, color: INK },
          ...(session.isKeySession
            ? [{ text: `   ${t("key")}`, font: MONO, fontSize: 7, characterSpacing: 0.6, color: INK_2 }]
            : []),
        ],
      };
      const cell: TableCell = {
        stack: summary
          ? [nameLine, { text: summary, fontSize: 8, color: INK_2, margin: [0, 2, 0, 0] }]
          : [nameLine],
      };

      body.push([
        i === 0 ? dayCell(false) : ({} as TableCell),
        cell,
        mono(zone ? `Z${zone}` : "", { bold: true, color: INK, alignment: "center", margin: [0, 3, 0, 0] }) as TableCell,
        mono(session.estimatedDurationMin > 0 ? formatDuration(session.estimatedDurationMin) : "", {
          color: INK,
          alignment: "right",
          margin: [0, 3, 0, 0],
        }) as TableCell,
      ]);
    });
  }

  return {
    table: {
      widths: [34, "*", 30, 44],
      body,
    },
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

function splitBlock(stats: ReturnType<typeof computeWeekStats>): Content[] {
  const { lowShare, midShare, highShare, zonedMinutes } = stats.polarised;
  if (zonedMinutes <= 0) return [];
  const status = polarisationStatus(midShare + highShare);
  const pct = (n: number) => Math.round(n * 100);
  const parts = [
    { share: lowShare, ink: ZONE_HEX_LIGHT[2], label: tLib("gauge.easy") },
    { share: midShare, ink: ZONE_HEX_LIGHT[3], label: tLib("gauge.tempo") },
    { share: highShare, ink: ZONE_HEX_LIGHT[5], label: tLib("gauge.intense") },
  ].filter((p) => p.share > 0);

  const height = 12;
  let x = 0;
  const shapes = parts.map((p) => {
    const w = p.share * COLUMN_W;
    const shape = { type: "rect", x, y: 0, w, h: height, color: p.ink, lineColor: INK, lineWidth: 0.75 };
    x += w;
    return shape;
  });

  return [
    {
      columns: [
        kicker(tLib("gauge.title")) as unknown as Content,
        mono(tLib(`gauge.${status}`), { alignment: "right" }) as unknown as Content,
      ],
      margin: [0, 0, 0, 6],
    },
    { canvas: shapes as never },
    {
      text: parts.map((p) => `${p.label} ${pct(p.share)} %`).join("     "),
      font: MONO,
      fontSize: 7.5,
      characterSpacing: 0.4,
      color: INK_2,
      margin: [0, 5, 0, 0],
    },
  ];
}

// ── The structures, page two ─────────────────────────────────────────

const HEAD_CELL = (text: string, alignment: "left" | "center" | "right" = "left"): TableCell =>
  mono(text.toUpperCase(), { fontSize: 6.5, alignment }) as TableCell;

function phaseLabel(phase: "warmup" | "mainSet" | "cooldown"): string {
  return i18n.t(`common:export.planPdf.${phase}`);
}

function runningEntry(template: WorkoutTemplate): Content {
  const name = pickLang(template, "name");
  const zone = getDominantZone(template);
  const dur = template.typicalDuration
    ? `${template.typicalDuration.min}-${template.typicalDuration.max} min`
    : "";
  const facts = [typeLabel(template.sessionType, template), `Z${zone}`, dur].filter(Boolean).join(" · ");

  const sections: { phase: string; blocks: WorkoutBlock[] }[] = [];
  if (template.warmupTemplate?.length) sections.push({ phase: phaseLabel("warmup"), blocks: template.warmupTemplate });
  if (template.mainSetTemplate?.length) sections.push({ phase: phaseLabel("mainSet"), blocks: template.mainSetTemplate });
  if (template.cooldownTemplate?.length) sections.push({ phase: phaseLabel("cooldown"), blocks: template.cooldownTemplate });

  const rows: TableCell[][] = [];
  for (const { phase, blocks } of sections) {
    blocks.forEach((block, i) => {
      const desc = pickLang(block, "description");
      let reps = "";
      if (block.sets && block.sets > 1 && block.repetitions && block.repetitions > 1) {
        reps = `${block.sets} × ${block.repetitions}`;
      } else if (block.repetitions && block.repetitions > 1) {
        reps = `${block.repetitions} ×`;
      }
      rows.push([
        mono(i === 0 ? phase : "", { fontSize: 7 }) as TableCell,
        { text: desc, fontSize: 8.5, color: INK },
        mono(block.durationMin ? formatDuration(block.durationMin) : "", { alignment: "right", color: INK }) as TableCell,
        mono(block.zone ?? "", { bold: true, alignment: "center", color: INK }) as TableCell,
        mono(reps, { alignment: "right", color: INK }) as TableCell,
      ]);
    });
  }

  const tips = isEn() ? template.coachingTipsEn : template.coachingTips;

  return {
    unbreakable: true,
    stack: [
      {
        text: [
          { text: name, bold: true, fontSize: 11, color: INK },
          { text: `   ${facts}`, font: MONO, fontSize: 7.5, characterSpacing: 0.4, color: INK_2 },
        ],
        margin: [0, 0, 0, 6],
      },
      ...(rows.length
        ? [
            {
              table: {
                headerRows: 1,
                widths: [44, "*", 40, 30, 36],
                body: [
                  [HEAD_CELL("Phase"), HEAD_CELL("Description"), HEAD_CELL(i18n.t("common:export.planPdf.durationCol"), "right"), HEAD_CELL("Zone", "center"), HEAD_CELL("Reps", "right")],
                  ...rows,
                ],
              },
              layout: {
                hLineWidth: (i: number) => (i === 0 || i === rows.length + 1 ? 0.75 : i === 1 ? 0.75 : 0.5),
                hLineColor: (i: number) => (i <= 1 || i === rows.length + 1 ? INK : HAIR),
                vLineWidth: () => 0,
                paddingLeft: () => 0,
                paddingRight: (i: number) => (i === 4 ? 0 : 8),
                paddingTop: () => 4,
                paddingBottom: () => 4,
              },
            } as Content,
          ]
        : []),
      ...(tips?.length
        ? [{ text: tips.slice(0, 2).join("  ·  "), fontSize: 8, color: INK_2, margin: [0, 6, 0, 0] } as Content]
        : []),
    ],
    margin: [0, 0, 0, 18],
  } as Content;
}

function strengthEntry(template: StrengthWorkoutTemplate, exerciseNames: Record<string, string>): Content {
  const name = pickLang(template, "name");
  const dur = template.typicalDuration
    ? `${template.typicalDuration.min}-${template.typicalDuration.max} min`
    : "";
  const facts = [typeLabel("strength", template), template.intensity, dur].filter(Boolean).join(" · ");

  const sections: { phase: string; blocks: StrengthBlock[] }[] = [];
  if (template.warmupBlocks?.length) sections.push({ phase: phaseLabel("warmup"), blocks: template.warmupBlocks });
  if (template.mainBlocks?.length) sections.push({ phase: phaseLabel("mainSet"), blocks: template.mainBlocks });
  if (template.cooldownBlocks?.length) sections.push({ phase: phaseLabel("cooldown"), blocks: template.cooldownBlocks });

  const rows: TableCell[][] = [];
  for (const { phase, blocks } of sections) {
    blocks.forEach((block, i) => {
      const exName = isEn()
        ? exerciseNames[`${block.exerciseId}__en`] || exerciseNames[block.exerciseId] || block.exerciseId
        : exerciseNames[block.exerciseId] || block.exerciseId;
      rows.push([
        mono(i === 0 ? phase : "", { fontSize: 7 }) as TableCell,
        { text: exName, fontSize: 8.5, color: INK },
        mono(`${block.sets} × ${block.reps}`, { alignment: "right", color: INK }) as TableCell,
        mono(block.restBetweenSets || "", { alignment: "right", color: INK }) as TableCell,
        mono(block.intensity, { alignment: "right", color: INK }) as TableCell,
      ]);
    });
  }

  const tips = isEn() ? template.coachingTipsEn : template.coachingTips;
  const p = (k: string) => i18n.t(`common:export.planPdf.${k}`);

  return {
    unbreakable: true,
    stack: [
      {
        text: [
          { text: name, bold: true, fontSize: 11, color: INK },
          { text: `   ${facts}`, font: MONO, fontSize: 7.5, characterSpacing: 0.4, color: INK_2 },
        ],
        margin: [0, 0, 0, 6],
      },
      ...(rows.length
        ? [
            {
              table: {
                headerRows: 1,
                widths: [44, "*", 40, 40, 56],
                body: [
                  [HEAD_CELL("Phase"), HEAD_CELL(p("exercise")), HEAD_CELL(p("sets"), "right"), HEAD_CELL(p("rest"), "right"), HEAD_CELL(p("intensity"), "right")],
                  ...rows,
                ],
              },
              layout: {
                hLineWidth: (i: number) => (i <= 1 || i === rows.length + 1 ? 0.75 : 0.5),
                hLineColor: (i: number) => (i <= 1 || i === rows.length + 1 ? INK : HAIR),
                vLineWidth: () => 0,
                paddingLeft: () => 0,
                paddingRight: (i: number) => (i === 4 ? 0 : 8),
                paddingTop: () => 4,
                paddingBottom: () => 4,
              },
            } as Content,
          ]
        : []),
      ...(tips?.length
        ? [{ text: tips.slice(0, 2).join("  ·  "), fontSize: 8, color: INK_2, margin: [0, 6, 0, 0] } as Content]
        : []),
    ],
    margin: [0, 0, 0, 18],
  } as Content;
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
  const [pdfMakeModule, vfs] = await Promise.all([import("pdfmake/build/pdfmake"), loadFonts()]);
  const pdfMake = pdfMakeModule.default as unknown as {
    addVirtualFileSystem: (vfs: Record<string, string>) => void;
    addFonts: (fonts: Record<string, Record<string, string>>) => void;
    createPdf: (doc: TDocumentDefinitions) => { getBlob: () => Promise<Blob> };
  };
  pdfMake.addVirtualFileSystem(vfs);
  pdfMake.addFonts({
    [DISPLAY]: {
      normal: "BricolageGrotesque-Regular.ttf",
      bold: "BricolageGrotesque-Bold.ttf",
      italics: "BricolageGrotesque-Regular.ttf",
      bolditalics: "BricolageGrotesque-Bold.ttf",
    },
    [MONO]: {
      normal: "JetBrainsMono-Regular.ttf",
      bold: "JetBrainsMono-Bold.ttf",
      italics: "JetBrainsMono-Regular.ttf",
      bolditalics: "JetBrainsMono-Bold.ttf",
    },
  });

  const week = plan.weeks[0];
  const byId = new Map(Object.entries(templates));
  const slots = planWeekToSlots(week, byId);
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

  // Page one: the week.
  const content: Content[] = [
    { text: name, bold: true, fontSize: 26, color: INK, lineHeight: 1, margin: [0, 16, 0, 8] },
    mono(facts, { fontSize: 8.5 }) as unknown as Content,
    rule(0.75, INK, [0, 16, 0, 16]),
    ...rhythmBlock(slots),
    { text: "", margin: [0, 0, 0, 18] },
    daysTable(plan, names, templates, exerciseNames),
    { text: "", margin: [0, 0, 0, 18] },
    ...splitBlock(stats),
  ];

  // Page two: the structures, one entry per catalogue session, first seen first.
  const seen = new Set<string>();
  const entries: Content[] = [];
  for (const session of [...week.sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek)) {
    const template = templates[session.workoutId];
    if (!template || seen.has(session.workoutId)) continue;
    seen.add(session.workoutId);
    entries.push(isStrengthWorkout(template) ? strengthEntry(template, exerciseNames) : runningEntry(template));
  }
  if (entries.length) {
    content.push(
      { ...kicker(t("structures")), pageBreak: "before" } as unknown as Content,
      rule(0.75, INK, [0, 6, 0, 16]),
      ...entries,
    );
  }

  const generated = `${i18n.t("common:export.planPdf.generatedBy")} Zoned · ${formatDateMedium(new Date())}`;

  const doc: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [MARGIN_X, 44, MARGIN_X, 52],
    defaultStyle: { font: DISPLAY, fontSize: 9, color: INK },
    content: pdfSafeDocument(content),
    footer: (page: number, pages: number) => ({
      margin: [MARGIN_X, 14, MARGIN_X, 0],
      stack: [
        rule(0.5, HAIR),
        {
          columns: [
            { width: 90, ...mono("zoned.run") } as unknown as Content,
            { width: "*", ...mono(generated, { alignment: "center" }) } as unknown as Content,
            { width: 90, ...mono(`${page} / ${pages}`, { alignment: "right" }) } as unknown as Content,
          ],
          margin: [0, 6, 0, 0],
        },
      ],
    }),
    info: { title: name, author: "Zoned", creator: "zoned.run" },
  };

  // The wordmark, ink and its one vermillon dot, outside the text filter:
  // its path data is not prose.
  const header: Content = {
    columns: [
      {
        svg: logoSvg.replace('fill="currentColor"', `fill="${INK}"`).replace("var(--accent, #E8452A)", ACCENT),
        width: 76,
      },
      { ...mono(t("kicker").toUpperCase(), { bold: true, color: INK_2, alignment: "right" }), margin: [0, 6, 0, 0] } as unknown as Content,
    ],
  };
  (doc.content as Content[]).unshift(header);

  const blob = await pdfMake.createPdf(doc).getBlob();
  const label = name.trim() || plan.id;
  triggerDownload(blob, `${t("filePrefix")}-${label}.pdf`);
}
