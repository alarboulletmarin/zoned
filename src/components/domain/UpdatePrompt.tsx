import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";

import { RefreshCw, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { applyWaitingUpdate, watchForegroundUpdates } from "@/lib/swUpdate";

/**
 * The service worker is registered in `prompt` mode: a new version installs in
 * the background, waits, and never replaces the running app without being
 * asked. Zoned keeps everything in the browser, plans, custom workouts,
 * simulations, so a reload in the middle of an edit would cost real work.
 *
 * The button below is the only code path in the app that reloads. Everything
 * else, including the check on returning to the foreground, only ever moves the
 * moment this banner appears earlier.
 *
 * Le rechargement est le nôtre, pas celui du plugin (`applyWaitingUpdate`,
 * lib/swUpdate.ts dit pourquoi) : le sien attend un `controllerchange` que
 * le nouveau worker n'émet pas pour une page qu'aucun worker ne contrôlait,
 * et il ignore les mises à jour trouvées par le retour au premier plan. Le
 * bouton activait alors bien la nouvelle version, et la page ne bougeait
 * pas, bandeau compris. On écoute le worker lui-même : activé, on recharge.
 */
export function UpdatePrompt() {
  const { t } = useTranslation("common");
  const registration = useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, r) {
      registration.current = r ?? null;
    },
  });

  // The registration is read through a getter, not captured: when this effect
  // runs, `onRegisteredSW` has not fired yet and the value is still null.
  useEffect(() => watchForegroundUpdates(() => registration.current), []);

  if (!needRefresh) return null;

  const update = () => {
    applyWaitingUpdate(
      registration.current?.waiting,
      () => {
        // Poste SKIP_WAITING au worker en attente ; l'argument n'est pas lu
        // par le plugin, le rechargement est tenu ici.
        void updateServiceWorker(true);
      },
      () => window.location.reload(),
      (listener) => {
        navigator.serviceWorker?.addEventListener("controllerchange", listener, { once: true });
      },
    );
  };

  const dismiss = () => {
    // Hides the banner only. The waiting worker stays waiting, the app keeps
    // running the version it started on, and the offer comes back next launch.
    setNeedRefresh(false);
  };

  return (
    <div className="zn-prompt" role="status">
      <span aria-hidden="true" className="zn-prompt__glyph">
        <RefreshCw />
      </span>
      <div className="zn-prompt__body">
        <p className="zn-prompt__title">{t("pwa.updateTitle")}</p>
        <p className="zn-prompt__text">{t("pwa.updateAvailable")}</p>
        <div className="zn-prompt__actions">
          <Button size="sm" onClick={update}>
            {t("pwa.update")}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {t("pwa.dismiss")}
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("pwa.dismiss")}
        className="zn-prompt__dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}
