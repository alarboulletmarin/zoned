import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Zap, CalendarRange, BookOpen } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";

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
          <div className="border-b border-filet pb-6">
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("plans.choosePlanType")}
            </p>
            <h1 className="font-sans font-bold uppercase leading-[0.92] tracking-[-0.04em] text-4xl sm:text-5xl mt-2">
              {t("plans.createPlan")}
            </h1>
          </div>

          {/* Cards — assisted is the recommended path, called out in accent-acid
              to match the "Créer un plan" tile on /plans. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border">
            {/* Assisted plan */}
            <Link
              to="/plan/new/assisted"
              className="h-full w-full bg-accent-acid text-ink p-5 sm:p-6 transition-colors hover:bg-accent-acid/90 flex items-center gap-4 sm:flex-col sm:items-start sm:text-left"
            >
              <div className="size-10 sm:size-12 bg-ink/10 flex items-center justify-center shrink-0">
                <Zap className="size-5 sm:size-6 text-ink" />
              </div>
              <div className="min-w-0">
                <h2 className="font-sans font-bold uppercase tracking-[-0.02em] text-lg sm:text-xl mt-0 sm:mt-3">
                  {t("plans.assistedPlan")}
                </h2>
                <p className="mt-1.5 text-sm text-ink/80">
                  {t("plans.assistedPlanDesc")}
                </p>
              </div>
            </Link>

            {/* Free plan */}
            <Link
              to="/plan/new/free"
              className="h-full w-full bg-background p-5 sm:p-6 transition-colors hover:bg-secondary flex items-center gap-4 sm:flex-col sm:items-start sm:text-left"
            >
              <div className="size-10 sm:size-12 bg-zone-2/10 flex items-center justify-center shrink-0">
                <CalendarRange className="size-5 sm:size-6 text-zone-2" />
              </div>
              <div className="min-w-0">
                <h2 className="font-sans font-bold uppercase tracking-[-0.02em] text-lg sm:text-xl mt-0 sm:mt-3">
                  {t("plans.freePlan")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("plans.freePlanDesc")}
                </p>
              </div>
            </Link>

            {/* Pre-built plans */}
            <Link
              to="/plan/new/prebuilt"
              className="h-full w-full bg-background p-5 sm:p-6 transition-colors hover:bg-secondary flex items-center gap-4 sm:flex-col sm:items-start sm:text-left"
            >
              <div className="size-10 sm:size-12 bg-zone-5/10 flex items-center justify-center shrink-0">
                <BookOpen className="size-5 sm:size-6 text-zone-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-sans font-bold uppercase tracking-[-0.02em] text-lg sm:text-xl mt-0 sm:mt-3">
                  {t("plans.prebuiltPlans")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("plans.prebuiltPlansDesc")}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
