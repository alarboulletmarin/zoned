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
      classNames={{
        root: cn("p-3", className),
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium capitalize",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-1 top-0",
          "inline-flex items-center justify-center",
          "size-7 rounded-md",
          "bg-transparent hover:bg-accent hover:text-accent-foreground",
          "transition-colors",
        ),
        button_next: cn(
          "absolute right-1 top-0",
          "inline-flex items-center justify-center",
          "size-7 rounded-md",
          "bg-transparent hover:bg-accent hover:text-accent-foreground",
          "transition-colors",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center text-sm",
          "focus-within:relative focus-within:z-20",
          "size-8 rounded-md",
        ),
        day_button: cn(
          "inline-flex items-center justify-center",
          "size-8 rounded-md",
          "text-sm font-normal",
          "transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "aria-selected:opacity-100",
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/30 pointer-events-none",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" size={16} />
          ) : (
            <ChevronRight className="size-4" size={16} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
export type { CalendarProps };
