/**
 * ICS Export - Calendar format
 *
 * Creates calendar events from workout templates
 */

import { createEvent, type EventAttributes } from "ics";
import type { WorkoutTemplate } from "@/types";
import { getEstimatedDuration } from "@/types";

/**
 * Formats workout blocks into a readable description for calendar events
 */
function formatWorkoutDescription(workout: WorkoutTemplate, isEn: boolean): string {
  const lines: string[] = [];

  // Description
  lines.push(isEn ? workout.descriptionEn : workout.description);
  lines.push("");

  // Structure
  lines.push(isEn ? "=== WARMUP ===" : "=== ECHAUFFEMENT ===");
  for (const block of workout.warmupTemplate) {
    const desc = isEn && block.descriptionEn ? block.descriptionEn : block.description;
    lines.push(`- ${desc}`);
  }
  lines.push("");

  lines.push(isEn ? "=== MAIN SET ===" : "=== CORPS DE SEANCE ===");
  for (const block of workout.mainSetTemplate) {
    const desc = isEn && block.descriptionEn ? block.descriptionEn : block.description;
    const zone = block.zone ? ` (${block.zone})` : "";
    lines.push(`- ${desc}${zone}`);
  }
  lines.push("");

  lines.push(isEn ? "=== COOLDOWN ===" : "=== RETOUR AU CALME ===");
  for (const block of workout.cooldownTemplate) {
    const desc = isEn && block.descriptionEn ? block.descriptionEn : block.description;
    lines.push(`- ${desc}`);
  }
  lines.push("");

  // Tips
  const tips = isEn ? workout.coachingTipsEn : workout.coachingTips;
  if (tips.length > 0) {
    lines.push(isEn ? "=== TIPS ===" : "=== CONSEILS ===");
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
  isEn: boolean
): Promise<void> {
  const durationMinutes = getEstimatedDuration(workout);
  const title = isEn ? workout.nameEn : workout.name;
  const description = formatWorkoutDescription(workout, isEn);

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
