import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import type { PlanWeekModel } from "@/lib/planWeekModel";
import { usePlanFormats } from "./planFormat";

interface PlanWeekHeaderProps {
  model: PlanWeekModel;
  /** Les flèches semaine précédente et suivante ; absentes en mode Modifier. */
  onNavigate?: (weekNumber: number) => void;
  /** Le niveau du titre : h2 sous le titre du plan. */
  headingId?: string;
}

/**
 * Où l'on est : Semaine 4 sur 10, la phase et les dates, et les deux
 * flèches pour passer d'une semaine à l'autre, désactivées aux bornes.
 */
export function PlanWeekHeader({ model, onNavigate, headingId }: PlanWeekHeaderProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const phase = f.phase(model.phase);
  const n = model.weekNumber;

  return (
    <header className="zn-weekhead">
      <div className="zn-weekhead__text">
        <h2 className="zn-weekhead__title" id={headingId}>
          {t("page.week.title", { n })}{" "}
          <span className="zn-weekhead__of">{t("page.week.of", { total: model.totalWeeks })}</span>
        </h2>
        <p className="zn-weekhead__meta">
          {t("page.week.meta", { phase, dates: f.range(model.from, model.to) })}
        </p>
      </div>
      {onNavigate && (
        <div className="zn-weekhead__nav">
          <button
            type="button"
            className="zn-iconbtn"
            aria-label={t("page.week.prev")}
            disabled={n <= 1}
            onClick={() => onNavigate(n - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="zn-iconbtn"
            aria-label={t("page.week.next")}
            disabled={n >= model.totalWeeks}
            onClick={() => onNavigate(n + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </header>
  );
}
