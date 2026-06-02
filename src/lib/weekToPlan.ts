/**
 * Bridge "Ma semaine" → the training-plan model (Epic #83 — architecture pass).
 *
 * A standalone week is stored and edited as a 1-week "free" plan (config flag
 * `isSingleWeek`). This lets the weekly planner reuse the whole plan editor —
 * drag-and-drop reschedule, the workout picker, move/swap/delete — instead of
 * reinventing it. The 80/20 generator simply fills that single week's sessions.
 */

import { createFreePlan } from "@/lib/createFreePlan";
import { getAnyWorkoutDuration, getDrawDiscipline } from "@/lib/workoutFilters";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { Discipline, SessionType, AnyWorkoutTemplate } from "@/types";
import type { TrainingPlan, PlanSession } from "@/types/plan";
import type { GeneratedWeek, SlotKind } from "@/types/week";

function sessionTypeFor(kind: SlotKind, w: AnyWorkoutTemplate): SessionType {
  if (isStrengthWorkout(w)) return "strength";
  if (kind === "long") return "long_run";
  if (kind === "quality") {
    const z = getDominantZone(w);
    if (z >= 5) return "vo2max";
    if (z === 4) return "threshold";
    return "tempo";
  }
  return "endurance";
}

function disciplineFor(w: AnyWorkoutTemplate): Discipline | undefined {
  const d = getDrawDiscipline(w);
  return d === "cycling" || d === "swimming" ? d : d === "running" ? "running" : undefined;
}

/** An empty single-week plan (the "from scratch" path). */
export function createEmptyWeekPlan(name: string): TrainingPlan {
  const plan = createFreePlan(name, 1, undefined, { daysPerWeek: 4 });
  plan.config.isSingleWeek = true;
  return plan;
}

/** A single-week plan pre-filled from a generated 80/20 week. */
export function createWeekPlanFromGenerated(
  name: string,
  week: GeneratedWeek,
): TrainingPlan {
  const plan = createFreePlan(name, 1, undefined, {
    daysPerWeek: week.settings.sessions,
  });
  plan.config.isSingleWeek = true;
  plan.config.longRunDay = week.settings.longRunDay;

  const sessions: PlanSession[] = week.slots
    .filter((s) => s.workout)
    .map((s) => {
      const w = s.workout!;
      return {
        dayOfWeek: s.day,
        workoutId: w.id,
        discipline: disciplineFor(w),
        sessionType: sessionTypeFor(s.kind, w),
        isKeySession: s.kind !== "easy",
        estimatedDurationMin: getAnyWorkoutDuration(w),
      };
    })
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  plan.weeks[0].sessions = sessions;
  return plan;
}
