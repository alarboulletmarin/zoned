import { useState, useEffect, useCallback } from "react";
import type { TrainingPlan, AssistedPlanConfig } from "@/types/plan";
import { getAllPlans, getPlan, savePlan, deletePlan } from "@/lib/planStorage";
import { generatePlan } from "@/lib/planGenerator";
import { AppFailure, failureReason, type FailureReason } from "@/lib/failure";

/**
 * Hook to get all saved plans.
 */
export function usePlans() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setPlans(getAllPlans());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = useCallback((id: string) => {
    deletePlan(id);
    reload();
  }, [reload]);

  return { plans, isLoading, remove, reload };
}

/**
 * Hook to get a single plan by ID.
 */
export function usePlan(id: string | undefined) {
  const [plan, setPlan] = useState<TrainingPlan | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    if (!id) {
      setPlan(undefined);
      setIsLoading(false);
      return;
    }
    setPlan(getPlan(id));
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { plan, isLoading, reload };
}

/**
 * Hook for creating a new plan.
 */
export function useCreatePlan() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<FailureReason | null>(null);

  const createPlan = useCallback(async (config: AssistedPlanConfig): Promise<TrainingPlan> => {
    setIsGenerating(true);
    setError(null);
    try {
      const plan = await generatePlan(config);
      const saved = savePlan(plan);
      if (!saved.ok) throw new AppFailure(saved.reason);
      return plan;
    } catch (err) {
      // The reason, not a sentence: the summary step puts it into words in
      // the user's language, next to what is intact and what to do.
      setError(failureReason(err));
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { createPlan, isGenerating, error };
}
