import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PHASE_META } from "@/types/plan";
import type { TrainingPhase } from "@/types";

/**
 * Les dates et les libellés de la page d'un plan, par `Intl`, dans la langue
 * de l'interface : `fr-FR` ou `en-GB`, comme `i18n-utils`. Aucune table de
 * mois écrite à la main.
 */
export interface PlanFormats {
  locale: string;
  /** `lun.`, `Mon` */
  dayShort: (iso: string) => string;
  /** `lundi`, `Monday` */
  dayLong: (iso: string) => string;
  /** `nov.`, `Nov` */
  monthShort: (iso: string) => string;
  /** `16` */
  dayNumber: (iso: string) => number;
  /** `dim. 10 janv.`, `Sun 10 Jan` */
  dayDate: (iso: string) => string;
  /** `16 au 22 nov.`, `16-22 Nov` */
  range: (from: string, to: string) => string;
  phase: (phase: TrainingPhase) => string;
}

export function localDate(iso: string): Date {
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function usePlanFormats(): PlanFormats {
  const { t, i18n } = useTranslation("plan");
  const lang = i18n.language?.startsWith("it") ? "it" : i18n.language?.startsWith("en") ? "en" : "fr";
  return useMemo(() => {
    const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-GB" : "fr-FR";
    const fmt = (iso: string, options: Intl.DateTimeFormatOptions) =>
      localDate(iso).toLocaleDateString(locale, options);
    const monthShort = (iso: string) => fmt(iso, { month: "short" });
    return {
      locale,
      dayShort: (iso) => fmt(iso, { weekday: "short" }),
      dayLong: (iso) => fmt(iso, { weekday: "long" }),
      monthShort,
      dayNumber: (iso) => localDate(iso).getDate(),
      dayDate: (iso) => fmt(iso, { weekday: "short", day: "numeric", month: "short" }),
      range: (from, to) => {
        const a = localDate(from);
        const b = localDate(to);
        const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
        const first = sameMonth ? String(a.getDate()) : fmt(from, { day: "numeric", month: "short" });
        return t("page.week.range", { from: first, to: fmt(to, { day: "numeric", month: "short" }) });
      },
      phase: (phase) =>
        lang === "it"
          ? (PHASE_META[phase].labelIt ?? PHASE_META[phase].labelEn)
          : lang === "en"
            ? PHASE_META[phase].labelEn
            : PHASE_META[phase].label,
    };
  }, [lang, t]);
}
