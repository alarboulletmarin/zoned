import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarRange, Dices } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DoorCard } from "@/components/domain/DoorCard";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import { SEOHead } from "@/components/seo";
import { usePlans } from "@/hooks/usePlans";
import { useSettings } from "@/hooks/useSettings";
import { focusHref, pickTodayFocus } from "@/lib/cockpit";
import { useIsEnglish } from "@/lib/i18n-utils";
import DoorToday from "@/assets/doodles/door-today.svg?react";

/**
 * Le cockpit.
 *
 * Tâche et fin : « j'arrive pour savoir quoi faire aujourd'hui ; j'ai fini
 * quand je sais quoi courir. » La fin est atteinte SUR CET ÉCRAN, pas trois
 * pages plus loin — c'est toute la raison d'ajouter une page à une app qui en
 * a déjà soixante.
 *
 * Contexte : quotidien, répété, debout, dix secondes, souvent avant de sortir.
 * Donc vitesse et constance, pas pédagogie. Zéro question posée à l'arrivée :
 * la séance du jour est déduite du plan en cours, et tout le reste est
 * mémorisé.
 *
 * Un seul primaire — « reprendre » — et donc un seul aplat vermillon. Les deux
 * gestes courts et les trois portes sont secondaires, en contour.
 *
 * `/` reste la landing publique avec son JSON-LD et sa FAQ ; cette page-ci est
 * l'écran privé, donc `noindex`, hors sitemap et hors prérendu (voir le
 * commentaire de `scripts/generate-sitemap.ts` sur /plans et /weeks, qui sont
 * exclus pour exactement la même raison).
 */
export function TodayPage() {
  const { t } = useTranslation(["today", "common"]);
  const isEn = useIsEnglish();
  const { plans, isLoading } = usePlans();
  const { settings } = useSettings();

  // `new Date()` une seule fois par montage : un rendu qui recalcule « quel
  // jour on est » peut changer d'avis en cours de session.
  const focus = useMemo(() => pickTodayFocus(plans, new Date()), [plans]);
  const href = focusHref(focus);

  const dateLine = new Date().toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="zn-cockpit">
      <SEOHead title={t("today:seoTitle")} description={t("today:seoDescription")} noindex />

      {/* ── Reprendre ────────────────────────────────────────────────────────
          Le primaire, et la seule chose qui porte l'accent.

          La réponse EST le titre de la page. Un `<h1>` qui dirait
          « Aujourd'hui » au-dessus d'un chapô « à faire aujourd'hui » et
          d'une ligne « une séance t'attend » ferait dire trois fois la même
          chose à l'écran avant d'arriver au contenu — et la porte de la nav
          dit déjà « Aujourd'hui ». La date en graduation suffit à situer, le
          titre porte l'information. */}
      {settings.cockpit.resume && (
        <section className="zn-cockpit__resume">
          {isLoading ? (
            // Pas de squelette : la lecture est synchrone depuis localStorage,
            // donc l'attente est d'une frame. Un squelette qui clignote coûte
            // plus qu'il ne rassure.
            <div className="zn-cockpit__hold" aria-hidden="true" />
          ) : (
            <>
              <span className="zn-kicker">{dateLine}</span>
              <h1 className="zn-display zn-cockpit__headline" data-level="3">
                {focus.state === "session" &&
                  t("today:resume.session.line", {
                    count: focus.sessions.length,
                    week: focus.weekNumber,
                  })}
                {focus.state === "rest" && t("today:resume.rest.line")}
                {focus.state === "upcoming" &&
                  t("today:resume.upcoming.line", { count: focus.daysUntilStart })}
                {focus.state === "none" && t("today:resume.none.line")}
              </h1>
              <p className="zn-body zn-muted zn-measure">
                {focus.plan && focus.state !== "none"
                  ? t(focus.isWeek ? "today:resume.inWeek" : "today:resume.inPlan", {
                      name: isEn ? focus.plan.nameEn : focus.plan.name,
                    })
                  : t("today:resume.none.body")}
              </p>
              <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                {href ? (
                  <Button asChild size="lg">
                    <Link to={href}>
                      {t(focus.isWeek ? "today:resume.openWeek" : "today:resume.openPlan")}
                      <ArrowRight />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link to="/plan/new">
                      {t("today:resume.none.cta")}
                      <ArrowRight />
                    </Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* Quelqu'un qui a masqué « reprendre » dans ses réglages ne doit pas
          se retrouver sur une page sans titre : le `<h1>` vit normalement dans
          la section ci-dessus, donc il faut le reposer ici. */}
      {!settings.cockpit.resume && (
        <header className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
          <span className="zn-kicker">{dateLine}</span>
          <h1 className="zn-display" data-level="3">
            {t("today:title")}
          </h1>
        </header>
      )}

      {/* ── Les deux gestes courts ──────────────────────────────────────────
          Les deux seuls moments de l'app où l'on ne veut pas décider : « je ne
          sais pas quoi faire » et « je ne veux pas m'engager sur seize
          semaines ». Ils étaient à trois clics, au fond d'un menu déroulant. */}
      {settings.cockpit.shortcuts && (
        <section className="zn-cockpit__quick" aria-labelledby="cockpit-quick-title">
          <h2 id="cockpit-quick-title" className="sr-only">
            {t("today:quick.title")}
          </h2>
          <Link to="/library/draw" className="zn-cockpit__shortcut">
            <Dices className="zn-cockpit__shortcut-icon" aria-hidden="true" />
            <span className="zn-cockpit__shortcut-label">{t("today:quick.draw")}</span>
            <span className="zn-cockpit__shortcut-hint">{t("today:quick.drawHint")}</span>
          </Link>
          <Link to="/weeks/new" className="zn-cockpit__shortcut">
            <CalendarRange className="zn-cockpit__shortcut-icon" aria-hidden="true" />
            <span className="zn-cockpit__shortcut-label">{t("today:quick.week")}</span>
            <span className="zn-cockpit__shortcut-hint">{t("today:quick.weekHint")}</span>
          </Link>
        </section>
      )}

      {/* ── Les trois portes ───────────────────────────────────────────────── */}
      <section className="zn-cockpit__doors" aria-labelledby="cockpit-doors-title">
        <h2 id="cockpit-doors-title" className="sr-only">
          {t("today:doors.title")}
        </h2>
        <DoorCard
          to="/library"
          kicker={t("today:doors.sessions.kicker")}
          title={t("today:doors.sessions.title")}
          body={t("today:doors.sessions.body")}
          cta={t("today:doors.sessions.cta")}
        />
        <DoorCard
          to="/plans"
          kicker={t("today:doors.plans.kicker")}
          title={t("today:doors.plans.title")}
          body={t("today:doors.plans.body")}
          cta={t("today:doors.plans.cta")}
        />
        <DoorCard
          to="/calculators"
          kicker={t("today:doors.numbers.kicker")}
          title={t("today:doors.numbers.title")}
          body={t("today:doors.numbers.body")}
          cta={t("today:doors.numbers.cta")}
        />
      </section>

      {/* La figure ferme l'écran sur le filet que la section dessine déjà.
          C'est la figure de la porte « Aujourd'hui » du menu : cockpit et
          navigation se lisent alors comme un même système, sans un dessin de
          plus. Le slot dimensionne par la largeur, jamais par la hauteur —
          une hauteur en pixels ferait flotter la semelle au-dessus du filet. */}
      {settings.cockpit.art && (
        <IllustrationSlot
          ground="rule"
          className="zn-cockpit__art"
          art={DoorToday}
          brief={t("today:art.brief")}
          label={t("today:art.label")}
        />
      )}
    </div>
  );
}
