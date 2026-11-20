import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Pencil } from "@/components/icons";
import type { PlanWeekModel } from "@/lib/planWeekModel";
import { usePlanFormats } from "./planFormat";

interface PlanWeekDockProps {
  model: PlanWeekModel;
  onNavigate: (weekNumber: number) => void;
  onOpenPlan: () => void;
  onEdit: () => void;
}

/**
 * La barre d'action de la page d'un plan, sous 1024 px : en bas, dans la
 * zone du pouce, ce qu'on fait le plus souvent, changer de semaine, ouvrir
 * Le plan, passer en mode Modifier. C'est la même pilule que la barre
 * Annuler / Enregistrer du mode Modifier, qui la remplace quand on y entre :
 * on agit en bas, dans les deux modes.
 *
 * Elle s'efface quand le pied de page entre dans l'écran, pour ne pas
 * couvrir ses liens.
 */
export function PlanWeekDock({ model, onNavigate, onOpenPlan, onEdit }: PlanWeekDockProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const n = model.weekNumber;
  const dates = f.range(model.from, model.to);

  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector(".zn-footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <nav
      className="zn-weekdock"
      aria-label={t("page.dock.label")}
      data-hidden={footerVisible || undefined}
    >
      <button
        type="button"
        className="zn-weekdock__btn"
        aria-label={t("page.week.prev")}
        disabled={n <= 1}
        onClick={() => onNavigate(n - 1)}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        className="zn-weekdock__week"
        aria-haspopup="dialog"
        aria-label={t("page.dock.week", { n, dates })}
        onClick={onOpenPlan}
      >
        <span className="zn-weekdock__n">{t("page.sheet.weekShort", { n })}</span>
        <span className="zn-weekdock__dates">{dates}</span>
      </button>
      <button
        type="button"
        className="zn-weekdock__btn"
        aria-label={t("page.week.next")}
        disabled={n >= model.totalWeeks}
        onClick={() => onNavigate(n + 1)}
      >
        <ChevronRight size={20} />
      </button>
      <button type="button" className="zn-weekdock__edit" aria-label={t("page.tools.edit")} onClick={onEdit}>
        <Pencil size={18} />
      </button>
    </nav>
  );
}
