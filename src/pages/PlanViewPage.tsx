import { useState, useEffect, useMemo, useCallback } from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
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
import { exportPlanToICS } from "@/lib/export";
import { computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { PlanStatsSection } from "@/components/domain/PlanStatsSection";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { WorkoutTemplate } from "@/types";
import { toast } from "sonner";
import { IcsExportDialog } from "@/components/domain/IcsExportDialog";
import { SwapSessionDialog } from "@/components/domain/SwapSessionDialog";
import { CompletionFeedbackCard } from "@/components/domain/CompletionFeedbackCard";
import { PlanCalendar } from "@/components/domain/PlanCalendar";
import { PlanWeeklyView } from "@/components/domain/PlanWeeklyView";
import { PlanMonthlyView } from "@/components/domain/PlanMonthlyView";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import { PlanViewModeSelector } from "@/components/domain/PlanViewModeSelector";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { usePlanViewMode } from "@/hooks/usePlanViewMode";
import { getCurrentWeek } from "@/lib/planUtils";

const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  recovery: { fr: "Récupération", en: "Recovery" },
  endurance: { fr: "Endurance", en: "Endurance" },
  tempo: { fr: "Tempo", en: "Tempo" },
  threshold: { fr: "Seuil", en: "Threshold" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  long_run: { fr: "Sortie longue", en: "Long Run" },
  hills: { fr: "Côtes", en: "Hills" },
  fartlek: { fr: "Fartlek", en: "Fartlek" },
  race_specific: { fr: "Allure course", en: "Race Specific" },
  strength: { fr: "Renforcement", en: "Strength" },
  cycling: { fr: "Vélo", en: "Cycling" },
  swimming: { fr: "Natation", en: "Swimming" },
  yoga: { fr: "Yoga", en: "Yoga" },
  cross_training: { fr: "Autre activité", en: "Cross Training" },
};

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
  const { i18n } = useTranslation("plan");
  const isEn = i18n.language?.startsWith("en") ?? false;

  // Read return state from navigation (coming back from workout detail page)
  const returnState = location.state as { returnToWeek?: number; returnScrollY?: number } | null;
  const returnedWeek = returnState?.returnToWeek;

  // Restore scroll position when returning from workout detail
  useEffect(() => {
    if (returnState?.returnScrollY != null) {
      // Defer to allow the page to render first
      requestAnimationFrame(() => {
        window.scrollTo(0, returnState.returnScrollY!);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { plan, isLoading, reload: reloadPlan } = usePlan(id);
  const { planViewMode, setPlanViewMode } = usePlanViewMode();

  // On mobile, only "weekly" and "list" are available
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches && (planViewMode === "calendar" || planViewMode === "monthly")) {
      setPlanViewMode("weekly");
    }
  }, [planViewMode, setPlanViewMode]);

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showIcsDialog, setShowIcsDialog] = useState(false);
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
  const [rpePrompt, setRpePrompt] = useState<{ weekNumber: number; sessionIndex: number } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const currentWeek = useMemo(() => {
    if (!plan) return 0;
    const referenceDate = plan.config.startDate || plan.config.createdAt;
    return getCurrentWeek(referenceDate);
  }, [plan]);

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
          names[wid] = isEn ? workout.nameEn : workout.name;
          templates[wid] = workout;
        }
      }
      // Add activity labels
      const activityLabels: Record<string, { fr: string; en: string }> = {
        __activity_strength__: { fr: "Renforcement", en: "Strength" },
        __activity_cycling__: { fr: "Vélo", en: "Cycling" },
        __activity_swimming__: { fr: "Natation", en: "Swimming" },
        __activity_yoga__: { fr: "Yoga", en: "Yoga" },
        __activity_rest__: { fr: "Repos actif", en: "Active Rest" },
        __activity_cross_training__: { fr: "Autre activité", en: "Other Activity" },
      };
      for (const [aid, labels] of Object.entries(activityLabels)) {
        names[aid] = isEn ? labels.en : labels.fr;
      }
      setWorkoutNames(names);
      setWorkoutTemplates(templates);
    });
  }, [plan, isEn]);

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

  const [isExporting, setIsExporting] = useState(false);

  const handleIcsExport = useCallback(async (selectedDays: number[], longRunDay: number) => {
    if (!plan || isExporting) return;
    setIsExporting(true);
    setShowIcsDialog(false);
    try {
      exportPlanToICS(plan, workoutNames, workoutTemplates, isEn, selectedDays, longRunDay);
      toast.success(isEn ? "Calendar exported" : "Calendrier exporté");
    } catch {
      toast.error(isEn ? "Export failed" : "Échec de l'export");
    } finally {
      setIsExporting(false);
    }
  }, [plan, workoutNames, workoutTemplates, isEn, isExporting]);

  const handleSwapSession = useCallback((workout: WorkoutTemplate) => {
    if (!plan || !swapTarget) return;

    const week = plan.weeks.find(w => w.weekNumber === swapTarget.weekNumber);
    if (!week) return;

    const originalIndex = week.sessions.findIndex(s => s.workoutId === swapTarget.workoutId);
    if (originalIndex === -1) return;

    const success = updatePlanSession(plan.id, swapTarget.weekNumber, originalIndex, workout.id);
    if (success) {
      reloadPlan();
      toast.success(isEn ? "Session replaced" : "Séance remplacée");
    } else {
      toast.error(isEn ? "Failed to update session" : "Échec de la mise à jour");
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
      toast.success(isEn ? "Session moved" : "Séance déplacée");
    } else {
      toast.error(isEn ? "Failed to move session" : "Échec du déplacement");
    }
  }, [plan, isEn, reloadPlan]);

  const handleSessionDelete = useCallback((weekNumber: number, sessionIndex: number) => {
    if (!plan) return;
    const success = deleteSessionFromPlan(plan.id, weekNumber, sessionIndex);
    if (success) {
      reloadPlan();
      toast.success(isEn ? "Session deleted" : "Séance supprimée");
    } else {
      toast.error(isEn ? "Failed to delete session" : "Échec de la suppression");
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

    // Check if all sessions are resolved
    const allResolved = freshWeek.sessions.every(
      (s: { status?: string }) => s.status === "completed" || s.status === "skipped"
    );
    if (!allResolved) return;

    const result = adaptPlan(freshPlan, weekNumber);
    if (result.adapted) {
      savePlan(freshPlan);
      reloadPlan();
      for (const change of result.changes) {
        toast.info(isEn ? change.descriptionEn : change.description, { duration: 5000 });
      }
    } else if (showToast) {
      toast.success(isEn ? `Week ${weekNumber} validated!` : `Semaine ${weekNumber} validée !`);
    }
  }, [plan, isEn, reloadPlan]);

  const handleToggleComplete = useCallback((weekNumber: number, sessionIndex: number) => {
    if (!plan) return;

    const week = plan.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;
    const session = week.sessions[sessionIndex];
    if (!session) return;

    // Cycle: planned → completed → skipped → planned
    const nextStatus = session.status === "completed"
      ? "skipped" as const
      : session.status === "skipped"
        ? "planned" as const
        : "completed" as const;

    const success = updateSessionCompletion(plan.id, weekNumber, sessionIndex, {
      status: nextStatus,
      completedAt: nextStatus === "completed" ? new Date().toISOString() : undefined,
      rpe: undefined,
    });

    if (success) {
      reloadPlan();

      // When marking as completed, show RPE selector inline
      if (nextStatus === "completed") {
        setRpePrompt({ weekNumber, sessionIndex });
      }

      // Auto-trigger adaptation if all sessions in the week are now resolved
      runAdaptationIfReady(weekNumber, false);
    }
  }, [plan, reloadPlan, runAdaptationIfReady]);

  // Validate an entire week: mark unresolved sessions as "skipped", then run adaptation
  const handleValidateWeek = useCallback((weekNumber: number) => {
    if (!plan) return;
    const week = plan.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;

    // Mark all unresolved sessions as skipped
    week.sessions.forEach((session, idx) => {
      if (!session.status || session.status === "planned") {
        updateSessionCompletion(plan.id, weekNumber, idx, {
          status: "skipped",
        });
      }
    });

    reloadPlan();

    // Run adaptation (all sessions are now resolved)
    runAdaptationIfReady(weekNumber, true);
  }, [plan, reloadPlan, runAdaptationIfReady]);

  const handleSessionClick = useCallback((weekNumber: number, sessionIndex: number, workoutId: string) => {
    if (workoutId && workoutId !== "__race_day__" && !workoutId.startsWith("__activity_")) {
      // Find the session to pass volume info for scaled duration display (#32)
      const week = plan?.weeks.find((w) => w.weekNumber === weekNumber);
      const session = week?.sessions[sessionIndex];
      navigate(`/workout/${workoutId}`, {
        state: {
          from: "plan",
          planId: plan?.id,
          planName: plan ? (isEn ? plan.nameEn : plan.name) : "",
          weekNumber,
          volumePercent: week?.volumePercent,
          estimatedDurationMin: session?.estimatedDurationMin,
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
      savePlan(plan);
      reloadPlan();
      toast.success(isEn ? "Activity added" : "Activit\u00e9 ajout\u00e9e");
      return;
    }

    const success = await addSessionToPlan(plan.id, weekNumber, workoutId, day);
    if (success) {
      reloadPlan();
      toast.success(isEn ? "Workout added" : "S\u00e9ance ajout\u00e9e");
    } else {
      toast.error(isEn ? "Failed to add workout" : "\u00c9chec de l\u2019ajout");
    }
  }, [plan, isEn, reloadPlan]);

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
          {isEn ? "Plan not found" : "Plan introuvable"}
        </p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/plans">
            <ArrowLeft className="mr-2 size-4" />
            {isEn ? "Back to plans" : "Retour aux plans"}
          </Link>
        </Button>
      </div>
    );
  }

  const isFreePlan = plan.config.planMode === "free";
  const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
  const planName = plan.config.planName || (isFreePlan
    ? plan.name
    : (isEn ? plan.nameEn : plan.name));
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
            {isEn ? "Back to plans" : "Retour aux plans"}
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
                    savePlan(plan);
                    reloadPlan();
                    toast.success(isEn ? "Name updated" : "Nom mis à jour");
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
                title={isEn ? "Click to rename" : "Cliquer pour renommer"}
              >
                {planName}
                <Pencil className="size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h1>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {raceMeta && (
                <Badge variant="default">
                  {isEn ? raceMeta.labelEn : raceMeta.label}
                </Badge>
              )}
              {isFreePlan && (
                <Badge variant="secondary">
                  {isEn ? "Free plan" : "Plan libre"}
                </Badge>
              )}
              {plan.config.planMode === "prebuilt" && (
                <Badge variant="secondary">
                  {isEn ? "Pre-built" : "Pr\u00e9-construit"}
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
                    title={isEn ? "Edit dates" : "Modifier les dates"}
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
                  {isEn ? "Add dates" : "Ajouter des dates"}
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PlanExportMenu
              plan={plan}
              workoutNames={workoutNames}
              workoutTemplates={workoutTemplates}
              isEn={isEn}
              size="sm"
              planViewMode={planViewMode}
              onIcsDialogOpen={() => setShowIcsDialog(true)}
            />
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full"
              onClick={() => setShowDeleteDialog(true)}
              title={isEn ? "Delete plan" : "Supprimer le plan"}
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
                {isEn ? "Training phases" : "Phases d'entra\u00eenement"}
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
                      title={`${isEn ? meta.labelEn : meta.label} (S${phaseRange.startWeek}-S${phaseRange.endWeek})`}
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
                      <span>{isEn ? meta.labelEn : meta.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Stats */}
        <PlanStatsSection plan={plan} currentWeek={currentWeek} isEn={isEn} />

        {/* View mode toggle + export */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold shrink-0">
            {isEn ? "Schedule" : "Programme"}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowWorkoutPanel(v => !v)}
              className="rounded-full hidden md:inline-flex"
            >
              <Plus className="size-4" />
              <span className="ml-1">{isEn ? "Add workout" : "Ajouter une séance"}</span>
            </Button>
            <PlanViewModeSelector value={planViewMode} onChange={setPlanViewMode} />
          </div>
        </div>

        {/* RPE picker is rendered as a fixed bottom bar (see end of component) */}

        {/* Completion legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border-2 border-muted-foreground/30 inline-block" />
            {isEn ? "Planned" : "Planifié"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-green-500 inline-block" />
            {isEn ? "Completed" : "Fait"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-muted border border-muted-foreground/30 inline-flex items-center justify-center">
              <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </span>
            {isEn ? "Skipped" : "Passé"}
          </span>
          <span className="text-muted-foreground/50">
            {isEn
              ? "Click checkbox to cycle: planned → done → skipped"
              : "Cliquez sur la case : planifié → fait → passé"}
          </span>
          <span className="text-muted-foreground/50 hidden md:inline">
            {isEn
              ? "· Right-click for options · Drag to move"
              : "· Clic droit pour les options · Glisser pour déplacer"}
          </span>
          <span className="text-muted-foreground/50 md:hidden">
            {isEn
              ? "· Long-press for options · Swipe to move"
              : "· Appui long pour les options · Glisser pour déplacer"}
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
                isEn={isEn}
                onSessionClick={handleSessionClick}
                onSessionMove={handleSessionMove}
                onSessionDelete={handleSessionDelete}
                onToggleComplete={handleToggleComplete}
                onValidateWeek={handleValidateWeek}
                onWorkoutAdd={handleWorkoutAdd}
                onAddToDay={handleAddToDay}
                planStartDate={plan.config.startDate || plan.config.createdAt}
              />
            </div>
            {/* Desktop/tablet inline panel */}
            {showWorkoutPanel && (
              <div className="hidden md:block w-[280px] lg:w-[320px] shrink-0">
                <div className="sticky top-20">
                  <PlanWorkoutPanel
                    isOpen={showWorkoutPanel}
                    onClose={() => setShowWorkoutPanel(false)}
                    isEn={isEn}
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
                initialWeek={returnedWeek}
                isEn={isEn}
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
                    isEn={isEn}
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
                isEn={isEn}
                startDate={plan.config.startDate || plan.config.createdAt}
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
                    isEn={isEn}
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
                        {weekLabel} — {isEn ? phaseMeta.labelEn : phaseMeta.label}
                      </span>
                      {weekDateRange && (
                        <span className="text-xs text-muted-foreground/60 tabular-nums">
                          {weekDateRange}
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <Badge variant="default" className="shrink-0">
                        {isEn ? "Current week" : "Semaine en cours"}
                      </Badge>
                    )}
                    {week.isRecoveryWeek && (
                      <Badge variant="secondary" className="shrink-0">
                        {isEn ? "Recovery" : "Récup"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {week.sessions.length > 0 && (
                      <span className="text-xs text-muted-foreground/70 tabular-nums hidden sm:inline">
                        ~{Math.round(computeWeekKm(week))}km · {computeWeekDuration(week)}min
                      </span>
                    )}
                    <span
                      className="text-sm text-muted-foreground"
                      title={isEn ? "Training volume relative to plan peak" : "Volume d'entraînement relatif au pic du plan"}
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
                        {isEn
                          ? "No sessions this week"
                          : "Aucune séance cette semaine"}
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
                                      {isEn ? "Race Day!" : "Jour de course !"}
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
                                    {(isEn ? session.notesEn : session.notes) && (
                                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                        {isEn ? session.notesEn : session.notes}
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
                                    {isEn ? sessionLabel.en : sessionLabel.fr}
                                  </Badge>
                                )}
                                {!isRaceDay && !session.workoutId.startsWith("__activity_") && (
                                  <span
                                    className="text-xs text-muted-foreground flex items-center gap-1"
                                    title={
                                      week.volumePercent < 100
                                        ? (isEn
                                            ? `Duration adjusted to ${week.volumePercent}% volume (main set scaled, warm-up/cool-down unchanged)`
                                            : `Durée ajustée au volume ${week.volumePercent}% (corps de séance réduit, échauffement/retour au calme inchangés)`)
                                        : ""
                                    }
                                  >
                                    <Clock className="size-3" />
                                    {session.estimatedDurationMin}min
                                    {week.volumePercent < 100 && (
                                      <span className="text-[10px] opacity-60">
                                        ({week.volumePercent}%)
                                      </span>
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
                                      title={isEn ? "Replace session" : "Remplacer la séance"}
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
                                      title={isEn ? "Remove session" : "Retirer la séance"}
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
                            {isEn ? "Week validated" : "Semaine validée"}
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
                            {isEn
                              ? `Validate week (${resolved}/${total} done)`
                              : `Valider la semaine (${resolved}/${total} faites)`}
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
                      <span className="text-sm">{isEn ? "Add" : "Ajouter"}</span>
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
                  isEn={isEn}
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


        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEn ? "Delete this plan?" : "Supprimer ce plan ?"}
              </DialogTitle>
              <DialogDescription>
                {isEn
                  ? `"${planName}" will be permanently deleted. This action cannot be undone.`
                  : `"${planName}" sera définitivement supprimé. Cette action est irréversible.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  {isEn ? "Cancel" : "Annuler"}
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-4" />
                {isEn ? "Delete" : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Date Edit Dialog */}
        <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEn ? "Edit dates" : "Modifier les dates"}
              </DialogTitle>
              <DialogDescription>
                {isEn
                  ? "Set a start date for your plan. The end date is calculated automatically."
                  : "D\u00e9finissez une date de d\u00e9but pour votre plan. La date de fin est calcul\u00e9e automatiquement."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label htmlFor="edit-start-date" className="text-sm font-medium mb-2 block">
                  {isEn ? "Start date" : "Date de d\u00e9but"}
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
                    {isEn ? "Start next Monday" : "Commencer lundi prochain"}
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
                          {isEn ? "Start" : "D\u00e9but"} : {startD.toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          {" "}
                          <span className="text-muted-foreground">({weekdayStr})</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag className="size-4 text-muted-foreground shrink-0" />
                        <span>
                          {isEn ? "End" : "Fin"} : {endD.toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground shrink-0" />
                        <span>{plan.totalWeeks} {isEn ? "weeks" : "semaines"}</span>
                      </div>
                    </div>
                    {isPast && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                          {isEn
                            ? "This date is in the past. The first weeks will already be elapsed."
                            : "Cette date est dans le pass\u00e9. Les premi\u00e8res semaines seront d\u00e9j\u00e0 \u00e9coul\u00e9es."}
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
                  {isEn ? "Cancel" : "Annuler"}
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
                  savePlan(plan);
                  reloadPlan();
                  setShowDateDialog(false);
                  toast.success(isEn ? "Dates updated" : "Dates mises \u00e0 jour");
                }}
              >
                {isEn ? "Save" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ICS Export Dialog */}
        <IcsExportDialog
          open={showIcsDialog}
          onOpenChange={setShowIcsDialog}
          daysPerWeek={plan.config.daysPerWeek}
          onExport={handleIcsExport}
          isEn={isEn}
        />

        {/* Workout Library Panel (mobile bottom sheet) */}
        <PlanWorkoutPanel
          isOpen={showWorkoutPanel}
          onClose={() => { setShowWorkoutPanel(false); setAddTarget(null); }}
          isEn={isEn}
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
          isEn={isEn}
        />
      </div>

      {/* Post-completion feedback overlay */}
      {rpePrompt && (() => {
        const rpeWeek = plan.weeks.find(w => w.weekNumber === rpePrompt.weekNumber);
        const rpeSession = rpeWeek?.sessions[rpePrompt.sessionIndex];
        const rpeName = rpeSession ? (workoutNames[rpeSession.workoutId] || rpeSession.workoutId) : "";

        return (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm">
              <CompletionFeedbackCard
                sessionType={rpeSession?.sessionType ?? "endurance"}
                sessionName={rpeName}
                weekNumber={rpePrompt.weekNumber}
                isEn={isEn}
                onSave={(rpe) => {
                  updateSessionCompletion(plan.id, rpePrompt.weekNumber, rpePrompt.sessionIndex, {
                    status: "completed",
                    completedAt: new Date().toISOString(),
                    rpe,
                  });
                  reloadPlan();
                  setRpePrompt(null);
                }}
                onSkip={() => setRpePrompt(null)}
              />
            </div>
          </div>
        );
      })()}
    </>
  );
}
