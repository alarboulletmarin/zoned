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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PrebuiltWeek } from "@/data/prebuilt-weeks/types";
import { usePickLang } from "@/lib/i18n-utils";

const DIFFICULTY_GRADIENT: Record<string, string> = {
  beginner: "bg-gradient-to-br from-green-500/10 dark:from-green-500/20 to-transparent",
  intermediate: "bg-gradient-to-br from-yellow-500/10 dark:from-yellow-500/20 to-transparent",
  advanced: "bg-gradient-to-br from-orange-500/10 dark:from-orange-500/20 to-transparent",
  elite: "bg-gradient-to-br from-red-500/10 dark:from-red-500/20 to-transparent",
};

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
}

export function PrebuiltWeekCard({ week }: PrebuiltWeekCardProps) {
  const { t } = useTranslation("library");
  const pickLang = usePickLang();

  const name = pickLang(week, "name");
  const description = pickLang(week, "description");
  const Icon = ICON_MAP[week.icon] ?? Mountain;

  return (
    <Link to={`/weeks/prebuilt/${week.slug}`} className="group block h-full">
      <Card
        interactive
        className={cn(
          "h-full border-border/50",
          DIFFICULTY_GRADIENT[week.difficulty] ??
            "bg-gradient-to-br from-gray-400/10 dark:from-gray-400/20 to-transparent",
        )}
      >
        <CardContent className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 h-full">
          {/* Icon + name */}
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-background/60 flex items-center justify-center shrink-0">
              <Icon className="size-4.5 text-foreground/80" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base leading-tight">
              {name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-1">
            {description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1">
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
              {t(`weekly.prebuilt.category.${week.category}`)}
            </Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
              {t("weekly.prebuilt.sessions", { count: week.sessions.length })}
            </Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
              {t("weekly.prebuilt.volume", { hours: weekHours(week) })}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
