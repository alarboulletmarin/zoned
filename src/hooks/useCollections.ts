import { useState, useEffect } from "react";
import type { Collection } from "@/data/collections/types";
import type { WorkoutTemplate } from "@/types";
import { getAllCollections, getCollectionBySlug } from "@/data/collections";
import { loadAllWorkouts } from "@/data/workouts";

// ============================================================
// Hook Interfaces
// ============================================================

interface UseCollectionResult {
  collection: Collection | null;
  workouts: WorkoutTemplate[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================================
// Hooks
// ============================================================

/**
 * Hook to get all collections (lightweight, synchronous)
 * Collections data is ~3KB and already imported, no async needed
 */
export function useCollections(): Collection[] {
  return getAllCollections();
}

/**
 * Hook to get a single collection by slug with its resolved workouts
 * Returns collection metadata immediately, then loads workouts asynchronously
 * Preserves the order of workoutIds (important for progression collections)
 */
export function useCollection(slug: string | undefined): UseCollectionResult {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Collection metadata is synchronous
  const collection = slug ? getCollectionBySlug(slug) ?? null : null;

  useEffect(() => {
    if (!slug || !collection) {
      setWorkouts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    loadAllWorkouts()
      .then((allWorkouts) => {
        if (!cancelled) {
          // Build a lookup map for O(1) access
          const workoutMap = new Map<string, WorkoutTemplate>(
            allWorkouts.map((w) => [w.id, w])
          );

          // Resolve workouts in the order defined by workoutIds
          const resolved = collection.workoutIds
            .map((id) => workoutMap.get(id))
            .filter((w): w is WorkoutTemplate => w !== undefined);

          setWorkouts(resolved);
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
  }, [slug, collection]);

  return { collection, workouts, isLoading, error };
}
