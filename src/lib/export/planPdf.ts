/**
 * Plan PDF Export - Professional table-based document
 *
 * Creates a compact, multi-page PDF with:
 * - Page 1: Title banner + metadata + stats + paces + phases
 * - Pages 2-N: Compact weekly session tables (aim 2 weeks/page)
 * - Last pages: Appendix with deduplicated workout reference
 */

import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";
import type { TrainingPlan } from "@/types/plan";
import type { WorkoutTemplate, WorkoutBlock, Zone } from "@/types";
import type { StrengthWorkoutTemplate, StrengthBlock } from "@/types/strength";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import { getDominantZone } from "@/types";
import { computePlanStats, computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { calculatePaceZones, formatPace } from "@/lib/zones";
import { getExerciseById } from "@/data/strength";
import i18n from "@/i18n";
import { formatDateMedium } from "@/lib/i18n-utils";

// ── Constants ──────────────────────────────────────────────────────

const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  base: { bg: "#dbeafe", text: "#1e40af" },
  build: { bg: "#fef9c3", text: "#854d0e" },
  peak: { bg: "#ffedd5", text: "#9a3412" },
  taper: { bg: "#dcfce7", text: "#166534" },
  recovery: { bg: "#f1f5f9", text: "#475569" },
};

const ZONE_COLORS: Record<string, string> = {
  Z1: "#22c55e",
  Z2: "#3b82f6",
  Z3: "#eab308",
  Z4: "#f97316",
  Z5: "#ef4444",
  Z6: "#a855f7",
};

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

const SUPERSCRIPT_DIGITS = ["\u2070", "\u00b9", "\u00b2", "\u00b3", "\u2074", "\u2075", "\u2076", "\u2077", "\u2078", "\u2079"];

// ── Helpers ────────────────────────────────────────────────────────

function isEn(): boolean {
  return i18n.language?.startsWith("en") ?? false;
}

function t(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`common:export.planPdf.${key}`, opts);
}


function isStrength(template: WorkoutTemplate): boolean {
  return (template as unknown as { kind?: string }).kind === "strength";
}

function asStrength(template: WorkoutTemplate): StrengthWorkoutTemplate {
  return template as unknown as StrengthWorkoutTemplate;
}

