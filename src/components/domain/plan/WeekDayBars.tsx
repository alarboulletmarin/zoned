import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { PlanWeekModel } from "@/lib/planWeekModel";
import { usePlanFormats } from "./planFormat";

/**
 * Les sept jours d'une semaine de plan, en barres : la grammaire de la frise
 * du plan (`PlanTimeline`, `.zn-planline`), une colonne par jour au lieu
 * d'une par semaine. Aucun CSS recopié : la frise porte ses barres, cette
 * page n'ajoute que le jour de repos et les lettres.
 *
 * - HAUTEUR : les minutes prévues du jour, rapportées au plus gros jour.
 * - REMPLISSAGE : les minutes faites.
 * - CONTOUR : passé au filet, aujourd'hui au trait épais, à venir en
 *   pointillé. Un jour passé dont la séance a été sautée reste un contour
 *   vide : ça se voit.
 * - REPOS : un trait au sol.
 *
 * Le bloc est une image pour les lecteurs d'écran, avec sa phrase.
 */
export function WeekDayBars({ model }: { model: PlanWeekModel }) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const max = Math.max(1, ...model.days.map((d) => d.plannedMin));

  const sentence = model.days
    .map((d) => {
      const day = f.dayLong(d.date);
      const planned = formatDurationMinutes(d.plannedMin);
      const done = formatDurationMinutes(d.doneMin);
      let text: string;
      if (d.plannedMin === 0 && d.doneMin === 0) text = t("page.bars.rest", { day });
      else if (d.missed) text = t("page.bars.skipped", { day, planned });
      else if (d.doneMin > 0 && d.doneMin < d.plannedMin) text = t("page.bars.partial", { day, done, planned });
      else if (d.doneMin > 0) text = t("page.bars.done", { day, done });
      else text = t("page.bars.planned", { day, planned });
      return d.isToday ? `${text} (${t("page.bars.today")})` : text;
    })
    .join(" ; ");
  const label = `${t("page.bars.label", { n: model.weekNumber })}. ${sentence}.`;

  return (
    <div className="zn-daybars" role="img" aria-label={label}>
      <div
        className="zn-planline"
        data-variant="card"
        style={{ "--zn-weeks": 7, "--zn-bars": "56px" } as CSSProperties}
        aria-hidden="true"
      >
        <div className="zn-planline__bars">
          {model.days.map((d) => {
            const rest = d.plannedMin === 0;
            const height = rest ? 0 : (d.plannedMin / max) * 100;
            const fill = d.plannedMin > 0 ? Math.min(d.doneMin / d.plannedMin, 1) * 100 : 0;
            return (
              <div
                key={d.dayOfWeek}
                className="zn-planline__bar"
                data-state={d.state}
                data-rest={rest || undefined}
                style={{ "--zn-h": `${height}%` } as CSSProperties}
              >
                <span className="zn-planline__done" style={{ "--zn-fill": `${fill}%` } as CSSProperties} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="zn-daybars__letters" aria-hidden="true">
        {model.days.map((d) => (
          <span key={d.dayOfWeek} data-today={d.isToday || undefined}>
            {f.dayShort(d.date).charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
