import { useTranslation } from "react-i18next";
import { PHASE_META } from "@/types/plan";
import { usePickLang } from "@/lib/i18n-utils";
import type { PlanCardModel } from "@/lib/planCardModel";

/**
 * La frise d'un plan : une colonne par semaine, sur trois étages.
 *
 * 1. Les repères : un triangle plein au-dessus de la semaine en cours, un
 *    drapeau au trait au-dessus de la semaine de course.
 * 2. Les barres. La HAUTEUR est le prévu de la semaine rapporté au plus gros
 *    du plan ; le CONTOUR dit où l'on est (filet pour une semaine passée,
 *    trait épais pour celle en cours, pointillé pour une à venir) ; le
 *    REMPLISSAGE, depuis le bas, est le fait. Ce qui n'a pas été fait reste
 *    vide, et c'est voulu : ça se voit.
 * 3. La bande des phases, un segment par phase à la largeur de ses semaines,
 *    sur la rampe des zones.
 *
 * Aucun vermillon : l'accent de l'écran est le bouton de création. La
 * semaine en cours se distingue par son trait et son triangle, jamais par
 * une couleur seule.
 *
 * `mini` ne garde que les barres : c'est la frise d'une ligne d'historique,
 * où les chiffres sont écrits à côté, donc elle est décorative.
 */

export type PlanTimelineVariant = "card" | "wide" | "mini";

interface PlanTimelineProps {
  model: PlanCardModel;
  variant?: PlanTimelineVariant;
}

/** Au-delà de seize semaines, la ligne S1…Sn ne garde qu'un repère sur deux, sur quatre. */
const MAX_WEEK_LABELS = 16;

export function PlanTimeline({ model, variant = "card" }: PlanTimelineProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const { weeks, phases, maxWeekMin } = model;
  if (weeks.length === 0) return null;

  const mini = variant === "mini";
  const labelStep = Math.ceil(weeks.length / MAX_WEEK_LABELS);
  const dense = weeks.length > 16;

  const label = model.ended
    ? t("plansPage.timeline.ariaEnded", {
        count: model.weekTotal,
        done: model.sessionsTotal.done,
        planned: model.sessionsTotal.planned,
      })
    : t("plansPage.timeline.aria", {
        count: model.weekTotal,
        week: Math.min(Math.max(model.weekNow, 1), model.weekTotal),
        done: model.sessionsToDate.done,
        planned: model.sessionsToDate.planned,
      });

  const bars = (
    <div className="zn-planline__bars">
      {weeks.map((w) => {
        const height = maxWeekMin > 0 ? (w.plannedMin / maxWeekMin) * 100 : 0;
        const fill = w.plannedMin > 0 ? Math.min(w.doneMin / w.plannedMin, 1) * 100 : 0;
        return (
          <div
            key={w.number}
            className="zn-planline__bar"
            data-state={w.state}
            style={{ "--zn-h": `${height}%` } as React.CSSProperties}
          >
            <span
              className="zn-planline__done"
              style={{ "--zn-fill": `${fill}%` } as React.CSSProperties}
            />
          </div>
        );
      })}
    </div>
  );

  if (mini) {
    return (
      <div className="zn-planline" data-variant="mini" data-dense={dense || undefined} aria-hidden="true">
        {bars}
      </div>
    );
  }

  return (
    <div
      className="zn-planline"
      data-variant={variant}
      data-dense={dense || undefined}
      role="img"
      aria-label={label}
    >
      <div className="zn-planline__marks" aria-hidden="true">
        {weeks.map((w) => (
          <span key={w.number} className="zn-planline__mark">
            {w.state === "current" && (
              <svg width="10" height="8" viewBox="0 0 10 8" className="zn-planline__now">
                <path d="M0 0 H10 L5 7 Z" />
              </svg>
            )}
            {w.isRace && (
              <svg width="12" height="13" viewBox="0 0 12 13" className="zn-planline__flag">
                <path d="M2 12.5 V1 H10 L8 4 L10 7 H2" />
              </svg>
            )}
          </span>
        ))}
      </div>

      {bars}

      {variant === "wide" && (
        <div className="zn-planline__nums" aria-hidden="true">
          {weeks.map((w, i) => (
            <span key={w.number} data-current={w.state === "current" || undefined}>
              {i === 0 || (i + 1) % labelStep === 0 || w.state === "current" ? t("plansPage.timeline.weekShort", { n: w.number }) : ""}
            </span>
          ))}
        </div>
      )}

      {phases.length > 0 && (
        <div className="zn-planline__phases" aria-hidden="true">
          {phases.map((p, i) => (
            <div
              key={`${p.phase}-${i}`}
              className="zn-planline__phase"
              data-phase={p.phase}
              data-current={p.current || undefined}
              style={{ flexGrow: p.weeks }}
            >
              <span className="zn-planline__tone" />
              <span className="zn-planline__phase-label">
                <span className="zn-planline__phase-full">{pick(PHASE_META[p.phase], "label")}</span>
                <span className="zn-planline__phase-short">{t(`plansPage.phaseShort.${p.phase}`)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
