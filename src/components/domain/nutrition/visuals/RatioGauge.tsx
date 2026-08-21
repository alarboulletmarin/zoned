import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { carbRatios } from "@/data/nutrition";

export function RatioGauge() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        {carbRatios.map((row) => (
          <div
            key={row.ratio}
            className={cn(
              "relative flex flex-col gap-2 border-2 p-4",
              row.highlight ? "border-ink bg-ink text-paper" : "border-foreground bg-card"
            )}
          >
            {row.highlight && (
              <span className="absolute -top-3 right-3 bg-accent-acid px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-ink">
                {t("hub.carbs.ratios.recommended")}
              </span>
            )}
            <p
              className={cn(
                "font-mono text-[10px] tracking-[0.1em] uppercase",
                row.highlight ? "text-paper/70" : "text-muted-foreground"
              )}
            >
              {t(row.labelKey)}
            </p>
            <p className="font-mono text-3xl md:text-4xl font-bold tracking-tight">
              {row.ratio}
            </p>
            <p className="text-sm font-semibold">{t(row.capacityKey)}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t("hub.carbs.ratios.footnote")}</p>
    </div>
  );
}
