import type { TrainingPlan, PlanSession } from "@/types/plan";
import type { SessionType, WorkoutCategory } from "@/types";
import { getWorkoutById } from "@/data/workouts";

const STORAGE_KEY = "zoned-plans";
const MAX_PLANS = 5;

function mapCategoryToSessionType(category: WorkoutCategory): SessionType {
  const map: Record<string, SessionType> = {
    recovery: "recovery",
    endurance: "endurance",
    tempo: "tempo",
    threshold: "threshold",
    vma_intervals: "vo2max",
    long_run: "long_run",
    hills: "hills",
    fartlek: "fartlek",
    race_pace: "race_specific",
    mixed: "endurance",
    assessment: "endurance",
  };
  return map[category] || "endurance";
}

export function getAllPlans(): TrainingPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TrainingPlan[];
  } catch {
    return [];
  }
}

export function getPlan(id: string): TrainingPlan | undefined {
  return getAllPlans().find(p => p.id === id);
}

export function getPlanCount(): number {
  return getAllPlans().length;
}

/**
 * Import a plan from JSON. Generates a new ID to avoid conflicts.
 * Returns the new plan ID on success, null on failure.
 */
export function importPlan(json: string): string | null {
  try {
    const plan = JSON.parse(json) as TrainingPlan;

    // Basic validation
    if (
      !plan.weeks || !Array.isArray(plan.weeks) || plan.weeks.length === 0 ||
      !plan.config || typeof plan.totalWeeks !== "number"
    ) {
      return null;
    }

    // Check plan limit
    if (getPlanCount() >= MAX_PLANS) {
      return null;
    }

    // Generate new ID to avoid conflicts
    const newId = crypto.randomUUID();
    plan.id = newId;
    plan.config.id = newId;
    plan.config.createdAt = new Date().toISOString();

    savePlan(plan);
    return newId;
  } catch {
    return null;
  }
}

export function savePlan(plan: TrainingPlan): void {
  const plans = getAllPlans();
  const existing = plans.findIndex(p => p.id === plan.id);
  if (existing >= 0) {
    plans[existing] = plan;
  } else {
    if (plans.length >= MAX_PLANS) {
      throw new Error(`Maximum ${MAX_PLANS} plans. Supprimez un plan existant.`);
    }
    plans.push(plan);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function deletePlan(id: string): void {
  const plans = getAllPlans().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function moveSession(
  planId: string,
  fromWeekNumber: number,
  fromSessionIndex: number,
  toWeekNumber: number,
  toDay: number,
): boolean {
  const plans = getAllPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) return false;

  const fromWeek = plan.weeks.find(w => w.weekNumber === fromWeekNumber);
  if (!fromWeek) return false;

  const session = fromWeek.sessions[fromSessionIndex];
  if (!session) return false;

  // Remove from source week
  fromWeek.sessions.splice(fromSessionIndex, 1);

  // Update day
  session.dayOfWeek = toDay;

  // Add to target week
  if (toWeekNumber === fromWeekNumber) {
    fromWeek.sessions.push(session);
    fromWeek.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  } else {
    const toWeek = plan.weeks.find(w => w.weekNumber === toWeekNumber);
    if (!toWeek) return false;
    toWeek.sessions.push(session);
    toWeek.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  savePlan(plan);
  return true;
}

export function deleteSessionFromPlan(
  planId: string,
  weekNumber: number,
  sessionIndex: number,
): boolean {
  const plans = getAllPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) return false;

  const week = plan.weeks.find(w => w.weekNumber === weekNumber);
  if (!week) return false;

  if (sessionIndex < 0 || sessionIndex >= week.sessions.length) return false;

  week.sessions.splice(sessionIndex, 1);
  savePlan(plan);
  return true;
}

export function updatePlanSession(
  planId: string,
  weekNumber: number,
  sessionIndex: number,
  newWorkoutId: string,
): boolean {
  const plans = getAllPlans();
  const planIdx = plans.findIndex(p => p.id === planId);
  if (planIdx === -1) return false;

  const plan = plans[planIdx];
  const week = plan.weeks.find(w => w.weekNumber === weekNumber);
  if (!week || sessionIndex >= week.sessions.length) return false;

  week.sessions[sessionIndex].workoutId = newWorkoutId;
  plans[planIdx] = plan;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

// ── Session completion tracking ───────────────────────────────────

export interface SessionCompletionData {
  status: "planned" | "completed" | "skipped";
  completedAt?: string;
  actualDurationMin?: number;
  actualDistanceKm?: number;
  rpe?: number; // 1-10
}

export function updateSessionCompletion(
  planId: string,
  weekNumber: number,
  sessionIndex: number,
  completion: SessionCompletionData,
): boolean {
  const plans = getAllPlans();
  const planIdx = plans.findIndex(p => p.id === planId);
  if (planIdx === -1) return false;

  const plan = plans[planIdx];
  const week = plan.weeks.find(w => w.weekNumber === weekNumber);
  if (!week || sessionIndex < 0 || sessionIndex >= week.sessions.length) return false;

  const session = week.sessions[sessionIndex];
  session.status = completion.status;
  session.completedAt = completion.completedAt;
  session.actualDurationMin = completion.actualDurationMin;
  session.actualDistanceKm = completion.actualDistanceKm;
  session.rpe = completion.rpe;

  plans[planIdx] = plan;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

export async function addSessionToPlan(
  planId: string,
  weekNumber: number,
  workoutId: string,
  dayOfWeek: number,
): Promise<boolean> {
  const plans = getAllPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) return false;

  const week = plan.weeks.find(w => w.weekNumber === weekNumber);
  if (!week) return false;

  const newSession: PlanSession = {
    dayOfWeek,
    workoutId,
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
  };

  const workout = await getWorkoutById(workoutId);
  if (workout) {
    newSession.sessionType = mapCategoryToSessionType(workout.category);
    newSession.estimatedDurationMin = workout.typicalDuration?.min || 45;
    newSession.isKeySession = ["threshold", "vma_intervals", "tempo"].includes(workout.category);
  }

  week.sessions.push(newSession);
  week.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  savePlan(plan);
  return true;
}

// ── Cross-training ──────────────────────────────────────────────────

import type { CrossTrainingSession } from "@/types/plan";

export function addCrossTraining(
  planId: string,
  weekNumber: number,
  session: CrossTrainingSession
): boolean {
  const plan = getPlan(planId);
  if (!plan) return false;
  const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week) return false;
  if (!week.crossTraining) week.crossTraining = [];
  week.crossTraining.push(session);
  week.crossTraining.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  savePlan(plan);
  return true;
}

export function deleteCrossTraining(
  planId: string,
  weekNumber: number,
  sessionId: string
): boolean {
  const plan = getPlan(planId);
  if (!plan) return false;
  const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week?.crossTraining) return false;
  week.crossTraining = week.crossTraining.filter((s) => s.id !== sessionId);
  savePlan(plan);
  return true;
}
