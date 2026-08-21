// src/components/domain/methodology/MethodologyTabs.tsx
// Shared sub-navigation across the methodology surface: the zone atlas, the
// polarised-model article, the pace-calibration page, the glossary and the
// sources page all belong to the same reading path, so they carry the same
// tab row for wayfinding. The row also carries one action — printing the
// personal zone atlas as a PDF.

import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { exportZonesAtlasToPDF } from "@/lib/export/zonesAtlasPdf";
import { loadUserZonePrefs } from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/methodology", key: "sixZonesTab" },
  { to: "/methodology/polarise", key: "polariseTab" },
  { to: "/methodology/allures", key: "pacesTab" },
  { to: "/glossary", key: "glossaryTab" },
  { to: "/methodology/sources", key: "sourcesTab" },
] as const;

export function MethodologyTabs() {
  const { t } = useTranslation("content");
  const { settings } = useSettings();
  const navigate = useNavigate();

  // The atlas PDF is the visitor's own zone table: with no VMA and no FCmax
  // stored there is nothing personal to print, so the action sends them to
  // the page where those two values are set.
  const handlePrintAtlas = () => {
    const prefs = loadUserZonePrefs();
    if (!prefs || (!prefs.vma && !prefs.fcMax)) {
      void navigate("/me/zones");
      return;
    }
    void exportZonesAtlasToPDF(prefs, settings.unitSystem);
  };

  return (
    <div className="flex items-center gap-5 border-b border-filet">
      <nav
        aria-label={t("methodology.tabsLabel")}
        className="flex gap-5 overflow-x-auto font-mono text-[11px] tracking-[0.08em] uppercase"
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

      <button
        type="button"
        onClick={handlePrintAtlas}
        className="ml-auto shrink-0 whitespace-nowrap border border-filet px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        {t("methodology.printAtlas")}
      </button>
    </div>
  );
}
