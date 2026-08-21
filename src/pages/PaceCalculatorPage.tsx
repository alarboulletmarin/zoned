import { useTranslation } from "react-i18next";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { SEOHead } from "@/components/seo";
import { CalculatorHero } from "@/components/calculators";

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
      <div className="py-8 max-w-2xl mx-auto">
        <CalculatorHero
          groupLabel={t("calculators:calculateurs.groups.zonesAllures")}
          title={t("calculators:calculateurs.paces.title")}
          description={t("calculators:calculateurs.paces.description")}
        />

        <PaceCalculator />
      </div>
    </>
  );
}
