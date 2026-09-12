import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { PrebuiltPlanCard } from "@/components/domain/PrebuiltPlanCard";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import {
  PRACTICES,
  PRACTICE_META,
  isPracticeLive,
  practiceFromRaceDistance,
} from "@/types/practice";

/**
 * Les plans tout prêts, en catalogue.
 *
 * Same shape as the library: a mono line counting what is on offer, the
 * display title, one sentence, then outlined cards in a grid. The count is
 * the kicker rather than a footnote under the grid — a number belongs above
 * the thing it measures, not after it.
 */
export function PrebuiltPlansPage() {
  const { t, i18n } = useTranslation("plan");
  const isEn = i18n.language.startsWith("en");

  const plans = getAllPrebuiltPlans();

  /* Les pratiques VIVANTES dont l'étagère est vide.
     Un rayon vide ne rend jamais une grille vide en silence : il le dit, et il
     dit ce qui marche à la place. Aujourd'hui c'est l'ultra — seize à
     cinquante-deux semaines de structure à écrire à la main, là où le
     générateur a déjà les tables. Une pratique ANNONCÉE (le triathlon) n'entre
     pas dans cette liste : elle porte son annonce ailleurs, et compter zéro
     plan pour une pratique qui n'est pas ouverte serait du bruit.
     Rien n'est en dur : le jour où un plan ultra est écrit, le bloc disparaît
     tout seul. */
  const served = new Set(
    plans.filter((p) => p.raceDistance).map((p) => practiceFromRaceDistance(p.raceDistance!)),
  );
  const unserved = PRACTICES.filter((p) => isPracticeLive(p) && !served.has(p));

  return (
    <>
      <SEOHead
        title={t("prebuiltList.title")}
        description={t("prebuiltList.description")}
        canonical="/plan/new/prebuilt"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: "Plans", item: "https://zoned.run/plans" },
            { "@type": "ListItem", position: 3, name: t("prebuiltList.title") },
          ],
        }}
      />

      <div className="zn-pw">
        <Button variant="ghost" size="sm" asChild className="zn-pw__back">
          <Link to="/plan/new">
            <ArrowLeft size={16} />
            {t("prebuiltList.back")}
          </Link>
        </Button>

        <section className="zn-pw__band zn-pw__band--first">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
          >
            <span className="zn-kicker">
              {t("prebuiltList.available", { count: plans.length })}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("prebuiltList.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-pw__lede">
              {t("prebuiltList.subtitle")}
            </p>
          </div>
        </section>

        <section className="zn-pw__band">
          <div className="zn-grid">
            {plans.map((plan) => (
              <PrebuiltPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        {unserved.map((practice) => {
          const label = isEn
            ? PRACTICE_META[practice].labelEn
            : PRACTICE_META[practice].label;
          return (
            <section
              key={practice}
              className="zn-pw__band"
              aria-labelledby={`missing-${practice}`}
            >
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
              >
                <span className="zn-kicker" id={`missing-${practice}`}>
                  {t("prebuiltList.missingKicker")}
                </span>
                <p className="zn-body zn-pw__lede">
                  {t("prebuiltList.missingBody", { practice: label })}
                </p>
                <Button asChild variant="outline" size="sm" className="zn-pw__missing-cta">
                  <Link to={`/plan/new/assisted?practice=${practice}`}>
                    {t("prebuiltList.missingCta", { practice: label.toLowerCase() })}
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
