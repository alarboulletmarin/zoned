import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowUp, Calendar, Check, Pencil } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { SEOHead } from "@/components/seo";
import { WeekRing, WeekRings } from "@/components/weekly/WeekRings";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { ActivityLogPanel } from "@/components/domain/ActivityLogPanel";
import { LastChangePanel } from "@/components/domain/LastChangePanel";
import { PlanAuditPanel } from "@/components/domain/PlanAuditPanel";
import { SessionCompletionPanel } from "@/components/domain/SessionCompletionPanel";
import { WeekSessionSheet, type WeekSessionSheetTarget } from "@/components/domain/WeekSessionSheet";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import { ChangeSessionSheet, type ChangeTarget } from "@/components/domain/plan/ChangeSessionSheet";
import { MoveSessionDialog, type MoveTarget } from "@/components/domain/plan/MoveSessionDialog";
import { PlanDayList, type PlanDayListEditActions } from "@/components/domain/plan/PlanDayList";
import { PlanEditDock } from "@/components/domain/plan/PlanEditDock";
import { usePlanDrag } from "@/components/domain/plan/usePlanDrag";
import { usePlanEditMode } from "@/components/domain/plan/usePlanEditMode";
import { PlanDialogs, type PlanDialog } from "@/components/domain/plan/PlanDialogs";
import { PlanMenu } from "@/components/domain/plan/PlanMenu";
import { PlanSheet } from "@/components/domain/plan/PlanSheet";
import { PlanWeekHeader } from "@/components/domain/plan/PlanWeekHeader";
import { WeekDayBars } from "@/components/domain/plan/WeekDayBars";
import { usePlanActions } from "@/components/domain/plan/usePlanActions";
import { usePlanFormats } from "@/components/domain/plan/planFormat";
import { getWorkoutById, getWorkoutByIdSync, loadAllWorkouts } from "@/data/workouts";
import { usePlan } from "@/hooks/usePlans";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSettings } from "@/hooks/useSettings";
import { useShareLink } from "@/hooks/useShareLink";
import { activitiesBetween } from "@/lib/activityStorage";
import { isActivitySession } from "@/lib/activitySession";
import { loadCommutePattern } from "@/lib/athleteProfile";
import { usePickLang } from "@/lib/i18n-utils";
import { buildPlanCardModel } from "@/lib/planCardModel";
import { getPlanMonday, getSessionCalendarDate, isoDateOnly } from "@/lib/planDates";
import { auditPlan } from "@/lib/planGenerator/audit";
import { getAllPlans, undoLastChange } from "@/lib/planStorage";
import { selectWorkout } from "@/lib/planGenerator/selector";
import { typicalMinutes } from "@/lib/rankAlternatives";
import { getCurrentWeek, isPlanEnded } from "@/lib/planUtils";
import { buildPlanWeekModel, defaultPlanWeek } from "@/lib/planWeekModel";
import { isShareablePlan, sharedPlanUrl } from "@/lib/share/planShare";
import { loadTodayComposition, mondayOf, sourcePosition } from "@/lib/todayComposition";
import { buildWeekRings, resolveRingMetric, ringState, type RingMetric } from "@/lib/weekRings";
import { planWeekRange } from "@/lib/weekReview";
import { getWeekResolutionSummary } from "@/lib/weekValidation";
import { isStrengthWorkout, type AnyWorkoutTemplate, type Discipline, type WorkoutTemplate } from "@/types";
import { practiceFromRaceDistance } from "@/types/practice";
import type { PlanSession, TrainingPlan } from "@/types/plan";

const ACTIVITY_LABEL_KEYS: Record<string, string> = {
  __activity_strength__: "strength",
  __activity_cycling__: "cycling",
  __activity_swimming__: "swimming",
  __activity_yoga__: "yoga",
  __activity_rest__: "rest",
  __activity_cross_training__: "cross_training",
  __activity_commute__: "commute",
};

/**
 * La page d'un plan : la semaine.
 *
 * On y lit où l'on en est (semaine N sur M, phase, dates), ce que la semaine
 * représente (sept barres, trois anneaux) et chaque jour l'un sous l'autre,
 * avec son statut. Tout le reste se range derrière trois boutons en haut de
 * page : la feuille Le plan (les semaines et les chiffres), le mode Modifier
 * et le menu ···.
 *
 * La semaine vit dans l'URL (`?week=N`), la feuille aussi (`?sheet=plan`).
 */
