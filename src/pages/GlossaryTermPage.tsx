// src/pages/GlossaryTermPage.tsx
// Detail page for a single glossary term

import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Book, Search, Loader2, ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
      <div className="py-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="py-8">
        <EmptyState
          icon={Search}
          title={t("termNotFound")}
          description={t("termNotFoundDescription")}
          action={
            <Button variant="link" asChild>
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
      <div className="py-8">
        {/* Back navigation */}
      <div className="mb-6 flex items-center gap-2">
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
        )}
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to="/glossary">
            <Book className="h-4 w-4 mr-1" />
            {t("backToGlossary")}
          </Link>
        </Button>
      </div>

      {/* Term Detail */}
      <div className="max-w-3xl">
        <GlossaryDetail term={term} />
      </div>

      {/* Related Content */}
      <div className="max-w-3xl mt-8">
        <RelatedContent source={{ type: "glossary", id: term.id }} />
      </div>
    </div>
    </>
  );
}

export default GlossaryTermPage;
