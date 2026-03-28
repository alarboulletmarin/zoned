import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { competitors } from "@/data/competitors";
import { ArrowRight } from "@/components/icons";

const SITE_URL = "https://zoned.run";

export function CompareHubPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

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

      <div className="py-8 space-y-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            {t("compare.subtitle")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground max-w-xl">{description}</p>
        </div>

        {/* Competitor cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {competitors.map((competitor) => {
            const name = isEn ? competitor.nameEn : competitor.nameFr;
            const tagline = isEn ? competitor.taglineEn : competitor.taglineFr;
            return (
              <Link
                key={competitor.slug}
                to={`/compare/${competitor.slug}`}
                className="group flex flex-col gap-3 rounded-xl border border-border p-5 hover:border-primary/50 hover:bg-muted/30 transition-all"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    Zoned <span className="text-muted-foreground">vs</span> {name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{tagline}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">
                    {isEn ? competitor.priceEn : competitor.priceFr}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Zoned pitch */}
        <div className="rounded-xl border bg-muted/30 p-6 space-y-2">
          <p className="font-semibold">
            {isEn ? "Why these comparisons?" : "Pourquoi ces comparaisons ?"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isEn
              ? "Zoned is free, open source, requires no account and collects no data. We think those differences matter — these pages are here to help you decide."
              : "Zoned est gratuit, open source, ne nécessite aucun compte et ne collecte aucune donnée. Ces différences comptent — ces pages sont là pour vous aider à choisir."}
          </p>
        </div>
      </div>
    </>
  );
}
