import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "../icons";
import { womenInsights } from "@/data/nutrition";

export function WomenInsightGrid() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {womenInsights.map((item) => {
        const Icon = NUTRITION_ICONS[item.iconName];
        return (
          <div key={item.titleKey} className="flex gap-3 border-2 border-foreground bg-card p-4">
            <div className="inline-flex size-10 shrink-0 items-center justify-center bg-secondary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold leading-tight">{t(item.titleKey)}</p>
              <p className="text-sm text-muted-foreground">{t(item.detailKey)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
