import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import { SEOHead } from "@/components/seo";
import { usePlans } from "@/hooks/usePlans";
import { useWorkout } from "@/hooks/useWorkouts";
import { useSettings } from "@/hooks/useSettings";
import {
  focusPlanHref,
  focusSessionHref,
  pickTodayFocus,
  sessionHref,
  type TodayFocus,
} from "@/lib/cockpit";
import { ZoneBar, toZoneBarBlocks } from "@/components/visualization";
import { useIsEnglish } from "@/lib/i18n-utils";
import { isStrengthWorkout } from "@/types";
import DoorToday from "@/assets/doodles/door-today.svg?react";

/**
 * Le cockpit.
 *
 * Tâche et fin : « j'arrive pour savoir quoi faire aujourd'hui ; j'ai fini
 * quand je sais quoi courir. » La fin est atteinte SUR CET ÉCRAN.
 *
 * Contexte : quotidien, debout, dix secondes, souvent avant de sortir. Donc
 * vitesse et constance, pas pédagogie. Zéro question posée à l'arrivée.
 *
 * La première version portait en plus trois `DoorCard` et deux cartes de
 * raccourci : cinq boîtes de la même forme, 1838 px sur un téléphone, et les
 * trois portes ne faisaient que répéter ce que la pastille MENU contient déjà
 * (et la barre du haut sur bureau). Elles sont parties. Ce qui les remplace
 * n'est pas de la navigation mais de l'information : **la bande des sept
 * jours**, qui répond à « et demain ? » sans un tap de plus.
 *
 * Un seul primaire, donc un seul aplat vermillon : le bouton. Le jour courant
 * de la bande est marqué à l'ENCRE — deux accents sur un écran se
 * neutraliseraient.
 *
 * `/` reste la landing publique et indexée ; celle-ci est l'écran privé, donc
 * `noindex`, hors sitemap et hors prérendu.
 */
