/**
 * Update detection when the app comes back to the foreground.
 *
 * The browser only re-downloads and re-compares `sw.js` when a page loads. An
 * installed PWA that the user *resumes* — it was backgrounded, not closed —
 * loads no page: no comparison, no waiting worker, no banner, until the
 * browser's own periodic check (~24 h) or a real restart. On a phone that is
 * most sessions.
 *
 * The fix is to ask again whenever the app becomes visible. Asking is safe by
 * construction: `registration.update()` can only ever install a new worker into
 * the `waiting` state. With `registerType: "prompt"` and no `skipWaiting`
 * anywhere, nothing activates it but the button in `UpdatePrompt`.
 *
 * The decision is split from the DOM wiring so it can be tested: `bun test`
 * runs without a document.
 */

/**
 * Two app-switches in a row are one question, not two. Requests for `sw.js`
 * bypass the HTTP cache by default, so an unthrottled listener means a real
 * network round-trip every time the user glances at another app.
 */
export const UPDATE_CHECK_INTERVAL_MS = 60_000;

/**
 * The part of `ServiceWorkerRegistration` that matters here. The resolved value
 * is left open on purpose: the DOM lib types `update()` as `Promise<undefined>`
 * in some versions and `Promise<ServiceWorkerRegistration>` in others, and we
 * do nothing with it either way.
 */
type Updatable = { update: () => Promise<unknown> };

export type UpdateChecker = (visible: boolean) => boolean;

/**
 * Builds a throttled update check. Returns whether it actually asked, which is
 * what the tests assert on.
 *
 * `getRegistration` is a getter, not a value: at the moment a caller subscribes,
 * the service worker has not finished registering, so capturing the value would
 * pin `null` forever.
 *
 * `now` is injectable so the floor can be tested in milliseconds rather than in
 * minutes.
 */
export function createUpdateChecker(
  getRegistration: () => Updatable | null | undefined,
  now: () => number = Date.now,
): UpdateChecker {
  // The page load that just happened already compared `sw.js`.
  let lastCheck = now();

  return (visible: boolean): boolean => {
    if (!visible) return false;

    const at = now();
    if (at - lastCheck < UPDATE_CHECK_INTERVAL_MS) return false;
    lastCheck = at;

    const registration = getRegistration();
    if (!registration) return false;

    // Offline, or the server is unreachable: no unhandled rejection, no error
    // in the console. We will ask again on the next return to the foreground.
    void registration.update().catch(() => {});
    return true;
  };
}

/**
 * Checks for an update whenever the document becomes visible, and hourly for a
 * tab that is simply left open. Both paths share one checker, so they share one
 * throttle. Returns the unsubscribe function.
 */
export function watchForegroundUpdates(
  getRegistration: () => Updatable | null | undefined,
  now: () => number = Date.now,
): () => void {
  if (typeof document === "undefined") return () => {};

  const check = createUpdateChecker(getRegistration, now);
  const onVisibilityChange = (): void => {
    check(document.visibilityState === "visible");
  };
  const timer = setInterval(onVisibilityChange, 60 * 60 * 1000);

  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
