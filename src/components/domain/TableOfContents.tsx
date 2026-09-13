import { useState, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { ChevronDown, List } from "@/components/icons";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
}

function extractHeadings(content: string): TocItem[] {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.slice(3).trim();
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      return { id, text };
    });
}

export function TableOfContents({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const handleClick = (id: string) => {
    // Close the dropdown first so it doesn't affect layout
    setMobileOpen(false);

    // Wait for the dropdown to close before scrolling
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        // Header = 48px + some breathing room
        const offset = isMobile ? 80 : 64;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  const activeHeading = headings.find((h) => h.id === activeId);
  const tocLabel = t("toc.title");

  if (isMobile) {
    return (
      <div className={cn("zn-toc-mobile", className)}>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="zn-toc__trigger"
          aria-expanded={mobileOpen}
        >
          <List className="zn-toc__glyph" />
          <span className="zn-fill zn-truncate">
            {activeHeading ? activeHeading.text : tocLabel}
          </span>
          <ChevronDown className="zn-toc__chevron" />
        </button>
        {mobileOpen && (
          <div className="zn-toc__panel">
            {headings.map(({ id, text }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleClick(id)}
                className="zn-toc__item"
                aria-current={activeId === id ? "location" : undefined}
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className={cn("zn-toc", className)}>
      <p className="zn-kicker">{tocLabel}</p>
      {headings.map(({ id, text }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(id)}
          className="zn-toc__item"
          aria-current={activeId === id ? "location" : undefined}
        >
          {text}
        </button>
      ))}
    </nav>
  );
}
