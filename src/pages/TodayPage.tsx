import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import { SessionCompletionPanel } from "@/components/domain/SessionCompletionPanel";
import { SEOHead } from "@/components/seo";
import { usePlans } from "@/hooks/usePlans";
import { useWorkout } from "@/hooks/useWorkouts";
import { useSettings } from "@/hooks/useSettings";
import {
  dayStatus,
  focusPlanHref,
  focusSessionHref,
  pickTodayFocus,
  planPosition,
  sessionHref,
  type TodayFocus,
} from "@/lib/cockpit";
import { updateSessionCompletion, type SessionCompletionData } from "@/lib/planStorage";
import { getWorkoutPhaseSteps, summarizeWorkoutSteps } from "@/lib/workoutStructure";
import { formatPace } from "@/lib/planGenerator/paceEngine";
import {
  convertDistance,
  convertPace,
  formatDistanceWithUnit,
  getDistanceUnit,
  getPaceUnit,
} from "@/lib/units";
import { ZoneBar, formatDurationMinutes, toZoneBarBlocks } from "@/components/visualization";
import { useIsEnglish } from "@/lib/i18n-utils";
import { isStrengthWorkout } from "@/types";
import type { PlanSession } from "@/types/plan";
import type { UnitSystem } from "@/types/settings";
import DoorToday from "@/assets/doodles/door-today.svg?react";

/**
 * Le cockpit.
 *
 * Tâche et fin : j'arrive pour savoir quoi faire aujourd'hui ; j'ai fini
 * quand je sais quoi courir, ET quand j'ai pu dire que c'était fait. La fin
 * est atteinte SUR CET ÉCRAN.
 *
 * Contexte : quotidien, debout, dix secondes, souvent avant de sortir. Donc
 * vitesse et constance, pas pédagogie. Zéro question posée à l'arrivée.
 *
 * La première version portait en plus trois `DoorCard` et deux cartes de
 * raccourci : cinq boîtes de la même forme, 1838 px sur un téléphone, et les
 * trois portes ne faisaient que répéter ce que la pastille MENU contient déjà
 * (et la barre du haut sur bureau). Elles sont parties. Ce qui les remplace
 * n'est pas de la navigation mais de l'information : **la bande des sept
 * jours**, qui répond à et demain ? sans un tap de plus.
 *
 * La deuxième version savait nommer la séance sans rien dire de ce qu'elle
 * demande, et sans jamais pouvoir la clore : l'écran était le même à 6 h et à
 * 23 h. Deux manques ont été comblés ensemble, parce qu'ils se tiennent.
 *
 * - **La ligne d'exécution** dit la structure et l'allure AVANT d'ouvrir. Le
 *   bouton cesse d'être le seul accès à l'information, donc il ne dit plus
 *   ouvrir mais voir le détail.
 * - **La clôture** donne le point d'arrêt. Elle réutilise le panneau du plan,
 *   pas un second formulaire, et c'est elle qui fait enfin dire quelque chose
 *   aux sept barres : prévu est creux, fait est plein, sauté est hachuré.
 *
 * Un seul primaire, donc un seul aplat vermillon : le bouton. Le jour courant
 * de la bande est marqué à l'ENCRE, deux accents sur un écran se
 * neutraliseraient, et la clôture est en contour pour la même raison.
 *
 * `/` reste la landing publique et indexée ; celle-ci est l'écran privé, donc
 * `noindex`, hors sitemap et hors prérendu.
 */
