// src/pages/GlossaryPage.tsx
// Full glossary page with search and category filtering

import { useDeferredValue, useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEOHead } from "@/components/seo";
import { GlossaryCard } from "@/components/domain/GlossaryCard";
import {
  useGlossary,
  useGlossaryCategories,
  useGlossaryCount,
} from "@/hooks/useGlossary";
import type { GlossaryCategory, GlossaryTerm } from "@/data/glossary/types";

const HEAD_GAP = { "--gap": "var(--sp-6)" } as CSSProperties;

export function GlossaryPage() {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchQuery, setSearchQuery] = useState("");
  // Defer the heavy filtering so typing stays at 60fps even on 50+ terms.
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<
    GlossaryCategory | "all"
  >("all");

  const { terms: allTerms, isLoading: termsLoading } = useGlossary();
  const { categories, isLoading: categoriesLoading } = useGlossaryCategories();
  const { count: totalCount } = useGlossaryCount();

  const isLoading = termsLoading || categoriesLoading;

  // Helper to get the display label for a term (acronym or localized term)
  const getTermDisplayLabel = (term: GlossaryTerm): string => {
    if (term.acronym) return term.acronym;
    return isEn && term.termEn ? term.termEn : term.term;
  };

  // Filter and search terms
  const filteredTerms = useMemo(() => {
    let terms =
      selectedCategory === "all"
        ? allTerms
        : allTerms.filter((t) => t.category === selectedCategory);

    if (deferredSearchQuery.trim()) {
      const normalizedQuery = deferredSearchQuery.toLowerCase().trim();
      terms = terms.filter((term) => {
        const searchableText = [
          term.term,
          term.termEn,
          term.acronym,
          term.shortDefinition,
          term.shortDefinitionEn,
          ...(term.keywords ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      });
    }

    // Sort alphabetically using localized content
    return terms.sort((a, b) => {
      const aLabel = getTermDisplayLabel(a);
      const bLabel = getTermDisplayLabel(b);
      return aLabel.localeCompare(bLabel, i18n.language);
    });
  }, [allTerms, deferredSearchQuery, selectedCategory, isEn, i18n.language]);

  // Group terms by first letter (using localized label)
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};

    filteredTerms.forEach((term) => {
      const label = getTermDisplayLabel(term);
      const firstLetter = label[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    });

    return groups;
  }, [filteredTerms]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  // Get translated category label
  const getCategoryLabel = (categoryId: string): string => {
    return t(`categories.${categoryId}`, { defaultValue: categoryId });
  };

  // An empty result names its cause with a number, then offers the undo.
  const emptyDescription = [
    t("noneOfTotal", { total: totalCount }),
    searchQuery ? t("noResultsForQuery", { query: searchQuery }) : null,
    selectedCategory !== "all"
      ? t("noResultsInCategory", { category: getCategoryLabel(selectedCategory) })
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <SEOHead
        title={t("title")}
        description={t("seoDescription")}
        canonical="/glossary"
        jsonLd={[
          {
            "@type": "DefinedTermSet",
            name: t("seoDefinedTermSetName"),
            description: t("seoDefinedTermSetDescription"),
            url: "https://zoned.run/glossary",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav.home", { ns: "common" }), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("title") },
            ],
          },
        ]}
      />

      <div className="zn-ref">
        {/* 1 — the glossary, named and counted */}
        <section className="zn-ref__head zn-stack" style={HEAD_GAP}>
          <span className="zn-kicker">
            {totalCount > 0
              ? t("catalogue", {
                  terms: totalCount,
                  categories: categories.length,
                })
              : " "}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("title")}
          </h1>
          <p className="zn-body zn-body--lead zn-ref__lede">{t("lede")}</p>
        </section>

        <section className="zn-ref__section" aria-busy={isLoading}>
          {isLoading ? (
            <Spinner size={22} label={t("status.loading", { ns: "common" })} />
          ) : (
            <>
              {/* 2 — search and category, on one line */}
              <div className="zn-row zn-ref__controls">
                <div className="zn-ref__search" role="search">
                  <Search size={16} className="zn-ref__search-glyph" />
                  <input
                    type="search"
                    className="zn-ref__search-input"
                    aria-label={t("searchPlaceholder")}
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="zn-ref__search-clear"
                      aria-label={t("clearSearch")}
                      onClick={() => setSearchQuery("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) =>
                    setSelectedCategory(v as typeof selectedCategory)
                  }
                >
                  <SelectTrigger className="zn-ref__filter">
                    <Filter size={15} />
                    <SelectValue placeholder={t("categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allCategories")}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {getCategoryLabel(cat.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3 — what is on screen, and what is narrowing it */}
              <div className="zn-cluster zn-ref__meta">
                <span className="zn-mono zn-faint">
                  {t("resultCount", { count: filteredTerms.length })}
                </span>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary">
                    {getCategoryLabel(selectedCategory)}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="zn-ref__unfilter"
                      aria-label={t("removeCategoryFilter")}
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary">
                    {searchQuery}
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="zn-ref__unfilter"
                      aria-label={t("clearSearch")}
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                )}
              </div>

              {/* 4 — the terms, grouped by first letter */}
              {filteredTerms.length > 0 ? (
                <div className="zn-ref__groups">
                  {Object.keys(groupedTerms)
                    .sort()
                    .map((letter) => (
                      <section key={letter} aria-label={letter}>
                        <h2 className="zn-ref__letter">{letter}</h2>
                        <div className="zn-grid">
                          {groupedTerms[letter].map((term) => (
                            <GlossaryCard
                              key={`${term.id}-${i18n.language}`}
                              term={term}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                </div>
              ) : (
                <EmptyState
                  variant="no-results"
                  icon={Search}
                  title={t("noResults")}
                  description={emptyDescription}
                  action={
                    <Button variant="outline" onClick={handleClearFilters}>
                      {t("resetFilters")}
                    </Button>
                  }
                />
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default GlossaryPage;
