import { useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { ArticleCard } from "@/components/domain/ArticleCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { useArticles } from "@/hooks/useArticles";
import type { ArticleCategory } from "@/data/articles/types";

/** "all" is a view of the index, not a category. */
type CategoryFilter = ArticleCategory | "all";

const CATEGORIES: CategoryFilter[] = [
  "all",
  "fundamentals",
  "training",
  "lifestyle",
];

export function LearnPage() {
  const { t } = useTranslation(["content", "common"]);
  const { articles } = useArticles();
  const [category, setCategory] = useState<CategoryFilter>("all");

  // The kicker states what the index holds, in numbers: how many pieces and
  // how long they take. Both come from the article metadata, never from prose.
  const minutes = useMemo(
    () => articles.reduce((total, article) => total + article.readTime, 0),
    [articles],
  );

  const shown = useMemo(
    () =>
      category === "all"
        ? articles
        : articles.filter((article) => article.category === category),
    [articles, category],
  );

  const options: SegmentedOption<CategoryFilter>[] = CATEGORIES.map(
    (value) => ({
      value,
      label:
        value === "all"
          ? t("content:learn.allCategories")
          : t(`content:learn.categories.${value}`),
    }),
  );

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
              {
                "@type": "ListItem",
                position: 1,
                name: t("content:article.home"),
                item: "https://zoned.run/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: t("content:learn.title"),
              },
            ],
          },
        ]}
      />

      <div className="zn-learn">
        {/* 1, what this door holds, counted, then named */}
        <section
          className="zn-stack zn-learn__head"
          style={{ "--gap": "var(--sp-8)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("content:learn.catalogue", {
              count: articles.length,
              minutes,
            })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("common:nav.understand")}
          </h1>
          <p className="zn-body zn-body--lead zn-learn__lede">
            {t("content:learn.lede")}
          </p>
        </section>

        {/* 2, the category filter, on the rule, with what it left on screen */}
        <div
          className="zn-cluster zn-learn__strip"
          style={{ "--gap": "var(--sp-8)" } as CSSProperties}
        >
          <Segmented
            value={category}
            onChange={setCategory}
            options={options}
            label={t("content:learn.categoriesLabel")}
          />
          <span className="zn-mono zn-push zn-learn__count">
            {t("content:learn.articleCount", { count: shown.length })}
          </span>
        </div>

        {/* 3, the index. The lead article takes two columns. */}
        {shown.length > 0 ? (
          <div className="zn-grid zn-learn__grid">
            {shown.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                className={
                  index === 0 && category === "all"
                    ? "zn-learn__feature"
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="zn-learn__empty">
            <EmptyState
              variant="no-results"
              icon={BookOpen}
              title={t("content:learn.empty")}
              description={t("content:learn.emptyDescription", {
                total: articles.length,
              })}
              action={
                <Button variant="outline" onClick={() => setCategory("all")}>
                  {t("content:learn.showAll", { total: articles.length })}
                </Button>
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
