/**
 * Plan PDF Export - Document format
 *
 * Creates a multi-page PDF document from a training plan with
 * title page, weekly session tables, and phase summary.
 */

import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";
import type { TrainingPlan } from "@/types/plan";
import type { WorkoutTemplate, WorkoutBlock } from "@/types";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";

/**
 * Format workout blocks into a readable text string for PDF.
 */
function formatWorkoutBlocks(blocks: WorkoutBlock[], isEn: boolean): string {
  return blocks
    .map((block) => {
      const desc = isEn ? (block.descriptionEn || block.description) : block.description;
      const duration = block.durationMin ? ` (${block.durationMin}min)` : "";
      const zone = block.zone ? ` [${block.zone}]` : "";
      const reps = block.repetitions && block.repetitions > 1 ? `${block.repetitions}x ` : "";
      const rest = block.rest ? ` — ${isEn ? "rest" : "recup"}: ${block.rest}` : "";
      return `${reps}${desc}${duration}${zone}${rest}`;
    })
    .join("\n");
}

/**
 * Phase colors for PDF backgrounds (light versions for row fills)
 */
const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  base: { bg: "#dbeafe", text: "#1e40af" },       // blue-100 / blue-800
  build: { bg: "#fef9c3", text: "#854d0e" },       // yellow-100 / yellow-800
  peak: { bg: "#ffedd5", text: "#9a3412" },        // orange-100 / orange-800
  taper: { bg: "#dcfce7", text: "#166534" },       // green-100 / green-800
  recovery: { bg: "#f1f5f9", text: "#475569" },    // slate-100 / slate-600
};

/**
 * Session type labels for the PDF
 */
const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  recovery: { fr: "Récup", en: "Recovery" },
  endurance: { fr: "Endurance", en: "Endurance" },
  tempo: { fr: "Tempo", en: "Tempo" },
  threshold: { fr: "Seuil", en: "Threshold" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  long_run: { fr: "Sortie longue", en: "Long Run" },
  hills: { fr: "Côtes", en: "Hills" },
  fartlek: { fr: "Fartlek", en: "Fartlek" },
  race_specific: { fr: "Allure course", en: "Race Pace" },
};

function formatDate(isoDate: string, isEn: boolean): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Export a training plan as a PDF document.
 */
