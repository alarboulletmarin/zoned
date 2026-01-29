import { useState, useEffect } from "react";
import type { Article, ArticleMeta } from "@/data/articles/types";
import {
  articleMetadata,
  getArticleMetaBySlug,
  getAdjacentArticleMeta,
} from "@/data/articles/metadata";
import {
  loadArticleContent,
  isArticleContentLoaded,
} from "@/data/articles";

// ============================================================
// Hook Interfaces
// ============================================================

interface UseArticlesResult {
  articles: ArticleMeta[];
  isLoading: boolean;
  error: Error | null;
}

interface UseArticleResult {
  article: Article | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAdjacentArticlesResult {
  prev: ArticleMeta | null;
  next: ArticleMeta | null;
}

// ============================================================
// Hooks
// ============================================================

/**
 * Hook to get all article metadata (lightweight, no content)
 * Returns immediately since metadata is bundled synchronously
 */
export function useArticles(): UseArticlesResult {
  // Metadata is always available synchronously
  return {
    articles: articleMetadata,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook to get a single article by slug with lazy-loaded content
 * Returns metadata immediately, then loads content asynchronously
 */
export function useArticle(slug: string | undefined): UseArticleResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setArticle(null);
      setIsLoading(false);
      return;
    }

    // Get metadata (sync)
    const meta = getArticleMetaBySlug(slug);
    if (!meta) {
      setArticle(null);
      setIsLoading(false);
      return;
    }

    // Check if content is already cached
    if (isArticleContentLoaded(slug)) {
      loadArticleContent(slug).then((content) => {
        if (content) {
          setArticle({ ...meta, ...content });
        }
        setIsLoading(false);
      });
      return;
    }

    // Load content asynchronously
    let cancelled = false;
    setIsLoading(true);

    loadArticleContent(slug)
      .then((content) => {
        if (!cancelled) {
          if (content) {
            setArticle({ ...meta, ...content });
          } else {
            setArticle(null);
          }
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
  }, [slug]);

  return { article, isLoading, error };
}

/**
 * Hook to get adjacent articles for navigation
 * Returns metadata only (lightweight)
 */
export function useAdjacentArticles(
  slug: string | undefined
): UseAdjacentArticlesResult {
  if (!slug) {
    return { prev: null, next: null };
  }
  return getAdjacentArticleMeta(slug);
}

/**
 * Hook to preload article content on hover
 * Useful for prefetching content before navigation
 */
export function useArticlePreload(): (slug: string) => void {
  return (slug: string) => {
    if (!isArticleContentLoaded(slug)) {
      loadArticleContent(slug);
    }
  };
}
