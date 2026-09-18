/**
 * The house style, for every PDF the app prints.
 *
 * Paper and ink: white paper (a PDF is printed), ink #171614, every edge a
 * rule, the ink ramp for the zones, the wordmark with its one vermillon dot
 * and nothing else in colour. The type is the app's own, Bricolage Grotesque
 * for words and JetBrains Mono for labels and figures, embedded from the
 * TrueType files under public/fonts/pdf (pdfmake takes TTF, not woff2) and
 * fetched only when a PDF is asked for. Where the files cannot be fetched,
 * pdfmake's Roboto stands in, so an export never fails for want of a font.
 *
 * The four documents (a week, a session, a plan, a race day) build on the
 * parts below: the header with the wordmark, the mono kicker over a block,
 * the ruled tables, the footer with the page count, and the structure of a
 * session as a ruled table, the same on every sheet that prints one.
 */

import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import logoSvg from "@/assets/logo.svg?raw";
import i18n from "@/i18n";
import { formatDateMedium, pickLang } from "@/lib/i18n-utils";
import { ZONE_HEX_LIGHT } from "@/lib/zoneColors";
import type { WorkoutBlock, WorkoutTemplate, ZoneNumber } from "@/types";
import type { StrengthBlock, StrengthWorkoutTemplate } from "@/types/strength";
import { pdfSafeDocument } from "./pdfText";

// ── The ink ──────────────────────────────────────────────────────────

/** `--ink-1` */
export const INK = "#171614";
/** `--ink-2` */
export const INK_2 = "#4A4845";
/** The ramp's Z2 step: what is quiet, a rest day, a baseline. */
export const INK_PALE = ZONE_HEX_LIGHT[2];
/** The ramp's Z1 step: the hairline between rows. */
export const HAIR = ZONE_HEX_LIGHT[1];
/** The vermillon, the wordmark's dot and nothing else. */
export const ACCENT = "#E8452A";

/** A4 portrait, and the column the margins leave. */
export const PAGE_W = 595.28;
export const MARGIN_X = 40;
export const COLUMN_W = PAGE_W - 2 * MARGIN_X;

/** A pdfmake node before it is typed. */
export type Node = Record<string, unknown>;

/** The ink of a zone, or the paled ink for work that has none. */
export function zoneInk(zone: number | null | undefined): string {
  return zone ? ZONE_HEX_LIGHT[zone as ZoneNumber] : INK_PALE;
}

export function isEn(): boolean {
  return i18n.language?.startsWith("en") ?? false;
}

/** 1h05, 45min. */
export function formatDuration(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
  }
  return `${Math.round(min)}min`;
}

/** Hours with one decimal, comma in French: 6,1. */
export function formatHours(hours: number): string {
  const s = hours.toFixed(1);
  return isEn() ? s : s.replace(".", ",");
}

// ── The fonts ────────────────────────────────────────────────────────

const FONT_FILES = [
  "BricolageGrotesque-Regular.ttf",
  "BricolageGrotesque-Bold.ttf",
  "JetBrainsMono-Regular.ttf",
  "JetBrainsMono-Bold.ttf",
] as const;

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
      FONT_FILES.map(async (file) => {
        const res = await fetch(`${import.meta.env.BASE_URL}fonts/pdf/${file}`);
        if (!res.ok) throw new Error(`Font ${file} unavailable (${res.status})`);
        return [file, toBase64(await res.arrayBuffer())] as const;
      }),
    ).then((entries) => Object.fromEntries(entries));
    fontVfs.catch(() => {
      fontVfs = null;
    });
  }
  return fontVfs;
}

/** The font families a document names: the house pair, or Roboto twice. */
export interface HouseFonts {
  display: string;
  mono: string;
}

interface PdfMakeLike {
  vfs?: unknown;
  addVirtualFileSystem?: (vfs: Record<string, string>) => void;
  addFonts?: (fonts: Record<string, Record<string, string>>) => void;
  createPdf: (doc: TDocumentDefinitions) => { getBlob: () => Promise<Blob> };
}

/**
 * pdfmake, with the house fonts registered when they can be fetched, and
 * pdfmake's own Roboto otherwise. The fallback is what keeps an export
 * alive offline before the files are cached, and what the tests run on.
 */
