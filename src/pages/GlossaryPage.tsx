// src/pages/GlossaryPage.tsx
// Full glossary page with search and category filtering

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Book, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlossaryCard } from "@/components/domain";
import {
  getAllTerms,
  getCategories,
  searchTerms,
  getTermsByCategory,
  getTermsCount,
  type GlossaryCategory,
  type GlossaryTerm,
} from "@/data/glossary";

export function GlossaryPage() {
  const { t, i18n } = useTranslation("glossary");
  const isEn = i18n.language === "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GlossaryCategory | "all"
  >("all");

  const categories = getCategories();
  const totalCount = getTermsCount();

  // Helper to get the display label for a term (acronym or localized term)
  const getTermDisplayLabel = (term: GlossaryTerm): string => {
    if (term.acronym) return term.acronym;
    return isEn && term.termEn ? term.termEn : term.term;
  };

  // Filter and search terms
  const filteredTerms = useMemo(() => {
    let terms =
      selectedCategory === "all"
        ? getAllTerms()
        : getTermsByCategory(selectedCategory);

    if (searchQuery.trim()) {
      const searchResults = searchTerms(searchQuery);
      // Intersect with category filter if needed
      if (selectedCategory !== "all") {
        const categoryTermIds = new Set(terms.map((t) => t.id));
        terms = searchResults.filter((t) => categoryTermIds.has(t.id));
      } else {
        terms = searchResults;
      }
    }

    // Sort alphabetically using localized content
    return terms.sort((a, b) => {
      const aLabel = getTermDisplayLabel(a);
      const bLabel = getTermDisplayLabel(b);
      return aLabel.localeCompare(bLabel, isEn ? "en" : "fr");
    });
  }, [searchQuery, selectedCategory, isEn]);

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

  return (
    <div className="py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Book className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground">
          {t("subtitle", { count: totalCount })}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(v) =>
            setSelectedCategory(v as typeof selectedCategory)
          }
        >
          <SelectTrigger className="w-full sm:w-56">
            <Filter className="h-4 w-4 mr-2" />
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

      {/* Results count and active filters */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>
          {t("resultCount", { count: filteredTerms.length })}
        </span>
        {selectedCategory !== "all" && (
          <Badge variant="secondary" className="ml-2">
            {getCategoryLabel(selectedCategory)}
            <button
              onClick={() => setSelectedCategory("all")}
              className="ml-1 hover:text-foreground"
              aria-label={t("removeCategoryFilter")}
            >
              ×
            </button>
          </Badge>
        )}
        {searchQuery && (
          <Badge variant="secondary" className="ml-1">
            "{searchQuery}"
            <button
              onClick={() => setSearchQuery("")}
              className="ml-1 hover:text-foreground"
              aria-label={t("clearSearch")}
            >
              ×
            </button>
          </Badge>
        )}
      </div>

      {/* Terms List - Grouped alphabetically */}
      {filteredTerms.length > 0 ? (
        <div className="space-y-8">
          {Object.keys(groupedTerms)
            .sort()
            .map((letter) => (
              <div key={letter}>
                <h2 className="text-lg font-semibold text-primary mb-4 sticky top-14 bg-background py-2 z-10 border-b">
                  {letter}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedTerms[letter].map((term) => (
                    <GlossaryCard key={term.id} term={term} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
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
    </div>
  );
}

export default GlossaryPage;
