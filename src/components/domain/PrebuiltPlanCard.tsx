import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";
import { usePickLang } from "@/lib/i18n-utils";

const DIFFICULTY_GRADIENT: Record<string, string> = {
  beginner: "bg-gradient-to-br from-green-500/10 dark:from-green-500/20 to-transparent",
  intermediate: "bg-gradient-to-br from-yellow-500/10 dark:from-yellow-500/20 to-transparent",
  advanced: "bg-gradient-to-br from-orange-500/10 dark:from-orange-500/20 to-transparent",
  elite: "bg-gradient-to-br from-red-500/10 dark:from-red-500/20 to-transparent",
};

const DIFFICULTY_KEYS: Record<string, string> = {
  beginner: "collections.difficulty.beginner",
  intermediate: "collections.difficulty.intermediate",
  advanced: "collections.difficulty.advanced",
  elite: "collections.difficulty.advanced",
};

interface PrebuiltPlanCardProps {
  plan: PrebuiltPlan;
}

export function PrebuiltPlanCard({ plan }: PrebuiltPlanCardProps) {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  const name = pickLang(plan, "name");
  const description = pickLang(plan, "description");
  const difficultyKey = DIFFICULTY_KEYS[plan.difficulty];
  const raceMeta = plan.raceDistance
    ? RACE_DISTANCE_META[plan.raceDistance]
    : null;

  return (
    <Link to={`/plan/prebuilt/${plan.slug}`} className="group block h-full">
      <Card
        interactive
        className={cn(
          "h-full border-border/50",
          DIFFICULTY_GRADIENT[plan.difficulty] ?? "bg-gradient-to-br from-gray-400/10 dark:from-gray-400/20 to-transparent",
        )}
      >
        <CardContent className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 h-full">
          {/* Name */}
          <h3 className="font-semibold text-sm sm:text-base leading-tight">{name}</h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-1">
            {description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1">
            {difficultyKey && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                {t(difficultyKey)}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
              {plan.totalWeeks} {t("plans.weeks")}
            </Badge>
            {raceMeta && (
              <Badge variant="default" className="text-[10px] sm:text-xs px-1.5 py-0">
                {pickLang(raceMeta, "label")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
