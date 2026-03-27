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
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-muted p-1",
        className
      )}
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
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
