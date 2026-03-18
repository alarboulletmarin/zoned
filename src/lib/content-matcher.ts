// src/lib/content-matcher.ts
// Regex-based matcher to detect and link glossary terms AND article
// references in text.

import type { GlossaryTerm } from "@/data/glossary/types";
import type { ArticleMeta } from "@/data/articles/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MatchableContent =
  | { type: "glossary"; data: GlossaryTerm }
  | { type: "article"; data: ArticleMeta };

export interface ContentMatcher {
  /** A single global, case-insensitive regex that matches every known pattern. */
  regex: RegExp;
  /** Lowercase matched string -> MatchableContent it belongs to. */
  lookup: Map<string, MatchableContent>;
}

export interface ContentMatch {
  content: MatchableContent;
  start: number;
  end: number;
  matchedText: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Short acronyms that are too ambiguous to auto-link (common English words,
 * prepositions, or abbreviations that clash with everyday language).
 */
const EXCLUDED_PATTERNS = new Set(["NP", "IF", "VI"]);

/**
 * Zone shorthand patterns (Z1-Z6) mapped to their glossary term IDs.
 */
const ZONE_SHORTHAND_MAP: Record<string, string> = {
  Z1: "zone-1",
  Z2: "zone-2",
  Z3: "zone-3",
  Z4: "zone-4",
  Z5: "zone-5",
  Z6: "zone-6",
};

/**
 * Match patterns for articles, keyed by slug.
 * Each entry lists phrases that should auto-link to the corresponding article.
 */
const ARTICLE_MATCH_PATTERNS: Record<string, { fr: string[]; en: string[] }> = {
  zones: {
    fr: ["zones d'entraînement"],
    en: ["training zones"],
  },
  "testing-vma": {
    fr: ["test VMA", "test de VMA"],
    en: ["VMA test"],
  },
  warmup: {
    fr: ["échauffement"],
    en: ["warm-up", "warmup"],
  },
  recovery: {
    fr: ["récupération"],
    en: ["recovery"],
  },
  nutrition: {
    fr: ["nutrition du coureur", "nutrition sportive"],
    en: ["runner's nutrition", "sports nutrition"],
  },
  periodization: {
    fr: ["périodisation"],
    en: ["periodization"],
  },
  supercompensation: {
    fr: ["surcompensation"],
    en: ["supercompensation"],
  },
  tapering: {
    fr: ["taper", "tapering", "affûtage"],
    en: ["tapering", "taper"],
  },
  "polarized-training": {
    fr: ["entraînement polarisé", "méthode 80/20"],
    en: ["polarized training", "80/20 method"],
  },
  "progressive-overload": {
    fr: ["surcharge progressive", "charge progressive"],
    en: ["progressive overload"],
  },
  consistency: {
    fr: ["régularité"],
    en: ["consistency"],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape special regex characters in a literal string. */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Returns true when every letter in the string is uppercase. */
function isAllUppercase(str: string): boolean {
  return str === str.toUpperCase() && str !== str.toLowerCase();
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Build a ContentMatcher from glossary terms and article metadata.
 *
 * Glossary terms are added first and take priority over article patterns when
 * a phrase could match both (first-writer-wins in the lookup map).
 *
 * @param terms    - The full glossary.
 * @param articles - Article metadata list.
 * @param lang     - "fr" or "en". Determines which localised patterns are used.
 */
export function buildContentMatcher(
  terms: GlossaryTerm[],
  articles: ArticleMeta[],
  lang: string,
): ContentMatcher {
  const lookup = new Map<string, MatchableContent>();

  // Collect all (pattern, content) pairs.
  const entries: { pattern: string; content: MatchableContent }[] = [];

  // ----- Glossary terms (added first for priority) -------------------------

  for (const term of terms) {
    const candidates: string[] = [];

    // Acronym
    if (term.acronym) {
      candidates.push(term.acronym);
    }

    // Localised full term
    if (lang === "en" && term.termEn) {
      candidates.push(term.termEn);
    }
    // Always consider the French term (primary language).
    candidates.push(term.term);

    for (const raw of candidates) {
      // Filter out patterns shorter than 3 characters.
      if (raw.length < 3) continue;

      // Exclude ambiguous acronyms.
      if (EXCLUDED_PATTERNS.has(raw)) continue;

      entries.push({ pattern: raw, content: { type: "glossary", data: term } });
    }
  }

  // Add zone shorthands (Z1-Z6).  These are only 2 characters but are
  // unambiguous in a running context, so we bypass the length filter.
  for (const [shorthand, termId] of Object.entries(ZONE_SHORTHAND_MAP)) {
    const zoneTerm = terms.find((t) => t.id === termId);
    if (zoneTerm) {
      entries.push({
        pattern: shorthand,
        content: { type: "glossary", data: zoneTerm },
      });
    }
  }

  // ----- Article patterns (added after glossary for lower priority) --------

  for (const article of articles) {
    const patterns = ARTICLE_MATCH_PATTERNS[article.slug];
    if (!patterns) continue;

    // Collect patterns for the current language.
    const langPatterns = lang === "en" ? patterns.en : patterns.fr;

    for (const raw of langPatterns) {
      // Filter out patterns shorter than 3 characters.
      if (raw.length < 3) continue;

      entries.push({
        pattern: raw,
        content: { type: "article", data: article },
      });
    }
  }

  // Sort longest patterns first so "zones d'entraînement" matches before
  // "zones", and "VO2max" matches before "VO2".
  entries.sort((a, b) => b.pattern.length - a.pattern.length);

  // Build lookup map and regex alternation.
  const alternatives: string[] = [];

  for (const { pattern, content } of entries) {
    const key = pattern.toLowerCase();
    // First writer wins -- keeps the longest / most-specific mapping.
    if (!lookup.has(key)) {
      lookup.set(key, content);
    }
    alternatives.push(escapeRegex(pattern));
  }

  // Construct a single word-boundary regex.
  // If there are no patterns the regex should never match.
  const regexSource =
    alternatives.length > 0 ? `\\b(${alternatives.join("|")})\\b` : "(?!)";
  const regex = new RegExp(regexSource, "gi");

  return { regex, lookup };
}

// ---------------------------------------------------------------------------
// Finder
// ---------------------------------------------------------------------------

/** Extract a stable identifier from a MatchableContent value. */
function contentId(c: MatchableContent): string {
  return c.type === "glossary" ? `glossary:${c.data.id}` : `article:${c.data.slug}`;
}

/**
 * Scan `text` and return every content match found, de-duplicated by content
 * identity and free of overlapping ranges.
 *
 * @param text    - Source text to scan.
 * @param matcher - A ContentMatcher created by `buildContentMatcher`.
 */
export function findContentMatches(
  text: string,
  matcher: ContentMatcher,
): ContentMatch[] {
  const { regex, lookup } = matcher;

  // Reset the global regex state.
  regex.lastIndex = 0;

  // Collect raw matches.
  const raw: ContentMatch[] = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    const matchedText = m[0];
    const key = matchedText.toLowerCase();
    const content = lookup.get(key);
    if (!content) continue;

    // Acronym case-sensitivity check: if the lookup pattern is an
    // all-uppercase acronym, the matched text in the source must also be
    // uppercase (prevents "Via" matching "VIA"-style acronyms).
    if (content.type === "glossary") {
      const term = content.data;
      if (term.acronym && term.acronym.toLowerCase() === key) {
        if (isAllUppercase(term.acronym) && !isAllUppercase(matchedText)) {
          continue;
        }
      }
    }

    // Same check for zone shorthands (Z1-Z6 must be uppercase in source).
    const zoneId = ZONE_SHORTHAND_MAP[matchedText.toUpperCase()];
    if (
      zoneId &&
      matchedText.length === 2 &&
      matchedText !== matchedText.toUpperCase()
    ) {
      continue;
    }

    raw.push({
      content,
      start: m.index,
      end: m.index + matchedText.length,
      matchedText,
    });
  }

  // De-duplicate: keep only the first occurrence of each unique content
  // identity and reject overlapping ranges.
  const seen = new Set<string>();
  const kept: ContentMatch[] = [];

  for (const match of raw) {
    const id = contentId(match.content);

    // Skip if this content was already linked.
    if (seen.has(id)) continue;

    // Skip if the range overlaps with a previously kept match.
    const overlaps = kept.some(
      (prev) => match.start < prev.end && match.end > prev.start,
    );
    if (overlaps) continue;

    seen.add(id);
    kept.push(match);
  }

  // Return sorted by position (they should already be, but be explicit).
  kept.sort((a, b) => a.start - b.start);

  return kept;
}

// ---------------------------------------------------------------------------
// Backward compatibility
// ---------------------------------------------------------------------------

/** @deprecated Use `ContentMatcher` instead. */
export type TermMatcher = ContentMatcher;

/** @deprecated Use `ContentMatch` instead. */
export type TermMatch = ContentMatch;

/** @deprecated Use `buildContentMatcher` instead. */
export const buildTermMatcher = (terms: GlossaryTerm[], lang: string) =>
  buildContentMatcher(terms, [], lang);

/** @deprecated Use `findContentMatches` instead. */
export const findTermMatches = findContentMatches;
