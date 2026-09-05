import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutGrid, Grid3x3, List, Rows3 } from "@/components/icons";
import type { ViewMode } from "@/hooks/useViewMode";

interface ViewModeSelectorProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const modes: { value: ViewMode; icon: typeof LayoutGrid; labelKey: string }[] =
  [
    { value: "compact", icon: Grid3x3, labelKey: "viewMode.compact" },
    { value: "grid", icon: LayoutGrid, labelKey: "viewMode.grid" },
    { value: "focus", icon: Rows3, labelKey: "viewMode.focus" },
    { value: "list", icon: List, labelKey: "viewMode.list" },
  ];

export function ViewModeSelector({
  value,
  onChange,
  className,
}: ViewModeSelectorProps) {
  const { t } = useTranslation("library");

  return (
    <div
      className={cn("zn-segmented", className)}
      role="radiogroup"
      aria-label={t("viewMode.label")}
    >
      {modes.map(({ value: mode, icon: Icon, labelKey }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={t(labelKey)}
            onClick={() => onChange(mode)}
            className="zn-segmented__item zn-viewmode__item"
            data-icon-only="true"
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
