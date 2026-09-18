/**
 * Update detection when the app comes back to the foreground.
 *
 * The browser only re-downloads and re-compares `sw.js` when a page loads. An
 * installed PWA that the user *resumes*, it was backgrounded, not closed,
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

/**
 * Le worker en attente, vu du bouton Mettre à jour : son état et son
 * évènement, rien d'autre.
 */
export interface WaitingWorker {
  readonly state: string;
  addEventListener(type: "statechange", listener: () => void): void;
}

/**
 * Le délai au bout duquel on recharge sans avoir vu le worker s'activer.
 * L'activation prend quelques dizaines de millisecondes ; quatre secondes,
 * c'est un cas qu'on n'a pas prévu, et un rechargement vaut alors mieux
 * qu'un bouton qui ne fait rien.
 */
export const ACTIVATION_TIMEOUT_MS = 4_000;

/**
 * Active le worker en attente et recharge la page une fois qu'il est en
 * place. C'est le seul rechargement de l'app, et il est ÉCRIT ici parce que
 * celui du plugin ne venait pas.
 *
 * Le plugin recharge sur l'évènement `controllerchange`, à condition que
 * workbox-window tienne le nouveau worker pour une mise à jour de la page.
 * Deux cas courants lui échappent. Une page qu'aucun worker ne contrôlait
 * encore, la première visite d'une origine, un rechargement forcé, une
 * preview Vercel ouverte pour la première fois : le nouveau worker s'active
 * mais ne prend pas cette page, donc `controllerchange` n'arrive jamais. Et
 * une mise à jour trouvée plus de soixante secondes après l'enregistrement,
 * c'est-à-dire chacune de celles que `watchForegroundUpdates` demande, que
 * workbox-window classe comme externe. Dans les deux cas, le bouton activait
 * bien le worker, et la page restait sur l'ancienne version, bandeau compris.
 *
 * Ici, le signal est le worker lui-même : dès qu'il passe à `activated`, la
 * page recharge, et la navigation qui suit est servie par lui, qu'il ait
 * réclamé la page ou non. `controllerchange` reste écouté, il arrive parfois
 * le premier, et un délai borne le tout. Une seule fois, quel que soit le
 * nombre de signaux.
 *
 * Sans worker en attente il n'y a rien à activer : la version qui a valu le
 * bandeau est déjà en place, ou l'a été depuis un autre onglet, et recharger
 * est ce qui la fait apparaître.
 */
export function applyWaitingUpdate(
  waiting: WaitingWorker | null | undefined,
  skipWaiting: () => void,
  reload: () => void,
  onControllerChange: (listener: () => void) => void,
  schedule: (fn: () => void, ms: number) => void = (fn, ms) => {
    setTimeout(fn, ms);
  },
): void {
  let reloaded = false;
  const once = (): void => {
    if (reloaded) return;
    reloaded = true;
    reload();
  };

  if (!waiting) {
    once();
    return;
  }

  waiting.addEventListener("statechange", () => {
    // `redundant` : remplacé par un worker plus neuf, ou échoué. Dans les
    // deux cas la page a quelque chose de nouveau à charger.
    if (waiting.state === "activated" || waiting.state === "redundant") once();
  });
  onControllerChange(once);
  schedule(once, ACTIVATION_TIMEOUT_MS);
  skipWaiting();
}
