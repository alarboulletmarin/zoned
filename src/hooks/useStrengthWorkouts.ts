import { useState, useEffect } from "react";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import {
  loadAllStrengthSessions,
  getAllStrengthSessionsSync,
  isStrengthLoaded,
} from "@/data/strength";

interface UseStrengthWorkoutsResult {
  workouts: StrengthWorkoutTemplate[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to load all strength workouts lazily.
 * Returns workouts from cache immediately if available, otherwise loads asynchronously.
 * Mirrors the pattern from useWorkouts.ts for running workouts.
 */
export function useStrengthWorkouts(): UseStrengthWorkoutsResult {
  const [workouts, setWorkouts] = useState<StrengthWorkoutTemplate[]>(
    () => getAllStrengthSessionsSync()
  );
  const [isLoading, setIsLoading] = useState(!isStrengthLoaded());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isStrengthLoaded()) {
      setWorkouts(getAllStrengthSessionsSync());
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    loadAllStrengthSessions()
      .then((data) => {
        if (!cancelled) {
          setWorkouts(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { workouts, isLoading, error };
}
