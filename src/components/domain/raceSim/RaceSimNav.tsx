import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Minimize2, Maximize2 } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface RaceSimNavItem {
  id: string;
  label: string;
}

/**
 * Anchor navigation over the plan sections, with scroll-spy.
 *
 * `rail` sits in the sticky left column on desktop; `chips` is the horizontal
 * strip that sticks under the top bar on mobile. Jumping also opens the target
 * section — landing on a collapsed header would be a dead end.
 */
export function RaceSimNav({
  items,
  activeIdOverride,
  onJump,
  onToggleAll,
  allOpen,
  variant = "rail",
  className,
}: {
  items: RaceSimNavItem[];
  /** Forces the highlight (used while a programmatic scroll is in flight). */
  activeIdOverride?: string | null;
  onJump: (id: string) => void;
  onToggleAll?: () => void;
  allOpen?: boolean;
  variant?: "rail" | "chips";
  className?: string;
}) {
  const { t } = useTranslation("simulator");
  const [activeId, setActiveId] = useState<string | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const ids = items.map((i) => i.id).join("|");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((prev, curr) =>
          prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr,
        );
        setActiveId(topmost.target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    for (const id of ids.split("|")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  const current = activeIdOverride ?? activeId;

  // Keep the active chip in view on mobile — an off-screen highlight is no
  // better than no highlight.
  useEffect(() => {
    if (variant !== "chips" || !current) return;
    const chip = chipsRef.current?.querySelector<HTMLElement>(
      `[data-nav-chip="${current}"]`,
    );
    chip?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [current, variant]);

  if (items.length === 0) return null;

  if (variant === "chips") {
    return (
      <nav
        aria-label={t("nav.title")}
        ref={chipsRef}
        className={cn(
          "-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-nav-chip={item.id}
            onClick={() => onJump(item.id)}
            aria-current={current === item.id ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              current === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label={t("nav.title")} className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
          {t("nav.title")}
        </p>
        {onToggleAll && (
          <button
            type="button"
            onClick={onToggleAll}
            className="inline-flex items-center gap-1 rounded text-[0.6875rem] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {allOpen ? (
              <Minimize2 className="size-3" />
            ) : (
              <Maximize2 className="size-3" />
            )}
            {allOpen ? t("nav.collapseAll") : t("nav.expandAll")}
          </button>
        )}
      </div>
      <ul className="space-y-0.5 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onJump(item.id)}
              aria-current={current === item.id ? "true" : undefined}
              className={cn(
                "-ml-px block w-full border-l-2 py-1.5 pl-3 text-left text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                current === item.id
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
