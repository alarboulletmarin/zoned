import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { RACE_DISTANCE_META } from "@/types/plan";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";
import { usePickLang } from "@/lib/i18n-utils";

const DIFFICULTY_KEYS: Record<string, string> = {
  beginner: "collections.difficulty.beginner",
  intermediate: "collections.difficulty.intermediate",
  advanced: "collections.difficulty.advanced",
  elite: "collections.difficulty.advanced",
};

// Phase colors (PHASE_META) are plain Tailwind swatches unrelated to the
// zone ramp (see CLAUDE.md #114). For this card's illustrative distribution
// bar we approximate each phase with the zone it visually reads closest to
// — same "teaching figure" spirit as HomePage's PROGRESSION_WEEKS, not a
// measurement of the plan's real per-session zones (that's PlanStatsSection).
export const PHASE_ZONE_BAR: Record<string, string> = {
  base: "bg-zone-2",
  build: "bg-zone-3",
  peak: "bg-zone-4",
  taper: "bg-zone-1",
  recovery: "bg-zone-1",
};

interface PrebuiltPlanCardProps {
  plan: PrebuiltPlan;
}

export function PrebuiltPlanCard({ plan }: PrebuiltPlanCardProps) {
  const { t } = useTranslation("plan");
  const pickLang = usePickLang();

  const name = pickLang(plan, "name");
  const description = pickLang(plan, "description");
  const difficultyKey = DIFFICULTY_KEYS[plan.difficulty];
  const raceMeta = plan.raceDistance
    ? RACE_DISTANCE_META[plan.raceDistance]
    : null;

  return (
    <Link
      to={`/plan/prebuilt/${plan.slug}`}
      className="group block h-full bg-background p-5 transition-colors hover:bg-secondary"
    >
      <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
        {raceMeta ? pickLang(raceMeta, "label") : ""}
        {raceMeta ? " · " : ""}
        {t("prebuilt.weeksCount", { count: plan.totalWeeks })}
      </p>
      <h3 className="mt-2.5 font-sans font-bold uppercase leading-[1.02] tracking-[-0.03em] text-xl sm:text-2xl">
        {name}
      </h3>
      <p className="mt-2 text-sm leading-[1.5] text-foreground/70 line-clamp-2">
        {description}
      </p>
      <div className="flex h-2 gap-px mt-4" aria-hidden="true">
        {plan.phases.map((p, i) => {
          const span = p.endWeek - p.startWeek + 1;
          const pct = (span / plan.totalWeeks) * 100;
          return (
            <div
              key={i}
              className={PHASE_ZONE_BAR[p.phase] ?? "bg-foreground/20"}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
        {difficultyKey && <span>{t(difficultyKey)}</span>}
        <span>
          {plan.sessionsPerWeek} {t("prebuilt.sessionsPerWeek")}
        </span>
      </div>
    </Link>
  );
}