export async function preparePdfMake(): Promise<{ pdfMake: PdfMakeLike; fonts: HouseFonts }> {
  const pdfMake = (await import("pdfmake/build/pdfmake")).default as unknown as PdfMakeLike;
  try {
    if (typeof pdfMake.addVirtualFileSystem !== "function" || typeof pdfMake.addFonts !== "function") {
      throw new Error("pdfmake without custom fonts");
    }
    const vfs = await loadFonts();
    pdfMake.addVirtualFileSystem(vfs);
    pdfMake.addFonts({
      Bricolage: {
        normal: "BricolageGrotesque-Regular.ttf",
        bold: "BricolageGrotesque-Bold.ttf",
        italics: "BricolageGrotesque-Regular.ttf",
        bolditalics: "BricolageGrotesque-Bold.ttf",
      },
      Mono: {
        normal: "JetBrainsMono-Regular.ttf",
        bold: "JetBrainsMono-Bold.ttf",
        italics: "JetBrainsMono-Regular.ttf",
        bolditalics: "JetBrainsMono-Bold.ttf",
      },
    });
    return { pdfMake, fonts: { display: "Bricolage", mono: "Mono" } };
  } catch {
    const fonts = await import("pdfmake/build/vfs_fonts");
    pdfMake.vfs = fonts.default.vfs;
    return { pdfMake, fonts: { display: "Roboto", mono: "Roboto" } };
  }
}

// ── The parts ────────────────────────────────────────────────────────

export interface House {
  fonts: HouseFonts;
  /** A mono label: small, tracked, in the second ink. */
  mono: (text: string, extra?: Node) => Node;
  /** The mono kicker over a block: bold, upper case, full ink. */
  kicker: (text: string, extra?: Node) => Node;
  /** One ruled line across the column. */
  rule: (width?: number, color?: string, margin?: [number, number, number, number]) => Content;
  /** The wordmark on the left, what the sheet is on the right. */
  header: (kickerText: string) => Content;
  /** The head cell of a ruled table. */
  headCell: (text: string, alignment?: "left" | "center" | "right") => TableCell;
  /** A ruled table's layout: ink rule above the head and at the foot, hairlines between. */
  ruledLayout: (rows: number, lastColumn: number, opts?: { headed?: boolean }) => Node;
  /** The structure of a running session, as a titled ruled table. */
  runningStructure: (template: WorkoutTemplate, opts?: StructureOptions) => Content;
  /** The structure of a strength session, as a titled ruled table. */
  strengthStructure: (
    template: StrengthWorkoutTemplate,
    exerciseNames: Record<string, string>,
    opts?: StructureOptions,
  ) => Content;
  /** The document, with the header first, the footer on every page, the text filtered. */
  doc: (content: Content[], opts: { title: string; kicker: string; footerLeft?: string }) => TDocumentDefinitions;
}

export interface StructureOptions {
  /** The line of facts after the name (type, zone, duration). */
  facts?: string;
  /** How many coaching tips to print under the table. */
  tips?: number;
  /** Bottom margin of the entry. */
  marginBottom?: number;
  /** The name is already on the page: print the table alone. */
  bare?: boolean;
}

function phaseLabel(phase: "warmup" | "mainSet" | "cooldown"): string {
  return i18n.t(`common:export.planPdf.${phase}`);
}

