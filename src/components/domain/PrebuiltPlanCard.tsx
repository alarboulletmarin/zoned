import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";
import { usePickLang } from "@/lib/i18n-utils";

const DIFFICULTY_KEYS: Record<string, string> = {
  beginner: "collections.difficulty.beginner",
  intermediate: "collections.difficulty.intermediate",
  advanced: "collections.difficulty.advanced",
  elite: "collections.difficulty.advanced",
};

interface PrebuiltPlanCardProps {
  plan: PrebuiltPlan;
  className?: string;
}

/** One ready-made plan in the index. The whole card is the target. */
export function PrebuiltPlanCard({ plan, className }: PrebuiltPlanCardProps) {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  const difficultyKey = DIFFICULTY_KEYS[plan.difficulty];
  const raceMeta = plan.raceDistance
    ? RACE_DISTANCE_META[plan.raceDistance]
    : null;

  return (
    <Link
      to={`/plan/prebuilt/${plan.slug}`}
      className={cn("zn-ecard", className)}
    >
      {difficultyKey && (
        <span className="zn-kicker zn-kicker--inline">{t(difficultyKey)}</span>
      )}

      <h3 className="zn-ecard__title">{pickLang(plan, "name")}</h3>

      <p className="zn-ecard__desc">{pickLang(plan, "description")}</p>

      <div className="zn-ecard__meta">
        <span className="zn-ecard__fact">
          {plan.totalWeeks} {t("plans.weeks")}
        </span>
        {raceMeta && (
          <span className="zn-ecard__code">{pickLang(raceMeta, "label")}</span>
        )}
      </div>
    </Link>
  );
}
