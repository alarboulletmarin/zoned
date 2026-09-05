// src/pages/GlossaryTermPage.tsx
// Detail page for a single glossary term

import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Book, Search, ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo";
import { GlossaryDetail } from "@/components/domain/GlossaryDetail";
import { useGlossaryTerm } from "@/hooks/useGlossary";
import { RelatedContent } from "@/components/domain/RelatedContent";

export function GlossaryTermPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();

  // Detect if user came from within the app (has history to go back to)
  const canGoBack = window.history.length > 1;

  const { term, isLoading } = useGlossaryTerm(id);

  // Loading state
  if (isLoading) {
    return (
      <div className="zn-ref__head">
        <Spinner size={22} label={t("status.loading", { ns: "common" })} />
      </div>
    );
  }

  if (!term) {
    return (
      <div className="zn-ref__head zn-ref__column">
        <EmptyState
          variant="no-results"
          icon={Search}
          title={t("termNotFound")}
          description={t("termNotFoundDescription")}
          action={
            <Button variant="outline" asChild>
              <Link to="/glossary">{t("backToGlossary")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const termName = term.acronym || (isEn && term.termEn ? term.termEn : term.term);
  const termDefinition = isEn && term.shortDefinitionEn ? term.shortDefinitionEn : term.shortDefinition;
  const truncatedDefinition = termDefinition.length > 155 ? termDefinition.slice(0, 152) + "..." : termDefinition;

  return (
    <>
      <SEOHead
        title={termName}
        description={truncatedDefinition}
        canonical={`/glossary/${id}`}
        jsonLd={[
          {
            "@type": "DefinedTerm",
            name: termName,
            description: isEn && term.fullDefinitionEn ? term.fullDefinitionEn : term.fullDefinition,
            url: `https://zoned.run/glossary/${id}`,
            ...(term.acronym && { termCode: term.acronym }),
            inDefinedTermSet: {
              "@type": "DefinedTermSet",
              name: t("seoDefinedTermSetName"),
              url: "https://zoned.run/glossary",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav.home", { ns: "common" }), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("title"), item: "https://zoned.run/glossary" },
              { "@type": "ListItem", position: 3, name: termName },
            ],
          },
        ]}
      />
      <div className="zn-ref">
        {/* 1 — the way out. GlossaryDetail prints the term's own title, so
            this band carries nothing else. */}
        <div className="zn-ref__head zn-cluster">
          {canGoBack && (
            <button
              type="button"
              className="zn-ref__back"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft />
              {t("back")}
            </button>
          )}
          <Link to="/glossary" className="zn-ref__back">
            <Book />
            {t("backToGlossary")}
          </Link>
        </div>

        {/* 2 — the term itself, in a reading column */}
        <div className="zn-ref__column">
          <GlossaryDetail term={term} />
        </div>

        {/* 3 — where to go next, on its own rule */}
        <section className="zn-ref__section">
          <div className="zn-ref__column">
            <RelatedContent source={{ type: "glossary", id: term.id }} />
          </div>
        </section>
      </div>
    </>
  );
}

export default GlossaryTermPage;
