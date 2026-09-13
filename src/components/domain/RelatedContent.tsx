// src/components/domain/RelatedContent.tsx
// Shared component showing related workouts, articles, and glossary terms.

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Dumbbell, Book } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkoutCardCompact } from "@/components/domain/WorkoutCard";
import { useRelatedContent } from "@/hooks/useRelatedContent";
import type { ContentRef } from "@/lib/content-relationships";
import type { ArticleMeta } from "@/data/articles/types";
import type { GlossaryTerm } from "@/data/glossary/types";
import { cn } from "@/lib/utils";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";

interface RelatedContentProps {
  source: ContentRef;
  className?: string;
  /** Set false when an enclosing Section already provides the heading. */
  showTitle?: boolean;
}

function ArticleCardCompact({ article }: { article: ArticleMeta }) {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  return (
    <Link to={`/learn/${article.slug}`} className="zn-related__row">
      <BookOpen className="zn-related__icon" />
      <div className="zn-fill">
        <p className="zn-related__name">{pick(article, "title")}</p>
        <span className="zn-kicker">
          {article.readTime} {t("units.minutes")}
        </span>
      </div>
    </Link>
  );
}

function GlossaryChip({ term }: { term: GlossaryTerm }) {
  const isEn = useIsEnglish();
  const label = term.acronym || (isEn && term.termEn ? term.termEn : term.term);

  return (
    <Link to={`/glossary/${term.id}`}>
      <Badge variant="outline">{label}</Badge>
    </Link>
  );
}

export function RelatedContent({ source, className, showTitle = true }: RelatedContentProps) {
  const { t } = useTranslation("common");
  const { workouts, articles, glossaryTerms, isLoading } = useRelatedContent(source);

  if (isLoading) return null;

  const hasContent = workouts.length > 0 || articles.length > 0 || glossaryTerms.length > 0;
  if (!hasContent) return null;

  function renderGroups() {
    return (
      <>
        {/* Articles */}
        {articles.length > 0 && (
          <div className="zn-stack">
            <h3 className="zn-row zn-kicker" style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}>
              <BookOpen className="zn-related__icon" />
              {t("relatedContent.articles")}
            </h3>
            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
              {articles.map((article) => (
                <ArticleCardCompact key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Workouts */}
        {workouts.length > 0 && (
          <div className="zn-stack">
            <h3 className="zn-row zn-kicker" style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}>
              <Dumbbell className="zn-related__icon" />
              {t("relatedContent.workouts")}
            </h3>
            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
              {workouts.map((workout) => (
                <WorkoutCardCompact key={workout.id} workout={workout} />
              ))}
            </div>
          </div>
        )}

        {/* Glossary */}
        {glossaryTerms.length > 0 && (
          <div className="zn-stack">
            <h3 className="zn-row zn-kicker" style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}>
              <Book className="zn-related__icon" />
              {t("relatedContent.glossary")}
            </h3>
            <div className="zn-cluster">
              {glossaryTerms.map((term) => (
                <GlossaryChip key={term.id} term={term} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Inside a titled Section the card and its heading are pure repetition, so
  // the caller turns them off and the groups render bare.
  if (!showTitle) {
    return (
      <div
        className={cn("zn-stack", className)}
        style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
      >
        {renderGroups()}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("relatedContent.title")}</CardTitle>
      </CardHeader>
      <CardContent
        className="zn-stack"
        style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
      >
        {renderGroups()}
      </CardContent>
    </Card>
  );
}
