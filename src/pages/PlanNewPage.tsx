import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DoorCard } from "@/components/domain/DoorCard";
import { SEOHead } from "@/components/seo";
import { useAppStats } from "@/hooks/useAppStats";

/**
 * The mode chooser: three doors, one per way of getting a plan.
 *
 * Nothing is generated here — the screen's whole job is to name the three
 * routes honestly and get out of the way, which is what DoorCard is for.
 */
export function PlanNewPage() {
  const { t } = useTranslation(["plan", "common"]);
  const stats = useAppStats();

  return (
    <>
      <SEOHead
        title={t("common:seo.planNew")}
        description={t("common:seo.planNewDesc")}
        canonical="/plan/new"
      />

      <div className="zn-wiz">
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <Button variant="ghost" size="sm" asChild className="zn-wiz__lone">
            <Link to="/plans">
              <ArrowLeft />
              {t("common:plans.backToPlans")}
            </Link>
          </Button>

          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <span className="zn-kicker">{t("newPlan.kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("newPlan.title")}
            </h1>
            <p
              className="zn-body zn-body--lead zn-measure"
              style={{ "--measure": "54ch" } as CSSProperties}
            >
              {t("newPlan.lede")}
            </p>
          </div>
        </div>

        <section className="zn-wiz__band" aria-labelledby="plan-new-doors">
          <h2 id="plan-new-doors" className="sr-only">
            {t("newPlan.doorsTitle")}
          </h2>
          <div className="zn-grid">
            <DoorCard
              to="/plan/new/assisted"
              kicker={t("newPlan.assistedKicker")}
              title={t("newPlan.assistedTitle")}
              body={t("newPlan.assistedBody")}
              cta={t("newPlan.assistedCta")}
            />
            <DoorCard
              to="/plan/new/free"
              kicker={t("newPlan.freeKicker")}
              title={t("newPlan.freeTitle")}
              body={t("newPlan.freeBody")}
              cta={t("newPlan.freeCta")}
            />
            <DoorCard
              to="/plan/new/prebuilt"
              kicker={t("newPlan.prebuiltKicker", { n: stats.plans })}
              title={t("newPlan.prebuiltTitle")}
              body={t("newPlan.prebuiltBody")}
              cta={t("newPlan.prebuiltCta", { n: stats.plans })}
            />
          </div>
        </section>
      </div>
    </>
  );
}
