import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { GithubIcon, StravaIcon, ExternalLink } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { StatBlock } from "@/components/domain/StatBlock";
import { useAppStats } from "@/hooks/useAppStats";

const GITHUB_URL = "https://github.com/alarboulletmarin/zoned";
const STRAVA_URL = "https://www.strava.com/athletes/115001213";
const KOFI_URL = "https://ko-fi.com/T6T01WC5ZC";

export function AboutPage() {
  const { t } = useTranslation(["common", "content"]);
  const stats = useAppStats();

  // Every number on this page is read off the shipped data. Nothing here is
  // written by hand, which is what keeps the page from drifting.
  const cells: { key: string; value: number; label: string }[] = [
    { key: "workouts", value: stats.workouts, label: t("content:about.statsWorkouts") },
    { key: "calculators", value: stats.calculators, label: t("content:about.statsCalculators") },
    { key: "plans", value: stats.plans, label: t("content:aboutPage.statsPlans") },
    { key: "collections", value: stats.collections, label: t("content:aboutPage.statsCollections") },
    { key: "articles", value: stats.articles, label: t("content:aboutPage.statsArticles") },
    { key: "zones", value: stats.zones, label: t("content:aboutPage.statsZones") },
  ];

  const claims: { key: string; term: string; text: string }[] = [
    {
      key: "openSource",
      term: t("content:about.openSource.title"),
      text: t("content:about.openSource.contributions"),
    },
    {
      key: "vibeCoded",
      term: t("content:about.vibeCoded.title"),
      text: t("content:about.vibeCoded.claude"),
    },
    {
      key: "privacy",
      term: t("content:about.privacy.title"),
      text: t("content:about.privacy.noServer"),
    },
    {
      key: "credits",
      term: t("content:about.credits.title"),
      text: `${t("content:about.credits.framework")} · ${t("content:about.credits.ui")}`,
    },
  ];

  return (
    <>
      <SEOHead
        title={t("content:about.seoHeroLabel")}
        description={t("pages.about.seoDescription")}
        canonical="/about"
        jsonLd={[
          {
            "@type": "Organization",
            name: "Zoned",
            url: "https://zoned.run",
            description: t("pages.about.seoOrgDescription"),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("nav.about") },
            ],
          },
        ]}
      />

      <div className="zn-about">
        {/* 1 — what this is */}
        <section className="zn-section">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-10)" } as CSSProperties}
          >
            <span className="zn-kicker">{t("content:aboutPage.kicker")}</span>
            <h1 className="zn-display" data-level="2" style={{ maxInlineSize: "18ch" }}>
              {t("content:about.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-measure">
              {t("content:about.description")}
            </p>
          </div>
        </section>

        {/* 2 — the catalogue, counted */}
        <section
          className="zn-section zn-about__strip"
          aria-label={t("content:aboutPage.countsLabel")}
        >
          {cells.map((cell) => (
            <div key={cell.key} className="zn-about__cell">
              <StatBlock
                value={cell.value > 0 ? String(cell.value) : "—"}
                label={cell.label}
              />
            </div>
          ))}
        </section>

        {/* 3 — the person behind it, and where the code lives */}
        <section
          className="zn-section zn-split"
          style={{ "--split": "1fr 320px", "--gap": "var(--sp-17)" } as CSSProperties}
          aria-labelledby="about-project-title"
        >
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-8)" } as CSSProperties}
          >
            <h2 id="about-project-title" className="zn-title" data-level="3">
              {t("content:about.personal.title")}
            </h2>
            <p className="zn-body zn-measure">{t("content:about.personal.bio")}</p>
          </div>

          <div
            className="zn-cluster"
            style={{ "--gap": "var(--sp-5)" } as CSSProperties}
          >
            <Button variant="outline" size="sm" asChild>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <GithubIcon />
                GitHub
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={STRAVA_URL} target="_blank" rel="noopener noreferrer">
                <StravaIcon />
                Strava
              </a>
            </Button>
          </div>
        </section>

        {/* 4 — the four claims, each with its one line */}
        <section className="zn-section" aria-labelledby="about-claims-title">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
          >
            <h2 id="about-claims-title" className="zn-title" data-level="3">
              {t("content:aboutPage.claimsTitle")}
            </h2>
            <dl className="zn-about__claims">
              {claims.map((claim) => (
                <div key={claim.key} className="zn-about__claim">
                  <dt className="zn-label">{claim.term}</dt>
                  <dd className="zn-body zn-body--sm zn-muted">{claim.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 5 — the one call: pay for it if it serves you */}
        <section className="zn-section" aria-labelledby="about-support-title">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-10)" } as CSSProperties}
          >
            <h2 id="about-support-title" className="zn-title" data-level="3">
              {t("donate.title")}
            </h2>
            <p className="zn-body zn-measure">{t("donate.description")}</p>
            <div>
              <Button asChild>
                <a href={KOFI_URL} target="_blank" rel="noopener noreferrer">
                  {t("donate.button")}
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
