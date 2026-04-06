import { useState, useEffect, useCallback, useRef, type RefObject } from "react";

/**
 * Scroll listener with hysteresis — two different thresholds prevent oscillation
 * caused by layout shifts (sticky bar mounting) and mobile address bar resizing.
 *
 * Show: element bottom goes above viewport (bottom < 0)
 * Hide: element bottom returns well into viewport (bottom > 150px)
 * Dead zone (0–150px): no state change — absorbs layout shift (~50px) + address bar (~85px)
 */
export function useScrolledPast(ref: RefObject<HTMLElement | null>): boolean {
  const [scrolledPast, setScrolledPast] = useState(false);
  const rafId = useRef(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;

      const { bottom } = el.getBoundingClientRect();

      setScrolledPast((prev) => {
        if (!prev && bottom < 0) return true;
        if (prev && bottom > 150) return false;
        return prev;
      });
    });
  }, [ref]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return scrolledPast;
}
