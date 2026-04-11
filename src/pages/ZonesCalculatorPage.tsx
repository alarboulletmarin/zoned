import { useTranslation } from "react-i18next";
import { Activity } from "@/components/icons";
import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
import { SEOHead } from "@/components/seo";

export function ZonesCalculatorPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.zones.seoTitle")}
        description={t("calculators:calculateurs.zones.seoDescription")}
        canonical="/calculators/zones"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.zones.seoAppName"),
            description: t("calculators:calculateurs.zones.seoAppDescription"),
            url: "https://zoned.run/calculators/zones",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.zones.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Activity className="size-8 text-primary" />
            {t("calculators:calculateurs.zones.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculators:calculateurs.zones.description")}
          </p>
        </div>

        <ZoneCalculator />
      </div>
    </>
  );
}
