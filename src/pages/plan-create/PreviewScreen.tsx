import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PlanTimeline } from "@/components/domain/PlanTimeline";
import { PlanDayList } from "@/components/domain/plan/PlanDayList";
import { usePlanFormats } from "@/components/domain/plan/planFormat";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { buildPlanCardModel } from "@/lib/planCardModel";
import { buildPlanWeekModel } from "@/lib/planWeekModel";
import { addDaysToDate, getPlanMonday, isoDateOnly } from "@/lib/planDates";
import type { FailureReason } from "@/lib/failure";
import type { TrainingPlan } from "@/types/plan";
import { usePlanTemplates } from "./useLivePlan";
import { ScreenHead } from "./ScreenHead";

interface PreviewScreenProps {
  kind: "custom" | "ready";
  title: string;
  /** Le nom du plan prêt, posé devant la durée. */
  prebuiltName: string | null;
  plan: TrainingPlan | null;
  busy: boolean;
  error: FailureReason | null;
  /** Le premier jour du plan. */
  start: string;
  raceDate: string | null;
  raceName: string | null;
  sessionsPerWeek: number;
  noVma: boolean;
  onCreate: () => void;
  creating: boolean;
  /** Ce qui empêche de créer (une course de préparation mal datée). */
  blocked: boolean;
  createError: FailureReason | null;
  refine?: ReactNode;
}

const isRun = (workoutId: string, sessionType: string) =>
  workoutId !== "__race_day__" && workoutId !== "__intermediate_race__" && sessionType !== "strength";

/** 2.5 Le plan, généré pour de vrai, avant d'être enregistré. */
export function PreviewScreen(props: PreviewScreenProps) {
  const { kind, title, prebuiltName, plan, busy, error, start, raceDate, raceName } = props;
  const { t } = useTranslation(["plan", "common"]);
  const f = usePlanFormats();
  const { workoutOf, nameOf } = usePlanTemplates(plan);
  const today = useMemo(() => new Date(), []);

  const model = useMemo(
    () => (plan ? buildPlanCardModel(plan, today, workoutOf) : null),
    [plan, today, workoutOf],
  );
  const week1 = useMemo(
    () => (plan ? buildPlanWeekModel(plan, 1, today, workoutOf) : null),
    [plan, today, workoutOf],
  );
  const facts = useMemo(() => {
    if (!plan) return null;
    let peak = 0;
    let longest = 0;
    for (const week of plan.weeks) {
      let total = 0;
      for (const s of week.sessions) {
        if (!isRun(s.workoutId, s.sessionType)) continue;
        total += s.estimatedDurationMin;
        if (s.sessionType === "long_run") longest = Math.max(longest, s.estimatedDurationMin);
      }
      peak = Math.max(peak, total);
    }
    return { peak, longest };
  }, [plan]);

  const end = plan
    ? raceDate ?? addDaysToDate(isoDateOnly(getPlanMonday(plan)), plan.totalWeeks * 7 - 1)
    : null;

  return (
    <>
      <ScreenHead
        kicker={kind === "ready" ? t("parcours.preview.ready") : t("parcours.preview.custom")}
        title={title}
        lede={
          plan && end ? (
            <>
              {prebuiltName ? `${prebuiltName}, ` : null}
              <strong>{t("parcours.date.weeks", { count: plan.totalWeeks })}</strong>
              {t("parcours.preview.range", { start: f.dayDate(start), end: f.dayDate(end) })}
              {raceDate ? t("parcours.preview.raceDay") : null}
            </>
          ) : undefined
        }
      />

      {error ? (
        <Alert kind="error" title={t("wizard.errorTitle")}>
          {t(`common:failure.${error}`)} {t("wizard.errorHint")}
        </Alert>
      ) : (
        <div
          className="zn-pc__timeline"
          aria-busy={busy || !model}
          data-busy={busy || undefined}
          aria-label={t("parcours.preview.timeline")}
          role="group"
        >
          {model ? <PlanTimeline model={model} variant="wide" /> : <div className="zn-pc__ghost" />}
        </div>
      )}

      {plan && facts && !error && (
        <dl className="zn-pc__facts">
          <div>
            <dt>{t("parcours.preview.perWeek")}</dt>
            <dd>{t("parcours.preview.perWeekValue", { count: props.sessionsPerWeek })}</dd>
          </div>
          <div>
            <dt>{t("parcours.preview.peak")}</dt>
            <dd>{formatDurationMinutes(facts.peak)}</dd>
          </div>
          <div>
            <dt>{t("parcours.preview.longest")}</dt>
            <dd>{formatDurationMinutes(facts.longest)}</dd>
          </div>
        </dl>
      )}

      {props.noVma && plan && !error && (
        <p className="zn-pc__hint">
          {t("parcours.preview.noVma")} <Link to="/profile">{t("parcours.preview.noVmaLink")}</Link>
        </p>
      )}

      {props.createError && !error && (
        <Alert kind="error" title={t("wizard.errorTitle")}>
          {t(`common:failure.${props.createError}`)} {t("wizard.errorHint")}
        </Alert>
      )}

      <div className="zn-pc__actions">
        <Button
          size="lg"
          disabled={!plan || !!error || props.creating || props.blocked}
          onClick={props.onCreate}
        >
          {t("parcours.preview.create")}
          <ArrowRight />
        </Button>
      </div>

      {props.refine}

      {week1 && !error && (
        <section className="zn-pc__week1" aria-labelledby="zn-pc-week1">
          <h2 id="zn-pc-week1" className="zn-pc__h2">
            {t("parcours.preview.week1")}
          </h2>
          <PlanDayList model={week1} mode="read" nameOf={nameOf} workoutOf={workoutOf} raceName={raceName} />
        </section>
      )}
    </>
  );
}
