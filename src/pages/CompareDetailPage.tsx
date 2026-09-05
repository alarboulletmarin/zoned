import type { CSSProperties, ReactNode } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/ui/responsive-table";
import {
  getCompetitorBySlug,
  type ComparisonCriterion,
  type ComparisonValue,
} from "@/data/competitors";
import {
  CheckIcon,
  X,
  Shield,
  EyeOff,
  GithubIcon,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "@/components/icons";
import { usePickLang } from "@/lib/i18n-utils";

const SITE_URL = "https://zoned.run";

const HEAD_GAP = { "--gap": "var(--sp-6)" } as CSSProperties;

/**
 * One answer in the comparison grid.
 *
 * The four shapes used to be four hues — green, red, amber, plain — which read
 * as a verdict rather than as a value: "no account required" is a yes on our
 * column and a no on theirs, and colour cannot say that. Here the glyph and
 * the word carry the value, the ink weight carries nothing else, and a figure
 * (a price, a count) is set in mono so the two columns line up.
 */
function ComparisonBadge({
  value,
  t,
}: {
  value: ComparisonValue;
  t: (key: string) => string;
}) {
  const pickLang = usePickLang();
  switch (value.type) {
    case "yes":
      return (
        <span className="zn-ref__val" data-value="yes">
          <CheckIcon />
          {t("compare.values.yes")}
        </span>
      );
    case "no":
      return (
        <span className="zn-ref__val" data-value="no">
          <X />
          {t("compare.values.no")}
        </span>
      );
    case "partial":
      return (
        <span className="zn-ref__val" data-value="partial">
          {pickLang(value, "label")}
        </span>
      );
    case "text":
      return (
        <span className="zn-ref__val" data-value="text">
          {pickLang(value, "value")}
        </span>
      );
  }
}

/** The four reasons, each an outlined block with an ink glyph. */
const advantageCards: ReadonlyArray<{ key: string; icon: ReactNode }> = [
  { key: "free", icon: <Sparkles /> },
  { key: "noAccount", icon: <Shield /> },
  { key: "noData", icon: <EyeOff /> },
  { key: "openSource", icon: <GithubIcon /> },
];

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

  // The middle column is us, and it is inverted end to end — the answer to
  // "which one is Zoned" then survives greyscale with no colour spent on it.
  const columns: ResponsiveTableColumn<ComparisonCriterion>[] = [
    {
      key: "criterion",
      header: t("compare.tableHeader.criterion"),
      className: "zn-ref__crit",
      cell: (criterion) => pickLang(criterion, "label"),
      hideOnMobile: true,
    },
    {
      key: "zoned",
      header: t("compare.tableHeader.zoned"),
      className: "zn-ref__us",
      cell: (criterion) => <ComparisonBadge value={criterion.zoned} t={t} />,
    },
    {
      key: "competitor",
      header: name,
      cell: (criterion) => (
        <ComparisonBadge value={criterion.competitor} t={t} />
      ),
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

      <div className="zn-ref">
        {/* 1 — the way out, then what this page compares */}
        <section className="zn-ref__head zn-stack" style={HEAD_GAP}>
          <Link to="/compare" className="zn-ref__back">
            <ArrowLeft />
            {t("compare.backToCompare")}
          </Link>
          <span className="zn-kicker">{t("compare.subtitle")}</span>
          <h1 className="zn-display" data-level="2">
            {title}
          </h1>
          <p className="zn-body zn-body--lead zn-ref__lede">{tagline}</p>
          <div className="zn-cluster">
            {[t("comparePage.badgeFree"), t("comparePage.badgeNoAccount"), "Open Source"].map(
              (badge) => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ),
            )}
          </div>
        </section>

        {/* 2 — the grid, criterion by criterion */}
        <section className="zn-ref__section" aria-labelledby="compare-table">
          <div className="zn-row zn-row--split zn-ref__sectionhead">
            <h2 id="compare-table" className="zn-title" data-level="3">
              {t("comparePage.featureComparison")}
            </h2>
            <span className="zn-mono zn-faint">
              {t("compare.criteriaCount", { count: competitor.criteria.length })}
            </span>
          </div>
          <ResponsiveTable
            data={competitor.criteria}
            columns={columns}
            rowKey="key"
            caption={t("comparePage.featureComparison")}
            mobileCardTitle={(criterion) => pickLang(criterion, "label")}
          />
        </section>

        {/* 3 — the four reasons */}
        <section className="zn-ref__section" aria-labelledby="compare-advantages">
          <div className="zn-ref__sectionhead">
            <h2 id="compare-advantages" className="zn-title" data-level="3">
              {t("compare.advantages.title")}
            </h2>
          </div>
          <div className="zn-grid" style={{ "--cols": 4 } as CSSProperties}>
            {advantageCards.map((card) => (
              <div key={card.key} className="zn-ref__adv">
                <span className="zn-ref__adv-glyph" aria-hidden="true">
                  {card.icon}
                </span>
                <p className="zn-ref__adv-title">
                  {t(`compare.advantages.${card.key}.title`)}
                </p>
                <p className="zn-caption zn-muted">
                  {t(`compare.advantages.${card.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4 — the screen's one primary action */}
        <section className="zn-ref__section">
          <div className="zn-ref__cta">
            <h2 className="zn-title" data-level="3">
              {t("compare.cta.title")}
            </h2>
            <p className="zn-body zn-muted">{t("compare.cta.subtitle")}</p>
            <Button asChild size="lg">
              <Link to="/">
                {t("compare.cta.button")}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
