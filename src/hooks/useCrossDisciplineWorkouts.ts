import { useEffect, useState } from "react";
import type { Discipline, WorkoutTemplate } from "@/types";
import { loadDisciplineWorkouts } from "@/data/workouts";

type CrossDiscipline = Exclude<Discipline, "running">;

interface UseCrossDisciplineWorkoutsResult {
  workouts: WorkoutTemplate[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Lazy loader for cycling and swimming workout libraries. Mirrors the shape
 * of {@link useWorkouts} so LibraryPage and similar consumers can swap it in
 * behind an activity-type switch without extra plumbing.
 */
export function useCrossDisciplineWorkouts(
  discipline: CrossDiscipline,
  options: { enabled?: boolean } = {},
): UseCrossDisciplineWorkoutsResult {
  const { enabled = true } = options;
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // `enabled: false` postpones the fetch until the caller flips it (used
    // by HomePage to keep these chunks out of the LCP window).
    if (!enabled) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loadDisciplineWorkouts(discipline)
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
  }, [discipline, enabled]);

  return { workouts, isLoading, error };
}
