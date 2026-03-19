import type { TrainingPlan } from "@/types/plan";

const STORAGE_KEY = "zoned-plans";
const MAX_PLANS = 5;

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

export function getPlanCount(): number {
  return getAllPlans().length;
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
