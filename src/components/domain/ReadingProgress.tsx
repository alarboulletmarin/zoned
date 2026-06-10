import { useState, useEffect, useRef } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const rafId = useRef(0);

  useEffect(() => {
    // Layout read (getBoundingClientRect) batched into rAF so it happens
    // once per frame after style/layout settle, instead of forcing a
    // synchronous reflow on every scroll event.
    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const article = document.querySelector("article");
        if (!article) return;

        const rect = article.getBoundingClientRect();
        const articleTop = rect.top + window.scrollY;
        const articleHeight = rect.height;
        const scrolled = window.scrollY - articleTop;
        const percentage =
          Math.min(Math.max(scrolled / (articleHeight - window.innerHeight), 0), 1) * 100;
        setProgress(percentage);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-12 left-0 right-0 z-40 h-0.5 bg-muted">
      {/* scaleX, not width: keeps the 150ms smoothing on the compositor */}
      <div
        className="h-full w-full bg-primary origin-left transition-transform duration-150 ease-out"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression de lecture"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
