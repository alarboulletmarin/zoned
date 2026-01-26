import { useEffect, type RefObject } from "react";

interface UseKeyboardShortcutsOptions {
  searchRef: RefObject<HTMLInputElement | null>;
  onCloseMobileFilters?: () => void;
}

/**
 * Hook to handle keyboard shortcuts for the library page
 * - `/` -> focus search input
 * - `Escape` -> blur search / close mobile filters
 */
export function useKeyboardShortcuts({
  searchRef,
  onCloseMobileFilters,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (event.key === "/") {
        // Focus search only if not already typing
        if (!isTyping) {
          event.preventDefault();
          searchRef.current?.focus();
        }
      } else if (event.key === "Escape") {
        // Blur search if focused
        if (document.activeElement === searchRef.current) {
          searchRef.current?.blur();
        }
        // Close mobile filters
        onCloseMobileFilters?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchRef, onCloseMobileFilters]);
}
