import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TocItem {
  id: string;
  label: string;
}

interface Props {
  items: TocItem[];
}

export function NutritionTOC({ items }: Props) {
  const { t } = useTranslation("nutrition");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((prev, curr) =>
          prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
        );
        setActiveId(topmost.target.id);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={t("hub.toc.heading")} className="zn-nut-toc">
      <p className="zn-kicker">{t("hub.toc.heading")}</p>
      <ul className="zn-nut-toc__list">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              {/* Where you are is a full ink inversion, not a faint tint. */}
              <a
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                className="zn-nut-toc__link"
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
