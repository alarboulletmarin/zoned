import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Activity as ActivityIcon,
  ArrowLeft,
  Bike,
  Pencil,
  Plus,
  Pool,
  Run,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { SEOHead } from "@/components/seo";
import { ActivityLogPanel } from "@/components/domain/ActivityLogPanel";
import { ComplementarySummary } from "@/components/domain/ComplementarySummary";
import { WeekReviewPanel } from "@/components/domain/WeekReviewPanel";
import { formatDurationMinutes } from "@/components/visualization";
import { useActivityLog } from "@/hooks/useActivityLog";
import { usePlans } from "@/hooks/usePlans";
import { ACTIVITY_STORAGE_SOFT_LIMIT, activitiesBetween } from "@/lib/activityStorage";
import { summarizeActivities } from "@/lib/activityStats";
import { pickTodayFocus } from "@/lib/cockpit";
import { useIsEnglish } from "@/lib/i18n-utils";
import { buildWeekReview, calendarWeekRange, planWeekRange } from "@/lib/weekReview";
import { ACTIVITY_DISCIPLINE_META, type ComplementaryActivity } from "@/types/activity";

/**
 * Le journal des activités complémentaires.
 *
 * L'écran répond à trois questions et s'arrête là : qu'est-ce que j'ai fait en
 * plus de mon plan, combien ça pèse, et comment s'est passée ma semaine.
 *
 * ── Pourquoi une page à lui ─────────────────────────────────────────────
 *
 * Le cockpit permet d'en SAISIR une en dix secondes, ce qui est le geste
 * quotidien. Mais un journal se relit, se corrige et se totalise, et aucun de
 * ces trois gestes n'a sa place sur un écran qu'on ouvre debout avant de
 * sortir. Les deux surfaces partagent le même panneau de saisie
 * (`ActivityLogPanel`), donc elles ne peuvent pas diverger.
 *
 * Le bilan de la semaine EN COURS est en tête, avant la liste : quelqu'un qui
 * ouvre cette page un dimanche soir vient pour lui, pas pour relire ses
 * trajets de mardi.
 */

const DISCIPLINE_ICONS = {
  cycling: Bike,
  running: Run,
  swimming: Pool,
  other: ActivityIcon,
} as const;

