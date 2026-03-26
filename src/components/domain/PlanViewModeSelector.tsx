import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CalendarRange, Calendar, CalendarDays, List } from "@/components/icons";
import type { PlanViewMode } from "@/hooks/usePlanViewMode";

interface PlanViewModeSelectorProps {
  value: PlanViewMode;
  onChange: (mode: PlanViewMode) => void;
  className?: string;
}

const modes: { value: PlanViewMode; icon: typeof CalendarRange; labelKey: string }[] = [
  { value: "calendar", icon: CalendarRange, labelKey: "viewMode.calendar" },
  { value: "weekly", icon: Calendar, labelKey: "viewMode.weekly" },
  { value: "monthly", icon: CalendarDays, labelKey: "viewMode.monthly" },
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
              "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
