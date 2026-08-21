// src/components/domain/GlossaryCard.tsx
// Row displaying a single glossary term in the alphabetical list.

import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatPace } from "@/lib/zones";
import type { GlossaryTerm } from "@/data/glossary/types";
import type { ZoneRange } from "@/types";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

interface GlossaryCardProps {
  term: GlossaryTerm;
  /** Reader's calibrated zone table (pace/HR), as returned by `calculateAllZones()`. Empty when uncalibrated. */
  userZones?: ZoneRange[];
  /** Full term lookup, used to resolve `relatedTerms[0]` into a display label. */
  termsById?: Map<string, GlossaryTerm>;
  className?: string;
}

/**
 * Full-width row for a glossary term (name, category, definition, and a
 * contextual link in the third column). The third column shows, in order
 * of priority:
 * - for a zone-linked term: the reader's own pace for that zone (when
 *   calibrated) plus a link into the library filtered to that zone;
 * - otherwise, a link to the term's first related term.
 * Memoized to prevent unnecessary re-renders during scroll.
 */
export const GlossaryCard = memo(function GlossaryCard({
  term,
  userZones = [],
  termsById,
  className,
}: GlossaryCardProps) {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();

  // Get localized content
  const displayTerm = isEn && term.termEn ? term.termEn : term.term;
  const shortDef = isEn && term.shortDefinitionEn ? term.shortDefinitionEn : term.shortDefinition;
  const categoryLabel = t(`categories.${term.category}`, { defaultValue: term.category });

  const zoneRange = term.zone ? userZones.find((z) => z.zone === term.zone) : undefined;
  const hasPace = zoneRange?.paceMinPerKm !== undefined && zoneRange?.paceMaxPerKm !== undefined;

  const relatedTerm = !term.zone
    ? termsById?.get(term.relatedTerms?.[0] ?? "")
    : undefined;
  const relatedTermLabel = relatedTerm
    ? (relatedTerm.acronym ?? (isEn && relatedTerm.termEn ? relatedTerm.termEn : relatedTerm.term))
    : undefined;

  const goToZoneLibrary = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/library?zone=${term.zone}`);
  };

  const goToRelatedTerm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (relatedTerm) navigate(`/glossary/${relatedTerm.id}`);
  };

  return (
    <Link
      to={`/glossary/${term.id}`}
      className={cn(
        "grid grid-cols-1 gap-1.5 border-t border-filet py-4 no-underline sm:grid-cols-[220px_1fr_160px] sm:items-start sm:gap-6",
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
      {term.zone ? (
        <div className="flex flex-col items-start gap-1.5 font-mono text-[11px] sm:items-end sm:text-right">
          {hasPace && (
            <span className="text-foreground">
              {t("yourPace", {
                range: `${formatPace(zoneRange!.paceMinPerKm!)}–${formatPace(zoneRange!.paceMaxPerKm!)}/km`,
              })}
            </span>
          )}
          <button type="button" onClick={goToZoneLibrary} className="text-primary hover:underline">
            {t("viewZoneSessions", { zone: term.zone })}
          </button>
        </div>
      ) : relatedTerm ? (
        <div className="flex flex-col items-start gap-1.5 font-mono text-[11px] sm:items-end sm:text-right">
          <span className="text-muted-foreground">{t("relatedTermLabel")}</span>
          <button type="button" onClick={goToRelatedTerm} className="text-primary hover:underline">
            {relatedTermLabel} &rarr;
          </button>
        </div>
      ) : null}
    </Link>
  );
});

export default GlossaryCard;
