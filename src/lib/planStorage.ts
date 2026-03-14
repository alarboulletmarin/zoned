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
