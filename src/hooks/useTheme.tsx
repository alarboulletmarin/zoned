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
  nextPreference,
  prefersDark,
  readStoredPreference,
  resolveTheme,
  storePreference,
  watchSystemTheme,
} from "@/lib/theme";
import { isServerSnapshot } from "@/prerender/snapshot";

interface ThemeContextValue {
  /** What the user chose. `system` means "keep following the OS". */
  preference: ThemePreference;
  /** What is actually painted right now. */
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Steps system, light, dark, system. */
  cycle: () => void;
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
 * change re-renders only actual `useTheme` consumers, the TopBar button and
 * the settings card, never the page tree.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = isServerSnapshot();
  const [preference, setPreference] = useState<ThemePreference>(() =>
    snapshot ? "system" : readStoredPreference(),
  );
  const [persistReady, setPersistReady] = useState(!snapshot);

  const systemDark = useSyncExternalStore(watchSystemTheme, prefersDark, getServerSnapshot);
  const resolved = resolveTheme(preference, systemDark);

  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (!snapshot) return;
    setPreference(readStoredPreference());
    setPersistReady(true);
  }, [snapshot]);

  useEffect(() => {
    if (!persistReady) return;
    storePreference(preference);
  }, [preference, persistReady]);

  const cycle = useCallback(() => {
    setPreference((current) => nextPreference(current));
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, cycle }),
    [preference, resolved, cycle],
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
