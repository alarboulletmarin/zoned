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
import { computePlanStats, computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { calculatePaceZones, formatPace } from "@/lib/zones";

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

const ZONE_COLORS: Record<string, string> = {
  Z1: "#22c55e",
  Z2: "#3b82f6",
  Z3: "#eab308",
  Z4: "#f97316",
  Z5: "#ef4444",
  Z6: "#a855f7",
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
 * Format workout blocks into rich Content[] with colored zone tags.
 */
function formatWorkoutBlocksRich(blocks: WorkoutBlock[], isEn: boolean): Content[] {
  return blocks.map((block) => {
    const desc = isEn ? (block.descriptionEn || block.description) : block.description;
    const duration = block.durationMin ? ` (${block.durationMin}min)` : "";
    const reps = block.repetitions && block.repetitions > 1 ? `${block.repetitions}x ` : "";
    const rest = block.rest ? ` — ${isEn ? "rest" : "récup"}: ${block.rest}` : "";

    const textParts: Array<{ text: string; color?: string; bold?: boolean }> = [
      { text: `${reps}${desc}${duration}` },
    ];
    if (block.zone) {
      textParts.push({
        text: ` [${block.zone}]`,
        color: ZONE_COLORS[block.zone] || "#555",
        bold: true,
      });
    }
    if (rest) {
      textParts.push({ text: rest });
    }

    return {
      text: textParts,
      fontSize: 8,
      color: "#555",
      margin: [8, 0, 0, 2] as [number, number, number, number],
    };
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

  const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
  const isFreePlan = plan.config.planMode === "free";
  const planName = isFreePlan
    ? (plan.config.planName || plan.name)
    : (isEn ? plan.nameEn : plan.name);
  const content: Content = [];

  // ── Title Page ──────────────────────────────────────────────────────

  const titlePageStack: Content[] = [];
  titlePageStack.push(
    { text: `${isEn ? "Start" : "D\u00e9but"}: ${formatDate(plan.config.createdAt, isEn)}`, style: "metadata" },
  );
  if (plan.config.raceDate) {
    titlePageStack.push(
      { text: `${isEn ? "Race" : "Course"}: ${formatDate(plan.config.raceDate, isEn)}`, style: "metadata" },
    );
  }
  titlePageStack.push(
    { text: `${isEn ? "Duration" : "Dur\u00e9e"}: ${plan.totalWeeks} ${isEn ? "weeks" : "semaines"}`, style: "metadata" },
  );

  content.push(
    { text: planName, style: "header", margin: [0, 60, 0, 10] },
    ...(raceMeta
      ? [{
          text: isEn ? raceMeta.labelEn : raceMeta.label,
          style: "subheader",
          margin: [0, 0, 0, 20] as [number, number, number, number],
        }]
      : [{ text: isFreePlan ? (isEn ? "Free plan" : "Plan libre") : "", style: "subheader", margin: [0, 0, 0, 20] as [number, number, number, number] }]),
    {
      columns: [
        {
          width: "*",
          stack: titlePageStack,
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
            ...(plan.peakWeeklyKm
              ? [{ text: `${isEn ? "Peak volume" : "Volume pic"}: ${plan.peakWeeklyKm} km/${isEn ? "wk" : "sem"}`, style: "metadata" as const }]
              : []),
            ...(plan.peakLongRunKm
              ? [{ text: `${isEn ? "Peak long run" : "Pic sortie longue"}: ${plan.peakLongRunKm} km`, style: "metadata" as const }]
              : []),
          ],
        },
      ],
      margin: [0, 0, 0, 30],
    },
  );

  // Stats summary
  const stats = computePlanStats(plan);
  content.push({
    columns: [
      {
        width: "*",
        stack: [
          { text: `${stats.totalSessions} ${isEn ? "sessions" : "séances"}`, style: "metadata", bold: true },
          { text: `${Math.round(stats.totalDurationMin / 60)}h ${isEn ? "total" : "au total"}`, style: "metadata" },
        ],
      },
      {
        width: "*",
        stack: [
          { text: `~${Math.round(stats.totalEstimatedKm)} km`, style: "metadata", bold: true },
          { text: `${stats.keySessionCount} ${isEn ? "key sessions" : "séances clés"}`, style: "metadata" },
        ],
      },
      {
        width: "*",
        stack: [
          { text: `${isEn ? "Peak" : "Pic"}: S${stats.peakVolumeWeek}`, style: "metadata", bold: true },
          { text: `${stats.avgDurationPerWeekMin}min/${isEn ? "week" : "sem"}`, style: "metadata" },
        ],
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // Session type pace table (if targetPaceMinKm is set)
  if (plan.config.targetPaceMinKm) {
    const pace = plan.config.targetPaceMinKm;
    const paceStr = (p: number) => {
      const m = Math.floor(p);
      const s = Math.round((p - m) * 60);
      return `${m}:${s.toString().padStart(2, "0")}/km`;
    };

    const paceRows = [
      [isEn ? "Race / Threshold" : "Course / Seuil", paceStr(pace)],
      ["Tempo", paceStr(pace + 0.25)],
      [isEn ? "Easy / Long Run" : "Endurance / SL", paceStr(pace + 1)],
      ["VO2max", paceStr(pace - 0.5)],
    ];

    content.push(
      { text: isEn ? "Target Paces" : "Allures cibles", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto"],
          body: [
            [
              { text: isEn ? "Session Type" : "Type de séance", style: "tableHeader" },
              { text: isEn ? "Pace" : "Allure", style: "tableHeader" },
            ],
            ...paceRows.map(([type, paceVal]) => [
              { text: type, margin: [4, 3, 4, 3] as [number, number, number, number] },
              { text: paceVal, alignment: "center" as const, bold: true, margin: [4, 3, 4, 3] as [number, number, number, number] },
            ] as TableCell[]),
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20],
      },
    );
  }

  // Zone pace table (if VMA is set)
  if (plan.config.vma) {
    const paceZones = calculatePaceZones(plan.config.vma);

    content.push(
      { text: isEn ? "Zone Paces (from VMA)" : "Allures par zone (VMA)", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: [40, "*", "auto"],
          body: [
            [
              { text: "Zone", style: "tableHeader" },
              { text: isEn ? "Range" : "Plage", style: "tableHeader" },
              { text: isEn ? "Pace" : "Allure", style: "tableHeader" },
            ],
            ...paceZones.map((z) => [
              {
                text: `Z${z.zone}`,
                bold: true,
                color: ZONE_COLORS[`Z${z.zone}`] || "#333",
                margin: [4, 2, 4, 2] as [number, number, number, number],
              },
              {
                text: `${z.paceMaxPerKm ? formatPace(z.paceMaxPerKm) : "?"} - ${z.paceMinPerKm ? formatPace(z.paceMinPerKm) : "?"}`,
                margin: [4, 2, 4, 2] as [number, number, number, number],
              },
              {
                text: z.paceMinPerKm && z.paceMaxPerKm
                  ? formatPace((z.paceMinPerKm + z.paceMaxPerKm) / 2)
                  : "-",
                alignment: "center" as const,
                margin: [4, 2, 4, 2] as [number, number, number, number],
              },
            ] as TableCell[]),
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20],
      },
    );
  }

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

  let currentPhase = "";

  for (const week of plan.weeks) {
    const phaseMeta = PHASE_META[week.phase];
    const phaseColors = PHASE_COLORS[week.phase] || PHASE_COLORS.recovery;
    const weekLabel = isEn
      ? (week.weekLabelEn || `Week ${week.weekNumber}`)
      : (week.weekLabel || `Semaine ${week.weekNumber}`);

    // Phase transition banner
    const isPhaseTransition = week.phase !== currentPhase;
    if (isPhaseTransition) {
      currentPhase = week.phase;
      const pMeta = PHASE_META[week.phase];
      const pColors = PHASE_COLORS[week.phase] || PHASE_COLORS.recovery;

      if (week.weekNumber > 1) {
        content.push({
          table: {
            widths: ["*"],
            body: [[{
              text: `${(isEn ? pMeta.labelEn : pMeta.label).toUpperCase()} — ${isEn ? pMeta.descriptionEn : pMeta.description}`,
              bold: true,
              fontSize: 11,
              color: pColors.text,
              fillColor: pColors.bg,
              margin: [8, 6, 8, 6],
            }]],
          },
          layout: "noBorders",
          margin: [0, 4, 0, 8],
          pageBreak: "before" as const,
        });
      }
    }

    // Weekly volume stats
    const weekDuration = computeWeekDuration(week);
    const weekKm = Math.round(computeWeekKm(week));
    const weekDurationStr = weekDuration >= 60
      ? `${Math.floor(weekDuration / 60)}h${(weekDuration % 60).toString().padStart(2, "0")}`
      : `${weekDuration}min`;

    // Week header with phase info + v2 data
    const actualKm = week.targetKm ?? weekKm;
    const longRunInfo = week.targetLongRunKm ? ` · SL ${week.targetLongRunKm}km` : "";
    const recoveryTag = week.isRecoveryWeek ? (isEn ? " [Recovery]" : " [Récup]") : "";
    content.push({
      text: `${weekLabel} — ${isEn ? phaseMeta.labelEn : phaseMeta.label} · ${weekDurationStr} · ~${actualKm}km${longRunInfo}${recoveryTag}`,
      style: "weekHeader",
      pageBreak: (week.weekNumber > 1 && !isPhaseTransition) ? "before" as const : undefined,
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
          text: session.isKeySession ? "\u2605" : "",
          alignment: "center" as const,
          bold: true,
          fontSize: session.isKeySession ? 11 : 9,
          color: session.isKeySession ? "#854d0e" : undefined,
          fillColor: session.isKeySession ? "#fef9c3" : undefined,
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
        detailStack.push(...formatWorkoutBlocksRich(template.warmupTemplate, isEn));
      }

      if (template.mainSetTemplate?.length) {
        detailStack.push({
          text: isEn ? "Main set:" : "Corps de séance :",
          bold: true,
          fontSize: 8,
          color: "#555",
          margin: [0, 2, 0, 1],
        });
        detailStack.push(...formatWorkoutBlocksRich(template.mainSetTemplate, isEn));
      }

      if (template.cooldownTemplate?.length) {
        detailStack.push({
          text: isEn ? "Cool-down:" : "Retour au calme :",
          bold: true,
          fontSize: 8,
          color: "#555",
          margin: [0, 2, 0, 1],
        });
        detailStack.push(...formatWorkoutBlocksRich(template.cooldownTemplate, isEn));
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

  // ── Document Definition ────────────────────────────────────────────

  const docDefinition: TDocumentDefinitions = {
    content,
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: planName, fontSize: 7, color: "#aaa", margin: [30, 0, 0, 0] },
        {
          text: `${isEn ? "Generated by" : "Généré par"} Zoned`,
          fontSize: 7,
          color: "#aaa",
          alignment: "center" as const,
        },
        {
          text: `${currentPage} / ${pageCount}`,
          fontSize: 7,
          color: "#aaa",
          alignment: "right" as const,
          margin: [0, 0, 30, 0],
        },
      ],
    }),
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
    pageMargins: [30, 30, 30, 45],
  };

  // pdfmake types are outdated - getBlob() returns Promise<Blob> in recent versions
  const pdf = pdfMake.createPdf(docDefinition) as unknown as { getBlob: () => Promise<Blob> };
  const blob = await pdf.getBlob();

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plan-${plan.config.raceDistance ?? "free"}-${plan.name}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
