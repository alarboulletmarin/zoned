// src/components/domain/ContentPreview.tsx
// Compact preview card for glossary terms or articles, used inside Popover (desktop) and Sheet (mobile)

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { Clock, BookOpen, X } from "@/components/icons";
import type { GlossaryTerm } from "@/data/glossary/types";
import type { ArticleMeta } from "@/data/articles/types";

type ContentPreviewProps =
  | { type: "glossary"; data: GlossaryTerm; onNavigate?: () => void; onClose?: () => void }
  | { type: "article"; data: ArticleMeta; onNavigate?: () => void; onClose?: () => void };

export function ContentPreview(props: ContentPreviewProps) {
  if (props.type === "glossary") {
    return <GlossaryPreview term={props.data} onNavigate={props.onNavigate} onClose={props.onClose} />;
  }
  return <ArticlePreview article={props.data} onNavigate={props.onNavigate} onClose={props.onClose} />;
}

// ---------------------------------------------------------------------------
// Glossary preview (same as former GlossaryTermPreview)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Close button (top-right corner)
// ---------------------------------------------------------------------------

function CloseButton({ onClose }: { onClose?: () => void }) {
  if (!onClose) return null;
  return (
    <button
      onClick={onClose}
      className="absolute -top-1 -right-1 rounded-full p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Close"
    >
      <X className="size-3" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Glossary preview
// ---------------------------------------------------------------------------

interface GlossaryPreviewProps {
  term: GlossaryTerm;
  onNavigate?: () => void;
  onClose?: () => void;
}

function GlossaryPreview({ term, onNavigate, onClose }: GlossaryPreviewProps) {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const displayTerm = isEn && term.termEn ? term.termEn : term.term;
  const shortDef =
    isEn && term.shortDefinitionEn
      ? term.shortDefinitionEn
      : term.shortDefinition;

  return (
    <div className="relative space-y-1.5 pr-5">
      <CloseButton onClose={onClose} />
      {/* Header: term name + acronym */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">
          {displayTerm}
          {term.acronym && (
            <span className="text-muted-foreground font-normal">
              {" "}
              ({term.acronym})
            </span>
          )}
        </span>
        {term.zone && <ZoneBadge zone={term.zone} size="sm" />}
      </div>

      {/* Short definition */}
      <p className="text-xs text-muted-foreground line-clamp-3">{shortDef}</p>

      {/* Link to full definition */}
      <Link
        to={`/glossary/${term.id}`}
        onClick={onNavigate}
        className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
      >
        {t("seeFullDefinition")}
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Article preview
// ---------------------------------------------------------------------------

interface ArticlePreviewProps {
  article: ArticleMeta;
  onNavigate?: () => void;
  onClose?: () => void;
}

function ArticlePreview({ article, onNavigate, onClose }: ArticlePreviewProps) {
  const { t, i18n } = useTranslation(["glossary", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;

  const title = isEn ? article.titleEn : article.title;
  const description = isEn ? article.descriptionEn : article.description;
  const categoryLabel = t(`common:learn.categories.${article.category}`);

  return (
    <div className="relative space-y-1.5 pr-5">
      <CloseButton onClose={onClose} />
      {/* Title */}
      <span className="text-sm font-bold">{title}</span>

      {/* Category + read time */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="size-3" />
        <span>{categoryLabel}</span>
        <span aria-hidden="true">&middot;</span>
        <Clock className="size-3" />
        <span>
          {article.readTime} {t("common:units.minutes")}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2">
        {description}
      </p>

      {/* Link to article */}
      <Link
        to={`/learn/${article.slug}`}
        onClick={onNavigate}
        className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
      >
        {t("glossary:readArticle")}
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Backward-compatible re-export
// ---------------------------------------------------------------------------

/** @deprecated Use ContentPreview with type="glossary" instead */
export function GlossaryTermPreview({
  term,
  onNavigate,
}: {
  term: GlossaryTerm;
  onNavigate?: () => void;
}) {
  return <GlossaryPreview term={term} onNavigate={onNavigate} />;
}

export default ContentPreview;
