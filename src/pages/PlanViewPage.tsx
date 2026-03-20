import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  CalendarRange,
  Clock,
  Star,
  Trash2,
  Flag,
  ChevronDown,
  ChevronUp,
  Download,
  List,
  Plus,
  MoreHorizontal,
  Pencil,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlans";
import { deletePlan, savePlan, updatePlanSession, moveSession, deleteSessionFromPlan, addSessionToPlan } from "@/lib/planStorage";
import { getWorkoutById } from "@/data/workouts";
import { exportPlanToICS, exportPlanToPDF } from "@/lib/export";
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
import { PlanCalendar } from "@/components/domain/PlanCalendar";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";

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
};

function formatDate(isoDate: string, isEn: boolean): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCurrentWeek(createdAt: string): number {
  const start = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

export function PlanViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation("plan");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const { plan, isLoading, reload: reloadPlan } = usePlan(id);
  const [planView, setPlanView] = useState<"calendar" | "list">("calendar");
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

  const currentWeek = useMemo(() => {
    if (!plan) return 0;
    const referenceDate = plan.config.startDate || plan.config.createdAt;
    return getCurrentWeek(referenceDate);
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

  const handleExportPDF = useCallback(async () => {
    if (!plan || isExporting) return;
    setIsExporting(true);
    try {
      await exportPlanToPDF(plan, workoutNames, workoutTemplates, isEn);
      toast.success(isEn ? "PDF exported" : "PDF exporté");
    } catch {
      toast.error(isEn ? "Export failed" : "Échec de l'export");
    } finally {
      setIsExporting(false);
    }
  }, [plan, workoutNames, workoutTemplates, isEn, isExporting]);

  const handleExportPlanJSON = useCallback(() => {
    if (!plan) return;
    const json = JSON.stringify(plan, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-${plan.name || plan.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isEn ? "Plan exported" : "Plan export\u00e9");
  }, [plan, isEn]);

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
  const planName = isFreePlan
    ? (plan.config.planName || plan.name)
    : (isEn ? plan.nameEn : plan.name);
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
            <h1 className="text-3xl font-bold">{planName}</h1>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPlanJSON}>
                <Download className="size-4" />
                {isEn ? "Export plan (JSON)" : "Exporter le plan (JSON)"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                {isEn ? "Delete plan" : "Supprimer le plan"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold shrink-0">
            {isEn ? "Schedule" : "Programme"}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowWorkoutPanel(v => !v)}
              className="rounded-full hidden md:inline-flex"
            >
              <Plus className="size-4" />
              <span className="ml-1">{isEn ? "Add workout" : "Ajouter une séance"}</span>
            </Button>
          <div
            className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-1"
            role="radiogroup"
            aria-label={isEn ? "View mode" : "Mode d'affichage"}
          >
            <button
              type="button"
              role="radio"
              aria-checked={planView === "calendar"}
              aria-label={isEn ? "Calendar" : "Calendrier"}
              onClick={() => setPlanView("calendar")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                planView === "calendar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <CalendarRange size={16} />
              <span className="hidden sm:inline">{isEn ? "Calendar" : "Calendrier"}</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={planView === "list"}
              aria-label={isEn ? "List" : "Liste"}
              onClick={() => setPlanView("list")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                planView === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <List size={16} />
              <span className="hidden sm:inline">{isEn ? "List" : "Liste"}</span>
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="rounded-full">
            {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            <span className="hidden sm:inline ml-1">{isEn ? "PDF" : "PDF"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            className="rounded-full"
            onClick={() => {
              if (planView === "calendar" && plan) {
                // In calendar mode, days are already assigned -- export directly
                const usedDays = [...new Set(plan.weeks.flatMap(w => w.sessions.map(s => s.dayOfWeek)))].sort();
                handleIcsExport(usedDays, plan.config.longRunDay ?? 6);
              } else {
                setShowIcsDialog(true);
              }
            }}
          >
            <Calendar className="size-4" />
            <span className="hidden sm:inline ml-1">{isEn ? "ICS" : "ICS"}</span>
          </Button>
          </div>
        </div>

        {/* Calendar View */}
        {planView === "calendar" && (
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <PlanCalendar
                plan={plan}
                workoutNames={workoutNames}
                currentWeek={currentWeek}
                isEn={isEn}
                onSessionClick={(_weekNumber, _sessionIndex, workoutId) => {
                  if (workoutId && workoutId !== "__race_day__" && !workoutId.startsWith("__activity_")) {
                    navigate(`/workout/${workoutId}`, {
                      state: { from: "plan", planId: plan.id, planName: isEn ? plan.nameEn : plan.name },
                    });
                  }
                }}
                onSessionMove={handleSessionMove}
                onSessionDelete={handleSessionDelete}
                onWorkoutAdd={handleWorkoutAdd}
                onAddToDay={(weekNumber, day) => {
                  setAddTarget({ weekNumber, day });
                  setShowWorkoutPanel(true);
                }}
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

        {/* Week List */}
        {planView === "list" && (
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
                    <span className="font-medium truncate">
                      {weekLabel} — {isEn ? phaseMeta.labelEn : phaseMeta.label}
                    </span>
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
                                "flex items-center gap-3 rounded-lg p-3",
                                isRaceDay
                                  ? "bg-primary/10 border border-primary/20"
                                  : "bg-secondary/50"
                              )}
                            >


                              {/* Content */}
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

                              {/* Badges */}
                              <div className="flex items-center gap-2 shrink-0">
                                {session.isKeySession && (
                                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                                )}
                                {!isRaceDay && sessionLabel && (
                                  <Badge variant="outline" className="text-xs">
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
              {editStartDate && (
                <p className="text-sm text-muted-foreground">
                  {isEn ? "End date" : "Date de fin"} :{" "}
                  {(() => {
                    const d = new Date(editStartDate);
                    d.setDate(d.getDate() + plan.totalWeeks * 7);
                    return d.toLocaleDateString(isEn ? "en-US" : "fr-FR");
                  })()}
                </p>
              )}
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
                    const endD = new Date(editStartDate);
                    endD.setDate(endD.getDate() + plan.totalWeeks * 7);
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
    </>
  );
}
