import { useState, useEffect, useCallback, type RefObject } from "react";

export function useScrolledPast(ref: RefObject<HTMLElement | null>): boolean {
  const [scrolledPast, setScrolledPast] = useState(false);
  const [el, setEl] = useState<HTMLElement | null>(null);

  // Sync ref.current into state so the observer effect re-runs when the element mounts
  const syncRef = useCallback(() => {
    setEl(ref.current);
  }, [ref]);

  // Re-sync after each render to catch when ref.current becomes available
  useEffect(() => {
    syncRef();
  });

  useEffect(() => {
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Element is "scrolled past" when not intersecting AND scrolled above viewport (top < 0)
        setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return scrolledPast;
}
