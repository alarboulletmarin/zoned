import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Download } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useIsEnglish } from "@/lib/i18n-utils";

const DAY_NAMES_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface IcsExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daysPerWeek: number;
  onExport: (selectedDays: number[], longRunDay: number) => void;
}

export function IcsExportDialog({ open, onOpenChange, daysPerWeek, onExport }: IcsExportDialogProps) {
  const { t } = useTranslation("common");
  const isEn = useIsEnglish();
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [longRunDay, setLongRunDay] = useState<number | null>(null);
  const dayNames = isEn ? DAY_NAMES_EN : DAY_NAMES_FR;

  const toggleDay = (day: number) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
        if (longRunDay === day) setLongRunDay(null);
      } else if (next.size < daysPerWeek) {
        next.add(day);
      }
      return next;
    });
  };

  const sortedDays = useMemo(() => [...selectedDays].sort((a, b) => a - b), [selectedDays]);
  const isValid = selectedDays.size === daysPerWeek && longRunDay !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="zn-row" style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}>
            <Calendar size={20} />
            {t("icsExport.chooseTrainingDays")}
          </DialogTitle>
          <DialogDescription>
            {t("icsExport.selectDays", { count: daysPerWeek })}
          </DialogDescription>
        </DialogHeader>

        <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}>
          {/* Day checkboxes */}
          <div className="zn-choice-grid">
            {dayNames.map((name, idx) => {
              const isSelected = selectedDays.has(idx);
              const isDisabled = !isSelected && selectedDays.size >= daysPerWeek;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  data-layout="row"
                  className="zn-choice"
                >
                  <span aria-hidden="true" className="zn-choice__box">
                    {isSelected ? "\u2713" : null}
                  </span>
                  {name}
                </button>
              );
            })}
          </div>

          {/* Long run day selector - only show when enough days selected */}
          {selectedDays.size === daysPerWeek && (
            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
              <label htmlFor="ics-long-run-day" className="zn-label">
                {t("icsExport.longRunDay")}
              </label>
              <select
                id="ics-long-run-day"
                value={longRunDay ?? ""}
                onChange={(e) => setLongRunDay(parseInt(e.target.value, 10))}
                className="zn-native-field"
              >
                <option value="" disabled>
                  {t("icsExport.select")}
                </option>
                {sortedDays.map((day) => (
                  <option key={day} value={day}>
                    {dayNames[day]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("icsExport.cancel")}
          </Button>
          <Button onClick={() => isValid && onExport(sortedDays, longRunDay!)} disabled={!isValid}>
            <Download />
            {t("icsExport.export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
