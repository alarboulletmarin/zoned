import { Link } from "react-router-dom";
import { Clock, BookOpen, Heart, Dumbbell } from "@/components/icons";
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

const CATEGORY_GRADIENT: Record<ArticleCategory, string> = {
  fundamentals: "from-blue-500/10 dark:from-blue-500/20",
  training: "from-orange-500/10 dark:from-orange-500/20",
  lifestyle: "from-green-500/10 dark:from-green-500/20",
};

interface ArticleCardProps {
  article: ArticleMeta;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const pick = usePickLang();
  const CategoryIcon = CATEGORY_ICONS[article.category];

  return (
    <Link to={`/learn/${article.slug}`} className="group block h-full">
      <div
        className={cn(
          "rounded-lg sm:rounded-xl border border-border/50 h-full p-4 sm:p-6",
          "bg-gradient-to-br to-transparent",
          CATEGORY_GRADIENT[article.category],
          "hover:shadow-sm hover:-translate-y-0.5 hover:border-foreground/40 active:translate-y-0 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        <div className="flex flex-col items-center text-center gap-3 sm:gap-4 h-full">
          <div className="size-10 sm:size-14 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
            <CategoryIcon className="size-5 sm:size-7" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-sm sm:text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
              {pick(article, "title")}
            </h3>
            <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2">
              <GlossaryLinkedText text={pick(article, "description")} />
            </p>
          </div>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-1.5">
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="size-3" />
              {article.readTime} min
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
