import { DayPicker, type DayPickerProps } from "react-day-picker";
import { fr, enGB } from "date-fns/locale";
import { useIsEnglish } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "@/components/icons";

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
        nav: "zn-cal__nav",
        button_previous: "zn-cal__nav-btn",
        button_next: "zn-cal__nav-btn",
        month_grid: "zn-cal__grid",
        weekday: "zn-cal__weekday",
        day: "zn-cal__day",
        day_button: "zn-cal__day-btn",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft /> : <ChevronRight />,
      }}
      {...props}
    />
  );
}

export { Calendar };
export type { CalendarProps };
