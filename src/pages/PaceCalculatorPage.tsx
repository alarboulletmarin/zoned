import { useTranslation } from "react-i18next";
import { Gauge } from "@/components/icons";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { SEOHead } from "@/components/seo";

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Gauge className="size-8 text-primary" />
            {t("calculators:calculateurs.paces.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculators:calculateurs.paces.description")}
          </p>
        </div>

        <PaceCalculator />
      </div>
    </>
  );
}
