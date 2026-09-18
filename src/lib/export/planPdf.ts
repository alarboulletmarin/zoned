/**
 * The training plan as a PDF, in the house style.
 *
 * Page one: the wordmark, the plan's name, its facts in mono (the race, the
 * weeks, the sessions a week, the dates), the target and zone paces where
 * the plan has them, and the phases as a ruled table. Then the weeks, each
 * a mono header line and a ruled table of its sessions (day, session, type,
 * zone, duration, structure in one line), a new page at every phase. Last,
 * the structure of every session the plan uses, once each, in order of first
 * appearance. The parts come from pdfHouse.ts, like every PDF here.
 *
 * It was a slate banner, blue stat tiles, coloured phase rows, black table
 * heads and superscripts to a lexicon: the other design, and not the app's.
 */

import type { Content, TableCell } from "pdfmake/interfaces";
import type { TrainingPlan } from "@/types/plan";
import type { AnyWorkoutTemplate, WorkoutTemplate, WorkoutBlock, Zone } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import { getDominantZone } from "@/types";
import { WORKOUT_PHASES, getWorkoutPhaseBlocks, isRunningWorkout, isStrengthWorkout } from "@/lib/workoutTemplate";
import { computePlanStats, computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { calculatePaceZones, formatPace } from "@/lib/zones";
import { getExerciseById } from "@/data/strength";
import i18n from "@/i18n";
import { formatDateMedium, pickLang } from "@/lib/i18n-utils";
import { triggerDownload } from "./download";
import { planFilename } from "./planFilename";
import { INK, INK_2, INK_PALE, createHouse, preparePdfMake, type House } from "./pdfHouse";

// ── Constants ──────────────────────────────────────────────────────

/** Shortened labels for compact PDF tables. */
const SESSION_TYPE_LABELS_SHORT: Record<string, { fr: string; en: string }> = {
  recovery: { fr: "Récup", en: "Recovery" },
  endurance: { fr: "Endurance", en: "Endurance" },
  tempo: { fr: "Tempo", en: "Tempo" },
  threshold: { fr: "Seuil", en: "Threshold" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  long_run: { fr: "SL", en: "Long Run" },
  hills: { fr: "Côtes", en: "Hills" },
  fartlek: { fr: "Fartlek", en: "Fartlek" },
  race_specific: { fr: "All. course", en: "Race Pace" },
  strength: { fr: "Renfo", en: "Strength" },
  cycling: { fr: "Vélo", en: "Cycling" },
  swimming: { fr: "Natation", en: "Swimming" },
  yoga: { fr: "Yoga", en: "Yoga" },
  rest: { fr: "Repos", en: "Rest" },
  rest_day: { fr: "Repos", en: "Rest" },
  cross_training: { fr: "Cross", en: "Cross" },
};

const STRENGTH_CAT_LABELS: Record<string, { fr: string; en: string }> = {
  runner_full_body: { fr: "Renfo", en: "Strength" },
  runner_lower: { fr: "Renfo", en: "Strength" },
  runner_core: { fr: "Core", en: "Core" },
  runner_upper: { fr: "Haut", en: "Upper" },
  plyometrics: { fr: "Plio", en: "Plyo" },
  mobility: { fr: "Mobilité", en: "Mobility" },
  prehab: { fr: "Préhab", en: "Prehab" },
};

const DAY_SHORT = {
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

// ── Helpers ────────────────────────────────────────────────────────

function isEn(): boolean {
  return i18n.language?.startsWith("en") ?? false;
}

function t(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`common:export.planPdf.${key}`, opts);
}


function formatDuration(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${m.toString().padStart(2, "0")}`;
  }
  return `${Math.round(min)}min`;
}

function paceStr(p: number): string {
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}

/** Day abbreviation from dayOfWeek (0=Mon...6=Sun) */
function dayLabel(dayOfWeek: number): string {
  const days = isEn() ? DAY_SHORT.en : DAY_SHORT.fr;
  return days[dayOfWeek] ?? "?";
}

/** Get session type label (short) */
export function typeLabel(sessionType: string, template: AnyWorkoutTemplate | undefined): string {
  if (template && isStrengthWorkout(template)) {
    const label = STRENGTH_CAT_LABELS[template.category];
    return label ? (isEn() ? label.en : label.fr) : (isEn() ? "Strength" : "Renfo");
  }
  const label = SESSION_TYPE_LABELS_SHORT[sessionType];
  return label ? (isEn() ? label.en : label.fr) : sessionType;
}

// ── Compact summary builders ───────────────────────────────────────

/** Format zone string for display (e.g., "Z2" or "Z1-Z2") */
function fmtZone(zone?: Zone | string): string {
  if (!zone) return "";
  return zone;
}

/** Compute total duration of template blocks (in minutes) */
function templateTotalMin(template: WorkoutTemplate): number {
  const sumBlocks = (blocks?: WorkoutBlock[]) =>
    (blocks || []).reduce((acc, b) => acc + (b.durationMin || 0), 0);
  return sumBlocks(template.warmupTemplate) + sumBlocks(template.mainSetTemplate) + sumBlocks(template.cooldownTemplate);
}

/** Format a duration value for compact display: "10'" or "30s" */
function fmtDur(min: number): string {
  if (min < 1) return `${Math.round(min * 60)}s`;
  return `${Math.round(min)}'`;
}

/** Build compact block summary string: "10' Z1-Z2" or "2x(12x30s Z5 / 30s Z1)" */
function buildBlockSummary(block: WorkoutBlock, scale: number): string {
  const parts: string[] = [];

  // Detect interval patterns with sets and repetitions
  // Intervals: don't scale individual rep durations (they're fixed efforts)
  if (block.sets && block.sets > 1 && block.repetitions && block.repetitions > 1) {
    const dur = block.durationMin ? fmtDur(block.durationMin) : "";
    const zone = fmtZone(block.zone);
    const rec = block.recovery || block.rest || "";
    let inner = `${block.repetitions}x${dur}`;
    if (zone) inner += ` ${zone}`;
    if (rec) inner += ` / ${rec}`;
    parts.push(`${block.sets}x(${inner})`);
  } else if (block.repetitions && block.repetitions > 1) {
    const dur = block.durationMin ? fmtDur(block.durationMin) : "";
    const zone = fmtZone(block.zone);
    const rec = block.recovery || block.rest || "";
    let seg = `${block.repetitions}x${dur}`;
    if (zone) seg += ` ${zone}`;
    if (rec) seg += ` / ${rec}`;
    parts.push(seg);
  } else {
    // Continuous blocks: apply scale factor
    const scaledMin = block.durationMin ? block.durationMin * scale : 0;
    const dur = scaledMin ? fmtDur(scaledMin) : "";
    const zone = fmtZone(block.zone);
    if (dur && zone) parts.push(`${dur} ${zone}`);
    else if (dur) parts.push(dur);
    else if (zone) parts.push(zone);
  }

  return parts.join(" ");
}

/** Build compact one-line summary from running template blocks, scaled to actual session duration */
export function buildCompactSummary(template: WorkoutTemplate, actualDurationMin?: number): string {
  const baseDuration = templateTotalMin(template);
  const scale = (actualDurationMin && baseDuration > 0) ? actualDurationMin / baseDuration : 1;

  const segments: string[] = [];

  if (template.warmupTemplate?.length) {
    const warmupParts = template.warmupTemplate
      .map((b) => buildBlockSummary(b, scale))
      .filter(Boolean);
    if (warmupParts.length > 0) segments.push(warmupParts.join(" + "));
  }

  if (template.mainSetTemplate?.length) {
    const mainParts = template.mainSetTemplate
      .map((b) => buildBlockSummary(b, scale))
      .filter(Boolean);
    if (mainParts.length > 0) segments.push(mainParts.join(" + "));
  }

  if (template.cooldownTemplate?.length) {
    const cdParts = template.cooldownTemplate
      .map((b) => buildBlockSummary(b, scale))
      .filter(Boolean);
    if (cdParts.length > 0) segments.push(cdParts.join(" + "));
  }

  return segments.join(" \u203a ");
}

/** Build compact summary for strength workout */
export function buildStrengthSummary(
  template: StrengthWorkoutTemplate,
  exerciseNames: Record<string, string>,
): string {
  const allBlocks = WORKOUT_PHASES.flatMap((phase) => getWorkoutPhaseBlocks(template, phase));
  const count = allBlocks.length;
  const names = allBlocks
    .slice(0, 3)
    .map((b) => exerciseNames[b.exerciseId] || b.exerciseId)
    .join(", ");
  const suffix = count > 3 ? "..." : "";
  return `${count} ${t("exercises")} \u00b7 ${names}${suffix}`;
}

// ── Workout index for appendix ──────────────────────────────────────

/** Build ordered map: workoutId -> reference number (order of first appearance) */
function buildWorkoutIndex(plan: TrainingPlan): Map<string, number> {
  const index = new Map<string, number>();
  let counter = 1;
  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      if (session.workoutId === "__race_day__" || session.workoutId === "__intermediate_race__") continue;
      if (!index.has(session.workoutId)) {
        index.set(session.workoutId, counter++);
      }
    }
  }
  return index;
}

