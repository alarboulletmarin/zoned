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
      className={cn("zn-segmented", className)}
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
            className="zn-segmented__item zn-viewmode__item"
            data-desktop-only={desktopOnly ? "true" : undefined}
          >
            <Icon size={16} />
            <span className="zn-viewmode__label">{t(labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
