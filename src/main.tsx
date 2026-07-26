import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./i18n";

// Hide loading shell once React mounts
const hideLoadingShell = () => {
  const shell = document.getElementById("loading-shell");
  if (shell) shell.classList.add("hidden");
};

// index.html ships static SEO tags for crawlers that never run JS. React 19
// auto-hoists the <SEOHead> tags but does not dedupe <meta>, so drop the
// static ones before mounting to avoid two og:title, two descriptions, etc.
document.querySelectorAll("[data-default-seo]").forEach((el) => el.remove());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Hide shell after first paint
requestAnimationFrame(hideLoadingShell);

// PWA service worker registration.
// Strategy: auto-reload silently when an update is detected within the first
// few seconds (typical refresh case — user expects fresh content). Otherwise
// surface the banner so we don't interrupt an in-flight action.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const APP_LOADED_AT = Date.now();
  const SILENT_RELOAD_WINDOW_MS = 10_000;
  const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

  import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        const elapsed = Date.now() - APP_LOADED_AT;
        if (elapsed < SILENT_RELOAD_WINDOW_MS) {
          updateSW(true);
          return;
        }
        window.dispatchEvent(new CustomEvent("zoned-sw-update"));
        (window as any).__zonedApplyUpdate = () => updateSW(true);
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        const checkForUpdate = () => {
          if (registration.installing || !navigator.onLine) return;
          registration.update().catch(() => {});
        };
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdate();
        });
        setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
      },
    });
  });
}