export function TodayPage() {
  const { t } = useTranslation(["today", "common", "plan"]);
  const isEn = useIsEnglish();
  const { plans, isLoading, reload } = usePlans();
  const { settings } = useSettings();

  // `new Date()` une seule fois par montage : un rendu qui recalcule quel
  // jour on est peut changer d'avis en cours de session. La ligne de date le
  // relisait à chaque rendu, ce qui pouvait la désaccorder de la bande une
  // seconde avant minuit ; elle lit le même instant que tout le reste.
  const now = useMemo(() => new Date(), []);
  const focus = useMemo(() => pickTodayFocus(plans, now), [plans, now]);
  const sessionUrl = focusSessionHref(focus);
  const planUrl = focusPlanHref(focus);

  const dateLine = now.toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* Le nom de la séance du jour, quand il n'y en a qu'une : c'est lui qui fait
     le titre. Le catalogue est en chunks chargés à la demande, donc c'est
     asynchrone, d'où le repli sur une séance t'attend le temps du
     chargement, qui est aussi ce qu'on affiche quand il y en a plusieurs. */
  const soleSession = focus.sessions.length === 1 ? focus.sessions[0] : undefined;
  const { workout } = useWorkout(soleSession?.workoutId);

  /* Le titre EST la réponse. Un `<h1>` qui dirait Aujourd'hui au-dessus
     d'un chapô à faire aujourd'hui et d'une ligne une séance t'attend
     ferait dire trois fois la même chose avant le contenu, et la porte de la
     nav dit déjà Aujourd'hui. */
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


  /**
   * Le combien : la durée, puis la distance quand le plan en vise une.
   *
   * Elle prend sa propre ligne, et elle passe AVANT semaine 1. La durée est
   * l'information qui décide de sortir ou pas ; le numéro de semaine est un
   * repère qu'on vérifie du coin de l'oeil. L'ordre disait l'inverse.
   *
   * `formatDurationMinutes` et pas `{{n}} min` : la page de séance écrivait
   * 1h03 pendant que celle-ci écrivait 93 min. Un seul formateur, celui que
   * les cartes de la bibliothèque emploient déjà.
   */
  const sizeLine = useMemo(() => {
    const total = focus.sessions.reduce((n, s) => n + (s.estimatedDurationMin ?? 0), 0);
    if (total <= 0) return null;
    const parts = [formatDurationMinutes(total)];
    /* Au kilomètre entier, et précédée d'un tilde : c'est une cible, pas une
       mesure. 14,2 km donnerait une précision que le plan n'a pas, et poserait
       en passant la question du séparateur décimal. */
    const km = focus.sessions.reduce((n, s) => n + (s.targetDistanceKm ?? 0), 0);
    if (km > 0) {
      parts.push(t("today:facts.distance", {
        km: Math.round(convertDistance(km, settings.unitSystem)),
        unit: getDistanceUnit(settings.unitSystem),
      }));
    }
    if (focus.sessions.length > 1) {
      parts.push(t("today:facts.sessions", { count: focus.sessions.length }));
    }
    return parts.join(" · ");
  }, [focus, settings.unitSystem, t]);

  /**
   * Le comment : ce que la séance demande, AVANT de l'ouvrir.
   *
   * Deux moitiés qui n'arrivent pas en même temps, et c'est ce qui dicte la
   * forme :
   *
   * - l'allure est **synchrone**, elle est déjà sur la séance du plan
   *   (`paceNotes`, écrit par le générateur et par les plans du catalogue) ;
   * - le corps de séance est **asynchrone**, il faut le chunk du catalogue.
   *
   * Donc la ligne est réservée en CSS sur deux lignes : une semaine seule
   * (`weekToPlan`) ne porte AUCUN `paceNotes`, la ligne y est vide jusqu'au
   * chargement, et ordonner le synchrone en premier ne suffirait pas. Réserver
   * est la seule réponse qui ne pousse pas le bouton sous le doigt.
   */
  const mainSummary = useMemo(() => {
    // Une séance de renforcement n'a pas de corps zoné à résumer : son
    // vocabulaire est celui des exercices, pas celui des phases.
    if (!workout || isStrengthWorkout(workout)) return null;
    const steps = getWorkoutPhaseSteps(workout, "main");
    if (steps.length === 0) return null;
    /* Un corps de séance d'un seul segment continu n'a pas de structure à
       résumer : il rendrait sa propre durée de MODÈLE, 35', juste sous la
       durée du PLAN, 1h33, qui l'a mise à l'échelle. Deux nombres qui se
       contredisent valent moins que pas de nombre du tout ; l'allure en
       dessous suffit à dire comment courir une sortie continue. */
    if (steps.length === 1 && steps[0].kind === "segment") return null;
    const summary = summarizeWorkoutSteps(steps, isEn).trim();
    return summary.length > 0 ? summary : null;
  }, [workout, isEn]);

  const pace = useMemo(
    () => (soleSession ? paceRangeOf(soleSession, isEn, settings.unitSystem) : null),
    [soleSession, isEn, settings.unitSystem],
  );

  const status = soleSession?.status;
  const isResolved = status === "completed" || status === "modified" || status === "skipped";

  /** Ce qui s'est passé, une fois la séance close. Le point d'arrêt.
   *
   * Elle ne redit PAS fait ou passé : le micro-label au-dessus du titre le dit
   * déjà, et la barre du jour aussi. Elle porte les chiffres réels, qui sont
   * la seule chose que ni l'un ni l'autre ne peut montrer. Une séance sautée
   * n'en a aucun, elle ne laisse donc rien ici. */
  const doneLine = useMemo(() => {
    if (!soleSession || !isResolved || status === "skipped") return null;
    const parts: string[] = [];
    const min = soleSession.actualDurationMin ?? soleSession.estimatedDurationMin;
    if (min > 0) parts.push(formatDurationMinutes(min));
    if (soleSession.actualDistanceKm != null && soleSession.actualDistanceKm > 0) {
      parts.push(formatDistanceWithUnit(soleSession.actualDistanceKm, settings.unitSystem));
    }
    if (soleSession.rpe != null) parts.push(t("today:facts.rpe", { n: soleSession.rpe }));
    return parts.join(" · ") || null;
  }, [soleSession, isResolved, status, settings.unitSystem, t]);

  /** Un jour de repos n'est pas un trou : il dit quand on ressort. */
  const nextLine = useMemo(() => {
    if (focus.state !== "rest" || focus.week.length === 0) return null;
    const names = t("today:week.dayNames").split(",");
    for (let step = 1; step <= 6; step++) {
      const index = focus.dayOfWeek + step;
      if (index > 6) break;
      const day = focus.week[index];
      if (!day || day.length === 0) continue;
      const min = day.reduce((n, s) => n + (s.estimatedDurationMin ?? 0), 0);
      return t("today:resume.next", {
        day: names[index],
        duration: formatDurationMinutes(min),
      });
    }
    return null;
  }, [focus, t]);

  const execLine = useMemo(() => {
    if (focus.state === "rest") return nextLine;
    if (focus.state !== "session") return null;
    if (isResolved) return doneLine;
    return [mainSummary, pace].filter(Boolean).join(" · ") || null;
  }, [focus.state, nextLine, doneLine, isResolved, mainSummary, pace]);

  /* La ligne est RÉSERVÉE tant que quelque chose peut encore y arriver, donc
     sur une séance en attente de son catalogue. Une fois la séance close, ou
     un jour de repos, plus rien n'est asynchrone : réserver deux lignes de
     vide n'y ferait qu'un trou. */
  const holdsExec = focus.state === "session" && soleSession != null && !isResolved;

  /* Le créneau du profil est réservé, plein ou vide : la barre n'arrivait
     qu'avec le catalogue et poussait de cinquante pixels tout ce qui la suit,
     bouton compris. Et une séance de renforcement n'a pas de zones : plutôt
     que d'effondrer le créneau, elle porte la marque maison du non mesuré, la
     hachure à 45 degrés que `zone.css` dessine déjà pour `data-zone="0"`. */
  const profile = useMemo(() => {
    if (!workout) return null;
    if (isStrengthWorkout(workout)) {
      return [{ seconds: Math.max(1, (soleSession?.estimatedDurationMin ?? 0) * 60), zone: 0 as const }];
    }
    return toZoneBarBlocks(workout);
  }, [workout, soleSession]);

  /** Où l'on en est du plan : le dénominateur, l'échéance, ce qu'on vise. */
  const position = useMemo(() => planPosition(focus, now), [focus, now]);

  const positionLine = useMemo(() => {
    if (!position) return null;
    return [
      position.totalWeeks > 0
        ? t("today:resume.position", { n: position.weekNumber, total: position.totalWeeks })
        : t("today:resume.positionOpen", { n: position.weekNumber }),
      position.daysToGoal != null ? t("today:resume.countdown", { days: position.daysToGoal }) : null,
      position.goalName,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [position, t]);

  /* L'état de navigation que la page de séance attend. Sans lui elle retombe
     sur la durée du MODÈLE au lieu de celle du plan : c'est pour ça que le
     cockpit disait 93 min pendant qu'elle disait 1h03. Ce ne sont pas deux
     formats, ce sont deux nombres. Copié de PlanViewPage, moins le `scrollY`,
     le cockpit tient sur un écran et n'a pas de position à restaurer. */
  const planWeek = useMemo(
    () => focus.plan?.weeks.find((w) => w.weekNumber === focus.weekNumber),
    [focus.plan, focus.weekNumber],
  );

  const sessionState = useCallback(
    (session: PlanSession) => ({
      from: "plan" as const,
      planId: focus.plan?.id,
      planName: focus.plan ? (isEn ? focus.plan.nameEn : focus.plan.name) : "",
      weekNumber: focus.weekNumber,
      volumePercent: planWeek?.volumePercent,
      estimatedDurationMin: session.estimatedDurationMin,
      targetDistanceKm: session.targetDistanceKm,
    }),
    [focus.plan, focus.weekNumber, isEn, planWeek],
  );

  /* La clôture. Elle réutilise le panneau du plan, pas un second formulaire :
     les deux ne peuvent donc pas diverger. Une journée à plusieurs séances n'a
     pas de cible unique, un seul bouton ne saurait pas laquelle clore, et le
     bouton principal mène déjà au plan qui les montre toutes. */
  const soleIndex = focus.sessionIndexes.length === 1 ? focus.sessionIndexes[0] : undefined;
  const canClose =
    focus.state === "session" && soleSession != null && soleIndex != null && focus.plan != null;

  const [closeOpen, setCloseOpen] = useState(false);
  const [closeAnchor, setCloseAnchor] = useState<HTMLElement | null>(null);

  const handleClose = useCallback(
    (data: SessionCompletionData) => {
      if (!focus.plan || soleIndex == null) return;
      const ok = updateSessionCompletion(focus.plan.id, focus.weekNumber, soleIndex, data);
      if (!ok) {
        toast.error(t("common:errors.planSaveFailed"));
        return;
      }
      // `reload` remplace le tableau des plans, donc `focus` se recalcule et la
      // bande comme la ligne de clôture suivent sans rien de plus.
      reload();
      setCloseOpen(false);
      toast.success(t("plan:completion.saved"));
    },
    [focus.plan, focus.weekNumber, soleIndex, reload, t],
  );

  /** Le micro-label au-dessus du titre. Il dit l'état, pas seulement le jour. */
  const stateLabel = isResolved
    ? t(`plan:completion.${status}`)
    : t("today:resume.todayLabel");

  return (
    <div className="zn-cockpit">
      <SEOHead title={t("today:seoTitle")} description={t("today:seoDescription")} noindex />

      {isLoading ? (
        /* La lecture de localStorage est synchrone : l'attente est d'une frame.
           Pas de squelette qui clignote, mais une place réservée, le budget
           Lighthouse bloque à CLS exactement 0. */
        <div className="zn-cockpit__hold" aria-hidden="true" />
      ) : (
        <section className="zn-cockpit__resume">
          <span className="zn-kicker">{dateLine}</span>

          {focus.week.length > 0 && <WeekStrip focus={focus} sessionState={sessionState} />}

          {/* Le titre, sa taille et ce qu'elle demande ne font qu'UNE phrase :
              ils sont serrés à `--sp-4` pendant que la section respire à
              `--sp-7`. C'est cet écart-là qui fait la hiérarchie, pas les
              corps de texte pris isolément. */}
          <div className="zn-cockpit__answer">
            <span className="zn-kicker zn-kicker--xs">{stateLabel}</span>

            {/* Le titre EST la réponse. Un `<h1>` qui dirait Aujourd'hui
                au-dessus d'un chapô à faire aujourd'hui et d'une ligne une
                séance t'attend ferait dire trois fois la même chose avant le
                contenu, et la porte de la nav dit déjà Aujourd'hui. */}
            <h1 className="zn-display zn-cockpit__headline" data-level="3">
              {headline}
            </h1>

            {sizeLine && <p className="zn-cockpit__size">{sizeLine}</p>}

            {(holdsExec || execLine) && (
              <p className="zn-cockpit__how" data-hold={holdsExec || undefined}>
                {execLine}
              </p>
            )}
          </div>

          {/* Le nom du plan était un texte mort. C'est le chemin vers le plan,
              à un tap, sans ajouter un bouton à l'écran.

              Il ne dit plus seulement d'où vient la séance, il dit OÙ L'ON EN
              EST : un plan ne tient que par sa fin, et `semaine 1` sans
              dénominateur ni échéance laissait la sortie du jour flotter. Le
              rôle en micro-label mono, la valeur à côté ; un libellé, pas une
              phrase. */}
          {focus.plan && focus.state !== "none" && planUrl ? (
            <Link to={planUrl} className="zn-cockpit__plan">
              <span className="zn-kicker zn-kicker--xs">
                {t(focus.isWeek ? "today:resume.inWeek" : "today:resume.inPlan")}
              </span>
              <span className="zn-cockpit__plan-name">
                {positionLine ?? (isEn ? focus.plan.nameEn : focus.plan.name)}
              </span>
            </Link>
          ) : (
            <p className="zn-body zn-muted zn-measure">{t("today:resume.none.body")}</p>
          )}

          {/* L'aperçu de la séance : un bloc par phase, la largeur dit le
              temps et l'intensité est codée deux fois, densité d'encre ET
              hauteur. C'est beaucoup d'information sans un mot de plus, et
              c'est le composant que les cartes de la bibliothèque utilisent
              déjà (`toZoneBarBlocks`), pas un second dessin de profil.

              Le créneau garde sa hauteur même vide : la barre n'arrive qu'avec
              le chunk du catalogue, et sans réserve elle poussait le bouton. */}
          {focus.state === "session" && soleSession && (
            <div className="zn-cockpit__profile-slot">
              {profile && profile.length > 0 && (
                <ZoneBar blocks={profile} condense height={36} className="zn-cockpit__profile" />
              )}
            </div>
          )}

          <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            {/* Le bouton n'est plus le seul accès à l'information, puisque la
                ligne du dessus dit déjà ce que la séance demande : il ne dit
                donc plus ouvrir mais voir le détail. Et il descend de `lg` à
                la taille normale, ce qui le met à la même hauteur que la
                clôture à côté de lui : deux boutons, un cluster, pas une grosse
                chose et une petite. */}
            <Button asChild className="zn-cockpit__cta">
              <Link
                to={sessionUrl ?? "/plan/new"}
                state={soleSession ? sessionState(soleSession) : undefined}
              >
                {/* Le libellé suit la DESTINATION, pas l'état : voir le détail
                    quand il mène à une séance, ouvrir mon plan quand il mène
                    au plan, ce qui est le cas un jour de repos, avant le
                    début, et une journée à plusieurs séances. Il disait voir
                    le détail en menant au calendrier. */}
                {sessionUrl
                  ? t(
                      focus.sessions.length === 1
                        ? "today:resume.openDetail"
                        : focus.isWeek
                          ? "today:resume.openWeek"
                          : "today:resume.openPlan",
                    )
                  : t("today:resume.none.cta")}
                <ArrowRight />
              </Link>
            </Button>

            {canClose && (
              <Button
                variant="outline"
                onClick={(event) => {
                  // L'ancre du popover est le bouton lui-même. `currentTarget`
                  // l'a déjà, pas besoin d'une ref à tenir à jour.
                  setCloseAnchor(event.currentTarget);
                  setCloseOpen(true);
                }}
              >
                {isResolved ? t("today:resume.reclose") : t("plan:completion.markDone")}
              </Button>
            )}
          </div>

          {/* Les deux gestes courts, en ligne de liens et non en cartes : ce
              sont des sorties, pas des actions primaires. Ils répondent aux
              deux seuls moments où l'on ne veut pas décider, je ne sais pas
              quoi faire et je ne veux pas m'engager sur seize semaines.

              Ils remontent sous le bouton : ils arrivaient après la figure,
              donc après un grand vide, alors que ce sont les deux secondes
              réponses de l'écran. Et les deux registres se distinguent par la
              MARQUE, pas par le poids : le tirage porte une flèche et pas de
              souligné, c'est un geste ; Ma semaine porte un souligné et pas de
              flèche, c'est un lieu. */}
          {settings.cockpit.shortcuts && (
            <p className="zn-cockpit__exits">
              <Link to="/library/draw" className="zn-cockpit__exit" data-role="move">
                {t("today:quick.draw")}
                <ArrowRight />
              </Link>
              <Link to="/weeks/new" className="zn-cockpit__exit">
                {t("today:quick.week")}
              </Link>
            </p>
          )}
        </section>
      )}

      {/* La figure ferme l'écran, en dernier dans l'ordre de lecture : elle ne
          retarde jamais la réponse. C'est la figure de la porte Aujourd'hui
          du menu, cockpit et navigation se lisent comme un même système, sans
          un dessin de plus. Le slot dimensionne par la LARGEUR, le viewBox
          donne le ratio : une hauteur en pixels ferait flotter la semelle.

          Elle a maigri d'un quart : elle occupait le tiers bas de l'écran,
          c'est-à-dire la zone du pouce la plus atteignable, dépensée en
          décoration juste sous l'appel primaire. */}
      {settings.cockpit.art && (
        <IllustrationSlot
          className="zn-cockpit__art"
          art={DoorToday}
          brief={t("today:art.brief")}
          label={t("today:art.label")}
        />
      )}

      {/* Le panneau de clôture du plan, tel quel : une feuille au doigt, un
          popover ancré au bouton au pointeur fin. Un second formulaire ici
          aurait divergé du premier au premier changement. */}
      <SessionCompletionPanel
        open={closeOpen}
        onOpenChange={setCloseOpen}
        session={closeOpen ? (soleSession ?? null) : null}
        weekNumber={focus.weekNumber}
        sessionName={headline}
        onSave={handleClose}
        anchorElement={closeAnchor}
      />
    </div>
  );
}

/**
 * L'allure prescrite, dans l'unité de la personne.
 *
 * `paceNotes` est structuré et écrit par le générateur comme par les plans du
 * catalogue, donc il se convertit ; `notes` est du texte déjà composé, en
 * kilomètres, et ne sert que de repli. Sa PREMIÈRE ligne est toujours
 * l'allure, les suivantes disent les répétitions, la sortie longue et le
 * dénivelé, qui sont déjà dits ailleurs sur l'écran.
 */
function paceRangeOf(session: PlanSession, isEn: boolean, unit: UnitSystem): string | null {
  const note = session.paceNotes?.[0];
  if (note) {
    const lo = formatPace(convertPace(note.paceMinKm, unit));
    const hi = formatPace(convertPace(note.paceMaxKm, unit));
    return `${lo} - ${hi}${getPaceUnit(unit)}`;
  }
  const raw = (isEn ? session.notesEn : session.notes) ?? session.notes;
  const first = raw?.split("\n")[0]?.trim();
  return first && first.length > 0 ? first : null;
}

/**
 * La bande des sept jours, la semaine en aperçu, et sept raccourcis.
 *
 * Elle a d'abord été écrite comme une figure non cliquable (`role="img"`, un
 * seul nom accessible) pour ne pas devoir un contrat clavier. Le propriétaire
 * a demandé moins de clics : un jour qui mène à sa séance vaut mieux qu'un jour
 * qu'on regarde. Et l'objection tombe d'elle-même, ce sont des **liens**, donc
 * le focus, les flèches du navigateur, le clic-milieu et ouvrir dans un
 * nouvel onglet viennent gratuitement. Il n'y a pas de `role` à doter.
 *
 * **Trois canaux, trois choses.** Tant que l'encre disait à la fois c'est
 * aujourd'hui et c'est la plus grosse séance, on ne savait pas si dimanche
 * ressortait parce qu'on y était ou parce qu'il était long, et sept barres
 * n'informaient sur rien :
 *
 * - **la hauteur** porte les MINUTES du jour, et rien d'autre. Pas le nombre
 *   de séances : presque toutes les journées en portent une, donc les compter
 *   faisait une constante qui ne disait rien.
 * - **la forme** porte le statut. Prévu est un contour, fait est un plein,
 *   sauté est hachuré, repos est un filet. Une distinction de FORME, pas de
 *   teinte : la bande reste lisible en niveaux de gris, ce qui est l'argument
 *   du système, comme `--zone-h-N` dans `zones.css`.
 * - **la lettre** porte le jour courant, à l'ENCRE et jamais au vermillon : le
 *   bouton est le seul aplat d'accent de l'écran, un second le neutraliserait.
 *   Elle le portait sur la barre, où il se confondait désormais avec fait.
 *
 * Et le jour courant est le seul à porter sa valeur : une échelle de hauteurs
 * sans une seule graduation ne se lit pas. Au corps mono le plus petit, c'est
 * un repère d'axe, pas une seconde annonce.
 *
 * Un jour de repos n'est pas un lien : il n'y a rien à ouvrir, et un lien qui
 * mène au même endroit que rien est un faux affordance.
 */
function WeekStrip({
  focus,
  sessionState,
}: {
  focus: TodayFocus;
  sessionState: (session: PlanSession) => object;
}) {
  const { t } = useTranslation("today");

  // Les initiales sont pour l'œil ; les noms accessibles ont besoin des noms
  // entiers, samedi et pas S.
  const letters = t("week.letters").split(",");
  const dayNames = t("week.dayNames").split(",");

  const minutes = focus.week.map((day) =>
    day.reduce((n, session) => n + (session.actualDurationMin ?? session.estimatedDurationMin ?? 0), 0),
  );
  const longest = Math.max(1, ...minutes);

  /* En pixels, pas en pourcentage : un `block-size` en % sur un enfant flex en
     colonne n'a pas de hauteur de référence et retombait au minimum, les sept
     barres rendaient identiques. La donnée devient géométrie ici, une fois.

     Le plancher est passé de 6 à 8 px : la forme prévue est désormais un
     CONTOUR d'1,5 px, et à 6 px de haut les deux traits se rejoignent, le
     creux redevient un plein. 8 px laissent 5 px d'intérieur, de quoi voir le
     vide. */
  const BAR_MIN = 8;
  const BAR_MAX = 40;
  const barHeight = (m: number) =>
    m === 0 ? BAR_MIN : BAR_MIN + Math.round((m / longest) * (BAR_MAX - BAR_MIN));

  return (
    <nav className="zn-cockpit__week" aria-label={t("week.label", { week: focus.weekNumber })}>
      {focus.week.map((day, index) => {
        const isToday = index === focus.dayOfWeek;
        const shape = dayStatus(day);
        const duration = minutes[index] > 0 ? formatDurationMinutes(minutes[index]) : null;

        /* Le nom accessible est composé de fragments plutôt qu'écrit en sept
           phrases : une seule clé par idée, et les combinaisons ne se paient
           pas en traductions. */
        const name = [
          dayNames[index],
          isToday ? t("week.today") : null,
          day.length === 0
            ? t("week.rest")
            : t("week.day", { count: day.length, minutes: duration }),
          shape === "completed" ? t("week.done") : null,
          shape === "modified" ? t("week.modified") : null,
          shape === "skipped" ? t("week.skipped") : null,
        ]
          .filter(Boolean)
          .join(", ");

        const bar = (
          <>
            <span className="zn-cockpit__day-letter">{letters[index]}</span>
            <span
              className="zn-cockpit__day-bar"
              data-shape={shape}
              /* Un style inline est le bon outil : la valeur est une donnée du
                 plan, pas un réglage de design. */
              style={{ "--bar-h": `${barHeight(minutes[index])}px` } as CSSProperties}
            />
            {isToday && duration && (
              <span className="zn-kicker zn-kicker--xs zn-cockpit__day-value">{duration}</span>
            )}
          </>
        );

        if (day.length === 0) {
          return (
            <span
              key={index}
              className="zn-cockpit__day"
              data-today={isToday || undefined}
              aria-label={name}
            >
              {bar}
            </span>
          );
        }

        return (
          <Link
            key={index}
            to={day.length === 1 ? sessionHref(day[0]) : `${focusPlanHref(focus)}?week=${focus.weekNumber}`}
            state={day.length === 1 ? sessionState(day[0]) : undefined}
            className="zn-cockpit__day"
            data-today={isToday || undefined}
            aria-current={isToday ? "date" : undefined}
            aria-label={name}
          >
            {bar}
          </Link>
        );
      })}
    </nav>
  );
}
