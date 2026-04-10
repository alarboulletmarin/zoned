/**
 * Plan ICS Export - Calendar format
 *
 * Creates calendar events for every session across all weeks of a training plan.
 */

import { createEvents, type EventAttributes } from "ics";
import type { TrainingPlan } from "@/types/plan";
import type { WorkoutTemplate, AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
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
 * Uses each session's dayOfWeek directly for calendar placement.
 */
export function exportPlanToICS(
  plan: TrainingPlan,
  workoutNames: Record<string, string>,
  workoutTemplates: Record<string, WorkoutTemplate>,
  isEn: boolean,
): void {
  const planMonday = getMondayOfWeek(new Date(plan.config.startDate || plan.config.createdAt));
  const dayLabels = isEn ? DAY_LABELS.en : DAY_LABELS.fr;

  const events: EventAttributes[] = [];

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      const sessionDate = getSessionDate(planMonday, week.weekNumber, session.dayOfWeek);
      const isRaceDay = session.workoutId === "__race_day__";

      if (isRaceDay) {
        // Race day: all-day event
        const raceDistMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
        const raceName = plan.config.raceName
          || (raceDistMeta ? (isEn ? raceDistMeta.labelEn : raceDistMeta.label) : (isEn ? "Race" : "Course"));

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
          title: `${isEn ? "Race Day" : "Jour de course"} - ${raceName}`,
          description: plan.raceTimePrediction
            ? `${isEn ? "Target time" : "Temps cible"}: ${plan.raceTimePrediction}`
            : "",
          categories: ["Running", "Race"],
          status: "CONFIRMED" as const,
          transp: "TRANSPARENT" as const,
          productId: "zoned-app",
        });
      } else {
        // Regular training session: all-day event
        const workoutName = workoutNames[session.workoutId] || session.workoutId;
        const dayLabel = dayLabels[session.dayOfWeek];
        const weekLabel = isEn
          ? (week.weekLabelEn || `W${week.weekNumber}`)
          : (week.weekLabel || `S${week.weekNumber}`);

        const descriptionLines: string[] = [];
        descriptionLines.push(`${isEn ? "Week" : "Semaine"}: ${weekLabel}`);
        descriptionLines.push(`${isEn ? "Day" : "Jour"}: ${dayLabel}`);
        descriptionLines.push(`${isEn ? "Duration" : "Durée"}: ${session.estimatedDurationMin} min`);
        if (session.isKeySession) {
          descriptionLines.push(isEn ? "Key session" : "Séance clé");
        }
        const notes = isEn ? session.notesEn : session.notes;
        if (notes) {
          descriptionLines.push("");
          descriptionLines.push(notes);
        }

        const template = workoutTemplates[session.workoutId] as AnyWorkoutTemplate | undefined;
        const isStrength = template ? isStrengthWorkout(template) : false;
        const primaryZone = template && !isStrength ? `Z${getDominantZone(template as WorkoutTemplate)}` : "";
        const zoneTag = primaryZone ? ` [${primaryZone}]` : isStrength ? " [Renfo]" : "";

        if (template && isStrength) {
          const str = template as StrengthWorkoutTemplate;
          const desc = isEn ? (str.descriptionEn || str.description) : str.description;
          descriptionLines.push("");
          descriptionLines.push(desc);

          // Coaching tips
          const tips = isEn ? str.coachingTipsEn : str.coachingTips;
          if (tips?.length) {
            descriptionLines.push("");
            descriptionLines.push(isEn ? "--- Tips ---" : "--- Conseils ---");
            for (const tip of tips) {
              descriptionLines.push(`• ${tip}`);
            }
          }
        } else if (template && !isStrength) {
          const running = template as WorkoutTemplate;
          const desc = isEn ? (running.descriptionEn || running.description) : running.description;
          descriptionLines.push("");
          descriptionLines.push(desc);

          // Warmup
          if (running.warmupTemplate?.length) {
            descriptionLines.push("");
            descriptionLines.push(isEn ? "--- Warm-up ---" : "--- Échauffement ---");
            for (const block of running.warmupTemplate) {
              const blockDesc = isEn ? (block.descriptionEn || block.description) : block.description;
              const dur = block.durationMin ? ` (${block.durationMin}min)` : "";
              const zone = block.zone ? ` [${block.zone}]` : "";
              descriptionLines.push(`• ${blockDesc}${dur}${zone}`);
            }
          }

          // Main set
          if (running.mainSetTemplate?.length) {
            descriptionLines.push("");
            descriptionLines.push(isEn ? "--- Main set ---" : "--- Corps de séance ---");
            for (const block of running.mainSetTemplate) {
              const blockDesc = isEn ? (block.descriptionEn || block.description) : block.description;
              const dur = block.durationMin ? ` (${block.durationMin}min)` : "";
              const zone = block.zone ? ` [${block.zone}]` : "";
              const reps = block.repetitions && block.repetitions > 1 ? `${block.repetitions}x ` : "";
              const rest = block.rest || block.recovery;
              const restStr = rest ? ` — ${isEn ? "rest" : "récup"}: ${rest}` : "";
              descriptionLines.push(`• ${reps}${blockDesc}${dur}${zone}${restStr}`);
            }
          }

          // Cooldown
          if (running.cooldownTemplate?.length) {
            descriptionLines.push("");
            descriptionLines.push(isEn ? "--- Cool-down ---" : "--- Retour au calme ---");
            for (const block of running.cooldownTemplate) {
              const blockDesc = isEn ? (block.descriptionEn || block.description) : block.description;
              const dur = block.durationMin ? ` (${block.durationMin}min)` : "";
              const zone = block.zone ? ` [${block.zone}]` : "";
              descriptionLines.push(`• ${blockDesc}${dur}${zone}`);
            }
          }

          // Coaching tips
          const tips = isEn ? running.coachingTipsEn : running.coachingTips;
          if (tips?.length) {
            descriptionLines.push("");
            descriptionLines.push(isEn ? "--- Tips ---" : "--- Conseils ---");
            for (const tip of tips) {
              descriptionLines.push(`• ${tip}`);
            }
          }
        }

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
          title: `${workoutName} - ${session.estimatedDurationMin}min${zoneTag}`,
          description: descriptionLines.join("\n"),
          categories: [isStrength ? "Strength" : "Running", "Workout", session.sessionType],
          status: "CONFIRMED" as const,
          transp: "TRANSPARENT" as const,
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
  link.download = `plan-${plan.config.raceDistance ?? "free"}-${plan.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
