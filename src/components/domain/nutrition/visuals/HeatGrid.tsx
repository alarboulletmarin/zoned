import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "../icons";
import { heatProtocols } from "@/data/nutrition";

export function HeatGrid() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {heatProtocols.map((p) => {
        const Icon = NUTRITION_ICONS[p.iconName];
        return (
          <div
            key={p.titleKey}
            className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-500/20 p-4"
          >
            <div className="flex items-center gap-2">
              <div className="inline-flex size-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40">
                <Icon
                  className="size-4 text-rose-700 dark:text-rose-300"
                  aria-hidden="true"
                />
              </div>
              <span className="rounded-full bg-rose-100 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                {t(p.durationKey)}
              </span>
            </div>
            <p className="font-semibold leading-tight">{t(p.titleKey)}</p>
            <p className="text-xs text-muted-foreground">{t(p.detailKey)}</p>
          </div>
        );
      })}
    </div>
  );
}
