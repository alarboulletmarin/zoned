/**
 * The race day as a PDF, in the house style.
 *
 * The simulator's plan on paper: the distance and the target as a title and
 * a facts line, then the day's timeline, the splits, the fuelling, the
 * breakfast, the mental cues and the two checklists, each a ruled table or
 * a ruled list under a mono kicker. It was a Roboto document with black
 * table heads and a red race row; it now reads like the app, and prints in
 * ink alone.
 */

import type { Content, TableCell } from "pdfmake/interfaces";
import type { RacePlan } from "@/lib/raceSimulator";
import { getDistanceLabelEn } from "@/lib/raceSimulator";
import { formatSplitTime, formatPaceDisplay } from "@/lib/splits";
import i18n from "@/i18n";
import { pickLang } from "@/lib/i18n-utils";
import { triggerDownload } from "./download";
import { HAIR, INK, INK_2, createHouse, preparePdfMake, type House } from "./pdfHouse";

function t(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(`common:export.raceSimPdf.${key}`, opts);
}

/** A ruled list: a rule above, a hairline between two lines, a rule below. */
function ruledList(h: House, items: string[], size = 9): Content {
  const stack: Content[] = [h.rule(0.75, INK)];
  items.forEach((item, i) => {
    stack.push({ text: item, fontSize: size, color: INK, margin: [0, 5, 0, 5] });
    stack.push(i === items.length - 1 ? h.rule(0.75, INK) : h.rule(0.5, HAIR));
  });
  return { stack, margin: [0, 0, 0, 22] };
}

/** A kicker over a block. */
function section(h: House, label: string): Content {
  return h.kicker(label, { margin: [0, 0, 0, 6] }) as unknown as Content;
}

/** A ruled table with a mono head. */
function ruledTable(h: House, widths: (number | string)[], head: TableCell[], rows: TableCell[][]): Content {
  return {
    table: { headerRows: 1, widths, body: [head, ...rows] },
    layout: h.ruledLayout(rows.length, widths.length - 1),
    margin: [0, 0, 0, 22],
  } as unknown as Content;
}

/**
 * Export a race simulation plan as a PDF document.
 *
 * @param plan - The generated race plan
 * @param isEn - Use English language
 */
