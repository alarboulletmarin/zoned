import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Dumbbell, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { ArticleCard } from "@/components/domain/ArticleCard";
import { articles, articleCategories, type Article } from "@/data/articles";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<Article["category"], React.ComponentType<{ className?: string }>> = {
  fundamentals: BookOpen,
  training: Dumbbell,
  lifestyle: Heart,
};

export function LearnPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language === "en";
  const [selectedCategory, setSelectedCategory] = useState<Article["category"] | "all">("all");

  const filteredArticles = selectedCategory === "all"
    ? articles
    : articles.filter((a) => a.category === selectedCategory);

  return (
    <>
      <SEOHead
        title={isEn ? "Learn" : "Apprendre"}
        description={isEn
          ? "Explore running guides, training fundamentals, and zone-based workout explanations."
          : "Explorez les guides de course, les fondamentaux de l'entrainement et les explications des seances par zones."}
        canonical="/learn"
      />
      <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("learn.title")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("learn.description")}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="size-4 text-muted-foreground" />
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          {t("learn.allCategories")}
        </Button>
        {articleCategories.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="gap-1"
            >
              <Icon className="size-3.5" />
              {t(`learn.categories.${category}`)}
            </Button>
          );
        })}
      </div>

      {/* Articles Grid */}
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {filteredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        {t("learn.articleCount", { count: filteredArticles.length })}
      </div>
    </div>
    </>
  );
}
