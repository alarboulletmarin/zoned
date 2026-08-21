import { useEffect, useState } from "react";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getAllCollections } from "@/data/collections";
import { articleMetadata } from "@/data/articles";
import {
  loadAllWorkouts,
  loadDisciplineWorkouts,
} from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";
import { getTermsCount } from "@/data/glossary";
import { countUniqueScienceSources } from "@/lib/scienceReferences";

const ZONES = 6;

export type AppStats = {
  workouts: number;
  runningWorkouts: number;
  calculators: number;
  plans: number;
  collections: number;
  articles: number;
  zones: number;
  glossaryTerms: number;
  scienceSources: number;
};

export function useAppStats(): AppStats {
  const [workouts, setWorkouts] = useState(0);
  const [runningWorkouts, setRunningWorkouts] = useState(0);
  const [calculators, setCalculators] = useState(0);
  const [glossaryTerms, setGlossaryTerms] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadAllWorkouts(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
      loadAllStrengthSessions(),
    ]).then(([running, cycling, swimming, strength]) => {
      if (!cancelled) {
        setRunningWorkouts(running.length);
        setWorkouts(
          running.length + cycling.length + swimming.length + strength.length
        );
      }
    });
    import("@/pages/CalculateursPage").then((m) => {
      if (!cancelled) setCalculators(m.CALCULATEURS.length);
    });
    getTermsCount().then((count) => {
      if (!cancelled) setGlossaryTerms(count);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    workouts,
    runningWorkouts,
    calculators,
    plans: getAllPrebuiltPlans().length,
    collections: getAllCollections().length,
    articles: articleMetadata.length,
    zones: ZONES,
    glossaryTerms,
    scienceSources: countUniqueScienceSources(),
  };
}
