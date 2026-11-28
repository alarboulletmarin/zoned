import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { SEOHead } from "@/components/seo";
import { useCreatePlan } from "@/hooks/usePlans";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatDate, usePickLang } from "@/lib/i18n-utils";
import { loadUserZonePrefs, saveUserZonePrefs } from "@/lib/zones";
import { parseVma, vmaToInput } from "@/lib/paceFields";
import { loadRunnerProfile } from "@/lib/runnerProfile";
import { savePlan } from "@/lib/planStorage";
import { validateIntermediateGoals } from "@/lib/intermediateGoalValidation";
import { MAX_PLAN_WEEKS, RECOMMENDED_PLAN_WEEKS } from "@/lib/planGenerator/constants";
import { anchorPrebuilt } from "@/lib/prebuiltPlanConverter";
import {
  PURPOSE_DEFAULTS,
  buildAssistedConfig,
  emptyPlanForm,
  goalOf,
  matchingPrebuilts,
  planEndOf,
  planStartOf,
  planWeeksOf,
  type PlanForm,
  type PlanGoal,
} from "@/lib/planCreate";
import { getPrebuiltBySlug } from "@/data/prebuilt-plans";
import { RACE_DISTANCE_META } from "@/types/plan";
import { PRACTICES, practiceFromRaceDistance, type Practice } from "@/types/practice";
import { generateId, getTodayDateInputValue } from "./plan-create/helpers";
import { isScreenId, reachableStep, stepsFor, type ScreenId } from "./plan-create/flows";
import { usePlanDraft } from "./plan-create/usePlanDraft";
import { useLivePlan } from "./plan-create/useLivePlan";
import { useDebouncedValue } from "./plan-create/useDebouncedValue";
import { GoalScreen } from "./plan-create/GoalScreen";
import { DateScreen } from "./plan-create/DateScreen";
import { PathScreen } from "./plan-create/PathScreen";
import { YouScreen } from "./plan-create/YouScreen";
import { PreviewScreen } from "./plan-create/PreviewScreen";
import { PlanAside } from "./plan-create/PlanAside";
import { RefinePanel } from "./plan-create/RefinePanel";

/** Les champs tapés au clavier : ils régénèrent l'aperçu après 150 ms, pas à chaque touche. */
const TEXT_FIELDS = [
  "raceName",
  "vma",
  "targetPace",
  "elevationGain",
  "currentWeeklyKm",
  "currentLongRunKm",
  "intermediateGoals",
] as const satisfies readonly (keyof PlanForm)[];
type TypedFields = Pick<PlanForm, (typeof TEXT_FIELDS)[number]>;

/** Les réponses d'un plan prêt ouvert depuis sa fiche (`?prebuilt=<slug>`). */
function formForPrebuilt(form: PlanForm, slug: string | null): PlanForm {
  const pb = slug ? getPrebuiltBySlug(slug) : undefined;
  if (!pb) return form;
  const purpose = pb.planPurpose ?? "race";
  if (purpose === "race") {
    if (!pb.raceDistance) return form;
    return {
      ...form,
      planPurpose: "race",
      raceDistance: pb.raceDistance,
      practice: practiceFromRaceDistance(pb.raceDistance),
      prebuiltSlug: pb.slug,
    };
  }
  return {
    ...form,
    planPurpose: purpose,
    raceDistance: null,
    practice: form.practice ?? "road",
    ...PURPOSE_DEFAULTS[purpose],
    totalWeeksOverride: pb.totalWeeks,
    prebuiltSlug: pb.slug,
  };
}

/**
 * Créer un plan : l'objectif, la date, le choix entre un plan prêt et le sur
 * mesure, toi et ta semaine, puis le plan lui-même, généré avant d'être
 * enregistré. L'écran courant vit dans l'URL (`?step=`) : le bouton retour du
 * navigateur remonte le parcours.
 */
