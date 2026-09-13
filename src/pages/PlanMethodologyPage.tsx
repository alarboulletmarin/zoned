import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { Section } from "@/components/editorial/Section";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { PLAN_PRINCIPLES } from "@/data/plan-methodology";

// ---------------------------------------------------------------------------
// Scientific references for the bottom section
// ---------------------------------------------------------------------------

interface Reference {
  author: string;
  year: number;
  title: string;
  journal?: string;
  link?: string;
}

const SCIENTIFIC_REFERENCES: Reference[] = [
  {
    author: "Daniels, J.",
    year: 2014,
    title: "Daniels' Running Formula",
    journal: "Human Kinetics, 3rd ed.",
  },
  {
    author: "Pfitzinger, P. & Douglas, S.",
    year: 2009,
    title: "Advanced Marathoning",
    journal: "Human Kinetics, 2nd ed.",
  },
  {
    author: "Mujika, I. & Padilla, S.",
    year: 2003,
    title: "Scientific bases for precompetition tapering strategies",
    journal: "Med Sci Sports Exerc 35(7):1182-1187",
    link: "https://pubmed.ncbi.nlm.nih.gov/12840639/",
  },
  {
    author: "Seiler, S.",
    year: 2010,
    title: "What is best practice for training intensity and duration distribution in endurance athletes?",
    journal: "Int J Sports Physiol Perform 5(3):276-291",
    link: "https://pubmed.ncbi.nlm.nih.gov/20861519/",
  },
  {
    author: "Gabbett, T.",
    year: 2016,
    title: "The training-injury prevention paradox: should athletes be training smarter and harder?",
    journal: "Br J Sports Med 50(5):273-280",
    link: "https://pubmed.ncbi.nlm.nih.gov/26758673/",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlanMethodologyPage() {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  return (
    <>
      <SEOHead
        title={t("content:planMethodology.title")}
        description={t("content:planMethodology.seoDescription")}
        canonical="/plans/methodology"
        jsonLd={{
          "@type": "WebPage",
          name: t("content:planMethodology.title"),
          url: "https://zoned.run/plans/methodology",
          description: t("content:planMethodology.seoDescription"),
        }}
      />

      <div className="zn-guide">
        {/* 1, what the generator does, in one sentence */}
        <section
          className="zn-stack zn-guide__head"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("content:planMethodology.kicker", {
              n: PLAN_PRINCIPLES.length,
            })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("content:planMethodology.heading")}
          </h1>
          <p className="zn-body zn-body--lead zn-guide__lede">
            {t("content:planMethodology.intro")}
          </p>
        </section>

        {/* 2, how the pieces fit, as prose, with the caveat pulled out */}
        <section className="zn-guide__band">
          <div className="zn-prose zn-measure">
            <GlossaryLinkedText
              as="p"
              className="zn-prose__p"
              text={t("content:planMethodology.introText")}
            />
            <aside className="zn-prose__callout" data-kind="key">
              <span className="zn-kicker zn-prose__callout-label">
                {t("content:article.callout.key")}
              </span>
              <GlossaryLinkedText
                as="p"
                className="zn-prose__callout-text"
                text={t("content:planMethodology.introDisclaimer")}
              />
            </aside>
          </div>
        </section>

        {/* 3, the seven principles, each a disclosure on its own rule. It was
            a div with an onClick and no aria-expanded; <details> gives the
            keyboard path and the state for nothing. */}
        <section className="zn-guide__band">
          {PLAN_PRINCIPLES.map((principle) => (
            <Section
              key={principle.id}
              id={principle.id}
              collapsible
              as="h3"
              title={pick(principle, "title")}
              description={
                <GlossaryLinkedText text={pick(principle, "summary")} />
              }
            >
              <div
                className="zn-stack zn-measure"
                style={{ "--gap": "var(--sp-11)" } as CSSProperties}
              >
                <GlossaryLinkedText
                  as="p"
                  className="zn-body zn-body--sm zn-muted"
                  text={pick(principle, "details")}
                />

                <ul className="zn-prose__list">
                  {principle.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="zn-body zn-body--sm zn-muted">
                      {pick(rule, "text")}
                    </li>
                  ))}
                </ul>

                {principle.references && principle.references.length > 0 && (
                  <div
                    className="zn-stack"
                    style={{ "--gap": "var(--sp-3)" } as CSSProperties}
                  >
                    <span className="zn-kicker">
                      {t("content:planMethodology.sources")}
                    </span>
                    <ul
                      className="zn-stack"
                      style={
                        {
                          "--gap": "var(--sp-1)",
                          listStyle: "none",
                          margin: 0,
                          padding: 0,
                        } as CSSProperties
                      }
                    >
                      {principle.references.map((ref, refIndex) => (
                        <li key={refIndex} className="zn-source">
                          {ref.author} ({ref.year}). {ref.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {principle.relatedArticle && (
                  <Link
                    to={`/learn/${principle.relatedArticle}`}
                    className="zn-prose__link zn-guide__extlink"
                  >
                    {t("content:planMethodology.learnMore")}
                    <ArrowRight />
                  </Link>
                )}
              </div>
            </Section>
          ))}
        </section>

        {/* 4, the papers the seven principles are built on */}
        <section className="zn-guide__band" aria-labelledby="plan-meth-refs">
          <h2
            id="plan-meth-refs"
            className="zn-title zn-guide__bandhead"
            data-level="2"
          >
            {t("content:planMethodology.scientificReferences")}
          </h2>

          <ul
            className="zn-stack"
            style={
              {
                "--gap": "var(--sp-6)",
                listStyle: "none",
                margin: 0,
                padding: 0,
              } as CSSProperties
            }
          >
            {SCIENTIFIC_REFERENCES.map((ref, i) => (
              <li key={i} className="zn-guide__ref">
                <span className="zn-mono zn-guide__refyear">{ref.year}</span>
                <div
                  className="zn-stack zn-fill"
                  style={{ "--gap": "var(--sp-3)" } as CSSProperties}
                >
                  <p className="zn-guide__reftitle">{ref.title}</p>
                  <p className="zn-source">
                    {ref.author}
                    {ref.journal && <> &middot; {ref.journal}</>}
                  </p>
                  {ref.link && (
                    <a
                      href={ref.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="zn-prose__link zn-guide__extlink"
                    >
                      {t("content:planMethodology.viewStudy")}
                      <ArrowRight />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
