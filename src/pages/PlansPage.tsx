import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Plus,
  ArrowRight,
  Trash2,
  Upload,
  FlaskConical,
  Scale,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
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
import { usePlans } from "@/hooks/usePlans";
import { importPlan } from "@/lib/planStorage";
import { toast } from "sonner";
import {
  PHASE_META,
  RACE_DISTANCE_META,
} from "@/types/plan";
import type { TrainingPlan, PhaseRange } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import { getCurrentWeek, isPlanEnded } from "@/lib/planUtils";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { PlanSparkline } from "@/components/domain/PlanSparkline";
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
}: {
  plan: TrainingPlan;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation("plan");
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

  // The span the plan actually covers. Prefer the explicit start→end range;
  // fall through to createdAt→raceDate only when no start date is set (#102).
  const span = plan.config.startDate
    ? plan.config.endDate
      ? `${formatDateShort(plan.config.startDate)} → ${formatDateShort(plan.config.endDate)}`
      : formatDateShort(plan.config.startDate)
    : plan.config.raceDate
      ? `${formatDateShort(plan.config.createdAt)} → ${formatDateShort(plan.config.raceDate)}`
      : formatDateShort(plan.config.createdAt);

  // Numbers, not adjectives: what the plan holds, on one mono line.
  const shape = [
    currentPhase ? pick(PHASE_META[currentPhase], "label") : null,
    t("plansPage.sessionsCount", { count: totalSessions }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="zn-plancard" data-ended={ended ? "true" : undefined}>
      <Link className="zn-plancard__open" to={`/plan/${plan.id}`}>
        <div className="zn-row zn-row--start" style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}>
          <span className="zn-plancard__name zn-fill">{planName}</span>
          <Badge
            variant={raceMeta ? "default" : "secondary"}
            className="zn-fixed"
          >
            {raceMeta
              ? pick(raceMeta, "label")
              : plan.config.planMode === "prebuilt"
                ? t("view.prebuilt")
                : t("view.freePlan")}
          </Badge>
        </div>

        <div className="zn-plancard__facts zn-mono">
          <span>{ended ? `${t("plansPage.ended")} · ${span}` : span}</span>
          <span>{shape}</span>
          {plan.raceTimePrediction && (
            <span>
              {t("plansPage.target")}
              {plan.raceTimePrediction}
            </span>
          )}
        </div>

        <PlanSparkline plan={plan} currentWeek={currentWeek} isEn={isEn} />

        <div className="zn-plancard__track">
          <span
            className="zn-plancard__fill"
            style={{ "--zn-progress": `${progressPercent}%` } as React.CSSProperties}
          />
        </div>
        <div className="zn-row zn-row--split zn-mono zn-faint">
          <span>
            {t("plansPage.weekProgress", { current: weeksElapsed, total: plan.totalWeeks })}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </Link>

      <div className="zn-plancard__actions">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/plan/${plan.id}`}>
            <ArrowRight />
            {t("plansPage.view")}
          </Link>
        </Button>
        <PlanExportMenu plan={plan} size="sm" variant="outline" />
        <Button
          variant="outline"
          size="icon-sm"
          className="zn-plancard__del"
          aria-label={t("plansPage.deleteButton")}
          title={t("plansPage.deleteButton")}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plan.id);
          }}
        >
          <Trash2 />
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
      <div className="zn-plans">
        {/* 1 — the shelf, counted, with the two ways onto it */}
        <section className="zn-plans__head">
          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}>
            <span className="zn-kicker">
              {planCount > 0 ? t("plansPage.planCount", { count: planCount }) : " "}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("plansPage.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-plans__lede">
              {t("plansPage.subtitle")}
            </p>
            <div className="zn-cluster">
              <Button variant="outline" size="sm" asChild>
                <Link to="/plans/methodology">
                  <FlaskConical />
                  {t("plansPage.science")}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/calculators/what-if">
                  <Scale />
                  {t("plansPage.whatIf")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="zn-cluster">
            <Button variant="outline" onClick={handleImport}>
              <Upload />
              {t("plansPage.import")}
            </Button>
            {/* The one vermillon fill — unless the shelf is empty, in which
                case the empty state carries it instead. */}
            <Button variant={planCount > 0 ? "default" : "outline"} asChild>
              <Link to="/plan/new">
                <Plus />
                {t("create")}
              </Link>
            </Button>
          </div>
        </section>

        {/* 2 — the plans */}
        {isLoading ? (
          <div className="zn-plans__band zn-plans__wait">
            <Spinner size={22} />
          </div>
        ) : planCount > 0 ? (
          <>
            {activePlans.length > 0 && (
              <section className="zn-plans__band">
                <div className="zn-grid">
                  {activePlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} onDelete={setDeleteTarget} />
                  ))}
                </div>
              </section>
            )}

            {/* Ended plans: kept as training history, on their own band */}
            {endedPlans.length > 0 && (
              <section className="zn-plans__band">
                <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}>
                  <h2 className="zn-kicker">
                    {t("plansPage.endedSection")} · {endedPlans.length}
                  </h2>
                  <div className="zn-grid">
                    {endedPlans.map((plan) => (
                      <PlanCard key={plan.id} plan={plan} onDelete={setDeleteTarget} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <p className="zn-mono zn-plans__total">
              {t("plansPage.planCount", { count: planCount })}
            </p>
          </>
        ) : (
          <section className="zn-plans__band">
            <EmptyState
              variant="not-started"
              icon={Calendar}
              title={t("plansPage.buildArc")}
              description={t("plansPage.buildArcDesc")}
              action={
                <Button asChild>
                  <Link to="/plan/new">
                    {t("plansPage.createFirst")}
                    <ArrowRight />
                  </Link>
                </Button>
              }
            />
          </section>
        )}
      </div>

      {/* Deleting a plan cannot be undone, so it stays behind a dialog. */}
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
              <Trash2 />
              {t("plansPage.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
