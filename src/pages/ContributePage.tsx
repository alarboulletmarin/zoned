import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
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
            { "@type": "ListItem", position: 1, name: t("common:nav.home"), item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: t("common:seo.contribute") },
          ],
        }}
      />

      <div className="zn-contrib-page">
        <section className="zn-section">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-10)" } as CSSProperties}
          >
            <span className="zn-kicker">{t("kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("title")}
            </h1>
            <p className="zn-body zn-body--lead zn-measure">{t("subtitle")}</p>
          </div>
        </section>

        <section className="zn-section">
          <div
            className="zn-measure"
            style={
              {
                "--measure": "var(--page-max-narrow)",
                marginInline: "auto",
              } as CSSProperties
            }
          >
            <ContributeForm />
          </div>
        </section>
      </div>
    </>
  );
}
