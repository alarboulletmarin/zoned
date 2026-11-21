import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePlan } from "@/lib/planGenerator";
import { failureReason, type FailureReason } from "@/lib/failure";
import { getWorkoutById, getWorkoutByIdSync } from "@/data/workouts";
import { usePickLang } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate } from "@/types";
import type { AssistedPlanConfig, PlanSession, TrainingPlan } from "@/types/plan";

/** Au-delà, l'ancienne frise s'atténue : la nouvelle arrive. */
const BUSY_AFTER_MS = 300;

/**
 * Les générations passent une par une. Le générateur tire ses séances d'un
 * aléa global semé par la configuration : deux générations entremêlées se
 * voleraient leurs tirages, et l'aperçu ne serait plus le plan créé.
 */
let queue: Promise<unknown> = Promise.resolve();

export interface LivePlan {
  plan: TrainingPlan | null;
  error: FailureReason | null;
  /** Une génération dure depuis plus de 300 ms. */
  busy: boolean;
}

/**
 * Le plan généré en direct, sans être enregistré. Chaque demande rend la
 * précédente caduque : un résultat qui arrive après une demande plus récente
 * est jeté, l'aperçu ne montre jamais un plan périmé.
 */
export function useLivePlan(config: AssistedPlanConfig | null): LivePlan {
  const key = config ? JSON.stringify(config) : "";
  const [state, setState] = useState<{ key: string; plan: TrainingPlan | null; error: FailureReason | null }>(
    { key: "", plan: null, error: null },
  );
  const [busy, setBusy] = useState(false);
  const latest = useRef(0);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const request = ++latest.current;
    const current = configRef.current;
    if (!current) {
      setBusy(false);
      return;
    }
    const timer = window.setTimeout(() => {
      if (request === latest.current) setBusy(true);
    }, BUSY_AFTER_MS);
    const run = () => {
      if (request !== latest.current) return undefined;
      return generatePlan(current).then(
        (plan) => {
          if (request === latest.current) setState({ key, plan, error: null });
        },
        (err: unknown) => {
          if (request === latest.current) setState({ key, plan: null, error: failureReason(err) });
        },
      );
    };
    queue = queue.then(run, run).finally(() => {
      window.clearTimeout(timer);
      if (request === latest.current) setBusy(false);
    });
    return () => window.clearTimeout(timer);
  }, [key]);

  if (!config) return { plan: null, error: null, busy: false };
  // Une erreur ne vaut que pour la demande qui l'a produite.
  const error = state.key === key ? state.error : null;
  return { plan: error ? null : state.plan, error, busy };
}

/**
 * Les séances du plan, chargées comme sur la page plan, pour leurs noms et
 * leurs pictogrammes.
 */
export function usePlanTemplates(plan: TrainingPlan | null) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const [templates, setTemplates] = useState<Record<string, AnyWorkoutTemplate>>({});

  useEffect(() => {
    if (!plan) return;
    const ids = new Set<string>();
    for (const week of plan.weeks) {
      for (const s of week.sessions) if (!s.workoutId.startsWith("__")) ids.add(s.workoutId);
    }
    const missing = [...ids].filter((id) => !templates[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(missing.map(async (id) => [id, await getWorkoutById(id)] as const)).then(
      (pairs) => {
        if (cancelled) return;
        setTemplates((prev) => {
          const next = { ...prev };
          for (const [id, w] of pairs) if (w) next[id] = w;
          return next;
        });
      },
      () => {
        // Un catalogue qui ne charge pas laisse les noms bruts : l'aperçu reste lisible.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [plan, templates]);

  const workoutOf = useCallback(
    (id: string) => templates[id] ?? getWorkoutByIdSync(id),
    [templates],
  );

  const nameOf = useCallback(
    (s: PlanSession) => {
      if (s.workoutId === "__race_day__") return t("page.race.title");
      if (s.workoutId === "__intermediate_race__") return t("page.race.intermediate");
      const w = workoutOf(s.workoutId);
      return w ? pick(w, "name") : "";
    },
    [workoutOf, pick, t],
  );

  return useMemo(() => ({ workoutOf, nameOf }), [workoutOf, nameOf]);
}
