import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
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
 *  prebuilt) so the dashboard doesn't need a second decision tree. No card
 *  fill of its own: the caller decides whether it needs the dashed rule
 *  that separates it from a neighbouring plan card (mirrors the mockup,
 *  where this tile reads as plain text next to the filled plan card). */
function CreatePlanTile({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className="flex flex-col justify-center">
      <h3 className="font-sans font-bold uppercase leading-[1.02] tracking-[-0.03em] text-2xl">
        {t("plans.createPlan")}
      </h3>
      <p className="mt-2.5 text-[15px] leading-[1.55] text-muted-foreground max-w-[44ch]">
        {t("plansPage.createPlanDesc")}
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-4 font-mono text-[11px] tracking-[0.08em] uppercase">
        <Link
          to="/plan/new/assisted"
          className="inline-flex items-center bg-accent-acid text-ink px-4 py-3 font-bold hover:bg-accent-acid/90 transition-colors w-fit"
        >
          {t("plans.assistedPlan")}
        </Link>
        <Link
          to="/plan/new/prebuilt"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          {t("plans.prebuiltPlans")}
        </Link>
        <Link
          to="/plan/new/free"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit"
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
        {/* Header — compact eyebrow doubling as the page heading, secondary
            actions folded into plain text links (no oversized hero, no
            buttons in the header: matches the mockup's editorial density).
            The "Mes plans" grid lives right below it, no separate hero. */}
        <div className="space-y-6 border-b border-filet pb-8">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            <h1 className="font-mono text-[11px] tracking-[0.16em] uppercase text-accent-acid">
              {t("plans.myPlans")}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground">
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
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase underline underline-offset-4 hover:text-foreground transition-colors"
              >
                <Download className="size-3.5 rotate-180" />
                {t("plansPage.import")}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onDelete={setDeleteTarget}
                  onDuplicate={handleDuplicate}
                />
              ))}
              <div
                className={cn(
                  activePlans.length > 0 &&
                    "border-t border-dashed border-filet pt-6"
                )}
              >
                <CreatePlanTile t={t} />
              </div>
            </div>
          )}
        </div>

        {/* Ended plans: kept as training history, visually separated */}
        {!isLoading && endedPlans.length > 0 && (
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
        {!isLoading && planCount > 0 && (
          <p className="font-mono text-[11px] text-muted-foreground text-center">
            {t("plansPage.planCount", { count: planCount })}
          </p>
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

        {/* Why this catalogue — editorial 3-column block, mirrors the design
            mockup. Fixed paper/ink regardless of theme: this is a deliberate
            editorial insert (like a magazine sidebar), not a themed panel. */}
        <div className="border-2 border-foreground bg-paper p-6 md:p-10">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink/60">
            {t("plansPage.whyCatalogue.eyebrow")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7 mt-4 text-sm leading-[1.6] text-ink/70">
            {(["readable", "nine", "noTracking"] as const).map((key) => (
              <p key={key}>
                <strong className="font-semibold text-ink">
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
