// src/components/domain/methodology/MethodologyTabs.tsx
// Shared sub-navigation across the methodology surface: the zone atlas, the
// polarised-model article, the glossary and the sources page all belong to
// the same reading path, so they carry the same tab row for wayfinding.

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/methodology", key: "sixZonesTab" },
  { to: "/methodology/polarise", key: "polariseTab" },
  { to: "/glossary", key: "glossaryTab" },
  { to: "/methodology/sources", key: "sourcesTab" },
] as const;

export function MethodologyTabs() {
  const { t } = useTranslation("content");

  return (
    <nav
      aria-label={t("methodology.tabsLabel")}
      className="flex gap-5 overflow-x-auto border-b border-filet font-mono text-[11px] tracking-[0.08em] uppercase"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/methodology"}
          className={({ isActive }) =>
            cn(
              "shrink-0 whitespace-nowrap border-b-2 pb-2.5 pt-1 -mb-px transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )
          }
        >
          {t(`methodology.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