export async function exportRaceSimToPDF(plan: RacePlan, isEn: boolean): Promise<void> {
  const { pdfMake, fonts } = await preparePdfMake();
  const h = createHouse(fonts);

  const distanceLabel = isEn ? getDistanceLabelEn(plan.distanceKm) : plan.distanceLabel;
  const totalTimeFormatted = formatSplitTime(plan.targetTimeSeconds);
  const facts = t("targetPace", {
    pace: plan.paceFormatted,
    start: plan.startTime,
    finish: plan.estimatedFinishTime,
    total: totalTimeFormatted,
  })
    .split(" | ")
    .join("  ·  ");

  const content: Content[] = [
    { text: distanceLabel, bold: true, fontSize: 26, color: INK, lineHeight: 1, margin: [0, 16, 0, 8] },
    h.mono(facts, { fontSize: 8.5 }) as unknown as Content,
    h.rule(0.75, INK, [0, 16, 0, 18]),
  ];

  // ── Timeline ─────────────────────────────────────────────────────
  content.push(
    section(h, t("timeline")),
    ruledTable(
      h,
      [50, "*"],
      [h.headCell(t("timeCol")), h.headCell(t("eventCol"))],
      plan.timeline.map((event) => {
        const isRace = event.type === "race";
        return [
          h.mono(event.time, { bold: true, color: INK }) as TableCell,
          { text: pickLang(event, "label"), fontSize: 9, bold: isRace, color: INK },
        ];
      }),
    ),
  );

  // ── Splits ───────────────────────────────────────────────────────
  content.push(
    section(h, t("splitTable")),
    ruledTable(
      h,
      [30, 60, 70, 80, "*"],
      [
        h.headCell("#"),
        h.headCell(t("dist"), "right"),
        h.headCell(t("split"), "right"),
        h.headCell(t("paceCol"), "right"),
        h.headCell(t("cumul"), "right"),
      ],
      plan.splits.map((split) => [
        h.mono(`${split.index}`, { color: INK_2 }) as TableCell,
        h.mono(split.distance < 1 ? `${Math.round(split.distance * 1000)} m` : `${split.distance} km`, {
          alignment: "right",
          color: INK,
        }) as TableCell,
        h.mono(formatSplitTime(split.splitTimeSeconds), { alignment: "right", color: INK }) as TableCell,
        h.mono(`${formatPaceDisplay(split.paceMinPerKm)}/km`, { alignment: "right", color: INK }) as TableCell,
        h.mono(formatSplitTime(split.cumulativeTimeSeconds), { alignment: "right", bold: true, color: INK }) as TableCell,
      ]),
    ),
  );

  // ── Nutrition ────────────────────────────────────────────────────
  const { fuelingPlan } = plan;
  content.push(
    section(h, t("nutrition")),
    ruledList(h, [
      t("carbsSummary", { perHour: fuelingPlan.carbsPerHourG, total: fuelingPlan.totalCarbsG }),
      t("fluidsSummary", { perHour: fuelingPlan.fluidMlPerHour, total: fuelingPlan.totalFluidMl }),
      t("sodiumSummary", { perHour: fuelingPlan.sodiumMgPerHour }),
      t("gelsSummary", { count: fuelingPlan.gelCount, frequency: fuelingPlan.gelFrequencyMin }),
    ]),
  );

  if (fuelingPlan.timeline.length > 0) {
    content.push(
      section(h, t("fuelingTimeline")),
      ruledTable(
        h,
        [50, "*"],
        [h.headCell(t("minCol")), h.headCell(t("actionCol"))],
        fuelingPlan.timeline.map((cp) => [
          h.mono(`${Math.round(cp.timeMin)}'`, { bold: true, color: INK }) as TableCell,
          { text: pickLang(cp, "action"), fontSize: 9, color: INK },
        ]),
      ),
    );
  }

  if (fuelingPlan.tips.length > 0) {
    content.push(ruledList(h, fuelingPlan.tips.map((tip) => pickLang(tip, "text")), 8.5));
  }

  // ── Breakfast ────────────────────────────────────────────────────
  content.push(
    section(h, t("breakfast")),
    ruledList(h, [t("breakfastLine", { time: plan.breakfast.time, description: pickLang(plan.breakfast, "description") })]),
  );

  // ── Mental cues ──────────────────────────────────────────────────
  content.push(
    section(h, t("mentalCues")),
    ruledTable(
      h,
      [64, "*"],
      [h.headCell(t("segment")), h.headCell(t("cue"))],
      plan.mentalCues.map((cue) => [
        h.mono(`km ${cue.fromKm}-${cue.toKm}`, { bold: true, color: INK }) as TableCell,
        { text: pickLang(cue, "text"), fontSize: 9, color: INK },
      ]),
    ),
  );

  // ── Checklists ───────────────────────────────────────────────────
  if (plan.dayBeforeChecklist.length > 0) {
    content.push(
      section(h, t("dayBeforeChecklist")),
      ruledList(h, plan.dayBeforeChecklist.map((item) => pickLang(item, "text"))),
    );
  }
  if (plan.raceDayChecklist.length > 0) {
    content.push(
      section(h, t("raceDayChecklist")),
      ruledList(h, plan.raceDayChecklist.map((item) => pickLang(item, "text"))),
    );
  }

  const doc = h.doc(content, { title: t("racePlanTitle", { distance: distanceLabel }), kicker: t("kicker") });
  const blob = await pdfMake.createPdf(doc).getBlob();
  const slug = distanceLabel.toLowerCase().replace(/\s+/g, "-");
  triggerDownload(blob, t("filename", { slug }));
}
