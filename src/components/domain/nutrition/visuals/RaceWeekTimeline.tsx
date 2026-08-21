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
                "flex flex-col gap-2 border-2 p-3",
                isRaceDay
                  ? "border-ink bg-ink text-paper"
                  : "border-foreground bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    isRaceDay
                      ? "bg-accent-acid text-ink"
                      : "border border-filet text-muted-foreground"
                  )}
                >
                  {t(`hub.raceWeek.dayLabels.${day.day}`)}
                </span>
                <Icon
                  className={cn("size-3.5", isRaceDay ? "text-paper" : "text-muted-foreground")}
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-sm font-semibold leading-tight">
                {t(day.titleKey)}
              </h3>
              <p className={cn("text-xs", isRaceDay ? "text-paper/75" : "text-muted-foreground")}>
                {t(day.detailKey)}
              </p>
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
