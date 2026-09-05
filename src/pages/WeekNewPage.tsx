import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { DoorCard } from "@/components/domain/DoorCard";
import { getAllPrebuiltWeeks } from "@/data/prebuilt-weeks";
import { savePlan } from "@/lib/planStorage";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";

/**
 * Week creation: two doors, no wizard.
 *
 * "Composer" creates the empty single-week plan and hands the editor
 * `state.openSettings`, so the generator's parameters are picked first — the
 * app never generates blindly. "Catalogue" opens the ready-made weeks.
 *
 * The first door creates before it navigates, so it has to be a <button>; the
 * second is a real <Link>. Both wear the same paper (.zn-door), so the pair
 * reads as one choice rather than as a control next to a card.
 */
export function WeekNewPage() {
  const { t } = useTranslation("library");
  const navigate = useNavigate();
  const prebuiltCount = getAllPrebuiltWeeks().length;

  function createWeek() {
    const plan = createEmptyWeekPlan(t("weekly.generate.defaultName"));
    savePlan(plan);
    navigate(`/weeks/${plan.id}`, { state: { openSettings: true } });
  }

  return (
    <>
      <SEOHead noindex title={t("weekly.new.title")} canonical="/weeks/new" />

      <div className="zn-pw">
        <Button variant="ghost" size="sm" asChild className="zn-pw__back">
          <Link to="/weeks">
            <ArrowLeft size={16} />
            {t("weekly.new.back")}
          </Link>
        </Button>

        <section className="zn-pw__band zn-pw__band--first">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
          >
            <span className="zn-kicker">{t("weekly.new.kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("weekly.new.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-pw__lede">
              {t("weekly.new.subtitle")}
            </p>
          </div>
        </section>

        <section className="zn-pw__band">
          <div
            className="zn-grid"
            style={{ "--cols": 2, "--cols-md": 2 } as React.CSSProperties}
          >
            <button type="button" onClick={createWeek} className="zn-door">
              <span className="zn-kicker">
                {t("weekly.new.modes.create.kicker")}
              </span>
              <span className="zn-door__title">
                {t("weekly.new.modes.create.title")}
              </span>
              <span className="zn-door__body">
                {t("weekly.new.modes.create.desc")}
              </span>
              <span className="zn-door__cta">
                {t("weekly.new.modes.create.cta")}
                <ArrowRight />
              </span>
            </button>

            <DoorCard
              to="/weeks/new/prebuilt"
              kicker={t("weekly.new.modes.prebuilt.kicker")}
              title={t("weekly.new.modes.prebuilt.title")}
              body={t("weekly.new.modes.prebuilt.desc")}
              cta={t("weekly.new.modes.prebuilt.cta", { count: prebuiltCount })}
            />
          </div>
        </section>
      </div>
    </>
  );
}
