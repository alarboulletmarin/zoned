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
 *
 * Where you are is stated once, off `aria-current`: a vermillon edge in the
 * rail, a full ink inversion on the chip.
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
        className={cn("zn-scroll-x zn-rs-chips", className)}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-nav-chip={item.id}
            onClick={() => onJump(item.id)}
            aria-current={current === item.id ? "true" : undefined}
            className="zn-rs-chip"
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label={t("nav.title")} className={className}>
      <div
        className="zn-row zn-row--split zn-rs-nav__head"
        style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
      >
        <p className="zn-kicker">{t("nav.title")}</p>
        {onToggleAll && (
          <button type="button" onClick={onToggleAll} className="zn-rs-nav__toggle">
            {allOpen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {allOpen ? t("nav.collapseAll") : t("nav.expandAll")}
          </button>
        )}
      </div>
      <ul className="zn-rs-nav__list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onJump(item.id)}
              aria-current={current === item.id ? "true" : undefined}
              className="zn-rs-nav__link"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
