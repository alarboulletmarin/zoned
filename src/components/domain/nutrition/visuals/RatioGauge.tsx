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
              "relative flex flex-col gap-2 rounded-xl border p-4",
              row.highlight
                ? "border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/25 shadow-sm"
                : "border-border/50 bg-muted/30"
            )}
          >
            {row.highlight && (
              <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {t("hub.carbs.ratios.recommended")}
              </span>
            )}
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t(row.labelKey)}
            </p>
            <p
              className={cn(
                "font-mono text-3xl md:text-4xl font-bold tracking-tight",
                row.highlight ? "text-amber-700 dark:text-amber-300" : "text-foreground"
              )}
            >
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
