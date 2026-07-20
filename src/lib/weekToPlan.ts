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
import type { TrainingPlan, PlanSession, PlanWeek } from "@/types/plan";
import type { DayIndex, GeneratedWeek, SlotKind, WeekSlot } from "@/types/week";
import type { PrebuiltWeek } from "@/data/prebuilt-weeks/types";

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

/** Map a session type back to a coarse slot kind (for stats / rhythm colour). */
function kindForSessionType(type: SessionType): SlotKind {
  if (type === "long_run") return "long";
  if (
    type === "tempo" ||
    type === "threshold" ||
    type === "vo2max" ||
    type === "speed" ||
    type === "hills" ||
    type === "fartlek" ||
    type === "race_specific"
  ) {
    return "quality";
  }
  return "easy";
}

function disciplineFor(w: AnyWorkoutTemplate): Discipline | undefined {
  const d = getDrawDiscipline(w);
  return d === "cycling" || d === "swimming" ? d : d === "running" ? "running" : undefined;
}

/** Generated 80/20 week → plan sessions for a single week. */
export function generatedWeekToSessions(week: GeneratedWeek): PlanSession[] {
  return week.slots
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
      } satisfies PlanSession;
    })
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

/**
 * Resolve a plan week's sessions back to WeekSlot[] (Mon→Sun) using a workout
 * lookup, so the existing computeWeekStats / gauge / rhythm work directly on a
 * stored week — whether it was generated or built by hand.
 *
 * Emits one slot **per session** — a day with several sessions yields several
 * slots (so stats count every session) — plus a rest slot for empty days.
 */
export function planWeekToSlots(
  planWeek: PlanWeek | undefined,
  byId: Map<string, AnyWorkoutTemplate>,
): WeekSlot[] {
  const slots: WeekSlot[] = [];
  const daysWithSession = new Set<number>();
  for (const s of planWeek?.sessions ?? []) {
    daysWithSession.add(s.dayOfWeek);
    slots.push({
      day: s.dayOfWeek as DayIndex,
      kind: kindForSessionType(s.sessionType),
      workout: byId.get(s.workoutId) ?? null,
      locked: false,
    });
  }
  for (let day = 0 as DayIndex; day <= 6; day = (day + 1) as DayIndex) {
    if (!daysWithSession.has(day)) {
      slots.push({ day, kind: "rest", workout: null, locked: false });
    }
  }
  // Stable sort: intra-day session order is preserved.
  return slots.sort((a, b) => a.day - b.day);
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
  plan.weeks[0].sessions = generatedWeekToSessions(week);
  return plan;
}

/**
 * A single-week plan pre-filled from a curated {@link PrebuiltWeek}. Reuses the
 * empty-week scaffolding (id, config flag, single week) and fills the sessions
 * straight from the authored data — the `why` lines are editorial only and not
 * carried into the editable plan.
 */
export function prebuiltWeekToPlan(week: PrebuiltWeek, name?: string): TrainingPlan {
  const plan = createEmptyWeekPlan(name ?? week.name);
  plan.config.longRunDay = week.settings.longRunDay;
  plan.config.daysPerWeek = week.settings.sessions;
  plan.config.weekCategory = week.category;
  plan.weeks[0].sessions = week.sessions
    .map(
      (s): PlanSession => ({
        dayOfWeek: s.dayOfWeek,
        workoutId: s.workoutId,
        sessionType: s.sessionType,
        isKeySession: s.isKeySession,
        estimatedDurationMin: s.estimatedDurationMin,
      }),
    )
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  return plan;
}
