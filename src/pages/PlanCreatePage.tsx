import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Check } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { useCreatePlan } from "@/hooks/usePlans";
import { loadUserZonePrefs } from "@/lib/zones";
import type { AssistedPlanConfig, IntermediateGoal } from "@/types/plan";
import type { UserZonePreferences } from "@/types";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { usePickLang } from "@/lib/i18n-utils";
import {
  addWeeksToDate,
  buildRacePlanDateRange,
  calculateWeeksBetweenDates,
} from "@/lib/planDates";
import {
  validateIntermediateGoals,
  sortIntermediateGoals,
} from "@/lib/intermediateGoalValidation";
import { loadRunnerProfile } from "@/lib/runnerProfile";
import { usePlanDraft } from "./plan-create/usePlanDraft";
import { RECOMMENDED_WEEKS } from "./plan-create/constants";
import {
  generateId,
  getTodayDateInputValue,
  parsePaceToSeconds,
  suggestLevel,
} from "./plan-create/helpers";
import { STEPS } from "./plan-create/steps/registry";
import { indexOfStep, stepsFor } from "./plan-create/steps/flows";
import type { FormState, StepContext, WizardDerived } from "./plan-create/types";
import { PRACTICES, type Practice } from "@/types/practice";

/**
 * La coquille du parcours de plan.
 *
 * Elle faisait 1 609 lignes : douze formulaires, PLUS un `switch canProceed`,
 * PLUS un `renderSummary` géant, tous refermés sur le même état. N'en extraire
 * que les formulaires aurait donné un monolithe avec des fichiers en plus —
 * ce qui compte, c'est que chaque étape déclare maintenant sa question, ce qui
 * y répond et sa condition d'avancement (`plan-create/steps/`). Il ne reste
 * ici que ce qui est vraiment commun : l'état du brouillon, les valeurs
 * dérivées, la navigation, et la génération.
 *
 * Ce lot ne change AUCUN comportement : mêmes étapes, même ordre, mêmes
 * libellés, même plan produit. Changer le parcours en même temps que le
 * découper aurait rendu le diff impossible à relire.
 */
