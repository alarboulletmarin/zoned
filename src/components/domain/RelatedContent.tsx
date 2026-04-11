// src/components/domain/RelatedContent.tsx
// Shared component showing related workouts, articles, and glossary terms.

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Dumbbell, Book, Clock } from "@/components/icons";
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
}

function ArticleCardCompact({ article }: { article: ArticleMeta }) {
  const pick = usePickLang();

  return (
    <Link
      to={`/learn/${article.slug}`}
      className="group flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
    >
      <BookOpen className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
          {pick(article, "title")}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            <Clock className="size-3 inline mr-1" />
            {article.readTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}

function GlossaryChip({ term }: { term: GlossaryTerm }) {
  const isEn = useIsEnglish();
  const label = term.acronym || (isEn && term.termEn ? term.termEn : term.term);

  return (
    <Link to={`/glossary/${term.id}`}>
      <Badge
        variant="outline"
        className="hover:bg-accent transition-colors cursor-pointer"
      >
        {label}
      </Badge>
    </Link>
  );
}

export function RelatedContent({ source, className }: RelatedContentProps) {
  const { t } = useTranslation("common");
  const { workouts, articles, glossaryTerms, isLoading } = useRelatedContent(source);

  if (isLoading) return null;

  const hasContent = workouts.length > 0 || articles.length > 0 || glossaryTerms.length > 0;
  if (!hasContent) return null;

  return (
    <Card className={cn("rounded-xl", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {t("relatedContent.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Articles */}
        {articles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              {t("relatedContent.articles")}
            </h4>
            <div className="space-y-2">
              {articles.map((article) => (
                <ArticleCardCompact key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Workouts */}
        {workouts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Dumbbell className="size-3.5" />
              {t("relatedContent.workouts")}
            </h4>
            <div className="space-y-2">
              {workouts.map((workout) => (
                <WorkoutCardCompact key={workout.id} workout={workout} />
              ))}
            </div>
          </div>
        )}

        {/* Glossary */}
        {glossaryTerms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Book className="size-3.5" />
              {t("relatedContent.glossary")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {glossaryTerms.map((term) => (
                <GlossaryChip key={term.id} term={term} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
