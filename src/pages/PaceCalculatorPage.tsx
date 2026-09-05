import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { SEOHead } from "@/components/seo";

/**
 * The pace calculator, in the "mes chiffres" frame. The tool paints no zone
 * fill, so this screen carries no ink-ramp legend.
 */
export function PaceCalculatorPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.paces.seoTitle")}
        description={t("calculators:calculateurs.paces.seoDescription")}
        canonical="/calculators/allures"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.paces.seoAppName"),
            description: t("calculators:calculateurs.paces.seoAppDescription"),
            url: "https://zoned.run/calculators/allures",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.paces.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-num">
        <section
          className="zn-num__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("calculators:calculateurs.paces.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.paces.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.paces.description")}
          </p>
        </section>

        <section className="zn-num__panel">
          <PaceCalculator />
        </section>
      </div>
    </>
  );
}
