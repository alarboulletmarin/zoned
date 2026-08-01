/**
 * Theme — the one place a preference becomes a painted theme.
 *
 * Three preferences, not two: `light`, `dark` and `system`. The distinction
 * matters because `system` has to keep following the OS *after* the choice is
 * made. What existed before was a binary toggle plus a "has the user ever
 * touched it" flag, so the first tap on the sun/moon button killed OS
 * following for good, with no way back.
 *
 * The preference lives in `localStorage["zoned-theme"]` as a bare string, and
 * that shape is load-bearing: the inline script in `index.html` reads it before
 * the first paint to avoid a flash of the wrong theme, and it can only afford
 * one `getItem` — no JSON, no async, no imports. Anything unrecognised (an
 * older build, a hand-edited backup, a corrupted value) resolves to `system`.
 *
 * The resolved theme is written to the DOM as Tailwind's `.dark` class, which
 * `@custom-variant dark (&:is(.dark *))` in `src/styles/index.css` and the
 * `.dark` block in `src/styles/themes.css` both key off.
 */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "zoned-theme";

/**
 * Browser-chrome colour per resolved theme — mirrors `--background` in
 * `src/styles/themes.css` (`:root` for light, `.dark` for dark).
 *
 * Duplicated in the inline boot script in `index.html`, which cannot import
 * from here. Change one, change the other.
 */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: "#f8fafc",
  dark: "#0b1120",
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Reads the OS preference. `false` wherever `matchMedia` is unavailable. */
export function prefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * `systemDark` is a parameter rather than a call to `prefersDark()` so this
 * stays pure — `bun test` runs without a DOM, and this is the branch worth
 * testing.
 */
export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  if (preference === "system") return systemDark ? "dark" : "light";
  return preference;
}

export function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : "system";
  } catch {
    // Private mode can throw on access. Following the OS is the right default
    // for a browser that will not remember the answer anyway.
    return "system";
  }
}

export function storePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Private mode, full quota: the theme still applies for this session, it
    // just will not survive a reload. Nothing worth interrupting the user for.
  }
}

/** The resolved theme currently on the document, to skip redundant writes. */
let applied: ResolvedTheme | null = null;

/**
 * Writes the resolved theme to `<html>`. Four things, and all four count:
 *
 * 1. The `.dark` class — what the CSS reads. Always via `classList.toggle`,
 *    never `className =`: the same element also carries `palette-deuteranopia`
 *    / `palette-tritanopia`, which `palettes-a11y.css` combines as
 *    `.palette-*.dark`.
 * 2. `style.colorScheme` — tells the browser to render *native* controls
 *    (scrollbars, `<input type="date">`, autofill, `<select>`) in the right
 *    shade. Its absence is why a dark Zoned still had white scrollbars.
 * 3. The `theme-color` meta without a `media` attribute — the system bar colour
 *    on mobile. See the comment in `index.html`: a `media`-scoped meta follows
 *    the OS and would contradict an explicit choice.
 * 4. `data-switching-theme`, which `themes.css` uses to zero every transition
 *    for the duration of the swap. Only on an actual change, so a repaint that
 *    resolves to the same theme costs nothing.
 */
export function applyResolvedTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const changed = applied !== null && applied !== resolved;
  applied = resolved;

  if (changed) root.setAttribute("data-switching-theme", "");

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute("content", THEME_COLOR[resolved]);

  if (changed) {
    // Two frames: one for the class to take effect, one for the browser to
    // paint it, before transitions are allowed back.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.removeAttribute("data-switching-theme");
      });
    });
  }
}

/**
 * Subscribes to the OS theme. Returns the unsubscribe function, shaped for
 * `useSyncExternalStore`.
 */
export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    media.removeEventListener("change", onChange);
  };
}
