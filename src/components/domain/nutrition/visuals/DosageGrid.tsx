import { useTranslation } from "react-i18next";
import type { DosageChip } from "@/data/nutrition/types";

interface Props {
  chips: DosageChip[];
}

export function DosageGrid({ chips }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {chips.map((chip) => (
        <div
          key={chip.labelKey}
          className="flex flex-col gap-1 rounded-xl border border-border/50 bg-muted/30 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t(chip.labelKey)}
          </p>
          <p className="text-xl md:text-2xl font-bold tracking-tight">
            {t(chip.valueKey)}
          </p>
          {chip.helperKey && (
            <p className="text-xs text-muted-foreground">{t(chip.helperKey)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