// ── Exercise name resolution ────────────────────────────────────────

export async function resolveExerciseNames(
  templates: Record<string, AnyWorkoutTemplate>,
): Promise<Record<string, string>> {
  const names: Record<string, string> = {};
  const exerciseIds = new Set<string>();

  for (const template of Object.values(templates)) {
    if (!isStrengthWorkout(template)) continue;
    for (const phase of WORKOUT_PHASES) {
      for (const block of getWorkoutPhaseBlocks(template, phase)) {
        exerciseIds.add(block.exerciseId);
      }
    }
  }

  await Promise.all(
    Array.from(exerciseIds).map(async (id) => {
      const ex = await getExerciseById(id);
      if (ex) {
        names[id] = ex.name;
        // also store english name with suffix
        names[`${id}__en`] = ex.nameEn;
      }
    }),
  );

  return names;
}

// ── The document ─────────────────────────────────────────────────────

const SESSION_COLUMNS = 6;

/** The zone cell of a session row: the dominant zone, or a dash for work without one. */
function zoneCell(h: House, template: AnyWorkoutTemplate | undefined, isStr: boolean): TableCell {
  if (!isStr && template && isRunningWorkout(template)) {
    return h.mono(`Z${getDominantZone(template)}`, { bold: true, alignment: "center", color: INK }) as TableCell;
  }
  return h.mono("-", { alignment: "center", color: INK_PALE }) as TableCell;
}

