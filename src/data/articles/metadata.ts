// src/data/articles/metadata.ts
// Lightweight article metadata - NO content

import type { ArticleMeta, ArticleCategory } from "./types";

/**
 * Article metadata array - used for listing and navigation
 * Content is loaded separately via dynamic imports
 */
export const articleMetadata: ArticleMeta[] = [
  {
    id: "zones",
    slug: "zones",
    title: "Comprendre les 6 zones d'entraînement",
    titleEn: "Understanding the 6 Training Zones",
    description:
      "La science derrière l'entraînement par zones et comment l'appliquer à votre pratique",
    descriptionEn:
      "The science behind zone training and how to apply it to your practice",
    category: "fundamentals",
    readTime: 10,
  },
  {
    id: "testing-vma",
    slug: "testing-vma",
    title: "Mesurer sa VMA et sa FCmax",
    titleEn: "Measuring Your VO2max Speed and HRmax",
    description:
      "Protocoles de tests et méthodes pour établir vos références d'entraînement",
    descriptionEn:
      "Test protocols and methods to establish your training benchmarks",
    category: "fundamentals",
    readTime: 12,
  },
  {
    id: "warmup",
    slug: "warmup",
    title: "L'échauffement du coureur",
    titleEn: "The Runner's Warm-up",
    description:
      "Préparer son corps à l'effort : physiologie, protocoles et erreurs courantes",
    descriptionEn:
      "Preparing your body for effort: physiology, protocols and common mistakes",
    category: "training",
    readTime: 8,
  },
  {
    id: "recovery",
    slug: "recovery",
    title: "La récupération : là où tout se joue",
    titleEn: "Recovery: Where It All Comes Together",
    description:
      "Comprendre pourquoi la progression se fait au repos et comment optimiser votre récupération",
    descriptionEn:
      "Understanding why progression happens at rest and how to optimize your recovery",
    category: "lifestyle",
    readTime: 10,
  },
  {
    id: "nutrition",
    slug: "nutrition",
    title: "Nutrition du coureur",
    titleEn: "The Runner's Nutrition",
    description:
      "Alimenter la performance : avant, pendant et après l'effort",
    descriptionEn: "Fueling performance: before, during and after effort",
    category: "lifestyle",
    readTime: 12,
  },
  {
    id: "faq",
    slug: "faq",
    title: "Questions fréquentes",
    titleEn: "Frequently Asked Questions",
    description: "Réponses aux interrogations courantes des coureurs",
    descriptionEn: "Answers to common runner questions",
    category: "fundamentals",
    readTime: 8,
  },
];

/**
 * Available article categories
 */
export const articleCategories: ArticleCategory[] = [
  "fundamentals",
  "training",
  "lifestyle",
];

/**
 * Index by slug for O(1) lookup
 */
const metadataBySlug = new Map<string, ArticleMeta>(
  articleMetadata.map((a) => [a.slug, a])
);

/**
 * Get article metadata by slug
 */
export function getArticleMetaBySlug(slug: string): ArticleMeta | undefined {
  return metadataBySlug.get(slug);
}

/**
 * Get all article metadata
 */
export function getAllArticleMeta(): ArticleMeta[] {
  return articleMetadata;
}

/**
 * Get article metadata by category
 */
export function getArticleMetaByCategory(category: ArticleCategory): ArticleMeta[] {
  return articleMetadata.filter((a) => a.category === category);
}

/**
 * Get adjacent articles for navigation
 */
export function getAdjacentArticleMeta(
  slug: string
): { prev: ArticleMeta | null; next: ArticleMeta | null } {
  const index = articleMetadata.findIndex((a) => a.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? articleMetadata[index - 1] : null,
    next: index < articleMetadata.length - 1 ? articleMetadata[index + 1] : null,
  };
}
