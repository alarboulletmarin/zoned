/**
 * A session as a PDF, in the house style.
 *
 * It was a grey document in Roboto with black table heads: title, italic
 * description, three "lightHorizontalLines" tables, two bullet lists and a
 * footer line. The sheet now reads like the app: the wordmark, the name, the
 * facts in mono (category, difficulty, duration, dominant zone), the session's
 * profile drawn on the ink ramp, the three phases as ruled tables, the tips
 * and the mistakes as ruled lines, and the footer with the page count.
 *
 * Two contracts the tests hold: every row of a phase table is as wide as the
 * table (pdfmake 0.3 throws on a short row), and an empty phase prints one
 * placeholder row spanning the table.
 */

import type { Content, Size, TableCell } from "pdfmake/interfaces";
import type { WorkoutTemplate, WorkoutBlock } from "@/types";
import { CATEGORY_META, DIFFICULTY_META, getDominantZone } from "@/types";
import { getWorkoutDuration, toZoneBarBlocks } from "@/components/visualization";
import { ZONE_HEX_LIGHT, UNZONED_HEX } from "@/lib/zoneColors";
import i18n from "@/i18n";
import { pickLang, pickLangArray } from "@/lib/i18n-utils";
import { triggerDownload } from "./download";
import { COLUMN_W, INK, INK_2, HAIR, createHouse, formatDuration, preparePdfMake, type House } from "./pdfHouse";

/**
 * Geometry of the three phase tables (warmup / main set / cooldown). Declared
 * once because every row has to match it: pdfmake validates the cell count of
 * each row against the column count and throws on a mismatch.
 */
const PHASE_TABLE_WIDTHS: Size[] = ["*", 40, 30, 36, 44];
const PHASE_TABLE_COLUMNS = PHASE_TABLE_WIDTHS.length;

/** Block height per zone on the frieze, mirroring `--zone-h-1..6`; 0 = unzoned. */
const ZONE_HEIGHT: Record<number, number> = { 0: 0.26, 1: 0.3, 2: 0.44, 3: 0.58, 4: 0.72, 5: 0.86, 6: 1 };

function t(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`common:export.workoutPdf.${key}`, opts);
}

/**
 * The session's profile, the same reading as the app's ZoneBar: one block per
 * segment, width = time, intensity coded twice, by ink and by height. A
 * recovery block is drawn as sunken paper. Vectors, so it prints sharp.
 */
function friezeBlock(workout: WorkoutTemplate): Content | null {
  const blocks = toZoneBarBlocks(workout);
  const total = blocks.reduce((sum, b) => sum + b.seconds, 0);
  if (!blocks.length || total <= 0) return null;
  const height = 44;
  const gap = 1.5;
  const inner = COLUMN_W - gap * (blocks.length - 1);
  let x = 0;
  const shapes = blocks.map((b) => {
    const w = Math.max(3, (b.seconds / total) * inner);
    const hh = ZONE_HEIGHT[b.zone] * height;
    const shape = {
      type: "rect",
      x,
      y: height - hh,
      w,
      h: hh,
      color: b.zone === 0 ? UNZONED_HEX : ZONE_HEX_LIGHT[b.zone],
      lineColor: INK,
      lineWidth: 0.75,
    };
    x += w + gap;
    return shape;
  });
  return { canvas: shapes as never };
}

/**
 * Format blocks into table rows for PDF
 *
 * `blocks` is optional: `warmupTemplate` and `cooldownTemplate` are optional on
 * `WorkoutStructureSource`, and a custom workout restored from localStorage can
 * genuinely arrive without them.
 */
function formatBlocksTable(h: House, blocks: WorkoutBlock[] | undefined): TableCell[][] {
  if (!blocks || blocks.length === 0) {
    // The placeholder has to span the whole table, not sit in a one-cell row.
    // pdfmake 0.3 rejects a short row outright, "Malformed table row, a cell
    // is undefined", which broke every session with an empty phase (the
    // recovery runs, CYC-001). `colSpan` also has to be followed by the empty
    // cells it swallows, or the row is short again by pdfmake's count.
    return [
      [
        { ...h.mono(t("none")), colSpan: PHASE_TABLE_COLUMNS } as TableCell,
        ...Array.from({ length: PHASE_TABLE_COLUMNS - 1 }, () => ({}) as TableCell),
      ],
    ];
  }

  return blocks.map((block) => {
    const reps = block.repetitions && block.repetitions > 1 ? `×${block.repetitions}` : "";
    const row: TableCell[] = [
      { text: pickLang(block, "description"), fontSize: 8.5, color: INK },
      h.mono(block.durationMin ? formatDuration(block.durationMin) : "", { alignment: "right", color: INK }) as TableCell,
      h.mono(block.zone || "", { bold: true, alignment: "center", color: INK }) as TableCell,
      h.mono(reps, { alignment: "right", color: INK }) as TableCell,
      h.mono(block.rest || "", { alignment: "right", color: INK }) as TableCell,
    ];
    return row;
  });
}

