import { useTranslation } from "react-i18next";
import { gutTraining } from "@/data/nutrition";

export function GutTrainingTimeline() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 p-4 md:p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
        {t("hub.during.gut.heading")}
      </p>
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-2">
        {gutTraining.map((phase, idx) => (
          <li
            key={phase.weekRangeKey}
            className="relative flex flex-col gap-2 rounded-lg bg-background/60 backdrop-blur p-3"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
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
