import type { CSSProperties } from "react";
import { ArrowLeft, Check } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { StatBlock } from "@/components/domain/StatBlock";
import { formatDate } from "@/lib/i18n-utils";
import { DIFFICULTY_META } from "@/types";
import { RACE_DISTANCE_META } from "@/types/plan";
import { sortIntermediateGoals } from "@/lib/intermediateGoalValidation";
import type { IntermediateGoal } from "@/types/plan";
import { estimateFinishTime, formatPace } from "../helpers";
import { SummaryRow } from "../Option";
import type { StepContext, StepDef } from "../types";

/**
 * Le récapitulatif, qui rend sa propre navigation : son bouton ne fait pas
 * « suivant », il génère le plan. D'où `ownsNav` dans sa déclaration.
 */
function SummaryBody({
  form,
  t,
  pick,
  uid,
  derived,
  direction,
  goBack,
  submit,
}: StepContext) {
  const { isRacePlan, weeksCount, paceSeconds } = derived;
  const questionId = `${uid}-question`;

    const distMeta = form.raceDistance ? RACE_DISTANCE_META[form.raceDistance] : null;
    const levelMeta = form.runnerLevel ? DIFFICULTY_META[form.runnerLevel] : null;
    const distanceKm = distMeta?.distanceKm ?? 0;
    const planWeeks = isRacePlan ? weeksCount : form.totalWeeksOverride;

    const stats: {
      value: string;
      label: string;
      footnote?: string;
      tone: "card" | "ink";
    }[] = [];
    if (isRacePlan && distMeta) {
      stats.push({ value: pick(distMeta, "label"), label: t("summary.distance"), tone: "card" });
    }
    if (planWeeks > 0) {
      stats.push({
        value: String(planWeeks),
        label: t("duration.weeks"),
        footnote: form.raceDate
          ? formatDate(form.raceDate, { month: "short", day: "numeric" })
          : undefined,
        tone: "card",
      });
    }
    stats.push({ value: String(form.daysPerWeek), label: t("summary.days"), tone: "card" });
    if (form.currentWeeklyKm) {
      stats.push({
        value: `${form.currentWeeklyKm} km`,
        label: t("summary.weeklyKm"),
        tone: "ink",
      });
    }

  return (
    <>
        <CardContent className="zn-wiz__pane" data-direction={direction}>
          <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
            <h2 id={questionId} className="zn-title" data-level="3">
              {t("summary.title")}
            </h2>
            <p className="zn-body zn-body--sm zn-muted">{t("summary.subtitle")}</p>
          </div>

          {/* The plan in numbers, before the line-by-line recap. Only the ones
              the athlete actually answered: a stat block reading "—" is a
              hole, and a hole is not a measure. */}
          <div
            className="zn-grid"
            style={{ "--cols": stats.length, "--gap": "var(--sp-6)" } as CSSProperties}
          >
            {stats.map((stat) => (
              <StatBlock key={stat.label} size="sm" {...stat} />
            ))}
          </div>

          <dl className="zn-wiz-sum">
            {distMeta && (
              <SummaryRow
                label={t("summary.distance")}
                value={`${pick(distMeta, "label")} · ${distMeta.distanceKm} km`}
              />
            )}
            {form.raceDate && (
              <SummaryRow
                label={t("summary.date")}
                value={`${formatDate(form.raceDate)} · ${weeksCount} ${t("summary.weeksShort")}`}
              />
            )}
            {form.startDate && (
              <SummaryRow
                label={t("summary.startDate")}
                value={formatDate(form.startDate)}
              />
            )}
            {form.raceName && (
              <SummaryRow label={t("summary.name")} value={form.raceName} />
            )}

            {form.intermediateGoals.length > 0 && (
              <>
                <dt className="zn-wiz-sum__label">{t("intermediateGoals.title")}</dt>
                <dd className="zn-wiz-sum__nest">
                  <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
                    {sortIntermediateGoals(form.intermediateGoals).map((goal: IntermediateGoal, idx: number) => (
                      <div key={idx} className="zn-row" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
                        <span className="zn-mono zn-accent zn-fixed">
                          {t(`intermediateGoals.badge.${goal.priority}`)}
                        </span>
                        <span className="zn-body zn-body--sm zn-truncate zn-fill">
                          {pick(RACE_DISTANCE_META[goal.raceDistance], "label")}
                          {goal.raceName ? ` · ${goal.raceName}` : ""}
                        </span>
                        <span className="zn-mono zn-faint zn-fixed">
                          {goal.raceDate ? formatDate(goal.raceDate, { month: "short", day: "numeric" }) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </dd>
              </>
            )}

            {levelMeta && (
              <SummaryRow label={t("summary.level")} value={pick(levelMeta, "label")} />
            )}
            <SummaryRow label={t("summary.days")} value={String(form.daysPerWeek)} mono />
            {!!paceSeconds && (
              <SummaryRow
                label={t("summary.pace")}
                mono
                value={`${formatPace(paceSeconds)}/km → ${estimateFinishTime(paceSeconds, distanceKm)}`}
              />
            )}
            {form.elevationGain && (
              <SummaryRow
                label={t("summary.elevation")}
                value={`${form.elevationGain} m D+`}
                mono
              />
            )}
            <SummaryRow
              label={t("summary.goal")}
              value={
                form.trainingGoal === "finish" ? t("goal.finish")
                  : form.trainingGoal === "compete" ? t("goal.compete")
                    : t("goal.time")
              }
            />
            {form.planPurpose !== "race" && (
              <SummaryRow
                label={t("summary.purpose")}
                value={
                  form.planPurpose === "base_building" ? t("summary.purposeBaseBuilding")
                    : form.planPurpose === "return_from_injury" ? t("summary.purposeReturnFromInjury")
                      : t("summary.purposeBeginnerStart")
                }
              />
            )}
            {form.planPurpose !== "race" && form.totalWeeksOverride > 0 && (
              <SummaryRow
                label={t("summary.duration")}
                value={t("summary.durationValue", { weeks: form.totalWeeksOverride })}
                mono
              />
            )}
            {form.currentWeeklyKm && (
              <SummaryRow
                label={t("summary.weeklyKm")}
                value={t("summary.currentVolume", { km: form.currentWeeklyKm })}
                mono
              />
            )}
            <SummaryRow
              label={t("summary.longRun")}
              value={t(`days.${form.longRunDay}`)}
            />
            {form.includeStrength && (
              <SummaryRow
                label={t("summary.strengthTraining")}
                value={t("schedule.strengthPerWeek", { n: form.strengthFrequency })}
                mono
              />
            )}
          </dl>

          {submit.error && (
            <Alert kind="error" title={t("wizard.errorTitle")}>
              {submit.error} {t("wizard.errorHint")}
            </Alert>
          )}
        </CardContent>

        <CardFooter className="zn-wiz__nav">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft />
            {t("nav.back")}
          </Button>
          <span className="zn-push" />
          <Button onClick={submit.generate} disabled={submit.isGenerating}>
            {submit.isGenerating ? (
              <>
                <Spinner size={16} inline />
                {t("summary.generating")}
              </>
            ) : (
              <>
                <Check />
                {t("summary.generate")}
              </>
            )}
          </Button>
        </CardFooter>
    </>
  );
}

export const summaryStep: StepDef = {
  id: "summary",
  titleKey: "summary.title",
  Body: SummaryBody,
  isComplete: () => true,
  ownsNav: true,
};
