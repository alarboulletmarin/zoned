import { useMemo, useState } from "react";
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

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftYears(date: Date, years: number): Date {
  return new Date(date.getFullYear() + years, date.getMonth(), 1);
}

/**
 * La fenêtre de mois que le calendrier peut atteindre, et celui sur lequel il
 * s'ouvre.
 *
 * Il s'ouvrait sur le mois COURANT, toujours : `defaultMonth` recevait la date
 * choisie, donc `undefined` tant qu'il n'y en avait pas. Sur l'étape « quand a
 * lieu la course ? », `min` vaut aujourd'hui plus douze à seize semaines — le
 * calendrier s'ouvrait donc sur une grille entièrement grisée, sans un seul
 * jour cliquable et sans rien dire pourquoi. Il fallait deviner qu'il fallait
 * appuyer trois ou quatre fois sur le chevron.
 *
 * Il s'ouvre maintenant sur le premier mois qui contient un jour choisissable,
 * et les deux listes déroulantes (mois, année) rendent n'importe quel mois
 * atteignable en un geste plutôt qu'en N.
 */
function monthWindow(
  selected: Date | undefined,
  min: Date | undefined,
  max: Date | undefined,
) {
  const today = startOfMonth(new Date());
  // Sans borne : dix ans en arrière (un record personnel a une date), cinq ans
  // en avant (une course se prépare longtemps à l'avance).
  let start = startOfMonth(min ?? shiftYears(today, -10));
  let end = startOfMonth(max ?? shiftYears(today, 5));
  if (end < start) end = start;

  /* Une valeur déjà posée hors de la fenêtre doit rester atteignable : un
     brouillon repris peut porter une date que les bornes d'aujourd'hui
     n'autorisent plus, et l'enfermer rendrait le champ impossible à corriger. */
  const chosen = selected ? startOfMonth(selected) : null;
  if (chosen && chosen < start) start = chosen;
  if (chosen && chosen > end) end = chosen;

  const preferred = chosen ?? today;
  const open = preferred < start ? start : preferred > end ? end : preferred;

  return { startMonth: start, endMonth: end, defaultMonth: open };
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

  const months = useMemo(
    () =>
      monthWindow(
        value ? isoToDate(value) : undefined,
        min ? isoToDate(min) : undefined,
        max ? isoToDate(max) : undefined,
      ),
    [value, min, max],
  );

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
          data-placeholder={value ? undefined : ""}
          className={cn("zn-date-input", className)}
        >
          <span className="zn-date-input__value">
            {value
              ? formatDisplayDate(value, isEn)
              : placeholder ?? defaultPlaceholder}
          </span>
          <CalendarIcon className="zn-date-input__icon" />
        </Button>
      </PopoverTrigger>
      {/* `collisionPadding` : la grille fait ~320px sur téléphone et le champ
          prend toute la colonne, donc le panneau touchait le bord de l'écran
          et se faisait rogner sur les appareils de 360px. */}
      <PopoverContent
        className="zn-date-input__popover"
        align="start"
        collisionPadding={12}
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={months.defaultMonth}
          startMonth={months.startMonth}
          endMonth={months.endMonth}
          disabled={disabledMatcher.length > 0 ? disabledMatcher : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateInput };
export type { DateInputProps };