/**
 * A ruled list: a rule above, a hairline between two lines, a rule below.
 * Drawn as lines rather than as a table, so the three phase tables stay
 * the only tables of the document, which is what the tests count.
 */
function ruledList(h: House, items: string[]): Content {
  const stack: Content[] = [h.rule(0.75, INK)];
  items.forEach((item, i) => {
    stack.push({ text: item, fontSize: 9, color: INK, margin: [0, 5, 0, 5] });
    stack.push(i === items.length - 1 ? h.rule(0.75, INK) : h.rule(0.5, HAIR));
  });
  return { stack };
}

/**
 * Export workout to PDF document
 *
 * @param workout - The workout template to export
 * @returns Promise that resolves when download is triggered
 */
export async function exportToPDF(workout: WorkoutTemplate): Promise<void> {
  try {
    const { pdfMake, fonts } = await preparePdfMake();
    const h = createHouse(fonts);

    const title = pickLang(workout, "name");
    const description = pickLang(workout, "description");
    const duration = getWorkoutDuration(workout);
    const category = pickLang(CATEGORY_META[workout.category], "label");
    const difficulty = pickLang(DIFFICULTY_META[workout.difficulty], "label");
    const tips = pickLangArray<string>(workout, "coachingTips");
    const mistakes = pickLangArray<string>(workout, "commonMistakes");
    const zone = getDominantZone(workout);

    const facts = [category, difficulty, formatDuration(duration), `Z${zone}`].filter(Boolean).join("  ·  ");

    const tableHeader = (): TableCell[] => [
      h.headCell(t("description")),
      h.headCell(t("durationCol"), "right"),
      h.headCell(t("zone"), "center"),
      h.headCell(t("reps"), "right"),
      h.headCell(t("rest"), "right"),
    ];

    const phase = (label: string, blocks: WorkoutBlock[] | undefined): Content[] => {
      const rows = formatBlocksTable(h, blocks);
      return [
        h.kicker(label, { margin: [0, 0, 0, 6] }) as unknown as Content,
        {
          table: { headerRows: 1, widths: PHASE_TABLE_WIDTHS, body: [tableHeader(), ...rows] },
          layout: h.ruledLayout(rows.length, PHASE_TABLE_COLUMNS - 1),
          margin: [0, 0, 0, 16],
        } as unknown as Content,
      ];
    };

    const frieze = friezeBlock(workout);

    const content: Content[] = [
      { text: title, bold: true, fontSize: 26, color: INK, lineHeight: 1, margin: [0, 16, 0, 8] },
      h.mono(facts, { fontSize: 8.5 }) as unknown as Content,
      ...(description ? [{ text: description, fontSize: 10, color: INK_2, lineHeight: 1.3, margin: [0, 12, 0, 0] } as Content] : []),
      h.rule(0.75, INK, [0, 16, 0, 16]),
      ...(frieze ? [frieze, { text: "", margin: [0, 0, 0, 18] } as Content] : []),

      ...phase(t("warmup"), workout.warmupTemplate),
      ...phase(t("mainSet"), workout.mainSetTemplate),
      ...phase(t("cooldown"), workout.cooldownTemplate),

      h.kicker(t("coachingTips"), { margin: [0, 4, 0, 6] }) as unknown as Content,
      ruledList(h, tips.length > 0 ? tips : [t("noTips")]),
      { text: "", margin: [0, 0, 0, 16] },
      h.kicker(t("commonMistakes"), { margin: [0, 0, 0, 6] }) as unknown as Content,
      ruledList(h, mistakes.length > 0 ? mistakes : [t("noMistakes")]),
    ];

    const blob = await pdfMake
      .createPdf(h.doc(content, { title, kicker: t("kicker"), footerLeft: `zoned.run · ${workout.id}` }))
      .getBlob();
    triggerDownload(blob, `${workout.id}.pdf`);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
