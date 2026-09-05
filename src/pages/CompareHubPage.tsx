import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { DoorCard } from "@/components/domain/DoorCard";
import { competitors } from "@/data/competitors";
import { usePickLang } from "@/lib/i18n-utils";

const SITE_URL = "https://zoned.run";

const HEAD_GAP = { "--gap": "var(--sp-6)" } as CSSProperties;

export function CompareHubPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  const title = t("compare.hub.title");
  const description = t("compare.hub.description");

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical="/compare"
        jsonLd={{
          "@type": "CollectionPage",
          name: title,
          description,
          url: `${SITE_URL}/compare`,
        }}
      />

      <div className="zn-ref">
        {/* 1 — what this is, counted */}
        <section className="zn-ref__head zn-stack" style={HEAD_GAP}>
          <span className="zn-kicker">
            {t("compare.hub.kicker", { count: competitors.length })}
          </span>
          <h1 className="zn-display" data-level="2">
            {title}
          </h1>
          <p className="zn-body zn-body--lead zn-ref__lede">{description}</p>
        </section>

        {/* 2 — one door per comparison. The price is the mono fact above the
            name: it is the difference the page exists to state. */}
        <section
          className="zn-ref__section"
          aria-labelledby="compare-competitors"
        >
          <h2 id="compare-competitors" className="sr-only">
            {t("compare.title")}
          </h2>
          <div className="zn-grid">
            {competitors.map((competitor) => (
              <DoorCard
                key={competitor.slug}
                to={`/compare/${competitor.slug}`}
                kicker={pickLang(competitor, "price")}
                title={`Zoned vs ${pickLang(competitor, "name")}`}
                body={pickLang(competitor, "tagline")}
                cta={t("compare.hub.readComparison")}
              />
            ))}
          </div>
        </section>

        {/* 3 — why the page exists, as a footnote to it */}
        <section className="zn-ref__section">
          <div className="zn-ref__note zn-ref__column">
            <span className="zn-kicker zn-kicker--inline">
              {t("compare.hub.noteKicker")}
            </span>
            <h2 className="zn-title" data-level="4">
              {t("comparePage.whyComparisons")}
            </h2>
            <p className="zn-body zn-body--sm zn-muted">
              {t("comparePage.whyComparisonsDesc")}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