export function PlanViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["plan", "activity"]);
  const pick = usePickLang();
  const f = usePlanFormats();
  const wide = useMediaQuery("(min-width: 1024px)");
  const { settings, setCockpit } = useSettings();

  const [searchParams, setSearchParams] = useSearchParams();
  const weekParam = searchParams.get("week");
  const weekFromUrl = weekParam ? parseInt(weekParam, 10) : null;
  const sheet = searchParams.get("sheet");

  const setParam = useCallback(
    (key: string, value: string | null, replace = true) => {
      setSearchParams(
        (prev) => {
          if (value === null) prev.delete(key);
          else prev.set(key, value);
          return prev;
        },
        { replace },
      );
    },
    [setSearchParams],
  );
  const setWeekParam = useCallback((week: number) => setParam("week", String(week)), [setParam]);

  // Revenir d'une séance remet la page où on l'avait laissée.
  const returnState = location.state as { returnScrollY?: number } | null;
  useEffect(() => {
    if (returnState?.returnScrollY != null) {
      requestAnimationFrame(() => window.scrollTo(0, returnState.returnScrollY!));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { plan, isLoading, reload } = usePlan(id);
  const actions = usePlanActions(plan ?? null, reload);
  const log = useActivityLog();

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  // ── Le catalogue des séances du plan ────────────────────────────────
  const [templates, setTemplates] = useState<Record<string, AnyWorkoutTemplate>>({});
  useEffect(() => {
    if (!plan) return;
    const ids = new Set<string>();
    for (const week of plan.weeks) {
      for (const s of week.sessions) if (!s.workoutId.startsWith("__")) ids.add(s.workoutId);
    }
    const missing = [...ids].filter((wid) => !templates[wid]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(missing.map(async (wid) => [wid, await getWorkoutById(wid)] as const)).then((pairs) => {
      if (cancelled) return;
      setTemplates((prev) => {
        const next = { ...prev };
        for (const [wid, w] of pairs) if (w) next[wid] = w;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [plan, templates]);
  const workoutOf = useCallback(
    (wid: string) => templates[wid] ?? getWorkoutByIdSync(wid),
    [templates],
  );

  const workoutNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const [wid, w] of Object.entries(templates)) names[wid] = pick(w, "name");
    for (const [aid, key] of Object.entries(ACTIVITY_LABEL_KEYS)) names[aid] = t(`activity.${key}`);
    return names;
  }, [templates, pick, t]);

  const nameOf = useCallback(
    (s: PlanSession) => {
      if (s.workoutId === "__race_day__") return t("page.race.title");
      if (s.workoutId === "__intermediate_race__") return t("page.race.intermediate");
      return workoutNames[s.workoutId] ?? s.workoutId;
    },
    [workoutNames, t],
  );

  // ── Où l'on est ─────────────────────────────────────────────────────
  const currentWeek = useMemo(
    () => (plan ? getCurrentWeek(plan.config.startDate || plan.config.createdAt, today) : 0),
    [plan, today],
  );
  const selectedWeek = plan ? defaultPlanWeek(plan.totalWeeks, currentWeek, weekFromUrl) : 1;

  const cardModel = useMemo(
    () => (plan ? buildPlanCardModel(plan, today, workoutOf) : null),
    [plan, today, workoutOf],
  );
  const weekModel = useMemo(
    () => (plan ? buildPlanWeekModel(plan, selectedWeek, today, workoutOf, log.activities) : null),
    [plan, selectedWeek, today, workoutOf, log.activities],
  );

  const practice = plan
    ? plan.config.practice ?? (plan.config.raceDistance ? practiceFromRaceDistance(plan.config.raceDistance) : null)
    : null;
  const rings = useMemo(() => {
    if (!plan) return null;
    const week = plan.weeks.find((w) => w.weekNumber === selectedWeek);
    if (!week) return null;
    const range = planWeekRange(plan, selectedWeek);
    return buildWeekRings({
      sessions: week.sessions,
      activities: activitiesBetween(log.activities, range.from, range.to),
      range,
      today,
      workoutOf,
      practice,
    });
  }, [plan, selectedWeek, log.activities, today, workoutOf, practice]);
  const metric: RingMetric = rings ? resolveRingMetric(rings, settings.cockpit.ringsMetric) : "time";
  const pickMetric = useCallback((m: RingMetric) => setCockpit({ ringsMetric: m }), [setCockpit]);

  /* Les semaines seules POSÉES sur ce plan dans le cockpit, et sur quelle
     semaine à lui. Le plan ne les contient pas, elles se lisent à côté dans
     /today ; mais c'est ici qu'on regarde une semaine de pic, et ne pas dire
     qu'un renforcement y est posé serait mentir par omission. */
  const placedWeeks = useMemo(() => {
    const out: { id: string; name: string; weekNumber: number; week: TrainingPlan }[] = [];
    if (!plan) return out;
    const composition = loadTodayComposition();
    const monday = getPlanMonday(plan);
    for (const layer of composition.layers) {
      if (!layer.enabled || !layer.anchor) continue;
      const week = getAllPlans().find((p) => p.id === layer.id && p.config.isSingleWeek === true);
      if (!week) continue;
      const [y, m, d] = layer.anchor.split("-").map(Number);
      const position = sourcePosition({ plan, isWeek: false, monday, explicit: false }, mondayOf(new Date(y, m - 1, d)));
      if (position) out.push({ id: week.id, name: pick(week, "name"), weekNumber: position.weekNumber, week });
    }
    return out.sort((a, b) => a.weekNumber - b.weekNumber);
  }, [plan, pick]);

  /* L'audit lit le plan, plus ce qui est posé à côté dans le cockpit. Les
     séances posées sont ajoutées à une COPIE du plan, et seuls les constats
     que cette copie fait apparaître en plus sont gardés, sans correctif : un
     correctif s'adresse par index dans le plan réel. */
  const auditFindings = useMemo(() => {
    if (!plan) return [];
    const own = auditPlan(plan);
    if (placedWeeks.length === 0) return own;
    const augmented = structuredClone(plan);
    for (const placed of placedWeeks) {
      const target = augmented.weeks.find((w) => w.weekNumber === placed.weekNumber);
      if (!target) continue;
      target.sessions = [...target.sessions, ...(placed.week.weeks[0]?.sessions ?? [])].sort(
        (a, b) => a.dayOfWeek - b.dayOfWeek,
      );
    }
    const known = new Set(own.map((x) => `${x.code}:${x.weekNumber}:${x.messageEn}`));
    const extra = auditPlan(augmented)
      .filter((x) => !known.has(`${x.code}:${x.weekNumber}:${x.messageEn}`))
      .map((x) => ({ ...x, id: `placed-${x.id}`, sessionIndex: undefined, fixable: false }));
    return [...own, ...extra];
  }, [plan, placedWeeks]);

  // ── Les panneaux ────────────────────────────────────────────────────
  const [dialog, setDialog] = useState<PlanDialog>(null);
  const [completion, setCompletion] = useState<{ week: number; index: number; anchor: HTMLElement | null } | null>(null);
  const [activityTarget, setActivityTarget] = useState<{ week: number; index: number } | null>(null);
  const weekTopRef = useRef<HTMLDivElement>(null);

  const planName = plan ? plan.config.planName || (plan.config.planMode === "free" ? plan.name : pick(plan, "name")) : "";
  const share = useShareLink(
    useCallback(() => (plan ? sharedPlanUrl(plan.config) : ""), [plan]),
    planName,
  );

  const openSession = useCallback(
    (week: number, index: number) => {
      if (!plan) return;
      const session = plan.weeks.find((w) => w.weekNumber === week)?.sessions[index];
      if (!session) return;
      if (isActivitySession(session.workoutId)) {
        setActivityTarget({ week, index });
        return;
      }
      if (session.workoutId.startsWith("__")) return;
      const weekData = plan.weeks.find((w) => w.weekNumber === week);
      navigate(`/workout/${session.workoutId}`, {
        state: {
          from: "plan",
          planId: plan.id,
          planName,
          weekNumber: week,
          volumePercent: weekData?.volumePercent,
          estimatedDurationMin: session.estimatedDurationMin,
          targetDistanceKm: session.targetDistanceKm,
          scrollY: window.scrollY,
        },
      });
    },
    [plan, planName, navigate],
  );

  const activitySheetTarget = useMemo<WeekSessionSheetTarget | null>(() => {
    if (!plan || !activityTarget) return null;
    const session = plan.weeks.find((w) => w.weekNumber === activityTarget.week)?.sessions[activityTarget.index];
    if (!session || !isActivitySession(session.workoutId)) return null;
    return {
      sessionIndex: activityTarget.index,
      session,
      workout: null,
      name: nameOf(session),
      canMoveUp: false,
      canMoveDown: false,
    };
  }, [plan, activityTarget, nameOf]);
  const commuteProfileMin = useMemo(
    () => (activitySheetTarget ? (loadCommutePattern()?.durationMin ?? null) : null),
    [activitySheetTarget],
  );

  const goToWeek = useCallback(
    (week: number) => {
      setWeekParam(week);
      requestAnimationFrame(() => weekTopRef.current?.scrollIntoView({ block: "start" }));
    },
    [setWeekParam],
  );

  // ── Le bandeau des anneaux, au défilement (téléphone et tablette) ───
  const sentinel = useRef<HTMLDivElement>(null);
  const [stripOn, setStripOn] = useState(false);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || wide || typeof IntersectionObserver === "undefined") {
      setStripOn(false);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      setStripOn(!entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight / 2);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [wide, rings, plan]);

  // ── Le mode Modifier ────────────────────────────────────────────────
  const editing = searchParams.get("mode") === "edit";
  const setEditing = useCallback(
    (on: boolean, push = false) => setParam("mode", on ? "edit" : null, !push),
    [setParam],
  );
  const edit = usePlanEditMode(plan?.id, editing, setEditing, reload);
  const [prevWeeks, setPrevWeeks] = useState(0);
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null);
  const [changeTarget, setChangeTarget] = useState<ChangeTarget | null>(null);
  const [addTarget, setAddTarget] = useState<{ week: number; day: number } | null>(null);
  useEffect(() => {
    if (!editing) setPrevWeeks(0);
  }, [editing]);

  /** Un geste du brouillon : l'état d'avant est gardé, le brouillon marqué. */
  const step = useCallback(
    (run: () => boolean | Promise<boolean>) => {
      edit.before();
      Promise.resolve(run()).then((ok) => {
        if (ok) edit.changed();
      });
    },
    [edit],
  );

  const { drag, startDrag } = usePlanDrag((source, to) => {
    step(() => actions.moveTo(source.week, source.index, to.week, to.day));
  });

  const sessionAt = useCallback(
    (week: number, index: number) => plan?.weeks.find((w) => w.weekNumber === week)?.sessions[index],
    [plan],
  );

  /* Tirer une autre séance : le sélecteur du générateur, pour ce créneau,
     sans aucune des séances déjà posées dans la semaine. */
  const redraw = useCallback(
    async (week: number, index: number) => {
      if (!plan) return;
      const session = sessionAt(week, index);
      const weekData = plan.weeks.find((w) => w.weekNumber === week);
      if (!session || !weekData) return;
      const all = await loadAllWorkouts();
      const pick = selectWorkout(
        {
          dayOfWeek: session.dayOfWeek,
          slotType: session.sessionType === "long_run" ? "long_run" : session.isKeySession ? "key_quality" : "easy",
          sessionTypes: [session.sessionType],
        },
        weekData.phase,
        plan.config.runnerLevel ?? "intermediate",
        plan.config.raceDistance ?? "10K",
        all,
        [],
        weekData.volumePercent,
        plan.config.elevationGain,
        plan.config.daysPerWeek,
        weekData.sessions.map((s) => s.workoutId),
        session.estimatedDurationMin,
      );
      if (!pick || pick.workoutId === session.workoutId) {
        toast.error(t("page.edit.redrawEmpty"));
        return;
      }
      step(() =>
        actions.replaceWorkout(week, index, pick.workoutId, {
          estimatedDurationMin: session.estimatedDurationMin,
        }),
      );
    },
    [plan, sessionAt, actions, step, t],
  );

  const editActionsFor = useCallback(
    (week: number): PlanDayListEditActions => ({
      onChange: (index) => {
        const session = sessionAt(week, index);
        if (!session || !plan) return;
        const date = isoDateOnly(getSessionCalendarDate(getPlanMonday(plan), week, session.dayOfWeek));
        const weekWorkoutIds = plan.weeks.find((w) => w.weekNumber === week)?.sessions.map((s) => s.workoutId) ?? [];
        setChangeTarget({ week, index, session, date, weekWorkoutIds });
      },
      onRedraw: (index) => void redraw(week, index),
      canRedraw: (session) =>
        !session.locked &&
        session.sessionType !== "strength" &&
        !session.workoutId.startsWith("__") &&
        !session.discipline,
      onMove: (index) => {
        const session = sessionAt(week, index);
        if (session) setMoveTarget({ week, index, day: session.dayOfWeek, name: nameOf(session) });
      },
      onDuplicate: (index) => step(() => actions.duplicate(week, index)),
      onRemove: (index) => step(() => actions.removeSession(week, index)),
      onAdd: (day) => {
        if (actions.isBlocked(week, day)) {
          toast.error(t("reschedule.blockedDrop"));
          return;
        }
        setAddTarget({ week, day });
      },
      drag,
      startDrag,
    }),
    [sessionAt, plan, redraw, nameOf, step, actions, drag, startDrag, t],
  );

  const pickChange = useCallback(
    (workout: AnyWorkoutTemplate, discipline: Exclude<Discipline, "running"> | null) => {
      if (!changeTarget) return;
      const { week, index, session } = changeTarget;
      const from = nameOf(session);
      const to = pick(workout, "name");
      const overrides = isStrengthWorkout(workout)
        ? { sessionType: "strength" as const, isKeySession: false, estimatedDurationMin: typicalMinutes(workout) }
        : discipline
          ? {
              discipline,
              sessionType: (workout as WorkoutTemplate).sessionType,
              estimatedDurationMin: typicalMinutes(workout),
              isKeySession: false,
            }
          : { sessionType: (workout as WorkoutTemplate).sessionType };
      setChangeTarget(null);
      step(() => {
        const ok = actions.replaceWorkout(week, index, workout.id, overrides);
        if (ok) {
          toast.success(t("page.change.replaced", { name: to }), {
            description: t("page.change.label", { from, to }),
            action: {
              label: t("page.change.undo"),
              onClick: () => {
                if (edit.undoStep()) toast.info(t("page.change.undone"));
              },
            },
          });
        }
        return ok;
      });
    },
    [changeTarget, nameOf, pick, step, actions, edit, t],
  );

  // ── Les états vides ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="zn-planpage">
        <div className="zn-planpage__empty">
          <Spinner size={22} />
        </div>
      </div>
    );
  }

  if (!plan || !weekModel || !cardModel) {
    return (
      <div className="zn-planpage">
        <div className="zn-planpage__empty">
          <Alert
            kind="error"
            title={t("view.notFound")}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to="/plans">
                  <ArrowLeft />
                  {t("view.backToPlans")}
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const ended = isPlanEnded(plan, today);
  const pacesEstimated = plan.config.planMode !== "free" && plan.config.vma === undefined;
  const week = plan.weeks.find((w) => w.weekNumber === selectedWeek)!;
  const blockedDays = new Set(
    [0, 1, 2, 3, 4, 5, 6].filter((d) => actions.isBlocked(selectedWeek, d)),
  );
  const resolution = getWeekResolutionSummary(week);
  const resolved = resolution.completed + resolution.skipped;

  // La ligne sous le titre : le compte à rebours, le jour J, ou la fin.
  const countdown = cardModel.countdown;
  let raceLine: React.ReactNode = null;
  if (ended) {
    raceLine = t("page.countdown.ended", { date: f.dayDate(cardModel.span.end) });
  } else if (countdown && countdown.kind === "race") {
    raceLine =
      countdown.days === 0 ? (
        <strong className="zn-planpage__cd">{t("page.countdown.raceDay")}</strong>
      ) : (
        <>
          <strong className="zn-planpage__cd">{t("page.countdown.days", { count: countdown.days })}</strong>{" "}
          {t("page.countdown.race", { date: f.dayDate(countdown.date) })}
        </>
      );
  } else if (countdown) {
    raceLine = t("page.countdown.endDate", { date: f.dayDate(countdown.date) });
  }

  const ringValues = rings
    ? ([rings.endurance, rings.quality, rings.strength] as const).map((r) => {
        const state = ringState(r, metric, rings.reference);
        let value: string;
        if (r.kind === "strength") value = `${r.doneSessions}/${r.targetSessions}`;
        else if (metric === "time") value = formatDurationMinutes(Math.round(r.done.time));
        else if (metric === "km") value = `${new Intl.NumberFormat(f.locale, { maximumFractionDigits: 1 }).format(r.done.km)} km`;
        else value = `${Math.round(r.done.dplus)} m`;
        return { ring: r, state, value };
      })
    : [];

  const completionSession = completion
    ? plan.weeks.find((w) => w.weekNumber === completion.week)?.sessions[completion.index] ?? null
    : null;

  const footer = (
    <div className="zn-planpage__after">
      {resolved > 0 &&
        (resolution.unresolved === 0 ? (
          <p className="zn-planpage__validated">
            <Check size={14} />
            {t("completion.validated")}
          </p>
        ) : (
          <Button variant="outline" size="sm" onClick={() => actions.validateWeek(selectedWeek)}>
            <Check />
            {t("completion.validate", { done: resolved, total: week.sessions.length })}
          </Button>
        ))}
      {weekModel.state === "current" && (
        <button type="button" className="zn-planpage__addactivity" onClick={() => log.logOn(isoDateOnly(today))}>
          <span aria-hidden="true">+</span> {t("page.addActivity")}
        </button>
      )}
    </div>
  );

  // Le mode Modifier montre la semaine choisie et la suivante, plus les
  // semaines d'avant qu'on a chargées une à une.
  const firstEditWeek = Math.max(1, selectedWeek - prevWeeks);
  const lastEditWeek = Math.min(plan.totalWeeks, selectedWeek + 1);
  const editWeeks: number[] = [];
  for (let n = firstEditWeek; n <= lastEditWeek; n++) editWeeks.push(n);
  const editBody = (
    <div className="zn-planpage zn-planpage--edit">
      <h1 className="zn-planpage__title zn-planpage__title--edit">{t("page.edit.title")}</h1>
      {firstEditWeek > 1 && (
        <button type="button" className="zn-planpage__prev" onClick={() => setPrevWeeks((n) => n + 1)}>
          <ArrowUp size={16} />
          {t("page.edit.loadPrev")}
        </button>
      )}
      {editWeeks.map((n) => {
        const m = n === selectedWeek ? weekModel : buildPlanWeekModel(plan, n, today, workoutOf, log.activities);
        const w = plan.weeks.find((x) => x.weekNumber === n);
        if (!m || !w) return null;
        return (
          <section key={n} className="zn-planpage__editweek" aria-labelledby={`zn-editweek-${n}`}>
            <PlanWeekHeader model={m} headingId={`zn-editweek-${n}`} />
            <PlanDayList
              model={m}
              mode="edit"
              nameOf={nameOf}
              workoutOf={workoutOf}
              raceName={plan.config.raceName}
              intermediateRace={w.intermediateRace}
              blockedDays={new Set([0, 1, 2, 3, 4, 5, 6].filter((d) => actions.isBlocked(n, d)))}
              edit={editActionsFor(n)}
            />
          </section>
        );
      })}
      <PlanEditDock onCancel={edit.cancel} onSave={edit.save} />
    </div>
  );

  return (
    <>
      <SEOHead noindex={true} title={planName} canonical={`/plan/${plan.id}`} />
      {editing ? editBody : (
      <div className="zn-planpage" data-wide={wide || undefined}>
        <div className="zn-planpage__top">
          <Link to="/plans" className="zn-planpage__back">
            <ArrowLeft size={16} />
            {t("page.back")}
          </Link>
          <div className="zn-planpage__tools">
            <button
              type="button"
              className="zn-iconbtn"
              aria-label={t("page.tools.plan")}
              aria-haspopup="dialog"
              onClick={() => setParam("sheet", "plan", false)}
            >
              <Calendar size={20} />
            </button>
            <button
              type="button"
              className="zn-iconbtn"
              aria-label={t("page.tools.edit")}
              onClick={edit.enter}
            >
              <Pencil size={18} />
            </button>
            <PlanMenu
              plan={plan}
              name={planName}
              workoutNames={workoutNames}
              workoutTemplates={templates}
              onShare={isShareablePlan(plan.config) ? share : undefined}
              onEditDates={() => setDialog("dates")}
              onUnavailability={() => setDialog("unavailability")}
              onReschedule={() => actions.previewReschedule(currentWeek)}
              onAddWeek={() => setDialog("addWeek")}
              onDuplicate={() => setDialog("duplicate")}
              onRename={() => setDialog("rename")}
              onDelete={() => setDialog("delete")}
            />
          </div>
        </div>

        <header className="zn-planpage__plan">
          <h1 className="zn-planpage__title">{planName}</h1>
          {raceLine && <p className="zn-planpage__raceline">{raceLine}</p>}
          {(ended || pacesEstimated || plan._lastUndoableChange || placedWeeks.length > 0) && (
            <div className="zn-planpage__notes">
              {ended && <Alert kind="info">{t("view.planEnded")}</Alert>}
              {pacesEstimated && (
                <Alert kind="info" title={t("view.estimatedPacesTitle")}>
                  {t("view.estimatedPaces")} <Link to="/my-zones">{t("view.estimatedPacesLink")}</Link>
                </Alert>
              )}
              {plan._lastUndoableChange && (
                <LastChangePanel
                  label={plan._lastUndoableChange.label}
                  labelEn={plan._lastUndoableChange.labelEn}
                  at={plan._lastUndoableChange.at}
                  onUndo={() => {
                    if (undoLastChange(plan.id)) {
                      reload();
                      toast.info(t("lastChange.undone"));
                    }
                  }}
                />
              )}
              {placedWeeks.length > 0 && (
                <p className="zn-planpage__placed">
                  {t("view.placedWeeks.label")}
                  {placedWeeks.map((w) => (
                    <Link key={w.id} to={`/weeks/${w.id}`}>
                      {t("view.placedWeeks.item", { name: w.name, n: w.weekNumber })}
                    </Link>
                  ))}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="zn-planpage__grid">
          <div className="zn-planpage__side" ref={weekTopRef}>
            <PlanWeekHeader model={weekModel} onNavigate={setWeekParam} />
            <WeekDayBars model={weekModel} />
            {rings && (
              <WeekRings model={rings} metric={metric} onMetricChange={pickMetric} variant="card" showHead={false} />
            )}
            <div ref={sentinel} className="zn-planpage__sentinel" aria-hidden="true" />
          </div>

          <section className="zn-planpage__week" aria-label={t("page.week.sessions", { n: selectedWeek })}>
            {plan.weeks.every((w) => w.sessions.length === 0) && (
              <div className="zn-planpage__emptyplan">
                <p>{t("page.empty.title")}</p>
                <Button variant="outline" onClick={edit.enter}>
                  <Pencil />
                  {t("page.empty.action")}
                </Button>
              </div>
            )}
            <PlanDayList
              model={weekModel}
              mode="read"
              nameOf={nameOf}
              workoutOf={workoutOf}
              raceName={plan.config.raceName}
              intermediateRace={week.intermediateRace}
              blockedDays={blockedDays}
              onStatus={(index, anchor) => setCompletion({ week: selectedWeek, index, anchor })}
              onOpen={(index) => openSession(selectedWeek, index)}
              onOpenActivity={log.edit}
              footer={footer}
            />

            {auditFindings.length > 0 && (
              <section className="zn-planpage__review" aria-labelledby="zn-planpage-review">
                <h2 id="zn-planpage-review" className="zn-planpage__h2">
                  {t("page.review")}
                </h2>
                <PlanAuditPanel findings={auditFindings} onFix={actions.fixFinding} onGoToWeek={goToWeek} />
              </section>
            )}
          </section>
        </div>

        {!wide && rings && (
          <div className="zn-weekstrip" data-on={stripOn || undefined} aria-hidden="true">
            <span className="zn-weekstrip__week">
              {t("page.week.title", { n: selectedWeek })}
              <small>{f.range(weekModel.from, weekModel.to)}</small>
            </span>
            <span className="zn-weekstrip__rings">
              {ringValues.map(({ ring, state, value }) => (
                <span key={ring.kind} className="zn-weekstrip__ring">
                  <WeekRing
                    kind={ring.kind}
                    state={state}
                    reference={rings.reference}
                    segments={ring.kind === "strength" && rings.reference === "plan" ? ring.targetSessions : 0}
                    size="strip"
                  />
                  <span>{value}</span>
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
      )}

      <PlanSheet
        open={sheet === "plan"}
        onOpenChange={(open) => {
          if (!open) setParam("sheet", null);
        }}
        plan={plan}
        model={cardModel}
        selectedWeek={selectedWeek}
        currentWeek={currentWeek}
        side={wide ? "right" : "bottom"}
        onSelectWeek={(n) => {
          setSearchParams(
            (prev) => {
              prev.set("week", String(n));
              prev.delete("sheet");
              return prev;
            },
            { replace: true },
          );
        }}
        onLogActivity={() => log.logOn()}
      />

      <PlanDialogs
        plan={plan}
        planName={planName}
        dialog={dialog}
        onClose={() => setDialog(null)}
        selectedWeek={selectedWeek}
        workoutNames={workoutNames}
        actions={actions}
        reload={reload}
        onDuplicated={(newId) => navigate(`/plan/${newId}`)}
        onDeleted={() => navigate("/plans")}
      />

      <WeekSessionSheet
        target={activitySheetTarget}
        commuteProfileMin={commuteProfileMin}
        onClose={() => setActivityTarget(null)}
        onSave={(index, next) => {
          if (activityTarget && actions.saveSession(activityTarget.week, index, next)) setActivityTarget(null);
        }}
        onView={() => {}}
        onMove={(index, day) => {
          if (activityTarget) actions.moveTo(activityTarget.week, index, activityTarget.week, day);
        }}
        onDelete={(index) => {
          if (activityTarget) actions.removeSession(activityTarget.week, index);
        }}
      />

      <SessionCompletionPanel
        open={completion !== null}
        onOpenChange={(open) => {
          if (!open) setCompletion(null);
        }}
        session={completionSession}
        weekNumber={completion?.week ?? 0}
        sessionName={completionSession ? nameOf(completionSession) : ""}
        onSave={(data) => {
          if (completion && actions.saveCompletion(completion.week, completion.index, data)) setCompletion(null);
        }}
        anchorElement={completion?.anchor ?? null}
      />

      <ActivityLogPanel {...log.panel} />

      <MoveSessionDialog
        plan={plan}
        target={moveTarget}
        weeks={editWeeks}
        onClose={() => setMoveTarget(null)}
        onMove={(toWeek, toDay) => {
          const target = moveTarget;
          setMoveTarget(null);
          if (target) step(() => actions.moveTo(target.week, target.index, toWeek, toDay));
        }}
      />

      <ChangeSessionSheet
        target={changeTarget}
        current={changeTarget ? workoutOf(changeTarget.session.workoutId) : undefined}
        side={wide ? "right" : "bottom"}
        onClose={() => setChangeTarget(null)}
        onPick={pickChange}
      />

      <PlanWorkoutPanel
        isOpen={addTarget !== null}
        onClose={() => setAddTarget(null)}
        onSelectWorkout={(workoutId) => {
          const target = addTarget;
          setAddTarget(null);
          if (target) step(() => actions.addWorkout(workoutId, target.week, target.day));
        }}
      />

      <Dialog open={edit.leaving} onOpenChange={(open) => !open && edit.stay()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("page.edit.leaveTitle")}</DialogTitle>
            <DialogDescription>{t("page.edit.leaveBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={edit.stay}>
              {t("page.edit.leaveStay")}
            </Button>
            <Button variant="destructive" onClick={edit.cancel}>
              {t("page.edit.leaveDiscard")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
