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
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

interface GlossaryDetailProps {
  term: GlossaryTerm;
  className?: string;
}

const BLOCK_GAP = { "--gap": "var(--sp-6)" } as React.CSSProperties;

export function GlossaryDetail({ term, className }: GlossaryDetailProps) {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const category = useGlossaryCategoryInfo(term.category);
  const { terms: relatedTerms } = useRelatedTerms(term.id);

  // Get localized content
  const displayTerm = isEn && term.termEn ? term.termEn : term.term;
  const fullDef = isEn && term.fullDefinitionEn ? term.fullDefinitionEn : term.fullDefinition;
  const example = isEn && term.exampleEn ? term.exampleEn : term.example;
  const categoryLabel = isEn && category?.labelEn ? category.labelEn : category?.label;

  return (
    <div
      className={cn("zn-stack", className)}
      style={{ "--gap": "var(--sp-13)" } as React.CSSProperties}
    >
      {/* Header */}
      <div className="zn-stack" style={BLOCK_GAP}>
        <div className="zn-cluster">
          <Badge variant="outline">{categoryLabel}</Badge>
          {term.zone && <ZoneBadge zone={term.zone} size="md" showLabel />}
        </div>
        <h1 className="zn-title" data-level="1">
          {term.acronym && <span className="zn-accent">{term.acronym}</span>}
          {term.acronym && " · "}
          {displayTerm}
        </h1>
      </div>

      {/* Definition */}
      <p className="zn-body zn-body--lead">
        <GlossaryLinkedText text={fullDef} />
      </p>

      {/* Formula */}
      {term.formula && (
        <div className="zn-gterm__formula zn-stack" style={BLOCK_GAP}>
          <span className="zn-kicker zn-kicker--inline">{t("formula")}</span>
          <code className="zn-gterm__code">{term.formula}</code>
        </div>
      )}

      {/* Example */}
      {example && (
        <div className="zn-gterm__example zn-stack" style={BLOCK_GAP}>
          <span className="zn-kicker zn-kicker--inline">{t("example")}</span>
          <p className="zn-body zn-body--sm">
            <GlossaryLinkedText text={example} />
          </p>
        </div>
      )}

      {/* Related Terms */}
      {relatedTerms.length > 0 && (
        <div className="zn-stack" style={BLOCK_GAP}>
          <span className="zn-kicker">{t("relatedTerms")}</span>
          <div className="zn-cluster">
            {relatedTerms.map((related) => (
              <Button key={related.id} variant="outline" size="sm" asChild>
                <Link to={`/glossary/${related.id}`}>
                  <Link2 />
                  {related.acronym ?? (isEn && related.termEn ? related.termEn : related.term)}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* External Links */}
      {term.externalLinks && term.externalLinks.length > 0 && (
        <div className="zn-stack" style={BLOCK_GAP}>
          <span className="zn-kicker">{t("learnMore")}</span>
          <div className="zn-stack" style={{ "--gap": "var(--sp-2)" } as React.CSSProperties}>
            {term.externalLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="zn-gterm__link"
              >
                <ExternalLinkIcon />
                <span>{link.label}</span>
                {link.author && <span className="zn-faint">({link.author})</span>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GlossaryDetail;
