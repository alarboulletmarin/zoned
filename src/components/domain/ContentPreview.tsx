// src/components/domain/ContentPreview.tsx
// Compact preview card for glossary terms or articles, used inside Popover (desktop) and Sheet (mobile)

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { Clock, BookOpen, X } from "@/components/icons";
import type { GlossaryTerm } from "@/data/glossary/types";
import type { ArticleMeta } from "@/data/articles/types";
import { usePickLang } from "@/lib/i18n-utils";

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
// Close button (top-right corner)
// ---------------------------------------------------------------------------

function CloseButton({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation("common");
  if (!onClose) return null;
  return (
    <button
      onClick={onClose}
      className="zn-preview__close"
      aria-label={t("actions.close")}
    >
      <X size={14} />
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
  const { t } = useTranslation("glossary");
  const pickLang = usePickLang();

  const displayTerm = pickLang(term, "term");
  const shortDef = pickLang(term, "shortDefinition");

  return (
    <div className="zn-preview">
      <CloseButton onClose={onClose} />
      {/* Header: term name + acronym */}
      <div className="zn-row" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
        <span className="zn-preview__title">
          {displayTerm}
          {term.acronym && (
            <span className="zn-preview__aside"> ({term.acronym})</span>
          )}
        </span>
        {term.zone && <ZoneBadge zone={term.zone} size="sm" />}
      </div>

      {/* Short definition */}
      <p className="zn-preview__text">{shortDef}</p>

      {/* Link to full definition */}
      <Link
        to={`/glossary/${term.id}`}
        onClick={onNavigate}
        className="zn-clink"
        data-size="sm"
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
  const { t } = useTranslation(["glossary", "common"]);
  const pickLang = usePickLang();

  const title = pickLang(article, "title");
  const description = pickLang(article, "description");
  const categoryLabel = t(`content:learn.categories.${article.category}`);

  return (
    <div className="zn-preview">
      <CloseButton onClose={onClose} />
      {/* Title */}
      <span className="zn-preview__title">{title}</span>

      {/* Category + read time */}
      <div
        className="zn-row zn-kicker zn-kicker--inline"
        style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}
      >
        <BookOpen size={12} />
        <span>{categoryLabel}</span>
        <Clock size={12} />
        <span>
          {article.readTime} {t("common:units.minutes")}
        </span>
      </div>

      {/* Description */}
      <p className="zn-preview__text" style={{ "--lines": 2 } as React.CSSProperties}>
        {description}
      </p>

      {/* Link to article */}
      <Link
        to={`/learn/${article.slug}`}
        onClick={onNavigate}
        className="zn-clink"
        data-size="sm"
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
