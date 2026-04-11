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
import { importPlan } from "@/lib/planStorage";
import { toast } from "sonner";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { TrainingPlan, PhaseRange } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import { getCurrentWeek } from "@/lib/planUtils";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { PlanSparkline } from "@/components/domain/PlanSparkline";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";

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
  onDelete,
}: {
  plan: TrainingPlan;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation("plan");
  const navigate = useNavigate();
  const isEn = useIsEnglish();
  const pick = usePickLang();
  const isFreePlan = plan.config.planMode === "free";
  const raceMeta = plan.config.raceDistance ? RACE_DISTANCE_META[plan.config.raceDistance] : null;
  const planName = isFreePlan
    ? (plan.config.planName || plan.name)
    : pick(plan, "name");
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
              {pick(raceMeta, "label")}
            </Badge>
          ) : plan.config.planMode === "prebuilt" ? (
            <Badge variant="secondary" className="shrink-0">
              {t("view.prebuilt")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              {t("view.freePlan")}
            </Badge>
          )}
        </div>
        <CardDescription>
          {isFreePlan ? (
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {t("plansPage.sessionsCount", { count: totalSessions })}
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
              {pick(PHASE_META[currentPhase], "label")}
            </span>
          </div>
        )}

        {/* Volume Sparkline */}
        <PlanSparkline
          plan={plan}
          currentWeek={currentWeek}
          isEn={isEn}
        />

        {/* Progress */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {t("plansPage.weekProgress", { current: weeksElapsed, total: plan.totalWeeks })}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        {/* Race Time Prediction */}
        {plan.raceTimePrediction && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-3.5" />
            <span>
              {t("plansPage.target")}
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
            {t("plansPage.view")}
          </Link>
        </Button>
        <PlanExportMenu
          plan={plan}
          isEn={isEn}
          size="sm"
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
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const navigate = useNavigate();
  const { plans, isLoading, remove, reload } = usePlans();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const newId = importPlan(text);
        if (newId) {
          reload();
          toast.success(t("plansPage.importSuccess"));
          navigate(`/plan/${newId}`);
        } else {
          toast.error(t("plansPage.importInvalid"));
        }
      } catch {
        toast.error(t("plansPage.importReadError"));
      }
    };
    input.click();
  }, [t, reload, navigate]);
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
        title={t("plansPage.title")}
        canonical="/plans"
      />
      <div className="py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t("plansPage.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("plansPage.subtitle")}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                to="/plans/methodology"
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              >
                <FlaskConical className="size-3.5 text-primary" />
                {t("plansPage.science")}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/calculators/what-if"
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              >
                <Scale className="size-3.5 text-primary" />
                {t("plansPage.whatIf")}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport} className="rounded-full">
              <Download className="size-4 rotate-180" />
              <span className="hidden sm:inline ml-1">{t("plansPage.import")}</span>
            </Button>
            <Button asChild>
              <Link to="/plan/new">
                <Plus className="size-4" />
                {t("create")}
              </Link>
            </Button>
          </div>
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
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="text-center text-sm text-muted-foreground">
              {t("plansPage.planCount", { count: sortedPlans.length })}
            </div>
          </>
        ) : (
          <div className="text-center py-16 space-y-4">
            {/* Animated calendar grid SVG */}
            <div className="mx-auto w-[36px] h-[44px]">
              <svg
                viewBox="0 0 36 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <style>{`
                    @keyframes plans-cell-fill {
                      0% { opacity: 0.1; }
                      100% { opacity: 0.7; }
                    }
                    @media (prefers-reduced-motion: reduce) {
                      .plans-cell { animation: none !important; opacity: 0.7; }
                    }
                  `}</style>
                </defs>
                {/* 3x4 grid of rounded squares - each 8x8 with 3px gap */}
                {/* Row-by-row, left-to-right: base -> build -> peak -> taper */}
                {[
                  /* Row 1 - Base (Z1 blue, Z2 green) */
                  { x: 0,  y: 0,  color: "var(--zone-1)", delay: 0 },
                  { x: 11, y: 0,  color: "var(--zone-1)", delay: 1 },
                  { x: 22, y: 0,  color: "var(--zone-2)", delay: 2 },
                  /* Row 2 - Build (Z2 green, Z3 yellow) */
                  { x: 0,  y: 11, color: "var(--zone-2)", delay: 3 },
                  { x: 11, y: 11, color: "var(--zone-3)", delay: 4 },
                  { x: 22, y: 11, color: "var(--zone-3)", delay: 5 },
                  /* Row 3 - Peak (Z4 orange, Z5 red) */
                  { x: 0,  y: 22, color: "var(--zone-4)", delay: 6 },
                  { x: 11, y: 22, color: "var(--zone-4)", delay: 7 },
                  { x: 22, y: 22, color: "var(--zone-5)", delay: 8 },
                  /* Row 4 - Taper (Z5 red, back to Z2 green) */
                  { x: 0,  y: 33, color: "var(--zone-5)", delay: 9 },
                  { x: 11, y: 33, color: "var(--zone-2)", delay: 10 },
                  { x: 22, y: 33, color: "var(--zone-2)", delay: 11 },
                ].map((cell, i) => (
                  <rect
                    key={i}
                    className="plans-cell"
                    x={cell.x}
                    y={cell.y}
                    width="8"
                    height="8"
                    rx="2"
                    fill={cell.color}
                    opacity="0.1"
                    style={{
                      animation: `plans-cell-fill 0.3s ease-out ${cell.delay * 0.25}s forwards`,
                    }}
                  />
                ))}
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {t("plansPage.buildArc")}
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("plansPage.buildArcDesc")}
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link to="/plan/new">
                {t("plansPage.createFirst")}
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
              {t("plansPage.deleteTitle")}
            </DialogTitle>
            <DialogDescription>
              {deleteTargetPlan
                ? t("plansPage.deleteConfirm", { name: pick(deleteTargetPlan, "name") })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                {t("plansPage.cancelButton")}
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
              {t("plansPage.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
