import { useState } from "react";
import { Calendar as CalendarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useIsEnglish } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import type { Matcher } from "react-day-picker";

interface DateInputProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  min?: string;
  max?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(isoDate: string, isEn: boolean): string {
  const [y, m, d] = isoDate.split("-");
  return isEn ? isoDate : `${d}/${m}/${y}`;
}

function DateInput({
  value,
  onChange,
  min,
  max,
  className,
  placeholder,
  disabled,
  id,
  "aria-label": ariaLabel,
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const isEn = useIsEnglish();

  const selected = value ? isoToDate(value) : undefined;
  const defaultPlaceholder = isEn ? "YYYY-MM-DD" : "JJ/MM/AAAA";

  const disabledMatcher: Matcher[] = [];
  if (min) disabledMatcher.push({ before: isoToDate(min) });
  if (max) disabledMatcher.push({ after: isoToDate(max) });

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange?.({ target: { value: dateToIso(date) } });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span>
            {value
              ? formatDisplayDate(value, isEn)
              : placeholder ?? defaultPlaceholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          disabled={disabledMatcher.length > 0 ? disabledMatcher : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateInput };
export type { DateInputProps };
