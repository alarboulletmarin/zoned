import { useParams, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { getCompetitorBySlug, type ComparisonValue } from "@/data/competitors";
import { CheckIcon, X, Shield, EyeOff, GithubIcon, Sparkles, ArrowLeft, ArrowRight } from "@/components/icons";
import { useIsEnglish } from "@/lib/i18n-utils";

const SITE_URL = "https://zoned.run";

function ComparisonBadge({ value, isEn, t }: { value: ComparisonValue; isEn: boolean; t: (key: string) => string }) {
  switch (value.type) {
    case "yes":
      return (
        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-sm">
          <CheckIcon className="w-3.5 h-3.5" />
          {t("compare.values.yes")}
        </span>
      );
    case "no":
      return (
        <span className="inline-flex items-center gap-1 text-red-500 dark:text-red-400 font-medium text-sm">
          <X className="w-3.5 h-3.5" />
          {t("compare.values.no")}
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
          ~ {isEn ? value.labelEn : value.labelFr}
        </span>
      );
    case "text":
      return (
        <span className="text-sm text-foreground">
          {isEn ? value.valueEn : value.valueFr}
        </span>
      );
  }
}

const advantageCards = [
  {
    key: "free",
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-green-500/10 to-emerald-500/5 border-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    key: "noAccount",
    icon: <Shield className="w-5 h-5" />,
    color: "from-blue-500/10 to-sky-500/5 border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "noData",
    icon: <EyeOff className="w-5 h-5" />,
    color: "from-orange-500/10 to-amber-500/5 border-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    key: "openSource",
    icon: <GithubIcon className="w-5 h-5" />,
    color: "from-purple-500/10 to-violet-500/5 border-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
] as const;

export function CompareDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation("common");
  const isEn = useIsEnglish();

  const competitor = slug ? getCompetitorBySlug(slug) : undefined;

  if (!competitor) {
    return <Navigate to="/compare" replace />;
  }

  const name = isEn ? competitor.nameEn : competitor.nameFr;
  const tagline = isEn ? competitor.taglineEn : competitor.taglineFr;
  const description = isEn ? competitor.descriptionEn : competitor.descriptionFr;
  const title = `Zoned vs ${name}`;

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical={`/compare/${competitor.slug}`}
        jsonLd={[
          {
            "@type": "WebPage",
            name: title,
            description,
            url: `${SITE_URL}/compare/${competitor.slug}`,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav.home"), item: SITE_URL },
              { "@type": "ListItem", position: 2, name: t("compare.title"), item: `${SITE_URL}/compare` },
              { "@type": "ListItem", position: 3, name: title },
            ],
          },
        ]}
      />

      <div className="py-8 space-y-12 max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/compare"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("compare.backToCompare")}
        </Link>

        {/* Hero */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            Zoned {t("compare.tableHeader.zoned") !== "Zoned" ? "" : "vs"} {name}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Zoned <span className="text-muted-foreground">vs</span> {name}
          </h1>
          <p className="text-muted-foreground max-w-xl">{tagline}</p>
          <div className="flex flex-wrap gap-2">
            {[t("comparePage.badgeFree"), t("comparePage.badgeNoAccount"), "Open Source"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {t("comparePage.featureComparison")}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-1/2">
                    {t("compare.tableHeader.criterion")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-primary">
                    {t("compare.tableHeader.zoned")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    {name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitor.criteria.map((criterion, i) => (
                  <tr
                    key={criterion.key}
                    className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {isEn ? criterion.labelEn : criterion.labelFr}
                    </td>
                    <td className="px-4 py-3">
                      <ComparisonBadge value={criterion.zoned} isEn={isEn} t={t} />
                    </td>
                    <td className="px-4 py-3">
                      <ComparisonBadge value={criterion.competitor} isEn={isEn} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Advantages */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t("compare.advantages.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {advantageCards.map((card) => (
              <div
                key={card.key}
                className={`rounded-xl border bg-gradient-to-br p-4 space-y-1.5 ${card.color}`}
              >
                <div className={`${card.iconColor}`}>{card.icon}</div>
                <p className="font-semibold text-sm">
                  {t(`compare.advantages.${card.key}.title`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`compare.advantages.${card.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">{t("compare.cta.title")}</h2>
            <p className="text-muted-foreground">{t("compare.cta.subtitle")}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("compare.cta.button")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