export function ActivitiesPage() {
  const { t } = useTranslation(["activity", "common"]);
  const isEn = useIsEnglish();
  const log = useActivityLog();
  const activities = log.activities;
  const { plans } = usePlans();
  const navigate = useNavigate();
  const location = useLocation();

  /* Le journal se rejoint depuis quatre endroits : le menu, le cockpit, la
     palette et les chiffres d'un plan. La sortie ne peut donc pas être un lien
     vers une destination fixe, ce serait juste pour trois personnes sur
     quatre ; elle rend la page PRÉCÉDENTE, quelle qu'elle soit.

     Elle ne s'affiche que s'il y a un précédent DANS l'app. Ouvert en
     marque-page, depuis un moteur de recherche ou depuis l'écran d'accueil de
     l'app installée, un Retour ne ramènerait nulle part, ou pire, hors de
     l'app : c'est moins qu'un Retour absent.

     Le test est la clé de la position et non `history.length`, qui ment dans
     les deux sens : il compte les entrées de l'onglet, y compris celles des
     sites visités avant, et il vaut déjà 2 dans un onglet neuf sur plusieurs
     moteurs. React Router marque `default` la PREMIÈRE position d'une session
     de navigation ; toute autre valeur veut dire qu'un pas a été fait ici. */
  const canGoBack = location.key !== "default";

  const today = useMemo(() => new Date(), []);

  /* La semaine à bilanter : celle du plan en cours quand il y en a un, la
     semaine calendaire sinon. Le vélotaf n'attend pas d'avoir un plan. */
  const review = useMemo(() => {
    const focus = pickTodayFocus(plans, today);
    if (focus.plan && focus.weekNumber > 0) {
      const range = planWeekRange(focus.plan, focus.weekNumber);
      const week = focus.plan.weeks.find((w) => w.weekNumber === focus.weekNumber);
      return buildWeekReview({
        sessions: week?.sessions ?? [],
        activities: activitiesBetween(activities, range.from, range.to),
        range,
        weekNumber: focus.weekNumber,
      });
    }
    const range = calendarWeekRange(today);
    return buildWeekReview({
      sessions: [],
      activities: activitiesBetween(activities, range.from, range.to),
      range,
    });
  }, [plans, activities, today]);

  const allTime = useMemo(() => summarizeActivities(activities), [activities]);

  /* Le journal, groupé par mois. Une liste plate de deux cents trajets est
     illisible ; le mois est la seule coupe que personne n'a besoin
     d'apprendre. */
  const months = useMemo(() => {
    const groups = new Map<string, ComplementaryActivity[]>();
    for (const activity of activities) {
      const key = activity.date.slice(0, 7);
      const bucket = groups.get(key);
      if (bucket) bucket.push(activity);
      else groups.set(key, [activity]);
    }
    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1).toLocaleDateString(
        isEn ? "en-GB" : "fr-FR",
        { month: "long", year: "numeric" },
      ),
      items,
      minutes: items.reduce((sum, a) => sum + a.durationMin, 0),
    }));
  }, [activities, isEn]);

  return (
    <>
      <SEOHead
        title={t("activity:page.title")}
        description={t("activity:page.description")}
        canonical="/activities"
        noindex
      />

      <div className="zn-acts">
        {canGoBack && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="zn-acts__back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            {t("activity:page.back")}
          </Button>
        )}

        <section className="zn-acts__band">
          <div className="zn-acts__head">
            <div
              className="zn-stack zn-acts__headtext"
              style={{ "--gap": "var(--sp-6)" } as CSSProperties}
            >
              <span className="zn-kicker">
                {t("activity:page.kicker", { count: activities.length })}
              </span>
              <h1 className="zn-display" data-level="2">
                {t("activity:page.title")}
              </h1>
              <p className="zn-body zn-body--lead zn-acts__lede">{t("activity:page.lede")}</p>
            </div>

            <Button onClick={() => log.logOn()}>
              <Plus size={17} />
              {t("activity:page.add")}
            </Button>
          </div>
        </section>

        {/* Le bilan de la semaine en cours, avant la liste. */}
        <section className="zn-acts__band">
          <WeekReviewPanel review={review} variant="card" />
        </section>

        {activities.length >= ACTIVITY_STORAGE_SOFT_LIMIT && (
          <Alert kind="warning" title={t("activity:page.softLimitTitle")}>
            {t("activity:page.softLimit", { limit: ACTIVITY_STORAGE_SOFT_LIMIT })}
          </Alert>
        )}

        {activities.length > 0 && (
          <section className="zn-acts__band">
            <ComplementarySummary summary={allTime} title={t("activity:page.allTime")} />
          </section>
        )}

        <section className="zn-acts__band">
          {activities.length === 0 ? (
            <EmptyState
              icon={Bike}
              variant="not-started"
              title={t("activity:empty.title")}
              description={t("activity:empty.description")}
              action={
                <Button onClick={() => log.logOn()}>
                  <Plus size={17} />
                  {t("activity:page.add")}
                </Button>
              }
            />
          ) : (
            months.map((month) => (
              <div key={month.key} className="zn-acts__month">
                <div className="zn-acts__monthhead">
                  <span className="zn-kicker zn-kicker--xs">{month.label}</span>
                  <span className="zn-mono zn-acts__monthtotal">
                    {formatDurationMinutes(month.minutes)}
                  </span>
                </div>
                <ul className="zn-acts__list">
                  {month.items.map((activity) => {
                    const meta = ACTIVITY_DISCIPLINE_META[activity.discipline];
                    const Icon = DISCIPLINE_ICONS[activity.discipline];
                    const facts = [formatDurationMinutes(activity.durationMin)];
                    if (activity.distanceKm !== undefined) {
                      facts.push(
                        meta.distance === "meters"
                          ? `${Math.round(activity.distanceKm * 1000)} m`
                          : `${activity.distanceKm} km`,
                      );
                    }
                    if (activity.elevationGainM) facts.push(`+${activity.elevationGainM} m`);
                    if (activity.avgWatts) facts.push(`${activity.avgWatts} W`);
                    const [, m, d] = activity.date.split("-");
                    return (
                      <li key={activity.id} className="zn-acts__item">
                        <button
                          type="button"
                          className="zn-acts__row"
                          onClick={() => log.edit(activity)}
                        >
                          <span className="zn-acts__date zn-mono">
                            {isEn ? `${m}/${d}` : `${d}/${m}`}
                          </span>
                          <Icon size={17} className="zn-acts__icon" />
                          <span className="zn-acts__what">
                            <span className="zn-acts__kind">
                              {t(`activity:purpose.${activity.purpose}`)}
                            </span>
                            {activity.note && (
                              <span className="zn-acts__note">{activity.note}</span>
                            )}
                          </span>
                          <span className="zn-acts__facts zn-mono">{facts.join(" · ")}</span>
                          <Pencil size={15} className="zn-acts__edit" aria-hidden="true" />
                          <span className="sr-only">{t("activity:page.edit")}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>

      <ActivityLogPanel {...log.panel} />
    </>
  );
}
