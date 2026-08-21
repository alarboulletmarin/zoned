import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";

import { X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { watchForegroundUpdates } from "@/lib/swUpdate";

// Package version is injected at build time by Vite via __APP_VERSION__ —
// the version the *running* app was built with, i.e. the one about to be
// replaced. There is no client-side way to know the incoming version's own
// number or changelog entry before the reload swaps the bundle, so the copy
// only ever claims what this build can prove: its own version, plus a link
// to the always-current /changelog for what's new.
declare const __APP_VERSION__: string | undefined;
const APP_VERSION =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0
    ? __APP_VERSION__
    : "dev";

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
      <div className="border-2 border-foreground bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-warning">
              {t("pwa.outdatedEyebrow")}
            </p>
            <p className="font-sans font-bold text-xl uppercase leading-[0.95] tracking-tight mt-1.5">
              {t("pwa.updateTitle")}
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {t("pwa.updateAvailable")}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground mt-2">
              {t("pwa.currentVersion", { version: APP_VERSION })}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Button
                size="sm"
                className="bg-accent-acid text-ink hover:bg-accent-acid/90"
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
            <Link
              to="/changelog"
              className="mt-2.5 inline-block font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("pwa.releaseNotes")} →
            </Link>
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
