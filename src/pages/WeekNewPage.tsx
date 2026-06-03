import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Sparkles, BookOpen } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import {
  EditorialTitle,
  FadeUp,
  StaggerGrid,
  StaggerItem,
} from "@/components/editorial";
import { savePlan } from "@/lib/planStorage";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";

/**
 * Week creation mode picker — mirrors PlanNewPage (3 gradient mode cards),
 * mobile-first (cards stack to one column under sm:). The "Generate" and
 * "Scratch" modes both create an empty single-week plan; "Generate" passes
 * `state.openSettings` so WeekViewPage surfaces the generator settings on
 * arrival (the user picks their parameters, then generates — never blindly).
 * "Pre-built" links to the gallery.
 */
export function WeekNewPage() {
  const { t } = useTranslation("library");
  const navigate = useNavigate();

  function createWeek(openSettings: boolean) {
    const plan = createEmptyWeekPlan(t("weekly.generate.defaultName"));
    savePlan(plan);
    navigate(
      `/weeks/${plan.id}`,
      openSettings ? { state: { openSettings: true } } : undefined,
    );
  }

  return (
    <>
      <SEOHead
        noindex
        title={t("weekly.new.title")}
        canonical="/weeks/new"
      />
      <div className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/weeks">
              <ArrowLeft className="mr-2 size-4" />
              {t("weekly.new.back")}
            </Link>
          </Button>

          {/* Title */}
          <div className="text-center space-y-2">
            <EditorialTitle as="h1" size="md">
              {t("weekly.new.title")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground">
              {t("weekly.new.subtitle")}
            </FadeUp>
          </div>

          {/* Cards — two modes: create (generate or build), or pre-built. */}
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Create a week (generate 80/20 or build by hand) */}
            <StaggerItem>
              <button
                type="button"
                onClick={() => createWeek(true)}
                className="block h-full w-full text-left"
              >
                <Card
                  interactive
                  className="h-full bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 hover:border-foreground/40 transition-all duration-200"
                >
                  <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                    <div className="size-10 sm:size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="size-5 sm:size-8 text-primary" />
                    </div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold">
                        {t("weekly.new.modes.create.title")}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("weekly.new.modes.create.desc")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </StaggerItem>

            {/* Pre-built week */}
            <StaggerItem>
              <Link to="/weeks/new/prebuilt" className="block h-full">
                <Card
                  interactive
                  className="h-full bg-gradient-to-br from-zone-5/10 dark:from-zone-5/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 hover:border-foreground/40 transition-all duration-200"
                >
                  <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                    <div className="size-10 sm:size-16 rounded-full bg-zone-5/10 flex items-center justify-center shrink-0">
                      <BookOpen className="size-5 sm:size-8 text-zone-5" />
                    </div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold">
                        {t("weekly.new.modes.prebuilt.title")}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("weekly.new.modes.prebuilt.desc")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </div>
    </>
  );
}
