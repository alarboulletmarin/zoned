import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { PrebuiltPlanCard } from "@/components/domain/PrebuiltPlanCard";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";

export function PrebuiltPlansPage() {
  const { t } = useTranslation("plan");

  const plans = getAllPrebuiltPlans();

  return (
    <>
      <SEOHead
        title={t("prebuiltList.title")}
        description={t("prebuiltList.description")}
        canonical="/plan/new/prebuilt"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: "Plans", item: "https://zoned.run/plans" },
            { "@type": "ListItem", position: 3, name: t("prebuiltList.title") },
          ],
        }}
      />
      <div className="py-8">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/plan/new">
            <ArrowLeft className="mr-2 size-4" />
            {t("prebuiltList.back")}
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("prebuiltList.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("prebuiltList.subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div
          className={cn(
            "grid gap-4",
            "grid-cols-2 lg:grid-cols-3",
          )}
        >
          {plans.map((plan) => (
            <PrebuiltPlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {t("prebuiltList.available", { count: plans.length })}
        </div>
      </div>
    </>
  );
}
