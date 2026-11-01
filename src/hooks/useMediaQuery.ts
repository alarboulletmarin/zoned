import { useState, useEffect } from "react";
import { isServerSnapshot } from "@/prerender/snapshot";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    !isServerSnapshot() && typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
