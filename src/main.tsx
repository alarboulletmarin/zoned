import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./i18n";

/* The shell holds for three full strides before it hands over: --rc-start
   (0ms — the figure runs from the first frame) plus three times --rc-dur
   (660ms, the six-frame cycle), both declared in index.html.

   1980ms is the owner's "two seconds", landed on a whole number of strides so
   the figure is never cut mid-step. It is the one number to move if the
   opening feels long or short; the value below the comment is the only place
   it is written.

   The hold is not a preference, it fixes a defect. The shell used to be
   dismissed on the first frame after the bundle ran, and a warm
   service-worker load executes that bundle in under 200ms — the figure never
   took a single step. Nobody ever saw the animation, not "barely".

   src/assets/doodles/frames.test.ts asserts this is --rc-start plus a WHOLE
   number of --rc-dur cycles, so retuning the cadence can never leave a stride
   cut in half. */
const SHELL_HOLD_MS = 1980;

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

/* Hide the shell once the app has mounted AND the strides are over.
   How much is left is measured against the RUN CYCLE'S OWN CLOCK, not against
   navigation. A CSS animation starts when its element is first rendered, and
   that is a long way after navigationStart — measured at 250ms on a cold
   production preview, not the "few milliseconds" this comment used to claim.
   Holding `SHELL_HOLD_MS` from navigation therefore cut a quarter of a stride
   off the end, which is exactly what the whole-stride arithmetic exists to
   avoid. `currentTime` on the frame's animation is the elapsed animation time,
   so the figure really does finish its last step.

   `performance.now()` remains the fallback for a browser without
   getAnimations, or for the frame where the animation has not started yet.

   A slow load has already spent the time and hands over immediately: this is a
   MINIMUM, it completes the wait rather than adding to it.

   A timer rather than an `animationend` on the shell: CSS animations pause in a
   backgrounded tab, the event would never fire, and the shell would still be
   there when the tab came back.

   Under prefers-reduced-motion nothing is held. The figure is frozen on pose 1,
   so there is nothing to watch, and a minimum display time would be delay
   bought for no one — which is also why a reduce-motion machine sees the app
   appear at once, with no opening at all. */
const holdsStill =
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const cycleTime = () => {
  const frame = document.querySelector(".rc-f--1");
  const played = frame?.getAnimations?.()[0]?.currentTime;
  return typeof played === "number" ? played : performance.now();
};

const remaining = holdsStill ? 0 : Math.max(0, SHELL_HOLD_MS - cycleTime());

if (remaining === 0) requestAnimationFrame(hideLoadingShell);
else window.setTimeout(hideLoadingShell, remaining);

// The service worker is registered by <UpdatePrompt> (src/components/domain),
// which owns the update banner. It used to be registered here, with a rule that
// silently reloaded the page when an update arrived within 10s of load — a
// reload nobody asked for, on an app whose data is entirely local. Nothing
// reloads now but the button in that banner.
