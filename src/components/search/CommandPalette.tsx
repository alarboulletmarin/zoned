import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X, Loader2, ArrowRight, BookOpen, Book, Dumbbell } from "@/components/icons";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCommandPalette } from "./CommandPaletteProvider";
import { SearchResultItem } from "./SearchResultItem";
import { unifiedSearch, type UnifiedSearchResult, type UnifiedSearchResults } from "@/lib/unified-search";
import { getWorkoutById } from "@/data/workouts";
import type { WorkoutTemplate } from "@/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 150;
const MAX_PER_TYPE = 5;

type FlatItem =
  | { kind: "header"; label: string; icon: React.ComponentType<{ className?: string }> }
  | { kind: "workout"; workout: WorkoutTemplate; result: UnifiedSearchResult }
  | { kind: "generic"; result: UnifiedSearchResult };

export function CommandPalette() {
  const { t, i18n } = useTranslation("common");
  const { isOpen, closePalette } = useCommandPalette();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnifiedSearchResults | null>(null);
  const [workoutCache, setWorkoutCache] = useState<Map<string, WorkoutTemplate>>(new Map());
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
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      const results = await unifiedSearch(query, i18n.language, MAX_PER_TYPE);
      // Resolve workout templates for the SearchResultItem component
      const cache = new Map<string, WorkoutTemplate>();
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
    if (!searchResults) return { flatItems: [] as FlatItem[], selectableItems: [] as FlatItem[] };

    const items: FlatItem[] = [];

    if (searchResults.workouts.length > 0) {
      items.push({ kind: "header", label: t("search.sections.workouts"), icon: Dumbbell });
      for (const r of searchResults.workouts) {
        const workout = workoutCache.get(r.id);
        if (workout) items.push({ kind: "workout", workout, result: r });
      }
    }

    if (searchResults.articles.length > 0) {
      items.push({ kind: "header", label: t("search.sections.articles"), icon: BookOpen });
      for (const r of searchResults.articles) {
        items.push({ kind: "generic", result: r });
      }
    }

    if (searchResults.glossary.length > 0) {
      items.push({ kind: "header", label: t("search.sections.glossary"), icon: Book });
      for (const r of searchResults.glossary) {
        items.push({ kind: "generic", result: r });
      }
    }

    const selectable = items.filter((i) => i.kind !== "header");
    return { flatItems: items, selectableItems: selectable };
  }, [searchResults, workoutCache, t]);

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

  // Detect OS for shortcut display
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutKey = isMac ? "⌘K" : "Ctrl+K";

  // Track which selectable index each item maps to
  let selectableIdx = -1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePalette()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-[15%] z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2",
            "rounded-lg border bg-background shadow-lg",
            "sm:top-[20%] sm:w-full",
            "max-h-[80vh] flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-200"
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Accessible title (visually hidden) */}
          <DialogTitle className="sr-only">{t("actions.search")}</DialogTitle>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="size-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {isLoading ? (
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {shortcutKey}
              </kbd>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-2" ref={resultsRef}>
            {/* No query - hint */}
            {!query.trim() && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t("search.placeholder")}
              </div>
            )}

            {/* Loading state */}
            {query.trim() && isLoading && (
              <div className="px-3 py-8 text-center">
                <Loader2 className="size-5 mx-auto text-muted-foreground animate-spin" />
              </div>
            )}

            {/* No results */}
            {query.trim() && !isLoading && searchResults && searchResults.total === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t("search.noResults")}
              </div>
            )}

            {/* Results list with section headers */}
            {!isLoading &&
              flatItems.map((item, i) => {
                if (item.kind === "header") {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`header-${i}`}
                      className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Icon className="size-3" />
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

                // Generic result (article or glossary)
                const Icon = item.result.type === "article" ? BookOpen : Book;
                return (
                  <button
                    key={item.result.id}
                    type="button"
                    data-selectable
                    onClick={() => handleNavigate(item.result.url)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md transition-colors",
                      "hover:bg-accent focus:outline-none focus:bg-accent",
                      currentIdx === selectedIndex && "bg-accent"
                    )}
                  >
                    <Icon className="size-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.result.title}</div>
                      {item.result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.result.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Footer with "View all" link */}
          {searchResults && searchResults.workouts.length > 0 && !isLoading && (
            <div className="border-t p-2">
              <button
                type="button"
                onClick={handleViewAll}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm",
                  "text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                )}
              >
                <span>{t("search.viewAll")}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
