import { useTranslation } from "react-i18next";
import { Loader2 } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { ArticleCard } from "@/components/domain/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import type { ArticleCategory } from "@/data/articles/types";
import { cn } from "@/lib/utils";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem } from "@/components/editorial";

const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "fundamentals",
  "training",
  "lifestyle",
];

export function LearnPage() {
  const { t } = useTranslation("common");

  const { articles, isLoading } = useArticles();

  return (
    <>
      <SEOHead
        title={t("content:learn.title")}
        description={t("content:learn.description")}
        canonical="/learn"
        jsonLd={[
          {
            "@type": "CollectionPage",
            name: t("content:learn.title"),
            description: t("content:learn.description"),
            url: "https://zoned.run/learn",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:learn.title") },
            ],
          },
        ]}
      />
      <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <EditorialTitle as="h1" className="mb-2">
          {t("content:learn.title")}
        </EditorialTitle>
        <FadeUp as="p" delay={0.1} className="text-muted-foreground text-lg">
          {t("content:learn.description")}
        </FadeUp>
      </div>

      {/* Articles — grouped by category. Each category reads as a small
          editorial section: mono caption + matching cards. On mobile cards
          collapse to icon + title; from sm+ they expand to the full card
          with description + read time. */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-10 sm:space-y-12">
            {ARTICLE_CATEGORIES.map((category) => {
              const categoryArticles = articles.filter((a) => a.category === category);
              if (categoryArticles.length === 0) return null;
              return (
                <section key={category} aria-labelledby={`learn-${category}`}>
                  <p
                    id={`learn-${category}`}
                    className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3 sm:mb-4 flex items-center gap-3"
                  >
                    <span className="inline-block h-px w-8 bg-border" />
                    {t(`content:learn.categories.${category}`)}
                  </p>
                  <StaggerGrid className={cn("grid gap-3 sm:gap-4", "grid-cols-2 lg:grid-cols-3")}>
                    {categoryArticles.map((article) => (
                      <StaggerItem key={article.id}>
                        <ArticleCard article={article} />
                      </StaggerItem>
                    ))}
                  </StaggerGrid>
                </section>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-10 sm:mt-12 text-center text-sm text-muted-foreground">
            {t("content:learn.articleCount", { count: articles.length })}
          </div>
        </>
      )}
    </div>
    </>
  );
}
