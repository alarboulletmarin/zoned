import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  Plus,
  Loader2,
  ArrowRight,
  Trash2,
  Download,
  FlaskConical,
  Scale,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { usePlans } from "@/hooks/usePlans";
import { importPlan, getPlanCount } from "@/lib/planStorage";
import { toast } from "sonner";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { TrainingPlan, PhaseRange } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import { getCurrentWeek } from "@/lib/planUtils";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { IcsExportDialog } from "@/components/domain/IcsExportDialog";

function formatDate(isoDate: string, isEn: boolean): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function getCurrentPhase(
  currentWeek: number,
  phases: PhaseRange[]
): TrainingPhase | null {
  for (const range of phases) {
    if (currentWeek >= range.startWeek && currentWeek <= range.endWeek) {
      return range.phase;
    }
  }
  return null;
}

function PlanCard({
  plan,
  isEn,
  onDelete,
  onIcsDialogOpen,
}: {
  plan: TrainingPlan;
  isEn: boolean;
  onDelete: (id: string) => void;
  onIcsDialogOpen: (plan: TrainingPlan) => void;
}) {
  const navigate = useNavigate();
  const isFreePlan = plan.config.planMode === "free";
  const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
  const planName = isFreePlan
    ? (plan.config.planName || plan.name)
    : (isEn ? plan.nameEn : plan.name);
  const currentWeek = getCurrentWeek(plan.config.startDate || plan.config.createdAt);
  const currentPhase = getCurrentPhase(currentWeek, plan.phases);
  const progressPercent = Math.min(
    Math.max((currentWeek / plan.totalWeeks) * 100, 0),
    100
  );
  const weeksElapsed = Math.min(Math.max(currentWeek, 0), plan.totalWeeks);
  const totalSessions = plan.weeks.reduce((sum, w) => sum + w.sessions.length, 0);

  return (
    <Card interactive className="h-full bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent">
      <CardHeader
        className="cursor-pointer"
        onClick={() => navigate(`/plan/${plan.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1 flex-1">
            {planName}
          </CardTitle>
          {raceMeta ? (
            <Badge variant="default" className="shrink-0">
              {isEn ? raceMeta.labelEn : raceMeta.label}
            </Badge>
          ) : plan.config.planMode === "prebuilt" ? (
            <Badge variant="secondary" className="shrink-0">
              {isEn ? "Pre-built" : "Pr\u00e9-construit"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              {isEn ? "Free plan" : "Plan libre"}
            </Badge>
          )}
        </div>
        <CardDescription>
          {isFreePlan ? (
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {totalSessions}{" "}
              {isEn
                ? `session${totalSessions !== 1 ? "s" : ""}`
                : `s\u00e9ance${totalSessions !== 1 ? "s" : ""}`}
            </span>
          ) : plan.config.raceDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDate(plan.config.createdAt, isEn)} →{" "}
              {formatDate(plan.config.raceDate, isEn)}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDate(plan.config.createdAt, isEn)}
            </span>
          )}
          {plan.config.startDate && (
            <span className="text-xs text-muted-foreground">
              {new Date(plan.config.startDate).toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "short" })}
              {plan.config.endDate && ` \u2192 ${new Date(plan.config.endDate).toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "short" })}`}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent
        className="space-y-3 cursor-pointer"
        onClick={() => navigate(`/plan/${plan.id}`)}
      >
        {/* Current Phase */}
        {currentPhase && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "size-2.5 rounded-full",
                PHASE_META[currentPhase].color
              )}
            />
            <span className="text-sm">
              {isEn
                ? PHASE_META[currentPhase].labelEn
                : PHASE_META[currentPhase].label}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {isEn
                ? `Week ${weeksElapsed} / ${plan.totalWeeks}`
                : `Semaine ${weeksElapsed} / ${plan.totalWeeks}`}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Race Time Prediction */}
        {plan.raceTimePrediction && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-3.5" />
            <span>
              {isEn ? "Target: " : "Objectif : "}
              {plan.raceTimePrediction}
            </span>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <div className="px-6 pb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <Link to={`/plan/${plan.id}`}>
            <ArrowRight className="size-3.5" />
            {isEn ? "View" : "Voir"}
          </Link>
        </Button>
        <PlanExportMenu
          plan={plan}
          isEn={isEn}
          size="sm"
          onIcsDialogOpen={() => onIcsDialogOpen(plan)}
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plan.id);
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export function PlansPage() {
  const { i18n } = useTranslation("plan");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();
  const { plans, isLoading, remove, reload } = usePlans();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [icsExportPlan, setIcsExportPlan] = useState<TrainingPlan | null>(null);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (getPlanCount() >= 5) {
        toast.error(isEn ? "Maximum 5 plans. Delete one first." : "Maximum 5 plans. Supprimez-en un d'abord.");
        return;
      }

      try {
        const text = await file.text();
        const newId = importPlan(text);
        if (newId) {
          reload();
          toast.success(isEn ? "Plan imported!" : "Plan importé !");
          navigate(`/plan/${newId}`);
        } else {
          toast.error(isEn ? "Invalid plan file" : "Fichier de plan invalide");
        }
      } catch {
        toast.error(isEn ? "Failed to read file" : "Impossible de lire le fichier");
      }
    };
    input.click();
  }, [isEn, reload, navigate]);
  const deleteTargetPlan = plans.find((p) => p.id === deleteTarget);

  // Sort plans by creation date (newest first)
  const sortedPlans = useMemo(
    () =>
      [...plans].sort(
        (a, b) =>
          new Date(b.config.createdAt).getTime() -
          new Date(a.config.createdAt).getTime()
      ),
    [plans]
  );

  return (
    <>
      <SEOHead
        noindex={true}
        title={isEn ? "My Training Plans" : "Mes Plans d'Entraînement"}
        canonical="/plans"
      />
      <div className="py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isEn ? "My Training Plans" : "Mes Plans d'Entraînement"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEn
                ? "Structured plans to reach your race goals"
                : "Des plans structurés pour atteindre vos objectifs"}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                to="/plans/methodology"
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              >
                <FlaskConical className="size-3.5 text-primary" />
                {isEn
                  ? "The science behind your plans"
                  : "La science derrière vos plans"}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/calculators/what-if"
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              >
                <Scale className="size-3.5 text-primary" />
                {isEn
                  ? "What-if simulator"
                  : "Simulateur what-if"}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
          {plans.length >= 5 ? (
            <p className="text-sm text-muted-foreground">
              {isEn ? "Maximum 5 plans reached" : "Limite de 5 plans atteinte"}
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleImport} className="rounded-full">
                <Download className="size-4 rotate-180" />
                <span className="hidden sm:inline ml-1">{isEn ? "Import" : "Importer"}</span>
              </Button>
              <Button asChild>
                <Link to="/plan/new">
                  <Plus className="size-4" />
                  {isEn ? "Create a plan" : "Créer un plan"}
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : sortedPlans.length > 0 ? (
          <>
            <div
              className={cn(
                "grid gap-4",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {sortedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isEn={isEn}
                  onDelete={setDeleteTarget}
                  onIcsDialogOpen={setIcsExportPlan}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="text-center text-sm text-muted-foreground">
              {isEn
                ? `${sortedPlans.length} plan${sortedPlans.length !== 1 ? "s" : ""}`
                : `${sortedPlans.length} plan${sortedPlans.length !== 1 ? "s" : ""}`}
            </div>
          </>
        ) : (
          <div className="text-center py-16 space-y-4">
            <Calendar className="size-16 mx-auto text-muted-foreground/30" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isEn ? "No plans yet" : "Pas encore de plan"}
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isEn
                  ? "Create your first training plan to prepare for your next race."
                  : "Créez votre premier plan d'entraînement pour préparer votre prochaine course."}
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link to="/plan/new">
                {isEn
                  ? "Create your first plan"
                  : "Créer votre premier plan"}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEn ? "Delete this plan?" : "Supprimer ce plan ?"}
            </DialogTitle>
            <DialogDescription>
              {deleteTargetPlan
                ? (isEn
                    ? `"${deleteTargetPlan.nameEn}" will be permanently deleted. This action cannot be undone.`
                    : `"${deleteTargetPlan.name}" sera définitivement supprimé. Cette action est irréversible.`)
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                {isEn ? "Cancel" : "Annuler"}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  remove(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
            >
              <Trash2 className="size-4" />
              {isEn ? "Delete" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ICS Export Dialog (for plans without assigned days) */}
      <IcsExportDialog
        open={icsExportPlan !== null}
        onOpenChange={(open) => !open && setIcsExportPlan(null)}
        daysPerWeek={icsExportPlan?.config.daysPerWeek ?? 3}
        onExport={async (selectedDays, longRunDay) => {
          if (!icsExportPlan) return;
          const { exportPlanToICS } = await import("@/lib/export");
          const { getWorkoutById } = await import("@/data/workouts");
          const names: Record<string, string> = {};
          const templates: Record<string, import("@/types").WorkoutTemplate> = {};
          for (const week of icsExportPlan.weeks) {
            for (const s of week.sessions) {
              if (s.workoutId && !s.workoutId.startsWith("__") && !names[s.workoutId]) {
                const w = await getWorkoutById(s.workoutId);
                if (w) {
                  names[s.workoutId] = isEn ? (w.nameEn || w.name) : w.name;
                  templates[s.workoutId] = w;
                }
              }
            }
          }
          exportPlanToICS(icsExportPlan, names, templates, isEn, selectedDays, longRunDay);
          toast.success(isEn ? "Calendar exported" : "Calendrier export\u00e9");
          setIcsExportPlan(null);
        }}
        isEn={isEn}
      />
    </>
  );
}
