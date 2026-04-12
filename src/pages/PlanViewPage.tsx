import { useState, useEffect, useMemo, useCallback } from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useParams, useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  Star,
  Trash2,
  Flag,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  AlertTriangle,
  Shuffle,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlans";
import { deletePlan, getPlan, savePlan, updatePlanSession, moveSession, deleteSessionFromPlan, addSessionToPlan, updateSessionCompletion } from "@/lib/planStorage";
import { adaptPlan } from "@/lib/planGenerator/adapt";
import { getWorkoutById } from "@/data/workouts";
import { computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { useIsEnglish, usePickLang, usePickLocale } from "@/lib/i18n-utils";
import { PlanStatsSection } from "@/components/domain/PlanStatsSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { WorkoutTemplate } from "@/types";
import { toast } from "sonner";
import { SwapSessionDialog } from "@/components/domain/SwapSessionDialog";
import { SessionCompletionSheet } from "@/components/domain/SessionCompletionSheet";
import { UnavailabilityManager } from "@/components/domain/UnavailabilityManager";
import { ReschedulePreviewDialog } from "@/components/domain/ReschedulePreviewDialog";
import { autoReschedule } from "@/lib/planGenerator/reschedule";
import { updateUnavailabilities, undoLastChange, withUndoSnapshot } from "@/lib/planStorage";
import { getPlanMonday, dateToWeekAndDay } from "@/lib/planDates";
import type { AutoChange, PlanSession as PlanSessionType, Unavailability } from "@/types/plan";
import { PlanCalendar } from "@/components/domain/PlanCalendar";
import { PlanWeeklyView } from "@/components/domain/PlanWeeklyView";
import { PlanMonthlyView } from "@/components/domain/PlanMonthlyView";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import { LastChangePanel } from "@/components/domain/LastChangePanel";
import { PlanViewModeSelector } from "@/components/domain/PlanViewModeSelector";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { usePlanViewMode } from "@/hooks/usePlanViewMode";
import { getCurrentWeek } from "@/lib/planUtils";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { applyWeekValidationDecision, getUnresolvedSessions, getWeekResolutionSummary, type UnresolvedSessionPreview } from "@/lib/weekValidation";

function formatDate(isoDate: string, isEn: boolean): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PlanViewPage() {
  usePageHint("plan-calendar", "hints.planCalendar.title", "hints.planCalendar.description");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("plan");
  const isEn = useIsEnglish();
  const pick = usePickLang();
  const pickLocale = usePickLocale();

  // Week persistence via URL search params (?week=N)
  const [searchParams, setSearchParams] = useSearchParams();
  const weekParam = searchParams.get("week");
  const weekFromUrl = weekParam ? parseInt(weekParam, 10) : null;

  const setWeekParam = useCallback((week: number) => {
    setSearchParams((prev) => {
      prev.set("week", String(week));
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  // Restore scroll position when returning from workout detail
  const returnState = location.state as { returnScrollY?: number } | null;
  useEffect(() => {
    if (returnState?.returnScrollY != null) {
      requestAnimationFrame(() => {
        window.scrollTo(0, returnState.returnScrollY!);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { plan, isLoading, reload: reloadPlan } = usePlan(id);
  const { planViewMode, setPlanViewMode } = usePlanViewMode();

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [workoutNames, setWorkoutNames] = useState<Record<string, string>>({});
  const [workoutTemplates, setWorkoutTemplates] = useState<Record<string, WorkoutTemplate>>({});
  const [swapTarget, setSwapTarget] = useState<{
    weekNumber: number;
    sessionIndex: number;
    workoutId: string;
    sessionType: string;
  } | null>(null);
  const [showWorkoutPanel, setShowWorkoutPanel] = useState(false);
  const [addTarget, setAddTarget] = useState<{ weekNumber: number; day: number } | null>(null);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [editStartDate, setEditStartDate] = useState("");
  const [completionTarget, setCompletionTarget] = useState<{ weekNumber: number; sessionIndex: number } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [pendingWeekValidation, setPendingWeekValidation] = useState<{
    weekNumber: number;
    unresolved: number;
    unresolvedSessions: UnresolvedSessionPreview[];
  } | null>(null);
  const [showUnavailabilityManager, setShowUnavailabilityManager] = useState(false);
  const [reschedulePreview, setReschedulePreview] = useState<{
    changes: AutoChange[];
    unplaced: PlanSessionType[];
    updatedPlan: import("@/types/plan").TrainingPlan;
  } | null>(null);

  const currentWeek = useMemo(() => {
    if (!plan) return 0;
    const referenceDate = plan.config.startDate || plan.config.createdAt;
    return getCurrentWeek(referenceDate);
  }, [plan]);

  // Effective initial week: URL param (clamped) > current training week
  const initialWeek = useMemo(() => {
    if (weekFromUrl != null && plan) {
      return Math.max(1, Math.min(weekFromUrl, plan.totalWeeks));
    }
    return currentWeek;
  }, [weekFromUrl, currentWeek, plan]);

  const parsedPlanStart = useMemo(() => {
    if (!plan) return null;
    const raw = plan.config.startDate || plan.config.createdAt;
    if (!raw) return null;
    const dateOnly = raw.split("T")[0];
    const [y, m, d] = dateOnly.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    // Normalize to Monday of that week (same logic as PlanCalendar)
    const jsDay = date.getDay();
    const offset = jsDay === 0 ? -6 : 1 - jsDay;
    date.setDate(date.getDate() + offset);
    return date;
  }, [plan]);

  const blockedDaysSet = useMemo(() => {
    if (!plan) return new Set<string>();
    const set = new Set<string>();
    const unavails = plan.config.unavailabilities ?? [];
    if (unavails.length === 0) return set;
    const monday = getPlanMonday(plan);
    for (const u of unavails) {
      const [y, m, d] = u.date.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const result = dateToWeekAndDay(monday, dateObj);
      if (result) set.add(`${result.weekNumber}-${result.dayOfWeek}`);
    }
    return set;
  }, [plan]);

  // Auto-expand current week
  useEffect(() => {
    if (currentWeek > 0) {
      setExpandedWeeks(new Set([currentWeek]));
    }
  }, [currentWeek]);

  // Auto-open workout panel for empty free plans
  useEffect(() => {
    if (
      plan &&
      plan.config.planMode === "free" &&
      plan.weeks.every((w) => w.sessions.length === 0)
    ) {
      setShowWorkoutPanel(true);
    }
  }, [plan]);

  // Load workout names
  useEffect(() => {
    if (!plan) return;
    const workoutIds = new Set<string>();
    for (const week of plan.weeks) {
      for (const session of week.sessions) {
        if (session.workoutId && session.workoutId !== "__race_day__") {
          workoutIds.add(session.workoutId);
        }
      }
    }
    Promise.all(
      Array.from(workoutIds).map(async (wid) => {
        const workout = await getWorkoutById(wid);
        return [wid, workout] as [string, WorkoutTemplate | undefined];
      })
    ).then((results) => {
      const names: Record<string, string> = {};
      const templates: Record<string, WorkoutTemplate> = {};
      for (const [wid, workout] of results) {
        if (workout) {
          names[wid] = pick(workout, "name");
          templates[wid] = workout;
        }
      }
      // Add activity labels
      const activityKeys: Record<string, string> = {
        __activity_strength__: "strength",
        __activity_cycling__: "cycling",
        __activity_swimming__: "swimming",
        __activity_yoga__: "yoga",
        __activity_rest__: "rest",
        __activity_cross_training__: "cross_training",
      };
      for (const [aid, key] of Object.entries(activityKeys)) {
        names[aid] = t(`activity.${key}`);
      }
      setWorkoutNames(names);
      setWorkoutTemplates(templates);
    });
  }, [plan, isEn, t]);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  };

  const handleDelete = () => {
    if (!plan) return;
    deletePlan(plan.id);
    navigate("/plans");
  };



  const handleSwapSession = useCallback((workout: WorkoutTemplate) => {
    if (!plan || !swapTarget) return;

    const week = plan.weeks.find(w => w.weekNumber === swapTarget.weekNumber);
    if (!week) return;

    const originalIndex = week.sessions.findIndex(s => s.workoutId === swapTarget.workoutId);
    if (originalIndex === -1) return;

    const success = updatePlanSession(plan.id, swapTarget.weekNumber, originalIndex, workout.id);
    if (success) {
      reloadPlan();
      toast.success(t("view.sessionReplaced"));
    } else {
      toast.error(t("view.sessionUpdateFailed"));
    }
    setSwapTarget(null);
  }, [plan, swapTarget, isEn, reloadPlan]);

  const handleSessionMove = useCallback((
    fromWeek: number,
    fromSessionIndex: number,
    toWeek: number,
    toDay: number,
  ) => {
    if (!plan) return;
    const success = moveSession(plan.id, fromWeek, fromSessionIndex, toWeek, toDay);
    if (success) {
      reloadPlan();
      toast.success(t("view.sessionMoved"));
    } else {
      toast.error(t("view.sessionMoveFailed"));
    }
  }, [plan, isEn, reloadPlan]);

  const handleSessionDelete = useCallback((weekNumber: number, sessionIndex: number) => {
    if (!plan) return;
    const success = deleteSessionFromPlan(plan.id, weekNumber, sessionIndex);
    if (success) {
      reloadPlan();
      toast.success(t("view.sessionDeleted"));
    } else {
      toast.error(t("view.sessionDeleteFailed"));
    }
  }, [plan, isEn, reloadPlan]);

  // Run adaptation on a week if all sessions are resolved
  const runAdaptationIfReady = useCallback((weekNumber: number, showToast: boolean) => {
    if (!plan) return;

    // Re-read fresh data from storage via getPlan (not raw localStorage)
    const freshPlan = getPlan(plan.id);
    if (!freshPlan) return;

    const freshWeek = freshPlan.weeks.find((w: { weekNumber: number }) => w.weekNumber === weekNumber);
    if (!freshWeek) return;

    // Check if all sessions are resolved (completed / modified / skipped)
    const allResolved = freshWeek.sessions.every(
      (s: { status?: string }) => s.status === "completed" || s.status === "modified" || s.status === "skipped"
    );
    if (!allResolved) return;

    const result = adaptPlan(freshPlan, weekNumber);
    if (result.adapted) {
      if (!savePlan(freshPlan)) {
        toast.error(t("errors.planSaveFailed"));
        return;
      }
      reloadPlan();
      for (const change of result.changes) {
        toast.info(pick(change, "description"), { duration: 5000 });
      }
    } else if (showToast) {
      toast.success(t("view.weekValidated", { week: weekNumber }));
    }
  }, [plan, isEn, reloadPlan]);

  const handleToggleComplete = useCallback((weekNumber: number, sessionIndex: number) => {
    if (!plan) return;
    const week = plan.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;
    const session = week.sessions[sessionIndex];
    if (!session) return;
    // Open the completion sheet for this session
    setCompletionTarget({ weekNumber, sessionIndex });
  }, [plan]);

  const handleCompletionSave = useCallback((data: import("@/lib/planStorage").SessionCompletionData) => {
    if (!plan || !completionTarget) return;
    const { weekNumber, sessionIndex } = completionTarget;
    const success = updateSessionCompletion(plan.id, weekNumber, sessionIndex, data);
    if (!success) {
      toast.error(t("errors.planSaveFailed"));
      return;
    }
    reloadPlan();
    toast.success(t("completion.saved"));
    setCompletionTarget(null);
    // Auto-trigger adaptation if all sessions in the week are now resolved
    runAdaptationIfReady(weekNumber, false);
  }, [plan, completionTarget, reloadPlan, runAdaptationIfReady, t]);

  const handleWeekValidationDecision = useCallback((decision: "mark_skipped" | "keep_unresolved") => {
    if (!plan || !pendingWeekValidation) return;

    const week = plan.weeks.find((w) => w.weekNumber === pendingWeekValidation.weekNumber);
    if (!week) return;

    const result = applyWeekValidationDecision(week, decision);
    for (const index of result.changedSessionIndexes) {
      updateSessionCompletion(plan.id, pendingWeekValidation.weekNumber, index, {
        status: "skipped",
      });
    }

    setPendingWeekValidation(null);
    reloadPlan();

    if (decision === "mark_skipped") {
      runAdaptationIfReady(week.weekNumber, true);
      return;
    }

    toast.info(t("completion.keptForLater", { count: result.updatedSessions.filter((session) => !session.status || session.status === "planned").length }));
  }, [plan, pendingWeekValidation, reloadPlan, runAdaptationIfReady, t]);

  // Validate an entire week: if unresolved sessions remain, ask what to do instead of skipping silently
  const handleValidateWeek = useCallback((weekNumber: number) => {
    if (!plan) return;
    const week = plan.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;

    const summary = getWeekResolutionSummary(week);
    if (summary.unresolved > 0) {
      setPendingWeekValidation({
        weekNumber,
        unresolved: summary.unresolved,
        unresolvedSessions: getUnresolvedSessions(week),
      });
      return;
    }

    runAdaptationIfReady(weekNumber, true);
  }, [plan, reloadPlan, runAdaptationIfReady]);

  const handleSessionClick = useCallback((weekNumber: number, sessionIndex: number, workoutId: string) => {
    if (workoutId && workoutId !== "__race_day__" && !workoutId.startsWith("__activity_")) {
      // Persist current week in URL before navigating away so browser back restores it
      const url = new URL(window.location.href);
      url.searchParams.set("week", String(weekNumber));
      window.history.replaceState(window.history.state, "", url.toString());

      // Find the session to pass volume info for scaled duration display (#32)
      const week = plan?.weeks.find((w) => w.weekNumber === weekNumber);
      const session = week?.sessions[sessionIndex];
      navigate(`/workout/${workoutId}`, {
        state: {
          from: "plan",
          planId: plan?.id,
          planName: plan ? pick(plan, "name") : "",
          weekNumber,
          volumePercent: week?.volumePercent,
          estimatedDurationMin: session?.estimatedDurationMin,
          targetDistanceKm: session?.targetDistanceKm,
          scrollY: window.scrollY,
        },
      });
    }
  }, [plan, isEn, navigate]);

  const handleAddToDay = useCallback((weekNumber: number, day: number) => {
    setAddTarget({ weekNumber, day });
    setShowWorkoutPanel(true);
  }, []);

  const handleWorkoutAdd = useCallback(async (workoutId: string, weekNumber: number, day: number) => {
    if (!plan) return;
    // Handle cross-training activities (__activity_strength__, etc.)
    const activityMatch = workoutId.match(/^__activity_(\w+)__$/);
    if (activityMatch) {
      const activityType = activityMatch[1];
      const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
      if (!week) return;
      week.sessions.push({
        dayOfWeek: day,
        workoutId,
        sessionType: activityType as import("@/types").SessionType,
        isKeySession: false,
        estimatedDurationMin: 0,
      });
      week.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      if (!savePlan(plan)) {
        toast.error(t("errors.planSaveFailed"));
        return;
      }
      reloadPlan();
      toast.success(t("view.activityAdded"));
      return;
    }

    const success = await addSessionToPlan(plan.id, weekNumber, workoutId, day);
    if (success) {
      reloadPlan();
      toast.success(t("view.workoutAdded"));
    } else {
      toast.error(t("view.workoutAddFailed"));
    }
  }, [plan, isEn, reloadPlan]);

  const handleSaveUnavailabilities = useCallback((items: Unavailability[]) => {
    if (!plan) return;
    updateUnavailabilities(plan.id, items);
    reloadPlan();
    toast.success(t("unavailability.saved"));
    setShowUnavailabilityManager(false);
  }, [plan, reloadPlan, t]);

  const handleReschedule = useCallback(() => {
    if (!plan) return;
    const result = autoReschedule(plan, currentWeek > 0 ? currentWeek : 1);
    setReschedulePreview({
      changes: result.changes,
      unplaced: result.unplaced,
      updatedPlan: result.updatedPlan,
    });
  }, [plan, currentWeek]);

  const handleApplyReschedule = useCallback(() => {
    if (!plan || !reschedulePreview) return;

    const success = withUndoSnapshot(
      plan.id,
      "reschedule",
      `Replanification a partir de la semaine ${currentWeek > 0 ? currentWeek : 1}`,
      `Rescheduling from week ${currentWeek > 0 ? currentWeek : 1}`,
      (mutablePlan) => {
        mutablePlan.weeks = reschedulePreview.updatedPlan.weeks;
        mutablePlan.config = reschedulePreview.updatedPlan.config;
        return reschedulePreview.changes;
      },
    );

    if (!success) {
      toast.error(t("errors.planSaveFailed"));
      return;
    }
    reloadPlan();
    setReschedulePreview(null);
    toast.success(t("reschedule.applied"), {
      action: {
        label: t("reschedule.undo"),
        onClick: () => {
          if (undoLastChange(plan.id)) {
            reloadPlan();
            toast.info(t("reschedule.undone"));
          }
        },
      },
      duration: 10000,
    });
  }, [plan, reschedulePreview, currentWeek, reloadPlan, t]);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 404 state
  if (!plan) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          {t("view.notFound")}
        </p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/plans">
            <ArrowLeft className="mr-2 size-4" />
            {t("view.backToPlans")}
          </Link>
        </Button>
      </div>
    );
  }

  const isFreePlan = plan.config.planMode === "free";
  const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
  const planName = plan.config.planName || (isFreePlan
    ? plan.name
    : pick(plan, "name"));
  const raceDate = plan.config.raceDate;

  return (
    <>
      <SEOHead
        noindex={true}
        title={planName}
        canonical={`/plan/${plan.id}`}
      />
      <div className="py-8 space-y-6">
        {/* Back Link */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/plans">
            <ArrowLeft className="mr-2 size-4" />
            {t("view.backToPlans")}
          </Link>
        </Button>

        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            {isEditingName ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  const trimmed = editName.trim();
                  if (trimmed && trimmed !== planName) {
                    plan.config.planName = trimmed;
                    if (savePlan(plan)) {
                      reloadPlan();
                      toast.success(t("view.nameUpdated"));
                    } else {
                      toast.error(t("errors.planSaveFailed"));
                    }
                  }
                  setIsEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className="text-3xl font-bold bg-transparent border-b-2 border-primary outline-none w-full"
              />
            ) : (
              <h1
                className="text-3xl font-bold cursor-pointer group flex items-center gap-2"
                onClick={() => { setEditName(planName); setIsEditingName(true); }}
                title={t("view.clickToRename")}
              >
                {planName}
                <Pencil className="size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h1>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {raceMeta && (
                <Badge variant="default">
                  {pick(raceMeta, "label")}
                </Badge>
              )}
              {isFreePlan && (
                <Badge variant="secondary">
                  {t("view.freePlan")}
                </Badge>
              )}
              {plan.config.planMode === "prebuilt" && (
                <Badge variant="secondary">
                  {t("view.prebuilt")}
                </Badge>
              )}
              {raceDate && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>
                    {formatDate(plan.config.createdAt, isEn)} →{" "}
                    {formatDate(raceDate, isEn)}
                  </span>
                </div>
              )}
              {plan.raceTimePrediction && (
                <Badge variant="secondary">
                  <Clock className="size-3 mr-1" />
                  {plan.raceTimePrediction}
                </Badge>
              )}
              {plan.config.startDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>
                    {new Date(plan.config.startDate).toLocaleDateString(isEn ? "en-US" : "fr-FR")}
                    {plan.config.endDate && (
                      <>{" "}&rarr; {new Date(plan.config.endDate).toLocaleDateString(isEn ? "en-US" : "fr-FR")}</>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setEditStartDate(plan.config.startDate || "");
                      setShowDateDialog(true);
                    }}
                    title={t("view.editDates")}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              )}
              {!plan.config.startDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-sm"
                  onClick={() => {
                    setEditStartDate("");
                    setShowDateDialog(true);
                  }}
                >
                  <Plus className="size-3.5 mr-1" />
                  {t("view.addDates")}
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowUnavailabilityManager(true)}
            >
              <Calendar className="size-4" />
              <span className="ml-1 hidden sm:inline">{t("unavailability.title")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={(plan.config.unavailabilities ?? []).length === 0}
              onClick={handleReschedule}
            >
              <Shuffle className="size-4" />
              <span className="ml-1 hidden sm:inline">{t("reschedule.button")}</span>
            </Button>
            <PlanExportMenu
              plan={plan}
              workoutNames={workoutNames}
              workoutTemplates={workoutTemplates}
              size="sm"
            />
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full"
              onClick={() => setShowDeleteDialog(true)}
              title={t("view.delete")}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Phase Timeline */}
        {plan.phases.length > 0 && (
          <Card size="compact">
            <CardContent className="px-4">
              <p className="text-sm font-medium mb-2">
                {t("view.phases")}
              </p>
              <div className="flex rounded-full overflow-hidden h-3">
                {plan.phases.map((phaseRange) => {
                  const meta = PHASE_META[phaseRange.phase];
                  const widthPercent =
                    ((phaseRange.endWeek - phaseRange.startWeek + 1) /
                      plan.totalWeeks) *
                    100;
                  return (
                    <div
                      key={`${phaseRange.phase}-${phaseRange.startWeek}`}
                      className={cn(meta.color, "relative")}
                      style={{ width: `${widthPercent}%` }}
                      title={`${pick(meta, "label")} (S${phaseRange.startWeek}-S${phaseRange.endWeek})`}
                    >
                      {/* Current week marker */}
                      {currentWeek >= phaseRange.startWeek &&
                        currentWeek <= phaseRange.endWeek && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-foreground"
                            style={{
                              left: `${((currentWeek - phaseRange.startWeek) / (phaseRange.endWeek - phaseRange.startWeek + 1)) * 100}%`,
                            }}
                          />
                        )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {plan.phases.map((phaseRange) => {
                  const meta = PHASE_META[phaseRange.phase];
                  return (
                    <div
                      key={`legend-${phaseRange.phase}-${phaseRange.startWeek}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <div className={cn("size-2.5 rounded-full", meta.color)} />
                      <span>{pick(meta, "label")}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Undo last change panel */}
        {plan._lastUndoableChange && (
          <LastChangePanel
            label={plan._lastUndoableChange.label}
            labelEn={plan._lastUndoableChange.labelEn}
            at={plan._lastUndoableChange.at}
            onUndo={() => {
              if (undoLastChange(plan.id)) {
                reloadPlan();
                toast.info(t("lastChange.undone"));
              }
            }}
          />
        )}

        {/* Programme / Statistiques toggle */}
        <Tabs defaultValue="programme">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="programme">{t("view.schedule")}</TabsTrigger>
            <TabsTrigger value="stats">{t("view.statistics")}</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4">
            <PlanStatsSection plan={plan} currentWeek={currentWeek} />
          </TabsContent>

          <TabsContent value="programme" className="mt-4 space-y-4">

        {/* View mode toggle + export */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowWorkoutPanel(v => !v)}
              className="rounded-full hidden md:inline-flex"
            >
              <Plus className="size-4" />
              <span className="ml-1">{t("view.addWorkout")}</span>
            </Button>
            <PlanViewModeSelector value={planViewMode} onChange={setPlanViewMode} />
          </div>
        </div>

        {/* Completion legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border-2 border-muted-foreground/30 inline-block" />
            {t("completion.planned")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-green-500 inline-block" />
            {t("completion.completed")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-muted border border-muted-foreground/30 inline-flex items-center justify-center">
              <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </span>
            {t("completion.skipped")}
          </span>
          <span className="text-muted-foreground/50">
            {t("completion.hint")}
          </span>
          <span className="text-muted-foreground/50 hidden md:inline">
            {"· "}{t("view.rightClickOptions")}
          </span>
          <span className="text-muted-foreground/50 md:hidden">
            {"· "}{t("view.longPressOptions")}
          </span>
        </div>

        {/* Calendar View */}
        {planViewMode === "calendar" && (
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <PlanCalendar
                plan={plan}
                workoutNames={workoutNames}
                currentWeek={currentWeek}
                initialWeek={initialWeek}
                isEn={isEn}
                onSessionClick={handleSessionClick}
                onSessionMove={handleSessionMove}
                onSessionDelete={handleSessionDelete}
                onToggleComplete={handleToggleComplete}
                onValidateWeek={handleValidateWeek}
                onWorkoutAdd={handleWorkoutAdd}
                onAddToDay={handleAddToDay}
                planStartDate={plan.config.startDate || plan.config.createdAt}
                blockedDays={blockedDaysSet}
              />
            </div>
            {/* Desktop/tablet inline panel */}
            {showWorkoutPanel && (
              <div className="hidden md:block w-[280px] lg:w-[320px] shrink-0">
                <div className="sticky top-20">
                  <PlanWorkoutPanel
                    isOpen={showWorkoutPanel}
                    onClose={() => setShowWorkoutPanel(false)}
                    inline
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weekly View */}
        {planViewMode === "weekly" && (
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <PlanWeeklyView
                plan={plan}
                workoutNames={workoutNames}
                currentWeek={currentWeek}
                initialWeek={initialWeek}
                isEn={isEn}
                onWeekChange={setWeekParam}
                planStartDate={plan.config.startDate || plan.config.createdAt}
                onSessionClick={handleSessionClick}
                onSessionMove={handleSessionMove}
                onSessionDelete={handleSessionDelete}
                onToggleComplete={handleToggleComplete}
                onValidateWeek={handleValidateWeek}
                onWorkoutAdd={handleWorkoutAdd}
                onAddToDay={handleAddToDay}
              />
            </div>
            {showWorkoutPanel && (
              <div className="hidden md:block w-[280px] lg:w-[320px] shrink-0">
                <div className="sticky top-20">
                  <PlanWorkoutPanel
                    isOpen={showWorkoutPanel}
                    onClose={() => setShowWorkoutPanel(false)}
                    inline
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monthly View */}
        {planViewMode === "monthly" && (
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <PlanMonthlyView
                plan={plan}
                workoutNames={workoutNames}
                currentWeek={currentWeek}
                initialWeek={initialWeek}
                isEn={isEn}
                startDate={plan.config.startDate || plan.config.createdAt}
                onSessionClick={handleSessionClick}
                onSessionMove={handleSessionMove}
                onSessionDelete={handleSessionDelete}
                onToggleComplete={handleToggleComplete}
                onValidateWeek={handleValidateWeek}
                onWorkoutAdd={handleWorkoutAdd}
                onAddToDay={handleAddToDay}
                onWeekChange={setWeekParam}
              />
            </div>
            {showWorkoutPanel && (
              <div className="hidden md:block w-[280px] lg:w-[320px] shrink-0">
                <div className="sticky top-20">
                  <PlanWorkoutPanel
                    isOpen={showWorkoutPanel}
                    onClose={() => setShowWorkoutPanel(false)}
                    inline
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Week List */}
        {planViewMode === "list" && (
          <div className="flex gap-4">
          <div className="flex-1 min-w-0 space-y-2">
          {plan.weeks.map((week) => {
            const isExpanded = expandedWeeks.has(week.weekNumber);
            const isCurrent =
              currentWeek === week.weekNumber &&
              currentWeek >= 1 &&
              currentWeek <= plan.totalWeeks;
            const phaseMeta = PHASE_META[week.phase];
            const weekLabel = isEn
              ? week.weekLabelEn || `W${week.weekNumber}`
              : week.weekLabel || `S${week.weekNumber}`;

            let weekDateRange = "";
            if (parsedPlanStart) {
              const shortMonths = isEn
                ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                : ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
              const weekStart = new Date(parsedPlanStart);
              weekStart.setDate(weekStart.getDate() + (week.weekNumber - 1) * 7);
              const weekEnd = new Date(parsedPlanStart);
              weekEnd.setDate(weekEnd.getDate() + (week.weekNumber - 1) * 7 + 6);
              weekDateRange = weekStart.getMonth() === weekEnd.getMonth()
                ? `${weekStart.getDate()}-${weekEnd.getDate()} ${shortMonths[weekStart.getMonth()]}`
                : `${weekStart.getDate()} ${shortMonths[weekStart.getMonth()]} - ${weekEnd.getDate()} ${shortMonths[weekEnd.getMonth()]}`;
            }

            return (
              <Card
                key={week.weekNumber}
                size="flush"
                className={cn(
                  isCurrent && "ring-2 ring-primary"
                )}
              >
                {/* Week Header (clickable) */}
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-2.5 rounded-full shrink-0",
                        phaseMeta.color
                      )}
                    />
                    <div className="min-w-0">
                      <span className="font-medium truncate block">
                        {weekLabel} — {pick(phaseMeta, "label")}
                      </span>
                      {weekDateRange && (
                        <span className="text-xs text-muted-foreground/60 tabular-nums">
                          {weekDateRange}
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <Badge variant="default" className="shrink-0">
                        {t("view.currentWeek")}
                      </Badge>
                    )}
                    {week.isRecoveryWeek && (
                      <Badge variant="secondary" className="shrink-0">
                        {t("calendar.recoveryWeek")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {week.sessions.length > 0 && (
                      <span className="text-xs text-muted-foreground/70 tabular-nums hidden sm:inline">
                        ~{Math.round(computeWeekKm(week))}km · {formatDurationMinutes(computeWeekDuration(week))}
                      </span>
                    )}
                    <span
                      className="text-sm text-muted-foreground"
                      title={t("view.trainingVolume")}
                    >
                      Vol. {week.volumePercent}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Week Sessions (expandable) */}
                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-2">
                    {week.sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">
                        {t("view.noSessionsThisWeek")}
                      </p>
                    ) : (
                      (() => {
                        const sortedSessions = [...week.sessions].sort((a, b) => {
                          const priority = (s: typeof a) => {
                            if (s.workoutId === "__race_day__") return 0;
                            if (s.sessionType === "long_run") return 1;
                            if (s.isKeySession) return 2;
                            if (s.sessionType === "endurance") return 3;
                            return 4;
                          };
                          return priority(a) - priority(b);
                        });
                        return sortedSessions.map((session) => {
                          const isRaceDay =
                            session.workoutId === "__race_day__";
                          const sessionLabel =
                            SESSION_TYPE_LABELS[session.sessionType];
                          const originalIndex = week.sessions.indexOf(session);

                          return (
                            <div
                              key={originalIndex}
                              className={cn(
                                "flex items-start gap-2 sm:gap-3 rounded-lg p-2.5 sm:p-3",
                                isRaceDay
                                  ? "bg-primary/10 border border-primary/20"
                                  : session.status === "completed"
                                    ? "bg-green-500/5 ring-1 ring-green-500/20"
                                    : session.status === "skipped"
                                      ? "bg-secondary/30 opacity-60"
                                      : "bg-secondary/50"
                              )}
                            >
                              {/* Completion toggle */}
                              {!isRaceDay && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleComplete(week.weekNumber, originalIndex)}
                                  className={cn(
                                    "size-5 mt-0.5 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                                    session.status === "completed"
                                      ? "bg-green-500 border-green-500 text-white"
                                      : session.status === "skipped"
                                        ? "bg-muted border-muted-foreground/30 text-muted-foreground"
                                        : "border-muted-foreground/30 hover:border-primary"
                                  )}
                                >
                                  {session.status === "completed" && (
                                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M2 6l3 3 5-5" />
                                    </svg>
                                  )}
                                  {session.status === "skipped" && (
                                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 3l6 6M9 3l-6 6" />
                                    </svg>
                                  )}
                                </button>
                              )}

                              {/* Content — stacks on mobile */}
                              <div className="flex-1 min-w-0">
                                {isRaceDay ? (
                                  <div className="flex items-center gap-2">
                                    <Flag className="size-4 text-primary" />
                                    <span className="font-semibold text-primary">
                                      {t("view.raceDay")}
                                    </span>
                                  </div>
                                ) : session.workoutId.startsWith("__activity_") ? (
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {workoutNames[session.workoutId] || session.workoutId}
                                  </span>
                                ) : (
                                  <>
                                    <Link
                                      to={`/workout/${session.workoutId}`}
                                      state={{ from: "plan", planId: plan.id, planName: planName }}
                                      className="text-sm font-medium hover:underline line-clamp-1"
                                    >
                                      {workoutNames[session.workoutId] ||
                                        session.workoutId}
                                    </Link>
                                    {pick(session, "notes") && (
                                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                        {pick(session, "notes")}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Badges — wraps on mobile */}
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                                {session.isKeySession && (
                                  <Star className="size-3.5 sm:size-4 text-yellow-500 fill-yellow-500" />
                                )}
                                {!isRaceDay && sessionLabel && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline-flex">
                                    {pickLocale(sessionLabel)}
                                  </Badge>
                                )}
                                {!isRaceDay && !session.workoutId.startsWith("__activity_") && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {formatDurationMinutes(session.estimatedDurationMin)}
                                    {session.targetDistanceKm != null && session.targetDistanceKm > 0 && (
                                      <span> · {session.sessionType !== "long_run" && "~"}{session.targetDistanceKm}km</span>
                                    )}
                                  </span>
                                )}
                                {!isRaceDay && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSwapTarget({
                                          weekNumber: week.weekNumber,
                                          sessionIndex: originalIndex,
                                          workoutId: session.workoutId,
                                          sessionType: session.sessionType,
                                        });
                                      }}
                                      title={t("view.replaceSession")}
                                    >
                                      <span className="text-xs">{"\u21c4"}</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSessionDelete(week.weekNumber, originalIndex);
                                      }}
                                      title={t("view.removeSession")}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                    {/* Validate week button — shown when some sessions are resolved but not all */}
                    {(() => {
                      const resolved = week.sessions.filter(s => s.status === "completed" || s.status === "skipped").length;
                      const total = week.sessions.length;
                      const allDone = resolved === total;
                      const hasResolved = resolved > 0;

                      if (allDone && hasResolved) {
                        return (
                          <div className="mt-2 text-center text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1.5">
                            <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                            {t("completion.validated")}
                          </div>
                        );
                      }

                      if (hasResolved && !allDone) {
                        return (
                          <button
                            type="button"
                            onClick={() => handleValidateWeek(week.weekNumber)}
                            className="mt-2 w-full rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 p-2 flex items-center justify-center gap-2 text-primary text-sm font-medium transition-colors"
                          >
                            <svg viewBox="0 0 12 12" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                            {t("completion.validate", { done: resolved, total })}
                          </button>
                        );
                      }

                      return null;
                    })()}

                    {/* Mobile: add session button */}
                    <button
                      type="button"
                      onClick={() => {
                        setAddTarget({ weekNumber: week.weekNumber, day: 0 });
                        setShowWorkoutPanel(true);
                      }}
                      className="md:hidden w-full mt-1 rounded-lg border border-dashed border-muted-foreground/30 p-2.5 flex items-center justify-center gap-2 text-muted-foreground/50 active:text-primary transition-colors"
                    >
                      <Plus className="size-4" />
                      <span className="text-sm">{t("view.add")}</span>
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
          {/* List view inline panel (tap to add, no drag) */}
          {showWorkoutPanel && (
            <div className="hidden md:block w-[280px] lg:w-[320px] shrink-0">
              <div className="sticky top-20">
                <PlanWorkoutPanel
                  isOpen={showWorkoutPanel}
                  onClose={() => setShowWorkoutPanel(false)}
                  inline
                  onSelectWorkout={(workoutId) => {
                    // Add to current week, first available day
                    const targetWeek = Math.max(1, currentWeek);
                    handleWorkoutAdd(workoutId, targetWeek, 0);
                  }}
                />
              </div>
            </div>
          )}
        </div>
        )}

          </TabsContent>
        </Tabs>

        {/* Unavailability Manager Sheet */}
        <UnavailabilityManager
          open={showUnavailabilityManager}
          onOpenChange={setShowUnavailabilityManager}
          planId={plan.id}
          unavailabilities={plan.config.unavailabilities ?? []}
          onSave={handleSaveUnavailabilities}
        />

        {/* Reschedule Preview Dialog */}
        <ReschedulePreviewDialog
          open={reschedulePreview !== null}
          onOpenChange={(open) => { if (!open) setReschedulePreview(null); }}
          changes={reschedulePreview?.changes ?? []}
          unplaced={reschedulePreview?.unplaced ?? []}
          onApply={handleApplyReschedule}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("view.deleteTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("view.deleteConfirm", { name: planName })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  {t("view.cancel")}
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-4" />
                {t("view.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={pendingWeekValidation !== null}
          onOpenChange={(open) => {
            if (!open) setPendingWeekValidation(null);
          }}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("completion.confirmTitle")}</DialogTitle>
              <DialogDescription>
                {t("completion.confirmDescription", {
                  count: pendingWeekValidation?.unresolved ?? 0,
                  week: pendingWeekValidation?.weekNumber ?? 0,
                })}
              </DialogDescription>
            </DialogHeader>
            {pendingWeekValidation && pendingWeekValidation.unresolvedSessions.length > 0 && (
              <ul className="text-sm space-y-1 max-h-48 overflow-y-auto rounded-md border bg-muted/30 p-2">
                {pendingWeekValidation.unresolvedSessions.map((s, i) => {
                  const label = SESSION_TYPE_LABELS[s.sessionType];
                  return (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate min-w-0">
                        {t(`daysShort.${s.dayOfWeek}`)} — {label ? pickLocale(label) : s.sessionType}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {s.estimatedDurationMin} min
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                className="w-full shrink min-w-0 whitespace-normal text-center h-auto min-h-10 py-2"
                onClick={() => handleWeekValidationDecision("mark_skipped")}
              >
                {t("completion.markRemainingSkipped")}
              </Button>
              <Button
                variant="outline"
                className="w-full shrink min-w-0 whitespace-normal text-center h-auto min-h-10 py-2"
                onClick={() => handleWeekValidationDecision("keep_unresolved")}
              >
                {t("completion.keepForLater")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Date Edit Dialog */}
        <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("view.editDatesTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("view.editDatesDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label htmlFor="edit-start-date" className="text-sm font-medium mb-2 block">
                  {t("view.startDate")}
                </label>
                <input
                  id="edit-start-date"
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Quick action: next Monday */}
              {(() => {
                const now = new Date();
                const dayOfWeek = now.getDay();
                const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
                const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
                const nextMondayStr = nextMonday.toISOString().split("T")[0];
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setEditStartDate(nextMondayStr)}
                  >
                    <Calendar className="size-3.5" />
                    {t("view.startNextMonday")}
                    {" "}({nextMonday.toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "short" })})
                  </Button>
                );
              })()}

              {/* Summary */}
              {editStartDate && (() => {
                const [y, m, d] = editStartDate.split("-").map(Number);
                const startD = new Date(y, m - 1, d);
                const endD = new Date(y, m - 1, d + plan.totalWeeks * 7);
                const weekdayStr = startD.toLocaleDateString(isEn ? "en-US" : "fr-FR", { weekday: "long" });
                const isPast = startD < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

                return (
                  <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground shrink-0" />
                        <span>
                          {t("view.startLabel")} : {startD.toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          {" "}
                          <span className="text-muted-foreground">({weekdayStr})</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag className="size-4 text-muted-foreground shrink-0" />
                        <span>
                          {t("view.endLabel")} : {endD.toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground shrink-0" />
                        <span>{plan.totalWeeks} {t("duration.weeks")}</span>
                      </div>
                    </div>
                    {isPast && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                          {t("view.pastDateWarning")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  {t("view.cancel")}
                </Button>
              </DialogClose>
              <Button
                onClick={() => {
                  if (editStartDate) {
                    const [y, m, d] = editStartDate.split("-").map(Number);
                    const endD = new Date(y, m - 1, d + plan.totalWeeks * 7);
                    plan.config.startDate = editStartDate;
                    plan.config.endDate = endD.toISOString().split("T")[0];
                  } else {
                    delete plan.config.startDate;
                    delete plan.config.endDate;
                  }
                  if (!savePlan(plan)) {
                    toast.error(t("errors.planSaveFailed"));
                    return;
                  }
                  reloadPlan();
                  setShowDateDialog(false);
                  toast.success(t("view.datesUpdated"));
                }}
              >
                {t("view.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workout Library Panel (mobile bottom sheet) */}
        <PlanWorkoutPanel
          isOpen={showWorkoutPanel}
          onClose={() => { setShowWorkoutPanel(false); setAddTarget(null); }}
          onSelectWorkout={addTarget ? (workoutId) => {
            handleWorkoutAdd(workoutId, addTarget.weekNumber, addTarget.day);
            setAddTarget(null);
          } : undefined}
        />

        {/* Swap Session Dialog */}
        <SwapSessionDialog
          open={swapTarget !== null}
          onOpenChange={(open) => !open && setSwapTarget(null)}
          currentWorkoutId={swapTarget?.workoutId ?? ""}
          sessionType={swapTarget?.sessionType ?? ""}
          onSelect={handleSwapSession}
        />
      </div>

      {/* Session completion sheet — opens on checkbox click */}
      {(() => {
        if (!completionTarget) {
          return (
            <SessionCompletionSheet
              open={false}
              onOpenChange={() => setCompletionTarget(null)}
              session={null}
              weekNumber={0}
              sessionName=""
              onSave={handleCompletionSave}
            />
          );
        }
        const targetWeek = plan.weeks.find(w => w.weekNumber === completionTarget.weekNumber);
        const targetSession = targetWeek?.sessions[completionTarget.sessionIndex] ?? null;
        const targetName = targetSession ? (workoutNames[targetSession.workoutId] || targetSession.workoutId) : "";
        return (
          <SessionCompletionSheet
            open={true}
            onOpenChange={(open) => { if (!open) setCompletionTarget(null); }}
            session={targetSession}
            weekNumber={completionTarget.weekNumber}
            sessionName={targetName}
            onSave={handleCompletionSave}
          />
        );
      })()}
    </>
  );
}
