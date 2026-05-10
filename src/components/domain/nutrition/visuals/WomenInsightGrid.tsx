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
          <div
            key={item.titleKey}
            className="flex gap-3 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent dark:from-violet-500/20 p-4"
          >
            <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40">
              <Icon
                className="size-5 text-violet-700 dark:text-violet-300"
                aria-hidden="true"
              />
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
