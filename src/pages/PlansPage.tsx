import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  Plus,
  Loader2,
  ArrowRight,
  Trash2,
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
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { TrainingPlan, PhaseRange } from "@/types/plan";
import type { TrainingPhase } from "@/types";

function formatDate(isoDate: string, isEn: boolean): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function getCurrentWeek(createdAt: string): number {
  const start = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
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
}: {
  plan: TrainingPlan;
  isEn: boolean;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const isFreePlan = plan.config.planMode === "free";
  const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
  const planName = isFreePlan
    ? (plan.config.planName || plan.name)
    : (isEn ? plan.nameEn : plan.name);
  const currentWeek = getCurrentWeek(plan.config.createdAt);
  const currentPhase = getCurrentPhase(currentWeek, plan.phases);
  const progressPercent = Math.min(
    Math.max((currentWeek / plan.totalWeeks) * 100, 0),
    100
  );
  const weeksElapsed = Math.min(Math.max(currentWeek, 0), plan.totalWeeks);
  const totalSessions = plan.weeks.reduce((sum, w) => sum + w.sessions.length, 0);

  return (
    <Card interactive className="h-full">
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
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
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
  const { plans, isLoading, remove } = usePlans();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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
          </div>
          <Button asChild>
            <Link to="/plan/new">
              <Plus className="size-4" />
              {isEn ? "Create a plan" : "Créer un plan"}
            </Link>
          </Button>
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
                <PlanCard key={plan.id} plan={plan} isEn={isEn} onDelete={setDeleteTarget} />
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
    </>
  );
}
