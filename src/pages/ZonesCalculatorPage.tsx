import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
import { ZoneScale } from "@/components/visualization";
import { SEOHead } from "@/components/seo";

/**
 * The zones calculator, in the frame the "mes chiffres" door uses: mono
 * kicker, display title, lede, the ink-ramp legend, then the tool. The
 * calculator itself was ported in its own lot and is not restyled here.
 */
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

      <div className="zn-num">
        <section
          className="zn-num__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("calculators:calculateurs.zones.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.zones.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.zones.description")}
          </p>
        </section>

        {/* The ramp orders the zones but does not name them: the legend once. */}
        <div className="zn-num__legend">
          <ZoneScale />
        </div>

        <section className="zn-num__panel">
          <ZoneCalculator />
        </section>
      </div>
    </>
  );
}
