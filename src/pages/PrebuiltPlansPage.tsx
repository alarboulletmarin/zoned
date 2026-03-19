import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { PrebuiltPlanCard } from "@/components/domain/PrebuiltPlanCard";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";

export function PrebuiltPlansPage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const plans = getAllPrebuiltPlans();

  return (
    <>
      <SEOHead
        title={isEn ? "Pre-built plans" : "Plans pr\u00eat-\u00e0-l'emploi"}
        description={
          isEn
            ? "Structured plans, ready to use immediately."
            : "Des plans structur\u00e9s, pr\u00eats \u00e0 utiliser imm\u00e9diatement."
        }
        canonical="/plan/new/prebuilt"
      />
      <div className="py-8">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/plan/new">
            <ArrowLeft className="mr-2 size-4" />
            {isEn ? "Back" : "Retour"}
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEn ? "Pre-built plans" : "Plans pr\u00eat-\u00e0-l'emploi"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isEn
              ? "Structured plans, ready to use immediately"
              : "Des plans structur\u00e9s, pr\u00eats \u00e0 utiliser imm\u00e9diatement"}
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
          {isEn
            ? `${plans.length} plan${plans.length !== 1 ? "s" : ""} available`
            : `${plans.length} plan${plans.length !== 1 ? "s" : ""} disponible${plans.length !== 1 ? "s" : ""}`}
        </div>
      </div>
    </>
  );
}
