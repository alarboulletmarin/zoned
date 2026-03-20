import { useState, useEffect, useMemo } from "react";
import type { WorkoutTemplate, WorkoutCategory } from "@/types";
import {
  loadAllWorkouts,
  loadCategory,
  getWorkoutByIdAsync,
  getRelatedWorkoutsAsync,
  getWorkoutOfTheDayAsync,
  getAllWorkoutsSync,
  isAllWorkoutsLoaded,
} from "@/data/workouts";
import { getCustomWorkouts } from "@/lib/customWorkoutStorage";

interface UseWorkoutsResult {
  workouts: WorkoutTemplate[];
  isLoading: boolean;
  error: Error | null;
}

interface UseWorkoutResult {
  workout: WorkoutTemplate | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseWorkoutOfTheDayResult {
  workout: WorkoutTemplate | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseCategoryWorkoutsResult {
  workouts: WorkoutTemplate[];
  isLoading: boolean;
  error: Error | null;
}

interface UseRelatedWorkoutsResult {
  workouts: WorkoutTemplate[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to load all workouts lazily
 * Returns workouts from cache immediately if available, otherwise loads asynchronously
 */
function mergeWithCustom(workouts: WorkoutTemplate[]): WorkoutTemplate[] {
  const custom = getCustomWorkouts();
  if (custom.length === 0) return workouts;
  return [...workouts, ...custom];
}

export function useWorkouts(): UseWorkoutsResult {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>(() =>
    mergeWithCustom(getAllWorkoutsSync())
  );
  const [isLoading, setIsLoading] = useState(!isAllWorkoutsLoaded());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isAllWorkoutsLoaded()) {
      setWorkouts(mergeWithCustom(getAllWorkoutsSync()));
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    loadAllWorkouts()
      .then((data) => {
        if (!cancelled) {
          setWorkouts(mergeWithCustom(data));
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

/**
 * Hook to load a single workout by ID
 */
export function useWorkout(id: string | undefined): UseWorkoutResult {
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setWorkout(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getWorkoutByIdAsync(id)
      .then((data) => {
        if (!cancelled) {
          setWorkout(data || null);
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
  }, [id]);

  return { workout, isLoading, error };
}

/**
 * Hook to load workouts by category
 */
export function useCategoryWorkouts(
  category: WorkoutCategory | null
): UseCategoryWorkoutsResult {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!category) {
      setWorkouts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    loadCategory(category)
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
  }, [category]);

  return { workouts, isLoading, error };
}

/**
 * Hook to get workout of the day
 */
export function useWorkoutOfTheDay(): UseWorkoutOfTheDayResult {
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    getWorkoutOfTheDayAsync()
      .then((data) => {
        if (!cancelled) {
          setWorkout(data);
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

  return { workout, isLoading, error };
}

/**
 * Hook to get related workouts (variations)
 */
export function useRelatedWorkouts(
  workout: WorkoutTemplate | null
): UseRelatedWorkoutsResult {
  const [relatedWorkouts, setRelatedWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workout || workout.variationIds.length === 0) {
      setRelatedWorkouts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getRelatedWorkoutsAsync(workout)
      .then((data) => {
        if (!cancelled) {
          setRelatedWorkouts(data);
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
  }, [workout]);

  return { workouts: relatedWorkouts, isLoading, error };
}

/**
 * Hook to filter workouts with memoization
 * This is useful when you need to filter the loaded workouts
 */
export function useFilteredWorkouts(
  filterFn: (workouts: WorkoutTemplate[]) => WorkoutTemplate[]
): UseWorkoutsResult {
  const { workouts: allWorkouts, isLoading, error } = useWorkouts();

  const filteredWorkouts = useMemo(() => {
    if (isLoading || error) return [];
    return filterFn(allWorkouts);
  }, [allWorkouts, isLoading, error, filterFn]);

  return {
    workouts: filteredWorkouts,
    isLoading,
    error,
  };
}
