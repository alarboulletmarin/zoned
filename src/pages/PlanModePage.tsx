import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo, type CSSProperties } from "react";
import { ArrowLeft, BookOpen, CalendarRange, Zap } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Option, OptionStack } from "./plan-create/Option";
import { SEOHead } from "@/components/seo";
import { useAppStats } from "@/hooks/useAppStats";
import { PRACTICES, type Practice } from "@/types/practice";

/**
 * La deuxième question du parcours : COMMENT le plan se fabrique.
 *
 * Elle a existé, puis elle a disparu, et les deux avaient leur raison.
 *
 * Elle était l'écran d'accueil de `/plan/new`, trois portes posées avant la
 * moindre question. La refonte l'a retirée pour deux motifs qui tiennent
 * toujours : veux-tu un plan assisté ? est la question la plus coûteuse de
 * l'app, et on ne sait pas y répondre avant d'avoir dit ce qu'on prépare ; et
 * la porte des plans prêts annonçait une étagère vide en trail comme en ultra,
 * sans pouvoir le dire. Elle est donc revenue ici, APRÈS la pratique, où les
 * deux motifs tombent : la question est posée en connaissance de cause, et la
 * porte des plans prêts compte ce qui existe POUR CETTE PRATIQUE, quitte à
 * s'annoncer vide.
 *
 * Ce qu'elle rend, et c'est la demande du propriétaire : le choix entre les
 * trois façons d'avoir un plan se voit à nouveau, au lieu de tenir dans deux
 * liens gris en pied de page. Un plan libre n'est pas une note de bas de page
 * du générateur, c'est une manière d'entraîner.
 *
 * La pratique voyage en `?practice=`. Sans elle la page marche quand même :
 * les trois portes restent ouvertes, la porte assistée pose alors la question
 * à son étape 1, et le compteur des plans prêts redevient le total. C'est ce
 * qui permet d'y entrer directement depuis `/plan/new`, pour qui sait déjà ce
 * qu'il veut et n'a pas envie de choisir une pratique d'abord.
 *
 * Hors sitemap et `noindex`, comme les deux autres étapes du parcours : c'est
 * un couloir, pas une page. `/plan/new` et `/plan/new/prebuilt` sont les deux
 * seules portes indexées.
 */
export function PlanModePage() {
  const { t } = useTranslation(["plan", "common"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stats = useAppStats();

  /* Une pratique inconnue est ignorée plutôt que corrigée : la page a un sens
     sans elle, et rediriger sur une valeur mal tapée ferait perdre le geste. */
  const practice = useMemo<Practice | null>(() => {
    const raw = searchParams.get("practice");
    return raw && (PRACTICES as readonly string[]).includes(raw) ? (raw as Practice) : null;
  }, [searchParams]);

  const content = practice ? stats.byPractice[practice] : undefined;

  /* Le catalogue arrive en chunks, donc `byPractice` vaut zéro partout avant
     son chargement. Écrire aucun plan prêt pendant 300 ms serait un mensonge
     court, mais un mensonge, et il ferait en plus passer la porte en étagère
     vide sous les yeux. Le signal est le même que celui de `practiceData` :
     tant qu'aucune séance n'est comptée, rien n'est chargé.

     Sans pratique, le total sort de `getAllPrebuiltPlans()`, qui est
     synchrone : il n'y a rien à attendre. */
  const counted = practice ? (content?.workouts ?? 0) > 0 : true;
  const ready = practice ? (content?.plans ?? 0) : stats.plans;

  const doors = [
    {
      id: "assisted",
      glyph: Zap,
      to: practice ? `/plan/new/assisted?practice=${practice}` : "/plan/new/assisted",
      data: t("plan:newPlan.assistedKicker"),
      soon: false,
    },
    {
      id: "prebuilt",
      glyph: BookOpen,
      to: "/plan/new/prebuilt",
      /* Zéro est une réponse, et elle se dit : une étagère vide s'annonce
         plutôt que de laisser découvrir son vide au tap suivant. La porte
         reste choisissable, c'est la règle de `soon` : un contrôle mort
         n'apprend rien de ce qu'on peut faire à la place, et la page des
         plans prêts propose justement le générateur pour les pratiques
         qu'elle ne sert pas encore.

         Le compteur est `practice.planCount`, celui des cartes de pratique à
         l'écran d'avant : deux écrans qui comptent la même chose doivent la
         dire avec les mêmes mots, et lui porte ses deux formes de pluriel
         quand `newPlan.prebuiltKicker` écrivait 1 plans prêts. */
      data: !counted
        ? ""
        : ready > 0
          ? t("plan:practice.planCount", { count: ready })
          : t("plan:practice.noPlanYet"),
      soon: counted && ready === 0,
    },
    {
      id: "free",
      glyph: CalendarRange,
      to: "/plan/new/free",
      data: t("plan:newPlan.freeKicker"),
      soon: false,
    },
  ] as const;

  return (
    <>
      <SEOHead
        title={t("common:seo.planNew")}
        description={t("common:seo.planNewDesc")}
        canonical="/plan/new"
        noindex
      />

      <div className="zn-wiz">
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <Button variant="ghost" size="sm" asChild className="zn-wiz__lone">
            <Link to="/plan/new">
              <ArrowLeft />
              {t("plan:newPlan.backToStart")}
            </Link>
          </Button>

          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            {/* Le micro-label porte la pratique choisie, quand il y en a une :
                c'est la seule trace à l'écran de la réponse précédente, et
                sans elle on ne saurait pas pour quoi on choisit un mode. */}
            <span className="zn-kicker">
              {practice
                ? `${t("plan:newPlan.kicker")} · ${t(`plan:practice.${practice}.label`)}`
                : t("plan:newPlan.kicker")}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("plan:newPlan.title")}
            </h1>
            <p
              className="zn-body zn-body--lead zn-measure"
              style={{ "--measure": "54ch" } as CSSProperties}
            >
              {t("plan:newPlan.lede")}
            </p>
          </div>
        </div>

        <section className="zn-wiz__band" aria-labelledby="plan-new-modes">
          <h2 id="plan-new-modes" className="sr-only">
            {t("plan:newPlan.doorsTitle")}
          </h2>

          <OptionStack questionId="plan-new-modes">
            {doors.map((door) => (
              <Option
                key={door.id}
                name="plan-new-mode"
                checked={false}
                glyph={door.glyph}
                title={t(`plan:newPlan.${door.id}Title`)}
                body={t(`plan:newPlan.${door.id}Body`)}
                data={door.data}
                soon={door.soon}
                onSelect={() => navigate(door.to)}
              />
            ))}
          </OptionStack>
        </section>
      </div>
    </>
  );
}
