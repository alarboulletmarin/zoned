// src/pages/GlossaryTermPage.tsx
// Detail page for a single glossary term

import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Book, Search, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SEOHead } from "@/components/seo";
import { GlossaryDetail } from "@/components/domain/GlossaryDetail";
import { useGlossaryTerm } from "@/hooks/useGlossary";

export function GlossaryTermPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;

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
              name: isEn ? "Zoned Running Glossary" : "Glossaire Zoned Running",
              url: "https://zoned.run/glossary",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: isEn ? "Glossary" : "Glossaire", item: "https://zoned.run/glossary" },
              { "@type": "ListItem", position: 3, name: termName },
            ],
          },
        ]}
      />
      <div className="py-8">
        {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2">
          <Link to="/glossary">
            <ChevronLeft className="h-4 w-4" />
            <Book className="h-4 w-4 mr-1" />
            {t("backToGlossary")}
          </Link>
        </Button>
      </div>

      {/* Term Detail */}
      <div className="max-w-3xl">
        <GlossaryDetail term={term} />
      </div>
    </div>
    </>
  );
}

export default GlossaryTermPage;
