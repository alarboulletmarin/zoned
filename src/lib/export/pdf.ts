/**
 * PDF Export - Document format
 *
 * Creates comprehensive PDF documents from workout templates
 */

import type { TDocumentDefinitions, Content, Size, TableCell } from "pdfmake/interfaces";
import type { WorkoutTemplate, WorkoutBlock } from "@/types";
import { CATEGORY_META, DIFFICULTY_META, getZoneNumber } from "@/types";
import { getZoneHex } from "@/lib/zoneColors";
import { getWorkoutDuration } from "@/components/visualization";
import i18n from "@/i18n";
import { pickLang, pickLangArray, formatDate } from "@/lib/i18n-utils";

/**
 * Zone colours for PDF. PDFs are always rendered on white, so the light ramp
 * applies. This used to be a local table that had drifted a full zone out of
 * step with the app: recovery printed green and endurance blue.
 *
 * `zoneSpec` is the raw string and may be a range (`Z1-Z2`); it resolves to
 * the dominant zone, the same way the app does.
 */
function zoneColorFor(zoneSpec: string | undefined): string | undefined {
  if (!zoneSpec) return undefined;
  return getZoneHex(getZoneNumber(zoneSpec), { theme: "light" });
}

/**
 * Geometry of the three phase tables (warmup / main set / cooldown). Declared
 * once because every row has to match it: pdfmake validates the cell count of
 * each row against the column count and throws on a mismatch.
 */
const PHASE_TABLE_WIDTHS: Size[] = ["*", 50, 40, 35, 50];
const PHASE_TABLE_COLUMNS = PHASE_TABLE_WIDTHS.length;

/**
 * Format blocks into table rows for PDF
 *
 * `blocks` is optional: `warmupTemplate` and `cooldownTemplate` are optional on
 * `WorkoutStructureSource`, and a custom workout restored from localStorage can
 * genuinely arrive without them.
 */
function formatBlocksTable(blocks: WorkoutBlock[] | undefined): TableCell[][] {
  if (!blocks || blocks.length === 0) {
    // The placeholder has to span the whole table, not sit in a one-cell row.
    // pdfmake 0.3 rejects a short row outright — "Malformed table row, a cell
    // is undefined" — which broke every session with an empty phase (the
    // recovery runs, CYC-001). `colSpan` also has to be followed by the empty
    // cells it swallows, or the row is short again by pdfmake's count.
    return [
      [
        {
          text: i18n.t("common:export.workoutPdf.none"),
          italics: true,
          color: "#666",
          colSpan: PHASE_TABLE_COLUMNS,
        },
        ...Array.from({ length: PHASE_TABLE_COLUMNS - 1 }, () => ({}) as TableCell),
      ],
    ];
  }

  return blocks.map((block) => {
    const desc = pickLang(block, "description");
    const duration = block.durationMin ? `${block.durationMin} min` : "";
    const zone = block.zone || "";
    const reps = block.repetitions && block.repetitions > 1 ? `x${block.repetitions}` : "";
    const rest = block.rest || "";

    const row: TableCell[] = [
      { text: desc, margin: [0, 2, 0, 2] },
      { text: duration, alignment: "center", margin: [0, 2, 0, 2] },
      {
        text: zone,
        alignment: "center",
        color: zoneColorFor(zone),
        bold: !!zone,
        margin: [0, 2, 0, 2],
      },
      { text: reps, alignment: "center", margin: [0, 2, 0, 2] },
      { text: rest, alignment: "center", margin: [0, 2, 0, 2] },
    ];

    return row;
  });
}

/**
 * Export workout to PDF document
 *
 * @param workout - The workout template to export
 * @param isEn - Use English language
 * @returns Promise that resolves when download is triggered
 */
export async function exportToPDF(
  workout: WorkoutTemplate,
): Promise<void> {
  try {
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.vfs;

    const t = (key: string, opts?: Record<string, unknown>) =>
      i18n.t(`common:export.workoutPdf.${key}`, opts);
    const title = pickLang(workout, "name");
    const description = pickLang(workout, "description");
    const duration = getWorkoutDuration(workout);
    const category = pickLang(CATEGORY_META[workout.category], "label");
    const difficulty = pickLang(DIFFICULTY_META[workout.difficulty], "label");
    const tips = pickLangArray<string>(workout, "coachingTips");
    const mistakes = pickLangArray<string>(workout, "commonMistakes");

    const tableHeader: TableCell[] = [
      { text: t("description"), style: "tableHeader" },
      { text: t("durationCol"), style: "tableHeader" },
      { text: t("zone"), style: "tableHeader" },
      { text: t("reps"), style: "tableHeader" },
      { text: t("rest"), style: "tableHeader" },
    ];

    const content: Content = [
      // Header
      { text: title, style: "header" },
      { text: description, style: "description", margin: [0, 0, 0, 15] },

      // Metadata
      {
        columns: [
          { text: `${t("category")}: ${category}`, style: "metadata" },
          { text: `${t("difficulty")}: ${difficulty}`, style: "metadata" },
          { text: `${t("durationLabel")}: ${t("durationValue", { duration })}`, style: "metadata" },
        ],
        margin: [0, 0, 0, 20],
      },

      // Warmup
      { text: t("warmup"), style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: PHASE_TABLE_WIDTHS,
          body: [tableHeader, ...formatBlocksTable(workout.warmupTemplate)],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 15],
      },

      // Main Set
      { text: t("mainSet"), style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: PHASE_TABLE_WIDTHS,
          body: [tableHeader, ...formatBlocksTable(workout.mainSetTemplate)],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 15],
      },

      // Cooldown
      { text: t("cooldown"), style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: PHASE_TABLE_WIDTHS,
          body: [tableHeader, ...formatBlocksTable(workout.cooldownTemplate)],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20],
      },

      // Coaching Tips
      { text: t("coachingTips"), style: "sectionHeader" },
      {
        ul: tips.length > 0 ? tips : [t("noTips")],
        margin: [0, 0, 0, 15],
      },

      // Common Mistakes
      { text: t("commonMistakes"), style: "sectionHeader" },
      {
        ul: mistakes.length > 0 ? mistakes : [t("noMistakes")],
        margin: [0, 0, 0, 15],
      },

      // Footer
      {
        text: `${t("generatedBy")} Zoned - ${formatDate(new Date())}`,
        style: "footer",
        margin: [0, 20, 0, 0],
      },
    ];

    const docDefinition: TDocumentDefinitions = {
      content,
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        description: {
          fontSize: 12,
          color: "#666",
          italics: true,
        },
        metadata: {
          fontSize: 10,
          color: "#888",
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 8],
          color: "#333",
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: "#fff",
          fillColor: "#333",
          alignment: "center",
        },
        footer: {
          fontSize: 9,
          color: "#999",
          alignment: "center",
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
      pageMargins: [40, 40, 40, 40],
    };

    // pdfmake types are outdated - getBlob() returns Promise<Blob> in recent versions
    const pdf = pdfMake.createPdf(docDefinition) as unknown as { getBlob: () => Promise<Blob> };
    const blob = await pdf.getBlob();

    // Trigger download manually (same pattern as ICS/FIT)
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workout.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
