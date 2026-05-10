import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NUTRITION_ICONS } from "../icons";
import type { RaceWeekDay } from "@/data/nutrition/types";

interface Props {
  days: RaceWeekDay[];
}

export function RaceWeekTimeline({ days }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div
      role="region"
      aria-label={t("hub.raceWeek.timelineLabel")}
      className="relative -mx-4 max-w-[100vw] overflow-x-auto overscroll-x-contain pb-2 snap-x snap-mandatory px-4 lg:mx-0 lg:max-w-none lg:px-0 lg:overflow-visible"
    >
      <ol className="flex w-max gap-3 lg:w-auto lg:grid lg:grid-cols-8 lg:gap-2">
        {days.map((day, idx) => {
          const Icon = NUTRITION_ICONS[day.iconName];
          const isRaceDay = day.day === "j0";
          return (
            <li
              key={day.day}
              className={cn(
                "snap-start shrink-0 w-[200px] lg:w-auto",
                "flex flex-col gap-2 rounded-xl border p-3",
                isRaceDay
                  ? "bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent dark:from-rose-500/25 border-rose-500/40"
                  : "bg-muted/30 border-border/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    isRaceDay
                      ? "bg-rose-500 text-white"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  )}
                >
                  {t(`hub.raceWeek.dayLabels.${day.day}`)}
                </span>
                <Icon
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-sm font-semibold leading-tight">
                {t(day.titleKey)}
              </h3>
              <p className="text-xs text-muted-foreground">{t(day.detailKey)}</p>
              <span className="sr-only">
                {t("hub.raceWeek.stepLabel", { current: idx + 1, total: days.length })}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
