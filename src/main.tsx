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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Hide shell after first paint
requestAnimationFrame(hideLoadingShell);

// PWA service worker registration
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}
