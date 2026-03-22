/**
 * Race Simulator PDF Export - Document format
 *
 * Creates a comprehensive race plan PDF with splits table,
 * nutrition plan, mental cues, timeline, and checklists.
 */

import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";
import type { RacePlan } from "@/lib/raceSimulator";
import { getDistanceLabelEn } from "@/lib/raceSimulator";
import { formatSplitTime, formatPaceDisplay } from "@/lib/splits";

/**
 * Export a race simulation plan as a PDF document.
 *
 * @param plan - The generated race plan
 * @param isEn - Use English language
 * @returns Promise that resolves when download is triggered
 */
export async function exportRaceSimToPDF(
  plan: RacePlan,
  isEn: boolean,
): Promise<void> {
  // Dynamic import pdfmake (code-split)
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default;
  pdfMake.vfs = pdfFontsModule.default.vfs;

  const distanceLabel = isEn
    ? getDistanceLabelEn(plan.distanceKm)
    : plan.distanceLabel;

  const totalTimeFormatted = formatSplitTime(plan.targetTimeSeconds);

  const content: Content = [];

  // ── Title ───────────────────────────────────────────────────────────

  content.push(
    {
      text: isEn
        ? `Race Plan - ${distanceLabel}`
        : `Plan de course - ${distanceLabel}`,
      style: "header",
    },
    {
      text: isEn
        ? `Target pace: ${plan.paceFormatted}/km | Start: ${plan.startTime} | Estimated finish: ${plan.estimatedFinishTime} | Total: ${totalTimeFormatted}`
        : `Allure cible: ${plan.paceFormatted}/km | Depart: ${plan.startTime} | Arrivee estimee: ${plan.estimatedFinishTime} | Total: ${totalTimeFormatted}`,
      style: "subtitle",
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },
  );

  // ── Timeline ────────────────────────────────────────────────────────

  content.push(
    {
      text: isEn ? "Race Day Timeline" : "Planning de la journee",
      style: "sectionHeader",
    },
    {
      table: {
        headerRows: 1,
        widths: [45, "*"],
        body: [
          [
            { text: isEn ? "Time" : "Heure", style: "tableHeader" },
            { text: isEn ? "Event" : "Action", style: "tableHeader" },
          ],
          ...plan.timeline.map((event) => {
            const label = isEn ? event.labelEn : event.label;
            const isRace = event.type === "race";
            return [
              {
                text: event.time,
                bold: isRace,
                margin: [4, 3, 4, 3] as [number, number, number, number],
              },
              {
                text: label,
                bold: isRace,
                color: isRace ? "#dc2626" : undefined,
                margin: [4, 3, 4, 3] as [number, number, number, number],
              },
            ] as TableCell[];
          }),
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },
  );

  // ── Splits Table ────────────────────────────────────────────────────

  content.push(
    {
      text: isEn ? "Split Table" : "Tableau des splits",
      style: "sectionHeader",
    },
    {
      table: {
        headerRows: 1,
        widths: [30, 50, 55, 55, 65],
        body: [
          [
            { text: "#", style: "tableHeader" },
            { text: isEn ? "Dist" : "Dist", style: "tableHeader" },
            { text: "Split", style: "tableHeader" },
            { text: isEn ? "Pace" : "Allure", style: "tableHeader" },
            { text: isEn ? "Cumul" : "Cumul", style: "tableHeader" },
          ],
          ...plan.splits.map((split) => [
            {
              text: `${split.index}`,
              alignment: "center" as const,
              margin: [4, 2, 4, 2] as [number, number, number, number],
            },
            {
              text: split.distance < 1
                ? `${Math.round(split.distance * 1000)}m`
                : `${split.distance} km`,
              alignment: "center" as const,
              margin: [4, 2, 4, 2] as [number, number, number, number],
            },
            {
              text: formatSplitTime(split.splitTimeSeconds),
              alignment: "center" as const,
              margin: [4, 2, 4, 2] as [number, number, number, number],
            },
            {
              text: `${formatPaceDisplay(split.paceMinPerKm)}/km`,
              alignment: "center" as const,
              margin: [4, 2, 4, 2] as [number, number, number, number],
            },
            {
              text: formatSplitTime(split.cumulativeTimeSeconds),
              alignment: "center" as const,
              bold: true,
              margin: [4, 2, 4, 2] as [number, number, number, number],
            },
          ] as TableCell[]),
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },
  );

  // ── Nutrition ───────────────────────────────────────────────────────

  content.push({
    text: "Nutrition",
    style: "sectionHeader",
  });

  // Fueling summary
  const { fuelingPlan } = plan;
  const nutritionSummary = isEn
    ? [
        `Carbs: ${fuelingPlan.carbsPerHourG}g/h (${fuelingPlan.totalCarbsG}g total)`,
        `Fluids: ${fuelingPlan.fluidMlPerHour}ml/h (${fuelingPlan.totalFluidMl}ml total)`,
        `Sodium: ${fuelingPlan.sodiumMgPerHour}mg/h`,
        `Gels: ${fuelingPlan.gelCount} total, every ~${fuelingPlan.gelFrequencyMin} min`,
      ]
    : [
        `Glucides: ${fuelingPlan.carbsPerHourG}g/h (${fuelingPlan.totalCarbsG}g total)`,
        `Hydratation: ${fuelingPlan.fluidMlPerHour}ml/h (${fuelingPlan.totalFluidMl}ml total)`,
        `Sodium: ${fuelingPlan.sodiumMgPerHour}mg/h`,
        `Gels: ${fuelingPlan.gelCount} au total, tous les ~${fuelingPlan.gelFrequencyMin} min`,
      ];

  content.push({
    ul: nutritionSummary,
    margin: [0, 0, 0, 10] as [number, number, number, number],
  });

  // Gel timeline
  if (fuelingPlan.timeline.length > 0) {
    content.push(
      {
        text: isEn ? "Fueling Timeline" : "Plan de ravitaillement",
        fontSize: 11,
        bold: true,
        margin: [0, 4, 0, 6] as [number, number, number, number],
        color: "#555",
      },
      {
        table: {
          headerRows: 1,
          widths: [40, "*"],
          body: [
            [
              { text: "Min", style: "tableHeader" },
              { text: "Action", style: "tableHeader" },
            ],
            ...fuelingPlan.timeline.map((cp) => [
              {
                text: `${Math.round(cp.timeMin)}'`,
                alignment: "center" as const,
                margin: [4, 2, 4, 2] as [number, number, number, number],
              },
              {
                text: isEn ? cp.actionEn : cp.action,
                margin: [4, 2, 4, 2] as [number, number, number, number],
              },
            ] as TableCell[]),
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
    );
  }

  // Nutrition tips
  if (fuelingPlan.tips.length > 0) {
    content.push({
      ul: fuelingPlan.tips.map((tip) => (isEn ? tip.textEn : tip.text)),
      fontSize: 9,
      color: "#666",
      margin: [0, 0, 0, 20] as [number, number, number, number],
    });
  }

  // ── Breakfast ───────────────────────────────────────────────────────

  content.push(
    {
      text: isEn ? "Pre-Race Breakfast" : "Petit-dejeuner d'avant-course",
      style: "sectionHeader",
    },
    {
      text: isEn
        ? `${plan.breakfast.time} - ${plan.breakfast.descriptionEn}`
        : `${plan.breakfast.time} - ${plan.breakfast.description}`,
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },
  );

  // ── Mental Cues ─────────────────────────────────────────────────────

  content.push(
    {
      text: isEn ? "Mental Cues" : "Cues mentaux",
      style: "sectionHeader",
    },
    {
      table: {
        headerRows: 1,
        widths: [55, "*"],
        body: [
          [
            { text: isEn ? "Segment" : "Segment", style: "tableHeader" },
            { text: isEn ? "Cue" : "Cue", style: "tableHeader" },
          ],
          ...plan.mentalCues.map((cue) => [
            {
              text: `km ${cue.fromKm}-${cue.toKm}`,
              bold: true,
              margin: [4, 3, 4, 3] as [number, number, number, number],
            },
            {
              text: isEn ? cue.textEn : cue.text,
              margin: [4, 3, 4, 3] as [number, number, number, number],
            },
          ] as TableCell[]),
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },
  );

  // ── Day Before Checklist ────────────────────────────────────────────

  if (plan.dayBeforeChecklist.length > 0) {
    content.push(
      {
        text: isEn ? "Day Before Checklist" : "Checklist J-1",
        style: "sectionHeader",
      },
      {
        ul: plan.dayBeforeChecklist.map((item) =>
          isEn ? item.textEn : item.text,
        ),
        margin: [0, 0, 0, 15] as [number, number, number, number],
      },
    );
  }

  // ── Race Day Checklist ──────────────────────────────────────────────

  if (plan.raceDayChecklist.length > 0) {
    content.push(
      {
        text: isEn ? "Race Day Checklist" : "Checklist jour de course",
        style: "sectionHeader",
      },
      {
        ul: plan.raceDayChecklist.map((item) =>
          isEn ? item.textEn : item.text,
        ),
        margin: [0, 0, 0, 15] as [number, number, number, number],
      },
    );
  }

  // ── Footer ──────────────────────────────────────────────────────────

  content.push({
    text: `${isEn ? "Generated by" : "Genere par"} Zoned - zoned.run - ${new Date().toLocaleDateString(isEn ? "en-US" : "fr-FR")}`,
    style: "footer",
    margin: [0, 20, 0, 0] as [number, number, number, number],
  });

  // ── Document Definition ─────────────────────────────────────────────

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      subtitle: {
        fontSize: 11,
        color: "#666",
        italics: true,
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 8],
        color: "#333",
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: "#fff",
        fillColor: "#333",
        alignment: "center" as const,
        margin: [4, 4, 4, 4],
      },
      footer: {
        fontSize: 9,
        color: "#999",
        alignment: "center" as const,
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
    pageMargins: [30, 30, 30, 40],
  };

  // pdfmake types are outdated - getBlob() returns Promise<Blob> in recent versions
  const pdf = pdfMake.createPdf(docDefinition) as unknown as {
    getBlob: () => Promise<Blob>;
  };
  const blob = await pdf.getBlob();

  // Trigger download
  const slug = distanceLabel.toLowerCase().replace(/\s+/g, "-");
  const filename = isEn ? `race-plan-${slug}.pdf` : `plan-course-${slug}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
