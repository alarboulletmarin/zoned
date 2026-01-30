/**
 * PDF Export - Document format
 *
 * Creates comprehensive PDF documents from workout templates
 */

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";
import type { WorkoutTemplate, WorkoutBlock } from "@/types";
import { CATEGORY_META, DIFFICULTY_META } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";

// Initialize fonts
pdfMake.vfs = pdfFonts.vfs;

/**
 * Zone colors for PDF (RGB values)
 */
const ZONE_COLORS: Record<string, string> = {
  Z1: "#22c55e", // green
  Z2: "#3b82f6", // blue
  Z3: "#eab308", // yellow
  Z4: "#f97316", // orange
  Z5: "#ef4444", // red
  Z6: "#a855f7", // purple
};

/**
 * Format blocks into table rows for PDF
 */
function formatBlocksTable(blocks: WorkoutBlock[], isEn: boolean): TableCell[][] {
  if (blocks.length === 0) {
    return [[{ text: isEn ? "None" : "Aucun", italics: true, color: "#666" }]];
  }

  return blocks.map((block) => {
    const desc = isEn && block.descriptionEn ? block.descriptionEn : block.description;
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
        color: zone ? ZONE_COLORS[zone] : undefined,
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
  isEn: boolean
): Promise<void> {
  const title = isEn ? workout.nameEn : workout.name;
  const description = isEn ? workout.descriptionEn : workout.description;
  const duration = getWorkoutDuration(workout);
  const category = isEn
    ? CATEGORY_META[workout.category].labelEn
    : CATEGORY_META[workout.category].label;
  const difficulty = isEn
    ? DIFFICULTY_META[workout.difficulty].labelEn
    : DIFFICULTY_META[workout.difficulty].label;
  const tips = isEn ? workout.coachingTipsEn : workout.coachingTips;
  const mistakes = isEn ? workout.commonMistakesEn : workout.commonMistakes;

  const tableHeader: TableCell[] = [
    { text: isEn ? "Description" : "Description", style: "tableHeader" },
    { text: isEn ? "Duration" : "Duree", style: "tableHeader" },
    { text: "Zone", style: "tableHeader" },
    { text: isEn ? "Reps" : "Reps", style: "tableHeader" },
    { text: isEn ? "Rest" : "Repos", style: "tableHeader" },
  ];

  const content: Content = [
    // Header
    { text: title, style: "header" },
    { text: description, style: "description", margin: [0, 0, 0, 15] },

    // Metadata
    {
      columns: [
        { text: `${isEn ? "Category" : "Categorie"}: ${category}`, style: "metadata" },
        { text: `${isEn ? "Difficulty" : "Difficulte"}: ${difficulty}`, style: "metadata" },
        { text: `${isEn ? "Duration" : "Duree"}: ${duration} min`, style: "metadata" },
      ],
      margin: [0, 0, 0, 20],
    },

    // Warmup
    { text: isEn ? "Warmup" : "Echauffement", style: "sectionHeader" },
    {
      table: {
        headerRows: 1,
        widths: ["*", 50, 40, 35, 50],
        body: [tableHeader, ...formatBlocksTable(workout.warmupTemplate, isEn)],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 15],
    },

    // Main Set
    { text: isEn ? "Main Set" : "Corps de seance", style: "sectionHeader" },
    {
      table: {
        headerRows: 1,
        widths: ["*", 50, 40, 35, 50],
        body: [tableHeader, ...formatBlocksTable(workout.mainSetTemplate, isEn)],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 15],
    },

    // Cooldown
    { text: isEn ? "Cooldown" : "Retour au calme", style: "sectionHeader" },
    {
      table: {
        headerRows: 1,
        widths: ["*", 50, 40, 35, 50],
        body: [tableHeader, ...formatBlocksTable(workout.cooldownTemplate, isEn)],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 20],
    },

    // Coaching Tips
    { text: isEn ? "Coaching Tips" : "Conseils", style: "sectionHeader" },
    {
      ul: tips.length > 0 ? tips : [isEn ? "No specific tips" : "Pas de conseils specifiques"],
      margin: [0, 0, 0, 15],
    },

    // Common Mistakes
    { text: isEn ? "Common Mistakes" : "Erreurs courantes", style: "sectionHeader" },
    {
      ul: mistakes.length > 0 ? mistakes : [isEn ? "No specific warnings" : "Pas d'erreurs specifiques"],
      margin: [0, 0, 0, 15],
    },

    // Footer
    {
      text: `${isEn ? "Generated by" : "Genere par"} Zoned - ${new Date().toLocaleDateString(isEn ? "en-US" : "fr-FR")}`,
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
}
