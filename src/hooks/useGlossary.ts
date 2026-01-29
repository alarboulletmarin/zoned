import { useState, useEffect, useMemo } from "react";
import type {
  GlossaryTerm,
  GlossaryCategory,
  GlossaryCategoryInfo,
} from "@/data/glossary/types";
import {
  loadAllTerms,
  isAllTermsLoaded,
  getAllTermsSync,
  getCategoryInfo as getCategoryInfoSync,
  getCategories,
} from "@/data/glossary";

// ============================================================
// Hook Interfaces
// ============================================================

interface UseGlossaryResult {
  terms: GlossaryTerm[];
  isLoading: boolean;
  error: Error | null;
}

interface UseGlossaryTermResult {
  term: GlossaryTerm | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseGlossaryCategoriesResult {
  categories: GlossaryCategoryInfo[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================================
// Hooks
// ============================================================

/**
 * Hook to load all glossary terms lazily
 * Returns terms from cache immediately if available, otherwise loads asynchronously
 */
export function useGlossary(): UseGlossaryResult {
  const [terms, setTerms] = useState<GlossaryTerm[]>(() => getAllTermsSync());
  const [isLoading, setIsLoading] = useState(!isAllTermsLoaded());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isAllTermsLoaded()) {
      setTerms(getAllTermsSync());
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    loadAllTerms()
      .then((data) => {
        if (!cancelled) {
          setTerms(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { terms, isLoading, error };
}

/**
 * Hook to get a single glossary term by ID
 */
export function useGlossaryTerm(id: string | undefined): UseGlossaryTermResult {
  const { terms, isLoading: termsLoading, error } = useGlossary();

  const term = useMemo(() => {
    if (!id || termsLoading) return null;
    return terms.find((t) => t.id === id) || null;
  }, [id, terms, termsLoading]);

  return {
    term,
    isLoading: termsLoading,
    error,
  };
}

/**
 * Hook to get glossary categories
 * Categories are lightweight and loaded synchronously
 */
export function useGlossaryCategories(): UseGlossaryCategoriesResult {
  // Categories are synchronous and lightweight
  const categories = getCategories();

  return {
    categories,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook to get category info by ID
 */
export function useGlossaryCategoryInfo(
  categoryId: GlossaryCategory | undefined
): GlossaryCategoryInfo | undefined {
  if (!categoryId) return undefined;
  return getCategoryInfoSync(categoryId);
}

/**
 * Hook to get terms filtered by category
 */
export function useGlossaryByCategory(
  category: GlossaryCategory | "all"
): UseGlossaryResult {
  const { terms: allTerms, isLoading, error } = useGlossary();

  const terms = useMemo(() => {
    if (category === "all") {
      return allTerms;
    }
    return allTerms.filter((t) => t.category === category);
  }, [allTerms, category]);

  return { terms, isLoading, error };
}

/**
 * Hook to search glossary terms
 */
export function useGlossarySearch(query: string): UseGlossaryResult {
  const { terms: allTerms, isLoading, error } = useGlossary();

  const terms = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return allTerms;
    }

    return allTerms.filter((term) => {
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
  }, [allTerms, query]);

  return { terms, isLoading, error };
}

/**
 * Hook to get related terms for a given term
 */
export function useRelatedTerms(termId: string | undefined): UseGlossaryResult {
  const { terms: allTerms, isLoading, error } = useGlossary();

  const terms = useMemo(() => {
    if (!termId) return [];

    const term = allTerms.find((t) => t.id === termId);
    if (!term?.relatedTerms) return [];

    return term.relatedTerms
      .map((id) => allTerms.find((t) => t.id === id))
      .filter((t): t is GlossaryTerm => t !== undefined);
  }, [allTerms, termId]);

  return { terms, isLoading, error };
}

/**
 * Hook to get the total count of terms
 */
export function useGlossaryCount(): { count: number; isLoading: boolean } {
  const { terms, isLoading } = useGlossary();
  return { count: terms.length, isLoading };
}
