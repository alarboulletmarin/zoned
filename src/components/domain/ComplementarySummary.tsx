import { useTranslation } from "react-i18next";

import { formatDurationMinutes } from "@/components/visualization";
import { StatBlock } from "@/components/domain/StatBlock";
import { ACTIVITY_DISCIPLINE_META } from "@/types/activity";
import type { ActivitySummary } from "@/lib/activityStats";

/**
 * Ce que les activités complémentaires pèsent, en chiffres.
 *
 * Le même bloc sert aux statistiques d'un plan et à la page du journal :
 * deux versions auraient fini par ne pas dire la même chose du même mois.
 *
 * **Le temps d'abord.** C'est la seule grandeur qui s'additionne entre
 * disciplines, donc la seule qui puisse répondre à combien j'ai fait. Les
 * kilomètres viennent après, DANS leur discipline, et il n'existe nulle part
 * de total kilométrique toutes disciplines : ce serait un chiffre faux qui se
 * retient bien.
 *
 * La part du complément n'est montrée que quand un dénominateur existe :
 * annoncer 100 % à quelqu'un dont le plan n'a aucune minute serait vrai et
 * illisible.
 */

interface ComplementarySummaryProps {
  summary: ActivitySummary;
  /** Part du temps total, entre 0 et 1. Absente, la ligne ne s'affiche pas. */
  share?: number | null;
  /** Le titre de la section. Absent sur un écran qui le porte déjà. */
  title?: string;
}

export function ComplementarySummary({ summary, share, title }: ComplementarySummaryProps) {
  const { t } = useTranslation("activity");

  if (summary.count === 0) return null;

  return (
    <div className="zn-actsum">
      {title && <span className="zn-pstats__title">{title}</span>}

      <div className="zn-grid zn-actsum__grid">
        <StatBlock
          tone="card"
          size="sm"
          value={formatDurationMinutes(summary.minutes)}
          label={t("summary.time")}
          footnote={t("summary.activities", { count: summary.count })}
        />
        <StatBlock
          tone="card"
          size="sm"
          value={String(summary.load)}
          label={t("summary.load")}
          footnote={t("summary.loadUnit")}
        />
        {summary.elevationGainM > 0 && (
          <StatBlock
            tone="card"
            size="sm"
            value={`${summary.elevationGainM} m`}
            label={t("summary.elevation")}
          />
        )}
        {share != null && share > 0 && (
          <StatBlock
            tone="card"
            size="sm"
            value={`${Math.round(share * 100)} %`}
            label={t("summary.share")}
            footnote={t("summary.shareFoot")}
          />
        )}
      </div>

      <ul className="zn-actsum__lines">
        {summary.byDiscipline.map((volume) => {
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
            <li key={volume.discipline} className="zn-actsum__line">
              <span className="zn-actsum__what">
                {t(`discipline.${volume.discipline}`)}
                <span className="zn-actsum__count zn-mono">
                  {t("summary.activities", { count: volume.count })}
                </span>
              </span>
              <span className="zn-actsum__how zn-mono">{parts.join(" · ")}</span>
            </li>
          );
        })}
      </ul>

      {/* Déplacement contre entraînement : c'est la distinction qui empêche de
          lire six heures de vélotaf comme six heures de qualité. Elle ne
          s'affiche que lorsque les deux existent, sinon elle ne distingue
          rien. */}
      {summary.travelMinutes > 0 && summary.trainingMinutes > 0 && (
        <p className="zn-actsum__split">
          {t("summary.split", {
            travel: formatDurationMinutes(summary.travelMinutes),
            training: formatDurationMinutes(summary.trainingMinutes),
          })}
        </p>
      )}
    </div>
  );
}