export async function exportPlanToPDF(
  plan: TrainingPlan,
  workoutNames: Record<string, string>,
  workoutTemplates: Record<string, AnyWorkoutTemplate>,
): Promise<void> {
  try {
    const { pdfMake, fonts } = await preparePdfMake();
    const h = createHouse(fonts);

    const exerciseNames = await resolveExerciseNames(workoutTemplates);
    const workoutIndex = buildWorkoutIndex(plan);

    const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
    const isFreePlan = plan.config.planMode === "free";
    const planName = isFreePlan ? plan.config.planName || plan.name : isEn() ? plan.nameEn : plan.name;
    const kicker = raceMeta ? (isEn() ? raceMeta.labelEn : raceMeta.label) : t("freePlan");
    const content: Content[] = [];

    // ── Page one: the plan ─────────────────────────────────────────
    const stats = computePlanStats(plan);
    const totalHours = Math.round(stats.totalDurationMin / 60);

    const factsA = [
      raceMeta ? (isEn() ? raceMeta.labelEn : raceMeta.label) : null,
      `${plan.totalWeeks} ${t("weeks")}`,
      `${plan.config.daysPerWeek} ${t("sessionsPerWeek").toLowerCase()}`,
      `${t("start")} ${formatDateMedium(plan.config.createdAt)}`,
    ].filter(Boolean);
    const factsB = [
      plan.config.raceName ? plan.config.raceName : null,
      plan.config.raceDate ? `${t("race")} ${formatDateMedium(plan.config.raceDate)}` : null,
      plan.raceTimePrediction ? `${t("target")} ${plan.raceTimePrediction}` : null,
      plan.peakWeeklyKm ? `${t("peakVolume")} ${plan.peakWeeklyKm} km/${t("wk")}` : null,
      plan.peakLongRunKm ? `${t("peakLongRun")} ${plan.peakLongRunKm} km` : null,
    ].filter(Boolean);
    const factsC = [
      `${stats.totalSessions} ${t("sessions")}`,
      `~${Math.round(stats.totalEstimatedKm)} km`,
      `${totalHours} h`,
      `${stats.keySessionCount} ${t("key")}`,
      `${t("peakWeek")} S${stats.peakVolumeWeek}`,
    ];

    content.push(
      { text: planName, bold: true, fontSize: 26, color: INK, lineHeight: 1, margin: [0, 16, 0, 8] },
      h.mono(factsA.join("  ·  "), { fontSize: 8.5 }) as unknown as Content,
      ...(factsB.length
        ? [h.mono(factsB.join("  ·  "), { fontSize: 8.5, margin: [0, 4, 0, 0] }) as unknown as Content]
        : []),
      h.rule(0.75, INK, [0, 16, 0, 12]),
      h.mono(factsC.join("  ·  "), { fontSize: 8.5, color: INK, margin: [0, 0, 0, 22] }) as unknown as Content,
    );

    const ruledTable = (widths: (number | string)[], headRow: TableCell[], rows: TableCell[][]): Content =>
      ({
        table: { headerRows: 1, widths, body: [headRow, ...rows] },
        layout: h.ruledLayout(rows.length, widths.length - 1),
        margin: [0, 0, 0, 22],
      }) as unknown as Content;

    if (plan.config.targetPaceMinKm) {
      const pace = plan.config.targetPaceMinKm;
      const paceRows: [string, string][] = [
        [t("raceThreshold"), paceStr(pace)],
        ["Tempo", paceStr(pace + 0.25)],
        [t("easyLongRun"), paceStr(pace + 1)],
        ["VO2max", paceStr(pace - 0.5)],
      ];
      content.push(
        h.kicker(t("targetPaces"), { margin: [0, 0, 0, 6] }) as unknown as Content,
        ruledTable(
          ["*", 90],
          [h.headCell(t("sessionType")), h.headCell(t("paceCol"), "right")],
          paceRows.map(([type, paceVal]) => [
            { text: type, fontSize: 9, color: INK },
            h.mono(paceVal, { bold: true, alignment: "right", color: INK }) as TableCell,
          ]),
        ),
      );
    }

    if (plan.config.vma) {
      const paceZones = calculatePaceZones(plan.config.vma);
      content.push(
        h.kicker(t("zonePaces"), { margin: [0, 0, 0, 6] }) as unknown as Content,
        ruledTable(
          [40, "*", 90],
          [h.headCell("Zone"), h.headCell(t("range")), h.headCell(t("paceCol"), "right")],
          paceZones.map((z) => [
            h.mono(`Z${z.zone}`, { bold: true, color: INK }) as TableCell,
            h.mono(
              `${z.paceMaxPerKm ? formatPace(z.paceMaxPerKm) : "?"} - ${z.paceMinPerKm ? formatPace(z.paceMinPerKm) : "?"}`,
              { color: INK },
            ) as TableCell,
            h.mono(
              z.paceMinPerKm && z.paceMaxPerKm ? formatPace((z.paceMinPerKm + z.paceMaxPerKm) / 2) : "-",
              { alignment: "right", color: INK },
            ) as TableCell,
          ]),
        ),
      );
    }

    content.push(
      h.kicker(t("trainingPhases"), { margin: [0, 0, 0, 6] }) as unknown as Content,
      ruledTable(
        [110, 60, "*"],
        [h.headCell("Phase"), h.headCell(t("phasesWeeks")), h.headCell("Description")],
        plan.phases.map((phaseRange) => {
          const meta = PHASE_META[phaseRange.phase];
          return [
            { text: isEn() ? meta.labelEn : meta.label, bold: true, fontSize: 9, color: INK },
            h.mono(`S${phaseRange.startWeek}-S${phaseRange.endWeek}`, { color: INK }) as TableCell,
            { text: isEn() ? meta.descriptionEn : meta.description, fontSize: 9, color: INK_2 },
          ];
        }),
      ),
    );

    // ── The weeks ──────────────────────────────────────────────────
    let currentPhase = "";
    // A4 usable height ~750pt. Each row ~16pt, header ~20pt, week header ~24pt,
    // notes ~14pt: about 40 rows of content before a break.
    let accumulatedRows = 0;
    const PAGE_ROW_LIMIT = 40;

    for (const week of plan.weeks) {
      const phaseMeta = PHASE_META[week.phase];

      const isPhaseTransition = week.phase !== currentPhase;
      if (isPhaseTransition) {
        currentPhase = week.phase;
        if (week.weekNumber > 1) {
          content.push(
            {
              ...h.kicker(isEn() ? phaseMeta.labelEn : phaseMeta.label),
              pageBreak: "before",
            } as unknown as Content,
            { text: isEn() ? phaseMeta.descriptionEn : phaseMeta.description, fontSize: 9, color: INK_2, margin: [0, 3, 0, 0] },
            h.rule(0.75, INK, [0, 8, 0, 14]),
          );
          accumulatedRows = 0;
        }
      }

      const weekDuration = computeWeekDuration(week);
      const weekKm = Math.round(computeWeekKm(week));
      const weekLabel = isEn()
        ? week.weekLabelEn || `Week ${week.weekNumber}`
        : week.weekLabel || `Semaine ${week.weekNumber}`;
      const actualKm = week.targetKm ?? weekKm;
      const longRunInfo = week.targetLongRunKm ? ` · SL ${week.targetLongRunKm} km` : "";

      const weekSessionCount = week.sessions.length;
      const estimatedNoteRows = week.sessions.filter(
        (s) => s.isKeySession && (s.notes || s.notesEn || s.paceNotes?.length),
      ).length;
      const weekRows = weekSessionCount + estimatedNoteRows + 2;
      const needsBreak = !isPhaseTransition && accumulatedRows > 0 && accumulatedRows + weekRows > PAGE_ROW_LIMIT;

      content.push({
        columns: [
          h.kicker(
            `${weekLabel} · ${isEn() ? phaseMeta.labelEn : phaseMeta.label} · ${formatDuration(weekDuration)} · ~${actualKm} km${longRunInfo}`,
          ) as unknown as Content,
          h.mono(week.isRecoveryWeek ? t("recovery").toUpperCase() : "", { alignment: "right" }) as unknown as Content,
        ],
        margin: [0, 6, 0, 6],
        ...(needsBreak ? { pageBreak: "before" } : {}),
      } as unknown as Content);

      if (needsBreak) accumulatedRows = 0;
      accumulatedRows += weekRows;

      if (week.sessions.length === 0) {
        content.push(h.mono(t("noSessions"), { margin: [0, 2, 0, 14] }) as unknown as Content);
        continue;
      }

      const headRow: TableCell[] = [
        h.headCell(t("day")),
        h.headCell(t("workout")),
        h.headCell("Type"),
        h.headCell("Zone", "center"),
        h.headCell(t("dur"), "right"),
        h.headCell(t("summary")),
      ];

      const rows: TableCell[][] = [];
      const paceNoteRows: { afterIndex: number; text: string }[] = [];

      for (const session of week.sessions) {
        const isRaceDay = session.workoutId === "__race_day__";
        const isIntermediateRace = session.workoutId === "__intermediate_race__";
        const dayCell = h.mono(dayLabel(session.dayOfWeek).toUpperCase(), { bold: true, color: INK }) as TableCell;

        if (isRaceDay || isIntermediateRace) {
          let label = t("raceDay");
          if (isIntermediateRace) {
            const ir = week.intermediateRace;
            const distMeta = ir?.raceDistance ? RACE_DISTANCE_META[ir.raceDistance] : null;
            const distLabel = distMeta ? pickLang(distMeta, "label") : (ir?.raceDistance ?? "");
            const raceName = ir?.raceName ? `${ir.raceName} (${distLabel})` : distLabel;
            const priorityLabel = ir?.priority ? ` [${ir.priority}]` : "";
            label = `${i18n.t("plan:intermediateGoals.raceDayLabel")} · ${raceName}${priorityLabel}`;
          }
          rows.push([
            dayCell,
            { text: label, bold: true, fontSize: 9, color: INK, colSpan: SESSION_COLUMNS - 1 },
            ...Array.from({ length: SESSION_COLUMNS - 2 }, () => ({}) as TableCell),
          ]);
          continue;
        }

        const template = workoutTemplates[session.workoutId];
        const wName = workoutNames[session.workoutId] || session.workoutId;
        const isStr = template ? isStrengthWorkout(template) : session.workoutId.startsWith("STR-");

        let summary = "";
        if (template && isStrengthWorkout(template)) summary = buildStrengthSummary(template, exerciseNames);
        else if (template && isRunningWorkout(template)) summary = buildCompactSummary(template, session.estimatedDurationMin);

        rows.push([
          dayCell,
          {
            text: [
              { text: wName, bold: true, fontSize: 9, color: INK },
              ...(session.isKeySession
                ? [{ text: `  ${i18n.t("common:export.weekPdf.key")}`, font: fonts.mono, fontSize: 6.5, characterSpacing: 0.6, color: INK_2 }]
                : []),
            ],
          },
          h.mono(typeLabel(session.sessionType, template), { color: INK_2 }) as TableCell,
          zoneCell(h, template, isStr),
          h.mono(formatDuration(session.estimatedDurationMin), { alignment: "right", color: INK }) as TableCell,
          { text: summary, fontSize: 7.5, color: INK_2 },
        ]);

        if (session.isKeySession) {
          const notes = isEn() ? session.notesEn : session.notes;
          if (notes) {
            paceNoteRows.push({ afterIndex: rows.length - 1, text: notes });
          } else if (session.paceNotes?.length) {
            const paceText = session.paceNotes
              .map((pn) => `${isEn() ? pn.descriptionEn : pn.description}: ${formatPace(pn.paceMinKm)} - ${formatPace(pn.paceMaxKm)}`)
              .join(" | ");
            paceNoteRows.push({ afterIndex: rows.length - 1, text: paceText });
          }
        }
      }

      for (let j = paceNoteRows.length - 1; j >= 0; j--) {
        const { afterIndex, text } = paceNoteRows[j];
        rows.splice(afterIndex + 1, 0, [
          { text, colSpan: SESSION_COLUMNS, fontSize: 7.5, color: INK_2, margin: [34, 0, 0, 2] },
          ...Array.from({ length: SESSION_COLUMNS - 1 }, () => ({}) as TableCell),
        ]);
      }

      content.push({
        table: { headerRows: 1, widths: [30, "*", 52, 28, 36, "*"], body: [headRow, ...rows] },
        layout: h.ruledLayout(rows.length, SESSION_COLUMNS - 1),
        margin: [0, 0, 0, 14],
      } as unknown as Content);
    }

    // ── The sessions, once each ────────────────────────────────────
    const sortedEntries = Array.from(workoutIndex.entries()).sort((a, b) => a[1] - b[1]);
    const entries: Content[] = [];
    for (const [workoutId] of sortedEntries) {
      const template = workoutTemplates[workoutId];
      if (!template) continue;
      const dur = template.typicalDuration ? `${template.typicalDuration.min}-${template.typicalDuration.max} min` : "";
      if (isStrengthWorkout(template)) {
        const facts = [typeLabel("strength", template), template.intensity, dur].filter(Boolean).join(" · ");
        entries.push(h.strengthStructure(template, exerciseNames, { facts }));
      } else {
        const facts = [typeLabel(template.sessionType, template), `Z${getDominantZone(template)}`, dur]
          .filter(Boolean)
          .join(" · ");
        entries.push(h.runningStructure(template, { facts }));
      }
    }
    if (entries.length) {
      content.push(
        { ...h.kicker(t("workoutReference")), pageBreak: "before" } as unknown as Content,
        h.rule(0.75, INK, [0, 6, 0, 16]),
        ...entries,
      );
    }

    const doc = h.doc(content, { title: planName, kicker, footerLeft: `zoned.run · ${planName}` });
    const blob = await pdfMake.createPdf(doc).getBlob();
    triggerDownload(blob, planFilename(plan, "pdf"));
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
