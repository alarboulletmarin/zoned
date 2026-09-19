import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Activity,
  HeartPulse,
  Leaf,
  Mountain,
  TrendingUp,
  Zap,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { PrebuiltWeek } from "@/data/prebuilt-weeks/types";
import { usePickLang } from "@/lib/i18n-utils";

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Mountain,
  TrendingUp,
  Zap,
  Leaf,
  Activity,
  HeartPulse,
};

/** Total session minutes → hours, one decimal. */
function weekHours(week: PrebuiltWeek): string {
  const min = week.sessions.reduce((acc, s) => acc + s.estimatedDurationMin, 0);
  return (min / 60).toFixed(1);
}

interface PrebuiltWeekCardProps {
  week: PrebuiltWeek;
  /** Router state carried to the detail page (the cockpit's `placeOn`). */
  state?: unknown;
  className?: string;
}

/** One ready-made week in the index. The whole card is the target. */
export function PrebuiltWeekCard({ week, state, className }: PrebuiltWeekCardProps) {
  const { t } = useTranslation("library");
  const pickLang = usePickLang();

  const Icon = ICON_MAP[week.icon] ?? Mountain;

  return (
    <Link
      to={`/weeks/prebuilt/${week.slug}`}
      state={state}
      className={cn("zn-ecard", className)}
    >
      <div className="zn-row" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
        <Icon className="zn-ecard__icon" />
        <span className="zn-kicker zn-kicker--inline">
          {t(`weekly.prebuilt.category.${week.category}`)}
        </span>
      </div>

      <h3 className="zn-ecard__title">{pickLang(week, "name")}</h3>

      <p className="zn-ecard__desc">{pickLang(week, "description")}</p>

      <div className="zn-ecard__meta">
        <span className="zn-ecard__fact">
          {t("weekly.prebuilt.sessions", { count: week.sessions.length })}
        </span>
        <span className="zn-ecard__fact">
          {t("weekly.prebuilt.volume", { hours: weekHours(week) })}
        </span>
      </div>
    </Link>
  );
}
