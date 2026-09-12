import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Option, OptionStack } from "./plan-create/Option";
import { SEOHead } from "@/components/seo";
import { useAppStats } from "@/hooks/useAppStats";
import { PRACTICES, isPracticeLive, type Practice } from "@/types/practice";
import { practiceData } from "@/components/domain/practice-data";

/**
 * L'entrée du parcours : la pratique, et rien d'autre.
 *
 * Cette page faisait choisir un MÉCANISME DE GÉNÉRATION — assisté, libre,
 * prêt-à-l'emploi — **avant la première question**. C'était la question la
 * plus coûteuse de l'app posée en premier : « veux-tu un plan assisté ? » ne
 * se répond pas quand on n'a pas encore dit ce qu'on prépare. Et pour le trail
 * et l'ultra l'étagère des plans prêts est vide, donc un tiers du temps
 * l'embranchement annonçait une impasse.
 *
 * Le choix du mode se pose maintenant APRÈS, en secondaire, et seulement pour
 * qui le cherche. `/plan/new/assisted`, `/free` et `/prebuilt` restent des
 * routes vivantes — la première et la troisième sont au sitemap.
 */
export function PlanNewPage() {
  const { t } = useTranslation(["plan", "common"]);
  const navigate = useNavigate();
  const stats = useAppStats();

  /* Choisir une pratique entre directement dans le parcours, à son étape 1.
     Le paramètre est lu par PlanCreatePage, qui préremplit le brouillon. */
  const choose = (practice: Practice) => {
    navigate(`/plan/new/assisted?practice=${practice}`);
  };

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
            <span className="zn-kicker">{t("plan:newPlan.kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("plan:practice.title")}
            </h1>
            <p
              className="zn-body zn-body--lead zn-measure"
              style={{ "--measure": "54ch" } as CSSProperties}
            >
              {t("plan:practice.subtitle")}
            </p>
          </div>
        </div>

        <section className="zn-wiz__band" aria-labelledby="plan-new-practices">
          <h2 id="plan-new-practices" className="sr-only">
            {t("plan:practice.title")}
          </h2>

          <OptionStack questionId="plan-new-practices">
            {PRACTICES.map((practice) => (
              <Option
                key={practice}
                name="plan-new-practice"
                checked={false}
                title={t(`plan:practice.${practice}.label`)}
                body={t(`plan:practice.${practice}.body`)}
                data={practiceData(practice, stats.byPractice[practice], t)}
                /* Deux écrans montrent ces mêmes quatre cartes ; une pratique
                   annoncée doit se lire comme telle sur les deux, sinon celle
                   d'ici promet ce que celle d'après retire. */
                soon={!isPracticeLive(practice)}
                onSelect={() => choose(practice)}
              />
            ))}
          </OptionStack>

          {/* Les deux autres façons d'avoir un plan, en secondaire : la
              question « comment » se pose après « quoi », et seulement pour
              qui la cherche. */}
          <p className="zn-body zn-body--sm zn-muted zn-wiz__modes">
            <Link to="/plan/new/prebuilt">
              {t("plan:newPlan.prebuiltCta", { n: stats.plans })}
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/plan/new/free">{t("plan:newPlan.freeCta")}</Link>
          </p>
        </section>
      </div>
    </>
  );
}