export function PlanCreatePage() {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = useMemo(() => getTodayDateInputValue(), []);
  const { createPlan, isGenerating, error: createError } = useCreatePlan();

  /* `?practice=trail` depuis une carte de pratique : la première question ne
     montre que les courses de cette pratique. Une valeur inconnue est ignorée. */
  const presetPractice = useMemo<Practice | null>(() => {
    const raw = searchParams.get("practice");
    return raw && (PRACTICES as readonly string[]).includes(raw) ? (raw as Practice) : null;
  }, [searchParams]);

  /* Déjà rempli : le profil coureur et Mes zones d'abord, des valeurs
     courantes sinon. Mémorisé pour compléter un brouillon d'avant un champ. */
  const userPrefs = useMemo(() => loadUserZonePrefs(), []);
  const [initialForm] = useState<PlanForm>(() => {
    const rp = loadRunnerProfile();
    return {
      ...emptyPlanForm(),
      practice: presetPractice,
      runnerLevel: rp?.runnerLevel ?? null,
      vma: vmaToInput(userPrefs?.vma ?? rp?.vma),
      currentWeeklyKm: rp?.currentWeeklyKm != null ? String(rp.currentWeeklyKm) : "",
      currentLongRunKm: rp?.currentLongRunKm != null ? String(rp.currentLongRunKm) : "",
    };
  });
  const [form, setForm] = useState<PlanForm>(() =>
    formForPrebuilt(initialForm, searchParams.get("prebuilt")),
  );
  const patch = useCallback((next: Partial<PlanForm>) => setForm((f) => ({ ...f, ...next })), []);

  // ── Le parcours ─────────────────────────────────────────────────
  const goal = goalOf(form);
  const goalKey = goal ? (goal.kind === "race" ? goal.distance : goal.purpose) : "";
  // La liste ne dépend que de l'objectif.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const prebuilts = useMemo(() => (goal ? matchingPrebuilts(goal) : []), [goalKey]);
  const prebuilt = prebuilts.find((p) => p.slug === form.prebuiltSlug) ?? null;
  const steps = stepsFor({ prebuiltSlug: prebuilt?.slug ?? null }, prebuilts.length);
  const isRace = form.planPurpose === "race";

  const weeks = planWeeksOf(form, today);
  const start = planStartOf(form, today);
  const end = planEndOf(form, today);
  const rec = RECOMMENDED_PLAN_WEEKS[form.raceDistance ?? "10K"];
  const dateOk = isRace ? !!form.raceDate && weeks >= rec.min && weeks <= MAX_PLAN_WEEKS : true;

  const urlStep = searchParams.get("step");
  const wanted: ScreenId = isScreenId(urlStep)
    ? urlStep
    : searchParams.has("prebuilt")
      ? "date"
      : "goal";
  const step = reachableStep(wanted, steps, { goal: !!goal, date: dateOk });
  const at = steps.indexOf(step);

  const go = useCallback(
    (next: ScreenId, replace = false) =>
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set("step", next);
          params.delete("prebuilt");
          return params;
        },
        { replace },
      ),
    [setSearchParams],
  );

  // `?prebuilt=` est lu une fois, au premier rendu ; ensuite l'URL dit l'écran.
  useEffect(() => {
    if (searchParams.has("prebuilt")) go("date", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Un écran pas encore atteignable (lien direct, page rechargée) : l'URL dit celui qu'on voit.
  useEffect(() => {
    if (urlStep && urlStep !== step) go(step, true);
  }, [urlStep, step, go]);

  const { hasDraft, restoreDraft, clearDraft, finalize } = usePlanDraft<PlanForm>(
    form,
    setForm,
    step,
    (s) => go(isScreenId(s) ? s : "goal", true),
    (stored) => ({ ...initialForm, ...stored }),
  );

  /* Chaque écran s'ouvre en haut, le focus sur sa question. Pas au premier
     rendu : une page ouverte par un lien n'a pas à bouger. */
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>(".zn-pc__title")?.focus({ preventScroll: true });
  }, [step]);

  // ── Le plan, en direct ──────────────────────────────────────────
  const anchored = useMemo(() => {
    if (!prebuilt || !dateOk) return null;
    return anchorPrebuilt(
      prebuilt,
      isRace ? { raceDate: form.raceDate, today, raceName: form.raceName } : { startDate: start },
    );
  }, [prebuilt, dateOk, isRace, form.raceDate, form.raceName, today, start]);

  const goalsValidation = useMemo(
    () =>
      isRace && form.raceDate && form.raceDistance && form.intermediateGoals.length > 0
        ? validateIntermediateGoals(form.intermediateGoals, form.raceDate, start, form.raceDistance)
        : { valid: true, errors: [] },
    [isRace, form.raceDate, form.raceDistance, form.intermediateGoals, start],
  );

  const textNow = JSON.stringify(Object.fromEntries(TEXT_FIELDS.map((k) => [k, form[k]])));
  const textLater = useDebouncedValue(textNow, 150);
  /* Sur bureau, le plan se dessine pendant qu'on répond, dans le panneau de
     droite des écrans 2.2 à 2.4. Sur téléphone, il n'est généré que pour
     l'aperçu. */
  const wide = useMediaQuery("(min-width: 1024px)");
  const withAside = wide && (step === "date" || step === "path" || step === "you");
  const liveNeeded = step === "preview" || withAside;
  const liveConfig = useMemo(() => {
    if (prebuilt || !goalKey || !dateOk || !liveNeeded) return null;
    const settled: PlanForm = { ...form, ...(JSON.parse(textLater) as TypedFields) };
    // Une course de préparation mal datée ne compte pas : l'erreur est sous ses champs.
    if (
      settled.intermediateGoals.length > 0 &&
      (!settled.raceDistance ||
        !validateIntermediateGoals(
          settled.intermediateGoals,
          settled.raceDate,
          planStartOf(settled, today),
          settled.raceDistance,
        ).valid)
    ) {
      settled.intermediateGoals = [];
    }
    return buildAssistedConfig(settled, today);
  }, [form, textLater, prebuilt, goalKey, dateOk, liveNeeded, today]);
  const live = useLivePlan(liveConfig);
  const plan = prebuilt ? (anchored?.ok ? anchored.plan : null) : live.plan;

  // ── Les gestes ──────────────────────────────────────────────────
  const pickGoal = (next: PlanGoal) => {
    setForm((f) =>
      next.kind === "race"
        ? {
            ...f,
            planPurpose: "race",
            raceDistance: next.distance,
            practice: practiceFromRaceDistance(next.distance),
            prebuiltSlug: null,
          }
        : {
            ...f,
            planPurpose: next.purpose,
            raceDistance: null,
            practice: presetPractice ?? "road",
            ...PURPOSE_DEFAULTS[next.purpose],
            prebuiltSlug: null,
          },
    );
    go("date");
  };

  /* Après la date : un plan prêt déjà choisi qui tient dans le calendrier
     mène à l'aperçu ; sinon l'écran suivant du parcours. */
  const afterDate = () => {
    if (prebuilt && anchored?.ok) go("preview");
    else go(steps[steps.indexOf("date") + 1]);
  };

  const back = () => go(steps[Math.max(0, at - 1)]);

  const vma = parseVma(form.vma);
  const handleCreate = async () => {
    let id: string;
    if (prebuilt) {
      if (!anchored?.ok) return;
      const saved = savePlan(anchored.plan);
      if (!saved.ok) {
        toast.failure(t("common:errors.planSaveFailed"), saved);
        return;
      }
      id = anchored.plan.id;
    } else {
      try {
        const created = await createPlan(
          buildAssistedConfig(form, today, { id: generateId(), createdAt: new Date().toISOString() }),
        );
        id = created.id;
      } catch {
        return; // L'erreur s'affiche sous les repères (`createError`).
      }
    }
    /* La VMA saisie ici devient celle de l'app : Mes zones et le profil la
       lisent tous deux. */
    if (vma && vma !== userPrefs?.vma) saveUserZonePrefs({ ...(userPrefs ?? {}), vma });
    finalize();
    navigate(`/plan/${id}`);
  };

  // ── Les libellés ────────────────────────────────────────────────
  const goalLabel = !goal
    ? ""
    : goal.kind === "race"
      ? pick(RACE_DISTANCE_META[goal.distance], "label")
      : t(`parcours.goal.purpose.${goal.purpose}`);
  const previewTitle =
    (isRace && form.raceName.trim()) ||
    (isRace && form.raceDate
      ? t("parcours.preview.titleRace", {
          goal: goalLabel,
          date: formatDate(form.raceDate, { day: "numeric", month: "long" }),
        })
      : prebuilt
        ? pick(prebuilt, "name")
        : goalLabel);

  const screen = (() => {
    switch (step) {
      case "goal":
        return <GoalScreen goal={goal} presetPractice={presetPractice} onPick={pickGoal} />;
      case "date":
        return (
          <DateScreen
            form={form}
            patch={patch}
            today={today}
            goalLabel={goalLabel}
            weeks={prebuilt && anchored?.ok ? prebuilt.totalWeeks : weeks}
            start={anchored?.ok ? anchored.startDate : start}
            end={end}
            dateOk={dateOk}
            prebuilt={prebuilt && !isRace ? prebuilt : null}
            onContinue={afterDate}
          />
        );
      case "path":
        return (
          <PathScreen
            form={form}
            today={today}
            prebuilts={prebuilts}
            start={start}
            weeks={weeks}
            onPickPrebuilt={(slug) => {
              patch({ prebuiltSlug: slug });
              go("preview");
            }}
            onPickCustom={() => {
              patch({ prebuiltSlug: null });
              go("you");
            }}
          />
        );
      case "you":
        return <YouScreen form={form} patch={patch} onContinue={() => go("preview")} />;
      case "preview":
        return (
          <PreviewScreen
            kind={prebuilt ? "ready" : "custom"}
            title={previewTitle}
            prebuiltName={prebuilt && isRace ? pick(prebuilt, "name") : null}
            plan={plan}
            busy={!prebuilt && live.busy}
            error={prebuilt ? null : live.error}
            start={anchored?.ok ? anchored.startDate : start}
            raceDate={isRace ? form.raceDate : null}
            raceName={isRace ? form.raceName.trim() || null : null}
            sessionsPerWeek={prebuilt ? prebuilt.sessionsPerWeek : form.daysPerWeek}
            noVma={!prebuilt && !vma}
            onCreate={handleCreate}
            creating={isGenerating}
            blocked={!goalsValidation.valid}
            createError={createError}
            refine={
              prebuilt ? undefined : (
                <RefinePanel
                  form={form}
                  patch={patch}
                  today={today}
                  start={start}
                  isTrail={!!form.raceDistance && practiceFromRaceDistance(form.raceDistance) !== "road"}
                  goalsValidation={goalsValidation}
                />
              )
            }
          />
        );
    }
  })();

  return (
    <>
      <SEOHead title={t("seo.createTitle")} description={t("seo.createDescription")} canonical="/plan/new" />
      <div className="zn-pc" data-step={step}>
        <div className="zn-pc__bar">
          {at > 0 ? (
            <button type="button" className="zn-pc__back" onClick={back}>
              <ArrowLeft size={18} />
              {t("nav.back")}
            </button>
          ) : (
            <Link to="/plans" className="zn-pc__back">
              <ArrowLeft size={18} />
              {t("parcours.back")}
            </Link>
          )}
          <ol className="zn-pc__dots" aria-label={t("nav.step", { current: at + 1, total: steps.length })}>
            {steps.map((s, i) => (
              <li key={s} data-on={i <= at || undefined} />
            ))}
          </ol>
        </div>

        <div className="zn-pc__grid">
          <div className="zn-pc__main">
            {hasDraft && step === "goal" && (
              <Alert
                kind="info"
                title={t("draft.found")}
                action={
                  <span className="zn-pc__draft-actions">
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
            {screen}
          </div>
          {withAside && (
            <PlanAside
              name={(isRace && form.raceName.trim()) || goalLabel}
              goalLabel={goalLabel}
              isRace={isRace}
              raceDate={form.raceDate}
              weeks={weeks}
              start={start}
              week={step === "you" ? { days: form.daysPerWeek, longRunDay: form.longRunDay } : null}
              plan={dateOk ? plan : null}
              busy={live.busy}
            />
          )}
        </div>
      </div>
    </>
  );
}
