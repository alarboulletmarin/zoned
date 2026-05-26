import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Zap, CalendarRange, BookOpen } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem } from "@/components/editorial";

export function PlanNewPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title={t("seo.planNew")}
        description={t("seo.planNewDesc")}
        canonical="/plan/new"
      />
      <div className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/plans">
              <ArrowLeft className="mr-2 size-4" />
              {t("plans.backToPlans")}
            </Link>
          </Button>

          {/* Title */}
          <div className="text-center space-y-2">
            <EditorialTitle as="h1" size="md">
              {t("plans.createPlan")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground">
              {t("plans.choosePlanType")}
            </FadeUp>
          </div>

          {/* Cards */}
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Assisted plan */}
            <StaggerItem>
              <Link to="/plan/new/assisted" className="block h-full">
                <Card interactive className="h-full bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 hover:border-foreground/40 transition-all duration-200">
                  <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                    <div className="size-10 sm:size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="size-5 sm:size-8 text-primary" />
                    </div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold">
                        {t("plans.assistedPlan")}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("plans.assistedPlanDesc")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>

            {/* Free plan */}
            <StaggerItem>
              <Link to="/plan/new/free" className="block h-full">
                <Card interactive className="h-full bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 hover:border-foreground/40 transition-all duration-200">
                  <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                    <div className="size-10 sm:size-16 rounded-full bg-zone-2/10 flex items-center justify-center shrink-0">
                      <CalendarRange className="size-5 sm:size-8 text-zone-2" />
                    </div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold">
                        {t("plans.freePlan")}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("plans.freePlanDesc")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>

            {/* Pre-built plans */}
            <StaggerItem>
              <Link to="/plan/new/prebuilt" className="block h-full">
                <Card interactive className="h-full bg-gradient-to-br from-zone-5/10 dark:from-zone-5/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 hover:border-foreground/40 transition-all duration-200">
                  <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                    <div className="size-10 sm:size-16 rounded-full bg-zone-5/10 flex items-center justify-center shrink-0">
                      <BookOpen className="size-5 sm:size-8 text-zone-5" />
                    </div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold">
                        {t("plans.prebuiltPlans")}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("plans.prebuiltPlansDesc")}
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
