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

// The service worker is registered by <UpdatePrompt> (src/components/domain),
// which owns the update banner. It used to be registered here, with a rule that
// silently reloaded the page when an update arrived within 10s of load — a
// reload nobody asked for, on an app whose data is entirely local. Nothing
// reloads now but the button in that banner.
