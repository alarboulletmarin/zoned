import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Flame, BookOpen } from "@/components/icons";
import { MetCalculator } from "@/components/domain/MetCalculator";
import { SEOHead } from "@/components/seo";

export function MetCalculatorPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.met.seoTitle")}
        description={t("calculators:calculateurs.met.seoDescription")}
        canonical="/calculators/met"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.met.seoAppName"),
            description: t("calculators:calculateurs.met.seoAppDescription"),
            url: "https://zoned.run/calculators/met",
            applicationCategory: "HealthApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.met.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Flame className="size-8 text-primary" />
            {t("calculators:calculateurs.met.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculators:calculateurs.met.description")}
          </p>
          <Link
            to="/guides/met"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
          >
            <BookOpen className="size-4" />
            {t("calculators:calculateurs.met.readGuide")}
          </Link>
        </div>

        <MetCalculator />
      </div>
    </>
  );
}
