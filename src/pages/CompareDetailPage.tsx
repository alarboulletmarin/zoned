import { useParams, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveTable, type ResponsiveTableColumn } from "@/components/ui/responsive-table";
import { getCompetitorBySlug, type ComparisonValue, type ComparisonCriterion } from "@/data/competitors";
import { CheckIcon, X, Shield, EyeOff, GithubIcon, Sparkles, ArrowLeft, ArrowRight } from "@/components/icons";
import { usePickLang } from "@/lib/i18n-utils";

const SITE_URL = "https://zoned.run";

function ComparisonBadge({ value, t }: { value: ComparisonValue; t: (key: string) => string }) {
  const pickLang = usePickLang();
  switch (value.type) {
    case "yes":
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-foreground">
          <CheckIcon className="size-3.5 text-accent-acid" />
          {t("compare.values.yes")}
        </span>
      );
    case "no":
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-muted-foreground">
          <X className="size-3.5" />
          {t("compare.values.no")}
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-foreground/70">
          ~ {pickLang(value, "label")}
        </span>
      );
    case "text":
      return <span className="font-mono text-xs text-foreground">{pickLang(value, "value")}</span>;
  }
}

const advantageCards = [
  { key: "free", icon: <Sparkles className="size-5" /> },
  { key: "noAccount", icon: <Shield className="size-5" /> },
  { key: "noData", icon: <EyeOff className="size-5" /> },
  { key: "openSource", icon: <GithubIcon className="size-5" /> },
] as const;

export function CompareDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  const competitor = slug ? getCompetitorBySlug(slug) : undefined;

  if (!competitor) {
    return <Navigate to="/compare" replace />;
  }

  const name = pickLang(competitor, "name");
  const tagline = pickLang(competitor, "tagline");
  const description = pickLang(competitor, "description");
  const title = `Zoned vs ${name}`;

  const columns: ResponsiveTableColumn<ComparisonCriterion>[] = [
    {
      key: "criterion",
      header: t("compare.tableHeader.criterion"),
      cell: (criterion) => pickLang(criterion, "label"),
    },
    {
      key: "zoned",
      header: t("compare.tableHeader.zoned"),
      cell: (criterion) => <ComparisonBadge value={criterion.zoned} t={t} />,
    },
    {
      key: "competitor",
      header: name,
      cell: (criterion) => <ComparisonBadge value={criterion.competitor} t={t} />,
    },
  ];

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

      <div className="py-8 max-w-3xl mx-auto">
        {/* Back link */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/compare">
            <ArrowLeft className="mr-2 size-4" />
            {t("compare.backToCompare")}
          </Link>
        </Button>

        {/* Hero */}
        <section className="mt-4">
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("compare.title")}
          </p>
          <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-[32px] sm:text-[42px] md:text-[52px] mt-3">
            Zoned <span className="text-muted-foreground">vs</span> {name}
          </h1>
          <p className="mt-3 text-[15px] md:text-base leading-[1.55] text-foreground/80 max-w-[56ch]">
            {tagline}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[t("comparePage.badgeFree"), t("comparePage.badgeNoAccount"), "Open Source"].map((badge) => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mt-10 md:mt-12 space-y-4">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("comparePage.featureComparison")}
          </p>
          <ResponsiveTable data={competitor.criteria} columns={columns} rowKey="key" />
        </section>

        {/* Advantages */}
        <section className="mt-10 md:mt-12 space-y-4">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("compare.advantages.title")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {advantageCards.map((card) => (
              <div key={card.key} className="border-2 border-foreground bg-card p-6 space-y-3">
                <div className="size-9 bg-secondary flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="font-bold">{t(`compare.advantages.${card.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(`compare.advantages.${card.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-10 md:mt-12 border-2 border-foreground bg-ink text-paper p-6 md:p-10 text-center space-y-4">
          <h2 className="font-sans font-bold uppercase leading-[0.95] tracking-[-0.03em] text-2xl md:text-3xl">
            {t("compare.cta.title")}
          </h2>
          <p className="opacity-80">{t("compare.cta.subtitle")}</p>
          <Button asChild variant="accent" size="lg">
            <Link to="/">
              {t("compare.cta.button")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
