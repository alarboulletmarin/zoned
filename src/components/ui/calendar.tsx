import { DayPicker, type DayPickerProps } from "react-day-picker";
import { fr, enGB, it } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "@/components/icons";

type CalendarProps = DayPickerProps & {
  className?: string;
};

function Calendar({ className, ...props }: CalendarProps) {
  const lang = useLanguage();
  const locale = lang === "it" ? it : lang === "en" ? enGB : fr;
  const { t } = useTranslation("common");

  /* Les noms accessibles par défaut de react-day-picker sont en anglais
     (Go to the Next Month, Today, selected), quelle que soit la locale. */
  const labels: DayPickerProps["labels"] = {
    labelPrevious: () => t("datePicker.previousMonth"),
    labelNext: () => t("datePicker.nextMonth"),
    labelMonthDropdown: () => t("datePicker.month"),
    labelYearDropdown: () => t("datePicker.year"),
    labelDayButton: (date, modifiers, _options, dateLib) => {
      let label = dateLib ? dateLib.format(date, "PPPP") : date.toLocaleDateString();
      if (modifiers.today) label = t("datePicker.today", { date: label });
      if (modifiers.selected) label = t("datePicker.selected", { date: label });
      return label;
    },
  };

  return (
    <DayPicker
      locale={locale}
      labels={labels}
      showOutsideDays
      fixedWeeks
      /* Structure only. react-day-picker puts every day modifier on the cell as
         a data-* attribute (data-selected, data-today, data-outside,
         data-disabled, data-hidden), so those states are painted off the
         attributes in calendar.css rather than through modifier classes. */
      classNames={{
        root: cn("zn-cal", className),
        months: "zn-cal__months",
        month: "zn-cal__month",
        month_caption: "zn-cal__caption",
        caption_label: "zn-cal__caption-label",
        /* Le mois et l'année en listes déroulantes, quand l'appelant demande
           `captionLayout="dropdown"`. Le `<select>` est le vrai contrôle, il
           ouvre le sélecteur natif du téléphone, et l'étiquette dessous est
           ce que l'œil lit. */
        dropdowns: "zn-cal__dropdowns",
        dropdown_root: "zn-cal__dd",
        dropdown: "zn-cal__dd-select",
        nav: "zn-cal__nav",
        button_previous: "zn-cal__nav-btn",
        button_next: "zn-cal__nav-btn",
        month_grid: "zn-cal__grid",
        weekday: "zn-cal__weekday",
        day: "zn-cal__day",
        day_button: "zn-cal__day-btn",
      }}
      components={{
        Chevron: ({ orientation, size, className: chevronClass }) => {
          const Glyph =
            orientation === "left"
              ? ChevronLeft
              : orientation === "up"
                ? ChevronUp
                : orientation === "down"
                  ? ChevronDown
                  : ChevronRight;
          return <Glyph size={size} className={chevronClass} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
export type { CalendarProps };
