import { DayPicker, type DayPickerProps } from "react-day-picker";
import { fr, enGB } from "date-fns/locale";
import { useIsEnglish } from "@/lib/i18n-utils";
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
  const isEn = useIsEnglish();
  const locale = isEn ? enGB : fr;

  return (
    <DayPicker
      locale={locale}
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
