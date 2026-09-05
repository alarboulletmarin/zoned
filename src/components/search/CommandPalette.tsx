import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  X,
  Loader2,
  ArrowRight,
  BookOpen,
  Book,
  Dumbbell,
  Library,
  Calculator,
  Compass,
  Sparkles,
} from "@/components/icons";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCommandPalette } from "./CommandPaletteProvider";
import { SearchResultItem } from "./SearchResultItem";
import {
  unifiedSearch,
  type SearchResultType,
  type UnifiedSearchResult,
  type UnifiedSearchResults,
} from "@/lib/unified-search";
import { FEATURED_SURFACES, type SurfaceSection } from "@/data/command-surfaces";
import { getWorkoutById } from "@/data/workouts";
import type { AnyWorkoutTemplate } from "@/types";
import { cn } from "@/lib/utils";
import { isMac } from "@/lib/platform";

type IconComponent = React.ComponentType<{ className?: string }>;

/** Icon shown next to a generic result, by result type. */
const TYPE_ICON: Record<SearchResultType, IconComponent> = {
  workout: Dumbbell,
  collection: Library,
  calculator: Calculator,
  guide: Compass,
  article: BookOpen,
  glossary: Book,
  page: Sparkles,
};

/** Maps a static surface section to a result type (for the quick-access list). */
const SURFACE_TYPE: Record<SurfaceSection, SearchResultType> = {
  calculator: "calculator",
  guide: "guide",
  page: "page",
};

const DEBOUNCE_MS = 150;
const MAX_PER_TYPE = 5;

type FlatItem =
  | { kind: "header"; label: string; icon: React.ComponentType<{ className?: string }> }
  | { kind: "workout"; workout: AnyWorkoutTemplate; result: UnifiedSearchResult }
  | { kind: "generic"; result: UnifiedSearchResult };

