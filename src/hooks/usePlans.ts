import { useState, useEffect, useCallback } from "react";
import type { TrainingPlan, AssistedPlanConfig } from "@/types/plan";
import { getAllPlans, getPlan, savePlan, deletePlan } from "@/lib/planStorage";
import { generatePlan } from "@/lib/planGenerator";

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
  const [error, setError] = useState<string | null>(null);

  const createPlan = useCallback(async (config: AssistedPlanConfig): Promise<TrainingPlan> => {
    setIsGenerating(true);
    setError(null);
    try {
      const plan = await generatePlan(config);
      savePlan(plan);
      return plan;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la génération du plan";
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { createPlan, isGenerating, error };
}
