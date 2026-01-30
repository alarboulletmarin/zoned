import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X, Loader2, ArrowRight } from "@/components/icons";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCommandPalette } from "./CommandPaletteProvider";
import { SearchResultItem } from "./SearchResultItem";
import { searchWorkouts } from "@/data/workouts";
import type { WorkoutTemplate } from "@/types";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 8;
const DEBOUNCE_MS = 150;

export function CommandPalette() {
  const { t } = useTranslation("common");
  const { isOpen, closePalette } = useCommandPalette();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setHasMore(false);
    }
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure dialog is mounted
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      const allResults = await searchWorkouts(query);
      setResults(allResults.slice(0, MAX_RESULTS));
      setHasMore(allResults.length > MAX_RESULTS);
      setSelectedIndex(0);
      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, results.length]);

  const handleSelect = useCallback(
    (workout: WorkoutTemplate) => {
      navigate(`/workout/${workout.id}`);
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
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          closePalette();
          break;
      }
    },
    [results, selectedIndex, handleSelect, closePalette]
  );

  // Detect OS for shortcut display
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutKey = isMac ? "⌘K" : "Ctrl+K";

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
            {query.trim() && !isLoading && results.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t("search.noResults")}
              </div>
            )}

            {/* Results list */}
            {!isLoading &&
              results.map((workout, index) => (
                <SearchResultItem
                  key={workout.id}
                  workout={workout}
                  isSelected={index === selectedIndex}
                  onClick={() => handleSelect(workout)}
                />
              ))}
          </div>

          {/* Footer with "View all" link */}
          {hasMore && !isLoading && (
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
