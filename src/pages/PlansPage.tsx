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
  Copy,
  FlaskConical,
  Scale,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { importPlan, duplicatePlan } from "@/lib/planStorage";
import { toast } from "sonner";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { TrainingPlan, PhaseRange, RaceDistance } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import { getCurrentWeek, isPlanEnded } from "@/lib/planUtils";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { PlanSparkline } from "@/components/domain/PlanSparkline";
import { PrebuiltPlanCard, PhaseZoneBar } from "@/components/domain/PrebuiltPlanCard";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { useIsEnglish, usePickLang, formatDateShort } from "@/lib/i18n-utils";


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
  onDuplicate,
}: {
  plan: TrainingPlan;
  onDelete: (id: string) => void;
  onDuplicate: (plan: TrainingPlan) => void;
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
  const ended = isPlanEnded(plan);

  return (
    <div
      className={cn(
        "h-full bg-card p-5 flex flex-col",
        ended && "opacity-70 hover:opacity-100 transition-opacity"
      )}
    >
      <div
        className="cursor-pointer flex-1"
        onClick={() => navigate(`/plan/${plan.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans font-bold uppercase leading-[1.02] tracking-[-0.03em] text-2xl line-clamp-1 flex-1">
            {planName}
          </h3>
          {raceMeta ? (
            <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground shrink-0">
              {pick(raceMeta, "label")}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {ended && (
            <Badge variant="outline" className="shrink-0 text-muted-foreground">
              {t("plansPage.ended")}
            </Badge>
          )}
          {!raceMeta && plan.config.planMode === "prebuilt" && (
            <Badge variant="secondary" className="shrink-0">
              {t("view.prebuilt")}
            </Badge>
          )}
          {!raceMeta && plan.config.planMode !== "prebuilt" && (
            <Badge variant="secondary" className="shrink-0">
              {t("view.freePlan")}
            </Badge>
          )}
        </div>
        <p className="mt-2 font-mono text-xs text-muted-foreground flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {isFreePlan ? (
            t("plansPage.sessionsCount", { count: totalSessions })
          ) : plan.config.startDate ? (
            // Prefer the explicit start→end range; falls through to
            // createdAt→raceDate only when no start date is set (#102).
            <>
              {formatDateShort(plan.config.startDate)}
              {plan.config.endDate && ` → ${formatDateShort(plan.config.endDate)}`}
            </>
          ) : plan.config.raceDate ? (
            <>
              {formatDateShort(plan.config.createdAt)} →{" "}
              {formatDateShort(plan.config.raceDate)}
            </>
          ) : (
            formatDateShort(plan.config.createdAt)
          )}
        </p>

        {/* Phase bar — the whole plan at a glance, current phase highlighted */}
        {plan.phases.length > 0 && (
          <div className="mt-3">
            <PhaseZoneBar
              phases={plan.phases}
              totalWeeks={plan.totalWeeks}
            />
            <p className="mt-2 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
              {plan.phases.map((range, i) => (
                <span key={`${range.phase}-${i}`}>
                  {i > 0 && " · "}
                  <span
                    className={cn(
                      range.phase === currentPhase && "text-foreground",
                    )}
                  >
                    {pick(PHASE_META[range.phase], "label")}
                  </span>
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Volume Sparkline */}
        <div className="mt-3">
          <PlanSparkline
            plan={plan}
            currentWeek={currentWeek}
            isEn={isEn}
          />
        </div>

        {/* Progress */}
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground mt-2">
          <span>
            {t("plansPage.weekProgress", { current: weeksElapsed, total: plan.totalWeeks })}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        {/* Race Time Prediction */}
        {plan.raceTimePrediction && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-accent-acid mt-2">
            <Clock className="size-3.5" />
            <span>
              {t("plansPage.target")}
              {plan.raceTimePrediction}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-filet">
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
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(plan);
          }}
        >
          <Copy className="size-3.5" />
          {t("plansPage.duplicate")}
        </Button>
        <PlanExportMenu
          plan={plan}
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
    </div>
  );
}

/** "Créer un plan" tile — sits alongside the plan cards, matching the
 *  three entry points already offered on /plan/new (assisted / free /
 *  prebuilt) so the dashboard doesn't need a second decision tree. */
function CreatePlanTile({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className="h-full bg-card p-5 flex flex-col justify-center">
      <h3 className="font-sans font-bold uppercase leading-[1.02] tracking-[-0.03em] text-2xl">
        {t("plans.createPlan")}
      </h3>
      <p className="mt-2 text-sm leading-[1.5] text-foreground/70">
        {t("plansPage.subtitle")}
      </p>
      <div className="flex flex-col gap-2.5 mt-4 font-mono text-[11px] tracking-[0.08em] uppercase">
        <Link
          to="/plan/new/assisted"
          className="inline-flex items-center bg-accent-acid text-ink px-4 py-3 font-bold hover:bg-accent-acid/90 transition-colors w-fit"
        >
          {t("plans.assistedPlan")}
        </Link>
        <Link
          to="/plan/new/prebuilt"
          className="text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          {t("plans.prebuiltPlans")}
        </Link>
        <Link
          to="/plan/new/free"
          className="text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          {t("plans.freePlan")}
        </Link>
      </div>
    </div>
  );
}

export function PlansPage() {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const navigate = useNavigate();
  const { plans, isLoading, remove, reload } = usePlans();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<RaceDistance | "all">("all");

  const prebuiltPlans = useMemo(() => getAllPrebuiltPlans(), []);
  const availableDistances = useMemo(() => {
    const seen = new Set<RaceDistance>();
    const ordered: RaceDistance[] = [];
    for (const p of prebuiltPlans) {
      if (p.raceDistance && !seen.has(p.raceDistance)) {
        seen.add(p.raceDistance);
        ordered.push(p.raceDistance);
      }
    }
    return ordered;
  }, [prebuiltPlans]);
  const filteredPrebuiltPlans = useMemo(() => {
    if (distanceFilter === "all") return prebuiltPlans;
    return prebuiltPlans.filter((p) => p.raceDistance === distanceFilter);
  }, [prebuiltPlans, distanceFilter]);

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

  const handleDuplicate = useCallback((plan: TrainingPlan) => {
    const newId = duplicatePlan(
      plan.id,
      `${pick(plan, "name")} ${t("plansPage.copySuffix")}`
    );
    if (!newId) {
      toast.error(t("plansPage.duplicateError"));
      return;
    }
    reload();
    toast.success(t("plansPage.duplicated"));
  }, [t, pick, reload]);

  const deleteTargetPlan = plans.find((p) => p.id === deleteTarget);

  // Sort plans by creation date (newest first). Standalone weeks live under
  // their own /weeks section, so they're excluded here. Ended plans (past
  // their date range) are split into their own section below the active ones.
  const { activePlans, endedPlans } = useMemo(() => {
    const sorted = [...plans]
      .filter((p) => !p.config.isSingleWeek)
      .sort(
        (a, b) =>
          new Date(b.config.createdAt).getTime() -
          new Date(a.config.createdAt).getTime()
      );
    return {
      activePlans: sorted.filter((p) => !isPlanEnded(p)),
      endedPlans: sorted.filter((p) => isPlanEnded(p)),
    };
  }, [plans]);
  const planCount = activePlans.length + endedPlans.length;

  return (
    <>
      <SEOHead
        noindex={true}
        title={t("plansPage.title")}
        canonical="/plans"
      />
      <div className="py-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-filet pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("plansPage.subtitle")}
            </p>
            <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-5xl sm:text-6xl mt-2">
              {t("plansPage.title")}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground">
              <Link
                to="/plans/methodology"
                className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground transition-colors"
              >
                <FlaskConical className="size-3.5" />
                {t("plansPage.science")}
              </Link>
              <Link
                to="/calculators/what-if"
                className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground transition-colors"
              >
                <Scale className="size-3.5" />
                {t("plansPage.whatIf")}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
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
        ) : planCount > 0 ? (
          <>
            <div className="space-y-4">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent-acid">
                {t("plans.myPlans")}
              </p>
              {activePlans.length > 0 && (
                <div
                  className={cn(
                    "grid gap-px bg-border border border-border",
                    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  )}
                >
                  {activePlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onDelete={setDeleteTarget}
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                  <CreatePlanTile t={t} />
                </div>
              )}
              {activePlans.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
                  <CreatePlanTile t={t} />
                </div>
              )}
            </div>

            {/* Ended plans: kept as training history, visually separated */}
            {endedPlans.length > 0 && (
              <div className="space-y-4">
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
                  {t("plansPage.endedSection")}
                </p>
                <div
                  className={cn(
                    "grid gap-px bg-border border border-border",
                    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  )}
                >
                  {endedPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onDelete={setDeleteTarget}
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <p className="font-mono text-[11px] text-muted-foreground text-center">
              {t("plansPage.planCount", { count: planCount })}
            </p>
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

        {/* Ready-made plans catalogue — real data from src/data/prebuilt-plans */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent-acid">
              {t("plansPage.prebuiltHeading", { count: prebuiltPlans.length })}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
              <button
                type="button"
                onClick={() => setDistanceFilter("all")}
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  distanceFilter === "all"
                    ? "bg-foreground text-background"
                    : "hover:text-foreground"
                )}
              >
                {t("plansPage.filterAll")}
              </button>
              {availableDistances.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistanceFilter(d)}
                  className={cn(
                    "px-2.5 py-1.5 transition-colors",
                    distanceFilter === d
                      ? "bg-foreground text-background"
                      : "hover:text-foreground"
                  )}
                >
                  {pick(RACE_DISTANCE_META[d], "label")}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-px bg-border border border-border grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrebuiltPlans.map((plan) => (
              <PrebuiltPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        {/* Why this catalogue — editorial 3-column block, mirrors the design mockup */}
        <div className="border-2 border-foreground bg-card p-6 md:p-10">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("plansPage.whyCatalogue.eyebrow")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7 mt-4 text-sm leading-[1.6] text-foreground/75">
            {(["readable", "nine", "noTracking"] as const).map((key) => (
              <p key={key}>
                <strong className="font-semibold text-foreground">
                  {t(`plansPage.whyCatalogue.${key}.title`)}
                </strong>{" "}
                {t(`plansPage.whyCatalogue.${key}.body`)}
              </p>
            ))}
          </div>
        </div>
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
