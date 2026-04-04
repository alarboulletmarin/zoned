// src/hooks/useRelatedContent.ts
// Hook to find related content (workouts, articles, glossary terms) for a given source item.

import { useState, useEffect } from "react";
import type { WorkoutTemplate } from "@/types";
import type { ArticleMeta } from "@/data/articles/types";
import type { GlossaryTerm } from "@/data/glossary/types";
import {
  findRelatedContent,
  type ContentRef,
  type RelatedContentResult,
} from "@/lib/content-relationships";
import { loadAllWorkouts } from "@/data/workouts";
import { getAllArticleMeta } from "@/data/articles/metadata";
import { loadAllTerms } from "@/data/glossary";

const EMPTY: RelatedContentResult = { workouts: [], articles: [], glossaryTerms: [] };

export function useRelatedContent(source: ContentRef | null): {
  workouts: WorkoutTemplate[];
  articles: ArticleMeta[];
  glossaryTerms: GlossaryTerm[];
  isLoading: boolean;
} {
  const [result, setResult] = useState<RelatedContentResult>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!source) {
      setResult(EMPTY);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const [allWorkouts, allTerms] = await Promise.all([
        loadAllWorkouts(),
        loadAllTerms(),
      ]);
      const allArticles = getAllArticleMeta();

      if (cancelled) return;

      const related = findRelatedContent(source, allWorkouts, allArticles, allTerms);
      setResult(related);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [source?.type, source?.id]);

  return { ...result, isLoading };
}
