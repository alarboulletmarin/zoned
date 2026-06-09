// src/lib/unified-search.ts
// Unified search across workouts, collections, calculators, guides, articles,
// glossary terms and navigable product pages.

import { searchWorkouts } from "@/data/workouts";
import { searchStrengthSessions } from "@/data/strength";
import { getAllArticleMeta } from "@/data/articles/metadata";
import { loadAllTerms } from "@/data/glossary";
import { getAllCollections } from "@/data/collections";
import { searchSurfaces, type SurfaceSection } from "@/data/command-surfaces";
import { normalizeSearch } from "@/lib/search-utils";

export type SearchResultType =
  | "workout"
  | "collection"
  | "calculator"
  | "guide"
  | "article"
  | "glossary"
  | "page";

export interface UnifiedSearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export interface UnifiedSearchResults {
  workouts: UnifiedSearchResult[];
  collections: UnifiedSearchResult[];
  calculators: UnifiedSearchResult[];
  guides: UnifiedSearchResult[];
  articles: UnifiedSearchResult[];
  glossary: UnifiedSearchResult[];
  pages: UnifiedSearchResult[];
  total: number;
}

/** Maps a static surface section to the result type used by the palette. */
const SURFACE_SECTION_TYPE: Record<SurfaceSection, SearchResultType> = {
  calculator: "calculator",
  guide: "guide",
  page: "page",
};

const emptyResults = (): UnifiedSearchResults => ({
  workouts: [],
  collections: [],
  calculators: [],
  guides: [],
  articles: [],
  glossary: [],
  pages: [],
  total: 0,
});

const isEn = (lang: string): boolean => lang.startsWith("en");

export async function unifiedSearch(
  query: string,
  lang: string,
  maxPerType: number = 5,
): Promise<UnifiedSearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return emptyResults();
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

  // --- Collections ---
  const matchingCollections = getAllCollections().filter((c) => {
    const searchable = normalizeSearch(
      [c.name, c.nameEn, c.description, c.descriptionEn, ...c.tags].join(" ")
    );
    return searchable.includes(lowerQuery);
  });

  const collections: UnifiedSearchResult[] = matchingCollections
    .slice(0, maxPerType)
    .map((c) => ({
      type: "collection" as const,
      id: c.id,
      title: en ? c.nameEn : c.name,
      subtitle: en ? c.descriptionEn : c.description,
      url: `/collections/${c.slug}`,
    }));

  // --- Navigable surfaces (calculators / guides / pages) ---
  const surfaces = searchSurfaces(trimmed);
  const calculators: UnifiedSearchResult[] = [];
  const guides: UnifiedSearchResult[] = [];
  const pages: UnifiedSearchResult[] = [];

  for (const s of surfaces) {
    const result: UnifiedSearchResult = {
      type: SURFACE_SECTION_TYPE[s.section],
      id: s.id,
      title: en ? s.titleEn : s.title,
      subtitle: en ? s.subtitleEn : s.subtitle,
      url: s.url,
    };
    const bucket =
      s.section === "calculator" ? calculators : s.section === "guide" ? guides : pages;
    if (bucket.length < maxPerType) bucket.push(result);
  }

  return {
    workouts,
    collections,
    calculators,
    guides,
    articles,
    glossary,
    pages,
    total:
      workouts.length +
      collections.length +
      calculators.length +
      guides.length +
      articles.length +
      glossary.length +
      pages.length,
  };
}
