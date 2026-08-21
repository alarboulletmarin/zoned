import { useTranslation } from "react-i18next";
import { Sun, Utensils, Coffee, HeartPulse, Moon } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { proteinTimeline } from "@/data/nutrition";

const ICONS: Array<React.ComponentType<IconProps>> = [Sun, Utensils, Coffee, HeartPulse, Moon];

export function ProteinTimingChart() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="space-y-4">
      <div className="border-2 border-foreground bg-card p-4 md:p-6">
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2">
          {proteinTimeline.map((step, i) => {
            const Icon = ICONS[i] ?? Utensils;
            return (
              <li key={step.labelKey} className="flex flex-col gap-2 border border-filet p-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex size-8 items-center justify-center bg-secondary">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {t(step.labelKey)}
                  </span>
                </div>
                <p className="text-base font-bold leading-tight">{t(step.valueKey)}</p>
                {step.helperKey && (
                  <p className="text-xs text-muted-foreground">{t(step.helperKey)}</p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <p className="text-xs text-muted-foreground">{t("hub.protein.timeline.footnote")}</p>
    </div>
  );
}
