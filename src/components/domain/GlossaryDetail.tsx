// src/components/domain/GlossaryDetail.tsx
// Full detail view for a glossary term

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink as ExternalLinkIcon, Link2 } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoneBadge } from "./ZoneBadge";
import { cn } from "@/lib/utils";
import type { GlossaryTerm } from "@/data/glossary/types";
import { useGlossaryCategoryInfo, useRelatedTerms } from "@/hooks/useGlossary";

interface GlossaryDetailProps {
  term: GlossaryTerm;
  className?: string;
}

export function GlossaryDetail({ term, className }: GlossaryDetailProps) {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language === "en";
  const category = useGlossaryCategoryInfo(term.category);
  const { terms: relatedTerms } = useRelatedTerms(term.id);

  // Get localized content
  const displayTerm = isEn && term.termEn ? term.termEn : term.term;
  const fullDef = isEn && term.fullDefinitionEn ? term.fullDefinitionEn : term.fullDefinition;
  const example = isEn && term.exampleEn ? term.exampleEn : term.example;
  const categoryLabel = isEn && category?.labelEn ? category.labelEn : category?.label;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{categoryLabel}</Badge>
          {term.zone && <ZoneBadge zone={term.zone} size="md" showLabel />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {term.acronym && <span className="text-primary">{term.acronym}</span>}
          {term.acronym && " — "}
          {displayTerm}
        </h1>
      </div>

      {/* Definition */}
      <div>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {fullDef}
        </p>
      </div>

      {/* Formula */}
      {term.formula && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {t("formula")}
          </p>
          <code className="text-sm font-mono bg-background px-2 py-1 rounded">
            {term.formula}
          </code>
        </div>
      )}

      {/* Example */}
      {example && (
        <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {t("example")}
          </p>
          <p className="text-sm">{example}</p>
        </div>
      )}

      {/* Related Terms */}
      {relatedTerms.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            {t("relatedTerms")}
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedTerms.map((related) => (
              <Button
                key={related.id}
                variant="outline"
                size="sm"
                asChild
                className="h-8"
              >
                <Link to={`/glossary/${related.id}`}>
                  <Link2 className="h-3 w-3 mr-1.5" />
                  {related.acronym ?? (isEn && related.termEn ? related.termEn : related.term)}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* External Links */}
      {term.externalLinks && term.externalLinks.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            {t("learnMore")}
          </p>
          <div className="space-y-2">
            {term.externalLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{link.label}</span>
                {link.author && (
                  <span className="text-muted-foreground">({link.author})</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GlossaryDetail;
