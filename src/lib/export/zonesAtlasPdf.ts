/**
 * Zones Atlas PDF — "Mes zones" on a single A4 page.
 *
 * Personal pace/HR zone table, built from the same `calculateAllZones()` the
 * `/my-zones` page renders, so the PDF can never disagree with the screen.
 * No weekly-volume distribution bar: that would need a real training week to
 * read the split from, and nothing here has one — a plan's or a week's own
 * PDF is the place for that, not a standalone zone reference.
 */

import type { TDocumentDefinitions, Content, Size, TableCell } from "pdfmake/interfaces";
import type { UserZonePreferences } from "@/types";
import type { UnitSystem } from "@/types/settings";
import { ZONE_META, type ZoneNumber } from "@/types";
import { calculateAllZones, formatPace } from "@/lib/zones";
import { convertPace, getPaceUnit, getSpeedUnit } from "@/lib/units";
import { getZoneHex } from "@/lib/zoneColors";
import i18n from "@/i18n";
import { pickLang, formatDate } from "@/lib/i18n-utils";

const INK = "#0B0B0A";
const INK_MUTED = "#3B3A33";
const INK_FAINT = "#5B594F";
const RULE = "#CFCCC0";
const PAPER = "#FCFBF6";

const ZONE_ROW_WIDTHS: Size[] = [40, "*", 100, 80];

/** Ink or paper text on a flat zone chip — mirrors `--zone-N-text`. */
function zoneChipText(zone: ZoneNumber): string {
  return zone >= 5 ? PAPER : INK;
}

export async function exportZonesAtlasToPDF(
  prefs: UserZonePreferences,
  unit: UnitSystem,
): Promise<void> {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default;
  pdfMake.vfs = pdfFontsModule.default.vfs;

  const t = (key: string, opts?: Record<string, unknown>) =>
    i18n.t(`common:export.zonesAtlasPdf.${key}`, opts);

  const zones = calculateAllZones(prefs);
  const paceUnit = getPaceUnit(unit);

  const meta = prefs.vma && prefs.fcMax
    ? t("metaBoth", { vma: prefs.vma, unit: getSpeedUnit(unit), fcMax: prefs.fcMax, date: formatDate(new Date()) })
    : prefs.vma
      ? t("metaVmaOnly", { vma: prefs.vma, unit: getSpeedUnit(unit), date: formatDate(new Date()) })
      : t("metaFcOnly", { fcMax: prefs.fcMax, date: formatDate(new Date()) });

  const tableHeader: TableCell[] = [
    { text: t("zone"), style: "tableHeader" },
    { text: t("usage"), style: "tableHeader", alignment: "left" },
    { text: t("pace"), style: "tableHeader" },
    { text: t("heartRate"), style: "tableHeader" },
  ];

  const rows: TableCell[][] = zones.map((z) => {
    const zoneNum = z.zone as ZoneNumber;
    const zoneMeta = ZONE_META[zoneNum];
    const paceCell = z.paceMinPerKm != null && z.paceMaxPerKm != null
      ? `${formatPace(convertPace(z.paceMinPerKm, unit))}–${formatPace(convertPace(z.paceMaxPerKm, unit))} ${paceUnit}`
      : "—";
    const hrCell = z.hrMin != null && z.hrMax != null ? `${z.hrMin}–${z.hrMax}` : "—";

    return [
      {
        text: `Z${zoneNum}`,
        fillColor: getZoneHex(zoneNum, { theme: "light" }),
        color: zoneChipText(zoneNum),
        bold: true,
        alignment: "center",
        margin: [0, 3, 0, 3],
      },
      { text: pickLang(zoneMeta, "label"), fontSize: 11, margin: [4, 5, 0, 5] },
      { text: paceCell, fontSize: 10, alignment: "center", margin: [0, 5, 0, 5] },
      { text: hrCell, fontSize: 10, color: INK_FAINT, alignment: "center", margin: [0, 5, 0, 5] },
    ];
  });

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
    { text: t("title").toUpperCase(), style: "header" },
    { text: meta, style: "metaLine", margin: [0, 6, 0, 20] },
    {
      table: {
        headerRows: 1,
        widths: ZONE_ROW_WIDTHS,
        body: [tableHeader, ...rows],
      },
      layout: {
        hLineWidth: (i: number) => (i === 0 || i === 1 ? 1.5 : 0.5),
        vLineWidth: () => 0,
        hLineColor: (i: number) => (i === 0 || i === 1 ? INK : RULE),
      },
    },
    {
      text: t("footerNote"),
      style: "footer",
      margin: [0, 30, 0, 0],
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      wordmark: { fontSize: 13, bold: true, color: INK },
      kicker: { fontSize: 9, bold: true, color: INK_FAINT, characterSpacing: 1, alignment: "right" as const },
      header: { fontSize: 30, bold: true, color: INK },
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
  link.download = "zoned-atlas-des-zones.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
