import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./i18n";

/* The shell holds for one full stride before it hands over: --rc-start (400ms,
   the rule drawing itself) plus --rc-dur (660ms, the six-frame cycle), both
   declared in index.html.

   This is not a preference, it fixes a defect. The shell used to be dismissed
   on the first frame after the bundle ran; with the runner deliberately held
   back 400ms so the ground is drawn first, a warm service-worker load executed
   the bundle well under that — and the figure never took a single step. Nobody
   ever saw the animation, not "barely".

   src/assets/doodles/frames.test.ts asserts this equals --rc-start + --rc-dur,
   so retuning the cadence can never leave the stride cut in half. */
const SHELL_HOLD_MS = 1060;

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

/* Hide the shell once the app has mounted AND the stride is over.
   `performance.now()` counts from the start of navigation, which is within a
   few milliseconds of when the shell first painted and its animations began,
   so what is left to wait is the difference — never the full duration. A slow
   load has already spent it and hands over immediately: this is a MINIMUM, it
   completes the wait rather than adding to it.

   A timer rather than an `animationend` on the shell: CSS animations pause in a
   backgrounded tab, the event would never fire, and the shell would still be
   there when the tab came back.

   Under prefers-reduced-motion nothing is held. The figure is frozen on pose 1,
   so there is nothing to watch, and a minimum display time would be delay
   bought for no one. */
const holdsStill =
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const remaining = holdsStill
  ? 0
  : Math.max(0, SHELL_HOLD_MS - performance.now());

if (remaining === 0) requestAnimationFrame(hideLoadingShell);
else window.setTimeout(hideLoadingShell, remaining);

// The service worker is registered by <UpdatePrompt> (src/components/domain),
// which owns the update banner. It used to be registered here, with a rule that
// silently reloaded the page when an update arrived within 10s of load — a
// reload nobody asked for, on an app whose data is entirely local. Nothing
// reloads now but the button in that banner.