export function TodayPage() {
  const { t } = useTranslation(["today", "common"]);
  const isEn = useIsEnglish();
  const { plans, isLoading } = usePlans();
  const { settings } = useSettings();

  // `new Date()` une seule fois par montage : un rendu qui recalcule « quel
  // jour on est » peut changer d'avis en cours de session.
  const focus = useMemo(() => pickTodayFocus(plans, new Date()), [plans]);
  const sessionUrl = focusSessionHref(focus);
  const planUrl = focusPlanHref(focus);

  const dateLine = new Date().toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* Le nom de la séance du jour, quand il n'y en a qu'une : c'est lui qui fait
     le titre. Le catalogue est en chunks chargés à la demande, donc c'est
     asynchrone — d'où le repli sur « une séance t'attend » le temps du
     chargement, qui est aussi ce qu'on affiche quand il y en a plusieurs. */
  const soleSession = focus.sessions.length === 1 ? focus.sessions[0] : undefined;
  const { workout } = useWorkout(soleSession?.workoutId);

  /* Le titre EST la réponse. Un `<h1>` qui dirait « Aujourd'hui » au-dessus
     d'un chapô « à faire aujourd'hui » et d'une ligne « une séance t'attend »
     ferait dire trois fois la même chose avant le contenu — et la porte de la
     nav dit déjà « Aujourd'hui ». */
  const headline = useMemo(() => {
    if (focus.state === "none") return t("today:resume.none.line");
    if (focus.state === "rest") return t("today:resume.rest.line");
    if (focus.state === "upcoming")
      return t("today:resume.upcoming.line", { count: focus.daysUntilStart });
    if (workout) return isEn ? workout.nameEn : workout.name;
    return t("today:resume.session.line", {
      count: focus.sessions.length,
      week: focus.weekNumber,
    });
  }, [focus, isEn, t, workout]);

  /* Le profil de la séance du jour. Mémoïsé : il traverse toute la structure
     de la séance. */
  const profile = useMemo(
    () => (workout && !isStrengthWorkout(workout) ? toZoneBarBlocks(workout) : null),
    [workout],
  );

  /** Les chiffres de la séance, en une ligne mono. Pas un tableau. */
  const facts = useMemo(() => {
    const total = focus.sessions.reduce((n, s) => n + (s.estimatedDurationMin ?? 0), 0);
    const parts: string[] = [];
    if (focus.weekNumber > 0) parts.push(t("today:facts.week", { n: focus.weekNumber }));
    if (total > 0) parts.push(t("today:facts.minutes", { n: total }));
    if (focus.sessions.length > 1)
      parts.push(t("today:facts.sessions", { count: focus.sessions.length }));
    return parts.join(" · ");
  }, [focus, t]);

  return (
    <div className="zn-cockpit">
      <SEOHead title={t("today:seoTitle")} description={t("today:seoDescription")} noindex />

      {isLoading ? (
        /* La lecture de localStorage est synchrone : l'attente est d'une frame.
           Pas de squelette qui clignote, mais une place réservée — le budget
           Lighthouse bloque à CLS exactement 0. */
        <div className="zn-cockpit__hold" aria-hidden="true" />
      ) : (
        <section className="zn-cockpit__resume">
          <span className="zn-kicker">{dateLine}</span>

          {focus.week.length > 0 && <WeekStrip focus={focus} />}

          <h1 className="zn-display zn-cockpit__headline" data-level="3">
            {headline}
          </h1>

          {/* L'aperçu de la séance : un bloc par phase, la largeur dit le
              temps et l'intensité est codée deux fois — densité d'encre ET
              hauteur. C'est beaucoup d'information sans un mot de plus, et
              c'est le composant que les cartes de la bibliothèque utilisent
              déjà (`toZoneBarBlocks`), pas un second dessin de profil. */}
          {profile && profile.length > 0 && (
            <ZoneBar blocks={profile} condense height={36} className="zn-cockpit__profile" />
          )}

          {facts && <p className="zn-mono zn-cockpit__facts">{facts}</p>}

          {/* Le nom du plan était un texte mort. C'est maintenant le chemin
              vers le plan, à un tap, sans ajouter un bouton à l'écran.

              Il s'écrivait « Dans « Reprise après longue pause » » : une
              PHRASE en corps de texte, donc du même poids que le titre de la
              séance, et des guillemets français que l'app n'emploie nulle part
              ailleurs pour nommer un objet — le fil d'Ariane de la séance
              (WorkoutDetailPage) pose le nom du plan nu, sans guillemets ni
              préposition. C'est ce vocabulaire-là qui est repris : le rôle en
              micro-label mono, la valeur à côté. Un libellé, pas une phrase. */}
          {focus.plan && focus.state !== "none" && planUrl ? (
            <Link to={planUrl} className="zn-cockpit__plan">
              <span className="zn-kicker zn-kicker--xs">
                {t(focus.isWeek ? "today:resume.inWeek" : "today:resume.inPlan")}
              </span>
              <span className="zn-cockpit__plan-name">
                {isEn ? focus.plan.nameEn : focus.plan.name}
              </span>
            </Link>
          ) : (
            <p className="zn-body zn-muted zn-measure">{t("today:resume.none.body")}</p>
          )}

          <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <Button asChild size="lg">
              <Link to={sessionUrl ?? "/plan/new"}>
                {sessionUrl
                  ? t(
                      focus.state === "rest"
                        ? focus.isWeek
                          ? "today:resume.openWeek"
                          : "today:resume.openPlan"
                        : "today:resume.openSession",
                    )
                  : t("today:resume.none.cta")}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Les deux gestes courts, en ligne de liens et non en cartes : ce sont
          des sorties, pas des actions primaires. Ils répondent aux deux seuls
          moments où l'on ne veut pas décider — « je ne sais pas quoi faire » et
          « je ne veux pas m'engager sur seize semaines ». */}
      {settings.cockpit.shortcuts && (
        <p className="zn-cockpit__exits">
          <Link to="/library/draw">{t("today:quick.draw")}</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/weeks/new">{t("today:quick.week")}</Link>
        </p>
      )}

      {/* La figure ferme l'écran, en dernier dans l'ordre de lecture : elle ne
          retarde jamais la réponse. C'est la figure de la porte « Aujourd'hui »
          du menu — cockpit et navigation se lisent comme un même système, sans
          un dessin de plus. Le slot dimensionne par la LARGEUR, le viewBox
          donne le ratio : une hauteur en pixels ferait flotter la semelle. */}
      {/* Pas de `ground="rule"` : `.zn-cockpit` n'a jamais eu de bordure basse
          depuis que la rangée des portes a été retirée (b70b2dd), donc la prop
          mordait déjà un filet inexistant. Elle part avec les séparateurs. */}
      {settings.cockpit.art && (
        <IllustrationSlot
          className="zn-cockpit__art"
          art={DoorToday}
          brief={t("today:art.brief")}
          label={t("today:art.label")}
        />
      )}
    </div>
  );
}

/**
 * La bande des sept jours — la semaine en aperçu, et sept raccourcis.
 *
 * Elle a d'abord été écrite comme une figure non cliquable (`role="img"`, un
 * seul nom accessible) pour ne pas devoir un contrat clavier. Le propriétaire
 * a demandé moins de clics : un jour qui mène à sa séance vaut mieux qu'un jour
 * qu'on regarde. Et l'objection tombe d'elle-même — ce sont des **liens**, donc
 * le focus, les flèches du navigateur, le clic-milieu et « ouvrir dans un
 * nouvel onglet » viennent gratuitement. Il n'y a pas de `role` à doter.
 *
 * Ce qui reste des décisions d'origine :
 *
 * - **Le jour courant est marqué à l'encre, jamais au vermillon.** Le bouton
 *   est le seul aplat d'accent de l'écran ; un second le neutraliserait.
 * - **La hauteur de barre est un canal redondant** à l'encre, comme
 *   `--zone-h-N` dans `zones.css` : la bande reste lisible en niveaux de gris.
 *   Elle porte les MINUTES du jour, pas le nombre de séances — presque toutes
 *   les journées en portent une, donc compter les séances faisait une
 *   constante qui ne disait rien.
 *
 * Un jour de repos n'est pas un lien : il n'y a rien à ouvrir, et un lien qui
 * mène au même endroit que rien est un faux affordance.
 */
function WeekStrip({ focus }: { focus: TodayFocus }) {
  const { t } = useTranslation("today");

  // Les initiales sont pour l'œil ; les noms accessibles ont besoin des noms
  // entiers — « samedi » et pas « S ».
  const letters = t("week.letters").split(",");
  const dayNames = t("week.dayNames").split(",");

  const minutes = focus.week.map((day) =>
    day.reduce((n, session) => n + (session.estimatedDurationMin ?? 0), 0),
  );
  const longest = Math.max(1, ...minutes);

  /* En pixels, pas en pourcentage : un `block-size` en % sur un enfant flex en
     colonne n'a pas de hauteur de référence et retombait au minimum — les sept
     barres rendaient identiques. La donnée devient géométrie ici, une fois. */
  const BAR_MIN = 6;
  const BAR_MAX = 40;
  const barHeight = (m: number) =>
    m === 0 ? BAR_MIN : BAR_MIN + Math.round((m / longest) * (BAR_MAX - BAR_MIN));

  return (
    <nav className="zn-cockpit__week" aria-label={t("week.label", { week: focus.weekNumber })}>
      {focus.week.map((day, index) => {
        const isToday = index === focus.dayOfWeek;
        const bar = (
          <>
            <span className="zn-cockpit__day-letter">{letters[index]}</span>
            <span
              className="zn-cockpit__day-bar"
              data-rest={day.length === 0 || undefined}
              /* Un style inline est le bon outil : la valeur est une donnée du
                 plan, pas un réglage de design. */
              style={{ "--bar-h": `${barHeight(minutes[index])}px` } as CSSProperties}
            />
          </>
        );

        if (day.length === 0) {
          return (
            <span
              key={index}
              className="zn-cockpit__day"
              data-today={isToday || undefined}
              aria-label={t("week.rest", { day: dayNames[index] })}
            >
              {bar}
            </span>
          );
        }

        return (
          <Link
            key={index}
            to={day.length === 1 ? sessionHref(day[0]) : `${focusPlanHref(focus)}?week=${focus.weekNumber}`}
            className="zn-cockpit__day"
            data-today={isToday || undefined}
            aria-current={isToday ? "date" : undefined}
            aria-label={t("week.day", {
              day: dayNames[index],
              count: day.length,
              minutes: minutes[index],
            })}
          >
            {bar}
          </Link>
        );
      })}
    </nav>
  );
}
