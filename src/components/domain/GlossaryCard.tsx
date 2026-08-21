// src/components/domain/GlossaryCard.tsx
// Row displaying a single glossary term in the alphabetical list.

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
 * Full-width row for a glossary term (name, category, definition, zone).
 * Memoized to prevent unnecessary re-renders during scroll.
 */
export const GlossaryCard = memo(function GlossaryCard({
  term,
  className,
}: GlossaryCardProps) {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;

  // Get localized content
  const displayTerm = isEn && term.termEn ? term.termEn : term.term;
  const shortDef = isEn && term.shortDefinitionEn ? term.shortDefinitionEn : term.shortDefinition;
  const categoryLabel = t(`categories.${term.category}`, { defaultValue: term.category });

  return (
    <Link
      to={`/glossary/${term.id}`}
      className={cn(
        "grid grid-cols-1 gap-1.5 border-t border-filet py-4 no-underline sm:grid-cols-[220px_1fr_100px] sm:items-start sm:gap-6",
        className,
      )}
    >
      <div>
        <div className="font-sans text-lg font-bold uppercase tracking-tight text-foreground">
          {term.acronym ?? displayTerm}
        </div>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
          {term.acronym ? displayTerm : categoryLabel}
          {term.acronym ? ` · ${categoryLabel}` : ""}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        <GlossaryLinkedText text={shortDef} />
      </p>
      {term.zone && (
        <div className="sm:justify-self-end">
          <ZoneBadge zone={term.zone} size="sm" />
        </div>
      )}
    </Link>
  );
});

export default GlossaryCard;
