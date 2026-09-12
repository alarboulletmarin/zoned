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
import { focusHref, pickTodayFocus, type TodayFocus } from "@/lib/cockpit";
import { useIsEnglish } from "@/lib/i18n-utils";
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
  const href = focusHref(focus);

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

          {facts && <p className="zn-mono zn-cockpit__facts">{facts}</p>}

          <p className="zn-body zn-muted zn-measure">
            {focus.plan && focus.state !== "none"
              ? t(focus.isWeek ? "today:resume.inWeek" : "today:resume.inPlan", {
                  name: isEn ? focus.plan.nameEn : focus.plan.name,
                })
              : t("today:resume.none.body")}
          </p>

          <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <Button asChild size="lg">
              <Link to={href ?? "/plan/new"}>
                {href
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

/**
 * La bande des sept jours — une figure, pas un contrôle.
 *
 * Trois décisions qui tiennent ensemble :
 *
 * 1. **Le jour courant est en encre, jamais en vermillon.** Le bouton est le
 *    seul aplat d'accent de l'écran ; un second le neutraliserait.
 * 2. **La hauteur de barre est un canal redondant** à l'encre, comme
 *    `--zone-h-N` le fait dans `zones.css` : la bande reste lisible en niveaux
 *    de gris, ce qui est l'argument même du système.
 * 3. **Rien ne prétend être cliquable** — pas de cadre, pas de fond, pas de
 *    survol. Un jour cliquable serait de la navigation, donc un `role` et son
 *    contrat clavier, et ce dépôt a déjà livré deux fois un `role` sans son
 *    clavier. Taper un jour se fait sur `/plan/:id`, où le calendrier le fait.
 *
 * Un seul nom accessible, qui énonce la semaine EN MOTS : sept éléments de
 * liste à traverser pour une information qui tient en une phrase serait pire
 * que le silence.
 */
function WeekStrip({ focus }: { focus: TodayFocus }) {
  const { t } = useTranslation("today");

  // Les initiales sont pour l'œil ; le nom accessible a besoin des noms
  // entiers — « repos L, J » n'est pas une phrase.
  const letters = t("week.letters").split(",");
  const dayNames = t("week.dayNames").split(",");

  /* La hauteur porte les MINUTES du jour, pas le nombre de séances : presque
     toutes les journées en portent une, donc compter les séances faisait une
     constante et le canal ne disait rien. Les minutes, elles, dessinent la
     forme de la semaine — les jours faciles et la sortie longue. */
  const minutes = focus.week.map((day) =>
    day.reduce((n, session) => n + (session.estimatedDurationMin ?? 0), 0),
  );
  const longest = Math.max(1, ...minutes);
  const training = focus.week.filter((day) => day.length > 0).length;
  const restDays = focus.week
    .map((day, i) => (day.length === 0 ? dayNames[i] : null))
    .filter((x): x is string => x !== null);

  /* En pixels, pas en pourcentage : un `block-size` en % sur un enfant flex
     en colonne n'a pas de hauteur de référence définie et retombait au
     minimum — les sept barres rendaient identiques. Une donnée se convertit
     en géométrie ici, une fois. */
  const BAR_MIN = 6;
  const BAR_MAX = 40;
  const barHeight = (m: number) =>
    m === 0 ? BAR_MIN : BAR_MIN + Math.round((m / longest) * (BAR_MAX - BAR_MIN));

  return (
    <div
      className="zn-cockpit__week"
      role="img"
      aria-label={t("week.summary", {
        week: focus.weekNumber,
        count: training,
        rest: restDays.length > 0 ? restDays.join(", ") : t("week.noRest"),
      })}
    >
      {focus.week.map((day, index) => (
        <span key={index} className="zn-cockpit__day" data-today={index === focus.dayOfWeek || undefined}>
          <span className="zn-cockpit__day-letter">{letters[index]}</span>
          <span
            className="zn-cockpit__day-bar"
            data-rest={day.length === 0 || undefined}
            /* Un style inline est le bon outil : la valeur est une donnée du
               plan, pas un réglage de design. */
            style={{ "--bar-h": `${barHeight(minutes[index])}px` } as CSSProperties}
          />
        </span>
      ))}
    </div>
  );
}
