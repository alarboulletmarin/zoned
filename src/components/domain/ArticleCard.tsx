import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, BookOpen, Heart, Dumbbell } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ArticleMeta, ArticleCategory } from "@/data/articles";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { usePickLang } from "@/lib/i18n-utils";

const CATEGORY_ICONS: Record<ArticleCategory, React.ComponentType<{ className?: string }>> = {
  fundamentals: BookOpen,
  training: Dumbbell,
  lifestyle: Heart,
};

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  fundamentals: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  training: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  lifestyle: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const CATEGORY_GRADIENT: Record<ArticleCategory, string> = {
  fundamentals: "bg-gradient-to-br from-blue-500/10 dark:from-blue-500/20 to-transparent",
  training: "bg-gradient-to-br from-orange-500/10 dark:from-orange-500/20 to-transparent",
  lifestyle: "bg-gradient-to-br from-green-500/10 dark:from-green-500/20 to-transparent",
};

interface ArticleCardProps {
  article: ArticleMeta;
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const { t } = useTranslation("common");
  const pick = usePickLang();
  const CategoryIcon = CATEGORY_ICONS[article.category];

  return (
    <Link to={`/learn/${article.slug}`}>
      <Card
        interactive
        className={cn(
          "h-full border-border/50",
          CATEGORY_GRADIENT[article.category],
          className,
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", CATEGORY_COLORS[article.category])}
            >
              <CategoryIcon className="size-3 mr-1" />
              {t(`learn.categories.${article.category}`)}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{article.readTime} min</span>
            </div>
          </div>
          <CardTitle className="text-lg mt-2">
            {pick(article, "title")}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            <GlossaryLinkedText text={pick(article, "description")} />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
