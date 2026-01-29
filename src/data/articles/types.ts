// src/data/articles/types.ts
// Type definitions for articles

/**
 * Article category type
 */
export type ArticleCategory = "fundamentals" | "training" | "lifestyle";

/**
 * Lightweight article metadata (no content)
 * Used for listing and navigation
 */
export interface ArticleMeta {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: ArticleCategory;
  readTime: number;
}

/**
 * Article content (loaded separately)
 */
export interface ArticleContent {
  content: string;
  contentEn: string;
}

/**
 * Full article with content
 */
export interface Article extends ArticleMeta {
  content: string;
  contentEn: string;
}
