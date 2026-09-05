import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "../icons";
import type { RaceWeekDay, RaceWeekDayId } from "@/data/nutrition/types";

interface Props {
  days: RaceWeekDay[];
}

/**
 * The eight days before a race, J-7 to J0.
 *
 * A countdown is an ordered scale, so the day chips climb the zone ink ramp:
 * faint a week out, solid ink on race day. J0 also takes the 2.5px vermillon
 * frame — the system's mark for the one thing that matters here, and a frame
 * rather than a fill, because the page's one vermillon fill is the hero.
 */
const RAMP_STEP: Record<RaceWeekDayId, number> = {
  j7: 1,
  j6: 1,
  j5: 2,
  j4: 2,
  j3: 3,
  j2: 4,
  j1: 5,
  j0: 6,
};

export function RaceWeekTimeline({ days }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div
      role="region"
      aria-label={t("hub.raceWeek.timelineLabel")}
      className="zn-nut-week zn-scroll-x"
    >
      <ol className="zn-nut-week__track">
        {days.map((day, idx) => {
          const Icon = NUTRITION_ICONS[day.iconName];
          const isRaceDay = day.day === "j0";
          return (
            <li
              key={day.day}
              className="zn-nut-card zn-nut-week__day"
              data-emphasis={isRaceDay ? "accent" : undefined}
            >
              <div className="zn-row zn-row--split">
                <span
                  className="zn-nut-week__chip zn-nut-ramp"
                  data-step={RAMP_STEP[day.day]}
                >
                  {t(`hub.raceWeek.dayLabels.${day.day}`)}
                </span>
                <Icon className="zn-nut-week__icon" aria-hidden="true" />
              </div>
              <h3 className="zn-nut-card__title">{t(day.titleKey)}</h3>
              <p className="zn-nut-card__text">{t(day.detailKey)}</p>
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
