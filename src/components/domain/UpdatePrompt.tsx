import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";

import { RefreshCw, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { watchForegroundUpdates } from "@/lib/swUpdate";

interface Props {
  /** Lift above the install card when that one is showing too. */
  stacked?: boolean;
}

/**
 * The service worker is registered in `prompt` mode: a new version installs in
 * the background, waits, and never replaces the running app without being
 * asked. Zoned keeps everything in the browser — plans, custom workouts,
 * simulations — so a reload in the middle of an edit would cost real work.
 *
 * The button below is the only code path in the app that reloads. Everything
 * else, including the check on returning to the foreground, only ever moves the
 * moment this banner appears earlier.
 */
export function UpdatePrompt({ stacked = false }: Props) {
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

  const dismiss = () => {
    // Hides the banner only. The waiting worker stays waiting, the app keeps
    // running the version it started on, and the offer comes back next launch.
    setNeedRefresh(false);
  };

  return (
    <div
      className={cn(
        "fixed left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300",
        stacked ? "bottom-28" : "bottom-4",
      )}
      role="status"
    >
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <RefreshCw className="size-5 mt-0.5 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{t("pwa.updateTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("pwa.updateAvailable")}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  void updateServiceWorker(true);
                }}
              >
                {t("pwa.update")}
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                {t("pwa.dismiss")}
              </Button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label={t("pwa.dismiss")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
