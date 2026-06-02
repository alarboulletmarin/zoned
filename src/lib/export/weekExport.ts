/**
 * "Ma semaine" exports — calendar (ICS), document (PDF) and raw (JSON).
 *
 * Reuses the same download mechanics and pdfmake/ics setup as the workout and
 * plan exporters. (Epic #83, issue #91)
 */

import { createEvents, type EventAttributes } from "ics";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import i18n from "@/i18n";
import { pickLang } from "@/lib/i18n-utils";
import {
  getAnyWorkoutDuration,
  getAnyWorkoutTss,
} from "@/lib/workoutFilters";
import { computeWeekStats } from "@/lib/weekStats";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { AnyWorkoutTemplate } from "@/types";
import type { GeneratedWeek } from "@/types/week";

const ZONE_HEX: Record<number, string> = {
  1: "#22c55e",
  2: "#3b82f6",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
  6: "#a855f7",
};

function dayLabel(day: number): string {
  return i18n.t(`library:weekly.days.${day}`);
}

function kindLabel(kind: string): string {
  return i18n.t(`library:weekly.kinds.${kind}`);
}

function slotZone(w: AnyWorkoutTemplate | null): number | null {
  if (!w || isStrengthWorkout(w)) return null;
  return getDominantZone(w);
}

/** Monday of the current ISO week, at midnight. */
function mondayOfThisWeek(): Date {
  const d = new Date();
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── ICS ──────────────────────────────────────────────────────────────────────

/** One calendar event per session, placed on its weekday at 18:00. */
export function exportWeekToICS(week: GeneratedWeek): Promise<void> {
  const monday = mondayOfThisWeek();

  const events: EventAttributes[] = [];
  for (const slot of week.slots) {
    const w = slot.workout;
    if (!w) continue;
    const date = new Date(monday);
    date.setDate(monday.getDate() + slot.day);
    const zone = slotZone(w);
    const tss = getAnyWorkoutTss(w);
    const descParts = [
      kindLabel(slot.kind),
      zone ? `Z${zone}` : null,
      tss != null ? `${tss} TSS` : null,
      pickLang(w, "description"),
    ].filter(Boolean);

    events.push({
      start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), 18, 0],
      duration: { minutes: getAnyWorkoutDuration(w) },
      title: `[Zoned] ${pickLang(w, "name")}`,
      description: descParts.join(" · "),
      categories: ["Zoned", "Workout", slot.kind],
      status: "CONFIRMED",
      busyStatus: "BUSY",
      productId: "zoned-app",
    });
  }

  return new Promise((resolve, reject) => {
    createEvents(events, (error, value) => {
      if (error || !value) {
        reject(error ?? new Error("ICS generation failed"));
        return;
      }
      triggerDownload(
        new Blob([value], { type: "text/calendar;charset=utf-8" }),
        "zoned-semaine.ics",
      );
      resolve();
    });
  });
}

// ── PDF ──────────────────────────────────────────────────────────────────────

export async function exportWeekToPDF(week: GeneratedWeek): Promise<void> {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default;
  pdfMake.vfs = pdfFontsModule.default.vfs;

  const t = (key: string, opts?: Record<string, unknown>) =>
    i18n.t(`library:weekly.${key}`, opts);
  const stats = computeWeekStats(week.slots);
  const pct = (n: number) => Math.round(n * 100);

  const tableBody: TableCell[][] = [
    [
      { text: t("table.day"), style: "th" },
      { text: t("table.type"), style: "th" },
      { text: t("table.session"), style: "th" },
      { text: t("table.duration"), style: "th" },
      { text: "TSS", style: "th" },
      { text: t("table.zone"), style: "th" },
    ],
  ];
  for (const slot of [...week.slots].sort((a, b) => a.day - b.day)) {
    const w = slot.workout;
    if (!w) {
      tableBody.push([
        { text: dayLabel(slot.day) },
        { text: kindLabel("rest"), color: "#94a3b8" },
        { text: "—", colSpan: 4, color: "#94a3b8" },
        {},
        {},
        {},
      ]);
      continue;
    }
    const zone = slotZone(w);
    const tss = getAnyWorkoutTss(w);
    tableBody.push([
      { text: dayLabel(slot.day) },
      { text: kindLabel(slot.kind) },
      { text: pickLang(w, "name") },
      { text: `${getAnyWorkoutDuration(w)} min` },
      { text: tss != null ? String(tss) : "—" },
      zone
        ? { text: `Z${zone}`, color: "#ffffff", fillColor: ZONE_HEX[zone] }
        : { text: "—", color: "#94a3b8" },
    ]);
  }

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 48, 40, 48],
    content: [
      { text: t("title"), style: "title" },
      {
        text: t("summary.polarisation", {
          low: pct(stats.polarised.lowShare),
          mid: pct(stats.polarised.midShare),
          high: pct(stats.polarised.highShare),
        }),
        style: "subtitle",
      },
      {
        columns: [
          { text: `${t("summary.sessions")}: ${stats.sessions}`, style: "stat" },
          { text: `${t("summary.volume")}: ${stats.totalHours.toFixed(1)} h`, style: "stat" },
          { text: `${t("summary.load")}: ${stats.totalTss} TSS`, style: "stat" },
          { text: `${t("summary.hard")}: ${stats.hardSessions}`, style: "stat" },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "*", "auto", "auto", "auto"],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? "#f1f5f9" : rowIndex % 2 === 0 ? "#fafafa" : null,
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
        },
      },
    ],
    styles: {
      title: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
      subtitle: { fontSize: 11, color: "#64748b", margin: [0, 0, 0, 12] },
      stat: { fontSize: 10, bold: true },
      th: { bold: true, fontSize: 10 },
    },
    defaultStyle: { fontSize: 10 },
  };

  const pdf = pdfMake.createPdf(docDefinition) as unknown as {
    getBlob: () => Promise<Blob>;
  };
  const blob = await pdf.getBlob();
  triggerDownload(blob, "zoned-semaine.pdf");
}

// ── JSON ───────────────────────────────────────────────────────────────────

/** Serialisable shape — enough to restore the week structure later. */
export interface WeekExportJSON {
  version: 1;
  exportedAt: string;
  settings: GeneratedWeek["settings"];
  slots: Array<{
    day: number;
    kind: string;
    locked: boolean;
    workoutId: string | null;
    workoutName: string | null;
    durationMin: number | null;
    tss: number | null;
    zone: number | null;
  }>;
}

export function buildWeekJSON(week: GeneratedWeek): WeekExportJSON {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: week.settings,
    slots: [...week.slots]
      .sort((a, b) => a.day - b.day)
      .map((slot) => {
        const w = slot.workout;
        return {
          day: slot.day,
          kind: slot.kind,
          locked: slot.locked,
          workoutId: w?.id ?? null,
          workoutName: w ? pickLang(w, "name") : null,
          durationMin: w ? getAnyWorkoutDuration(w) : null,
          tss: w ? getAnyWorkoutTss(w) : null,
          zone: slotZone(w),
        };
      }),
  };
}

export function exportWeekToJSON(week: GeneratedWeek): void {
  const json = JSON.stringify(buildWeekJSON(week), null, 2);
  triggerDownload(
    new Blob([json], { type: "application/json" }),
    "zoned-semaine.json",
  );
}
