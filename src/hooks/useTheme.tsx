import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  type ResolvedTheme,
  type ThemePreference,
  applyResolvedTheme,
  prefersDark,
  readStoredPreference,
  resolveTheme,
  storePreference,
  watchSystemTheme,
} from "@/lib/theme";

interface ThemeContextValue {
  /** What the user chose. `system` means "keep following the OS". */
  preference: ThemePreference;
  /** What is actually painted right now. */
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Flips to the opposite of what is painted, as an explicit choice. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** `useSyncExternalStore` needs one for SSR; Zoned is a pure SPA. */
const getServerSnapshot = (): boolean => false;

/**
 * Owns the theme preference and keeps the document in sync with it.
 *
 * The interesting part is `useSyncExternalStore` over `matchMedia`, which is
 * what makes "I switch my phone to dark and the app follows" work with no
 * polling and no listener to clean up by hand: the OS flips, the
 * `MediaQueryList` emits `change`, React re-reads the snapshot, `resolved`
 * flips, the effect writes the class. It is the same shape `MuscleMap` already
 * uses to observe the class itself.
 *
 * Note the perf property the previous ref-based implementation was written for
 * is preserved. `children` is an element created by the parent, so a preference
 * change re-renders only actual `useTheme` consumers — the TopBar button and
 * the settings card — never the page tree.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference);

  const systemDark = useSyncExternalStore(watchSystemTheme, prefersDark, getServerSnapshot);
  const resolved = resolveTheme(preference, systemDark);

  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    storePreference(preference);
  }, [preference]);

  // Toggling out of `system` has to land on an explicit value, and the one the
  // user expects is the opposite of what they are looking at — not the opposite
  // of the preference, which is not a colour.
  const toggle = useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved]);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
