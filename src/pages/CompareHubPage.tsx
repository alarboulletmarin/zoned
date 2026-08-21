import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { competitors } from "@/data/competitors";
import { ArrowRight } from "@/components/icons";
import { usePickLang } from "@/lib/i18n-utils";

const SITE_URL = "https://zoned.run";

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

      <div className="py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("compare.subtitle")}
          </p>
          <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-[32px] sm:text-[42px] md:text-[52px] mt-3">
            {title}
          </h1>
          <p className="mt-3 text-[15px] md:text-base leading-[1.55] text-foreground/80 max-w-[56ch]">
            {description}
          </p>
        </div>

        {/* Competitor tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {competitors.map((competitor) => {
            const name = pickLang(competitor, "name");
            const tagline = pickLang(competitor, "tagline");
            const price = pickLang(competitor, "price");
            return (
              <Link
                key={competitor.slug}
                to={`/compare/${competitor.slug}`}
                className="group flex h-full flex-col gap-3 bg-card p-4 sm:p-[18px] transition-colors hover:bg-secondary"
              >
                <div className="space-y-1.5">
                  <p className="font-sans font-bold uppercase leading-[1.05] tracking-[-0.03em] text-lg sm:text-xl">
                    Zoned{" "}
                    <span className="font-mono text-xs normal-case tracking-normal text-muted-foreground align-middle">
                      vs
                    </span>{" "}
                    {name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground line-clamp-2">
                    {tagline}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase border border-foreground px-2 py-0.5 text-muted-foreground">
                    {price}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Zoned pitch */}
        <div className="border-2 border-foreground bg-card p-6 md:p-10 mt-10 md:mt-12">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("comparePage.whyComparisons")}
          </p>
          <p className="mt-3 text-sm leading-[1.6] text-foreground/80 max-w-[64ch]">
            {t("comparePage.whyComparisonsDesc")}
          </p>
        </div>
      </div>
    </>
  );
}
