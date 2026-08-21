/**
 * Collection PDF — one curated collection as a numbered session list on A4.
 *
 * Deliberately dumber than `zonesAtlasPdf.ts`: the caller already holds the
 * localised workout names, the resolved zones and the formatted durations, so
 * this module only lays them out. It shares that file's ink/paper palette and
 * table layout so the two exports read as the same stationery.
 */

import type { TDocumentDefinitions, Content, Size, TableCell } from "pdfmake/interfaces";
import type { ZoneNumber } from "@/types";
import { getZoneHex } from "@/lib/zoneColors";
import i18n from "@/i18n";
import { formatDate } from "@/lib/i18n-utils";

const INK = "#0B0B0A";
const INK_MUTED = "#3B3A33";
const INK_FAINT = "#5B594F";
const RULE = "#CFCCC0";
const PAPER = "#FCFBF6";

const ROW_WIDTHS: Size[] = [28, "*", 44, 60];

/** Ink or paper text on a flat zone chip — mirrors `--zone-N-text`. */
function zoneChipText(zone: ZoneNumber): string {
  return zone >= 5 ? PAPER : INK;
}

export interface CollectionPdfRow {
  name: string;
  /** `null` for sessions that carry no zone (strength). */
  zone: ZoneNumber | null;
  durationLabel: string;
}

export interface CollectionPdfInput {
  slug: string;
  name: string;
  description: string;
  rows: CollectionPdfRow[];
  /** Same mix the hero bar shows, already rounded to whole percents. */
  zoneMix: { zone: ZoneNumber; percent: number }[];
}

export async function exportCollectionToPDF(input: CollectionPdfInput): Promise<void> {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default;
  pdfMake.vfs = pdfFontsModule.default.vfs;

  const t = (key: string, opts?: Record<string, unknown>) =>
    i18n.t(`common:export.collectionPdf.${key}`, opts);

  const tableHeader: TableCell[] = [
    { text: t("number"), style: "tableHeader" },
    { text: t("session"), style: "tableHeader", alignment: "left" },
    { text: t("zone"), style: "tableHeader" },
    { text: t("duration"), style: "tableHeader" },
  ];

  const rows: TableCell[][] = input.rows.map((row, index) => [
    {
      text: String(index + 1).padStart(2, "0"),
      fontSize: 9,
      color: INK_FAINT,
      alignment: "center",
      margin: [0, 5, 0, 5],
    },
    { text: row.name, fontSize: 11, margin: [4, 5, 0, 5] },
    row.zone != null
      ? {
          text: `Z${row.zone}`,
          fillColor: getZoneHex(row.zone, { theme: "light" }),
          color: zoneChipText(row.zone),
          bold: true,
          fontSize: 9,
          alignment: "center",
          margin: [0, 5, 0, 5],
        }
      : { text: "—", fontSize: 9, color: INK_FAINT, alignment: "center", margin: [0, 5, 0, 5] },
    { text: row.durationLabel, fontSize: 10, alignment: "center", margin: [0, 5, 0, 5] },
  ]);

  const meta = [
    t("sessionCount", { count: input.rows.length }),
    formatDate(new Date()),
  ].join(" · ");

  const content: Content = [
    {
      columns: [
        { text: "Zoned", style: "wordmark" },
        { text: t("kicker"), style: "kicker" },
      ],
    },
    {
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: INK }],
      margin: [0, 6, 0, 16],
    },
    { text: input.name.toUpperCase(), style: "header" },
    { text: meta, style: "metaLine", margin: [0, 6, 0, 10] },
    { text: input.description, style: "metaLine", margin: [0, 0, 0, 16] },
    ...(input.zoneMix.length > 0
      ? [
          {
            text: `${t("zoneMix")} ${input.zoneMix.map((z) => `${z.percent}% Z${z.zone}`).join(" · ")}`,
            style: "metaLine",
            margin: [0, 0, 0, 16] as [number, number, number, number],
          },
        ]
      : []),
    {
      table: {
        headerRows: 1,
        widths: ROW_WIDTHS,
        body: [tableHeader, ...rows],
      },
      layout: {
        hLineWidth: (i: number) => (i === 0 || i === 1 ? 1.5 : 0.5),
        vLineWidth: () => 0,
        hLineColor: (i: number) => (i === 0 || i === 1 ? INK : RULE),
      },
    },
    { text: t("footerNote"), style: "footer", margin: [0, 24, 0, 0] },
  ];

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      wordmark: { fontSize: 13, bold: true, color: INK },
      kicker: { fontSize: 9, bold: true, color: INK_FAINT, characterSpacing: 1, alignment: "right" as const },
      header: { fontSize: 26, bold: true, color: INK },
      metaLine: { fontSize: 10, color: INK_MUTED },
      tableHeader: { bold: true, fontSize: 8, color: PAPER, fillColor: INK, margin: [4, 4, 4, 4] },
      footer: { fontSize: 8, color: INK_FAINT },
    },
    defaultStyle: { fontSize: 10, color: INK },
    pageMargins: [40, 40, 40, 40],
  };

  const pdf = pdfMake.createPdf(docDefinition) as unknown as { getBlob: () => Promise<Blob> };
  const blob = await pdf.getBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `zoned-collection-${input.slug}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
