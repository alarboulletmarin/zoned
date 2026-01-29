// src/data/glossary/index.ts
// Main glossary index with helper functions

import type {
  GlossaryTerm,
  GlossaryCategory,
  GlossaryCategoryInfo,
} from "./types";
import { categories } from "./categories";
import { metricsTerms } from "./terms/metrics";
import { periodizationTerms } from "./terms/periodization";
import { sessionsTerms } from "./terms/sessions";
import { zonesTerms } from "./terms/zones";
import { physiologyTerms } from "./terms/physiology";
import { recoveryTerms } from "./terms/recovery";

// ============================================================================
// Aggregate all terms
// ============================================================================

const allTerms: GlossaryTerm[] = [
  ...metricsTerms,
  ...periodizationTerms,
  ...sessionsTerms,
  ...zonesTerms,
  ...physiologyTerms,
  ...recoveryTerms,
];

// Index by ID for O(1) lookup
const termsById = new Map<string, GlossaryTerm>(
  allTerms.map((term) => [term.id, term])
);

// Index by category
const termsByCategory = new Map<GlossaryCategory, GlossaryTerm[]>();
for (const term of allTerms) {
  const existing = termsByCategory.get(term.category) ?? [];
  existing.push(term);
  termsByCategory.set(term.category, existing);
}

// ============================================================================
// Export types
// ============================================================================

export type { GlossaryTerm, GlossaryCategory, GlossaryCategoryInfo };

// ============================================================================
// Getter functions
// ============================================================================

/**
 * Get all glossary terms
 */
export function getAllTerms(): GlossaryTerm[] {
  return allTerms;
}

/**
 * Get a term by its ID
 */
export function getTermById(id: string): GlossaryTerm | undefined {
  return termsById.get(id);
}

/**
 * Get all terms in a specific category
 */
export function getTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return termsByCategory.get(category) ?? [];
}

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

/**
 * Check if a term exists
 */
export function termExists(id: string): boolean {
  return termsById.has(id);
}

/**
 * Search terms by query string
 * Searches in: term, termEn, acronym, shortDefinition, shortDefinitionEn, keywords
 */
export function searchTerms(query: string): GlossaryTerm[] {
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
 * Get terms sorted alphabetically by display name (acronym or term)
 */
export function getTermsSortedAlphabetically(lang: "fr" | "en" = "fr"): GlossaryTerm[] {
  return [...allTerms].sort((a, b) => {
    const aLabel = a.acronym ?? (lang === "en" && a.termEn ? a.termEn : a.term);
    const bLabel = b.acronym ?? (lang === "en" && b.termEn ? b.termEn : b.term);
    return aLabel.localeCompare(bLabel, lang);
  });
}

/**
 * Get terms grouped by first letter
 */
export function getTermsGroupedByLetter(lang: "fr" | "en" = "fr"): Record<string, GlossaryTerm[]> {
  const sorted = getTermsSortedAlphabetically(lang);
  const groups: Record<string, GlossaryTerm[]> = {};

  for (const term of sorted) {
    const label = term.acronym ?? (lang === "en" && term.termEn ? term.termEn : term.term);
    const firstLetter = label[0].toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(term);
  }

  return groups;
}

/**
 * Get the total count of terms
 */
export function getTermsCount(): number {
  return allTerms.length;
}

/**
 * Get related terms for a given term
 */
export function getRelatedTerms(termId: string): GlossaryTerm[] {
  const term = getTermById(termId);
  if (!term?.relatedTerms) return [];

  return term.relatedTerms
    .map((id) => getTermById(id))
    .filter((t): t is GlossaryTerm => t !== undefined);
}
