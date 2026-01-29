import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, BookOpen, Heart, Dumbbell } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ArticleMeta, ArticleCategory } from "@/data/articles";

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

interface ArticleCardProps {
  article: ArticleMeta;
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language === "en";
  const CategoryIcon = CATEGORY_ICONS[article.category];

  return (
    <Link to={`/learn/${article.slug}`}>
      <Card
        interactive
        className={cn("h-full", className)}
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
            {isEn ? article.titleEn : article.title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {isEn ? article.descriptionEn : article.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
