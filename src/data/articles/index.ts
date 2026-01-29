// src/data/articles/index.ts
// Lazy-loading API with code-splitting for articles

export type { Article, ArticleMeta, ArticleContent, ArticleCategory } from "./types";
export {
  articleMetadata,
  articleCategories,
  getArticleMetaBySlug,
  getAllArticleMeta,
  getArticleMetaByCategory,
  getAdjacentArticleMeta,
} from "./metadata";

import type { Article, ArticleContent, ArticleMeta } from "./types";
import {
  articleMetadata,
  getArticleMetaBySlug,
  getAdjacentArticleMeta,
} from "./metadata";

// ============================================================
// Lazy Loading API with Code-Splitting
// Each article content is loaded as a separate chunk on demand
// ============================================================

// Cache for loaded article content
const contentCache = new Map<string, ArticleContent>();

// Loading promises to prevent duplicate fetches
const contentLoadingPromises = new Map<string, Promise<ArticleContent>>();

// Dynamic import loaders for each article content (explicit for proper code-splitting)
const contentLoaders: Record<string, () => Promise<{ default: ArticleContent }>> = {
  zones: () => import("./content/zones"),
  "testing-vma": () => import("./content/testing-vma"),
  warmup: () => import("./content/warmup"),
  recovery: () => import("./content/recovery"),
  nutrition: () => import("./content/nutrition"),
  faq: () => import("./content/faq"),
};

/**
 * Load article content lazily (with dynamic import for code-splitting)
 * Returns immediately from cache if available
 */
export async function loadArticleContent(
  slug: string
): Promise<ArticleContent | null> {
  // Return from cache if available
  if (contentCache.has(slug)) {
    return contentCache.get(slug)!;
  }

  // Return existing promise if already loading
  if (contentLoadingPromises.has(slug)) {
    return contentLoadingPromises.get(slug)!;
  }

  // Check if loader exists
  const loader = contentLoaders[slug];
  if (!loader) {
    return null;
  }

  // Create loading promise with dynamic import
  const loadPromise = (async () => {
    const module = await loader();
    const content = module.default;
    contentCache.set(slug, content);
    contentLoadingPromises.delete(slug);
    return content;
  })();

  contentLoadingPromises.set(slug, loadPromise);
  return loadPromise;
}

/**
 * Get full article by slug (async)
 * Loads content if not cached
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const meta = getArticleMetaBySlug(slug);
  if (!meta) {
    return null;
  }

  const content = await loadArticleContent(slug);
  if (!content) {
    return null;
  }

  return {
    ...meta,
    ...content,
  };
}

/**
 * Get full article by slug (sync) - DEPRECATED
 * Returns null, use getArticleBySlug async version instead
 * @deprecated Use getArticleBySlug() instead
 */
export function getArticleBySlugSync(slug: string): Article | null {
  const meta = getArticleMetaBySlug(slug);
  if (!meta) {
    return null;
  }

  const content = contentCache.get(slug);
  if (!content) {
    return null;
  }

  return {
    ...meta,
    ...content,
  };
}

/**
 * Get adjacent articles for navigation (sync metadata only)
 */
export function getAdjacentArticles(
  slug: string
): { prev: ArticleMeta | null; next: ArticleMeta | null } {
  return getAdjacentArticleMeta(slug);
}

/**
 * Check if article content is loaded in cache
 */
export function isArticleContentLoaded(slug: string): boolean {
  return contentCache.has(slug);
}

/**
 * Preload article content (useful for hover preloading)
 */
export function preloadArticleContent(slug: string): void {
  if (!contentCache.has(slug) && !contentLoadingPromises.has(slug)) {
    loadArticleContent(slug);
  }
}

// ============================================================
// Backward Compatibility Layer
// These synchronous exports are DEPRECATED - use async versions above
// ============================================================

/**
 * @deprecated Use getAllArticleMeta() from metadata.ts instead
 * This returns metadata only for backward compatibility
 */
export const articles = articleMetadata as unknown as Article[];
