import { useState, useEffect, useCallback } from "react";

/** Body-copy size for long-form reading, in px — the three steps the Zoned
 *  Brut mockup shows behind the "Aa" control. */
export type ReadingSize = "17" | "19" | "22";

const STORAGE_KEY = "zoned-readingSize";
const DEFAULT_SIZE: ReadingSize = "17";
const VALID_SIZES: ReadingSize[] = ["17", "19", "22"];

/**
 * Hook to manage the long-form reading size with localStorage persistence.
 * Same shape as useViewMode / usePlanViewMode.
 */
export function useReadingSize() {
  const [readingSize, setReadingSizeState] = useState<ReadingSize>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_SIZES.includes(stored as ReadingSize)) {
        return stored as ReadingSize;
      }
    } catch {
      // localStorage not available
    }
    return DEFAULT_SIZE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, readingSize);
    } catch {
      // localStorage not available
    }
  }, [readingSize]);

  const setReadingSize = useCallback((size: ReadingSize) => {
    if (VALID_SIZES.includes(size)) {
      setReadingSizeState(size);
    }
  }, []);

  return { readingSize, setReadingSize, sizes: VALID_SIZES };
}
