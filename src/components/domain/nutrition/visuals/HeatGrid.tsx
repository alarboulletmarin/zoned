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
          <div key={p.titleKey} className="flex flex-col gap-2 border-2 border-foreground bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex size-9 items-center justify-center bg-secondary">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <span className="font-mono px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-filet">
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
