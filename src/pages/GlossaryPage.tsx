// src/pages/GlossaryPage.tsx
// Full glossary page with search, category filters and an alphabetical index.

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo";
import { GlossaryCard } from "@/components/domain/GlossaryCard";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { calculateAllZones, loadUserZonePrefs } from "@/lib/zones";
import {
  useGlossary,
  useGlossaryCategories,
  useGlossaryCount,
} from "@/hooks/useGlossary";
import type { GlossaryCategory, GlossaryTerm } from "@/data/glossary/types";
import type { ZoneRange } from "@/types";

export function GlossaryPage() {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchQuery, setSearchQuery] = useState("");
  // Defer the heavy filtering so typing stays at 60fps even on 100+ terms.
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<
    GlossaryCategory | "all"
  >("all");

  const { terms: allTerms, isLoading: termsLoading } = useGlossary();
  const { categories, isLoading: categoriesLoading } = useGlossaryCategories();
  const { count: totalCount } = useGlossaryCount();

  const isLoading = termsLoading || categoriesLoading;

  // Reader's calibrated zones, used to show a personal pace repere on
  // zone-linked terms (e.g. "Chez toi · 4:06–4:18/km"). Empty when uncalibrated.
  const [userZones, setUserZones] = useState<ZoneRange[]>([]);
  useEffect(() => {
    const prefs = loadUserZonePrefs();
    setUserZones(prefs ? calculateAllZones(prefs) : []);
  }, []);

  const termsById = useMemo(
    () => new Map(allTerms.map((term) => [term.id, term])),
    [allTerms],
  );

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

  const sortedLetters = useMemo(
    () => Object.keys(groupedTerms).sort((a, b) => a.localeCompare(b, i18n.language)),
    [groupedTerms, i18n.language],
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  // Get translated category label
  const getCategoryLabel = (categoryId: string): string => {
    return t(`categories.${categoryId}`, { defaultValue: categoryId });
  };

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
      <PageContainer width="wide" as="div" className="py-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-filet pb-6">
          <div>
            <EditorialTitle as="h1" size="xl">
              {t("subtitle", { count: totalCount })}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="mt-3 max-w-[56ch] text-muted-foreground">
              {t("seoDefinedTermSetDescription")}
            </FadeUp>
          </div>

          <div className="flex w-full min-w-0 flex-none flex-col items-stretch gap-3 sm:w-auto sm:items-end">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-1 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 border-b-[3px] border-foreground bg-transparent py-2 pl-6 text-base placeholder:text-muted-foreground focus-visible:outline-none"
              />
            </div>
            <div className="flex w-full min-w-0 gap-1.5 overflow-x-auto font-mono text-[11px] tracking-[0.08em] uppercase">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "shrink-0 px-2.5 py-2",
                  selectedCategory === "all"
                    ? "bg-ink text-paper"
                    : "border border-filet text-muted-foreground hover:text-foreground",
                )}
              >
                {t("allCategories")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "shrink-0 px-2.5 py-2",
                    selectedCategory === cat.id
                      ? "bg-ink text-paper"
                      : "border border-filet text-muted-foreground hover:text-foreground",
                  )}
                >
                  {getCategoryLabel(cat.id)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Results count and active filters */}
            <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span>{t("resultCount", { count: filteredTerms.length })}</span>
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  {getCategoryLabel(selectedCategory)}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-1 hover:text-foreground"
                    aria-label={t("removeCategoryFilter")}
                  >
                    x
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary">
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-foreground"
                    aria-label={t("clearSearch")}
                  >
                    x
                  </button>
                </Badge>
              )}
            </div>

            {/* Alphabet index + term rows */}
            {filteredTerms.length > 0 ? (
              <div className="mt-4 grid gap-8 md:grid-cols-[100px_1fr]">
                <nav
                  aria-label={t("title")}
                  className="hidden flex-col gap-1 border-r border-filet pr-4 font-mono text-sm md:flex md:sticky md:top-20 md:self-start"
                >
                  {sortedLetters.map((letter) => (
                    <a
                      key={letter}
                      href={`#letter-${letter}`}
                      className="px-2 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {letter} · {groupedTerms[letter].length}
                    </a>
                  ))}
                </nav>

                <div className="space-y-6">
                  {sortedLetters.map((letter) => (
                    <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
                      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-primary">
                        {letter}
                      </div>
                      <div className="flex flex-col">
                        {groupedTerms[letter].map((term) => (
                          <GlossaryCard
                            key={`${term.id}-${i18n.language}`}
                            term={term}
                            userZones={userZones}
                            termsById={termsById}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  {t("noResults")}
                  {searchQuery && ` ${t("noResultsForQuery", { query: searchQuery })}`}
                  {selectedCategory !== "all" &&
                    ` ${t("noResultsInCategory", { category: getCategoryLabel(selectedCategory) })}`}
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  {t("resetFilters")}
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </>
  );
}

export default GlossaryPage;
