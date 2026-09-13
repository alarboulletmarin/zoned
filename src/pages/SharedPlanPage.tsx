import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo";
import { decodeSharedPlan } from "@/lib/share/planShare";
import { generatePlan } from "@/lib/planGenerator";
import { computePlanStats } from "@/lib/planStats";
import { savePlan } from "@/lib/planStorage";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { usePickLang } from "@/lib/i18n-utils";
import type { TrainingPlan } from "@/types/plan";

export function SharedPlanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation("plan");
  const pick = usePickLang();

  const encoded = searchParams.get("d");
  const config = useMemo(
    () => (encoded ? decodeSharedPlan(encoded) : null),
    [encoded],
  );

  // The link carries the config, not the plan, rebuild it here. Seeded
  // generation guarantees this matches what the sender sees.
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!config) return;
    let cancelled = false;

    generatePlan({
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
      .then((generated) => {
        if (!cancelled) setPlan(generated);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [config]);

  if (!config || failed) {
    return (
      <>
        <SEOHead noindex title={t("shared.title")} canonical="/plan/shared" />
        <div className="zn-planshared">
          <section className="zn-planshared__head">
            <Alert
              kind="error"
              title={t("shared.title")}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link to="/plans">
                    <ArrowLeft />
                    {t("shared.backToPlans")}
                  </Link>
                </Button>
              }
            >
              {t("shared.invalid")}
            </Alert>
          </section>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <SEOHead noindex title={t("shared.title")} canonical="/plan/shared" />
        <div className="zn-planshared">
          <section className="zn-planshared__head">
            <Spinner size={22} label={t("shared.generating")} />
          </section>
        </div>
      </>
    );
  }

  const stats = computePlanStats(plan);
  const planName = pick(plan, "name");

  // What the link contains, in numbers, before the person commits to saving it.
  const shape = [
    t("shared.weeks", { count: plan.totalWeeks }),
    t("shared.sessions", { count: stats.totalSessions }),
    `${Math.round(stats.totalEstimatedKm)} km`,
  ].join(" · ");

  const handleAdd = () => {
    if (!savePlan(plan)) {
      toast.error(t("errors.planSaveFailed"));
      return;
    }
    triggerStorageWarning();
    toast.success(t("shared.added"));
    navigate(`/plan/${plan.id}`);
  };

  return (
    <>
      <SEOHead noindex title={planName} canonical="/plan/shared" />
      <div className="zn-planshared">
        {/* 1, what was shared, counted, and the one call */}
        <section className="zn-planshared__head">
          <span className="zn-kicker">{shape}</span>
          <h1 className="zn-display" data-level="2">
            {planName}
          </h1>
          <p className="zn-body zn-body--lead zn-measure">
            {t("shared.subtitle")}
          </p>
          <div className="zn-cluster">
            <Button onClick={handleAdd} className="zn-planshared__add">
              {t("shared.add")}
            </Button>
          </div>
        </section>

        {/* 2, week by week, as a printed table */}
        <section className="zn-planshared__weeks">
          {plan.weeks.map((week) => (
            <div key={week.weekNumber} className="zn-planshared__week">
              <span className="zn-mono zn-planshared__num">
                {t("shared.week", { number: week.weekNumber })}
              </span>
              <span className="zn-kicker zn-kicker--inline">
                {t(`shared.phase.${week.phase}`)}
              </span>
              <span className="zn-mono zn-planshared__count">
                {t("shared.sessions", { count: week.sessions.length })}
              </span>
            </div>
          ))}
        </section>
      </div>

      {/* The same call, in the thumb zone. Only one of the two is ever on
          screen, so the screen still spends a single vermillon fill. */}
      <div className="zn-planshared__cta">
        <Button onClick={handleAdd}>{t("shared.add")}</Button>
      </div>
    </>
  );
}
