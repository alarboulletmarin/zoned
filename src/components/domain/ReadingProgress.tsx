import { useState, useEffect } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article");
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const percentage =
        Math.min(Math.max(scrolled / (articleHeight - window.innerHeight), 0), 1) * 100;
      setProgress(percentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-12 left-0 right-0 z-40 h-0.5 bg-muted">
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression de lecture"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
