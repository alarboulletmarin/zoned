import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { ContributeForm } from "@/components/domain/contribute/ContributeForm";

export function ContributePage() {
  const { t } = useTranslation(["contribute", "common"]);

  return (
    <>
      <SEOHead
        title={t("common:seo.contribute")}
        description={t("common:seo.contributeDesc")}
        canonical="/contribute"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: t("common:seo.contribute") },
          ],
        }}
      />
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <EditorialTitle as="h1" size="md">{t("title")}</EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground mt-1">
            {t("subtitle")}
          </FadeUp>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <ContributeForm />
        </div>
      </div>
    </>
  );
}