function toSuperscript(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUPERSCRIPT_DIGITS[parseInt(d, 10)] ?? d)
    .join("");
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
function typeLabel(sessionType: string, template: WorkoutTemplate | undefined): string {
  if (template && isStrength(template)) {
    const cat = asStrength(template).category;
    const label = STRENGTH_CAT_LABELS[cat];
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
function buildCompactSummary(template: WorkoutTemplate, actualDurationMin?: number): string {
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
function buildStrengthSummary(
  template: StrengthWorkoutTemplate,
  exerciseNames: Record<string, string>,
): string {
  const allBlocks = [
    ...template.warmupBlocks,
    ...template.mainBlocks,
    ...template.cooldownBlocks,
  ];
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
      if (session.workoutId === "__race_day__") continue;
      if (!index.has(session.workoutId)) {
        index.set(session.workoutId, counter++);
      }
    }
  }
  return index;
}

// ── Exercise name resolution ────────────────────────────────────────

async function resolveExerciseNames(
  templates: Record<string, WorkoutTemplate>,
): Promise<Record<string, string>> {
  const names: Record<string, string> = {};
  const exerciseIds = new Set<string>();

  for (const t of Object.values(templates)) {
    if (!isStrength(t)) continue;
    const st = asStrength(t);
    for (const block of [...st.warmupBlocks, ...st.mainBlocks, ...st.cooldownBlocks]) {
      exerciseIds.add(block.exerciseId);
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

// ── Appendix renderers ──────────────────────────────────────────────

function renderRunningAppendixEntry(
  refNum: number,
  template: WorkoutTemplate,
): Content[] {
  const name = isEn() ? template.nameEn : template.name;
  const zone = `Z${getDominantZone(template)}`;
  const zoneColor = ZONE_COLORS[zone] || "#555";
  const dur = template.typicalDuration
    ? `${template.typicalDuration.min}-${template.typicalDuration.max}min`
    : "";

  const catLabel = SESSION_TYPE_LABELS_SHORT[template.sessionType];
  const catStr = catLabel ? (isEn() ? catLabel.en : catLabel.fr) : template.sessionType;

  const result: Content[] = [];

  // Header line (with anchor for internal PDF links)
  result.push({
    text: [
      { text: `[${refNum}] `, bold: true, fontSize: 9, color: "#333" },
      { text: name, bold: true, fontSize: 9, color: "#333" },
      { text: `   ${catStr} \u00b7 `, fontSize: 8, color: "#666" },
      { text: zone, fontSize: 8, color: zoneColor, bold: true },
      { text: ` \u00b7 ${dur}`, fontSize: 8, color: "#666" },
    ],
    id: `ref-${refNum}`,
    margin: [0, 8, 0, 2] as [number, number, number, number],
  } as any);

  // Blocks table
  const allBlocks: { phase: string; blocks: WorkoutBlock[] }[] = [];
  if (template.warmupTemplate?.length) {
    allBlocks.push({ phase: t("warmup"), blocks: template.warmupTemplate });
  }
  if (template.mainSetTemplate?.length) {
    allBlocks.push({ phase: t("mainSet"), blocks: template.mainSetTemplate });
  }
  if (template.cooldownTemplate?.length) {
    allBlocks.push({ phase: t("cooldown"), blocks: template.cooldownTemplate });
  }

  const rows: TableCell[][] = [];
  for (const { phase, blocks } of allBlocks) {
    for (const block of blocks) {
      const desc = isEn() ? (block.descriptionEn || block.description) : block.description;
      const dur = block.durationMin ? `${block.durationMin}min` : "";
      const blockZone = block.zone || "";
      const blockZoneColor = blockZone ? (ZONE_COLORS[blockZone.split("-")[0]] || "#555") : "";

      // Reps column
      let repsStr = "\u2014";
      if (block.sets && block.sets > 1 && block.repetitions && block.repetitions > 1) {
        repsStr = `${block.sets}\u00d7${block.repetitions}\u00d7`;
      } else if (block.repetitions && block.repetitions > 1) {
        repsStr = `${block.repetitions}\u00d7`;
      }

      rows.push([
        { text: phase, fontSize: 7, color: "#888", margin: [2, 1, 2, 1] },
        { text: desc, fontSize: 7, margin: [2, 1, 2, 1] },
        { text: dur, fontSize: 7, alignment: "center" as const, margin: [2, 1, 2, 1] },
        blockZone
          ? {
              text: blockZone,
              fontSize: 7,
              bold: true,
              color: "#fff",
              fillColor: blockZoneColor,
              alignment: "center" as const,
              margin: [2, 1, 2, 1],
            }
          : { text: "\u2014", fontSize: 7, color: "#aaa", alignment: "center" as const, margin: [2, 1, 2, 1] },
        { text: repsStr, fontSize: 7, alignment: "center" as const, margin: [2, 1, 2, 1] },
      ] as TableCell[]);
    }
  }

  if (rows.length > 0) {
    const headerRow: TableCell[] = [
      { text: "Phase", style: "tinyHeader" },
      { text: "Description", style: "tinyHeader" },
      { text: t("durationCol"), style: "tinyHeader" },
      { text: "Zone", style: "tinyHeader" },
      { text: "Reps", style: "tinyHeader" },
    ];

    result.push({
      table: {
        headerRows: 1,
        widths: [40, "*", 35, 28, 35],
        body: [headerRow, ...rows],
      },
      layout: {
        fillColor: (rowIndex: number) => (rowIndex === 0 ? "#f1f5f9" : null),
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#e2e8f0",
        vLineColor: () => "#e2e8f0",
      },
      margin: [0, 0, 0, 2] as [number, number, number, number],
    });
  }

  // Coaching tips (max 2, only for complex workouts)
  const complexTypes = ["threshold", "vo2max", "tempo", "race_pace", "fartlek", "hills"];
  if (complexTypes.includes(template.sessionType)) {
    const tips = isEn() ? template.coachingTipsEn : template.coachingTips;
    if (tips?.length) {
      const tipTexts = tips.slice(0, 2).map((tip) => `\u2022 ${tip}`).join("  ");
      result.push({
        text: tipTexts,
        italics: true,
        fontSize: 7,
        color: "#888",
        margin: [0, 1, 0, 2] as [number, number, number, number],
      });
    }
  }

  return result;
}

function renderStrengthAppendixEntry(
  refNum: number,
  template: StrengthWorkoutTemplate,
  exerciseNames: Record<string, string>,
): Content[] {
  const name = isEn() ? template.nameEn : template.name;
  const catLabel = STRENGTH_CAT_LABELS[template.category];
  const catStr = catLabel ? (isEn() ? catLabel.en : catLabel.fr) : template.category;
  const intensityStr = template.intensity;
  const dur = template.typicalDuration
    ? `${template.typicalDuration.min}-${template.typicalDuration.max}min`
    : "";

  const result: Content[] = [];

  // Header line (with anchor for internal PDF links)
  result.push({
    text: [
      { text: `[${refNum}] `, bold: true, fontSize: 9, color: "#333" },
      { text: name, bold: true, fontSize: 9, color: "#333" },
      { text: `   ${catStr} \u00b7 ${intensityStr} \u00b7 ${dur}`, fontSize: 8, color: "#666" },
    ],
    id: `ref-${refNum}`,
    margin: [0, 8, 0, 2] as [number, number, number, number],
  } as any);

  // Blocks table
  const allBlockSections: { phase: string; blocks: StrengthBlock[] }[] = [];
  if (template.warmupBlocks?.length) {
    allBlockSections.push({ phase: t("warmup"), blocks: template.warmupBlocks });
  }
  if (template.mainBlocks?.length) {
    allBlockSections.push({ phase: t("mainSet"), blocks: template.mainBlocks });
  }
  if (template.cooldownBlocks?.length) {
    allBlockSections.push({ phase: t("cooldown"), blocks: template.cooldownBlocks });
  }

  const rows: TableCell[][] = [];
  for (const { phase, blocks } of allBlockSections) {
    for (const block of blocks) {
      const exName = isEn()
        ? (exerciseNames[`${block.exerciseId}__en`] || exerciseNames[block.exerciseId] || block.exerciseId)
        : (exerciseNames[block.exerciseId] || block.exerciseId);
      const setsReps = `${block.sets}\u00d7${block.reps}`;

      rows.push([
        { text: phase, fontSize: 7, color: "#888", margin: [2, 1, 2, 1] },
        { text: exName, fontSize: 7, margin: [2, 1, 2, 1] },
        { text: setsReps, fontSize: 7, alignment: "center" as const, margin: [2, 1, 2, 1] },
        { text: block.restBetweenSets || "\u2014", fontSize: 7, alignment: "center" as const, margin: [2, 1, 2, 1] },
        { text: block.intensity, fontSize: 7, alignment: "center" as const, margin: [2, 1, 2, 1] },
      ] as TableCell[]);
    }
  }

  if (rows.length > 0) {
    const headerRow: TableCell[] = [
      { text: "Phase", style: "tinyHeader" },
      { text: t("exercise"), style: "tinyHeader" },
      { text: t("sets"), style: "tinyHeader" },
      { text: t("rest"), style: "tinyHeader" },
      { text: t("intensity"), style: "tinyHeader" },
    ];

    result.push({
      table: {
        headerRows: 1,
        widths: [40, "*", 35, 35, 55],
        body: [headerRow, ...rows],
      },
      layout: {
        fillColor: (rowIndex: number) => (rowIndex === 0 ? "#f1f5f9" : null),
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#e2e8f0",
        vLineColor: () => "#e2e8f0",
      },
      margin: [0, 0, 0, 2] as [number, number, number, number],
    });
  }

  // Coaching tips (max 2)
  const tips = isEn() ? template.coachingTipsEn : template.coachingTips;
  if (tips?.length) {
    const tipTexts = tips.slice(0, 2).map((tip) => `\u2022 ${tip}`).join("  ");
    result.push({
      text: tipTexts,
      italics: true,
      fontSize: 7,
      color: "#888",
      margin: [0, 1, 0, 2] as [number, number, number, number],
    });
  }

  return result;
}

// ── Main Export Function ────────────────────────────────────────────

export async function exportPlanToPDF(
  plan: TrainingPlan,
  workoutNames: Record<string, string>,
  workoutTemplates: Record<string, WorkoutTemplate>,
): Promise<void> {
  try {
      // Dynamic import pdfmake (code-split)
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeModule.default;
    pdfMake.vfs = pdfFontsModule.default.vfs;

    // Resolve exercise names for strength workouts
    const exerciseNames = await resolveExerciseNames(workoutTemplates);

    // Build workout index for appendix references
    const workoutIndex = buildWorkoutIndex(plan);

    const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
    const isFreePlan = plan.config.planMode === "free";
    const planName = isFreePlan
      ? (plan.config.planName || plan.name)
      : (isEn() ? plan.nameEn : plan.name);
    const content: Content[] = [];

    // ── PAGE 1: Title + Overview ──────────────────────────────────────

    // 1A. Title banner
    const subtitleText = raceMeta
      ? (isEn() ? raceMeta.labelEn : raceMeta.label)
      : (isFreePlan ? t("freePlan") : "");

    content.push({
      table: {
        widths: ["*", "auto"],
        body: [[
          {
            stack: [
              { text: planName, fontSize: 18, bold: true, color: "#fff" },
              ...(subtitleText ? [{ text: subtitleText, fontSize: 11, color: "#94a3b8", margin: [0, 2, 0, 0] as [number, number, number, number] }] : []),
            ],
            margin: [10, 8, 0, 8] as [number, number, number, number],
          },
          {
            text: "zoned.run",
            fontSize: 9,
            color: "#94a3b8",
            alignment: "right" as const,
            margin: [0, 10, 10, 0] as [number, number, number, number],
          },
        ]],
      },
      layout: {
        fillColor: () => "#1e293b",
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
      margin: [0, 0, 0, 12] as [number, number, number, number],
    });

    // 1B. Metadata table (2 columns)
    const metaLeft: string[] = [];
    const metaRight: string[] = [];

    metaLeft.push(`${t("start")}: ${formatDateMedium(plan.config.createdAt)}`);
    if (plan.config.raceDate) {
      metaLeft.push(`${t("race")}: ${formatDateMedium(plan.config.raceDate)}`);
    }
    metaLeft.push(`${t("duration")}: ${plan.totalWeeks} ${t("weeks")}`);
    if (plan.peakWeeklyKm) {
      metaLeft.push(`${t("peakVolume")}: ${plan.peakWeeklyKm} km/${t("wk")}`);
    }

    if (plan.config.raceName) {
      metaRight.push(`${t("raceName")}: ${plan.config.raceName}`);
    }
    if (plan.raceTimePrediction) {
      metaRight.push(`${t("target")}: ${plan.raceTimePrediction}`);
    }
    metaRight.push(`${t("sessionsPerWeek")}: ${plan.config.daysPerWeek}`);
    if (plan.peakLongRunKm) {
      metaRight.push(`${t("peakLongRun")}: ${plan.peakLongRunKm} km`);
    }

    content.push({
      table: {
        widths: ["*", "*"],
        body: [[
          {
            stack: metaLeft.map((t) => ({ text: t, fontSize: 8, color: "#555", margin: [4, 2, 4, 2] as [number, number, number, number] })),
            fillColor: "#f8fafc",
          },
          {
            stack: metaRight.map((t) => ({ text: t, fontSize: 8, color: "#555", margin: [4, 2, 4, 2] as [number, number, number, number] })),
            fillColor: "#f8fafc",
          },
        ]],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#e2e8f0",
        vLineColor: () => "#e2e8f0",
      },
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });

    // 1C. Stats summary (3 columns)
    const stats = computePlanStats(plan);
    const totalHours = Math.round(stats.totalDurationMin / 60);

    content.push({
      table: {
        widths: ["*", "*", "*"],
        body: [[
          {
            stack: [
              { text: `${stats.totalSessions}`, fontSize: 14, bold: true, color: "#1e293b", alignment: "center" as const },
              { text: t("sessions"), fontSize: 7, color: "#888", alignment: "center" as const },
              { text: `~${Math.round(stats.totalEstimatedKm)} km`, fontSize: 9, bold: true, color: "#3b82f6", alignment: "center" as const, margin: [0, 2, 0, 0] as [number, number, number, number] },
            ],
            fillColor: "#f0f9ff",
            margin: [4, 6, 4, 6] as [number, number, number, number],
          },
          {
            stack: [
              { text: `${totalHours}h`, fontSize: 14, bold: true, color: "#1e293b", alignment: "center" as const },
              { text: "total", fontSize: 7, color: "#888", alignment: "center" as const },
              { text: `${stats.keySessionCount} ${t("key")}`, fontSize: 9, bold: true, color: "#854d0e", alignment: "center" as const, margin: [0, 2, 0, 0] as [number, number, number, number] },
            ],
            fillColor: "#f0f9ff",
            margin: [4, 6, 4, 6] as [number, number, number, number],
          },
          {
            stack: [
              { text: `S${stats.peakVolumeWeek}`, fontSize: 14, bold: true, color: "#1e293b", alignment: "center" as const },
              { text: t("peakWeek"), fontSize: 7, color: "#888", alignment: "center" as const },
              { text: `${stats.avgDurationPerWeekMin}min/${t("wk")}`, fontSize: 9, bold: true, color: "#666", alignment: "center" as const, margin: [0, 2, 0, 0] as [number, number, number, number] },
            ],
            fillColor: "#f0f9ff",
            margin: [4, 6, 4, 6] as [number, number, number, number],
          },
        ]],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#e2e8f0",
        vLineColor: () => "#e2e8f0",
      },
      margin: [0, 0, 0, 6] as [number, number, number, number],
    });

    // Note about appendix reference numbers
    const totalUniqueWorkouts = workoutIndex.size;
    content.push({
      text: t("appendixNote", { count: totalUniqueWorkouts }),
      italics: true,
      fontSize: 7,
      color: "#888",
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });

    // 1D. Target paces table (if targetPaceMinKm)
    if (plan.config.targetPaceMinKm) {
      const pace = plan.config.targetPaceMinKm;
      const paceRows = [
        [t("raceThreshold"), paceStr(pace)],
        ["Tempo", paceStr(pace + 0.25)],
        [t("easyLongRun"), paceStr(pace + 1)],
        ["VO2max", paceStr(pace - 0.5)],
      ];

      content.push(
        { text: t("targetPaces"), fontSize: 10, bold: true, color: "#333", margin: [0, 0, 0, 4] as [number, number, number, number] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto"],
            body: [
              [
                { text: t("sessionType"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", margin: [4, 3, 4, 3] as [number, number, number, number] },
                { text: t("paceCol"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", alignment: "center" as const, margin: [4, 3, 4, 3] as [number, number, number, number] },
              ],
              ...paceRows.map(([type, paceVal]) => [
                { text: type, fontSize: 8, margin: [4, 2, 4, 2] as [number, number, number, number] },
                { text: paceVal, fontSize: 8, alignment: "center" as const, bold: true, margin: [4, 2, 4, 2] as [number, number, number, number] },
              ] as TableCell[]),
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 10] as [number, number, number, number],
        },
      );
    }

    // 1E. Zone paces table (if VMA)
    if (plan.config.vma) {
      const paceZones = calculatePaceZones(plan.config.vma);

      content.push(
        { text: t("zonePaces"), fontSize: 10, bold: true, color: "#333", margin: [0, 0, 0, 4] as [number, number, number, number] },
        {
          table: {
            headerRows: 1,
            widths: [35, "*", "auto"],
            body: [
              [
                { text: "Zone", bold: true, fontSize: 7, color: "#fff", fillColor: "#333", margin: [4, 3, 4, 3] as [number, number, number, number] },
                { text: t("range"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", margin: [4, 3, 4, 3] as [number, number, number, number] },
                { text: t("paceCol"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", alignment: "center" as const, margin: [4, 3, 4, 3] as [number, number, number, number] },
              ],
              ...paceZones.map((z) => [
                {
                  text: `Z${z.zone}`,
                  bold: true,
                  fontSize: 8,
                  color: "#fff",
                  fillColor: ZONE_COLORS[`Z${z.zone}`] || "#555",
                  alignment: "center" as const,
                  margin: [4, 2, 4, 2] as [number, number, number, number],
                },
                {
                  text: `${z.paceMaxPerKm ? formatPace(z.paceMaxPerKm) : "?"} - ${z.paceMinPerKm ? formatPace(z.paceMinPerKm) : "?"}`,
                  fontSize: 8,
                  margin: [4, 2, 4, 2] as [number, number, number, number],
                },
                {
                  text: z.paceMinPerKm && z.paceMaxPerKm
                    ? formatPace((z.paceMinPerKm + z.paceMaxPerKm) / 2)
                    : "-",
                  fontSize: 8,
                  alignment: "center" as const,
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

    // 1F. Training phases overview
    content.push(
      { text: t("trainingPhases"), fontSize: 10, bold: true, color: "#333", margin: [0, 0, 0, 4] as [number, number, number, number] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto"],
          body: [
            [
              { text: "Phase", bold: true, fontSize: 7, color: "#fff", fillColor: "#333", margin: [4, 3, 4, 3] as [number, number, number, number] },
              { text: t("phasesWeeks"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", alignment: "center" as const, margin: [4, 3, 4, 3] as [number, number, number, number] },
              { text: "Description", bold: true, fontSize: 7, color: "#fff", fillColor: "#333", margin: [4, 3, 4, 3] as [number, number, number, number] },
            ],
            ...plan.phases.map((phaseRange) => {
              const meta = PHASE_META[phaseRange.phase];
              const colors = PHASE_COLORS[phaseRange.phase] || PHASE_COLORS.recovery;
              return [
                {
                  text: isEn() ? meta.labelEn : meta.label,
                  bold: true,
                  fontSize: 8,
                  color: colors.text,
                  fillColor: colors.bg,
                  margin: [4, 3, 4, 3],
                },
                {
                  text: `S${phaseRange.startWeek}-S${phaseRange.endWeek}`,
                  fontSize: 8,
                  alignment: "center" as const,
                  fillColor: colors.bg,
                  margin: [4, 3, 4, 3],
                },
                {
                  text: isEn() ? meta.descriptionEn : meta.description,
                  fontSize: 8,
                  fillColor: colors.bg,
                  margin: [4, 3, 4, 3],
                },
              ] as TableCell[];
            }),
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
    );

    // ── PAGES 2-N: Weekly Session Tables ──────────────────────────────

    let currentPhase = "";
    // Track accumulated session rows to decide page breaks based on content, not fixed week count.
    // A4 usable height ~750pt. Each row ~16pt, header ~20pt, week header ~24pt, notes ~14pt.
    // Safe threshold: ~40 rows worth of content before breaking.
    let accumulatedRows = 0;
    const PAGE_ROW_LIMIT = 40;

    for (const week of plan.weeks) {
      const phaseMeta = PHASE_META[week.phase];
      const phaseColors = PHASE_COLORS[week.phase] || PHASE_COLORS.recovery;

      // Phase transition banner
      const isPhaseTransition = week.phase !== currentPhase;
      if (isPhaseTransition) {
        currentPhase = week.phase;
        const pMeta = PHASE_META[week.phase];
        const pColors = PHASE_COLORS[week.phase] || PHASE_COLORS.recovery;

        // First week of plan or phase transition
        if (week.weekNumber > 1) {
          content.push({
            table: {
              widths: ["*"],
              body: [[{
                text: `${(isEn() ? pMeta.labelEn : pMeta.label).toUpperCase()} \u2014 ${isEn() ? pMeta.descriptionEn : pMeta.description}`,
                bold: true,
                fontSize: 10,
                color: pColors.text,
                fillColor: pColors.bg,
                margin: [8, 5, 8, 5],
              }]],
            },
            layout: "noBorders",
            margin: [0, 2, 0, 6] as [number, number, number, number],
            pageBreak: "before" as const,
          });
          accumulatedRows = 0;
        }
      }

      // Weekly volume stats
      const weekDuration = computeWeekDuration(week);
      const weekKm = Math.round(computeWeekKm(week));
      const weekDurationStr = formatDuration(weekDuration);
      const weekLabel = isEn()
        ? (week.weekLabelEn || `Week ${week.weekNumber}`)
        : (week.weekLabel || `Semaine ${week.weekNumber}`);
      const actualKm = week.targetKm ?? weekKm;
      const longRunInfo = week.targetLongRunKm ? ` \u00b7 SL ${week.targetLongRunKm}km` : "";
      const recoveryTag = week.isRecoveryWeek ? ` [${t("recovery")}]` : "";

      // Estimate how many rows this week will add (sessions + header + possible notes)
      const weekSessionCount = week.sessions.length;
      const estimatedNoteRows = week.sessions.filter((s) => s.isKeySession && (s.notes || s.notesEn || s.paceNotes?.length)).length;
      const weekRows = weekSessionCount + estimatedNoteRows + 2; // +2 for header row + table header

      // Break when accumulated content would overflow the page
      const needsBreak = !isPhaseTransition && accumulatedRows > 0 && (accumulatedRows + weekRows) > PAGE_ROW_LIMIT;

      // Week header row
      content.push({
        table: {
          widths: ["*", "auto"],
          body: [[
            {
              text: `${weekLabel} \u2014 ${isEn() ? phaseMeta.labelEn : phaseMeta.label} \u00b7 ${weekDurationStr} \u00b7 ~${actualKm}km${longRunInfo}`,
              fontSize: 8,
              bold: true,
              color: phaseColors.text,
            },
            {
              text: recoveryTag,
              fontSize: 8,
              bold: true,
              color: phaseColors.text,
              alignment: "right" as const,
            },
          ]],
        },
        layout: {
          fillColor: () => phaseColors.bg,
          hLineWidth: () => 0,
          vLineWidth: () => 0,
        },
        margin: [0, 4, 0, 2] as [number, number, number, number],
        ...(needsBreak ? { pageBreak: "before" as const } : {}),
      });

      if (needsBreak) accumulatedRows = 0;
      accumulatedRows += weekRows;

      if (week.sessions.length === 0) {
        content.push({
          text: t("noSessions"),
          italics: true,
          fontSize: 7,
          color: "#888",
          margin: [0, 2, 0, 8] as [number, number, number, number],
        });
        continue;
      }

      // Session table: Jour | Seance | Type | Zone | Duree | Resume
      const tableHeader: TableCell[] = [
        { text: t("day"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", alignment: "center" as const, margin: [2, 3, 2, 3] as [number, number, number, number] },
        { text: t("workout"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", margin: [2, 3, 2, 3] as [number, number, number, number] },
        { text: "Type", bold: true, fontSize: 7, color: "#fff", fillColor: "#333", alignment: "center" as const, margin: [2, 3, 2, 3] as [number, number, number, number] },
        { text: "Zone", bold: true, fontSize: 7, color: "#fff", fillColor: "#333", alignment: "center" as const, margin: [2, 3, 2, 3] as [number, number, number, number] },
        { text: t("dur"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", alignment: "right" as const, margin: [2, 3, 2, 3] as [number, number, number, number] },
        { text: t("summary"), bold: true, fontSize: 7, color: "#fff", fillColor: "#333", margin: [2, 3, 2, 3] as [number, number, number, number] },
      ];

      const rows: TableCell[][] = [];
      const paceNoteRows: { afterIndex: number; text: string }[] = [];

      for (let i = 0; i < week.sessions.length; i++) {
        const session = week.sessions[i];
        const isRaceDay = session.workoutId === "__race_day__";

        if (isRaceDay) {
          rows.push([
            { text: dayLabel(session.dayOfWeek), fontSize: 7, alignment: "center" as const, margin: [2, 2, 2, 2] },
            {
              text: t("raceDay"),
              bold: true,
              fontSize: 7,
              color: phaseColors.text,
              colSpan: 4,
              margin: [2, 2, 2, 2],
            },
            {}, {}, {},
            { text: "", fontSize: 7, margin: [2, 2, 2, 2] },
          ] as TableCell[]);
          continue;
        }

        const template = workoutTemplates[session.workoutId];
        const refNum = workoutIndex.get(session.workoutId);
        const wName = workoutNames[session.workoutId] || session.workoutId;
        const isKey = session.isKeySession;
        const isStr = template ? isStrength(template) : session.workoutId.startsWith("STR-");

        // Name with key star + ref superscript
        const nameText: Content = {
          text: [
            ...(isKey ? [{ text: "\u2605 ", color: "#854d0e", bold: true, fontSize: 8 }] : []),
            { text: wName },
            ...(refNum ? [{ text: ` ${toSuperscript(refNum)}`, fontSize: 6, color: "#3b82f6", decoration: "underline" as const, linkToDestination: `ref-${refNum}` }] : []),
          ],
          fontSize: 7,
        };

        // Type
        const tLabel = typeLabel(session.sessionType, template);

        // Zone cell
        let zoneCell: TableCell;
        if (isStr) {
          zoneCell = {
            text: "\u2014",
            fontSize: 7,
            color: "#fff",
            fillColor: "#94a3b8",
            alignment: "center" as const,
            bold: true,
            margin: [2, 2, 2, 2],
          };
        } else if (template && !isStr) {
          const dominantZone = getDominantZone(template);
          const zStr = `Z${dominantZone}`;
          zoneCell = {
            text: zStr,
            fontSize: 7,
            color: "#fff",
            fillColor: ZONE_COLORS[zStr] || "#555",
            alignment: "center" as const,
            bold: true,
            margin: [2, 2, 2, 2],
          };
        } else {
          zoneCell = {
            text: "\u2014",
            fontSize: 7,
            color: "#aaa",
            alignment: "center" as const,
            margin: [2, 2, 2, 2],
          };
        }

        // Duration
        const durStr = formatDuration(session.estimatedDurationMin);

        // Summary
        let summary = "";
        if (isStr && template) {
          summary = buildStrengthSummary(asStrength(template), exerciseNames);
        } else if (template && !isStr) {
          summary = buildCompactSummary(template, session.estimatedDurationMin);
        }

        rows.push([
          { text: dayLabel(session.dayOfWeek), fontSize: 7, alignment: "center" as const, margin: [2, 2, 2, 2] },
          { ...nameText as object, margin: [2, 2, 2, 2] } as TableCell,
          { text: tLabel, fontSize: 7, alignment: "center" as const, margin: [2, 2, 2, 2] },
          zoneCell,
          { text: durStr, fontSize: 7, alignment: "right" as const, margin: [2, 2, 2, 2] },
          { text: summary, fontSize: 7, color: "#555", margin: [2, 2, 2, 2] },
        ] as TableCell[]);

        // Collect pace notes for key sessions
        if (isKey) {
          const notes = isEn() ? session.notesEn : session.notes;
          if (notes) {
            paceNoteRows.push({ afterIndex: rows.length - 1, text: notes });
          } else if (session.paceNotes?.length) {
            const paceText = session.paceNotes
              .map((pn) => {
                const desc = isEn() ? pn.descriptionEn : pn.description;
                return `${desc}: ${formatPace(pn.paceMinKm)} - ${formatPace(pn.paceMaxKm)}`;
              })
              .join(" | ");
            paceNoteRows.push({ afterIndex: rows.length - 1, text: paceText });
          }
        }
      }

      // Insert pace note sub-rows (iterate in reverse to preserve indices)
      for (let j = paceNoteRows.length - 1; j >= 0; j--) {
        const { afterIndex, text } = paceNoteRows[j];
        const noteRow: TableCell[] = [
          {
            text,
            colSpan: 6,
            fontSize: 7,
            italics: true,
            color: "#666",
            margin: [22, 0, 2, 1] as [number, number, number, number],
          },
          {}, {}, {}, {}, {},
        ];
        rows.splice(afterIndex + 1, 0, noteRow);
      }

      content.push({
        table: {
          headerRows: 1,
          widths: [26, "*", 48, 26, 30, "*"],
          body: [tableHeader, ...rows],
        },
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return "#333";
            return rowIndex % 2 === 0 ? phaseColors.bg : null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
        },
        margin: [0, 0, 0, 6] as [number, number, number, number],
      });
    }

    // ── APPENDIX: Lexique des seances ─────────────────────────────────

    content.push({
      text: t("workoutReference"),
      fontSize: 13,
      bold: true,
      color: "#1e293b",
      margin: [0, 0, 0, 8] as [number, number, number, number],
      pageBreak: "before" as const,
    });

    // Sort entries by reference number
    const sortedEntries = Array.from(workoutIndex.entries()).sort((a, b) => a[1] - b[1]);

    for (const [workoutId, refNum] of sortedEntries) {
      const template = workoutTemplates[workoutId];
      if (!template) continue;

      if (isStrength(template)) {
        const entries = renderStrengthAppendixEntry(refNum, asStrength(template), exerciseNames);
        content.push(...entries);
      } else {
        const entries = renderRunningAppendixEntry(refNum, template);
        content.push(...entries);
      }
    }

    // ── Document Definition ───────────────────────────────────────────

    const docDefinition: TDocumentDefinitions = {
      content,
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: planName, fontSize: 7, color: "#aaa", margin: [25, 0, 0, 0] },
          {
            text: `${t("generatedBy")} Zoned \u00b7 zoned.run`,
            fontSize: 7,
            color: "#aaa",
            alignment: "center" as const,
          },
          {
            text: `${currentPage} / ${pageCount}`,
            fontSize: 7,
            color: "#aaa",
            alignment: "right" as const,
            margin: [0, 0, 25, 0],
          },
        ],
      }),
      styles: {
        tinyHeader: {
          bold: true,
          fontSize: 7,
          color: "#666",
          margin: [2, 2, 2, 2],
        },
      },
      defaultStyle: {
        fontSize: 8,
      },
      pageMargins: [25, 25, 25, 40] as [number, number, number, number],
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
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
