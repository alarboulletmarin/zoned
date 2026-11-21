import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PlanTimeline } from "@/components/domain/PlanTimeline";
import { usePlanFormats } from "@/components/domain/plan/planFormat";
import { buildPlanCardModel } from "@/lib/planCardModel";
import type { TrainingPlan } from "@/types/plan";
import { usePlanTemplates } from "./useLivePlan";

interface PlanAsideProps {
  name: string;
  goalLabel: string;
  isRace: boolean;
  raceDate: string;
  weeks: number;
  start: string;
  /** La semaine type, dès qu'on la règle. */
  week: { days: number; longRunDay: number } | null;
  plan: TrainingPlan | null;
  busy: boolean;
}

/**
 * Bureau : le plan qui se dessine à côté de la question, régénéré à chaque
 * réponse. Avant la date, un cadre vide le dit.
 */
export function PlanAside({ name, goalLabel, isRace, raceDate, weeks, start, week, plan, busy }: PlanAsideProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const { workoutOf } = usePlanTemplates(plan);
  const today = useMemo(() => new Date(), []);
  const model = useMemo(
    () => (plan ? buildPlanCardModel(plan, today, workoutOf) : null),
    [plan, today, workoutOf],
  );

  return (
    <aside className="zn-pc__aside" aria-label={t("parcours.aside.kicker")}>
      <span className="zn-pc__kicker">{t("parcours.aside.kicker")}</span>
      <p className="zn-pc__aside-title">{name || t("parcours.aside.newPlan")}</p>
      <dl className="zn-pc__recap">
        <div>
          <dt>{t("parcours.aside.goal")}</dt>
          <dd>{goalLabel}</dd>
        </div>
        <div>
          <dt>{isRace ? t("parcours.aside.race") : t("parcours.aside.duration")}</dt>
          <dd>
            {isRace
              ? raceDate
                ? f.dayDate(raceDate)
                : "-"
              : t("parcours.date.weeks", { count: weeks })}
          </dd>
        </div>
        <div>
          <dt>{t("parcours.aside.start")}</dt>
          <dd>{f.dayDate(start)}</dd>
        </div>
        {week && (
          <div>
            <dt>{t("parcours.aside.week")}</dt>
            <dd>
              {t("parcours.aside.weekValue", {
                count: week.days,
                day: t(`days.${week.longRunDay}`).toLowerCase(),
              })}
            </dd>
          </div>
        )}
      </dl>
      <div className="zn-pc__timeline" aria-busy={busy || undefined} data-busy={busy || undefined}>
        {model ? (
          <PlanTimeline model={model} variant="card" />
        ) : (
          <div className="zn-pc__ghost zn-pc__ghost--sm">
            <span>{t("parcours.aside.empty")}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
