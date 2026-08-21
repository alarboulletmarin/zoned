import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NUTRITION_ICONS } from "../icons";
import { VERDICT_CLASSES, AIS_CLASSES } from "../accents";
import type { SupplementEntry } from "@/data/nutrition/types";

interface Props {
  items: SupplementEntry[];
}

export function SupplementGrid({ items }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = NUTRITION_ICONS[item.iconName];
        const verdict = VERDICT_CLASSES[item.verdict];
        const ais = AIS_CLASSES[item.aisCategory];
        const card = (
          <div className="flex h-full flex-col gap-3 border-2 border-foreground bg-card p-4 transition-colors hover:bg-secondary">
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex size-9 shrink-0 items-center justify-center bg-secondary">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center border-2 font-mono text-[11px] font-bold",
                    ais.border,
                    ais.text
                  )}
                  title={t(`hub.supplements.aisLabel.${item.aisCategory}`)}
                >
                  {ais.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                    verdict.border,
                    verdict.text
                  )}
                >
                  <span className={cn("size-1.5", verdict.dot)} aria-hidden="true" />
                  {t(`hub.supplements.verdicts.${item.verdict}`)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-semibold leading-tight">{t(item.nameKey)}</p>
              <p className="text-xs text-muted-foreground">{t(item.rationaleKey)}</p>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-filet">
              <div className="space-y-0.5">
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                  {t("hub.supplements.doseLabel")}
                </p>
                <p className="text-xs font-medium">{t(item.doseKey)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                  {t("hub.supplements.whenLabel")}
                </p>
                <p className="text-xs font-medium">{t(item.whenKey)}</p>
              </div>
            </div>
          </div>
        );

        return item.glossaryTermId ? (
          <Link
            key={item.id}
            to={`/glossary/${item.glossaryTermId}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {card}
          </Link>
        ) : (
          <div key={item.id}>{card}</div>
        );
      })}
    </div>
  );
}
