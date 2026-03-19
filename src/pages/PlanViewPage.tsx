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
import { deletePlan, updatePlanSession, moveSession, deleteSessionFromPlan } from "@/lib/planStorage";
import { getWorkoutById } from "@/data/workouts";
import { exportPlanToICS, exportPlanToPDF } from "@/lib/export";
import { computePlanStats } from "@/lib/planStats";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { WorkoutTemplate } from "@/types";
import { toast } from "sonner";
import { IcsExportDialog } from "@/components/domain/IcsExportDialog";
import { SwapSessionDialog } from "@/components/domain/SwapSessionDialog";
import { PlanCalendar } from "@/components/domain/PlanCalendar";

const SESSION_TYPE_COLORS: Record<string, string> = {
  endurance: "bg-blue-400",
  long_run: "bg-blue-600",
  tempo: "bg-yellow-400",
  threshold: "bg-orange-400",
  vo2max: "bg-red-500",
  speed: "bg-red-400",
  fartlek: "bg-purple-400",
  hills: "bg-green-500",
  race_specific: "bg-amber-500",
  recovery: "bg-slate-300 dark:bg-slate-700",
};

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

  const currentWeek = useMemo(() => {
    if (!plan) return 0;
    return getCurrentWeek(plan.config.createdAt);
  }, [plan]);

  const stats = useMemo(() => {
    if (!plan) return null;
    return computePlanStats(plan);
  }, [plan]);

  // Auto-expand current week
  useEffect(() => {
    if (currentWeek > 0) {
      setExpandedWeeks(new Set([currentWeek]));
    }
  }, [currentWeek]);

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

  const raceMeta = RACE_DISTANCE_META[plan.config.raceDistance];
  const planName = isEn ? plan.nameEn : plan.name;
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
              <Badge variant="default">
                {isEn ? raceMeta.labelEn : raceMeta.label}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>
                  {formatDate(plan.config.createdAt, isEn)} →{" "}
                  {formatDate(raceDate, isEn)}
                </span>
              </div>
              {plan.raceTimePrediction && (
                <Badge variant="secondary">
                  <Clock className="size-3 mr-1" />
                  {plan.raceTimePrediction}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="size-4" />
            {isEn ? "Delete" : "Supprimer"}
          </Button>
        </div>

        {/* Phase Timeline */}
        <Card size="compact">
          <CardContent className="px-4">
            <p className="text-sm font-medium mb-2">
              {isEn ? "Training phases" : "Phases d'entraînement"}
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

        {/* Plan Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card size="compact">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">{isEn ? "Sessions" : "Séances"}</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </CardContent>
            </Card>
            <Card size="compact">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">{isEn ? "Total hours" : "Heures totales"}</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalDurationMin / 60)}<span className="text-sm font-normal text-muted-foreground">h</span></p>
              </CardContent>
            </Card>
            <Card size="compact">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">{isEn ? "Avg/week" : "Moy./semaine"}</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgDurationPerWeekMin)}<span className="text-sm font-normal text-muted-foreground">min</span></p>
              </CardContent>
            </Card>
            <Card size="compact">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">{isEn ? "Key sessions" : "Séances clés"}</p>
                <p className="text-2xl font-bold">{stats.keySessionCount}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session type distribution bar */}
        {stats && (
          <Card size="compact">
            <CardContent className="px-4">
              <p className="text-sm font-medium mb-2">{isEn ? "Session types" : "Types de séances"}</p>
              <div className="flex rounded-full overflow-hidden h-3">
                {Object.entries(stats.sessionsByType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => {
                    const sessionLabel = SESSION_TYPE_LABELS[type];
                    return (
                      <div
                        key={type}
                        className={SESSION_TYPE_COLORS[type] || "bg-gray-300"}
                        style={{ width: `${(count / stats.totalSessions) * 100}%` }}
                        title={`${sessionLabel ? (isEn ? sessionLabel.en : sessionLabel.fr) : type}: ${count}`}
                      />
                    );
                  })}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {Object.entries(stats.sessionsByType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => {
                    const sessionLabel = SESSION_TYPE_LABELS[type];
                    return (
                      <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className={`size-2.5 rounded-full ${SESSION_TYPE_COLORS[type] || "bg-gray-300"}`} />
                        <span>{sessionLabel ? (isEn ? sessionLabel.en : sessionLabel.fr) : type} ({count})</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* View mode toggle + export */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold shrink-0">
            {isEn ? "Schedule" : "Programme"}
          </h2>
          <div className="flex items-center gap-2">
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
                // In calendar mode, days are already assigned — export directly
                const usedDays = [...new Set(plan.weeks.flatMap(w => w.sessions.map(s => s.dayOfWeek)))].sort();
                handleIcsExport(usedDays, plan.config.longRunDay);
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
          <PlanCalendar
            plan={plan}
            workoutNames={workoutNames}
            currentWeek={currentWeek}
            isEn={isEn}
            onSessionClick={(weekNumber, sessionIndex, workoutId) => {
              const week = plan.weeks.find(w => w.weekNumber === weekNumber);
              if (!week) return;
              const session = week.sessions[sessionIndex];
              if (!session) return;
              setSwapTarget({
                weekNumber,
                sessionIndex,
                workoutId,
                sessionType: session.sessionType,
              });
            }}
            onSessionMove={handleSessionMove}
            onSessionDelete={handleSessionDelete}
          />
        )}

        {/* Week List */}
        {planView === "list" && <div className="space-y-2">
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
                        return sortedSessions.map((session, idx) => {
                          const isRaceDay =
                            session.workoutId === "__race_day__";
                          const sessionLabel =
                            SESSION_TYPE_LABELS[session.sessionType];

                          return (
                            <div
                              key={idx}
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
                                {!isRaceDay && (
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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSwapTarget({
                                        weekNumber: week.weekNumber,
                                        sessionIndex: idx,
                                        workoutId: session.workoutId,
                                        sessionType: session.sessionType,
                                      });
                                    }}
                                    title={isEn ? "Replace session" : "Remplacer la séance"}
                                  >
                                    <span className="text-xs">{"\u21c4"}</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>}


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

        {/* ICS Export Dialog */}
        <IcsExportDialog
          open={showIcsDialog}
          onOpenChange={setShowIcsDialog}
          daysPerWeek={plan.config.daysPerWeek}
          onExport={handleIcsExport}
          isEn={isEn}
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
