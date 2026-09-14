import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatDurationMinutes } from "@/components/visualization";
import { useIsEnglish } from "@/lib/i18n-utils";
import { ACTIVITY_DISCIPLINE_META } from "@/types/activity";
import type { WeekReview } from "@/lib/weekReview";

/**
 * Le bilan du dimanche.
 *
 * Ce qu'il répond, dans l'ordre où on se le demande : est-ce que ma semaine
 * tient, qu'est-ce que j'ai fait, qu'est-ce que j'ai fait en plus, et
 * qu'est-ce qui reste en suspens.
 *
 * ── Trois refus, et ils font tout le ton ─────────────────────────────────
 *
 * 1. **Il ne félicite ni ne gronde.** Le verdict est une constatation, pas une
 *    note : quatre séances sur cinq est une semaine qui a fait son travail, et
 *    l'écrire ainsi vaut mieux que Bravo, qui ne dit rien, et que Tu as raté
 *    une séance, qui dit la même chose en pire. Une semaine à moitié faite se
 *    lit sans jugement, parce que la personne qui la lit connaît déjà ses
 *    raisons.
 * 2. **Il ne compte pas les séances non closes comme des échecs.** Elles ont
 *    leur ligne à elles, qui invite à les trancher, et tant qu'aucune ne l'est
 *    le bilan refuse de donner un chiffre d'observance. Voir `weekReview.ts`.
 * 3. **Il n'additionne pas les kilomètres entre disciplines.** 30 km de vélo
 *    et 10 km de course ne font pas 40 km. Chaque discipline a sa ligne, et il
 *    n'existe pas de total.
 *
 * Le TEMPS, lui, s'additionne, et c'est précisément le chiffre qui manquait :
 * une semaine annoncée à 4 h qui en pèse 6 avec le vélotaf n'est pas la même
 * semaine.
 */

interface WeekReviewPanelProps {
  review: WeekReview;
  /** Le bilan se plie au contexte : `bare` sur le cockpit, sans cadre. */
  variant?: "bare" | "card";
}

function formatRange(from: string, to: string, isEn: boolean): string {
  const parse = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const locale = isEn ? "en-GB" : "fr-FR";
  return `${parse(from).toLocaleDateString(locale, opts)} - ${parse(to).toLocaleDateString(locale, opts)}`;
}

export function WeekReviewPanel({ review, variant = "bare" }: WeekReviewPanelProps) {
  const { t } = useTranslation(["activity", "common"]);
  const isEn = useIsEnglish();

  const range = useMemo(
    () => formatRange(review.range.from, review.range.to, isEn),
    [review.range.from, review.range.to, isEn],
  );

  /* Le verdict est UNE phrase, et elle porte les chiffres qui l'expliquent :
     une phrase sans chiffre se conteste, un chiffre sans phrase se lit deux
     fois. */
  const verdictLine = t(`activity:review.verdict.${review.verdict}`, {
    done: review.completed,
    planned: review.planned,
    count: review.activities.count,
  });

  return (
    <section className="zn-wreview" data-variant={variant}>
      <div className="zn-wreview__head">
        <span className="zn-kicker zn-kicker--xs">
          {review.weekNumber > 0
            ? t("activity:review.kickerWeek", { n: review.weekNumber })
            : t("activity:review.kicker")}
        </span>
        <span className="zn-wreview__range zn-mono">{range}</span>
      </div>

      <p className="zn-wreview__verdict">{verdictLine}</p>

      {/* Les chiffres de la semaine. Chacun est une réponse, aucun n'est un
          total de choses qui ne s'additionnent pas. */}
      <dl className="zn-wreview__facts">
        {review.planned > 0 && (
          <div className="zn-wreview__fact">
            <dt>{t("activity:review.sessions")}</dt>
            <dd className="zn-mono">
              {review.completed} / {review.planned}
            </dd>
          </div>
        )}

        {review.keyPlanned > 0 && (
          <div className="zn-wreview__fact">
            <dt>{t("activity:review.keySessions")}</dt>
            <dd className="zn-mono">
              {review.keyCompleted} / {review.keyPlanned}
            </dd>
          </div>
        )}

        {review.doneKm > 0 && (
          <div className="zn-wreview__fact">
            <dt>{t("activity:review.km")}</dt>
            <dd className="zn-mono">
              {review.doneKm} / {review.plannedKm} km
            </dd>
          </div>
        )}

        <div className="zn-wreview__fact">
          <dt>{t("activity:review.totalTime")}</dt>
          <dd className="zn-mono">{formatDurationMinutes(review.totalMinutes)}</dd>
        </div>

        {review.avgRpe !== null && (
          <div className="zn-wreview__fact">
            <dt>{t("activity:review.avgRpe")}</dt>
            <dd className="zn-mono">{review.avgRpe}/10</dd>
          </div>
        )}
      </dl>

      {/* Le complément. Il n'apparaît que s'il a eu lieu : une ligne
          0 activité complémentaire sur l'écran de quelqu'un qui n'en fait pas
          est du bruit, et laisse croire qu'il manque quelque chose. */}
      {review.activities.count > 0 && (
        <div className="zn-wreview__extra">
          <span className="zn-kicker zn-kicker--xs">
            {t("activity:review.complement", { count: review.activities.count })}
          </span>
          <ul className="zn-wreview__lines">
            {review.activities.byDiscipline.map((volume) => {
              const meta = ACTIVITY_DISCIPLINE_META[volume.discipline];
              const parts = [formatDurationMinutes(volume.minutes)];
              if (volume.distanceKm > 0) {
                parts.push(
                  meta.distance === "meters"
                    ? `${Math.round(volume.distanceKm * 1000)} m`
                    : `${volume.distanceKm} km`,
                );
              }
              if (volume.elevationGainM > 0) parts.push(`+${volume.elevationGainM} m D+`);
              if (volume.avgWatts !== null) parts.push(`${volume.avgWatts} W`);
              return (
                <li key={volume.discipline} className="zn-wreview__line">
                  <span className="zn-wreview__what">
                    {t(`activity:discipline.${volume.discipline}`)}
                  </span>
                  <span className="zn-wreview__how zn-mono">{parts.join(" · ")}</span>
                </li>
              );
            })}
          </ul>
          {review.activities.travelMinutes > 0 && (
            <p className="zn-wreview__note">
              {t("activity:review.travelShare", {
                travel: formatDurationMinutes(review.activities.travelMinutes),
              })}
            </p>
          )}
        </div>
      )}

      {/* Ce qui reste à trancher. En dernier, et sans alarme : c'est une
          invitation, et la seule chose de cet écran sur laquelle on peut
          encore agir. */}
      {review.pending > 0 && (
        <p className="zn-wreview__pending">
          {t("activity:review.pending", { count: review.pending })}
        </p>
      )}
    </section>
  );
}
