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
          className="flex flex-col gap-1 border-2 border-foreground bg-card p-4"
        >
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
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