export function createHouse(fonts: HouseFonts): House {
  const mono = (text: string, extra: Node = {}): Node => ({
    text,
    font: fonts.mono,
    fontSize: 7.5,
    characterSpacing: 0.6,
    color: INK_2,
    ...extra,
  });

  const kicker = (text: string, extra: Node = {}): Node =>
    mono(text.toUpperCase(), { bold: true, color: INK, characterSpacing: 1, ...extra });

  const rule = (
    width = 0.75,
    color = INK,
    margin: [number, number, number, number] = [0, 0, 0, 0],
  ): Content => ({
    canvas: [{ type: "line", x1: 0, y1: 0, x2: COLUMN_W, y2: 0, lineWidth: width, lineColor: color }],
    margin,
  });

  const headCell = (text: string, alignment: "left" | "center" | "right" = "left"): TableCell =>
    mono(text.toUpperCase(), { fontSize: 6.5, alignment }) as TableCell;

  const ruledLayout = (rows: number, lastColumn: number, opts: { headed?: boolean } = {}): Node => {
    const headed = opts.headed ?? true;
    const last = rows + (headed ? 1 : 0);
    return {
      hLineWidth: (i: number) => (i === 0 || i === last || (headed && i === 1) ? 0.75 : 0.5),
      hLineColor: (i: number) => (i === 0 || i === last || (headed && i === 1) ? INK : HAIR),
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: (i: number) => (i === lastColumn ? 0 : 8),
      paddingTop: () => 4,
      paddingBottom: () => 4,
    };
  };

  const entryTitle = (name: string, facts: string | undefined): Content => ({
    text: [
      { text: name, bold: true, fontSize: 11, color: INK },
      ...(facts
        ? [{ text: `   ${facts}`, font: fonts.mono, fontSize: 7.5, characterSpacing: 0.4, color: INK_2 }]
        : []),
    ],
    margin: [0, 0, 0, 6],
  });

  const tipsLine = (tips: string[] | undefined, count: number): Content[] =>
    tips?.length && count > 0
      ? [{ text: tips.slice(0, count).join("  ·  "), fontSize: 8, color: INK_2, margin: [0, 6, 0, 0] }]
      : [];

  const runningStructure = (template: WorkoutTemplate, opts: StructureOptions = {}): Content => {
    const sections: { phase: string; blocks: WorkoutBlock[] }[] = [];
    if (template.warmupTemplate?.length) sections.push({ phase: phaseLabel("warmup"), blocks: template.warmupTemplate });
    if (template.mainSetTemplate?.length) sections.push({ phase: phaseLabel("mainSet"), blocks: template.mainSetTemplate });
    if (template.cooldownTemplate?.length) sections.push({ phase: phaseLabel("cooldown"), blocks: template.cooldownTemplate });

    const rows: TableCell[][] = [];
    for (const { phase, blocks } of sections) {
      blocks.forEach((block, i) => {
        let reps = "-";
        if (block.sets && block.sets > 1 && block.repetitions && block.repetitions > 1) {
          reps = `${block.sets} × ${block.repetitions}`;
        } else if (block.repetitions && block.repetitions > 1) {
          reps = `${block.repetitions} ×`;
        }
        rows.push([
          mono(i === 0 ? phase : "", { fontSize: 7 }) as TableCell,
          { text: pickLang(block, "description"), fontSize: 8.5, color: INK },
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
        ...(opts.bare ? [] : [entryTitle(pickLang(template, "name"), opts.facts)]),
        ...(rows.length
          ? [
              {
                table: {
                  headerRows: 1,
                  widths: [44, "*", 40, 30, 36],
                  body: [
                    [
                      headCell("Phase"),
                      headCell("Description"),
                      headCell(i18n.t("common:export.planPdf.durationCol"), "right"),
                      headCell("Zone", "center"),
                      headCell("Reps", "right"),
                    ],
                    ...rows,
                  ],
                },
                layout: ruledLayout(rows.length, 4),
              } as unknown as Content,
            ]
          : []),
        ...tipsLine(tips, opts.tips ?? 2),
      ],
      margin: [0, 0, 0, opts.marginBottom ?? 18],
    } as Content;
  };

  const strengthStructure = (
    template: StrengthWorkoutTemplate,
    exerciseNames: Record<string, string>,
    opts: StructureOptions = {},
  ): Content => {
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

    const p = (k: string) => i18n.t(`common:export.planPdf.${k}`);
    const tips = isEn() ? template.coachingTipsEn : template.coachingTips;
    return {
      unbreakable: true,
      stack: [
        ...(opts.bare ? [] : [entryTitle(pickLang(template, "name"), opts.facts)]),
        ...(rows.length
          ? [
              {
                table: {
                  headerRows: 1,
                  widths: [44, "*", 40, 40, 56],
                  body: [
                    [
                      headCell("Phase"),
                      headCell(p("exercise")),
                      headCell(p("sets"), "right"),
                      headCell(p("rest"), "right"),
                      headCell(p("intensity"), "right"),
                    ],
                    ...rows,
                  ],
                },
                layout: ruledLayout(rows.length, 4),
              } as unknown as Content,
            ]
          : []),
        ...tipsLine(tips, opts.tips ?? 2),
      ],
      margin: [0, 0, 0, opts.marginBottom ?? 18],
    } as Content;
  };

  const header = (kickerText: string): Content => ({
    columns: [
      {
        svg: logoSvg.replace('fill="currentColor"', `fill="${INK}"`).replace("var(--accent, #E8452A)", ACCENT),
        width: 76,
      },
      { ...mono(kickerText.toUpperCase(), { bold: true, color: INK_2, alignment: "right" }), margin: [0, 6, 0, 0] } as unknown as Content,
    ],
  });

  const doc = (
    content: Content[],
    opts: { title: string; kicker: string; footerLeft?: string },
  ): TDocumentDefinitions => {
    const generated = `${i18n.t("common:export.planPdf.generatedBy")} Zoned · ${formatDateMedium(new Date())}`;
    const body = pdfSafeDocument(content);
    // The wordmark stays outside the text filter: its path data is not prose.
    body.unshift(header(opts.kicker));
    return {
      pageSize: "A4",
      pageMargins: [MARGIN_X, 44, MARGIN_X, 52],
      defaultStyle: { font: fonts.display, fontSize: 9, color: INK },
      content: body,
      footer: (page: number, pages: number) => ({
        margin: [MARGIN_X, 14, MARGIN_X, 0],
        stack: [
          rule(0.5, HAIR),
          {
            columns: [
              { width: 120, ...mono(opts.footerLeft ?? "zoned.run") } as unknown as Content,
              { width: "*", ...mono(generated, { alignment: "center" }) } as unknown as Content,
              { width: 120, ...mono(`${page} / ${pages}`, { alignment: "right" }) } as unknown as Content,
            ],
            margin: [0, 6, 0, 0],
          },
        ],
      }),
      info: { title: opts.title, author: "Zoned", creator: "zoned.run" },
    };
  };

  return { fonts, mono, kicker, rule, header, headCell, ruledLayout, runningStructure, strengthStructure, doc };
}
