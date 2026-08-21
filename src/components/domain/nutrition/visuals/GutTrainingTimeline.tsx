import { useTranslation } from "react-i18next";
import { gutTraining } from "@/data/nutrition";

export function GutTrainingTimeline() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="border-2 border-foreground bg-card p-4 md:p-6">
      <p className="mb-4 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
        {t("hub.during.gut.heading")}
      </p>
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-2">
        {gutTraining.map((phase, idx) => (
          <li key={phase.weekRangeKey} className="relative flex flex-col gap-2 border border-filet p-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center border-2 border-foreground font-mono text-[11px] font-bold">
                {idx + 1}
              </span>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t(phase.weekRangeKey)}
              </p>
            </div>
            <p className="font-mono text-2xl font-bold tracking-tight">
              {phase.carbsPerHour} <span className="text-sm text-muted-foreground">g/h</span>
            </p>
            <p className="text-xs text-muted-foreground">{t(phase.detailKey)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
