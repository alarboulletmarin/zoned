import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, CalendarRange } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import {
  EditorialTitle,
  FadeUp,
  StaggerGrid,
  StaggerItem,
} from "@/components/editorial";
import { usePlans } from "@/hooks/usePlans";
import { savePlan } from "@/lib/planStorage";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";
import { usePickLang } from "@/lib/i18n-utils";

export function WeeksListPage() {
  const { t } = useTranslation(["library", "plan"]);
  const pick = usePickLang();
  const navigate = useNavigate();
  const { plans, remove } = usePlans();

  function handleCreate() {
    const plan = createEmptyWeekPlan(t("weekly.generate.defaultName"));
    savePlan(plan);
    navigate(`/weeks/${plan.id}`);
  }

  const weeks = useMemo(
    () =>
      plans
        .filter((p) => p.config.isSingleWeek)
        .sort(
          (a, b) =>
            new Date(b.config.createdAt).getTime() -
            new Date(a.config.createdAt).getTime(),
        ),
    [plans],
  );

  return (
    <>
      <SEOHead noindex title={t("weekly.list.title")} canonical="/weeks" />
      <div className="py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <EditorialTitle as="h1" size="md">
              {t("weekly.list.title")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground mt-1">
              {t("weekly.list.subtitle")}
            </FadeUp>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="size-4" />
            {t("weekly.list.create")}
          </Button>
        </div>

        {weeks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-4">
              <CalendarRange className="size-10 mx-auto text-muted-foreground/60" />
              <p className="text-muted-foreground">{t("weekly.list.empty")}</p>
              <Button onClick={handleCreate}>
                <Plus className="size-4" />
                {t("weekly.list.create")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {weeks.map((week) => {
              const count = week.weeks[0]?.sessions.length ?? 0;
              return (
                <StaggerItem key={week.id}>
                  <div className="group relative h-full">
                    <Link to={`/weeks/${week.id}`} className="block h-full">
                      <Card
                        interactive
                        className="h-full bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent border-border/50"
                      >
                        <CardContent className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center gap-2 text-zone-2">
                            <CalendarRange className="size-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">
                              {t("weekly.title")}
                            </span>
                          </div>
                          <h2 className="font-semibold leading-snug line-clamp-2">
                            {pick(week, "name")}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {t("weekly.list.sessionsCount", { count })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              week.config.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => remove(week.id)}
                      aria-label={t("weekly.list.delete")}
                      title={t("weekly.list.delete")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        )}
      </div>
    </>
  );
}
