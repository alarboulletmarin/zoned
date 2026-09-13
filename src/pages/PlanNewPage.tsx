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
 * Cette page faisait choisir un MÉCANISME DE GÉNÉRATION, assisté, libre,
 * prêt-à-l'emploi, **avant la première question**. C'était la question la
 * plus coûteuse de l'app posée en premier : veux-tu un plan assisté ? ne
 * se répond pas quand on n'a pas encore dit ce qu'on prépare. Et pour le trail
 * et l'ultra l'étagère des plans prêts est vide, donc un tiers du temps
 * l'embranchement annonçait une impasse.
 *
 * Le choix du mode se pose donc APRÈS, une fois la pratique dite, et il a
 * retrouvé un écran à lui : `/plan/new/mode` (`PlanModePage`). Il avait fini
 * en deux liens gris au pied de cette page, ce qui était trop peu : un plan
 * libre n'est pas une note de bas de page du générateur, c'est une manière
 * d'entraîner. La ligne du bas ne porte donc plus les deux modes, elle porte
 * l'entrée du choix lui-même, pour qui préfère décider du comment avant le
 * quoi.
 *
 * `/plan/new/assisted`, `/free` et `/prebuilt` restent des routes vivantes,
 * la première et la troisième sont au sitemap.
 */
export function PlanNewPage() {
  const { t } = useTranslation(["plan", "common"]);
  const navigate = useNavigate();
  const stats = useAppStats();

  /* Choisir une pratique mène au choix du mode, qui la fait suivre. Le
     paramètre traverse les deux écrans : `PlanCreatePage` le lit pour
     préremplir le brouillon et démarrer à l'étape 2, et la page des modes s'en
     sert pour compter les plans prêts de CETTE pratique. */
  const choose = (practice: Practice) => {
    navigate(`/plan/new/mode?practice=${practice}`);
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

          {/* La sortie de secours, pour qui veut décider du COMMENT avant le
              quoi : elle mène au même écran de modes que la réponse
              ci-dessus, sans pratique. Un seul lien et non les deux modes en
              raccourci : les trois façons de créer un plan ont maintenant un
              seul domicile, et deux écrans de suite qui proposent les mêmes
              portes se liraient comme une question posée deux fois. */}
          <p className="zn-body zn-body--sm zn-muted zn-wiz__modes">
            <Link to="/plan/new/mode">{t("plan:newPlan.doorsTitle")}</Link>
          </p>
        </section>
      </div>
    </>
  );
}
