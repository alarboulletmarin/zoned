import { Link } from "react-router-dom";
import { Clock, BookOpen, Heart, Dumbbell } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { InteractiveCard } from "@/components/editorial";
import { cn } from "@/lib/utils";
import type { ArticleMeta, ArticleCategory } from "@/data/articles";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { usePickLang } from "@/lib/i18n-utils";

const CATEGORY_ICONS: Record<ArticleCategory, React.ComponentType<{ className?: string }>> = {
  fundamentals: BookOpen,
  training: Dumbbell,
  lifestyle: Heart,
};

interface ArticleCardProps {
  article: ArticleMeta;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const pick = usePickLang();
  const CategoryIcon = CATEGORY_ICONS[article.category];

  return (
    <Link to={`/learn/${article.slug}`} className="block h-full">
      <InteractiveCard
        className={cn(
          "rounded-none border-2 border-foreground bg-card h-full p-4 sm:p-6",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        <div className="flex flex-col items-center text-center gap-3 sm:gap-4 h-full">
          <div className="size-10 sm:size-14 rounded-none flex items-center justify-center shrink-0 bg-secondary">
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
      </InteractiveCard>
    </Link>
  );
}