export async function exportPlanToPDF(
  plan: TrainingPlan,
  workoutNames: Record<string, string>,
  workoutTemplates: Record<string, WorkoutTemplate>,
  isEn: boolean,
): Promise<void> {
  // Dynamic import pdfmake (code-split)
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default;
  pdfMake.vfs = pdfFontsModule.default.vfs;

  const raceMeta = RACE_DISTANCE_META[plan.config.raceDistance];
  const planName = isEn ? plan.nameEn : plan.name;
  const content: Content = [];

  // ── Title Page ──────────────────────────────────────────────────────

  content.push(
    { text: planName, style: "header", margin: [0, 60, 0, 10] },
    {
      text: isEn ? raceMeta.labelEn : raceMeta.label,
      style: "subheader",
      margin: [0, 0, 0, 20],
    },
    {
      columns: [
        {
          width: "*",
          stack: [
            {
              text: `${isEn ? "Start" : "Début"}: ${formatDate(plan.config.createdAt, isEn)}`,
              style: "metadata",
            },
            {
              text: `${isEn ? "Race" : "Course"}: ${formatDate(plan.config.raceDate, isEn)}`,
              style: "metadata",
            },
            {
              text: `${isEn ? "Duration" : "Durée"}: ${plan.totalWeeks} ${isEn ? "weeks" : "semaines"}`,
              style: "metadata",
            },
          ],
        },
        {
          width: "*",
          stack: [
            ...(plan.config.raceName
              ? [{ text: `${isEn ? "Race name" : "Nom"}: ${plan.config.raceName}`, style: "metadata" as const }]
              : []),
            ...(plan.raceTimePrediction
              ? [{ text: `${isEn ? "Target" : "Objectif"}: ${plan.raceTimePrediction}`, style: "metadata" as const }]
              : []),
            {
              text: `${isEn ? "Sessions/week" : "Séances/sem"}: ${plan.config.daysPerWeek}`,
              style: "metadata",
            },
          ],
        },
      ],
      margin: [0, 0, 0, 30],
    },
  );

  // Phase overview
  content.push(
    { text: isEn ? "Training Phases" : "Phases d'entraînement", style: "sectionHeader" },
    {
      table: {
        headerRows: 1,
        widths: ["*", "auto", "auto"],
        body: [
          [
            { text: "Phase", style: "tableHeader" },
            { text: isEn ? "Weeks" : "Semaines", style: "tableHeader" },
            { text: "Description", style: "tableHeader" },
          ],
          ...plan.phases.map((phaseRange) => {
            const meta = PHASE_META[phaseRange.phase];
            const colors = PHASE_COLORS[phaseRange.phase] || PHASE_COLORS.recovery;
            return [
              {
                text: isEn ? meta.labelEn : meta.label,
                bold: true,
                color: colors.text,
                fillColor: colors.bg,
                margin: [4, 4, 4, 4],
              },
              {
                text: `S${phaseRange.startWeek} - S${phaseRange.endWeek}`,
                alignment: "center" as const,
                fillColor: colors.bg,
                margin: [4, 4, 4, 4],
              },
              {
                text: isEn ? meta.descriptionEn : meta.description,
                fillColor: colors.bg,
                margin: [4, 4, 4, 4],
              },
            ] as TableCell[];
          }),
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 20],
    },
  );

  // ── Weekly Session Tables ──────────────────────────────────────────

  for (const week of plan.weeks) {
    const phaseMeta = PHASE_META[week.phase];
    const phaseColors = PHASE_COLORS[week.phase] || PHASE_COLORS.recovery;
    const weekLabel = isEn
      ? (week.weekLabelEn || `Week ${week.weekNumber}`)
      : (week.weekLabel || `Semaine ${week.weekNumber}`);

    // Week header with phase info
    content.push({
      text: `${weekLabel} — ${isEn ? phaseMeta.labelEn : phaseMeta.label} (${week.volumePercent}%)${week.isRecoveryWeek ? (isEn ? " [Recovery]" : " [Recup]") : ""}`,
      style: "weekHeader",
      pageBreak: week.weekNumber > 1 ? "before" as const : undefined,
    });

    if (week.sessions.length === 0) {
      content.push({
        text: isEn ? "No sessions this week" : "Aucune séance cette semaine",
        italics: true,
        color: "#888",
        margin: [0, 4, 0, 12],
      });
      continue;
    }

    // Session table: Seance | Type | Duree | Cle
    const tableHeader: TableCell[] = [
      { text: isEn ? "Workout" : "Séance", style: "tableHeader" },
      { text: "Type", style: "tableHeader" },
      { text: isEn ? "Duration" : "Durée", style: "tableHeader" },
      { text: isEn ? "Key" : "Clé", style: "tableHeader" },
    ];

    const rows: TableCell[][] = week.sessions.map((session) => {
      const isRaceDay = session.workoutId === "__race_day__";
      const sessionLabel = SESSION_TYPE_LABELS[session.sessionType];
      const typeName = sessionLabel
        ? (isEn ? sessionLabel.en : sessionLabel.fr)
        : session.sessionType;

      if (isRaceDay) {
        return [
          {
            text: isEn ? "RACE DAY" : "JOUR DE COURSE",
            bold: true,
            color: phaseColors.text,
            margin: [4, 3, 4, 3],
          },
          { text: "-", alignment: "center" as const, margin: [4, 3, 4, 3] },
          { text: "-", alignment: "center" as const, margin: [4, 3, 4, 3] },
          { text: "", margin: [4, 3, 4, 3] },
        ] as TableCell[];
      }

      return [
        {
          text: workoutNames[session.workoutId] || session.workoutId,
          margin: [4, 3, 4, 3],
        },
        { text: typeName, alignment: "center" as const, margin: [4, 3, 4, 3] },
        {
          text: `${session.estimatedDurationMin} min`,
          alignment: "center" as const,
          margin: [4, 3, 4, 3],
        },
        {
          text: session.isKeySession ? "*" : "",
          alignment: "center" as const,
          bold: true,
          color: session.isKeySession ? "#eab308" : undefined,
          margin: [4, 3, 4, 3],
        },
      ] as TableCell[];
    });

    content.push({
      table: {
        headerRows: 1,
        widths: ["*", 80, 55, 30],
        body: [tableHeader, ...rows],
      },
      layout: {
        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) return "#333";
          return rowIndex % 2 === 0 ? phaseColors.bg : null;
        },
      },
      margin: [0, 0, 0, 12],
    });

    // Workout detail blocks for each session
    for (const session of week.sessions) {
      if (session.workoutId === "__race_day__") continue;
      const template = workoutTemplates[session.workoutId];
      if (!template) continue;

      const workoutName = workoutNames[session.workoutId] || session.workoutId;
      const detailStack: Content[] = [];

      detailStack.push({
        text: workoutName,
        bold: true,
        fontSize: 9,
        margin: [0, 6, 0, 2],
      });

      // Notes (pace targets)
      const notes = isEn ? session.notesEn : session.notes;
      if (notes) {
        detailStack.push({
          text: notes,
          italics: true,
          fontSize: 8,
          color: "#666",
          margin: [0, 0, 0, 2],
        });
      }

      if (template.warmupTemplate?.length) {
        detailStack.push({
          text: isEn ? "Warm-up:" : "Échauffement :",
          bold: true,
          fontSize: 8,
          color: "#555",
          margin: [0, 2, 0, 1],
        });
        detailStack.push({
          text: formatWorkoutBlocks(template.warmupTemplate, isEn),
          fontSize: 8,
          color: "#555",
          margin: [8, 0, 0, 2],
        });
      }

      if (template.mainSetTemplate?.length) {
        detailStack.push({
          text: isEn ? "Main set:" : "Corps de séance :",
          bold: true,
          fontSize: 8,
          color: "#555",
          margin: [0, 2, 0, 1],
        });
        detailStack.push({
          text: formatWorkoutBlocks(template.mainSetTemplate, isEn),
          fontSize: 8,
          color: "#555",
          margin: [8, 0, 0, 2],
        });
      }

      if (template.cooldownTemplate?.length) {
        detailStack.push({
          text: isEn ? "Cool-down:" : "Retour au calme :",
          bold: true,
          fontSize: 8,
          color: "#555",
          margin: [0, 2, 0, 1],
        });
        detailStack.push({
          text: formatWorkoutBlocks(template.cooldownTemplate, isEn),
          fontSize: 8,
          color: "#555",
          margin: [8, 0, 0, 2],
        });
      }

      // Add pace note from config
      if (plan.config.targetPaceMinKm) {
        const sessionType = session.sessionType;
        if (sessionType === "tempo" || sessionType === "threshold" || sessionType === "race_specific") {
          const paceMin = Math.floor(plan.config.targetPaceMinKm);
          const paceSec = Math.round((plan.config.targetPaceMinKm - paceMin) * 60);
          detailStack.push({
            text: `${isEn ? "Target pace" : "Allure cible"}: ${paceMin}:${paceSec.toString().padStart(2, "0")}/km`,
            italics: true,
            fontSize: 8,
            color: "#666",
            margin: [0, 2, 0, 0],
          });
        }
      }

      if (detailStack.length > 1) {
        content.push({ stack: detailStack, margin: [0, 0, 0, 4] });
      }
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────

  content.push({
    text: `${isEn ? "Generated by" : "Généré par"} Zoned - ${new Date().toLocaleDateString(isEn ? "en-US" : "fr-FR")}`,
    style: "footer",
    margin: [0, 20, 0, 0],
  });

  // ── Document Definition ────────────────────────────────────────────

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      subheader: {
        fontSize: 16,
        color: "#666",
      },
      metadata: {
        fontSize: 10,
        color: "#888",
        margin: [0, 2, 0, 2],
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 8],
        color: "#333",
      },
      weekHeader: {
        fontSize: 13,
        bold: true,
        margin: [0, 8, 0, 6],
        color: "#222",
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
      fontSize: 9,
    },
    pageMargins: [30, 30, 30, 30],
  };

  // pdfmake types are outdated - getBlob() returns Promise<Blob> in recent versions
  const pdf = pdfMake.createPdf(docDefinition) as unknown as { getBlob: () => Promise<Blob> };
  const blob = await pdf.getBlob();

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plan-${plan.config.raceDistance}-${plan.name}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
