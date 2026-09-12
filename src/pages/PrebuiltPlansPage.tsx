import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { PrebuiltPlanCard } from "@/components/domain/PrebuiltPlanCard";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";

/**
 * Les plans tout prêts, en catalogue.
 *
 * Same shape as the library: a mono line counting what is on offer, the
 * display title, one sentence, then outlined cards in a grid. The count is
 * the kicker rather than a footnote under the grid — a number belongs above
 * the thing it measures, not after it.
 */
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

      <div className="zn-pw">
        <Button variant="ghost" size="sm" asChild className="zn-pw__back">
          <Link to="/plan/new">
            <ArrowLeft size={16} />
            {t("prebuiltList.back")}
          </Link>
        </Button>

        <section className="zn-pw__band zn-pw__band--first">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
          >
            <span className="zn-kicker">
              {t("prebuiltList.available", { count: plans.length })}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("prebuiltList.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-pw__lede">
              {t("prebuiltList.subtitle")}
            </p>
          </div>
        </section>

        <section className="zn-pw__band">
          <div className="zn-grid">
            {plans.map((plan) => (
              <PrebuiltPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