export function PlanCreatePage() {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const navigate = useNavigate();
  const uid = useId();
  const [searchParams] = useSearchParams();
  const { createPlan, isGenerating, error } = useCreatePlan();

  /* `/plan/new` envoie la pratique choisie : on démarre alors à l'étape
     suivante plutôt que de reposer la même question. Une valeur inconnue est
     ignorée — le parcours repart de sa première question. */
  const presetPractice = useMemo<Practice | null>(() => {
    const raw = searchParams.get("practice");
    return raw && (PRACTICES as readonly string[]).includes(raw)
      ? (raw as Practice)
      : null;
  }, [searchParams]);

  const [stepIndex, setStepIndex] = useState(() => (presetPractice ? 1 : 0));
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const todayDate = useMemo(() => getTodayDateInputValue(), []);

  /* L'état de départ est mémorisé, pas seulement utilisé : un brouillon écrit
     avant l'ajout d'un champ n'en a pas la clé, et le poser tel quel donnerait
     un objet incomplet TYPÉ complet. `revive` fusionne sur celui-ci. */
  const initialForm = useMemo<FormState>(() => {
    const rp = loadRunnerProfile();
    return {
      practice: presetPractice,
      planPurpose: "race",
      trainingGoal: "time",
      raceDistance: null,
      raceDate: "",
      startDate: todayDate,
      useCustomStartDate: false,
      raceName: "",
      runnerLevel: rp?.runnerLevel ?? null,
      daysPerWeek: 4,
      longRunDay: 6,
      targetPace: "",
      elevationGain: "",
      totalWeeksOverride: 0,
      currentWeeklyKm: rp?.currentWeeklyKm != null ? String(rp.currentWeeklyKm) : "",
      currentLongRunKm: rp?.currentLongRunKm != null ? String(rp.currentLongRunKm) : "",
      includeStrength: false,
      strengthFrequency: 2,
      intermediateGoals: [],
      terrain: "trail_runnable",
      ultraNight: false,
      ultraFuelling: false,
      ultraPoles: false,
      ultraBackToBack: false,
    };
  }, [todayDate, presetPractice]);

  const [form, setForm] = useState<FormState>(initialForm);

  const steps = useMemo(() => stepsFor(form), [form]);
  /* Borner l'index au parcours courant. Il peut le dépasser de deux façons :
     un préréglage `?practice=` qui démarre à l'étape 2 d'un parcours qui n'en
     a qu'une (le triathlon annoncé), ou une réponse qui raccourcit la liste en
     cours de route. Sans ça l'écran annonçait « Étape 2 sur 1 ». */
  const safeIndex = Math.min(stepIndex, steps.length - 1);
  const currentStepId = steps[safeIndex] ?? "practice";

  // Auto-save the wizard so a closed tab / hard reload doesn't lose progress.
  // Persistence stops when the plan is finalized; the banner appears on mount
  // when a previous draft is found and lets the user resume or start fresh.
  const { hasDraft, restoreDraft, clearDraft, finalize } = usePlanDraft<FormState>(
    form,
    setForm,
    stepIndex,
    setStepIndex,
    {
      stepId: currentStepId,
      revive: (stored) => ({ ...initialForm, ...stored }),
      resolveStepIndex: indexOfStep,
    },
  );

  // Load user zone preferences for VMA suggestion
  const userPrefs: UserZonePreferences | null = useMemo(
    () => loadUserZonePrefs(),
    [],
  );

  // ── Dynamic step flow ────────────────────────────────────────────

  const isRacePlan = form.planPurpose === "race";
  const step = STEPS[currentStepId];
  const totalSteps = steps.length;

  // ── Navigation ───────────────────────────────────────────────────

  /* Le parcours courant, lu au moment où on avance et non au moment où le
     geste a été fait. Les deux diffèrent : répondre « pratique » fait passer
     la liste d'UNE étape à treize, et `goForward` fermé sur l'ancienne liste
     calculait `Math.min(1, 0)` — il ne bougeait pas. */
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const advanceTimer = useRef<number | null>(null);

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => cancelAdvance, [cancelAdvance]);

  const goForward = useCallback(() => {
    cancelAdvance();
    setDirection("forward");
    setStepIndex((s) => Math.min(s + 1, stepsRef.current.length - 1));
  }, [cancelAdvance]);

  const goBack = useCallback(() => {
    cancelAdvance();
    setDirection("backward");
    setStepIndex((s) => Math.max(s - 1, 0));
  }, [cancelAdvance]);

  /** The stepper only walks backwards: a step ahead has not been answered. */
  const goBackTo = useCallback(
    (index: number) => {
      cancelAdvance();
      setDirection("backward");
      setStepIndex(index);
    },
    [cancelAdvance],
  );

  /**
   * Une réponse à choix unique avance d'elle-même.
   *
   * Le battement n'est pas un effet de style : le clic du label arrive AVANT
   * que la radio ne change d'état, donc avancer dans la foulée lirait l'ancien
   * brouillon — et l'ancien parcours, qui n'a pas encore la longueur que la
   * réponse vient de lui donner. 160 ms laissent aussi voir l'option se
   * cocher, ce qui est ce qui fait que l'écran suivant n'a pas l'air d'un
   * accident.
   */
  const commit = useCallback(() => {
    cancelAdvance();
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      setDirection("forward");
      setStepIndex((s) => Math.min(s + 1, stepsRef.current.length - 1));
    }, 160);
  }, [cancelAdvance]);

  // ── Derived values ───────────────────────────────────────────────

  const weeksCount = useMemo(
    () =>
      form.raceDate
        ? calculateWeeksBetweenDates(form.startDate || todayDate, form.raceDate)
        : 0,
    [form.raceDate, form.startDate, todayDate],
  );

  const recommendedWeeks = useMemo(
    () => RECOMMENDED_WEEKS[form.raceDistance ?? "10K"] ?? RECOMMENDED_WEEKS["10K"],
    [form.raceDistance],
  );

  const minWeeksForDistance = recommendedWeeks.min;

  // Valid if enough weeks (min is a hard constraint, max is just a warning)
  const dateValid = weeksCount >= minWeeksForDistance;
  const dateTooLong = weeksCount > recommendedWeeks.max;

  const minDate = useMemo(
    () => addWeeksToDate(form.startDate || todayDate, minWeeksForDistance),
    [form.startDate, minWeeksForDistance, todayDate],
  );

  const paceSeconds = useMemo(
    () => parsePaceToSeconds(form.targetPace),
    [form.targetPace],
  );

  const suggestedLevel = useMemo(
    () => (userPrefs?.vma ? suggestLevel(userPrefs.vma) : null),
    [userPrefs],
  );

  const intermediateGoalValidation = useMemo(() => {
    if (form.intermediateGoals.length === 0 || !form.raceDate)
      return { valid: true, errors: [] };
    return validateIntermediateGoals(
      form.intermediateGoals,
      form.raceDate,
      form.startDate || todayDate,
      form.raceDistance ?? "10K",
    );
  }, [
    form.intermediateGoals,
    form.raceDate,
    form.startDate,
    form.raceDistance,
    todayDate,
  ]);

  const intermediateGoalMaxDate = useMemo(() => {
    if (!form.raceDate) return undefined;
    // 2 weeks before main race
    const d = new Date(form.raceDate);
    d.setDate(d.getDate() - 14);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, [form.raceDate]);

  const derived: WizardDerived = {
    todayDate,
    weeksCount,
    recommendedWeeks,
    minWeeksForDistance,
    dateValid,
    dateTooLong,
    minDate,
    paceSeconds,
    suggestedLevel,
    userPrefs,
    intermediateGoalValidation,
    intermediateGoalMaxDate,
    isRacePlan,
  };

  // ── Submit handler ───────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!form.runnerLevel) return;
    if (isRacePlan && (!form.raceDistance || !form.raceDate)) return;

    const effectiveRaceDate =
      form.raceDate ||
      new Date(
        Date.now() + 86400000 * 7 * (form.totalWeeksOverride || 12),
      ).toISOString();

    const config: AssistedPlanConfig = {
      id: generateId(),
      raceDistance: form.raceDistance ?? "10K",
      raceDate: effectiveRaceDate,
      raceName: form.raceName || undefined,
      runnerLevel: form.runnerLevel,
      daysPerWeek: form.daysPerWeek,
      longRunDay: form.longRunDay,
      vma: userPrefs?.vma,
      targetPaceMinKm: paceSeconds ? paceSeconds / 60 : undefined,
      elevationGain: form.elevationGain
        ? parseInt(form.elevationGain, 10)
        : undefined,
      createdAt: new Date().toISOString(),
      ...buildRacePlanDateRange(form.startDate, effectiveRaceDate),
      /* La pratique n'est stockée QUE pour un plan sans course visée : dans
         tous les autres cas elle se déduit de `raceDistance`, ce qui est ce
         qui évite toute migration de `zoned-plans`. */
      practice: isRacePlan ? undefined : (form.practice ?? undefined),
      planPurpose: form.planPurpose,
      trainingGoal: form.trainingGoal,
      totalWeeksOverride: !isRacePlan ? form.totalWeeksOverride : undefined,
      currentWeeklyKm: form.currentWeeklyKm
        ? parseInt(form.currentWeeklyKm, 10)
        : undefined,
      currentLongRunKm: form.currentLongRunKm
        ? parseInt(form.currentLongRunKm, 10)
        : undefined,
      includeStrength: form.includeStrength || undefined,
      strengthFrequency: form.includeStrength ? form.strengthFrequency : undefined,
      intermediateGoals:
        form.intermediateGoals.length > 0
          ? sortIntermediateGoals(form.intermediateGoals)
          : undefined,
    };

    try {
      const plan = await createPlan(config);
      finalize();
      triggerStorageWarning();
      navigate(`/plan/${plan.id}`);
    } catch {
      // Error is exposed via the hook's error state
    }
  }, [form, userPrefs, paceSeconds, createPlan, navigate, finalize, isRacePlan]);

  // ── Intermediate goals ───────────────────────────────────────────

  const addIntermediateGoal = useCallback(() => {
    setForm((f) => {
      if (f.intermediateGoals.length >= 5) return f;
      const newGoal: IntermediateGoal = {
        raceDistance: "10K",
        raceDate: "",
        raceName: "",
        priority: "B",
      };
      return { ...f, intermediateGoals: [...f.intermediateGoals, newGoal] };
    });
  }, []);

  const removeIntermediateGoal = useCallback((index: number) => {
    setForm((f) => ({
      ...f,
      intermediateGoals: f.intermediateGoals.filter((_, i) => i !== index),
    }));
  }, []);

  const updateIntermediateGoal = useCallback(
    (index: number, patch: Partial<IntermediateGoal>) => {
      setForm((f) => ({
        ...f,
        intermediateGoals: f.intermediateGoals.map((g, i) =>
          i === index ? { ...g, ...patch } : g,
        ),
      }));
    },
    [],
  );

  // ── Furniture ────────────────────────────────────────────────────

  const questionId = `${uid}-question`;

  const patch = useCallback(
    (next: Partial<FormState>) => setForm((f) => ({ ...f, ...next })),
    [],
  );

  const ctx: StepContext = {
    form,
    setForm,
    patch,
    derived,
    uid,
    questionId,
    t,
    pick,
    goForward,
    goBack,
    commit,
    direction,
    submit: { generate: handleGenerate, isGenerating, error },
    goals: {
      add: addIntermediateGoal,
      remove: removeIntermediateGoal,
      update: updateIntermediateGoal,
    },
  };

  const canProceed = step.isComplete(form, derived);

  /**
   * Chaque étape s'ouvre sur sa question.
   *
   * Sans ça, l'écran suivant héritait de la position où le doigt avait laissé
   * le précédent : on descendait chercher « Suivant », et l'étape d'après
   * s'ouvrait à mi-hauteur, question déjà hors champ. Sur treize étapes, c'est
   * le sentiment de « il manque toujours quelque chose en haut ».
   *
   * Sans animation : le volet joue déjà son glissement, et deux mouvements
   * simultanés se lisent comme un saut. Le premier rendu est exclu — une page
   * ouverte par un lien ancré n'a pas à être ramenée en haut.
   */
  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
  }, [safeIndex]);

  return (
    <>
      <SEOHead
        title={t("seo.createTitle")}
        description={t("seo.createDescription")}
        canonical="/plan/create"
      />

      <div className="zn-wiz">
        {/* La pile du titre. Son écart vit dans la feuille et non en style en
            ligne : un style en ligne bat toute règle, et le bloc téléphone de
            plan-wizard.css a précisément à le resserrer. */}
        <div className="zn-stack zn-wiz__head">
          {safeIndex === 0 && (
            <Button variant="ghost" size="sm" asChild className="zn-wiz__lone">
              <Link to="/plan/new">
                <ArrowLeft />
                {t("nav.back")}
              </Link>
            </Button>
          )}

          {/* LA QUESTION est le titre de l'écran, et c'est le seul.
              Elle était un `h2` de niveau 3 DANS la carte, sous un `h1` en
              display qui disait « Réponds, le plan se construit » — la même
              phrase aux treize étapes. Relu en niveaux de gris et flouté à
              390 px : la masse la plus lourde de l'écran était la phrase
              générique, pas ce qu'on demande. Le parcours veut « la question,
              puis les réponses, puis continuer, rien d'autre » ; la phrase est
              donc partie et la question a pris sa place.

              Le titre vit ici, HORS de la branche `ownsNav` : le récapitulatif
              n'a pas de carte de question, et laisser le titre dedans lui
              aurait retiré son `h1`. */}
          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <span className="zn-kicker">{t("wizard.kicker")}</span>
            <h1 id={questionId} className="zn-display" data-level="2">
              {t(step.titleKey)}
            </h1>
            {step.subtitleKey ? (
              <p className="zn-body zn-body--sm zn-muted zn-measure">
                {t(step.subtitleKey, step.subtitleParams?.(form, derived))}
              </p>
            ) : null}
          </div>
        </div>

        {/* The promise and its limits are stated once, on the first step —
            past that the question on screen is what matters.

            Elles ont QUITTÉ la pile du titre : sur un téléphone, ce bloc
            posait un paragraphe, une source et une carte entre la première
            question et ses réponses — les sept pratiques commençaient sous la
            ligne de flottaison, à l'écran même où l'on ne sait pas encore de
            quoi il s'agit. C'est maintenant un frère du titre et de la bande,
            et `.zn-wiz__promise` le fait passer SOUS les réponses en dessous
            de 900 px (plan-wizard.css). Sur grand écran, rien ne bouge. */}
        {safeIndex === 0 && (
          <div className="zn-wiz__promise">
            <div
              className="zn-split"
              style={{ "--split": "1fr 340px", "--gap": "var(--sp-14)" } as CSSProperties}
            >
              <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                <p className="zn-body zn-body--lead">{t("wizard.lede")}</p>
                <p className="zn-source">{t("wizard.source")}</p>
              </div>
              <Card size="compact">
                <CardContent
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                >
                  <span className="zn-kicker zn-kicker--inline">
                    {t("wizard.limitsKicker")}
                  </span>
                  <p className="zn-body zn-body--sm zn-muted">{t("wizard.limitsBody")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <section className="zn-wiz__band">
          {hasDraft && safeIndex === 0 && (
            <Alert
              kind="info"
              title={t("draft.found")}
              action={
                <span
                  className="zn-cluster"
                  style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                >
                  <Button size="sm" variant="outline" onClick={restoreDraft}>
                    {t("draft.restore")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearDraft}>
                    {t("draft.discard")}
                  </Button>
                </span>
              }
            >
              {t("wizard.draftBody")}
            </Alert>
          )}

          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <ol className="zn-stepper zn-wiz__steps">
              {steps.map((id, index) => {
                const done = index < safeIndex;
                const current = index === safeIndex;
                return (
                  <li key={id} className="zn-stepper__item">
                    <button
                      type="button"
                      className="zn-stepper__step"
                      data-state={done ? "done" : current ? "current" : "todo"}
                      aria-current={current ? "step" : undefined}
                      disabled={!done}
                      onClick={() => goBackTo(index)}
                    >
                      <span className="zn-stepper__rail" aria-hidden="true" />
                      <span className="zn-stepper__name">
                        <span className="zn-stepper__num">
                          {done ? <Check size={12} /> : String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="zn-stepper__label">{t(`wizard.step.${id}`)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="zn-mono zn-wiz__where">
              {t("wizard.where", { current: safeIndex + 1, total: totalSteps })}
            </p>
          </div>

          {/* La coquille rend la question et la navigation ; l'étape ne rend
              que ce qui répond. C'est ce qui a fait disparaître
              `renderQuestion` et `renderNav` des douze corps. Le
              récapitulatif est la seule exception : son bouton ne fait pas
              « suivant », il génère le plan. */}
          <Card className="zn-wiz__col">
            {step.ownsNav ? (
              <step.Body {...ctx} />
            ) : (
              <>
                <CardContent className="zn-wiz__pane" data-direction={direction}>
                  <step.Body {...ctx} />
                </CardContent>
                <CardFooter className="zn-wiz__nav">
                  <Button variant="outline" onClick={goBack} disabled={safeIndex === 0}>
                    <ArrowLeft />
                    {t("nav.back")}
                  </Button>
                  <span className="zn-push" />
                  {step.showSkip && (
                    <Button variant="ghost" onClick={goForward}>
                      {t("nav.skip")}
                    </Button>
                  )}
                  <Button onClick={goForward} disabled={!canProceed}>
                    {step.nextLabelKey ? t(step.nextLabelKey) : t("nav.next")}
                    <ArrowRight />
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
