import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FunctionComponent,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowRight,
  Bike,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Plus,
  Pool,
  Run,
  type IconProps,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Segmented } from "@/components/ui/segmented";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import { SessionCompletionPanel } from "@/components/domain/SessionCompletionPanel";
import { SEOHead } from "@/components/seo";
import { usePlans } from "@/hooks/usePlans";
import { useWorkout } from "@/hooks/useWorkouts";
import { useRadioRail } from "@/hooks/useRadioRail";
import { useSettings } from "@/hooks/useSettings";
import {
  clampMonth,
  compareMonth,
  dateFromIso,
  dayBarBlocks,
  dayKinds,
  dayStatus,
  extraBlockHeight,
  focusDayDate,
  focusPlanHref,
  focusSessionsBetween,
  monthBounds,
  monthCells,
  monthOf,
  monthRange,
  pickTodayFocus,
  planDay,
  planPosition,
  sessionHref,
  sessionKind,
  shiftMonth,
  sourceHref,
  sourceName,
  weekConflicts,
  weekShortcut,
  type MonthRef,
  type SessionKind,
  type SessionRef,
  type TodayFocus,
} from "@/lib/cockpit";
import { useTodayComposition } from "@/hooks/useTodayComposition";
import { TodayComposePanel } from "@/components/domain/TodayComposePanel";
import {
  pushSessionToPlan,
  savePlan,
  updateSessionCompletion,
  type SessionCompletionData,
} from "@/lib/planStorage";
import { placeWeek, sourcePosition } from "@/lib/todayComposition";
import { createEmptyWeekPlan, sessionFromWorkout } from "@/lib/weekToPlan";
import {
  activityKindOf,
  defaultActivityDraft,
  makeActivitySession,
} from "@/lib/activitySession";
import { loadCommutePattern } from "@/lib/athleteProfile";
import { ActivityLogPanel } from "@/components/domain/ActivityLogPanel";
import { WeekReviewPanel } from "@/components/domain/WeekReviewPanel";
import { PolarizationGauge } from "@/components/weekly";
import { getWorkoutByIdAsync } from "@/data/workouts";
import { intensitySplit } from "@/lib/periodIntensity";
import type { AnyWorkoutTemplate } from "@/types";
import { useActivityLog } from "@/hooks/useActivityLog";
import { activitiesBetween, activitiesOn } from "@/lib/activityStorage";
import { minutesByWeekday } from "@/lib/activityStats";
import { isoDateOnly } from "@/lib/planDates";
import { buildWeekReview, calendarWeekRange, hasSomethingToReview } from "@/lib/weekReview";
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
import { purposeLabelKey, type ComplementaryActivity } from "@/types/activity";
import type { UnitSystem } from "@/types/settings";
import DoorToday from "@/assets/doodles/door-today.svg?react";

/**
 * Un glyphe par famille de séance, et ce sont ceux de la bibliothèque : le
 * rail des disciplines y montre déjà ces quatre-là, donc rien de neuf à
 * apprendre en passant d'un écran à l'autre. Les libellés viennent du même
 * endroit (`library:activityToggle`), pour que la course ne s'appelle pas
 * Course ici et Course à pied là.
 */
const KIND_ICONS: Record<SessionKind, FunctionComponent<IconProps>> = {
  running: Run,
  cycling: Bike,
  swimming: Pool,
  strength: Dumbbell,
};

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
 * Un seul primaire par SÉANCE, donc un seul aplat vermillon par bloc : le
 * bouton. Une journée double en montre deux, et ils ne se disputent pas, ils
 * appartiennent à deux blocs séparés par un filet. Le jour choisi de la bande
 * est marqué à l'ENCRE, un accent y ferait un troisième rouge à l'écran, et
 * la clôture est en contour pour la même raison.
 *
 * ── LA TROISIÈME VERSION : ON CHOISIT UN JOUR, ON N'Y VA PAS ──────────────
 *
 * La bande était faite de LIENS : toucher jeudi ouvrait la séance de jeudi,
 * donc regarder sa semaine, c'était quitter l'écran, puis revenir. Deux
 * gestes très proches, un doigt sur une barre, un doigt sur le bouton,
 * emmenaient au même endroit, et un seul des deux le disait.
 *
 * La bande est maintenant un CHOIX, `role="radiogroup"` et sept boutons : le
 * jour choisi recharge tout ce qui est en dessous, titre, taille, ligne
 * d'exécution, profil, bouton, clôture. Elle ne navigue plus nulle part. La
 * seule sortie vers une séance est le bouton voir le détail, qui est aussi
 * le seul objet de l'écran à ressembler à une sortie.
 *
 * Deux marques, donc, et elles ne se confondent pas : le jour CHOISI porte
 * l'encre, lettre grasse, filet plein, et la seule durée chiffrée de la
 * bande ; AUJOURD'HUI porte un point rond sous sa lettre, qui n'est là que
 * lorsqu'on est parti voir un autre jour. À l'arrivée les deux coïncident, et
 * l'écran est exactement celui d'avant.
 *
 * **Les journées à deux séances ont enfin un écran.** Elles n'en avaient
 * aucun : le titre disait 2 séances t'attendent, il n'y avait ni profil, ni
 * allure, ni clôture possible, la seule journée que le cockpit ne savait pas
 * clore, et le bouton renvoyait au plan. Les séances du jour sont
 * maintenant EMPILÉES, chacune complète et close-able pour elle-même,
 * séparées par un filet et numérotées séance 1 / 2. Le cas à une séance ne
 * change pas : une pile d'un élément est l'écran d'avant, au pixel près.
 *
 * **Et RIEN NE BOUGE quand on change de jour.** C'est la condition pour que
 * la bande soit un instrument : un écran qui se réorganise à chaque choix se
 * relit à chaque choix. Tout ce qui peut manquer est donc réservé : le
 * micro-label, le titre sur deux lignes, la durée, la ligne d'exécution, le
 * créneau du profil, et la valeur de la bande, si bien que le dimanche à
 * 1h35, le mardi de repos et le mercredi à trois séances posent leur titre,
 * leur durée et leur bouton au même pixel. Ce qui change, ce sont les mots,
 * et la hauteur de la pile quand il y a plusieurs séances, qui est
 * précisément l'information.
 *
 * ── LA QUATRIÈME VERSION : LE MOIS, À CÔTÉ DE LA SEMAINE ─────────────────
 *
 * La bande répond à demain, pas à dans trois semaines ni à ce que le mois a
 * pesé. Un commutateur Semaine / Mois au-dessus d'elle ouvre le même
 * instrument un cran plus loin : une grille de dates (`MonthGrid`) dont le
 * choix recharge la pile, exactement comme la bande. Rien d'autre ne change.
 *
 * Ce que ça a coûté, et c'est le seul vrai refactor : le jour choisi était
 * un INDEX de 0 à 6 dans la semaine en cours, il est devenu une DATE. Une
 * case de mars appartient à une autre semaine du plan, et la clôture comme la
 * pile doivent savoir laquelle (`planDay`). Sous la grille, le bilan du mois
 * est le bilan de la semaine nourri d'un mois, borné à aujourd'hui pour le
 * mois en cours. Le mode n'est pas mémorisé : l'écran d'arrivée est la
 * semaine, chaque matin.
 *
 * `/` reste la landing publique et indexée ; celle-ci est l'écran privé, donc
 * `noindex`, hors sitemap et hors prérendu.
 */
