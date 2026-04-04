// src/lib/content-relationships.ts
// Content relationship engine: finds related content across workouts, articles,
// and glossary terms using curated links + category/zone heuristics.

import type { WorkoutTemplate, WorkoutCategory } from "@/types";
import type { ArticleMeta } from "@/data/articles/types";
import type { GlossaryTerm } from "@/data/glossary/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContentRef {
  type: "workout" | "article" | "glossary";
  id: string;
}

export interface RelatedContentResult {
  workouts: WorkoutTemplate[];
  articles: ArticleMeta[];
  glossaryTerms: GlossaryTerm[];
}

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

const MAX_WORKOUTS = 4;
const MAX_ARTICLES = 3;
const MAX_GLOSSARY = 5;

// ---------------------------------------------------------------------------
// Strategy 1: Category heuristics
// ---------------------------------------------------------------------------

/** Maps article slugs to the workout categories they relate to. */
const ARTICLE_WORKOUT_CATEGORIES: Record<string, WorkoutCategory[]> = {
  zones: ["recovery", "endurance", "tempo", "threshold", "vma_intervals"],
  "testing-vma": ["assessment", "vma_intervals"],
  warmup: ["recovery", "fartlek"],
  recovery: ["recovery", "endurance"],
  nutrition: ["long_run", "race_pace"],
  periodization: ["tempo", "threshold", "vma_intervals", "long_run"],
  "polarized-training": ["endurance", "vma_intervals"],
  "progressive-overload": ["endurance", "long_run", "hills"],
  consistency: ["endurance", "recovery"],
  supercompensation: ["threshold", "vma_intervals"],
  tapering: ["race_pace", "tempo"],
};

// ---------------------------------------------------------------------------
// Strategy 2: Curated manual links (always shown first)
// ---------------------------------------------------------------------------

