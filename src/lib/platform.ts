/** True on macOS / iOS — drives which modifier the shortcut hints display
 *  (⌘ vs Ctrl). Evaluated once per load; during SSR/prerender `navigator`
 *  is absent and the fallback (false → Ctrl) matches the majority case. */
export const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);
