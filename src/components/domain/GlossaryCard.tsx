// src/components/domain/GlossaryCard.tsx
// Card component displaying a glossary term in the list

import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
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
    <Link to={`/glossary/${term.id}`}>
      <Card
        interactive
        size="compact"
        className={cn(
          "h-full bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent border-border/50",
          className,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {term.acronym && (
                  <span className="font-semibold text-primary">
                    {term.acronym}
                  </span>
                )}
                <span
                  className={cn(
                    "font-medium",
                    term.acronym && "text-muted-foreground text-sm"
                  )}
                >
                  {displayTerm}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                <GlossaryLinkedText text={shortDef} />
              </p>
            </div>
            {term.zone && <ZoneBadge zone={term.zone} size="sm" />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

export default GlossaryCard;
