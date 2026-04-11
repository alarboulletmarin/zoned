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
          <DialogTitle>
            <Calendar className="size-5 inline-block mr-2" />
            {t("icsExport.chooseTrainingDays")}
          </DialogTitle>
          <DialogDescription>
            {t("icsExport.selectDays", { count: daysPerWeek })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Day checkboxes */}
          <div className="grid grid-cols-2 gap-2">
            {dayNames.map((name, idx) => {
              const isSelected = selectedDays.has(idx);
              const isDisabled = !isSelected && selectedDays.size >= daysPerWeek;
              return (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 font-medium"
                      : isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-accent/50"
                  }`}
                >
                  <div className={`size-4 rounded border flex items-center justify-center ${
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                  }`}>
                    {isSelected && <span className="text-primary-foreground text-xs">{"\u2713"}</span>}
                  </div>
                  {name}
                </button>
              );
            })}
          </div>

          {/* Long run day selector - only show when enough days selected */}
          {selectedDays.size === daysPerWeek && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("icsExport.longRunDay")}
              </label>
              <select
                value={longRunDay ?? ""}
                onChange={(e) => setLongRunDay(parseInt(e.target.value, 10))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
            <Download className="size-4" />
            {t("icsExport.export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
