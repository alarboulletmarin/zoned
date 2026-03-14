import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Download,
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
import { deletePlan } from "@/lib/planStorage";
import { getWorkoutById } from "@/data/workouts";
import { exportPlanToICS, exportPlanToPDF } from "@/lib/export";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { WorkoutTemplate } from "@/types";
import { toast } from "sonner";

const DAY_NAMES_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  const { plan, isLoading } = usePlan(id);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workoutNames, setWorkoutNames] = useState<Record<string, string>>({});

  const currentWeek = useMemo(() => {
    if (!plan) return 0;
    return getCurrentWeek(plan.config.createdAt);
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
      for (const [wid, workout] of results) {
        if (workout) {
          names[wid] = isEn ? workout.nameEn : workout.name;
        }
      }
      setWorkoutNames(names);
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

  const handleExportICS = useCallback(async () => {
    if (!plan || isExporting) return;
    setIsExporting(true);
    try {
      exportPlanToICS(plan, workoutNames, isEn);
      toast.success(isEn ? "Calendar exported" : "Calendrier exporté");
    } catch {
      toast.error(isEn ? "Export failed" : "Échec de l'export");
    } finally {
      setIsExporting(false);
    }
  }, [plan, workoutNames, isEn, isExporting]);

  const handleExportPDF = useCallback(async () => {
    if (!plan || isExporting) return;
    setIsExporting(true);
    try {
      await exportPlanToPDF(plan, workoutNames, isEn);
      toast.success(isEn ? "PDF exported" : "PDF exporté");
    } catch {
      toast.error(isEn ? "Export failed" : "Échec de l'export");
    } finally {
      setIsExporting(false);
    }
  }, [plan, workoutNames, isEn, isExporting]);

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
  const dayNames = isEn ? DAY_NAMES_EN : DAY_NAMES_FR;

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

        {/* Week List */}
        <div className="space-y-2">
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
                    <span className="text-sm text-muted-foreground">
                      {week.volumePercent}%
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
                  <div className="border-t px-4 pb-4 space-y-2">
                    {week.sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">
                        {isEn
                          ? "No sessions this week"
                          : "Aucune séance cette semaine"}
                      </p>
                    ) : (
                      week.sessions.map((session, idx) => {
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
                            {/* Day */}
                            <span className="text-sm font-medium w-10 shrink-0">
                              {dayNames[session.dayOfWeek]}
                            </span>

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
                                <Link
                                  to={`/workout/${session.workoutId}`}
                                  className="text-sm font-medium hover:underline line-clamp-1"
                                >
                                  {workoutNames[session.workoutId] ||
                                    session.workoutId}
                                </Link>
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
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {session.estimatedDurationMin}
                                  {isEn ? "min" : "min"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {isEn ? "Export PDF" : "Exporter PDF"}
          </Button>
          <Button variant="outline" onClick={handleExportICS} disabled={isExporting}>
            {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Calendar className="size-4" />}
            {isEn ? "Export ICS" : "Exporter ICS"}
          </Button>
        </div>

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
      </div>
    </>
  );
}