export function CommandPalette() {
  const { t, i18n } = useTranslation("common");
  const { isOpen, closePalette } = useCommandPalette();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnifiedSearchResults | null>(null);
  const [workoutCache, setWorkoutCache] = useState<Map<string, AnyWorkoutTemplate>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSearchResults(null);
      setSelectedIndex(0);
      setWorkoutCache(new Map());
    }
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      setIsLoading(false);
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      const results = await unifiedSearch(query, i18n.language, MAX_PER_TYPE);
      // Resolve workout templates for the SearchResultItem component
      const cache = new Map<string, AnyWorkoutTemplate>();
      await Promise.all(
        results.workouts.map(async (r) => {
          const w = await getWorkoutById(r.id);
          if (w) cache.set(r.id, w);
        })
      );
      setWorkoutCache(cache);
      setSearchResults(results);
      setSelectedIndex(0);
      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, i18n.language]);

  // Build flat list of selectable items (skip headers for navigation)
  const { flatItems, selectableItems } = useMemo(() => {
    const items: FlatItem[] = [];

    // Empty state: surface a few featured destinations for quick access.
    if (!query.trim()) {
      const en = i18n.language.startsWith("en");
      items.push({ kind: "header", label: t("search.sections.quickAccess"), icon: Sparkles });
      for (const s of FEATURED_SURFACES) {
        items.push({
          kind: "generic",
          result: {
            type: SURFACE_TYPE[s.section],
            id: s.id,
            title: en ? s.titleEn : s.title,
            subtitle: en ? s.subtitleEn : s.subtitle,
            url: s.url,
          },
        });
      }
      const selectable = items.filter((i) => i.kind !== "header");
      return { flatItems: items, selectableItems: selectable };
    }

    if (!searchResults) return { flatItems: [] as FlatItem[], selectableItems: [] as FlatItem[] };

    const addGeneric = (results: UnifiedSearchResult[], label: string, icon: IconComponent) => {
      if (results.length === 0) return;
      items.push({ kind: "header", label, icon });
      for (const r of results) items.push({ kind: "generic", result: r });
    };

    if (searchResults.workouts.length > 0) {
      items.push({ kind: "header", label: t("search.sections.workouts"), icon: Dumbbell });
      for (const r of searchResults.workouts) {
        const workout = workoutCache.get(r.id);
        if (workout) items.push({ kind: "workout", workout, result: r });
      }
    }

    addGeneric(searchResults.collections, t("search.sections.collections"), Library);
    addGeneric(searchResults.calculators, t("search.sections.calculators"), Calculator);
    addGeneric(searchResults.guides, t("search.sections.guides"), Compass);
    addGeneric(searchResults.articles, t("search.sections.articles"), BookOpen);
    addGeneric(searchResults.glossary, t("search.sections.glossary"), Book);
    addGeneric(searchResults.pages, t("search.sections.pages"), Sparkles);

    const selectable = items.filter((i) => i.kind !== "header");
    return { flatItems: items, selectableItems: selectable };
  }, [searchResults, workoutCache, query, i18n.language, t]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectableItems.length > 0 && resultsRef.current) {
      // Find the actual DOM element for the selected item
      const selectableElements = resultsRef.current.querySelectorAll("[data-selectable]");
      const el = selectableElements[selectedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, selectableItems.length]);

  const handleNavigate = useCallback(
    (url: string) => {
      navigate(url);
      closePalette();
    },
    [navigate, closePalette]
  );

  const handleViewAll = useCallback(() => {
    navigate(`/library?search=${encodeURIComponent(query)}`);
    closePalette();
  }, [navigate, query, closePalette]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, selectableItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          {
            const item = selectableItems[selectedIndex];
            if (item && item.kind !== "header") {
              handleNavigate(item.result.url);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          closePalette();
          break;
      }
    },
    [selectableItems, selectedIndex, handleNavigate, closePalette]
  );

  const shortcutKey = isMac ? "⌘K" : "Ctrl+K";

  // Track which selectable index each item maps to
  let selectableIdx = -1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePalette()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="zn-cmdk"
          onKeyDown={handleKeyDown}
        >
          {/* Accessible title (visually hidden) */}
          <DialogTitle className="sr-only">{t("actions.search")}</DialogTitle>

          {/* Search input */}
          <div className="zn-cmdk__field">
            <Search className="zn-cmdk__search" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="zn-cmdk__input"
            />
            {isLoading ? (
              <Loader2 className="zn-cmdk__spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="zn-cmdk__clear"
                aria-label="Effacer la recherche"
              >
                <X />
              </button>
            ) : (
              <kbd className="zn-cmdk__kbd">{shortcutKey}</kbd>
            )}
          </div>

          {/* Results */}
          <div className="zn-cmdk__results" ref={resultsRef} aria-live="polite" aria-atomic="false">
            {/* Loading state */}
            {query.trim() && isLoading && (
              <div className="zn-cmdk__state">
                <Loader2 className="zn-cmdk__spin" />
              </div>
            )}

            {/* No results */}
            {query.trim() && !isLoading && searchResults && searchResults.total === 0 && (
              <div className="zn-cmdk__state" role="status">
                {t("search.noResults")}
              </div>
            )}

            {/* Results list with section headers */}
            {!isLoading &&
              flatItems.map((item, i) => {
                if (item.kind === "header") {
                  const Icon = item.icon;
                  return (
                    <div key={`header-${i}`} className="zn-cmdk__group zn-kicker">
                      <Icon />
                      {item.label}
                    </div>
                  );
                }

                selectableIdx++;
                const currentIdx = selectableIdx;

                if (item.kind === "workout") {
                  return (
                    <div key={item.result.id} data-selectable>
                      <SearchResultItem
                        workout={item.workout}
                        isSelected={currentIdx === selectedIndex}
                        onClick={() => handleNavigate(item.result.url)}
                      />
                    </div>
                  );
                }

                // Generic result (collection, calculator, guide, article, glossary, page)
                const Icon = TYPE_ICON[item.result.type];
                return (
                  <button
                    key={item.result.id}
                    type="button"
                    data-selectable
                    onClick={() => handleNavigate(item.result.url)}
                    className={cn(
                      "zn-cmdk__item",
                      currentIdx === selectedIndex && "zn-cmdk__item--active"
                    )}
                  >
                    <Icon />
                    <div className="zn-fill">
                      <div className="zn-cmdk__item-title zn-truncate">{item.result.title}</div>
                      {item.result.subtitle && (
                        <div className="zn-cmdk__item-sub zn-truncate">{item.result.subtitle}</div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Footer with "View all" link */}
          {searchResults && searchResults.workouts.length > 0 && !isLoading && (
            <div className="zn-cmdk__foot">
              <button type="button" onClick={handleViewAll} className="zn-cmdk__viewall">
                <span>{t("search.viewAll")}</span>
                <ArrowRight />
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
