// src/lib/unified-search.ts
// Unified search across workouts, articles, and glossary terms

import { searchWorkouts } from "@/data/workouts";
import { searchStrengthSessions } from "@/data/strength";
import { getAllArticleMeta } from "@/data/articles/metadata";
import { loadAllTerms } from "@/data/glossary";
import { normalizeSearch } from "@/lib/search-utils";

export type SearchResultType = "workout" | "article" | "glossary";

export interface UnifiedSearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export interface UnifiedSearchResults {
  workouts: UnifiedSearchResult[];
  articles: UnifiedSearchResult[];
  glossary: UnifiedSearchResult[];
  total: number;
}

const isEn = (lang: string): boolean => lang.startsWith("en");

export async function unifiedSearch(
  query: string,
  lang: string,
  maxPerType: number = 5,
): Promise<UnifiedSearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { workouts: [], articles: [], glossary: [], total: 0 };
  }

  const lowerQuery = normalizeSearch(trimmed);
  const en = isEn(lang);

  // Run all searches in parallel
  const [workoutResults, strengthResults, glossaryTerms] = await Promise.all([
    searchWorkouts(trimmed),
    searchStrengthSessions(trimmed),
    loadAllTerms(),
  ]);

  // --- Workouts (running + strength merged) ---
  const allWorkoutResults = [
    ...workoutResults.map((w) => ({
      id: w.id,
      name: w.name,
      nameEn: w.nameEn,
      description: w.description,
      descriptionEn: w.descriptionEn,
    })),
    ...strengthResults.map((s) => ({
      id: s.id,
      name: s.name,
      nameEn: s.nameEn,
      description: s.description,
      descriptionEn: s.descriptionEn,
    })),
  ];

  const workouts: UnifiedSearchResult[] = allWorkoutResults
    .slice(0, maxPerType)
    .map((w) => ({
      type: "workout" as const,
      id: w.id,
      title: en ? w.nameEn : w.name,
      subtitle: en ? w.descriptionEn : w.description,
      url: `/workout/${w.id}`,
    }));

  // --- Articles ---
  const allArticles = getAllArticleMeta();
  const matchingArticles = allArticles.filter((a) => {
    const searchable = normalizeSearch(
      [a.title, a.titleEn, a.description, a.descriptionEn].join(" ")
    );
    return searchable.includes(lowerQuery);
  });

  const articles: UnifiedSearchResult[] = matchingArticles
    .slice(0, maxPerType)
    .map((a) => ({
      type: "article" as const,
      id: a.id,
      title: en ? a.titleEn : a.title,
      subtitle: en ? a.descriptionEn : a.description,
      url: `/learn/${a.slug}`,
    }));

  // --- Glossary ---
  const matchingTerms = glossaryTerms.filter((t) => {
    const searchable = normalizeSearch(
      [
        t.term,
        t.termEn,
        t.acronym,
        t.shortDefinition,
        ...(t.keywords ?? []),
      ]
        .filter(Boolean)
        .join(" ")
    );
    return searchable.includes(lowerQuery);
  });

  const glossary: UnifiedSearchResult[] = matchingTerms
    .slice(0, maxPerType)
    .map((t) => ({
      type: "glossary" as const,
      id: t.id,
      title: en ? (t.termEn ?? t.term) : t.term,
      subtitle: en ? (t.shortDefinitionEn ?? t.shortDefinition) : t.shortDefinition,
      url: `/glossary/${t.id}`,
    }));

  return {
    workouts,
    articles,
    glossary,
    total: workouts.length + articles.length + glossary.length,
  };
}
