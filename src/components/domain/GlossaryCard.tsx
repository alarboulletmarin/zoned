// src/components/domain/GlossaryCard.tsx
// Card component displaying a glossary term in the list

import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ZoneBadge } from "./ZoneBadge";
import { cn } from "@/lib/utils";
import type { GlossaryTerm } from "@/data/glossary/types";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

interface GlossaryCardProps {
  term: GlossaryTerm;
  className?: string;
}

/**
 * Card component displaying a glossary term
 * Memoized to prevent unnecessary re-renders during scroll
 */
export const GlossaryCard = memo(function GlossaryCard({
  term,
  className,
}: GlossaryCardProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") ?? false;

  // Get localized content
  const displayTerm = isEn && term.termEn ? term.termEn : term.term;
  const shortDef = isEn && term.shortDefinitionEn ? term.shortDefinitionEn : term.shortDefinition;

  return (
    <Link
      to={`/glossary/${term.id}`}
      className={cn("zn-ecard", className)}
      data-size="compact"
    >
      <div
        className="zn-row zn-row--start"
        style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
      >
        <span className="zn-fill">
          {term.acronym && (
            <span className="zn-ecard__acronym">{term.acronym} </span>
          )}
          <span className="zn-ecard__title">{displayTerm}</span>
        </span>
        {term.zone && <ZoneBadge zone={term.zone} size="sm" />}
      </div>

      <p className="zn-ecard__desc">
        <GlossaryLinkedText text={shortDef} />
      </p>
    </Link>
  );
});

export default GlossaryCard;
