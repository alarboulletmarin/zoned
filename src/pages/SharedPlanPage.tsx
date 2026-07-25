import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, Share, Target } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
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

  // The link carries the config, not the plan — rebuild it here. Seeded
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
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("shared.invalid")}</p>
          <Button variant="link" asChild className="mt-4">
            <Link to="/plans">
              <ArrowLeft className="mr-2 size-4" />
              {t("shared.backToPlans")}
            </Link>
          </Button>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <SEOHead noindex title={t("shared.title")} canonical="/plan/shared" />
        <div className="py-12 text-center text-muted-foreground">
          {t("shared.generating")}
        </div>
      </>
    );
  }

  const stats = computePlanStats(plan);
  const planName = pick(plan, "name");

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
      <div className="py-8 max-w-3xl mx-auto space-y-6 pb-28 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent flex items-center justify-center shrink-0">
                <Share className="size-5 text-foreground/80" />
              </div>
              <EditorialTitle as="h1">{planName}</EditorialTitle>
            </div>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground max-w-2xl">
              {t("shared.subtitle")}
            </FadeUp>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="size-3" />
                {t("shared.weeks", { count: plan.totalWeeks })}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Target className="size-3" />
                {t("shared.sessions", { count: stats.totalSessions })}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="size-3" />
                {Math.round(stats.totalEstimatedKm)} km
              </Badge>
            </div>
          </div>

          {/* CTA top (desktop) */}
          <Button size="lg" onClick={handleAdd} className="shrink-0 hidden lg:inline-flex">
            {t("shared.add")}
          </Button>
        </div>

        {/* Week-by-week overview */}
        <div className="space-y-2">
          {plan.weeks.map((week) => (
            <Card key={week.weekNumber} size="flush" className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">
                    {t("shared.week", { number: week.weekNumber })}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {t(`shared.phase.${week.phase}`)}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {t("shared.sessions", { count: week.sessions.length })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mobile sticky CTA (thumb zone). */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button className="w-full" size="lg" onClick={handleAdd}>
          {t("shared.add")}
        </Button>
      </div>
    </>
  );
}
