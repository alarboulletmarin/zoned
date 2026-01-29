/**
 * ExportDatePicker - Date/time picker for ICS export
 *
 * Simple modal-style picker to select when to schedule the workout
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, X } from "@/components/icons";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="size-5" />
            {t("export.selectDateTime")}
          </h3>
          <Button variant="ghost" size="icon-sm" onClick={onCancel}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="export-date" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              Date
            </label>
            <input
              id="export-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
      </div>
    </div>
  );
}
