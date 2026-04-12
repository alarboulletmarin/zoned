/**
 * ExportDatePicker - Date/time picker for ICS export
 *
 * Simple modal-style picker to select when to schedule the workout
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock } from "@/components/icons";
import { getDateInputLang } from "@/lib/i18n-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExportDatePickerProps {
  onSelect: (dateTime: Date) => void;
  onCancel: () => void;
}

export function ExportDatePicker({ onSelect, onCancel }: ExportDatePickerProps) {
  const { t } = useTranslation("common");
  const now = new Date();

  // Default to tomorrow at 7:00 AM
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 0, 0, 0);

  const [date, setDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [time, setTime] = useState("07:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = time.split(":").map(Number);
    const selectedDate = new Date(date);
    selectedDate.setHours(hours, minutes, 0, 0);
    onSelect(selectedDate);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {t("export.selectDateTime")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="export-date" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              Date
            </label>
            <input
              id="export-date"
              type="date"
              lang={getDateInputLang()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 min-h-[44px] text-base border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="export-time" className="text-sm font-medium flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              {t("export.selectDateTime").includes("heure") ? "Heure" : "Time"}
            </label>
            <input
              id="export-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 min-h-[44px] text-base border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              {t("actions.clear")}
            </Button>
            <Button type="submit" className="flex-1">
              {t("export.download")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
