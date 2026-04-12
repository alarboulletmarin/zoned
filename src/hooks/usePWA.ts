import { useState, useEffect, useCallback } from "react";

const DISMISS_KEY = "zoned-pwa-install-dismissed";
const DISMISS_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
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
    const onUpdate = () => setUpdateAvailable(true);

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("zoned-sw-update", onUpdate);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("zoned-sw-update", onUpdate);
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

  const applyUpdate = useCallback(() => {
    const fn = (window as any).__zonedApplyUpdate;
    if (typeof fn === "function") fn();
  }, []);

  return {
    canInstall,
    promptInstall,
    dismissInstall,
    isOnline,
    updateAvailable,
    applyUpdate,
  };
}
