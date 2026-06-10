import { useState, useEffect } from "react";

/**
 * False until the window has fired `load` AND the main thread has gone idle
 * (requestIdleCallback, with a timeout safety net so it always flips).
 *
 * Used to defer non-critical data fetching out of the LCP window: on slow
 * mobile connections the dozen workout-category chunks the landing stats
 * need would otherwise compete for bandwidth with the page chunk, fonts and
 * framer-motion while the hero is still rendering.
 */
export function useIdleAfterLoad(timeout = 2000): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const onIdle = () => {
      if (!cancelled) setReady(true);
    };
    const schedule = () => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(onIdle, { timeout });
      } else {
        // Safari: no requestIdleCallback — small fixed delay past `load`.
        setTimeout(onIdle, 300);
      }
    };
    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
    };
  }, [timeout]);

  return ready;
}