export function TodayPage() {
  const { t } = useTranslation(["today", "common", "plan", "activity"]);
  const isEn = useIsEnglish();
  const { plans, isLoading, reload } = usePlans();
  const { settings } = useSettings();

  // `new Date()` une seule fois par montage : un rendu qui recalcule quel
  // jour on est peut changer d'avis en cours de session. La ligne de date le
  // relisait à chaque rendu, ce qui pouvait la désaccorder de la bande une
  // seconde avant minuit ; elle lit le même instant que tout le reste.
  const now = useMemo(() => new Date(), []);

  /* Ce que le cockpit SUIT : les plans, et les semaines posées. C'est la
     composition qui décide, pas le plan le plus récent, voir
     `lib/todayComposition.ts`. La feuille Composer l'écrit, ici on la lit. */
  const { composition, update: updateComposition } = useTodayComposition(plans, !isLoading);
  const [composeOpen, setComposeOpen] = useState(false);
  const focus = useMemo(
    () => pickTodayFocus(plans, now, composition),
    [plans, now, composition],
  );
  const planUrl = focusPlanHref(focus);

  /* Le jour choisi, et c'est une DATE : il vaut `null` tant que personne n'a
     choisi, et se replie sur aujourd'hui à la lecture. Pas une valeur initiale
     calculée : les plans arrivent de localStorage APRÈS le premier rendu, et
     le repli se fait donc là où `focus` est celui du rendu courant.

     Il a été un index de 0 à 6 dans la semaine en cours, ce qui suffisait à
     la bande. Le mois choisit une case de n'importe quelle semaine du plan,
     et la clôture comme la pile ont besoin de savoir laquelle : la date est la
     seule adresse qui vaille pour les deux instruments. */
  const [picked, setPicked] = useState<string | null>(null);
  const todayIso = useMemo(() => isoDateOnly(now), [now]);
  const dayIso = picked ?? todayIso;
  const isToday = dayIso === todayIso;

  /* Semaine ou mois : le même écran, deux instruments pour choisir un jour.
     Le mode n'est PAS mémorisé : l'écran d'arrivée est la semaine, chaque
     matin, parce que c'est lui qui répond en dix secondes. Le mois est une
     consultation, à un tap. */
  const [view, setView] = useState<"week" | "month">("week");
  const [month, setMonth] = useState<MonthRef | null>(null);

  /* Les sept dates de la semaine en cours, pour que la bande, qui parle en
     index, et le reste de l'écran, qui parle en dates, se comprennent. */
  const weekDates = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => isoDateOnly(focusDayDate(focus, i, now))),
    [focus, now],
  );
  const dayIndex = weekDates.indexOf(dayIso);
  // La bande ne montre que la semaine en cours : hors d'elle, elle marque le
  // jour courant, ce qui n'arrive que le temps d'un mode.
  const day = dayIndex >= 0 ? dayIndex : focus.dayOfWeek;

  /* La journée choisie, par sa date : ses séances, leurs index, sa semaine.
     Pour la semaine en cours c'est exactement `focus.week[day]`, lu au même
     endroit ; pour une case du mois c'est la seule façon de le savoir. */
  const selected = useMemo(() => planDay(focus, dateFromIso(dayIso)), [focus, dayIso]);
  const sessions = selected.sessions;
  const refs = selected.refs;

  /* On peut changer de jour : il y a donc des hauteurs à RÉSERVER, pour que
     passer du dimanche au mardi ne fasse pas remonter l'écran. Sans semaine à
     parcourir (pas de plan, ou un plan qui n'a pas commencé), la bande ne
     s'affiche pas, rien ne peut changer, et réserver ne ferait que du vide. */
  const reserve = focus.week.length > 0;

  /* L'état du JOUR CHOISI, qui n'est celui d'aujourd'hui que tant qu'on n'a
     rien choisi d'autre. `upcoming` et `none` ne dépendent, eux, d'aucun
     jour : ils disent qu'il n'y a pas de semaine à parcourir, et la bande ne
     s'affiche même pas. */
  const dayState =
    focus.state === "session" || focus.state === "rest"
      ? sessions.length > 0
        ? "session"
        : "rest"
      : focus.state;

  /* La ligne de date suit le choix : sans elle, jeudi s'afficherait sous
     mardi 16 septembre, et l'écran dirait deux jours à la fois. */
  /* L'écart entre le jour regardé et aujourd'hui, en jours. La page s'appelle
     Aujourd'hui et peut montrer le 2 septembre : la ligne de date doit le
     DIRE, et il faut une sortie. Le bouton de retour est toujours écrit,
     invisible quand on est sur aujourd'hui, pour que la ligne ne change pas
     de hauteur au premier choix. */
  const dayGap = useMemo(
    () => Math.round((dateFromIso(dayIso).getTime() - dateFromIso(todayIso).getTime()) / 86_400_000),
    [dayIso, todayIso],
  );

  const dateLine = dateFromIso(dayIso).toLocaleDateString(
    isEn ? "en-GB" : "fr-FR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  /* Le titre EST la réponse. Un `<h1>` qui dirait Aujourd'hui au-dessus
     d'un chapô à faire aujourd'hui et d'une ligne une séance t'attend
     ferait dire trois fois la même chose avant le contenu, et la porte de la
     nav dit déjà Aujourd'hui.

     Il n'est écrit ici que pour les journées SANS séance : dès qu'il y en a
     une, c'est la pile qui porte les titres, un par séance, parce qu'une
     séance est nommée par son nom et non par le nombre qu'elles sont. */
  const headline = useMemo(() => {
    if (dayState === "none") return t("today:resume.none.line");
    if (dayState === "upcoming")
      return t("today:resume.upcoming.line", { count: focus.daysUntilStart });
    return t("today:resume.rest.line");
  }, [dayState, focus.daysUntilStart, t]);

  /** Un jour de repos n'est pas un trou : il dit quand on ressort.
   *
   * Dans la semaine du jour choisi, qui n'est celle qu'on vit que tant que
   * la grille du mois n'a pas emmené ailleurs. */
  const nextLine = useMemo(() => {
    if (dayState !== "rest" || focus.week.length === 0 || !selected.inPlan) return null;
    const names = t("today:week.dayNames").split(",");
    // Jour par jour et toutes sources confondues : la prochaine sortie peut
    // venir de la semaine posée quand le plan, lui, se repose.
    for (let index = selected.dayOfWeek + 1; index <= 6; index++) {
      const date = dateFromIso(selected.date);
      date.setDate(date.getDate() + (index - selected.dayOfWeek));
      const next = planDay(focus, date).sessions;
      if (next.length === 0) continue;
      const min = next.reduce((n, s) => n + (s.estimatedDurationMin ?? 0), 0);
      return t("today:resume.next", {
        day: names[index],
        duration: formatDurationMinutes(min),
      });
    }
    return null;
  }, [dayState, focus, selected, t]);

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
  const sessionState = useCallback(
    (session: PlanSession, ref: SessionRef | undefined) => {
      // La séance dit de quelle SOURCE elle vient : c'est ce plan-là que la
      // page de séance nomme, et sa semaine à lui, pas celle du primaire.
      const source = focus.sources.find((s) => s.plan.id === ref?.planId);
      const planWeek = source?.plan.weeks.find((w) => w.weekNumber === ref?.weekNumber);
      return {
        from: "plan" as const,
        planId: source?.plan.id,
        planName: source ? sourceName(source, isEn) : "",
        weekNumber: ref?.weekNumber ?? selected.weekNumber,
        volumePercent: planWeek?.volumePercent,
        estimatedDurationMin: session.estimatedDurationMin,
        targetDistanceKm: session.targetDistanceKm,
      };
    },
    [focus.sources, selected.weekNumber, isEn],
  );

  /* La clôture, une par séance de la pile. Elle réutilise le panneau du plan,
     pas un second formulaire : les deux ne peuvent donc pas diverger.
     L'INDEX vient de `weekIndexes`, la seule adresse qu'ait une séance
     (`updateSessionCompletion` adresse par plan, semaine, index) : c'est lui
     qui permet enfin de clore la seconde séance d'une journée double, et une
     séance d'un autre jour que celui-ci. La SEMAINE est celle du jour choisi,
     pas celle qu'on vit : depuis la grille du mois, ce sont deux semaines
     différentes. */
  const handleClose = useCallback(
    (ref: SessionRef, data: SessionCompletionData) => {
      const ok = updateSessionCompletion(ref.planId, ref.weekNumber, ref.index, data);
      if (!ok) {
        toast.error(t("common:errors.planSaveFailed"));
        return;
      }
      // `reload` remplace le tableau des plans, donc `focus` se recalcule et la
      // bande comme la ligne de clôture suivent sans rien de plus.
      reload();
      toast.success(t("plan:completion.saved"));
    },
    [reload, t],
  );

  /* ── Ajouter une séance, DANS une source ──────────────────────────────
     Le cockpit lit plusieurs sources ; écrire demande de dire laquelle, parce
     que c'est ce choix qui décide où la séance vit : dans le plan, elle suit
     le plan ; dans une semaine posée, elle se repose avec elle ; dans une
     semaine neuve, posée ici, elle commence quelque chose. Le menu ne pose la
     question que s'il y a un choix ; la semaine neuve est toujours proposée,
     c'est le chemin le plus court pour quelqu'un qui n'a rien encore. */
  type AddTarget = { planId: string; weekNumber: number; name: string } | { fresh: true };
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);

  const addTargets = useMemo(() => {
    const date = dateFromIso(dayIso);
    const out: { planId: string; weekNumber: number; name: string }[] = [];
    for (const source of focus.sources) {
      const position = sourcePosition(source, date);
      if (!position) continue;
      out.push({ planId: source.plan.id, weekNumber: position.weekNumber, name: sourceName(source, isEn) });
    }
    return out;
  }, [focus.sources, dayIso, isEn]);

  const handleAddWorkout = useCallback(
    async (workoutId: string) => {
      const target = addTarget;
      setAddTarget(null);
      if (!target) return;
      const day = selected.dayOfWeek;

      let session: PlanSession | null = null;
      const activity = activityKindOf(workoutId);
      if (activity) {
        const pattern = loadCommutePattern();
        session = makeActivitySession(
          activity.kind,
          day,
          defaultActivityDraft(activity.kind, pattern),
          pattern,
        );
      } else {
        const workout = await getWorkoutByIdAsync(workoutId);
        if (workout) session = sessionFromWorkout(day, workout);
      }
      if (!session) {
        toast.error(t("today:add.failed"));
        return;
      }

      let planId: string;
      let weekNumber: number;
      let name: string;
      if ("fresh" in target) {
        // Une semaine neuve, nommée par sa date et posée sur la semaine
        // regardée : elle entre dans le cockpit au moment où elle naît.
        const monday = dateFromIso(dayIso);
        monday.setDate(monday.getDate() - day);
        name = t("today:add.newWeekName", {
          date: monday.toLocaleDateString(isEn ? "en-GB" : "fr-FR", { day: "numeric", month: "short" }),
        });
        const week = createEmptyWeekPlan(name);
        if (!savePlan(week)) {
          toast.error(t("today:add.failed"));
          return;
        }
        updateComposition(placeWeek(composition, week.id, monday));
        planId = week.id;
        weekNumber = 1;
      } else {
        ({ planId, weekNumber, name } = target);
      }

      if (pushSessionToPlan(planId, weekNumber, session) === null) {
        toast.error(t("today:add.failed"));
        return;
      }
      reload();
      toast.success(t("today:add.done", { source: name }));
    },
    [addTarget, selected.dayOfWeek, dayIso, isEn, composition, updateComposition, reload, t],
  );

  /* Le primaire des journées sans séance. Il mène au plan, sauf quand il n'y
     a pas de plan du tout, où il mène à sa création. Les journées à séances,
     elles, ont un bouton PAR séance, dans la pile. */
  const emptyCta = useMemo(() => {
    if (!planUrl || dayState === "none") {
      return { to: "/plan/new", label: t("today:resume.none.cta") };
    }
    return {
      to: focus.weekNumber > 0 ? `${planUrl}?week=${focus.weekNumber}` : planUrl,
      label: t(focus.isWeek ? "today:resume.openWeek" : "today:resume.openPlan"),
    };
  }, [planUrl, dayState, focus.weekNumber, focus.isWeek, t]);

  /* Le raccourci du bas mène à la semaine où l'on EST, et il ne retombe sur
     l'atelier de composition que lorsqu'il n'y a pas de semaine à retrouver.
     Le libellé suit la destination, il ne la précède pas : c'est tout le
     défaut qu'avait Ma semaine en menant à une page blanche. */
  const week = weekShortcut(focus);

  /* ── Ce qu'on a fait EN PLUS du plan ──────────────────────────────────
     Le cockpit est le seul écran ouvert tous les jours : c'est donc ici que
     le vélotaf se note, pas dans un formulaire qu'il faudrait aller
     chercher. Le geste tient en trois taps, et il vise le JOUR CHOISI de la
     bande, pas aujourd'hui : on note souvent la veille au soir. */
  const log = useActivityLog();
  const activities = log.activities;

  const dayActivities = useMemo(
    () => activitiesOn(activities, dayIso),
    [activities, dayIso],
  );

  /* ── Le bilan du dimanche ─────────────────────────────────────────────
     Il n'a pas d'écran à lui et n'en veut pas : la bande CHOISIT déjà un
     jour, donc choisir dimanche est le geste qui demande le bilan. Il
     n'apparaît pas les autres jours, et jamais s'il n'a rien à dire.

     Sans plan en cours, il porte sur la semaine CALENDAIRE : le vélotaf
     n'attend pas d'avoir un plan pour compter. */
  const review = useMemo(() => {
    // Toutes les sources partagent le calendrier : la semaine du jour choisi
    // est une semaine calendaire, et ce que chaque source y a posé compte.
    const range = calendarWeekRange(selected.inPlan ? dateFromIso(dayIso) : now);
    return buildWeekReview({
      sessions: selected.inPlan ? focusSessionsBetween(focus, range.from, range.to) : [],
      activities: activitiesBetween(activities, range.from, range.to),
      range,
      ...(selected.inPlan && selected.weekNumber > 0 && { weekNumber: selected.weekNumber }),
    });
  }, [focus, selected.inPlan, selected.weekNumber, dayIso, activities, now]);

  /* Ce que deux sources se disputent : deux séances clés le même jour. Une
     ligne par jour, sous les sources, et jamais quand une seule est en cours.
     Le cockpit ne tranche pas, il le dit : c'est la personne qui compose. */
  const conflictLines = useMemo(() => {
    const names = t("today:week.dayNames").split(",");
    return weekConflicts(focus).map((conflict) => {
      const day = names[conflict.dayOfWeek] ?? "";
      const sources = conflict.planIds
        .map((id) => focus.sources.find((s) => s.plan.id === id))
        .filter((s): s is NonNullable<typeof s> => s != null)
        .map((s) => sourceName(s, isEn))
        .join(" · ");
      return t("today:conflicts.line", {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        sources,
      });
    });
  }, [focus, isEn, t]);

  /* Les minutes complémentaires de la semaine EN COURS, case par case. Elles
     nourrissent le canal du dessous de la bande : sans elles, une journée de
     vélotaf s'y lit repos. La bande ne montre jamais une autre semaine, donc
     ses bornes ne suivent pas le jour choisi. */
  const weekExtras = useMemo(() => {
    if (focus.week.length === 0) return [0, 0, 0, 0, 0, 0, 0];
    const range = calendarWeekRange(now);
    return minutesByWeekday(activitiesBetween(activities, range.from, range.to), range.from);
  }, [focus.week.length, activities, now]);

  const showReview = view === "week" && day === 6 && hasSomethingToReview(review);

  /* ── Le mois ──────────────────────────────────────────────────────────
     Le même instrument que la bande, un cran plus loin : une grille de dates
     dont le choix recharge la pile, et sous elle ce que le mois a pesé. Le
     mois affiché est celui du jour choisi tant qu'on n'a pas feuilleté, et il
     reste dans les bornes du plan : hors du plan il n'y a rien à choisir. */
  const bounds = useMemo(() => monthBounds(focus), [focus]);
  const monthRef = useMemo(() => {
    const wanted = month ?? monthOf(dateFromIso(dayIso));
    return bounds ? clampMonth(wanted, bounds) : wanted;
  }, [month, dayIso, bounds]);

  const switchView = useCallback((next: "week" | "month") => {
    /* Revenir à la semaine, c'est revenir à l'écran d'arrivée : la bande ne
       sait montrer que la semaine en cours, donc un jour choisi dans un autre
       mois n'y aurait pas de colonne. Aller au mois garde le jour choisi et
       ouvre sur lui. */
    if (next === "week") setPicked(null);
    setMonth(null);
    setView(next);
  }, []);

  /* Le bilan s'arrête À AUJOURD'HUI. Un mois en cours porte des séances qui
     n'ont pas encore eu lieu, et les compter comme non closes accuserait à
     tort : douze séances pas closes le 17, dont onze sont simplement à
     venir. Ce que le mois PRÉVOIT en entier, l'en-tête de la grille le dit
     déjà ; le bilan, lui, dit ce qui a été vécu jusqu'ici. Un mois passé est
     borné par sa fin, un mois à venir n'a rien à bilanter. */
  const monthReview = useMemo(() => {
    if (view !== "month") return null;
    const range = monthRange(monthRef);
    const to = range.to < todayIso ? range.to : todayIso;
    if (to < range.from) return null;
    const lived = { from: range.from, to };
    return buildWeekReview({
      sessions: focusSessionsBetween(focus, lived.from, lived.to),
      activities: activitiesBetween(activities, lived.from, lived.to),
      range: lived,
    });
  }, [view, monthRef, activities, focus, todayIso]);

  /* Ce que le mois vécu a pesé en INTENSITÉ : facile, tempo, intense. Les
     séances faites se classent par la zone dominante de leur gabarit, qui est
     dans un chunk du catalogue : on ne charge que ceux des séances closes du
     mois, à la demande, et la jauge se dessine quand ils sont là. Le journal
     se classe par effort perçu, sans rien charger. */
  const monthSessions = useMemo(() => {
    if (!monthReview) return [];
    return focusSessionsBetween(focus, monthReview.range.from, monthReview.range.to);
  }, [focus, monthReview]);

  const doneIds = useMemo(
    () =>
      Array.from(
        new Set(
          monthSessions
            .filter((s) => s.status === "completed" || s.status === "modified")
            .map((s) => s.workoutId)
            .filter((id) => !id.startsWith("__")),
        ),
      ).sort(),
    [monthSessions],
  );

  /* `null` pour un gabarit introuvable, et il reste dans la table : sans ça
     l'effet le redemanderait à chaque rendu, la table changeant de référence
     à chaque réponse. Introuvable est une réponse. */
  const [templates, setTemplates] = useState<Map<string, AnyWorkoutTemplate | null>>(
    () => new Map(),
  );
  useEffect(() => {
    const missing = doneIds.filter((id) => !templates.has(id));
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(missing.map((id) => getWorkoutByIdAsync(id).then((w) => [id, w] as const))).then(
      (pairs) => {
        if (cancelled) return;
        setTemplates((prev) => {
          const next = new Map(prev);
          for (const [id, w] of pairs) next.set(id, w ?? null);
          return next;
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [doneIds, templates]);

  const monthIntensity = useMemo(() => {
    if (!monthReview) return null;
    return intensitySplit({
      sessions: monthSessions,
      activities: activitiesBetween(activities, monthReview.range.from, monthReview.range.to),
      workoutOf: (id) => templates.get(id) ?? undefined,
    });
  }, [monthReview, monthSessions, activities, templates]);

  const monthLabel = useMemo(
    () =>
      new Date(monthRef.year, monthRef.month, 1).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
        month: "long",
        year: "numeric",
      }),
    [monthRef, isEn],
  );

  /* La borne du bilan d'un mois en cours, au 17 sept. : deux périodes sont à
     l'écran, le mois entier prévu en tête de grille et le vécu jusqu'ici dans
     le bilan, et rien ne le disait. Chacune se nomme. */
  const reviewToDate = useMemo(
    () =>
      monthReview
        ? dateFromIso(monthReview.range.to).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
            day: "numeric",
            month: "short",
          })
        : "",
    [monthReview, isEn],
  );

  /* Le nom du mois seul, pour le micro-label du bilan : la plage de dates à
     côté porte déjà tout ce qu'il faut, et l'année faisait replier la ligne. */
  const monthName = useMemo(
    () =>
      new Date(monthRef.year, monthRef.month, 1).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
        month: "long",
      }),
    [monthRef, isEn],
  );

  /* Les trois blocs de l'écran, écrits une fois : le commutateur, la réponse
     (la pile ou le repos, le plan, le complément du jour, les sorties) et ce
     qui les entoure. Le mode mois les dispose en deux colonnes sur un écran
     large, le mode semaine en une seule, et aucun des deux n'en réécrit un. */
  {/* Semaine ou mois. Le contrôle n'apparaît que lorsqu'il y a une
                semaine à parcourir : sans plan commencé, il n'y a ni bande ni
                grille, et un sélecteur entre deux riens serait une question
                posée à l'arrivée. */}
  const switcher = focus.week.length > 0 && (
    <Segmented<"week" | "month">
      value={view}
      onChange={switchView}
      label={t("today:view.label")}
      className="zn-cockpit__view"
      options={[
        { value: "week", label: t("today:view.week") },
        { value: "month", label: t("today:view.month") },
      ]}
    />
  );

  const answer = (
    <>
      {sessions.length > 0 ? (
        /* La pile. Un élément le plus souvent, deux les jours doubles, et
           c'est le même bloc dans les deux cas : rien n'est écrit pour le
           cas rare qui ne serve pas au cas courant. */
        <div className="zn-cockpit__stack">
          {sessions.map((session, rank) => (
            <CockpitSession
              key={
                refs[rank]
                  ? `${refs[rank].planId}:${refs[rank].weekNumber}:${refs[rank].index}`
                  : rank
              }
              session={session}
              sessionRef={refs[rank]}
              rank={rank}
              count={sessions.length}
              isToday={isToday}
              weekNumber={refs[rank]?.weekNumber ?? selected.weekNumber}
              linkState={sessionState(session, refs[rank])}
              unit={settings.unitSystem}
              isEn={isEn}
              onClose={handleClose}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Le titre, sa taille et ce qu'elle demande ne font qu'UNE
              phrase : ils sont serrés à `--sp-4` pendant que la section
              respire à `--sp-7`. C'est cet écart-là qui fait la
              hiérarchie, pas les corps de texte pris isolément.

              Une journée de repos porte le MÊME squelette qu'une journée
              de séance, réserves comprises : c'est ce qui fait que passer
              du dimanche au mardi ne déplace pas une ligne. Le prix est
              du blanc un jour de repos, et il est payé volontiers : un
              bouton qui saute de cent pixels sous le pouce coûte plus. */}
          <div className="zn-cockpit__answer">
            <span className="zn-kicker zn-kicker--xs">
              {isToday ? t("today:resume.todayLabel") : "\u00A0"}
            </span>

            <h1 className="zn-display zn-cockpit__headline" data-level="3">
              {headline}
            </h1>

            {reserve && <p className="zn-cockpit__size">{"\u00A0"}</p>}

            {(reserve || nextLine) && (
              <p className="zn-cockpit__how" data-hold={reserve || undefined}>
                {nextLine}
              </p>
            )}
          </div>

          {reserve && <div className="zn-cockpit__profile-slot" />}

          <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <Button asChild className="zn-cockpit__cta">
              <Link to={emptyCta.to}>
                {emptyCta.label}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </>
      )}

      {/* Le nom du plan était un texte mort. C'est le chemin vers le plan,
          à un tap, sans ajouter un bouton à l'écran.

          Il ne dit plus seulement d'où vient la séance, il dit OÙ L'ON EN
          EST : un plan ne tient que par sa fin, et `semaine 1` sans
          dénominateur ni échéance laissait la sortie du jour flotter. Le
          rôle en micro-label mono, la valeur à côté ; un libellé, pas une
          phrase.

          Il est passé SOUS la pile le jour où les séances y sont
          montées : au-dessus, il séparait le titre de son bouton, et
          entre deux séances empilées il aurait fallu choisir laquelle des
          deux il commente. Il n'en commente aucune, il commente la
          semaine. */}
      {focus.plan && dayState !== "none" && planUrl ? (
        <div className="zn-cockpit__sources">
          <Link to={planUrl} className="zn-cockpit__plan">
            <span className="zn-kicker zn-kicker--xs">
              {t(focus.isWeek ? "today:resume.inWeek" : "today:resume.inPlan")}
            </span>
            <span className="zn-cockpit__plan-name">
              {positionLine ?? (isEn ? focus.plan.nameEn : focus.plan.name)}
            </span>
          </Link>
          {/* Les AUTRES sources de la semaine, une ligne chacune, du même
              dessin que le plan : ce sont des chemins vers ce qui a été posé
              à côté, et ils disent d'où vient la séance de renforcement qui
              n'est pas dans le plan marathon. */}
          {focus.sources.slice(1).map((source) => (
            <Link key={source.plan.id} to={sourceHref(source)} className="zn-cockpit__plan">
              <span className="zn-kicker zn-kicker--xs">{t("today:resume.alsoLabel")}</span>
              <span className="zn-cockpit__plan-name">{sourceName(source, isEn)}</span>
            </Link>
          ))}
          {conflictLines.map((line) => (
            <p key={line} className="zn-cockpit__conflict zn-mono">
              {line}
            </p>
          ))}
        </div>
      ) : (
        dayState === "none" && (
          <p className="zn-body zn-muted zn-measure">{t("today:resume.none.body")}</p>
        )
      )}

      {/* Ajouter une séance au jour choisi, dans une source nommée. Un menu
          quand il y a le choix ; sinon la semaine neuve, seule, se pose sans
          question. Le sélecteur est celui du plan et de la semaine, pas un
          troisième. */}
      {!isLoading && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="zn-cockpit__add">
              <Plus size={16} />
              {t("today:add.action")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{t("today:add.into")}</DropdownMenuLabel>
            {addTargets.map((target) => (
              <DropdownMenuItem
                key={`${target.planId}:${target.weekNumber}`}
                onSelect={() => setAddTarget(target)}
              >
                {target.name}
              </DropdownMenuItem>
            ))}
            {addTargets.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={() => setAddTarget({ fresh: true })}>
              {t("today:add.newWeek")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Composer : ce que le cockpit suit, et ce qu'on lui pose. Dès qu'il y
          a quelque chose à composer, un plan ou une semaine, et aussi quand
          rien n'est en cours : c'est précisément là qu'on veut poser une
          semaine sur le calendrier. */}
      {plans.length > 0 && (
        <button
          type="button"
          className="zn-cockpit__compose"
          onClick={() => setComposeOpen(true)}
        >
          {t("today:compose.open")}
        </button>
      )}

      {/* Les deux gestes courts, en ligne de liens et non en cartes : ce
          sont des sorties, pas des actions primaires. Ils répondent aux
          deux seuls moments où l'on ne veut pas décider, je ne sais pas
          quoi faire et je ne veux pas m'engager sur seize semaines.

          Ils remontent sous le bouton : ils arrivaient après la figure,
          donc après un grand vide, alors que ce sont les deux secondes
          réponses de l'écran. Et les deux registres se distinguent par la
          MARQUE, pas par le poids : le tirage porte une flèche et pas de
          souligné, c'est un geste ; la semaine porte un souligné et pas de
          flèche, c'est un lieu. */}
      {/* Ce que la journée a porté EN PLUS du plan. Une ligne, et
          seulement si elle a eu lieu : c'est l'accusé de réception de la
          saisie, et sans lui on ne sait pas si le trajet est noté. Elle
          est sous le plan parce qu'elle ne commente pas une séance, elle
          commente la journée. */}
      {dayActivities.length > 0 && (
        <ul className="zn-cockpit__extras">
          {dayActivities.map((activity) => (
            <li key={activity.id} className="zn-cockpit__extra">
              <span>
                {t(`activity:purpose.${purposeLabelKey(activity.discipline, activity.purpose)}`)}
              </span>
              <span className="zn-mono">
                {[
                  formatDurationMinutes(activity.durationMin),
                  activity.distanceKm ? `${activity.distanceKm} km` : null,
                  activity.elevationGainM ? `+${activity.elevationGainM} m` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          ))}
          {/* Le journal se joint depuis ici, et seulement depuis ici sur
              cet écran : un lien de plus dans les sorties du bas aurait
              coûté une ligne à tout le monde pour servir ceux qui notent
              déjà. Il apparaît quand il y a quelque chose à relire. */}
          <li className="zn-cockpit__extra">
            <Link to="/activities" className="zn-cockpit__journal">
              {t("activity:cockpit.journal")}
            </Link>
          </li>
        </ul>
      )}
      {settings.cockpit.shortcuts && (
        <p className="zn-cockpit__exits">
          {/* La saisie n'est PAS une sortie, et elle portait pourtant leur
              marque. La flèche de cette rangée dit deux choses à la fois,
              c'est un geste ET il emmène ailleurs : le tirage tient les
              deux, la saisie seulement la première. Elle ouvre un panneau
              sur place et écrit. Un texte fléché promettait donc une page
              qui ne venait jamais, et se lisait comme une légende.

              D'où un bouton encadré, et un plus : le cadre dit qu'on
              agit, le plus dit qu'on ajoute, et c'est le même plus que le
              bouton du journal. Il se distingue à dessein des deux liens
              sous lui, qui eux emmènent vraiment ailleurs. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="zn-cockpit__log"
            onClick={() => log.logOn(dayIso)}
          >
            <Plus size={16} />
            {t("activity:cockpit.add")}
          </Button>
          <Link to="/library/draw" className="zn-cockpit__exit" data-role="move">
            {t("today:quick.draw")}
            <ArrowRight />
          </Link>
          <Link to={week.href} className="zn-cockpit__exit">
            {t(week.mine ? "today:quick.week" : "today:quick.weekNew")}
          </Link>
        </p>
      )}
    </>
  );

  return (
    <div className="zn-cockpit" data-view={view}>
      <SEOHead title={t("today:seoTitle")} description={t("today:seoDescription")} noindex />

      {isLoading ? (
        /* La lecture de localStorage est synchrone : l'attente est d'une frame.
           Pas de squelette qui clignote, mais une place réservée, le budget
           Lighthouse bloque à CLS exactement 0. */
        <div className="zn-cockpit__hold" aria-hidden="true" />
      ) : (
        <section className="zn-cockpit__resume">
          {/* La ligne de date, puis une ligne RÉSERVÉE : l'écart et le retour
              à aujourd'hui, vides sur aujourd'hui. Sur la même ligne que la
              date, l'écart la faisait replier à 390 px, et l'écran bougeait au
              premier choix, ce que cette page interdit. */}
          <div className="zn-cockpit__date">
            <span className="zn-kicker">{dateLine}</span>
            <p className="zn-cockpit__date-row" data-hidden={isToday || undefined}>
              <span className="zn-cockpit__date-gap zn-mono">
                {dayGap !== 0
                  ? t(dayGap < 0 ? "today:date.ago" : "today:date.ahead", {
                      count: Math.abs(dayGap),
                    })
                  : "\u00A0"}
              </span>
              <button
                type="button"
                className="zn-cockpit__back"
                onClick={() => setPicked(null)}
                tabIndex={isToday ? -1 : 0}
                aria-hidden={isToday || undefined}
              >
                {t("today:date.back")}
              </button>
            </p>
          </div>

          {/* Le mois se dispose en DEUX COLONNES dès que l'écran le paie :
              la grille et son bilan à gauche, la journée choisie à droite, on
              lit le mois et la séance sans défiler. Sous 900 px, la grille
              reste une colonne dans l'ordre de la semaine. La semaine, elle,
              ne change pas de forme : c'est l'écran de dix secondes. */}
          {focus.week.length > 0 && view === "month" ? (
            <div className="zn-cockpit__split">
              <div className="zn-cockpit__split-switch">{switcher}</div>
              <div className="zn-cockpit__split-grid">
                <MonthGrid
                              focus={focus}
                              month={monthRef}
                              label={monthLabel}
                              canPrev={bounds != null && compareMonth(monthRef, bounds.min) > 0}
                              canNext={bounds != null && compareMonth(monthRef, bounds.max) < 0}
                              onShift={(delta) => setMonth(shiftMonth(monthRef, delta))}
                              selected={dayIso}
                              onSelect={setPicked}
                              activities={activities}
                              now={now}
                            />
              </div>
              <div className="zn-cockpit__split-answer">{answer}</div>
              {/* Ce que le mois a pesé, en mode mois, et seulement s'il a quelque
                  chose à dire. C'est le bilan de la semaine, nourri d'un mois :
                  même dessin, mêmes règles, les kilomètres restent par sport. */}
              {monthReview && hasSomethingToReview(monthReview) && (
                <div className="zn-cockpit__split-review">
                  <WeekReviewPanel
                    review={monthReview}
                    kicker={
                      monthReview.range.to < monthRange(monthRef).to
                        ? t("today:month.reviewToDate", { date: reviewToDate })
                        : t("today:month.review", { month: monthName })
                    }
                  />
                  {/* Facile / tempo / intense sur le réalisé, dans la jauge que
                      la semaine type emploie déjà. Sans conseil : c'est du passé,
                      le mot du verdict suffit. Elle ne se dessine que lorsqu'il y
                      a des minutes classées, et dit ce qui ne l'a pas été. */}
                  {monthIntensity && monthIntensity.zonedMinutes > 0 && (
                    <div className="zn-cockpit__intensity">
                      <PolarizationGauge polarised={monthIntensity} hints={false} verdict={false} />
                      {/* Ce qui n'entre pas dans la jauge, par CAUSE : le
                          renforcement n'a pas de zone et n'a rien à qualifier ;
                          un gabarit inconnu, lui, manque. Deux phrases, pas une. */}
                      {monthIntensity.strengthMinutes > 0 && (
                        <p className="zn-cockpit__intensity-note zn-mono">
                          {t("today:month.strength", {
                            time: formatDurationMinutes(monthIntensity.strengthMinutes),
                          })}
                        </p>
                      )}
                      {monthIntensity.unknownMinutes > 0 && (
                        <p className="zn-cockpit__intensity-note zn-mono">
                          {t("today:month.unknown", {
                            time: formatDurationMinutes(monthIntensity.unknownMinutes),
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {switcher}
              {focus.week.length > 0 && (
                <WeekStrip
                  focus={focus}
                  selected={day}
                  onSelect={(index) => setPicked(weekDates[index])}
                  extras={weekExtras}
                />
              )}
              {answer}
              {/* Le bilan, le dimanche, et pas un autre jour. */}
              {showReview && <WeekReviewPanel review={review} />}
            </>
          )}
        </section>
      )}

      {/* Le sélecteur de séance du plan, en feuille : la même liste, les
          mêmes filtres, le même bouton vers l'atelier. Il se ferme de
          lui-même au choix. */}
      <PlanWorkoutPanel
        isOpen={addTarget !== null}
        onClose={() => setAddTarget(null)}
        day={selected.dayOfWeek}
        onSelectWorkout={(workoutId) => {
          void handleAddWorkout(workoutId);
        }}
      />

      <TodayComposePanel
        open={composeOpen}
        onOpenChange={setComposeOpen}
        plans={plans}
        composition={composition}
        onChange={updateComposition}
        onPlansChanged={reload}
        lookedAt={dateFromIso(dayIso)}
        today={now}
      />

      <ActivityLogPanel {...log.panel} />

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
    </div>
  );
}

/**
 * Une séance du jour choisi, entière.
 *
 * Tout ce que la page savait dire d'UNE séance vit ici : son nom, sa taille,
 * ce qu'elle demande, son profil, sa sortie et sa clôture. C'est ce qui rend
 * les journées doubles possibles, deux séances sont deux blocs, pas un titre
 * qui les compte, et c'est aussi ce qui les rend closables, ce qu'elles
 * n'étaient pas : un seul bouton ne savait pas laquelle des deux clore.
 *
 * Le catalogue est en chunks chargés à la demande, donc `useWorkout` est
 * asynchrone, et c'est un HOOK : il doit être appelé par séance, donc par
 * composant. C'est la vraie raison de ce découpage, la lisibilité n'est que
 * la prime.
 */
function CockpitSession({
  session,
  sessionRef,
  rank,
  count,
  isToday,
  weekNumber,
  linkState,
  unit,
  isEn,
  onClose,
}: {
  session: PlanSession;
  /** L'adresse de la séance dans sa source. Sans elle, pas de clôture. */
  sessionRef: SessionRef | undefined;
  rank: number;
  count: number;
  isToday: boolean;
  weekNumber: number;
  linkState: object;
  unit: UnitSystem;
  isEn: boolean;
  onClose: (ref: SessionRef, data: SessionCompletionData) => void;
}) {
  const { t } = useTranslation(["today", "plan", "library"]);
  const { workout } = useWorkout(session.workoutId);

  /* La FAMILLE de la séance, et elle est lue sur le plan, pas sur le
     catalogue : `sessionKind` est synchrone, donc le glyphe est là dès le
     premier rendu, avant le nom. C'est la première chose que l'écran peut
     dire d'une séance, et il se trouve que c'est aussi celle qu'on cherche en
     premier : on ne prépare pas le même sac pour un footing et pour une
     séance de natation. */
  const kind = sessionKind(session);
  const KindIcon = KIND_ICONS[kind];

  const [closeOpen, setCloseOpen] = useState(false);
  const [closeAnchor, setCloseAnchor] = useState<HTMLElement | null>(null);

  /* Le nom de la séance fait le titre. Le repli le temps du chargement est
     une séance t'attend, au singulier : ici on en décrit UNE, même quand la
     journée en porte deux, et c'est la pile qui dit qu'elles sont deux. */
  const title = workout
    ? isEn
      ? workout.nameEn
      : workout.name
    : t("today:resume.session.line", { count: 1, week: weekNumber });

  const status = session.status;
  const isResolved = status === "completed" || status === "modified" || status === "skipped";

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
    const parts: string[] = [];
    const min = session.estimatedDurationMin ?? 0;
    if (min > 0) parts.push(formatDurationMinutes(min));
    /* Au kilomètre entier, et précédée d'un tilde : c'est une cible, pas une
       mesure. 14,2 km donnerait une précision que le plan n'a pas, et poserait
       en passant la question du séparateur décimal. */
    const km = session.targetDistanceKm ?? 0;
    if (km > 0) {
      parts.push(t("today:facts.distance", {
        km: Math.round(convertDistance(km, unit)),
        unit: getDistanceUnit(unit),
      }));
    }
    return parts.join(" · ") || null;
  }, [session.estimatedDurationMin, session.targetDistanceKm, unit, t]);

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

  const pace = useMemo(() => paceRangeOf(session, isEn, unit), [session, isEn, unit]);

  /** Ce qui s'est passé, une fois la séance close. Le point d'arrêt.
   *
   * Elle ne redit PAS fait ou passé : le micro-label au-dessus du titre le dit
   * déjà, et la barre du jour aussi. Elle porte les chiffres réels, qui sont
   * la seule chose que ni l'un ni l'autre ne peut montrer. Une séance sautée
   * n'en a aucun, elle ne laisse donc rien ici. */
  const doneLine = useMemo(() => {
    if (!isResolved || status === "skipped") return null;
    const parts: string[] = [];
    const min = session.actualDurationMin ?? session.estimatedDurationMin;
    if (min > 0) parts.push(formatDurationMinutes(min));
    if (session.actualDistanceKm != null && session.actualDistanceKm > 0) {
      parts.push(formatDistanceWithUnit(session.actualDistanceKm, unit));
    }
    if (session.rpe != null) parts.push(t("today:facts.rpe", { n: session.rpe }));
    return parts.join(" · ") || null;
  }, [session, isResolved, status, unit, t]);

  const execLine = isResolved ? doneLine : [mainSummary, pace].filter(Boolean).join(" · ") || null;

  /* Le créneau du profil est réservé, plein ou vide : la barre n'arrivait
     qu'avec le catalogue et poussait de cinquante pixels tout ce qui la suit,
     bouton compris. Et une séance de renforcement n'a pas de zones : plutôt
     que d'effondrer le créneau, elle porte la marque maison du non mesuré, la
     hachure à 45 degrés que `zone.css` dessine déjà pour `data-zone="0"`. */
  const profile = useMemo(() => {
    if (!workout) return null;
    if (isStrengthWorkout(workout)) {
      return [{ seconds: Math.max(1, (session.estimatedDurationMin ?? 0) * 60), zone: 0 as const }];
    }
    return toZoneBarBlocks(workout);
  }, [workout, session.estimatedDurationMin]);

  /* Le micro-label au-dessus du titre. Il dit l'état, et, les jours doubles,
     LE RANG : séance 1 / 2 est la seule chose qui distingue deux blocs de
     même forme avant que leurs noms n'arrivent du catalogue.

     Aujourd'hui n'y est que si c'est aujourd'hui : la ligne de date, en haut,
     dit déjà quel jour on regarde, et le répéter sur chaque bloc ferait dire
     deux fois la même chose à deux endroits qui ne peuvent pas diverger. */
  const label = [
    count > 1 ? t("today:resume.rank", { n: rank + 1, total: count }) : null,
    isResolved ? t(`plan:completion.${status}`) : isToday ? t("today:resume.todayLabel") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Un seul `<h1>` par écran : le premier bloc le porte, les suivants sont des
  // `<h2>`. Même style, deux niveaux, ce qui est exactement la relation entre
  // la première séance du jour et celles qui la suivent.
  const Heading = rank === 0 ? "h1" : "h2";

  return (
    <article className="zn-cockpit__session">
      {/* Les quatre lignes sont TOUJOURS écrites, vides au besoin. Une ligne
          qui apparaît et disparaît selon le jour choisi décale tout ce qui la
          suit, et c'est le bouton qui finit par se déplacer sous le pouce :
          l'écran doit répondre au choix, pas se réorganiser. */}
      <div className="zn-cockpit__answer">
        <span className="zn-kicker zn-kicker--xs">{label || "\u00A0"}</span>

        {/* Le glyphe DEVANT le titre, et pas dedans : le titre garde sa
            réserve de deux lignes et son `text-wrap: balance`, qu'une image
            posée dans le flux du texte dérèglerait. Il est muet pour un
            lecteur d'écran (tous les `Svg` de ce dépôt sont `aria-hidden`),
            donc le nom de la famille est écrit à côté, invisible : une
            information portée par la seule forme n'est pas portée. */}
        <div className="zn-cockpit__title-row">
          <KindIcon className="zn-cockpit__kind" size={22} />
          <span className="sr-only">{t(`library:activityToggle.${kind}`)}</span>

          <Heading className="zn-display zn-cockpit__headline" data-level="3">
            {title}
          </Heading>
        </div>

        <p className="zn-cockpit__size">{sizeLine || "\u00A0"}</p>

        {/* Réservée sur deux lignes, toujours : le corps de séance arrive avec
            le chunk du catalogue, et une séance close n'en a pas moins besoin
            de la réserve, sinon changer de jour ferait respirer l'écran. */}
        <p className="zn-cockpit__how" data-hold>
          {execLine}
        </p>
      </div>

      {/* L'aperçu de la séance : un bloc par phase, la largeur dit le temps et
          l'intensité est codée deux fois, densité d'encre ET hauteur. C'est
          beaucoup d'information sans un mot de plus, et c'est le composant que
          les cartes de la bibliothèque utilisent déjà (`toZoneBarBlocks`), pas
          un second dessin de profil.

          Le créneau garde sa hauteur même vide : la barre n'arrive qu'avec le
          chunk du catalogue, et sans réserve elle poussait le bouton. */}
      <div className="zn-cockpit__profile-slot">
        {profile && profile.length > 0 && (
          <ZoneBar blocks={profile} condense height={36} className="zn-cockpit__profile" />
        )}
      </div>

      <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
        {/* Le bouton n'est plus le seul accès à l'information, puisque la
            ligne du dessus dit déjà ce que la séance demande : il ne dit donc
            plus ouvrir mais voir le détail. Et il descend de `lg` à la taille
            normale, ce qui le met à la même hauteur que la clôture à côté de
            lui : deux boutons, un cluster, pas une grosse chose et une petite.

            C'est aussi, depuis que la bande ne navigue plus, la SEULE sortie
            de l'écran vers une séance. */}
        <Button asChild className="zn-cockpit__cta">
          <Link to={sessionHref(session)} state={linkState}>
            {t("today:resume.openDetail")}
            <ArrowRight />
          </Link>
        </Button>

        {sessionRef != null && (
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

      {/* Le panneau de clôture du plan, tel quel : une feuille au doigt, un
          popover ancré au bouton au pointeur fin. Un second formulaire ici
          aurait divergé du premier au premier changement. */}
      <SessionCompletionPanel
        open={closeOpen}
        onOpenChange={setCloseOpen}
        session={closeOpen ? session : null}
        weekNumber={weekNumber}
        sessionName={title}
        onSave={(data) => {
          if (sessionRef == null) return;
          onClose(sessionRef, data);
          setCloseOpen(false);
        }}
        anchorElement={closeAnchor}
      />
    </article>
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
 * La bande des sept jours : la semaine en aperçu, et le choix du jour.
 *
 * Elle a d'abord été une figure non cliquable, puis sept LIENS vers les
 * séances. Les liens coûtaient trop cher pour ce qu'ils rendaient : regarder
 * jeudi, c'était quitter l'écran. Elle est maintenant un `role="radiogroup"`
 * de sept boutons, et ce qu'elle change est TOUT CE QUI EST EN DESSOUS, pas
 * la page où l'on se trouve.
 *
 * Le contrat clavier vient de `useRadioRail`, écrit pour les deux rails de la
 * bibliothèque : un seul arrêt de tabulation pour le groupe, les flèches qui
 * déplacent et cochent, avec bouclage. Il n'y a donc pas de `role` livré sans
 * son clavier, ce que ce dépôt a déjà fait deux fois.
 *
 * **Cinq canaux, cinq choses.** Tant que l'encre disait à la fois c'est
 * aujourd'hui et c'est la plus grosse séance, on ne savait pas si dimanche
 * ressortait parce qu'on y était ou parce qu'il était long, et sept barres
 * n'informaient sur rien :
 *
 * - **la hauteur** porte les MINUTES, et rien d'autre. Celle d'un bloc dit sa
 *   séance, celle de la colonne entière dit la journée : une heure de
 *   natation, deux de vélo et trois de course font trois blocs de 1, 2 et 3,
 *   sur une colonne qui vaut toujours six heures.
 * - **le découpage** porte le NOMBRE de séances, et c'est le canal qui
 *   manquait. La barre était unique : trois sorties dans la journée faisaient
 *   une barre de six heures, et rien ne disait qu'il fallait sortir trois
 *   fois. Un filet de 2 px sépare deux blocs, ce qui suffit à les compter
 *   d'un coup d'œil sans que la colonne cesse d'être une colonne.
 * - **la forme** porte le statut, séance par séance depuis qu'il y a des
 *   blocs. Prévu est un contour, fait est un plein, sauté est hachuré, repos
 *   est un filet. Une distinction de FORME, pas de teinte : la bande reste
 *   lisible en niveaux de gris, ce qui est l'argument du système, comme
 *   `--zone-h-N` dans `zones.css`. Une première sortie faite et une seconde
 *   qui ne l'est pas se voient enfin toutes les deux, là où une barre unique
 *   devait trancher.
 * - **la rangée de glyphes** porte les FAMILLES présentes, une fois chacune :
 *   course, vélo, natation, renforcement. C'est le seul canal qui ne se
 *   déduit d'aucun autre : trois barres ne disent pas de quel sport elles
 *   sont, et c'est pourtant ce qu'on regarde en premier le matin, on ne
 *   prépare pas le même sac. À 13 px un glyphe ne se lit pas, il se
 *   reconnaît, et c'est tout ce qu'on lui demande : le nom entier est dans le
 *   nom accessible du jour, et la pile le redit en clair pour le jour choisi.
 * - **la lettre** porte le jour CHOISI, à l'ENCRE et jamais au vermillon : le
 *   bouton est le seul aplat d'accent de l'écran, un second le neutraliserait.
 *   Aujourd'hui, lui, se marque d'un point rond sous la lettre, qui ne se voit
 *   que lorsqu'on est parti regarder un autre jour.
 *
 * Et le jour choisi est le seul à porter sa valeur : une échelle de hauteurs
 * sans une seule graduation ne se lit pas. Au corps mono le plus petit, c'est
 * un repère d'axe, pas une seconde annonce. La ligne est écrite VIDE les six
 * autres jours : la bande a une hauteur fixe, du créneau de la barre à la
 * réserve de cette ligne, et choisir un jour ne déplace pas un pixel de ce
 * qui l'entoure.
 *
 * Un jour de repos est un bouton comme les six autres : il n'y a rien à y
 * ouvrir, mais il y a quelque chose à y LIRE, repos et la prochaine sortie.
 * C'est toute la différence entre choisir un jour et y aller.
 */
function WeekStrip({
  focus,
  selected,
  onSelect,
  extras,
}: {
  focus: TodayFocus;
  selected: number;
  onSelect: (day: number) => void;
  /** Les minutes complémentaires du lundi au dimanche. Toujours sept cases. */
  extras: number[];
}) {
  const { t } = useTranslation(["today", "library"]);
  const railRef = useRef<HTMLDivElement>(null);

  // Les sept jours, en indices : c'est la valeur que le rail déplace, et elle
  // est stable d'un rendu à l'autre, ce dont `useRadioRail` a besoin pour
  // retrouver la position courante.
  const days = useMemo(() => [0, 1, 2, 3, 4, 5, 6], []);
  const rail = useRadioRail<number>({ items: days, value: selected, onChange: onSelect, railRef });

  // Les initiales sont pour l'œil ; les noms accessibles ont besoin des noms
  // entiers, samedi et pas S.
  const letters = t("week.letters").split(",");
  const dayNames = t("week.dayNames").split(",");

  const minutes = focus.week.map((day) =>
    day.reduce((n, session) => n + (session.actualDurationMin ?? session.estimatedDurationMin ?? 0), 0),
  );
  const longest = Math.max(1, ...minutes);
  /* Le canal du complément a SON échelle : les compléments se comparent entre
     eux et jamais à une séance, voir `extraBlockHeight`. */
  const longestExtra = Math.max(1, ...extras);

  return (
    <div
      className="zn-cockpit__week"
      role="radiogroup"
      aria-label={t("week.label", { week: focus.weekNumber })}
      ref={railRef}
      onKeyDown={rail.onKeyDown}
    >
      {focus.week.map((day, index) => {
        const isToday = index === focus.dayOfWeek;
        const isSelected = index === selected;
        const shape = dayStatus(day);
        const duration = minutes[index] > 0 ? formatDurationMinutes(minutes[index]) : null;
        /* Les familles du jour, une fois chacune : la rangée répond à QUOI,
           pendant que les blocs au-dessus répondent à combien et à combien de
           temps. Répéter l'icône de course pour deux footings mélangerait les
           deux questions. */
        const kinds = dayKinds(day);

        /* Le nom accessible est composé de fragments plutôt qu'écrit en sept
           phrases : une seule clé par idée, et les combinaisons ne se paient
           pas en traductions. Coché ou non n'y est pas : `aria-checked` le
           dit déjà, et le répéter le ferait dire deux fois. */
        const name = [
          dayNames[index],
          isToday ? t("week.today") : null,
          day.length === 0
            ? t("week.rest")
            : t("week.day", { count: day.length, minutes: duration }),
          // Le canal du dessous est muet pour l'oeil seul : le nom accessible
          // le dit en toutes lettres, sinon une journée de vélotaf reste un
          // jour de repos pour qui n'a que ce nom.
          extras[index] > 0
            ? t("activity:cockpit.dayExtra", { minutes: formatDurationMinutes(extras[index]) })
            : null,
          // Ce que les glyphes disent à l'œil, le nom accessible le dit en
          // toutes lettres : la rangée est muette, elle n'est pas absente.
          ...kinds.map((k) => t(`library:activityToggle.${k}`)),
          shape === "completed" ? t("week.done") : null,
          shape === "modified" ? t("week.modified") : null,
          shape === "skipped" ? t("week.skipped") : null,
        ]
          .filter(Boolean)
          .join(", ");

        return (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className="zn-cockpit__day"
            data-today={isToday || undefined}
            data-selected={isSelected || undefined}
            aria-current={isToday ? "date" : undefined}
            aria-label={name}
            onClick={() => onSelect(index)}
          >
            <span className="zn-cockpit__day-letter">{letters[index]}</span>

            {/* Les familles du jour, entre la lettre et les blocs. La rangée
                est TOUJOURS là, vide les jours de repos : c'est la même règle
                que la valeur chiffrée plus haut, une bande qui change de
                hauteur selon la journée regardée n'est pas un instrument. */}
            <span className="zn-cockpit__day-kinds">
              {kinds.map((k) => {
                const Glyph = KIND_ICONS[k];
                return <Glyph key={k} className="zn-cockpit__day-kind" size={13} />;
              })}
            </span>

            {/* Le créneau de la barre est de hauteur FIXE et les blocs y
                poussent depuis le sol : la bande garde la même hauteur quel
                que soit le jour choisi, et rien ne bouge sous le doigt quand
                on passe du dimanche long au mardi de repos. */}
            <span className="zn-cockpit__day-col">
              <span className="zn-cockpit__day-bar">
                {day.length === 0 ? (
                  <span className="zn-cockpit__day-block" data-shape="rest" />
                ) : (
                  dayBarBlocks(day, longest).map((block, i) => (
                    <span
                      key={i}
                      className="zn-cockpit__day-block"
                      data-shape={block.shape}
                      /* Un style inline est le bon outil : la valeur est une
                         donnée du plan, pas un réglage de design. */
                      style={{ "--block-h": `${block.height}px` } as CSSProperties}
                    />
                  ))
                )}
              </span>

              {/* LE SOL, et il est tracé sur les sept jours, pas seulement sous
                  ceux qui portent quelque chose : un axe qui n'existe que
                  parfois n'est pas un axe. C'est lui qui rend le canal du
                  dessous lisible sans une légende. */}
              <span className="zn-cockpit__day-ground" aria-hidden="true" />

              {/* Ce que la vie a ajouté : vélotaf, déplacement, séance hors
                  plan. Le créneau est TOUJOURS réservé, vide la plupart du
                  temps, pour la même raison que tout le reste de cet écran,
                  rien ne doit bouger quand on change de jour. */}
              <span className="zn-cockpit__day-under">
                {extras[index] > 0 && (
                  <span
                    className="zn-cockpit__day-extra"
                    style={
                      {
                        "--block-h": `${extraBlockHeight(extras[index], longestExtra)}px`,
                      } as CSSProperties
                    }
                  />
                )}
              </span>
            </span>

            {/* La valeur est TOUJOURS écrite, vide sur les six autres jours :
                sans cette réserve, choisir un jour de repos retirait une ligne
                à la bande et faisait remonter tout l'écran de vingt pixels. */}
            <span className="zn-kicker zn-kicker--xs zn-cockpit__day-value">
              {(isSelected && duration) || "\u00A0"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * La grille du mois : le même instrument que la bande, un cran plus loin.
 *
 * Six rangées de sept cases, toujours six, même quand le mois tient en cinq :
 * une grille qui change de hauteur d'un mois à l'autre déplace la pile sous
 * le doigt, et c'est la règle de tout cet écran. Chaque case porte ce que la
 * colonne de la bande porte déjà, ramené à sa taille : le numéro pour la
 * lettre, la rangée des familles, une marque par séance dont la FORME dit le
 * statut, et le tiret du complément sous le sol. Rien de nouveau à apprendre
 * en passant d'un instrument à l'autre.
 *
 * C'est un `role="radiogroup"`, comme la bande, et pour la même raison : on
 * CHOISIT un jour, on n'y va pas. Le contrat clavier vient du même rail. Seuls
 * les jours du mois qui sont dans le plan sont des boutons : une case hors du
 * plan n'a rien à recharger, et une case du mois voisin est un blanc qui
 * tient la rangée.
 *
 * Deux marques, les mêmes que la bande : le jour CHOISI porte l'encre sur son
 * numéro, AUJOURD'HUI porte le point rond, qui ne se voit que lorsqu'on est
 * parti regarder un autre jour.
 */
function MonthGrid({
  focus,
  month,
  label,
  canPrev,
  canNext,
  onShift,
  selected,
  onSelect,
  activities,
  now,
}: {
  focus: TodayFocus;
  month: MonthRef;
  /** Le nom du mois, déjà formaté dans la langue. */
  label: string;
  canPrev: boolean;
  canNext: boolean;
  onShift: (delta: -1 | 1) => void;
  /** La date choisie, "YYYY-MM-DD". */
  selected: string;
  onSelect: (date: string) => void;
  activities: readonly ComplementaryActivity[];
  now: Date;
}) {
  const { t } = useTranslation(["today", "library", "activity"]);
  const railRef = useRef<HTMLDivElement>(null);

  const cells = useMemo(() => monthCells(focus, month, now), [focus, month, now]);

  /* Les minutes complémentaires du mois, par date : le tiret sous le sol. */
  const extras = useMemo(() => {
    const range = monthRange(month);
    const byDate = new Map<string, number>();
    for (const activity of activitiesBetween(activities, range.from, range.to)) {
      byDate.set(activity.date, (byDate.get(activity.date) ?? 0) + activity.durationMin);
    }
    return byDate;
  }, [activities, month]);

  /* Seules les cases qui se choisissent entrent dans le rail : les flèches
     sautent les blancs et les jours hors plan, il n'y a rien à y cocher. */
  const selectable = useMemo(
    () => cells.filter((c) => c.inMonth && c.inPlan).map((c) => c.date),
    [cells],
  );
  const rail = useRadioRail<string>({ items: selectable, value: selected, onChange: onSelect, railRef });

  const letters = t("today:week.letters").split(",");
  const dayNames = t("today:week.dayNames").split(",");

  /* Le compte du mois, dans le plan : combien de séances, combien de temps.
     Une ligne de kicker, pas un titre de plus. */
  const inMonth = cells.filter((c) => c.inMonth);
  const count = inMonth.reduce((n, c) => n + c.sessions.length, 0);
  const minutes = inMonth.reduce(
    (n, c) =>
      n + c.sessions.reduce((m, s) => m + (s.actualDurationMin ?? s.estimatedDurationMin ?? 0), 0),
    0,
  );

  return (
    <div className="zn-cockpit__month">
      <div className="zn-cockpit__month-nav">
        <button
          type="button"
          className="zn-cockpit__month-btn"
          onClick={() => onShift(-1)}
          disabled={!canPrev}
          aria-label={t("today:month.previous")}
        >
          <ChevronLeft />
        </button>
        <div className="zn-cockpit__month-title">
          <span className="zn-cockpit__month-name">{label}</span>
          <span className="zn-kicker zn-kicker--xs">
            {count > 0
              ? t("today:month.sessions", { count, minutes: formatDurationMinutes(minutes) })
              : t("today:month.empty")}
          </span>
        </div>
        <button
          type="button"
          className="zn-cockpit__month-btn"
          onClick={() => onShift(1)}
          disabled={!canNext}
          aria-label={t("today:month.next")}
        >
          <ChevronRight />
        </button>
      </div>

      {/* Les initiales des jours, pour l'œil ; les noms accessibles sont dans
          chaque case. */}
      <div className="zn-cockpit__month-head" aria-hidden="true">
        {letters.map((letter, i) => (
          <span key={i} className="zn-cockpit__month-letter">
            {letter}
          </span>
        ))}
      </div>

      <div
        className="zn-cockpit__month-grid"
        role="radiogroup"
        aria-label={label}
        ref={railRef}
        onKeyDown={rail.onKeyDown}
      >
        {cells.map((cell) => {
          if (!cell.inMonth) {
            return <span key={cell.date} className="zn-cockpit__cell" data-void aria-hidden="true" />;
          }
          if (!cell.inPlan) {
            /* Dans le mois, hors du plan : le numéro, en retrait, pour que le
               mois garde sa forme. Pas un bouton, il n'y a rien à recharger. */
            return (
              <span key={cell.date} className="zn-cockpit__cell" data-outside>
                <span className="zn-cockpit__cell-num">{cell.dayOfMonth}</span>
              </span>
            );
          }

          const isSelected = cell.date === selected;
          const kinds = dayKinds(cell.sessions);
          const extra = extras.get(cell.date) ?? 0;
          const shape = dayStatus(cell.sessions);
          const cellMinutes = cell.sessions.reduce(
            (n, s) => n + (s.actualDurationMin ?? s.estimatedDurationMin ?? 0),
            0,
          );

          const name = [
            `${dayNames[cell.dayOfWeek]} ${cell.dayOfMonth}`,
            cell.isToday ? t("today:week.today") : null,
            cell.sessions.length === 0
              ? t("today:week.rest")
              : t("today:week.day", {
                  count: cell.sessions.length,
                  minutes: formatDurationMinutes(cellMinutes),
                }),
            extra > 0
              ? t("activity:cockpit.dayExtra", { minutes: formatDurationMinutes(extra) })
              : null,
            ...kinds.map((k) => t(`library:activityToggle.${k}`)),
            shape === "completed" ? t("today:week.done") : null,
            shape === "modified" ? t("today:week.modified") : null,
            shape === "skipped" ? t("today:week.skipped") : null,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <button
              key={cell.date}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className="zn-cockpit__cell"
              data-today={cell.isToday || undefined}
              data-selected={isSelected || undefined}
              aria-current={cell.isToday ? "date" : undefined}
              aria-label={name}
              onClick={() => onSelect(cell.date)}
            >
              <span className="zn-cockpit__cell-num">{cell.dayOfMonth}</span>

              <span className="zn-cockpit__cell-kinds">
                {kinds.map((k) => {
                  const Glyph = KIND_ICONS[k];
                  return <Glyph key={k} className="zn-cockpit__cell-kind" size={11} />;
                })}
              </span>

              {/* Une marque par séance, la forme dit le statut : c'est le bloc
                  de la bande, couché. Repos : un filet. */}
              <span className="zn-cockpit__cell-marks">
                {cell.sessions.length === 0 ? (
                  <span className="zn-cockpit__cell-mark" data-shape="rest" />
                ) : (
                  cell.sessions.map((session, i) => (
                    <span
                      key={i}
                      className="zn-cockpit__cell-mark"
                      data-shape={dayStatus([session])}
                    />
                  ))
                )}
              </span>

              {/* Le complément, sous le sol, réservé même vide. */}
              <span className="zn-cockpit__cell-under">
                {extra > 0 && <span className="zn-cockpit__cell-extra" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* La légende, une ligne, sous la grille : plein, creux, hachuré, filet.
          Quatre marques de dix pixels ne se devinent pas, et le glyphe de
          sport n'en dit rien. Les marques sont les VRAIES, pas des caractères
          qui leur ressemblent : la légende ne peut pas diverger du dessin. */}
      <p className="zn-cockpit__month-legend zn-mono" aria-hidden="true">
        {(
          [
            ["completed", "legendDone"],
            ["planned", "legendPlanned"],
            ["skipped", "legendSkipped"],
            ["rest", "legendRest"],
          ] as const
        ).map(([shape, key]) => (
          <span key={shape} className="zn-cockpit__month-key">
            <span className="zn-cockpit__cell-mark" data-shape={shape} />
            {t(`today:month.${key}`)}
          </span>
        ))}
        <span className="zn-cockpit__month-key">
          <span className="zn-cockpit__cell-extra" />
          {t("today:month.legendExtra")}
        </span>
      </p>
    </div>
  );
}
