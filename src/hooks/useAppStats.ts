import { useEffect, useState } from "react";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getAllCollections } from "@/data/collections";
import { articleMetadata } from "@/data/articles";
import { loadAllWorkouts, loadDisciplineWorkouts } from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";

const ZONES = 6;

export type AppStats = {
  workouts: number;
  calculators: number;
  plans: number;
  collections: number;
  articles: number;
  zones: number;
};

export function useAppStats(): AppStats {
  const [workouts, setWorkouts] = useState(0);
  const [calculators, setCalculators] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadAllWorkouts(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
      loadAllStrengthSessions(),
    ]).then(([running, cycling, swimming, strength]) => {
      if (!cancelled) {
        setWorkouts(
          running.length + cycling.length + swimming.length + strength.length
        );
      }
    });
    import("@/pages/CalculateursPage").then((m) => {
      if (!cancelled) setCalculators(m.CALCULATEURS.length);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    workouts,
    calculators,
    plans: getAllPrebuiltPlans().length,
    collections: getAllCollections().length,
    articles: articleMetadata.length,
    zones: ZONES,
  };
}
