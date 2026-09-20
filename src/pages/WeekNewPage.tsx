import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { DoorCard } from "@/components/domain/DoorCard";
import { getAllPrebuiltWeeks } from "@/data/prebuilt-weeks";
import { savePlan } from "@/lib/planStorage";
import { dateFromIso } from "@/lib/cockpit";
import { loadTodayComposition, placeWeek, saveTodayComposition } from "@/lib/todayComposition";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";
import { toast } from "@/components/ui/toast";

/**
 * Week creation: three doors, no wizard.
 *
 * "À la main" creates the empty single-week plan and opens the board alone,
 * to be filled session by session. "Générer" creates the same empty week
 * and hands the editor `state.openSettings`, so the generator's parameters
 * are picked first, the app never generates blindly. "Catalogue" opens the
 * ready-made weeks. The one door used to serve both of the first two, and
 * always opened on the generator: composing by hand meant closing a form
 * first.
 *
 * The first two doors create before they navigate, so they have to be
 * <button>s; the third is a real <Link>. All three wear the same paper
 * (.zn-door), so the trio reads as one choice rather than as controls next
 * to a card.
 */
export function WeekNewPage() {
  const { t } = useTranslation("library");
  const navigate = useNavigate();
  const location = useLocation();
  const prebuiltCount = getAllPrebuiltWeeks().length;

  /* Venue du cockpit, la semaine se pose d'elle-même sur la semaine que l'on
     regardait : `placeOn` est ce lundi. Sans lui, rien ne change, la semaine
     entre dans le cockpit par la règle de repli ou par la feuille Composer. */
  const placeOn = (location.state as { placeOn?: string } | null)?.placeOn;

  function createWeek(openSettings: boolean) {
    const plan = createEmptyWeekPlan(t("weekly.generate.defaultName"));
    const saved = savePlan(plan);
    if (!saved.ok) {
      toast.failure(t("weekly.toast.saveFailed"), saved);
      return;
    }
    if (typeof placeOn === "string") {
      saveTodayComposition(placeWeek(loadTodayComposition(), plan.id, dateFromIso(placeOn)));
    }
    navigate(`/weeks/${plan.id}`, openSettings ? { state: { openSettings: true } } : undefined);
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

        <section className="zn-pw__band">
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
            style={{ "--cols": 3, "--cols-md": 3 } as React.CSSProperties}
          >
            <button type="button" onClick={() => createWeek(false)} className="zn-door">
              <span className="zn-kicker">
                {t("weekly.new.modes.scratch.kicker")}
              </span>
              <span className="zn-door__title">
                {t("weekly.new.modes.scratch.title")}
              </span>
              <span className="zn-door__body">
                {t("weekly.new.modes.scratch.desc")}
              </span>
              <span className="zn-door__cta">
                {t("weekly.new.modes.scratch.cta")}
                <ArrowRight />
              </span>
            </button>

            <button type="button" onClick={() => createWeek(true)} className="zn-door">
              <span className="zn-kicker">
                {t("weekly.new.modes.generate.kicker")}
              </span>
              <span className="zn-door__title">
                {t("weekly.new.modes.generate.title")}
              </span>
              <span className="zn-door__body">
                {t("weekly.new.modes.generate.desc")}
              </span>
              <span className="zn-door__cta">
                {t("weekly.new.modes.generate.cta")}
                <ArrowRight />
              </span>
            </button>

            <DoorCard
              to="/weeks/new/prebuilt"
              state={typeof placeOn === "string" ? { placeOn } : undefined}
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
