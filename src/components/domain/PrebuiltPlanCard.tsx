import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "border-t-green-500",
  intermediate: "border-t-yellow-500",
  advanced: "border-t-orange-500",
  elite: "border-t-red-500",
};

const DIFFICULTY_LABELS: Record<string, { fr: string; en: string }> = {
  beginner: { fr: "D\u00e9butant", en: "Beginner" },
  intermediate: { fr: "Interm\u00e9diaire", en: "Intermediate" },
  advanced: { fr: "Avanc\u00e9", en: "Advanced" },
  elite: { fr: "\u00c9lite", en: "Elite" },
};

interface PrebuiltPlanCardProps {
  plan: PrebuiltPlan;
}

export function PrebuiltPlanCard({ plan }: PrebuiltPlanCardProps) {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const name = isEn ? plan.nameEn : plan.name;
  const description = isEn ? plan.descriptionEn : plan.description;
  const difficultyLabel = DIFFICULTY_LABELS[plan.difficulty];
  const raceMeta = plan.raceDistance
    ? RACE_DISTANCE_META[plan.raceDistance]
    : null;

  return (
    <Link to={`/plan/prebuilt/${plan.slug}`} className="group block h-full">
      <Card
        interactive
        className={cn(
          "h-full border-t-4",
          DIFFICULTY_COLORS[plan.difficulty] ?? "border-t-gray-400",
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
            {difficultyLabel && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                {isEn ? difficultyLabel.en : difficultyLabel.fr}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
              {plan.totalWeeks} {isEn ? "wk" : "sem."}
            </Badge>
            {raceMeta && (
              <Badge variant="default" className="text-[10px] sm:text-xs px-1.5 py-0">
                {isEn ? raceMeta.labelEn : raceMeta.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
