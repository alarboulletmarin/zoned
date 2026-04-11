/**
 * ICS Export - Calendar format
 *
 * Creates calendar events from workout templates
 */

import { createEvent, type EventAttributes } from "ics";
import type { WorkoutTemplate } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";
import i18n from "@/i18n";
import { isEnglish, pickLang } from "@/lib/i18n-utils";

/**
 * Formats workout blocks into a readable description for calendar events
 */
function formatWorkoutDescription(workout: WorkoutTemplate): string {
  const lines: string[] = [];
  const t = (key: string) => i18n.t(`common:export.ics.${key}`);

  // Description
  lines.push(pickLang(workout, "description"));
  lines.push("");

  // Structure
  lines.push(t("warmupSep"));
  for (const block of workout.warmupTemplate) {
    lines.push(`- ${pickLang(block, "description")}`);
  }
  lines.push("");

  lines.push(t("mainSetSep"));
  for (const block of workout.mainSetTemplate) {
    const zone = block.zone ? ` (${block.zone})` : "";
    lines.push(`- ${pickLang(block, "description")}${zone}`);
  }
  lines.push("");

  lines.push(t("cooldownSep"));
  for (const block of workout.cooldownTemplate) {
    lines.push(`- ${pickLang(block, "description")}`);
  }
  lines.push("");

  // Tips (array, keep isEn)
  const tips = isEnglish() ? workout.coachingTipsEn : workout.coachingTips;
  if (tips.length > 0) {
    lines.push(t("tipsSep"));
    for (const tip of tips) {
      lines.push(`- ${tip}`);
    }
  }

  return lines.join("\n");
}

/**
 * Export workout to ICS calendar format
 *
 * @param workout - The workout template to export
 * @param startDateTime - When the workout should be scheduled
 * @param isEn - Use English language
 * @returns Promise that resolves when download is triggered
 */
export async function exportToICS(
  workout: WorkoutTemplate,
  startDateTime: Date,
): Promise<void> {
  const durationMinutes = getWorkoutDuration(workout);
  const title = pickLang(workout, "name");
  const description = formatWorkoutDescription(workout);

  const event: EventAttributes = {
    start: [
      startDateTime.getFullYear(),
      startDateTime.getMonth() + 1, // ics uses 1-indexed months
      startDateTime.getDate(),
      startDateTime.getHours(),
      startDateTime.getMinutes(),
    ],
    duration: { minutes: durationMinutes },
    title: `[Zoned] ${title}`,
    description,
    categories: ["Running", "Workout", workout.category],
    status: "CONFIRMED",
    busyStatus: "BUSY",
    productId: "zoned-app",
  };

  return new Promise((resolve, reject) => {
    createEvent(event, (error, value) => {
      if (error) {
        reject(error);
        return;
      }

      // Trigger download
      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${workout.id}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      resolve();
    });
  });
}