const CURATED_LINKS: Record<string, ContentRef[]> = {
  "article:zones": [
    { type: "workout", id: "END-001" },
    { type: "workout", id: "VMA-001" },
    { type: "workout", id: "THR-001" },
  ],
  "article:testing-vma": [
    { type: "workout", id: "ASS-001" },
    { type: "workout", id: "ASS-003" },
    { type: "workout", id: "VMA-001" },
  ],
  "article:warmup": [
    { type: "workout", id: "REC-001" },
    { type: "workout", id: "FAR-010" },
  ],
  "article:recovery": [
    { type: "workout", id: "REC-001" },
    { type: "workout", id: "REC-005" },
    { type: "workout", id: "END-001" },
  ],
  "article:nutrition": [
    { type: "workout", id: "SL-001" },
    { type: "workout", id: "RP-001" },
  ],
  "article:tapering": [
    { type: "workout", id: "RP-001" },
    { type: "workout", id: "TMP-001" },
  ],
  "article:polarized-training": [
    { type: "workout", id: "END-001" },
    { type: "workout", id: "VMA-001" },
  ],
  "article:progressive-overload": [
    { type: "workout", id: "END-003" },
    { type: "workout", id: "SL-001" },
  ],
  "glossary:vma": [
    { type: "article", id: "testing-vma" },
    { type: "workout", id: "VMA-001" },
    { type: "workout", id: "ASS-001" },
  ],
  "glossary:fcmax": [
    { type: "article", id: "zones" },
    { type: "article", id: "testing-vma" },
  ],
  "glossary:seuil-lactique": [
    { type: "article", id: "zones" },
    { type: "workout", id: "THR-001" },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the most frequent zone number from a workout's main set blocks.
 * Returns null if no zones are present.
 */
function getWorkoutDominantZone(workout: WorkoutTemplate): number | null {
  const zones = workout.mainSetTemplate
    .map((b) => (b.zone ? parseInt(b.zone.replace("Z", ""), 10) : null))
    .filter((z): z is number => z != null);
  if (zones.length === 0) return null;

  const counts = new Map<number, number>();
  for (const z of zones) counts.set(z, (counts.get(z) ?? 0) + 1);

  let max = 0;
  let dominant = zones[0];
  for (const [z, c] of counts) {
    if (c > max) {
      max = c;
      dominant = z;
    }
  }
  return dominant;
}

/** Resolve a ContentRef to its actual data object, or undefined if not found. */
function resolveRef(
  ref: ContentRef,
  workoutsById: Map<string, WorkoutTemplate>,
  articlesBySlug: Map<string, ArticleMeta>,
  glossaryById: Map<string, GlossaryTerm>,
): WorkoutTemplate | ArticleMeta | GlossaryTerm | undefined {
  switch (ref.type) {
    case "workout":
      return workoutsById.get(ref.id);
    case "article":
      return articlesBySlug.get(ref.id);
    case "glossary":
      return glossaryById.get(ref.id);
  }
}

/** Pick one workout per difficulty level for variety. */
function pickVariedDifficulty(
  workouts: WorkoutTemplate[],
  limit: number,
): WorkoutTemplate[] {
  const byDifficulty: Record<string, WorkoutTemplate[]> = {};
  for (const w of workouts) {
    (byDifficulty[w.difficulty] ??= []).push(w);
  }

  const result: WorkoutTemplate[] = [];
  const order = ["beginner", "intermediate", "advanced", "elite"];

  // One per difficulty first
  for (const d of order) {
    if (result.length >= limit) break;
    const pool = byDifficulty[d];
    if (pool && pool.length > 0) {
      result.push(pool.shift()!);
    }
  }

  // Fill remaining from whatever is left
  if (result.length < limit) {
    const remaining = workouts.filter((w) => !result.includes(w));
    for (const w of remaining) {
      if (result.length >= limit) break;
      result.push(w);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Heuristic finders
// ---------------------------------------------------------------------------

function findArticlesForWorkout(
  workout: WorkoutTemplate,
  allArticles: ArticleMeta[],
  excludeIds: Set<string>,
  limit: number,
): ArticleMeta[] {
  const results: ArticleMeta[] = [];

  for (const [slug, categories] of Object.entries(ARTICLE_WORKOUT_CATEGORIES)) {
    if (results.length >= limit) break;
    if (excludeIds.has(slug)) continue;
    if (categories.includes(workout.category)) {
      const article = allArticles.find((a) => a.slug === slug);
      if (article) {
        results.push(article);
        excludeIds.add(slug);
      }
    }
  }

  return results;
}

function findGlossaryForWorkout(
  workout: WorkoutTemplate,
  allTerms: GlossaryTerm[],
  excludeIds: Set<string>,
  limit: number,
): GlossaryTerm[] {
  const dominant = getWorkoutDominantZone(workout);
  const results: GlossaryTerm[] = [];

  if (dominant != null) {
    for (const term of allTerms) {
      if (results.length >= limit) break;
      if (excludeIds.has(term.id)) continue;
      if (term.zone === dominant) {
        results.push(term);
        excludeIds.add(term.id);
      }
    }
  }

  return results;
}

function findWorkoutsForArticle(
  articleSlug: string,
  allWorkouts: WorkoutTemplate[],
  excludeIds: Set<string>,
  limit: number,
): WorkoutTemplate[] {
  const categories = ARTICLE_WORKOUT_CATEGORIES[articleSlug];
  if (!categories) return [];

  const candidates = allWorkouts.filter(
    (w) => categories.includes(w.category) && !excludeIds.has(w.id),
  );

  const picked = pickVariedDifficulty(candidates, limit);
  for (const w of picked) excludeIds.add(w.id);
  return picked;
}

function findGlossaryForArticle(
  articleSlug: string,
  allTerms: GlossaryTerm[],
  excludeIds: Set<string>,
  limit: number,
): GlossaryTerm[] {
  const results: GlossaryTerm[] = [];
  const slugLower = articleSlug.toLowerCase();

  for (const term of allTerms) {
    if (results.length >= limit) break;
    if (excludeIds.has(term.id)) continue;

    const termIdLower = term.id.toLowerCase();
    const keywords = (term.keywords ?? []).map((k) => k.toLowerCase());

    if (
      slugLower.includes(termIdLower) ||
      termIdLower.includes(slugLower) ||
      keywords.includes(slugLower)
    ) {
      results.push(term);
      excludeIds.add(term.id);
    }
  }

  return results;
}

function findWorkoutsForGlossary(
  term: GlossaryTerm,
  allWorkouts: WorkoutTemplate[],
  excludeIds: Set<string>,
  limit: number,
): WorkoutTemplate[] {
  const results: WorkoutTemplate[] = [];

  if (term.zone != null) {
    // Filter by dominant zone match
    for (const w of allWorkouts) {
      if (results.length >= limit) break;
      if (excludeIds.has(w.id)) continue;
      if (getWorkoutDominantZone(w) === term.zone) {
        results.push(w);
        excludeIds.add(w.id);
      }
    }
  } else {
    // Fallback: text match on workout description
    const termNameLower = term.term.toLowerCase();
    for (const w of allWorkouts) {
      if (results.length >= limit) break;
      if (excludeIds.has(w.id)) continue;
      if (w.description.toLowerCase().includes(termNameLower)) {
        results.push(w);
        excludeIds.add(w.id);
      }
    }
  }

  return results;
}

function findArticlesForGlossary(
  term: GlossaryTerm,
  allArticles: ArticleMeta[],
  excludeIds: Set<string>,
  limit: number,
): ArticleMeta[] {
  const results: ArticleMeta[] = [];
  const termKeywords = (term.keywords ?? []).map((k) => k.toLowerCase());

  for (const [slug, _categories] of Object.entries(ARTICLE_WORKOUT_CATEGORIES)) {
    if (results.length >= limit) break;
    if (excludeIds.has(slug)) continue;

    const slugLower = slug.toLowerCase();
    const matches =
      term.category === "zones" && slugLower === "zones" ||
      termKeywords.includes(slugLower) ||
      slugLower.includes(term.id.toLowerCase()) ||
      term.id.toLowerCase().includes(slugLower);

    if (matches) {
      const article = allArticles.find((a) => a.slug === slug);
      if (article) {
        results.push(article);
        excludeIds.add(slug);
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Find related content for a given source item across workouts, articles,
 * and glossary terms.
 *
 * Curated links are always shown first, then heuristic results fill up
 * to the configured limits.
 */
export function findRelatedContent(
  source: ContentRef,
  allWorkouts: WorkoutTemplate[],
  allArticles: ArticleMeta[],
  allGlossaryTerms: GlossaryTerm[],
): RelatedContentResult {
  // Build lookup maps for fast resolution
  const workoutsById = new Map(allWorkouts.map((w) => [w.id, w]));
  const articlesBySlug = new Map(allArticles.map((a) => [a.slug, a]));
  const glossaryById = new Map(allGlossaryTerms.map((t) => [t.id, t]));

  const result: RelatedContentResult = {
    workouts: [],
    articles: [],
    glossaryTerms: [],
  };

  // Track IDs already added to avoid duplicates
  const usedWorkoutIds = new Set<string>();
  const usedArticleIds = new Set<string>();
  const usedGlossaryIds = new Set<string>();

  // Exclude the source item itself
  switch (source.type) {
    case "workout":
      usedWorkoutIds.add(source.id);
      break;
    case "article":
      usedArticleIds.add(source.id);
      break;
    case "glossary":
      usedGlossaryIds.add(source.id);
      break;
  }

  // ---- Step 1: Curated links (always first) ----

  const key = `${source.type}:${source.id}`;
  const curated = CURATED_LINKS[key] ?? [];

  for (const ref of curated) {
    const resolved = resolveRef(ref, workoutsById, articlesBySlug, glossaryById);
    if (!resolved) continue;

    switch (ref.type) {
      case "workout": {
        const w = resolved as WorkoutTemplate;
        if (!usedWorkoutIds.has(w.id) && result.workouts.length < MAX_WORKOUTS) {
          result.workouts.push(w);
          usedWorkoutIds.add(w.id);
        }
        break;
      }
      case "article": {
        const a = resolved as ArticleMeta;
        if (!usedArticleIds.has(a.slug) && result.articles.length < MAX_ARTICLES) {
          result.articles.push(a);
          usedArticleIds.add(a.slug);
        }
        break;
      }
      case "glossary": {
        const t = resolved as GlossaryTerm;
        if (!usedGlossaryIds.has(t.id) && result.glossaryTerms.length < MAX_GLOSSARY) {
          result.glossaryTerms.push(t);
          usedGlossaryIds.add(t.id);
        }
        break;
      }
    }
  }

  // ---- Step 2: Fill with heuristic results ----

  switch (source.type) {
    case "workout": {
      const workout = workoutsById.get(source.id);
      if (!workout) break;

      if (result.articles.length < MAX_ARTICLES) {
        result.articles.push(
          ...findArticlesForWorkout(
            workout,
            allArticles,
            usedArticleIds,
            MAX_ARTICLES - result.articles.length,
          ),
        );
      }
      if (result.glossaryTerms.length < MAX_GLOSSARY) {
        result.glossaryTerms.push(
          ...findGlossaryForWorkout(
            workout,
            allGlossaryTerms,
            usedGlossaryIds,
            MAX_GLOSSARY - result.glossaryTerms.length,
          ),
        );
      }
      break;
    }
    case "article": {
      if (result.workouts.length < MAX_WORKOUTS) {
        result.workouts.push(
          ...findWorkoutsForArticle(
            source.id,
            allWorkouts,
            usedWorkoutIds,
            MAX_WORKOUTS - result.workouts.length,
          ),
        );
      }
      if (result.glossaryTerms.length < MAX_GLOSSARY) {
        result.glossaryTerms.push(
          ...findGlossaryForArticle(
            source.id,
            allGlossaryTerms,
            usedGlossaryIds,
            MAX_GLOSSARY - result.glossaryTerms.length,
          ),
        );
      }
      break;
    }
    case "glossary": {
      const term = glossaryById.get(source.id);
      if (!term) break;

      if (result.workouts.length < MAX_WORKOUTS) {
        result.workouts.push(
          ...findWorkoutsForGlossary(
            term,
            allWorkouts,
            usedWorkoutIds,
            MAX_WORKOUTS - result.workouts.length,
          ),
        );
      }
      if (result.articles.length < MAX_ARTICLES) {
        result.articles.push(
          ...findArticlesForGlossary(
            term,
            allArticles,
            usedArticleIds,
            MAX_ARTICLES - result.articles.length,
          ),
        );
      }
      break;
    }
  }

  return result;
}
