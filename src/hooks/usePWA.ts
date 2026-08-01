import { useState, useEffect, useCallback } from "react";

const DISMISS_KEY = "zoned-pwa-install-dismissed";
const DISMISS_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Install prompt and connectivity. Service worker *updates* are not here:
 * they belong to <UpdatePrompt>, which owns the registration and the banner.
 * This hook used to carry them, through a `zoned-sw-update` CustomEvent and a
 * `window.__zonedApplyUpdate` global — a seam that only existed because the
 * worker was registered outside the component tree.
 */
export function usePWA() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installDismissed, setInstallDismissed] = useState(() => {
    const ts = localStorage.getItem(DISMISS_KEY);
    return ts ? Date.now() - Number(ts) < DISMISS_TTL : false;
  });

  useEffect(() => {
    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const canInstall = !!installEvent && !installDismissed;

  const promptInstall = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstallEvent(null);
  }, [installEvent]);

  const dismissInstall = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setInstallDismissed(true);
  }, []);

  return {
    canInstall,
    promptInstall,
    dismissInstall,
    isOnline,
  };
}
