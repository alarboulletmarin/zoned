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
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") ?? false;

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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  };

  const activeHeading = headings.find((h) => h.id === activeId);
  const tocLabel = isEn ? "Table of contents" : "Sommaire";

  if (isMobile) {
    return (
      <div className={cn("mb-6", className)}>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex w-full items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
        >
          <List className="size-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate flex-1 text-left">
            {activeHeading ? activeHeading.text : tocLabel}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground shrink-0 transition-transform",
              mobileOpen && "rotate-180",
            )}
          />
        </button>
        {mobileOpen && (
          <div className="mt-1 rounded-lg border bg-background shadow-md overflow-hidden">
            {headings.map(({ id, text }) => (
              <button
                key={id}
                onClick={() => handleClick(id)}
                className={cn(
                  "block w-full text-left px-4 py-2.5 text-sm transition-colors border-l-2",
                  activeId === id
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
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
    <nav className={cn("space-y-1", className)}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {tocLabel}
      </p>
      {headings.map(({ id, text }) => (
        <button
          key={id}
          onClick={() => handleClick(id)}
          className={cn(
            "block w-full text-left text-sm py-1.5 pl-3 border-l-2 transition-colors",
            activeId === id
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
          )}
        >
          {text}
        </button>
      ))}
    </nav>
  );
}
