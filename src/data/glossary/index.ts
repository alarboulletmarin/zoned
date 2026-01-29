// src/data/glossary/index.ts
// Lazy-loading API with code-splitting for glossary terms

export type {
  GlossaryTerm,
  GlossaryCategory,
  GlossaryCategoryInfo,
  ExternalLink,
} from "./types";

export { categories } from "./categories";

import type {
  GlossaryTerm,
  GlossaryCategory,
  GlossaryCategoryInfo,
} from "./types";
import { categories } from "./categories";

// ============================================================
// Lazy Loading API with Code-Splitting
// Each category is loaded as a separate chunk on demand
// ============================================================

// Cache for loaded terms
let allTermsCache: GlossaryTerm[] | null = null;
let termsByIdCache: Map<string, GlossaryTerm> | null = null;
let termsByCategoryCache: Map<GlossaryCategory, GlossaryTerm[]> | null = null;

// Loading promise to prevent duplicate fetches
let loadingPromise: Promise<GlossaryTerm[]> | null = null;

// Dynamic import loaders for each term category (explicit for proper code-splitting)
const termLoaders: Record<GlossaryCategory, () => Promise<GlossaryTerm[]>> = {
  metrics: () => import("./terms/metrics").then((m) => m.metricsTerms),
  periodization: () => import("./terms/periodization").then((m) => m.periodizationTerms),
  sessions: () => import("./terms/sessions").then((m) => m.sessionsTerms),
  zones: () => import("./terms/zones").then((m) => m.zonesTerms),
  physiology: () => import("./terms/physiology").then((m) => m.physiologyTerms),
  recovery: () => import("./terms/recovery").then((m) => m.recoveryTerms),
};

/**
 * Build lookup caches from loaded terms
 */
function buildCaches(terms: GlossaryTerm[]): void {
  termsByIdCache = new Map(terms.map((term) => [term.id, term]));
  termsByCategoryCache = new Map();
  for (const term of terms) {
    const existing = termsByCategoryCache.get(term.category) ?? [];
    existing.push(term);
    termsByCategoryCache.set(term.category, existing);
  }
}

/**
 * Load all glossary terms lazily (with dynamic imports for code-splitting)
 * Returns immediately from cache if available
 */
export async function loadAllTerms(): Promise<GlossaryTerm[]> {
  // Return from cache if available
  if (allTermsCache) {
    return allTermsCache;
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Create loading promise with dynamic imports
  loadingPromise = (async () => {
    const categoryKeys = Object.keys(termLoaders) as GlossaryCategory[];
    const results = await Promise.all(
      categoryKeys.map((cat) => termLoaders[cat]())
    );

    const allTerms = results.flat();
    allTermsCache = allTerms;
    buildCaches(allTerms);
    loadingPromise = null;
    return allTerms;
  })();

  return loadingPromise;
}

/**
 * Load terms for a specific category
 */
export async function loadTermsByCategory(
  category: GlossaryCategory
): Promise<GlossaryTerm[]> {
  // If all terms are cached, use the category cache
  if (termsByCategoryCache) {
    return termsByCategoryCache.get(category) ?? [];
  }

  // Otherwise load the specific category
  const loader = termLoaders[category];
  if (!loader) {
    return [];
  }

  return loader();
}

/**
 * Get term by ID (async, loads all terms if not cached)
 */
export async function getTermByIdAsync(
  id: string
): Promise<GlossaryTerm | undefined> {
  // Return from cache if available
  const cached = termsByIdCache;
  if (cached !== null) {
    return cached.get(id);
  }

  // Load terms and return from cache
  await loadAllTerms();
  return termsByIdCache!.get(id);
}

/**
 * Check if all terms are loaded in cache
 */
export function isAllTermsLoaded(): boolean {
  return allTermsCache !== null;
}

/**
 * Get all terms synchronously (returns empty array if not loaded)
 * Use loadAllTerms() for async loading with caching
 */
export function getAllTermsSync(): GlossaryTerm[] {
  return allTermsCache ?? [];
}

/**
 * Get term by ID synchronously (returns undefined if not loaded)
 */
export function getTermByIdSync(id: string): GlossaryTerm | undefined {
  return termsByIdCache?.get(id);
}

/**
 * Get terms by category synchronously (returns empty array if not loaded)
 */
export function getTermsByCategorySync(
  category: GlossaryCategory
): GlossaryTerm[] {
  return termsByCategoryCache?.get(category) ?? [];
}

// ============================================================
// Category Functions (synchronous - categories are lightweight)
// ============================================================

/**
 * Get all category metadata
 */
export function getCategories(): GlossaryCategoryInfo[] {
  return categories;
}

/**
 * Get category metadata by ID
 */
export function getCategoryInfo(
  id: GlossaryCategory
): GlossaryCategoryInfo | undefined {
  return categories.find((c) => c.id === id);
}

// ============================================================
// Search and Utility Functions (async)
// ============================================================

/**
 * Search terms by query string (async)
 * Searches in: term, termEn, acronym, shortDefinition, shortDefinitionEn, keywords
 */
export async function searchTerms(query: string): Promise<GlossaryTerm[]> {
  const allTerms = await loadAllTerms();
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
}

/**
 * Get related terms for a given term (async)
 */
export async function getRelatedTerms(termId: string): Promise<GlossaryTerm[]> {
  const term = await getTermByIdAsync(termId);
  if (!term?.relatedTerms) return [];

  // Ensure terms are loaded
  await loadAllTerms();
  return term.relatedTerms
    .map((id) => termsByIdCache?.get(id))
    .filter((t): t is GlossaryTerm => t !== undefined);
}

/**
 * Get the total count of terms (async)
 */
export async function getTermsCount(): Promise<number> {
  const allTerms = await loadAllTerms();
  return allTerms.length;
}

// ============================================================
// Backward Compatibility
// These synchronous functions work only after loadAllTerms() is called
// ============================================================

/**
 * @deprecated Use getTermByIdSync() or getTermByIdAsync() instead
 */
export function getTermById(id: string): GlossaryTerm | undefined {
  return getTermByIdSync(id);
}

/**
 * @deprecated Use getAllTermsSync() or loadAllTerms() instead
 */
export function getAllTerms(): GlossaryTerm[] {
  return getAllTermsSync();
}

/**
 * @deprecated Use getTermsByCategorySync() or loadTermsByCategory() instead
 */
export function getTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return getTermsByCategorySync(category);
}

/**
 * @deprecated Check isAllTermsLoaded() instead
 */
export function termExists(id: string): boolean {
  return termsByIdCache?.has(id) ?? false;
}
