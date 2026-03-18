import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useGlossary } from "@/hooks/useGlossary";
import { getAllArticleMeta } from "@/data/articles/metadata";
import { buildContentMatcher, type ContentMatcher } from "@/lib/content-matcher";

const GlossaryMatcherContext = createContext<ContentMatcher | null>(null);

export function GlossaryMatcherProvider({ children }: { children: ReactNode }) {
  const { terms, isLoading } = useGlossary();
  const { i18n } = useTranslation();
  const articles = useMemo(() => getAllArticleMeta(), []);

  const matcher = useMemo(
    () =>
      !isLoading && terms.length > 0
        ? buildContentMatcher(terms, articles, i18n.language)
        : null,
    [terms, isLoading, articles, i18n.language],
  );

  return (
    <GlossaryMatcherContext.Provider value={matcher}>
      {children}
    </GlossaryMatcherContext.Provider>
  );
}

export function useGlossaryMatcher(): ContentMatcher | null {
  return useContext(GlossaryMatcherContext);
}
