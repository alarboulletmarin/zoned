/**
 * Plan ICS Export - Calendar format
 *
 * Creates calendar events for every session across all weeks of a training plan.
 */

import { createEvents, type EventAttributes } from "ics";
import type { TrainingPlan } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import { DAY_LABELS } from "@/lib/planGenerator/constants";

/**
 * Get the Monday of the week that contains the given date.
 * Monday = start of week (ISO convention).
 */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // Shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculate the date for a specific session given plan start Monday,
 * week number (1-based), and day of week (0=Mon ... 6=Sun).
 */
function getSessionDate(planMonday: Date, weekNumber: number, dayOfWeek: number): Date {
  const d = new Date(planMonday);
  d.setDate(d.getDate() + (weekNumber - 1) * 7 + dayOfWeek);
  return d;
}

/**
 * Export a training plan as ICS calendar file.
 * Creates one event per training session across all weeks.
 */
export function exportPlanToICS(
  plan: TrainingPlan,
  workoutNames: Record<string, string>,
  isEn: boolean,
): void {
  const planMonday = getMondayOfWeek(new Date(plan.config.createdAt));
  const dayLabels = isEn ? DAY_LABELS.en : DAY_LABELS.fr;

  const events: EventAttributes[] = [];

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      const sessionDate = getSessionDate(planMonday, week.weekNumber, session.dayOfWeek);
      const isRaceDay = session.workoutId === "__race_day__";

      if (isRaceDay) {
        // Race day: all-day event
        const raceName = plan.config.raceName
          || (isEn ? RACE_DISTANCE_META[plan.config.raceDistance].labelEn : RACE_DISTANCE_META[plan.config.raceDistance].label);

        events.push({
          start: [
            sessionDate.getFullYear(),
            sessionDate.getMonth() + 1,
            sessionDate.getDate(),
          ],
          end: [
            sessionDate.getFullYear(),
            sessionDate.getMonth() + 1,
            sessionDate.getDate(),
          ],
          title: `[Zoned] ${isEn ? "Race Day" : "Jour de course"} - ${raceName}`,
          description: plan.raceTimePrediction
            ? `${isEn ? "Target time" : "Temps cible"}: ${plan.raceTimePrediction}`
            : "",
          categories: ["Running", "Race"],
          status: "CONFIRMED" as const,
          busyStatus: "BUSY" as const,
          productId: "zoned-app",
        });
      } else {
        // Regular training session: timed event at 07:00
        const workoutName = workoutNames[session.workoutId] || session.workoutId;
        const dayLabel = dayLabels[session.dayOfWeek];
        const weekLabel = isEn
          ? (week.weekLabelEn || `W${week.weekNumber}`)
          : (week.weekLabel || `S${week.weekNumber}`);

        const descriptionLines: string[] = [];
        descriptionLines.push(`${isEn ? "Week" : "Semaine"}: ${weekLabel}`);
        descriptionLines.push(`${isEn ? "Day" : "Jour"}: ${dayLabel}`);
        descriptionLines.push(`${isEn ? "Duration" : "Duree"}: ${session.estimatedDurationMin} min`);
        if (session.isKeySession) {
          descriptionLines.push(isEn ? "Key session" : "Seance cle");
        }
        const notes = isEn ? session.notesEn : session.notes;
        if (notes) {
          descriptionLines.push("");
          descriptionLines.push(notes);
        }

        const hours = Math.floor(session.estimatedDurationMin / 60);
        const minutes = session.estimatedDurationMin % 60;

        events.push({
          start: [
            sessionDate.getFullYear(),
            sessionDate.getMonth() + 1,
            sessionDate.getDate(),
            7, // Default 07:00
            0,
          ],
          duration: { hours, minutes },
          title: `[Zoned] ${workoutName}`,
          description: descriptionLines.join("\n"),
          categories: ["Running", "Workout", session.sessionType],
          status: "CONFIRMED" as const,
          busyStatus: "BUSY" as const,
          productId: "zoned-app",
        });
      }
    }
  }

  if (events.length === 0) return;

  const { error, value } = createEvents(events);

  if (error || !value) {
    throw new Error(error?.message || "Failed to create ICS events");
  }

  // Trigger download
  const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plan-${plan.config.raceDistance}-${plan.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
