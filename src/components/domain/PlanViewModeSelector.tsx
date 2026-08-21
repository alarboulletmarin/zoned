import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CalendarRange, Calendar, CalendarDays, List } from "@/components/icons";
import type { PlanViewMode } from "@/hooks/usePlanViewMode";

interface PlanViewModeSelectorProps {
  value: PlanViewMode;
  onChange: (mode: PlanViewMode) => void;
  className?: string;
}

const modes: { value: PlanViewMode; icon: typeof CalendarRange; labelKey: string; desktopOnly?: boolean }[] = [
  { value: "calendar", icon: CalendarRange, labelKey: "viewMode.calendar", desktopOnly: true },
  { value: "weekly", icon: Calendar, labelKey: "viewMode.weekly" },
  { value: "monthly", icon: CalendarDays, labelKey: "viewMode.monthly", desktopOnly: true },
  { value: "list", icon: List, labelKey: "viewMode.list" },
];

export function PlanViewModeSelector({
  value,
  onChange,
  className,
}: PlanViewModeSelectorProps) {
  const { t } = useTranslation("plan");

  return (
    <div
      className={cn(
        "flex items-center gap-4 font-mono text-[11px] tracking-[0.1em] uppercase",
        className
      )}
      role="radiogroup"
      aria-label={t("viewMode.label")}
    >
      {modes.map(({ value: mode, icon: Icon, labelKey, desktopOnly }) => {
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
              "items-center gap-1.5 px-2.5 py-1.5 transition-colors",
              desktopOnly ? "hidden md:inline-flex" : "inline-flex",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
